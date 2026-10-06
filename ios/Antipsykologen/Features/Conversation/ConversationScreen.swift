import SwiftUI

struct ConversationScreen: View {
    @Environment(AppState.self) private var state
    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.dismiss) private var dismiss
    @Environment(\.dynamicTypeSize) private var typeSize
    @State private var model: ConversationModel? = nil
    @State private var showCorrection = false
    @State private var correctionText = ""
    @State private var showActionCard = false
    @State private var confirmEnd = false
    @State private var showMemories = false
    @FocusState private var composerFocused: Bool

    let conversation: ConversationDTO
    let sendDraftOnOpen: Bool

    var body: some View {
        Group {
            if let model {
                content(model)
            } else {
                ProgressView()
            }
        }
        .background(Theme.background.ignoresSafeArea())
        .navigationTitle(conversation.topic.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if state.me?.memoryEnabled == true {
                Button { showMemories = true } label: { Image(systemName: "brain") }
                    .accessibilityLabel("Foreslå minner fra samtalen")
            }
        }
        .sheet(isPresented: $showMemories) {
            NavigationStack { MemorySuggestionsSheet(conversationId: conversation.id) }
        }
        .task {
            guard model == nil else { return }
            let m = ConversationModel(conversation: conversation, service: state.api, drafts: state.drafts)
            model = m
            await m.load()
            if sendDraftOnOpen, m.messages.isEmpty { m.sendDraft() }
        }
        .onChange(of: scenePhase) { _, phase in
            // Utkast lagres fortløpende. Ved retur hentes serverens status, så et brutt svar
            // vises som avbrutt og ikke som ferdig.
            if phase == .active, let model { Task { await model.becameActive() } }
        }
    }

    @ViewBuilder
    private func content(_ model: ConversationModel) -> some View {
        VStack(spacing: 0) {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 12) {
                        ForEach(model.messages) { m in
                            MessageBubble(message: m, isStreaming: m.id == model.streamingMessageId)
                                .id(m.id)
                        }
                        if !model.safetyResources.isEmpty {
                            SafetyResourcesCard(resources: model.safetyResources,
                                                checkedDate: state.resourceConfig?.checkedDate)
                        }
                        if model.ended {
                            Text("Greit. Tråden ligger her hvis du vil.")
                                .font(.callout).foregroundStyle(Theme.textSecondary)
                                .padding(.top, 8)
                        }
                        Color.clear.frame(height: 1).id("bottom")
                    }
                    .padding(16)
                    .frame(maxWidth: 720)
                    .frame(maxWidth: .infinity)
                }
                .scrollDismissesKeyboard(.interactively)
                .onChange(of: model.messages.last?.content) { _, _ in
                    withAnimation(.easeOut(duration: 0.15)) { proxy.scrollTo("bottom", anchor: .bottom) }
                }
            }
            controls(model)
        }
        .sheet(isPresented: $showCorrection) {
            CorrectionSheet(text: $correctionText) {
                model.misunderstood(explanation: correctionText)
                correctionText = ""
                showCorrection = false
            }
            .presentationDetents([.medium, .large])
        }
        .sheet(isPresented: $showActionCard) {
            NavigationStack {
                ActionCardEditor(conversationId: model.conversation.id, basis: model.lastAssistant?.content)
            }
        }
        .confirmationDialog("Avslutte samtalen?", isPresented: $confirmEnd, titleVisibility: .visible) {
            Button("Avslutt") { Task { await model.end(); dismiss() } }
            Button("Bli her", role: .cancel) {}
        } message: {
            Text("Ingen oppfølging, ingen påminnelser.")
        }
        .onChange(of: model.isStreaming) { old, new in
            if old && !new, let last = model.lastAssistant {
                // VoiceOver: si fra når svaret er ferdig eller avbrutt.
                let note = last.incompleteNote ?? "Svaret er ferdig."
                AccessibilityNotification.Announcement(note).post()
            }
        }
    }

    @ViewBuilder
    private func controls(_ model: ConversationModel) -> some View {
        VStack(spacing: 10) {
            if let banner = model.errorBanner {
                HStack(alignment: .top, spacing: 8) {
                    Image(systemName: "exclamationmark.circle").accessibilityHidden(true)
                    Text(banner).frame(maxWidth: .infinity, alignment: .leading)
                    if model.canRetry && !model.isStreaming {
                        Button("Prøv igjen") { model.retry() }
                            .buttonStyle(ChipButtonStyle(accent: Theme.rust))
                            .disabled(!state.network.isOnline)
                    }
                }
                .font(.callout)
                .foregroundStyle(Theme.rust)
                .accessibilityElement(children: .contain)
            } else if model.canRetry && !model.isStreaming {
                Button("Prøv igjen") { model.retry() }
                    .buttonStyle(ChipButtonStyle(accent: Theme.rust))
                    .disabled(!state.network.isOnline)
            }

            if model.isStreaming {
                Button {
                    model.stop()
                } label: {
                    Label("Stopp", systemImage: "stop.circle")
                }
                .buttonStyle(ChipButtonStyle(accent: Theme.rust))
                .accessibilityHint("Stopper svaret som skrives nå.")
            } else if !model.messages.isEmpty {
                actionChips(model)
            }

            Composer(model: model, focused: $composerFocused, online: state.network.isOnline,
                     maxChars: model.isImportMode ? (state.meta?.limits.maxImportChars ?? 20_000)
                                                  : (state.meta?.limits.maxMessageChars ?? 4_000))
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Theme.surface.ignoresSafeArea(edges: .bottom))
    }

    @ViewBuilder
    private func actionChips(_ model: ConversationModel) -> some View {
        let chips = Group {
            Button("Du har misforstått") { showCorrection = true }
                .accessibilityHint("Si fra at vurderingen bommet.")
            Button("Mildere") { model.milder() }
                .accessibilityLabel("Mildere tone")
            Button("Skarpere") { model.sharper() }
                .accessibilityLabel("Skarpere tone")
                .disabled(model.conversation.humorLocked)
            Button("Ett neste steg") { model.nextStep() }
            Button("Lag handlingskort") { showActionCard = true }
            Button("Avslutt") { confirmEnd = true }
        }
        .buttonStyle(ChipButtonStyle())
        .disabled(!state.network.isOnline)

        if typeSize.isAccessibilitySize {
            VStack(alignment: .leading, spacing: 8) { chips }
                .frame(maxWidth: .infinity, alignment: .leading)
        } else {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) { chips }
            }
        }
    }
}

private struct Composer: View {
    let model: ConversationModel
    var focused: FocusState<Bool>.Binding
    let online: Bool
    let maxChars: Int

    var body: some View {
        let binding = Binding(get: { model.draftText }, set: { model.setDraft($0) })
        HStack(alignment: .bottom, spacing: 8) {
            TextField("Svar fritt", text: binding, axis: .vertical)
                .lineLimit(1...6)
                .focused(focused)
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .frame(minHeight: Theme.minTap)
                .background(Theme.surfaceRaised, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(Theme.hairline))
                .accessibilityLabel("Ditt svar")
                .accessibilityHint("Lagres på telefonen mens du skriver.")
                .submitLabel(.send)
            Button {
                model.sendDraft()
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 32))
                    .frame(width: Theme.minTap, height: Theme.minTap)
            }
            .foregroundStyle(Theme.green)
            .disabled(model.isStreaming || !online
                      || model.draftText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                      || model.draftText.count > maxChars)
            .keyboardShortcut(.return, modifiers: .command)
            .accessibilityLabel("Send")
            .accessibilityHint(online ? "" : "Krever nett.")
        }
    }
}

private struct CorrectionSheet: View {
    @Binding var text: String
    let onSend: () -> Void

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 12) {
                Text("Hva er riktig? (valgfritt)")
                    .font(.headline)
                TextField("For eksempel: Det handler ikke om ham, men om meg.", text: $text, axis: .vertical)
                    .lineLimit(3...8)
                    .padding(10)
                    .background(Theme.surfaceRaised, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                Button("Send: Du har misforstått", action: onSend)
                    .buttonStyle(PrimaryButtonStyle())
                Spacer()
            }
            .padding(20)
            .background(Theme.background.ignoresSafeArea())
            .navigationTitle("Du har misforstått")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
