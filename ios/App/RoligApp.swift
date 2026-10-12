// Xcode-only target (iOS 18+: uses the Tab API). Not part of the SwiftPM package; links RoligCore.
import SwiftUI
import Observation
import RoligCore

@MainActor @Observable
final class AppModel {
    private(set) var store: RoligStore
    var lastError: String?

    init() {
        let url = URL.applicationSupportDirectory.appending(path: "rolig.json")
        do {
            store = try RoligStore(persistence: FilePersistence(url: url))
        } catch {
            // Corrupt file: keep it aside for recovery, start a fresh file. Never crash, never silently overwrite.
            let aside = url.deletingPathExtension().appendingPathExtension("corrupt-\(Int(Date().timeIntervalSince1970)).json")
            try? FileManager.default.moveItem(at: url, to: aside)
            store = (try? RoligStore(persistence: FilePersistence(url: url)))
                ?? (try! RoligStore(persistence: InMemoryPersistence())) // InMemory.load cannot throw
            lastError = "Kunne ikke lese lagret historikk. En kopi er tatt vare på."
        }
    }

    func checkin(_ mood: Mood, _ note: String) { run { try store.addCheckin(mood: mood, note: note) } }
    func toggle(_ i: Int) { run { try store.toggleAction(i) } }
    private func run(_ f: () throws -> Void) {
        do { try f() } catch { lastError = "Lagring feilet." }
    }
}

@main
struct RoligApp: App {
    @State private var model = AppModel()
    var body: some Scene {
        WindowGroup {
            TabView {
                Tab("Hjem", systemImage: "house") { CheckinView() }
                Tab("Pusterom", systemImage: "wind") { BreathView() }
                Tab("Små grep", systemImage: "hand.raised") { ActionsView() }
                Tab("Historikk", systemImage: "book") { HistoryView() }
            }
            .environment(model)
        }
    }
}
