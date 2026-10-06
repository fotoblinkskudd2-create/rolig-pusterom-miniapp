import XCTest
@testable import Antipsykologen

final class SSEParserTests: XCTestCase {
    private func parse(_ text: String) throws -> [StreamEvent] {
        var splitter = LineSplitter()
        var parser = SSEParser()
        var out: [StreamEvent] = []
        for byte in Array(text.utf8) {
            if let line = splitter.push(byte), let raw = parser.consume(line: line), let ev = try SSEParser.decode(raw) {
                out.append(ev)
            }
        }
        return out
    }

    private let msgJSON = #"{"id":"a1","conversationId":"c1","seq":2,"role":"assistant","kind":"message","content":"","status":"generating","incompleteReason":null,"errorCode":null,"clientMessageId":null,"replyTo":"u1","correctedAt":null,"safetyLevel":null,"generatedBy":null,"createdAt":"2026-10-06T10:00:00.000Z","updatedAt":"2026-10-06T10:00:00.000Z"}"#

    func testParsesEventsCommentsAndUnicode() throws {
        let text = """
        : ping

        event: assistant_message
        data: {"message":\(msgJSON)}

        event: delta
        data: {"text":"Hva gjør du nå? Æøå «sitat»"}

        event: safety
        data: {"level":"concern","resources":[{"id":"x","name":"Politi","phone":"112","hours":"Døgnåpent","description":"d","source":"s"}]}

        event: error
        data: {"code":"timeout","message":"Svaret tok for lang tid.","retryable":true}


        """
        let events = try parse(text)
        XCTAssertEqual(events.count, 4)
        guard case let .assistantMessage(m) = events[0] else { return XCTFail() }
        XCTAssertEqual(m.status, .generating)
        XCTAssertEqual(events[1], .delta("Hva gjør du nå? Æøå «sitat»"))
        guard case let .safety(level, resources) = events[2] else { return XCTFail() }
        XCTAssertEqual(level, "concern")
        XCTAssertEqual(resources.first?.telURL?.absoluteString, "tel:112")
        XCTAssertEqual(events[3], .error(code: "timeout", message: "Svaret tok for lang tid.", retryable: true))
    }

    func testHandlesCRLFAndIgnoresUnknownEvents() throws {
        let text = "event: something_new\r\ndata: {}\r\n\r\nevent: delta\r\ndata: {\"text\":\"ok\"}\r\n\r\n"
        XCTAssertEqual(try parse(text), [.delta("ok")])
    }

    func testIncompleteEventIsNotEmitted() throws {
        XCTAssertEqual(try parse("event: delta\ndata: {\"text\":\"halv\"}\n"), [])
    }

    func testIncompleteNotes() throws {
        let data = Data(msgJSON.utf8)
        var m = try JSONDecoder().decode(MessageDTO.self, from: data)
        m.status = .cancelled; m.incompleteReason = "user_cancelled"
        XCTAssertEqual(m.incompleteNote, "Avbrutt – du stoppet svaret.")
        m.incompleteReason = "connection_lost"
        XCTAssertEqual(m.incompleteNote, "Avbrutt – forbindelsen ble brutt.")
        m.status = .completed; m.incompleteReason = "max_tokens"
        XCTAssertTrue(m.incompleteNote?.hasPrefix("Ufullstendig") == true)
        m.incompleteReason = nil
        XCTAssertNil(m.incompleteNote)
    }
}
