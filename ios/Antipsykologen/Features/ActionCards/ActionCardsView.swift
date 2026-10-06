import SwiftUI

struct ActionCardsView: View {
    @Environment(AppState.self) private var state
    @State private var cards: [ActionCardDTO] = []
    @State private var error: String?
    @State private var showNew = false

    var body: some View {
        List {
            if cards.isEmpty {
                Text("Ingen handlingskort ennå. Lag et fra en samtale, eller trykk +.")
                    .foregroundStyle(Theme.textSecondary)
                    .listRowBackground(Theme.surface)
            }
            ForEach(cards) { card in
                VStack(alignment: .leading, spacing: 6) {
                    Text(card.what).font(.headline)
                    LabeledContent("Når", value: card.when)
                    LabeledContent("Gjennomført når", value: card.doneWhen)
                    LabeledContent("Hvis ikke", value: card.ifStuck)
                    Picker("Status", selection: Binding(
                        get: { card.status },
                        set: { new in Task { await update(card, new) } })) {
                        ForEach(ActionCardStatus.allCases, id: \.self) { Text($0.label).tag($0) }
                    }
                    .pickerStyle(.segmented)
                    .frame(minHeight: Theme.minTap)
                }
                .font(.subheadline)
                .padding(.vertical, 6)
                .listRowBackground(Theme.surface)
            }
            .onDelete { idx in Task { await delete(idx) } }
            if let error {
                Text(error).foregroundStyle(Theme.rust).listRowBackground(Theme.surface)
            }
        }
        .scrollContentBackground(.hidden)
        .background(Theme.background)
        .navigationTitle("Handlinger")
        .toolbar {
            Button { showNew = true } label: { Image(systemName: "plus") }
                .accessibilityLabel("Nytt handlingskort")
        }
        .sheet(isPresented: $showNew, onDismiss: { Task { await load() } }) {
            NavigationStack { ActionCardEditor(conversationId: nil, basis: nil) }
        }
        .refreshable { await load() }
        .task { await load() }
    }

    private func load() async {
        do {
            cards = try await state.api.actionCards()
            error = nil
        } catch {
            self.error = APIError.from(error).userMessage
        }
    }

    private func update(_ card: ActionCardDTO, _ status: ActionCardStatus) async {
        do {
            let updated = try await state.api.updateActionCard(id: card.id, status: status)
            if let i = cards.firstIndex(where: { $0.id == card.id }) { cards[i] = updated }
        } catch {
            self.error = APIError.from(error).userMessage
        }
    }

    private func delete(_ idx: IndexSet) async {
        for i in idx {
            let card = cards[i]
            do { try await state.api.deleteActionCard(id: card.id) } catch { self.error = APIError.from(error).userMessage; return }
        }
        cards.remove(atOffsets: idx)
    }
}
