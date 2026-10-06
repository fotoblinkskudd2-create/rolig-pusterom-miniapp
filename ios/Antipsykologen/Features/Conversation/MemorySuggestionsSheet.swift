import SwiftUI

/// Forslag til minner fra denne samtalen. Ingenting lagres før brukeren trykker «Lagre» på et forslag.
struct MemorySuggestionsSheet: View {
    @Environment(AppState.self) private var state
    @Environment(\.dismiss) private var dismiss
    let conversationId: String

    @State private var suggestions: [String] = []
    @State private var saved: Set<String> = []
    @State private var loading = true
    @State private var error: String?

    var body: some View {
        List {
            Section {
                if loading {
                    HStack { ProgressView(); Text("Henter forslag …") }
                } else if suggestions.isEmpty && error == nil {
                    Text("Ingen forslag. Du kan skrive minner selv i innstillinger.")
                        .foregroundStyle(Theme.textSecondary)
                }
                ForEach(suggestions, id: \.self) { s in
                    HStack(alignment: .top) {
                        Text(s).frame(maxWidth: .infinity, alignment: .leading)
                        if saved.contains(s) {
                            Label("Lagret", systemImage: "checkmark").labelStyle(.iconOnly)
                                .foregroundStyle(Theme.green)
                                .accessibilityLabel("Lagret")
                        } else {
                            Button("Lagre") { Task { await save(s) } }
                                .buttonStyle(ChipButtonStyle())
                        }
                    }
                }
            } footer: {
                Text("Minner fra en samtale slettes automatisk hvis du sletter samtalen. Du kan se, rette og slette dem i innstillinger.")
            }
            if let error { Text(error).foregroundStyle(Theme.rust) }
        }
        .scrollContentBackground(.hidden)
        .background(Theme.background)
        .navigationTitle("Huske noe?")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Ferdig") { dismiss() } } }
        .task { await load() }
    }

    private func load() async {
        defer { loading = false }
        guard state.me?.memoryEnabled == true else {
            error = "Langtidsminne er av. Slå det på i innstillinger først."
            return
        }
        do {
            suggestions = try await state.api.memorySuggestions(conversationId: conversationId).suggestions
        } catch {
            self.error = APIError.from(error).userMessage
        }
    }

    private func save(_ s: String) async {
        do {
            _ = try await state.api.createMemory(content: s, sourceConversationId: conversationId)
            saved.insert(s)
        } catch {
            self.error = APIError.from(error).userMessage
        }
    }
}
