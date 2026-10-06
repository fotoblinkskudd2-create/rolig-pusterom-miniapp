import SwiftUI
import AuthenticationServices
import UIKit

struct SettingsView: View {
    @Environment(AppState.self) private var state
    @State private var error: String?
    @State private var exportURL: URL?
    @State private var exporting = false
    @State private var confirmDeleteAccount = false

    var body: some View {
        Form {
            if let me = state.me {
                Section("Tone") {
                    Picker("Standardtone", selection: binding(me.tone) { await save(tone: $0) }) {
                        ForEach(Tone.allCases) { Text($0.title).tag($0) }
                    }
                    Toggle("Mørk humor", isOn: binding(me.darkHumor) { await save(darkHumor: $0) })
                        .frame(minHeight: Theme.minTap)
                    Text("Gjelder nye samtaler. Humor slås alltid av når en samtale handler om fare.")
                        .font(.footnote).foregroundStyle(Theme.textSecondary)
                }

                Section {
                    Toggle("Lagre samtaler i historikk", isOn: binding(me.historyEnabled) { await save(history: $0) })
                        .frame(minHeight: Theme.minTap)
                    Toggle("Langtidsminne", isOn: binding(me.memoryEnabled) { await save(memory: $0) })
                        .frame(minHeight: Theme.minTap)
                    NavigationLink("Se og rediger minner") { MemoriesView() }
                        .disabled(!me.memoryEnabled)
                } header: {
                    Text("Personvern og minne")
                } footer: {
                    Text("Minne brukes bare når du har slått det på, og bare det du selv har lagret. Du kan se, rette og slette hvert minne.")
                }
            } else {
                Section { ProgressView() }
            }

            Section("Personvern") {
                NavigationLink("Hva lagres, og hvor") { PrivacyView() }
                Button {
                    Task { await export() }
                } label: {
                    if exporting { ProgressView() } else { Text("Eksporter mine data") }
                }
                .frame(minHeight: Theme.minTap)
                if let exportURL {
                    ShareLink("Del eksportfilen", item: exportURL)
                }
            }

            if AppConfig.appleSignInEnabled, state.me?.signedInWithApple == false {
                Section {
                    SignInWithAppleButton(.signIn) { req in
                        state.auth.prepareAppleRequest(req)
                    } onCompletion: { result in
                        Task {
                            do {
                                try await state.auth.completeApple(result, api: state.api)
                                state.me = try await state.api.me()
                            } catch {
                                self.error = "Innlogging med Apple feilet."
                            }
                        }
                    }
                    .frame(minHeight: Theme.minTap)
                } footer: {
                    Text("Valgfritt. Knytter kontoen til Apple-ID-en din så den kan gjenopprettes.")
                }
            }

            Section("Tilgjengelighet") {
                Text("Appen følger systemets tekststørrelse, mørk modus, VoiceOver og Reduser bevegelse. Endre dem i Innstillinger → Tilgjengelighet.")
                    .font(.footnote)
                Button("Åpne systeminnstillinger") {
                    if let url = URL(string: UIApplication.openSettingsURLString) { UIApplication.shared.open(url) }
                }
                .frame(minHeight: Theme.minTap)
            }

            Section {
                Button("Slett konto og alle data", role: .destructive) { confirmDeleteAccount = true }
                    .frame(minHeight: Theme.minTap)
            } footer: {
                Text("Sletter samtaler, minner, handlingskort og konto fra serveren, og utkast fra telefonen.")
            }

            if let error {
                Section { Text(error).foregroundStyle(Theme.rust) }
            }
        }
        .scrollContentBackground(.hidden)
        .background(Theme.background)
        .navigationTitle("Innstillinger")
        .confirmationDialog("Slette kontoen?", isPresented: $confirmDeleteAccount, titleVisibility: .visible) {
            Button("Slett alt", role: .destructive) { Task { await deleteAccount() } }
        } message: {
            Text("Kan ikke angres.")
        }
        .task {
            if state.me == nil { state.me = try? await state.api.me() }
        }
    }

    private func binding<T>(_ value: T, set: @escaping (T) async -> Void) -> Binding<T> {
        Binding(get: { value }, set: { new in Task { await set(new) } })
    }

    private func save(tone: Tone? = nil, darkHumor: Bool? = nil, history: Bool? = nil, memory: Bool? = nil) async {
        do {
            state.me = try await state.api.updateMe(tone: tone, darkHumor: darkHumor, historyEnabled: history, memoryEnabled: memory)
            error = nil
        } catch {
            self.error = APIError.from(error).userMessage
        }
    }

    private func export() async {
        exporting = true
        defer { exporting = false }
        do {
            let data = try await state.api.exportData()
            let url = FileManager.default.temporaryDirectory.appendingPathComponent("antipsykologen-eksport.json")
            try data.write(to: url, options: [.atomic, .completeFileProtection])
            exportURL = url
        } catch {
            self.error = APIError.from(error).userMessage
        }
    }

    private func deleteAccount() async {
        do {
            try await state.api.deleteAccount()
            if let exportURL { try? FileManager.default.removeItem(at: exportURL) }
            state.resetAfterAccountDeletion()
        } catch {
            self.error = APIError.from(error).userMessage
        }
    }
}

struct MemoriesView: View {
    @Environment(AppState.self) private var state
    @State private var memories: [MemoryDTO] = []
    @State private var newText = ""
    @State private var editing: MemoryDTO?
    @State private var error: String?
    @State private var confirmDeleteAll = false

    var body: some View {
        List {
            Section {
                TextField("Noe Antipsykologen bør huske", text: $newText, axis: .vertical)
                Button("Lagre minne") { Task { await add() } }
                    .disabled(newText.trimmingCharacters(in: .whitespaces).isEmpty)
                    .frame(minHeight: Theme.minTap)
            } footer: {
                Text("Minner sendes med i nye samtaler. Minner laget fra en samtale slettes når samtalen slettes.")
            }
            Section("Lagrede minner") {
                if memories.isEmpty { Text("Ingen minner.").foregroundStyle(Theme.textSecondary) }
                ForEach(memories) { m in
                    Button {
                        editing = m
                    } label: {
                        VStack(alignment: .leading) {
                            Text(m.content).foregroundStyle(Theme.textPrimary)
                            if m.sourceConversationId != nil {
                                Text("Fra en samtale").font(.caption).foregroundStyle(Theme.textSecondary)
                            }
                        }
                    }
                    .accessibilityHint("Trykk for å rette.")
                }
                .onDelete { idx in Task { await delete(idx) } }
            }
            if !memories.isEmpty {
                Button("Slett alle minner", role: .destructive) { confirmDeleteAll = true }
            }
            if let error { Text(error).foregroundStyle(Theme.rust) }
        }
        .scrollContentBackground(.hidden)
        .background(Theme.background)
        .navigationTitle("Minner")
        .sheet(item: $editing) { m in
            MemoryEditSheet(memory: m) { text in
                Task {
                    do {
                        let updated = try await state.api.updateMemory(id: m.id, content: text)
                        if let i = memories.firstIndex(where: { $0.id == m.id }) { memories[i] = updated }
                    } catch { self.error = APIError.from(error).userMessage }
                }
            }
        }
        .confirmationDialog("Slette alle minner?", isPresented: $confirmDeleteAll, titleVisibility: .visible) {
            Button("Slett alle", role: .destructive) {
                Task {
                    do { try await state.api.deleteAllMemories(); memories = [] } catch { self.error = APIError.from(error).userMessage }
                }
            }
        }
        .task { await load() }
    }

    private func load() async {
        do { memories = try await state.api.memories() } catch { error = APIError.from(error).userMessage }
    }

    private func add() async {
        do {
            let m = try await state.api.createMemory(content: newText, sourceConversationId: nil)
            memories.append(m)
            newText = ""
        } catch { self.error = APIError.from(error).userMessage }
    }

    private func delete(_ idx: IndexSet) async {
        for i in idx {
            do { try await state.api.deleteMemory(id: memories[i].id) } catch { self.error = APIError.from(error).userMessage; return }
        }
        memories.remove(atOffsets: idx)
    }
}

private struct MemoryEditSheet: View {
    @Environment(\.dismiss) private var dismiss
    let memory: MemoryDTO
    let onSave: (String) -> Void
    @State private var text = ""

    var body: some View {
        NavigationStack {
            Form { TextField("Minne", text: $text, axis: .vertical) }
                .navigationTitle("Rett minne")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("Avbryt") { dismiss() } }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Lagre") { onSave(text); dismiss() }
                            .disabled(text.trimmingCharacters(in: .whitespaces).isEmpty)
                    }
                }
                .onAppear { text = memory.content }
        }
    }
}

struct PrivacyView: View {
    @Environment(AppState.self) private var state

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                section("På telefonen",
                        "Utkast du skriver lagres lokalt, kryptert av iOS, og tas ikke med i iCloud-sikkerhetskopi. En enhetsnøkkel ligger i nøkkelringen (Keychain). Ingen API-nøkler til språkmodellen finnes i appen.")
                section("På serveren",
                        "Meldinger, svar, handlingskort og minner du har lagret. Med historikk av slettes samtaler automatisk \(Int(state.meta?.ephemeralTtlHours ?? 24)) timer etter siste melding. Logger inneholder ikke samtaletekst.")
                section("Hos modellleverandøren",
                        "For å lage svar sendes samtalen (eller et sammendrag), dine lagrede minner og systeminstruksen til Anthropic. Leverandørens egne vilkår for lagring og bruk gjelder. Vi lover ikke mer konfidensialitet enn det infrastrukturen kan dokumentere.")
                section("Sletting",
                        "Du kan slette enkeltsamtaler, all historikk, enkeltminner, alle minner og hele kontoen. Sletting fjerner også minner og sammendrag laget fra samtalen.")
                section("Ikke helsehjelp",
                        "Antipsykologen er et refleksjonsverktøy, ikke en psykolog, lege eller krisetjeneste. Er noen i fare: ring 113.")
            }
            .padding(20)
        }
        .background(Theme.background)
        .navigationTitle("Personvern")
    }

    private func section(_ title: String, _ body: String) -> some View {
        Card {
            Text(title).font(.headline).accessibilityAddTraits(.isHeader)
            Text(body).font(.body).foregroundStyle(Theme.textSecondary)
        }
    }
}
