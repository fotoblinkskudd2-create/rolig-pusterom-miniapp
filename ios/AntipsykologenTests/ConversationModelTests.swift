import XCTest
@testable import Antipsykologen

/// Falsk backend: spiller av et manus med hendelser, feil og ventepunkter.
@MainActor
final class FakeChatService: ChatService {
    enum Step {
        case event(StreamEvent)
        case fail(Error)
        /// Venter til strømmen avbrytes (brukeren trykker Stopp).
        case waitForCancel
    }
    var scripts: [[Step]] = []
    private(set) var requests: [SendMessageRequest] = []
    private(set) var cancelled: [String] = []

    func streamMessage(conversationId: String, request: SendMessageRequest) -> AsyncThrowingStream<StreamEvent, Error> {
        requests.append(request)
        let steps = scripts.isEmpty ? [] : scripts.removeFirst()
        return AsyncThrowingStream { continuation in
            let task = Task {
                for step in steps {
                    try? await Task.sleep(nanoseconds: 5_000_000)
                    switch step {
                    case let .event(.userMessage(m, replay)):
                        // Som serveren: brukermeldingen bærer klientens meldings-ID.
                        let echoed = MessageDTO(
                            id: m.id, conversationId: m.conversationId, seq: m.seq, role: m.role, kind: request.kind,
                            content: request.content, status: m.status, incompleteReason: nil, errorCode: nil,
                            clientMessageId: request.clientMessageId, replyTo: nil, correctedAt: nil, safetyLevel: nil,
                            generatedBy: nil, createdAt: m.createdAt)
                        continuation.yield(.userMessage(echoed, replay: replay))
                    case let .event(e): continuation.yield(e)
                    case let .fail(err): continuation.finish(throwing: err); return
                    case .waitForCancel:
                        while !Task.isCancelled { try? await Task.sleep(nanoseconds: 5_000_000) }
                        continuation.finish(throwing: CancellationError()); return
                    }
                }
                continuation.finish()
            }
            continuation.onTermination = { _ in task.cancel() }
        }
    }

    func cancel(messageId: String) async throws { cancelled.append(messageId) }

    func conversation(id: String) async throws -> ConversationDetail {
        throw URLError(.notConnectedToInternet)
    }

    func updateConversation(id: String, tone: Tone?, darkHumor: Bool?, closed: Bool?) async throws -> ConversationDTO {
        throw URLError(.notConnectedToInternet)
    }
}

@MainActor
final class ConversationModelTests: XCTestCase {
    private var drafts: DraftStore!
    private var service: FakeChatService!
    private var model: ConversationModel!

    private static let conv = ConversationDTO(
        id: "c1", topic: .parforhold, title: nil, tone: .torr, darkHumor: true, persisted: true, expiresAt: nil,
        safetyLevel: "none", closedAt: nil, createdAt: "2026-10-06T10:00:00Z", updatedAt: "2026-10-06T10:00:00Z", messageCount: nil)

    override func setUp() async throws {
        drafts = DraftStore(directory: FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString))
        service = FakeChatService()
        model = ConversationModel(conversation: Self.conv, service: service, drafts: drafts)
    }

    private func msg(_ id: String, role: String, seq: Int, content: String = "", status: MessageStatus, clientId: String? = nil,
                     reason: String? = nil, replyTo: String? = nil) -> MessageDTO {
        MessageDTO(id: id, conversationId: "c1", seq: seq, role: role, kind: .message, content: content, status: status,
                   incompleteReason: reason, errorCode: nil, clientMessageId: clientId, replyTo: replyTo, correctedAt: nil,
                   safetyLevel: nil, generatedBy: nil, createdAt: "2026-10-06T10:00:00Z")
    }

    private func waitUntilIdle(file: StaticString = #filePath, line: UInt = #line) async {
        for _ in 0..<400 where model.isStreaming { try? await Task.sleep(nanoseconds: 5_000_000) }
        XCTAssertFalse(model.isStreaming, "strømmen ble ikke ferdig", file: file, line: line)
    }

    /// Test 3 (klient): avbrutt strømming vises som avbrutt.
    func testUserStopShowsCancelledNotCompleted() async {
        service.scripts = [[
            .event(.userMessage(msg("u1", role: "user", seq: 1, content: "Hei", status: .completed, clientId: "x"), replay: false)),
            .event(.assistantMessage(msg("a1", role: "assistant", seq: 2, status: .created, replyTo: "u1"))),
            .event(.delta("Du har ")),
            .waitForCancel,
        ]]
        model.setDraft("Hei")
        model.sendDraft()
        for _ in 0..<200 where model.messages.last?.content != "Du har " { try? await Task.sleep(nanoseconds: 5_000_000) }
        model.stop()
        await waitUntilIdle()
        try? await Task.sleep(nanoseconds: 20_000_000)
        let a = model.messages.last!
        XCTAssertEqual(a.status, .cancelled)
        XCTAssertEqual(a.incompleteNote, "Avbrutt – du stoppet svaret.")
        XCTAssertEqual(service.cancelled, ["a1"])
    }

    /// Strømmen slutter uten «done»: aldri vist som fullført.
    func testStreamEndingWithoutDoneIsInterrupted() async {
        service.scripts = [[
            .event(.userMessage(msg("u1", role: "user", seq: 1, content: "Hei", status: .completed), replay: false)),
            .event(.assistantMessage(msg("a1", role: "assistant", seq: 2, status: .created, replyTo: "u1"))),
            .event(.delta("Halvt svar")),
        ]]
        model.setDraft("Hei")
        model.sendDraft()
        await waitUntilIdle()
        XCTAssertEqual(model.messages.last?.status, .cancelled)
        XCTAssertNotEqual(model.messages.last?.status, .completed)
        XCTAssertTrue(model.canRetry)
    }

    /// Test 10 (klient): nettverksfeil før serveren fikk teksten bevarer utkastet og gir forståelig melding.
    func testOfflineFailurePreservesDraftAndExplains() async {
        service.scripts = [[.fail(URLError(.notConnectedToInternet))]]
        model.setDraft("Viktig tekst som ikke må forsvinne")
        model.sendDraft()
        await waitUntilIdle()
        XCTAssertEqual(model.draftText, "Viktig tekst som ikke må forsvinne")
        XCTAssertEqual(model.errorBanner, APIError.offline.userMessage)
        XCTAssertTrue(model.errorBanner!.contains("lagret"))
        XCTAssertTrue(model.canRetry)
        // Overlever omstart av appen: ventende melding finnes på disk.
        XCTAssertEqual(drafts.draft(for: "c1:pending").text, "Viktig tekst som ikke må forsvinne")
    }

    /// Nytt forsøk bruker samme meldings-ID (ingen duplikat på serveren).
    func testRetryReusesClientMessageId() async {
        service.scripts = [
            [.fail(URLError(.networkConnectionLost))],
            [
                .event(.userMessage(msg("u1", role: "user", seq: 1, content: "Hei", status: .completed), replay: false)),
                .event(.assistantMessage(msg("a1", role: "assistant", seq: 2, status: .created, replyTo: "u1"))),
                .event(.delta("Ok.")),
                .event(.done(msg("a1", role: "assistant", seq: 2, content: "Ok.", status: .completed, replyTo: "u1"))),
            ],
        ]
        model.setDraft("Hei")
        model.sendDraft()
        await waitUntilIdle()
        model.retry()
        await waitUntilIdle()
        XCTAssertEqual(service.requests.count, 2)
        XCTAssertEqual(service.requests[0].clientMessageId, service.requests[1].clientMessageId)
        XCTAssertEqual(model.messages.last?.status, .completed)
        XCTAssertEqual(model.draftText, "") // vises i tråden, ikke dobbelt i feltet
        XCTAssertFalse(model.canRetry)
        XCTAssertTrue(drafts.draft(for: "c1:pending").isEmpty)
    }

    /// Brudd etter at serveren fikk teksten: svaret merkes avbrutt, og nytt forsøk er mulig.
    func testConnectionLostMidStreamMarksCancelled() async {
        service.scripts = [[
            .event(.userMessage(msg("u1", role: "user", seq: 1, content: "Hei", status: .completed), replay: false)),
            .event(.assistantMessage(msg("a1", role: "assistant", seq: 2, status: .created, replyTo: "u1"))),
            .event(.delta("Begynte")),
            .fail(URLError(.networkConnectionLost)),
        ]]
        model.setDraft("Hei")
        model.sendDraft()
        await waitUntilIdle()
        XCTAssertEqual(model.messages.last?.status, .cancelled)
        XCTAssertEqual(model.messages.last?.incompleteNote, "Avbrutt – forbindelsen ble brutt.")
        XCTAssertEqual(model.errorBanner, APIError.connectionLost.userMessage)
        XCTAssertTrue(model.canRetry)
    }

    /// Sikkerhetssignal slår av humor lokalt og viser hjelpetilbud.
    func testSafetyEventDisablesHumorAndShowsResources() async {
        let r = ResourceDTO(id: "x", name: "Politi", phone: "112", chatUrl: nil, hours: "Døgnåpent", description: "", source: "")
        service.scripts = [[
            .event(.safety(level: "concern", resources: [r])),
        ]]
        model.sendControl(kind: .message, content: "test")
        await waitUntilIdle()
        XCTAssertEqual(model.safetyResources, [r])
        XCTAssertFalse(model.conversation.darkHumor)
        XCTAssertTrue(model.conversation.humorLocked)
    }

    func testCorrectionTargetsLastAssistant() async {
        model.apply(.assistantMessage(msg("a9", role: "assistant", seq: 2, content: "Vurdering", status: .completed)))
        service.scripts = [[]]
        model.misunderstood(explanation: "Det handler om meg")
        await waitUntilIdle()
        XCTAssertEqual(service.requests.last?.kind, .correction)
        XCTAssertEqual(service.requests.last?.correctsMessageId, "a9")
        XCTAssertEqual(service.requests.last?.content, "Det handler om meg")
    }
}
