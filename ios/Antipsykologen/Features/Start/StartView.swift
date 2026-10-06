import SwiftUI

struct ConversationRoute: Hashable, Identifiable {
    let conversation: ConversationDTO
    let sendDraftOnOpen: Bool
    var id: String { conversation.id }

    static func == (a: Self, b: Self) -> Bool { a.id == b.id }
    func hash(into h: inout Hasher) { h.combine(id) }
}

/// Tre innganger og ett stort felt: «Hva skjer?».
struct StartView: View {
    @Environment(AppState.self) private var state
    @State private var topic: Topic = .parforhold
    @State private var text = ""
    @State private var isImport = false
    @State private var route: ConversationRoute?
    @State private var working = false
    @State private var error: String?
    @FocusState private var focused: Bool

    private var maxChars: Int {
        isImport ? (state.meta?.limits.maxImportChars ?? 20_000) : (state.meta?.limits.maxMessageChars ?? 4_000)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Hva gjelder det?")
                    .font(Theme.heading(.title2))
                    .accessibilityAddTraits(.isHeader)

                VStack(spacing: 10) {
                    ForEach([Topic.parforhold, .arbeid, .utsettelse]) { t in
                        TopicRow(topic: t, selected: topic == t) { topic = t }
                    }
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text("Hva skjer?")
                        .font(Theme.heading(.title3))
                        .accessibilityAddTraits(.isHeader)
                    TextEditor(text: $text)
                        .focused($focused)
                        .frame(minHeight: 180)
                        .scrollContentBackground(.hidden)
                        .padding(10)
                        .background(Theme.surfaceRaised, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(Theme.hairline))
                        .accessibilityLabel("Hva skjer?")
                        .accessibilityHint("Skriv fritt. Teksten lagres på telefonen mens du skriver.")
                        .onChange(of: text) { _, new in saveDraft(new) }
                    HStack {
                        Toggle("Innlimt tekst (melding, e-post)", isOn: $isImport)
                            .font(.footnote)
                            .onChange(of: isImport) { _, _ in saveDraft(text) }
                        Spacer(minLength: 8)
                        Text("\(text.count)/\(maxChars)")
                            .font(.caption.monospacedDigit())
                            .foregroundStyle(text.count > maxChars ? Theme.rust : Theme.textSecondary)
                            .accessibilityLabel("\(text.count) av \(maxChars) tegn")
                    }
                }

                if let error {
                    Text(error).font(.callout).foregroundStyle(Theme.rust)
                }

                Button {
                    Task { await begin() }
                } label: {
                    if working { ProgressView().tint(Theme.background) } else { Text("Send") }
                }
                .buttonStyle(PrimaryButtonStyle())
                .disabled(working || text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                          || text.count > maxChars || !state.network.isOnline)
                .keyboardShortcut(.return, modifiers: .command)

                if !state.network.isOnline {
                    Text("Nye svar krever nett. Teksten din er lagret.")
                        .font(.footnote).foregroundStyle(Theme.textSecondary)
                }
            }
            .padding(20)
            .frame(maxWidth: 640)
            .frame(maxWidth: .infinity)
        }
        .scrollDismissesKeyboard(.interactively)
        .background(Theme.background.ignoresSafeArea())
        .navigationTitle("Antipsykologen")
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(item: $route) { r in
            ConversationScreen(conversation: r.conversation, sendDraftOnOpen: r.sendDraftOnOpen)
        }
        .onAppear {
            let d = state.drafts.draft(for: DraftStore.startKey)
            if text.isEmpty { text = d.text; isImport = d.kind == .import }
        }
    }

    private func saveDraft(_ value: String) {
        var d = Draft()
        d.text = value
        d.kind = isImport ? .import : .message
        state.drafts.save(d, for: DraftStore.startKey)
    }

    private func begin() async {
        working = true
        error = nil
        defer { working = false }
        do {
            let conv = try await state.api.createConversation(topic: topic)
            // Utkastet følger med til samtalen og sendes derfra (bevares ved feil).
            state.drafts.move(from: DraftStore.startKey, to: conv.id)
            text = ""
            isImport = false
            route = ConversationRoute(conversation: conv, sendDraftOnOpen: true)
        } catch {
            self.error = APIError.from(error).userMessage
        }
    }
}

private struct TopicRow: View {
    let topic: Topic
    let selected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: selected ? "largecircle.fill.circle" : "circle")
                    .foregroundStyle(selected ? Theme.rust : Theme.textSecondary)
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 2) {
                    Text(topic.title).font(.headline).foregroundStyle(Theme.textPrimary)
                    Text(topic.subtitle).font(.subheadline).foregroundStyle(Theme.textSecondary)
                }
                Spacer(minLength: 0)
            }
            .padding(14)
            .frame(maxWidth: .infinity, minHeight: Theme.minTap, alignment: .leading)
            .background(selected ? Theme.greenSoft : Theme.surface,
                        in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(selected ? [.isButton, .isSelected] : .isButton)
    }
}
