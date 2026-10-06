import Foundation

/// Tilstand og logikk for én samtale. Ingen SwiftUI-avhengigheter, slik at den
/// kan testes med en falsk ChatService.
///
/// Utkastregler:
/// - Teksten i skrivefeltet lagres lokalt ved hver endring (DraftStore).
/// - Ved Send får utkastet en meldings-ID som lagres sammen med teksten.
/// - Først når serveren bekrefter mottak (user_message), fjernes det lagrede utkastet.
/// - Feiler sendingen før det, legges teksten tilbake i skrivefeltet.
/// - Brytes strømmen etter mottak, beholdes ID-en slik at «Prøv igjen» ikke lager duplikat.
@MainActor
@Observable
final class ConversationModel {
    private(set) var conversation: ConversationDTO
    private(set) var messages: [MessageDTO] = []
    private(set) var isStreaming = false
    private(set) var streamingMessageId: String? = nil
    private(set) var safetyResources: [ResourceDTO] = []
    /// Feil som vises over skrivefeltet. Brukerens tekst er alltid bevart når denne er satt.
    var errorBanner: String? = nil
    /// Om det finnes en melding som kan sendes på nytt med samme ID.
    private(set) var canRetry = false
    private(set) var ended = false
    private(set) var draftText: String
    private(set) var isImportMode: Bool

    @ObservationIgnored private let service: ChatService
    @ObservationIgnored private let drafts: DraftStore
    @ObservationIgnored private var streamTask: Task<Void, Never>? = nil
    @ObservationIgnored private var userStopped = false
    @ObservationIgnored private var inFlight: SendMessageRequest? = nil
    @ObservationIgnored private var inFlightAccepted = false
    @ObservationIgnored private var inFlightFromDraft = false

    /// Nøkkel for meldingen som venter på nytt forsøk (separat fra skrivefeltets utkast).
    private var pendingKey: String { conversation.id + ":pending" }

    init(conversation: ConversationDTO, service: ChatService, drafts: DraftStore) {
        self.conversation = conversation
        self.service = service
        self.drafts = drafts
        let d = drafts.draft(for: conversation.id)
        self.draftText = d.text
        self.isImportMode = d.kind == .import
        self.canRetry = drafts.draft(for: conversation.id + ":pending").pendingClientMessageId != nil
    }

    var lastAssistant: MessageDTO? { messages.last(where: { $0.isAssistant }) }

    // MARK: - Skrivefelt

    func setDraft(_ text: String) {
        draftText = text
        saveFieldDraft()
    }

    func setImportMode(_ on: Bool) {
        isImportMode = on
        saveFieldDraft()
    }

    private func saveFieldDraft() {
        var d = Draft()
        d.text = draftText
        d.kind = isImportMode ? .import : .message
        drafts.save(d, for: conversation.id)
    }

    // MARK: - Lasting

    func load() async {
        do {
            let detail = try await service.conversation(id: conversation.id)
            conversation = detail.conversation
            if !isStreaming { messages = detail.messages }
        } catch {
            errorBanner = APIError.from(error).userMessage
        }
    }

    // MARK: - Sending

    /// Sender skrivefeltets tekst.
    func sendDraft() {
        guard !isStreaming else { return }
        let text = draftText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        let kind: MessageKind = isImportMode ? .import : .message
        let request = SendMessageRequest(clientMessageId: Self.newId(), kind: kind, content: text)
        // Lagre som ventende før noe sendes – overlever krasj og avbrudd.
        savePending(request)
        draftText = ""
        isImportMode = false
        drafts.clear(conversation.id)
        start(request, fromDraft: true)
    }

    /// Kontrollhandlinger (Du har misforstått, Mildere, Skarpere, Ett neste steg).
    func sendControl(kind: MessageKind, content: String = "", correctsMessageId: String? = nil) {
        guard !isStreaming else { return }
        let request = SendMessageRequest(clientMessageId: Self.newId(), kind: kind,
                                         content: content.trimmingCharacters(in: .whitespacesAndNewlines),
                                         correctsMessageId: correctsMessageId)
        savePending(request)
        start(request, fromDraft: false)
    }

    /// Nytt forsøk med samme meldings-ID (gir ikke duplikat på serveren).
    func retry() {
        guard !isStreaming else { return }
        let d = drafts.draft(for: pendingKey)
        guard let id = d.pendingClientMessageId else { return }
        let request = SendMessageRequest(clientMessageId: id, kind: d.kind, content: d.text,
                                         correctsMessageId: d.pendingCorrectsMessageId)
        start(request, fromDraft: d.kind == .message || d.kind == .import)
    }

    func misunderstood(explanation: String) {
        sendControl(kind: .correction, content: explanation, correctsMessageId: lastAssistant?.id)
    }
    func milder() { sendControl(kind: .toneMilder) }
    func sharper() { sendControl(kind: .toneSharper) }
    func nextStep() { sendControl(kind: .nextStep) }

    private func savePending(_ r: SendMessageRequest) {
        var d = Draft()
        d.text = r.content
        d.kind = r.kind
        d.pendingClientMessageId = r.clientMessageId
        d.pendingCorrectsMessageId = r.correctsMessageId
        drafts.save(d, for: pendingKey)
    }

    private func start(_ request: SendMessageRequest, fromDraft: Bool) {
        errorBanner = nil
        canRetry = false
        isStreaming = true
        userStopped = false
        ended = false
        inFlight = request
        inFlightAccepted = false
        inFlightFromDraft = fromDraft
        streamTask = Task { [weak self] in
            await self?.consume(request)
        }
    }

    private func consume(_ request: SendMessageRequest) async {
        let stream = service.streamMessage(conversationId: conversation.id, request: request)
        do {
            for try await event in stream {
                apply(event)
            }
            finishStreaming()
        } catch {
            handleStreamFailure(error)
        }
    }

    func apply(_ event: StreamEvent) {
        switch event {
        case let .userMessage(m, _):
            upsert(m)
            if m.clientMessageId == inFlight?.clientMessageId {
                inFlightAccepted = true
                // Teksten er lagret på serveren og vises i tråden; ikke vis den dobbelt.
                if inFlightFromDraft, draftText.trimmingCharacters(in: .whitespacesAndNewlines) == m.content {
                    setDraft("")
                }
            }
        case let .assistantMessage(m):
            streamingMessageId = m.id
            upsert(m)
        case let .delta(text):
            guard let id = streamingMessageId, let i = messages.firstIndex(where: { $0.id == id }) else { return }
            messages[i].content += text
            messages[i].status = .generating
        case let .safety(_, resources):
            safetyResources = resources
            conversation.darkHumor = false
            conversation.safetyLevel = "concern"
        case let .error(_, message, retryable):
            errorBanner = message
            canRetry = retryable
        case let .done(m):
            upsert(m)
            streamingMessageId = nil
            if m.status == .completed {
                drafts.clear(pendingKey)
                canRetry = false
            } else {
                canRetry = true // ventende melding beholdes for «Prøv igjen»
            }
        }
    }

    private func finishStreaming() {
        // Strømmen sluttet uten endelig status (stoppet eller brutt): vis som avbrutt, aldri som fullført.
        if let id = streamingMessageId {
            markInterrupted(id, reason: userStopped ? "user_cancelled" : "connection_lost")
            canRetry = true
        }
        endStream()
    }

    private func handleStreamFailure(_ error: Error) {
        if userStopped || error is CancellationError {
            if let id = streamingMessageId { markInterrupted(id, reason: "user_cancelled") }
            canRetry = drafts.draft(for: pendingKey).pendingClientMessageId != nil
        } else {
            let apiError = APIError.from(error)
            if let id = streamingMessageId { markInterrupted(id, reason: "connection_lost") }
            errorBanner = apiError.userMessage
            if !inFlightAccepted, inFlightFromDraft, let r = inFlight {
                // Serveren fikk aldri teksten: legg den tilbake i skrivefeltet.
                // Ventende ID beholdes, så «Prøv igjen» ikke lager duplikat hvis serveren likevel fikk den.
                if draftText.isEmpty {
                    draftText = r.content
                    isImportMode = r.kind == .import
                }
            }
            canRetry = apiError.isRetryable
        }
        endStream()
    }

    private func endStream() {
        isStreaming = false
        streamTask = nil
        streamingMessageId = nil
        inFlight = nil
    }

    private func markInterrupted(_ id: String, reason: String) {
        guard let i = messages.firstIndex(where: { $0.id == id }) else { return }
        if messages[i].status == .generating || messages[i].status == .created {
            messages[i].status = messages[i].content.isEmpty ? .failed : .cancelled
            messages[i].incompleteReason = reason
        }
    }

    /// Stopp-knappen: avbryt lokalt (lukker forbindelsen) og be serveren stoppe.
    func stop() {
        guard isStreaming else { return }
        userStopped = true
        let id = streamingMessageId
        streamTask?.cancel()
        if let id {
            let service = self.service
            Task { try? await service.cancel(messageId: id) }
        }
    }

    /// Avslutt uten press: ingen spørsmål, ingen påminnelser.
    func end() async {
        stop()
        ended = true
        _ = try? await service.updateConversation(id: conversation.id, tone: nil, darkHumor: nil, closed: true)
    }

    /// Kalles når appen kommer tilbake i forgrunnen: hent serverens status.
    func becameActive() async {
        if !isStreaming { await load() }
    }

    private func upsert(_ m: MessageDTO) {
        if let i = messages.firstIndex(where: { $0.id == m.id }) {
            messages[i] = m
        } else {
            messages.append(m)
            messages.sort { $0.seq < $1.seq }
        }
    }

    private static func newId() -> String { UUID().uuidString.lowercased() }
}
