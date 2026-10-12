import Foundation

public enum Mood: Int, Codable, CaseIterable, Sendable {
    case veryLow = 1, low, neutral, good, calm

    public var emoji: String { ["😔", "😕", "😐", "🙂", "😌"][rawValue - 1] }
}

public struct Checkin: Codable, Equatable, Sendable, Identifiable {
    public var id: UUID
    public var date: Date
    public var mood: Mood
    public var note: String

    public init(id: UUID = UUID(), date: Date, mood: Mood, note: String) {
        self.id = id
        self.date = date
        self.mood = mood
        self.note = note.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private enum CodingKeys: String, CodingKey { case id, date, mood, note }

    // Protocol-mismatch tolerance: web 1.0 stored mood as a String ("3"),
    // ISO dates with fractional seconds, and no id.
    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decodeIfPresent(UUID.self, forKey: .id) ?? UUID()
        note = (try c.decodeIfPresent(String.self, forKey: .note) ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let raw: Int
        if let i = try? c.decode(Int.self, forKey: .mood) {
            raw = i
        } else if let s = try? c.decode(String.self, forKey: .mood), let i = Int(s) {
            raw = i
        } else {
            throw DecodingError.dataCorruptedError(forKey: .mood, in: c, debugDescription: "mood not Int or numeric String")
        }
        guard let m = Mood(rawValue: raw) else {
            throw DecodingError.dataCorruptedError(forKey: .mood, in: c, debugDescription: "mood \(raw) outside 1...5")
        }
        mood = m
        let s = try c.decode(String.self, forKey: .date)
        guard let d = ISODate.parse(s) else {
            throw DecodingError.dataCorruptedError(forKey: .date, in: c, debugDescription: "bad date \(s)")
        }
        date = d
    }

    public func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        try c.encode(id, forKey: .id)
        try c.encode(ISODate.format(date), forKey: .date)
        try c.encode(mood.rawValue, forKey: .mood)
        try c.encode(note, forKey: .note)
    }
}

enum ISODate {
    static func parse(_ s: String) -> Date? {
        let frac = ISO8601DateFormatter()
        frac.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return frac.date(from: s) ?? ISO8601DateFormatter().date(from: s)
    }

    static func format(_ d: Date) -> String {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f.string(from: d)
    }
}

public enum SmallActions {
    public static let all = [
        "Gå ut i frisk luft i 5 minutter",
        "Drikk et glass vann sakte",
        "Sett deg og kjenn føttene i gulvet",
        "Skriv ned én ting du er takknemlig for",
        "Ta tre dype pust der du er",
        "Legg telefonen bort i 10 minutter",
        "Strekk armene over hodet",
    ]
}
