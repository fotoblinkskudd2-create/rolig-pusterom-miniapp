import Foundation

struct SendMessageRequest: Encodable, Equatable, Sendable {
    let clientMessageId: String
    let kind: MessageKind
    let content: String
    var correctsMessageId: String?
}

/// Det samtaleskjermen trenger fra backend. Egen protokoll så logikken kan testes uten nett.
@MainActor
protocol ChatService: AnyObject {
    func streamMessage(conversationId: String, request: SendMessageRequest) -> AsyncThrowingStream<StreamEvent, Error>
    func cancel(messageId: String) async throws
    func conversation(id: String) async throws -> ConversationDetail
    func updateConversation(id: String, tone: Tone?, darkHumor: Bool?, closed: Bool?) async throws -> ConversationDTO
}

/// HTTP-klient mot Antipsykologen-backend. Ingen modellnøkler finnes i appen;
/// alle modellkall går via serveren.
@MainActor
final class APIClient: ChatService {
    let baseURL: URL
    private let session: URLSession
    private let streamSession: URLSession
    private let auth: AuthStore

    init(baseURL: URL, auth: AuthStore) {
        self.baseURL = baseURL
        self.auth = auth
        let cfg = URLSessionConfiguration.default
        cfg.timeoutIntervalForRequest = 30
        cfg.waitsForConnectivity = false
        cfg.urlCache = nil
        self.session = URLSession(configuration: cfg)
        let scfg = URLSessionConfiguration.default
        // Strømmer kan ha pauser mens modellen tenker; serveren sender hjerteslag hvert 15. sekund.
        scfg.timeoutIntervalForRequest = 60
        scfg.timeoutIntervalForResource = 300
        scfg.waitsForConnectivity = false
        scfg.urlCache = nil
        self.streamSession = URLSession(configuration: scfg)
    }

    // MARK: - Generelle forespørsler

    private func makeRequest(_ method: String, _ path: String, body: Encodable? = nil, token: String?) throws -> URLRequest {
        guard let url = URL(string: path, relativeTo: baseURL) else { throw APIError.invalidResponse }
        var req = URLRequest(url: url)
        req.httpMethod = method
        if let token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        if let body {
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.httpBody = try JSONEncoder().encode(AnyEncodable(body))
        }
        return req
    }

    /// Sender en autentisert forespørsel. Ved 401 fornyes tokenet én gang.
    func send<T: Decodable>(_ method: String, _ path: String, body: Encodable? = nil, as type: T.Type = T.self) async throws -> T {
        let data = try await sendRaw(method, path, body: body)
        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            throw APIError.invalidResponse
        }
    }

    func sendNoContent(_ method: String, _ path: String, body: Encodable? = nil) async throws {
        _ = try await sendRaw(method, path, body: body)
    }

    func sendRaw(_ method: String, _ path: String, body: Encodable? = nil) async throws -> Data {
        for attempt in 0..<2 {
            let token = try await auth.accessToken(api: self, forceRefresh: attempt > 0)
            let req = try makeRequest(method, path, body: body, token: token)
            let (data, response): (Data, URLResponse)
            do {
                (data, response) = try await session.data(for: req)
            } catch {
                throw APIError.from(error)
            }
            guard let http = response as? HTTPURLResponse else { throw APIError.invalidResponse }
            if http.statusCode == 401 && attempt == 0 { continue }
            try Self.check(http, data)
            return data
        }
        throw APIError.unauthorized
    }

    static func check(_ http: HTTPURLResponse, _ data: Data) throws {
        guard (200..<300).contains(http.statusCode) else {
            if http.statusCode == 401 { throw APIError.unauthorized }
            if let body = try? JSONDecoder().decode(APIErrorBody.self, from: data) {
                throw APIError.server(status: http.statusCode, code: body.error.code,
                                      message: body.error.message, retryable: body.error.retryable ?? false)
            }
            throw APIError.server(status: http.statusCode, code: "http_\(http.statusCode)",
                                  message: "Serveren svarte med en feil (\(http.statusCode)). Prøv igjen.",
                                  retryable: http.statusCode >= 500)
        }
    }

    // MARK: - Uautentiserte kall (innlogging)

    func postUnauthenticated<T: Decodable>(_ path: String, body: Encodable?, bearer: String? = nil) async throws -> T {
        let req = try makeRequest("POST", path, body: body, token: bearer)
        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await session.data(for: req)
        } catch {
            throw APIError.from(error)
        }
        guard let http = response as? HTTPURLResponse else { throw APIError.invalidResponse }
        try Self.check(http, data)
        do { return try JSONDecoder().decode(T.self, from: data) } catch { throw APIError.invalidResponse }
    }

    // MARK: - Strømming

    func streamMessage(conversationId: String, request: SendMessageRequest) -> AsyncThrowingStream<StreamEvent, Error> {
        AsyncThrowingStream { continuation in
            let task = Task { @MainActor in
                do {
                    try await self.runStream(conversationId: conversationId, request: request, continuation: continuation)
                    continuation.finish()
                } catch is CancellationError {
                    continuation.finish(throwing: CancellationError())
                } catch {
                    if Task.isCancelled {
                        continuation.finish(throwing: CancellationError())
                    } else {
                        continuation.finish(throwing: APIError.from(error))
                    }
                }
            }
            // Når den som lytter avslutter (Stopp, skjerm lukket), avbrytes URLSession-oppgaven,
            // forbindelsen lukkes og serveren stopper genereringen.
            continuation.onTermination = { _ in task.cancel() }
        }
    }

    private func runStream(conversationId: String, request: SendMessageRequest,
                           continuation: AsyncThrowingStream<StreamEvent, Error>.Continuation) async throws {
        for attempt in 0..<2 {
            let token = try await auth.accessToken(api: self, forceRefresh: attempt > 0)
            var req = try makeRequest("POST", "/v1/conversations/\(conversationId)/messages", body: request, token: token)
            req.setValue("text/event-stream", forHTTPHeaderField: "Accept")
            let (bytes, response) = try await streamSession.bytes(for: req)
            guard let http = response as? HTTPURLResponse else { throw APIError.invalidResponse }
            let isStream = (http.value(forHTTPHeaderField: "Content-Type") ?? "").contains("text/event-stream")
            if !isStream {
                var data = Data()
                for try await b in bytes { data.append(b) }
                if http.statusCode == 401 && attempt == 0 { continue }
                try Self.check(http, data)
                throw APIError.invalidResponse
            }
            var splitter = LineSplitter()
            var parser = SSEParser()
            var sawDone = false
            for try await byte in bytes {
                try Task.checkCancellation()
                guard let line = splitter.push(byte), let raw = parser.consume(line: line) else { continue }
                guard let event = try? SSEParser.decode(raw) else { continue }
                if case .done = event { sawDone = true }
                continuation.yield(event)
            }
            // Strømmen sluttet uten «done»: forbindelsen ble brutt underveis.
            if !sawDone { throw APIError.connectionLost }
            return
        }
        throw APIError.unauthorized
    }

    // MARK: - Endepunkter

    func cancel(messageId: String) async throws {
        try await sendNoContent("POST", "/v1/messages/\(messageId)/cancel")
    }

    func meta() async throws -> MetaDTO {
        let req = try makeRequest("GET", "/v1/meta", token: nil)
        do {
            let (data, response) = try await session.data(for: req)
            guard let http = response as? HTTPURLResponse else { throw APIError.invalidResponse }
            try Self.check(http, data)
            return try JSONDecoder().decode(MetaDTO.self, from: data)
        } catch {
            throw APIError.from(error)
        }
    }

    func me() async throws -> MeDTO { try await send("GET", "/v1/me") }

    func updateMe(tone: Tone? = nil, darkHumor: Bool? = nil, historyEnabled: Bool? = nil, memoryEnabled: Bool? = nil) async throws -> MeDTO {
        struct Body: Encodable { let tone: Tone?; let darkHumor: Bool?; let historyEnabled: Bool?; let memoryEnabled: Bool? }
        return try await send("PATCH", "/v1/me", body: Body(tone: tone, darkHumor: darkHumor, historyEnabled: historyEnabled, memoryEnabled: memoryEnabled))
    }

    func createConversation(topic: Topic) async throws -> ConversationDTO {
        struct Body: Encodable { let topic: Topic }
        return try await send("POST", "/v1/conversations", body: Body(topic: topic))
    }

    func conversations() async throws -> [ConversationDTO] {
        let list: ConversationList = try await send("GET", "/v1/conversations")
        return list.conversations
    }

    func conversation(id: String) async throws -> ConversationDetail { try await send("GET", "/v1/conversations/\(id)") }

    func updateConversation(id: String, tone: Tone?, darkHumor: Bool?, closed: Bool?) async throws -> ConversationDTO {
        struct Body: Encodable { let tone: Tone?; let darkHumor: Bool?; let closed: Bool? }
        return try await send("PATCH", "/v1/conversations/\(id)", body: Body(tone: tone, darkHumor: darkHumor, closed: closed))
    }

    func deleteConversation(id: String) async throws { try await sendNoContent("DELETE", "/v1/conversations/\(id)") }
    func deleteAllConversations() async throws { try await sendNoContent("DELETE", "/v1/conversations") }

    func actionCardDraft(conversationId: String, basis: String?) async throws -> ActionCardDraftResponse {
        struct Body: Encodable { let basis: String? }
        return try await send("POST", "/v1/conversations/\(conversationId)/action-card-draft", body: Body(basis: basis))
    }

    func actionCards() async throws -> [ActionCardDTO] {
        let list: ActionCardList = try await send("GET", "/v1/action-cards")
        return list.actionCards
    }

    func createActionCard(conversationId: String?, card: ActionCardDraft) async throws -> ActionCardDTO {
        struct Body: Encodable { let conversationId: String?; let what: String; let when: String; let doneWhen: String; let ifStuck: String }
        return try await send("POST", "/v1/action-cards",
                              body: Body(conversationId: conversationId, what: card.what, when: card.when, doneWhen: card.doneWhen, ifStuck: card.ifStuck))
    }

    func updateActionCard(id: String, status: ActionCardStatus) async throws -> ActionCardDTO {
        struct Body: Encodable { let status: ActionCardStatus }
        return try await send("PATCH", "/v1/action-cards/\(id)", body: Body(status: status))
    }

    func deleteActionCard(id: String) async throws { try await sendNoContent("DELETE", "/v1/action-cards/\(id)") }

    func memories() async throws -> [MemoryDTO] {
        let list: MemoryList = try await send("GET", "/v1/memories")
        return list.memories
    }

    func createMemory(content: String, sourceConversationId: String?) async throws -> MemoryDTO {
        struct Body: Encodable { let content: String; let sourceConversationId: String? }
        return try await send("POST", "/v1/memories", body: Body(content: content, sourceConversationId: sourceConversationId))
    }

    func updateMemory(id: String, content: String) async throws -> MemoryDTO {
        struct Body: Encodable { let content: String }
        return try await send("PATCH", "/v1/memories/\(id)", body: Body(content: content))
    }

    func deleteMemory(id: String) async throws { try await sendNoContent("DELETE", "/v1/memories/\(id)") }
    func deleteAllMemories() async throws { try await sendNoContent("DELETE", "/v1/memories") }

    func memorySuggestions(conversationId: String) async throws -> MemorySuggestions {
        try await send("POST", "/v1/conversations/\(conversationId)/memory-suggestions", body: EmptyBody())
    }

    func exportData() async throws -> Data { try await sendRaw("GET", "/v1/export") }

    func deleteAccount() async throws { try await sendNoContent("DELETE", "/v1/me") }
}

struct EmptyBody: Encodable {}

/// Lar oss sende en vilkårlig Encodable som body.
struct AnyEncodable: Encodable {
    private let encodeFn: (Encoder) throws -> Void
    init(_ wrapped: Encodable) { encodeFn = { try wrapped.encode(to: $0) } }
    func encode(to encoder: Encoder) throws { try encodeFn(encoder) }
}
