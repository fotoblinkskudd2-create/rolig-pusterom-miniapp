import XCTest
@testable import Antipsykologen

@MainActor
final class DraftStoreTests: XCTestCase {
    func testDraftSurvivesNewInstance() {
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let a = DraftStore(directory: dir)
        var d = Draft()
        d.text = "Halvferdig tanke"
        d.pendingClientMessageId = "id-1"
        a.save(d, for: "c1")
        let b = DraftStore(directory: dir)
        XCTAssertEqual(b.draft(for: "c1").text, "Halvferdig tanke")
        XCTAssertEqual(b.draft(for: "c1").pendingClientMessageId, "id-1")
    }

    func testEmptyDraftIsRemovedAndMoveWorks() {
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let s = DraftStore(directory: dir)
        var d = Draft(); d.text = "x"
        s.save(d, for: DraftStore.startKey)
        s.move(from: DraftStore.startKey, to: "c2")
        XCTAssertEqual(s.draft(for: "c2").text, "x")
        XCTAssertTrue(s.draft(for: DraftStore.startKey).isEmpty)
        s.save(Draft(), for: "c2")
        XCTAssertTrue(DraftStore(directory: dir).draft(for: "c2").isEmpty)
    }
}
