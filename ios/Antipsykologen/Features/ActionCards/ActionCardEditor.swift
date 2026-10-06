import SwiftUI

/// Gjør en valgt handling om til et handlingskort. Utkastet kommer fra serveren
/// (modellen); brukeren redigerer og lagrer selv.
struct ActionCardEditor: View {
    @Environment(AppState.self) private var state
    @Environment(\.dismiss) private var dismiss
    let conversationId: String?
    let basis: String?

    @State private var card = ActionCardDraft(what: "", when: "", doneWhen: "", ifStuck: "")
    @State private var loading = false
    @State private var saving = false
    @State private var error: String?
    @State private var modelBacked = true

    private var valid: Bool {
        [card.what, card.when, card.doneWhen, card.ifStuck].allSatisfy { !$0.trimmingCharacters(in: .whitespaces).isEmpty }
    }

    var body: some View {
        Form {
            if loading {
                Section { HStack { ProgressView(); Text("Lager utkast …") } }
            }
            if !modelBacked {
                Section { Text("Testmodus: utkastet er ikke laget av en språkmodell.").foregroundStyle(Theme.rust) }
            }
            Section("Hva jeg skal gjøre") {
                TextField("Én konkret handling", text: $card.what, axis: .vertical)
            }
            Section("Når") {
                TextField("For eksempel: i morgen kl. 08.30", text: $card.when, axis: .vertical)
            }
            Section("Hva som teller som gjennomført") {
                TextField("Noe du kan se at har skjedd", text: $card.doneWhen, axis: .vertical)
            }
            Section {
                TextField("En mindre versjon", text: $card.ifStuck, axis: .vertical)
            } header: {
                Text("Hvis jeg ikke får det til")
            } footer: {
                Text("Ingen straff. Ingen rekker å holde. Bare neste lille forsøk.")
            }
            if let error {
                Section { Text(error).foregroundStyle(Theme.rust) }
            }
        }
        .scrollContentBackground(.hidden)
        .background(Theme.background)
        .navigationTitle("Handlingskort")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) { Button("Avbryt") { dismiss() } }
            ToolbarItem(placement: .confirmationAction) {
                Button("Lagre") { Task { await save() } }
                    .disabled(!valid || saving)
            }
        }
        .task { await loadDraft() }
    }

    private func loadDraft() async {
        guard let conversationId, card.what.isEmpty else { return }
        loading = true
        defer { loading = false }
        do {
            let r = try await state.api.actionCardDraft(conversationId: conversationId, basis: basis)
            card = r.draft
            modelBacked = r.modelBacked
        } catch {
            self.error = APIError.from(error).userMessage + " Du kan fylle ut kortet selv."
        }
    }

    private func save() async {
        saving = true
        defer { saving = false }
        do {
            _ = try await state.api.createActionCard(conversationId: conversationId, card: card)
            dismiss()
        } catch {
            self.error = APIError.from(error).userMessage
        }
    }
}
