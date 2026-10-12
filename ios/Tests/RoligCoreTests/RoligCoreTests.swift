import XCTest
@testable import RoligCore

final class RoligCoreTests: XCTestCase {
    var cal: Calendar = {
        var c = Calendar(identifier: .gregorian)
        c.timeZone = TimeZone(identifier: "Europe/Oslo")!
        return c
    }()

    func makeStore(_ p: CheckinPersistence = InMemoryPersistence()) throws -> RoligStore {
        try RoligStore(persistence: p, calendar: cal)
    }

    // MARK: Breath — every phase boundary of the 4/2/6 cycle
    func testBreathBoundaries() {
        let b = BreathCycle()
        XCTAssertEqual(b.period, 12)
        let cases: [(TimeInterval, BreathCycle.Phase, Double)] = [
            (0, .inhale, 0), (2, .inhale, 0.5), (3.999, .inhale, 0.99975),
            (4, .hold, 1), (5.999, .hold, 1),
            (6, .exhale, 1), (9, .exhale, 0.5), (12, .inhale, 0), (-5, .inhale, 0),
        ]
        for (t, phase, scale) in cases {
            let s = b.state(elapsed: t)
            XCTAssertEqual(s.phase, phase, "t=\(t)")
            XCTAssertEqual(s.scale, scale, accuracy: 1e-9, "t=\(t)")
        }
    }

    func testBreathNoDriftOver1000Cycles() {
        let b = BreathCycle()
        XCTAssertEqual(b.state(elapsed: 12_000 + 4.5).phase, .hold)
    }

    // MARK: Protocol mismatch — web 1.0 payload
    func testLegacyImportStringMoodAndCorruptRows() throws {
        let json = """
        [{"date":"2026-08-29T18:34:11.123Z","mood":"4","note":"  ok  "},
         {"date":"2026-08-28T08:00:00Z","mood":3,"note":""},
         {"date":"2026-08-27T08:00:00Z","mood":"9","note":"out of range"},
         {"date":"not-a-date","mood":"2"},
         {"mood":"2"},
         "garbage"]
        """.data(using: .utf8)!
        var s = try makeStore()
        let r = try s.importLegacy(json)
        XCTAssertEqual(r.imported, 2)
        XCTAssertEqual(r.skipped, 4)
        XCTAssertEqual(s.snapshot.checkins.first?.mood, .good)
        XCTAssertEqual(s.snapshot.checkins.first?.note, "ok")
        XCTAssertEqual(try s.importLegacy(json).imported, 0, "re-import must dedupe")
    }

    func testLegacyImportNonArrayIsNoop() throws {
        var s = try makeStore()
        XCTAssertEqual(try s.importLegacy(Data("{}".utf8)).imported, 0)
    }

    // MARK: Store
    func testWeekCountExcludesFutureAndOld() throws {
        var s = try makeStore()
        let now = Date(timeIntervalSince1970: 1_790_000_000)
        try s.addCheckin(mood: .calm, note: "", at: now.addingTimeInterval(-8 * 86400))
        try s.addCheckin(mood: .calm, note: "", at: now.addingTimeInterval(-6 * 86400))
        try s.addCheckin(mood: .calm, note: "", at: now)
        try s.addCheckin(mood: .calm, note: "", at: now.addingTimeInterval(60))
        XCTAssertEqual(s.countLast7Days(now: now), 2)
        XCTAssertEqual(s.recent(limit: 20).count, 4)
        XCTAssertEqual(s.recent(limit: -1).count, 0)
    }

    func testToggleActionPerDayAndBounds() throws {
        var s = try makeStore()
        let d = Date(timeIntervalSince1970: 1_790_000_000)
        try s.toggleAction(2, on: d)
        XCTAssertTrue(s.isDone(2, on: d))
        XCTAssertFalse(s.isDone(2, on: d.addingTimeInterval(86400)))
        try s.toggleAction(2, on: d)
        XCTAssertTrue(s.snapshot.doneActions.isEmpty, "empty day keys are pruned")
        try s.toggleAction(99, on: d)
        try s.toggleAction(-1, on: d)
        XCTAssertTrue(s.snapshot.doneActions.isEmpty)
    }

    func testFileRoundTrip() throws {
        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString).appendingPathComponent("rolig.json")
        defer { try? FileManager.default.removeItem(at: url.deletingLastPathComponent()) }
        var a = try makeStore(FilePersistence(url: url))
        try a.addCheckin(mood: .low, note: "tung dag", at: Date(timeIntervalSince1970: 1_790_000_000))
        try a.toggleAction(0, on: Date(timeIntervalSince1970: 1_790_000_000))
        let b = try makeStore(FilePersistence(url: url))
        XCTAssertEqual(a.snapshot, b.snapshot)
    }

    func testExportText() throws {
        var s = try makeStore()
        try s.addCheckin(mood: .neutral, note: "<script>x</script>", at: Date(timeIntervalSince1970: 1_790_000_000))
        let t = s.exportText()
        XCTAssertTrue(t.hasPrefix("Pusterom – historikk\n"))
        XCTAssertTrue(t.contains("3/5 · <script>x</script>"), "plain text, no HTML interpretation")
    }
}
