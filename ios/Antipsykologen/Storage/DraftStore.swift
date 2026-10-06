import Foundation

/// Et utkast som ikke er bekreftet mottatt av serveren.
/// `pendingClientMessageId` settes når brukeren trykker Send, og gjenbrukes ved
/// nytt forsøk – serveren lager da ikke en ny melding (idempotens).
struct Draft: Codable, Equatable, Sendable {
    var text: String = ""
    var kind: MessageKind = .message
    var pendingClientMessageId: String?
    var pendingCorrectsMessageId: String?
    var updatedAt: Date = Date()

    var isEmpty: Bool { text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && pendingClientMessageId == nil }
}

/// Lokal lagring av utkast. Overlever avbrudd, flymodus, bakgrunn og omstart av appen.
/// Lagres kryptert av iOS (Data Protection) i Application Support, aldri i iCloud-backup.
@MainActor
final class DraftStore {
    static let startKey = "start"

    private let fileURL: URL
    private var drafts: [String: Draft]

    init(directory: URL? = nil) {
        let dir = directory ?? (try? FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask,
                                                              appropriateFor: nil, create: true))
            ?? FileManager.default.temporaryDirectory
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        fileURL = dir.appendingPathComponent("drafts.json")
        if let data = try? Data(contentsOf: fileURL),
           let decoded = try? JSONDecoder().decode([String: Draft].self, from: data) {
            drafts = decoded
        } else {
            drafts = [:]
        }
    }

    func draft(for key: String) -> Draft { drafts[key] ?? Draft() }

    func save(_ draft: Draft, for key: String) {
        var d = draft
        d.updatedAt = Date()
        if d.isEmpty {
            drafts.removeValue(forKey: key)
        } else {
            drafts[key] = d
        }
        persist()
    }

    func clear(_ key: String) {
        drafts.removeValue(forKey: key)
        persist()
    }

    /// Flytter et utkast fra startskjermen til en ny samtale.
    func move(from: String, to: String) {
        guard let d = drafts.removeValue(forKey: from) else { return }
        drafts[to] = d
        persist()
    }

    func removeAll() {
        drafts = [:]
        try? FileManager.default.removeItem(at: fileURL)
    }

    private func persist() {
        do {
            let data = try JSONEncoder().encode(drafts)
            try data.write(to: fileURL, options: [.atomic, .completeFileProtectionUnlessOpen])
            var url = fileURL
            var values = URLResourceValues()
            values.isExcludedFromBackup = true
            try? url.setResourceValues(values)
        } catch {
            // Lagring feilet (f.eks. full disk). Utkastet finnes fortsatt i minnet.
        }
    }
}
