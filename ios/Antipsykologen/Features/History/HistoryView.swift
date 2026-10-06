import SwiftUI

/// Viser bare lagrede samtaler. Sletting av enkelttråder og all historikk.
struct HistoryView: View {
    @Environment(AppState.self) private var state
    @State private var conversations: [ConversationDTO] = []
    @State private var error: String?
    @State private var confirmDeleteAll = false
    @State private var loaded = false

    var body: some View {
        List {
            if state.me?.historyEnabled == false {
                Text("Historikk er av. Nye samtaler lagres bare midlertidig og vises ikke her. Du kan slå det på i innstillinger.")
                    .font(.callout)
                    .foregroundStyle(Theme.textSecondary)
                    .listRowBackground(Theme.surface)
            }
            if loaded && conversations.isEmpty {
                Text("Ingen lagrede samtaler.").foregroundStyle(Theme.textSecondary).listRowBackground(Theme.surface)
            }
            ForEach(conversations) { c in
                NavigationLink(value: ConversationRoute(conversation: c, sendDraftOnOpen: false)) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(c.title ?? c.topic.title).font(.headline).lineLimit(2)
                        Text("\(c.topic.title) · \(Self.format(c.updatedAt))")
                            .font(.caption).foregroundStyle(Theme.textSecondary)
                    }
                    .padding(.vertical, 4)
                }
                .listRowBackground(Theme.surface)
            }
            .onDelete { idx in Task { await delete(idx) } }

            if !conversations.isEmpty {
                Button("Slett all historikk", role: .destructive) { confirmDeleteAll = true }
                    .frame(minHeight: Theme.minTap)
                    .listRowBackground(Theme.surface)
            }
            if let error {
                Text(error).foregroundStyle(Theme.rust).listRowBackground(Theme.surface)
            }
        }
        .scrollContentBackground(.hidden)
        .background(Theme.background)
        .navigationTitle("Historikk")
        .navigationDestination(for: ConversationRoute.self) { r in
            ConversationScreen(conversation: r.conversation, sendDraftOnOpen: false)
        }
        .confirmationDialog("Slette all historikk?", isPresented: $confirmDeleteAll, titleVisibility: .visible) {
            Button("Slett alt", role: .destructive) { Task { await deleteAll() } }
        } message: {
            Text("Alle samtaler, sammendrag og minner laget fra dem slettes fra serveren. Kan ikke angres.")
        }
        .refreshable { await load() }
        .task { await load() }
    }

    private func load() async {
        do {
            conversations = try await state.api.conversations()
            error = nil
        } catch {
            self.error = APIError.from(error).userMessage
        }
        loaded = true
    }

    private func delete(_ idx: IndexSet) async {
        for i in idx {
            do {
                try await state.api.deleteConversation(id: conversations[i].id)
                state.drafts.clear(conversations[i].id)
            } catch {
                self.error = APIError.from(error).userMessage
                return
            }
        }
        conversations.remove(atOffsets: idx)
    }

    private func deleteAll() async {
        do {
            try await state.api.deleteAllConversations()
            for c in conversations { state.drafts.clear(c.id) }
            conversations = []
        } catch {
            self.error = APIError.from(error).userMessage
        }
    }

    static func format(_ iso: String) -> String {
        guard let d = ISODate.parse(iso) else { return "" }
        return d.formatted(date: .abbreviated, time: .shortened)
    }
}
