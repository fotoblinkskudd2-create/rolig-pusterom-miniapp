import Foundation

/// Persistence boundary. File-backed in the app, in-memory in tests.
public protocol CheckinPersistence: Sendable {
    func load() throws -> Snapshot
    func save(_ snapshot: Snapshot) throws
}

public struct Snapshot: Codable, Equatable, Sendable {
    public var checkins: [Checkin] = []
    /// Day key "yyyy-MM-dd" (local calendar) -> indices into SmallActions.all
    public var doneActions: [String: Set<Int>] = [:]
    public init() {}
}

public final class InMemoryPersistence: CheckinPersistence, @unchecked Sendable {
    private let lock = NSLock()
    private var snap = Snapshot()
    public init() {}
    public func load() throws -> Snapshot { lock.withLock { snap } }
    public func save(_ s: Snapshot) throws { lock.withLock { snap = s } }
}

/// One JSON file in Application Support, written atomically, file-protected on iOS.
public struct FilePersistence: CheckinPersistence {
    public let url: URL
    public init(url: URL) { self.url = url }

    public func load() throws -> Snapshot {
        guard FileManager.default.fileExists(atPath: url.path) else { return Snapshot() }
        return try JSONDecoder().decode(Snapshot.self, from: Data(contentsOf: url))
    }

    public func save(_ s: Snapshot) throws {
        try FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
        let data = try JSONEncoder().encode(s)
        #if os(iOS)
        try data.write(to: url, options: [.atomic, .completeFileProtection])
        #else
        try data.write(to: url, options: .atomic)
        #endif
    }
}

public struct RoligStore {
    public private(set) var snapshot: Snapshot
    private let persistence: CheckinPersistence
    private let calendar: Calendar

    public init(persistence: CheckinPersistence, calendar: Calendar = .current) throws {
        self.persistence = persistence
        self.calendar = calendar
        self.snapshot = try persistence.load()
    }

    public mutating func addCheckin(mood: Mood, note: String, at date: Date = Date()) throws {
        snapshot.checkins.insert(Checkin(date: date, mood: mood, note: note), at: 0)
        try persistence.save(snapshot)
    }

    public func recent(limit: Int = 20) -> ArraySlice<Checkin> { snapshot.checkins.prefix(max(0, limit)) }

    public func countLast7Days(now: Date = Date()) -> Int {
        let weekAgo = now.addingTimeInterval(-7 * 24 * 3600)
        return snapshot.checkins.filter { $0.date > weekAgo && $0.date <= now }.count
    }

    public func dayKey(_ d: Date) -> String {
        let c = calendar.dateComponents([.year, .month, .day], from: d)
        return String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
    }

    public func isDone(_ index: Int, on d: Date = Date()) -> Bool {
        snapshot.doneActions[dayKey(d)]?.contains(index) ?? false
    }

    public mutating func toggleAction(_ index: Int, on d: Date = Date()) throws {
        guard SmallActions.all.indices.contains(index) else { return }
        let key = dayKey(d)
        var set = snapshot.doneActions[key] ?? []
        if set.contains(index) { set.remove(index) } else { set.insert(index) }
        snapshot.doneActions[key] = set.isEmpty ? nil : set
        try persistence.save(snapshot)
    }

    /// Import web 1.0 `localStorage.checkins` JSON. Skips corrupt rows, dedupes by timestamp.
    @discardableResult
    public mutating func importLegacy(_ json: Data) throws -> (imported: Int, skipped: Int) {
        let rows = (try? JSONSerialization.jsonObject(with: json)) as? [Any] ?? []
        let known = Set(snapshot.checkins.map(\.date))
        var imported = 0, skipped = 0
        for row in rows {
            // isValidJSONObject first: data(withJSONObject:) traps on scalars like "garbage".
            guard JSONSerialization.isValidJSONObject(row),
                  let d = try? JSONSerialization.data(withJSONObject: row),
                  let c = try? JSONDecoder().decode(Checkin.self, from: d),
                  !known.contains(c.date) else { skipped += 1; continue }
            snapshot.checkins.append(c)
            imported += 1
        }
        snapshot.checkins.sort { $0.date > $1.date }
        try persistence.save(snapshot)
        return (imported, skipped)
    }

    /// Plain-text export, same intent as web «Ta historikken med deg».
    public func exportText(locale: Locale = Locale(identifier: "nb_NO")) -> String {
        let f = DateFormatter()
        f.locale = locale
        f.calendar = calendar
        f.timeZone = calendar.timeZone
        f.dateFormat = "EEE d. MMM yyyy HH:mm"
        let lines = snapshot.checkins.map { c in
            "\(f.string(from: c.date)) · \(c.mood.emoji) \(c.mood.rawValue)/5" + (c.note.isEmpty ? "" : " · \(c.note)")
        }
        return (["Pusterom – historikk", ""] + lines).joined(separator: "\n") + "\n"
    }
}
