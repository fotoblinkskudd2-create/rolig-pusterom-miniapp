import SwiftUI

/// Kort introduksjon: hva produktet er, tone, og om historikk skal lagres.
struct IntroView: View {
    @Environment(AppState.self) private var state
    @State private var tone: Tone = .torr
    @State private var darkHumor = false
    @State private var saveHistory = false
    @State private var working = false
    @State private var error: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Antipsykologen")
                        .font(Theme.heading(.largeTitle))
                        .foregroundStyle(Theme.green)
                        .accessibilityAddTraits(.isHeader)
                    Text("Du har forklart det. Hva gjør du nå?")
                        .font(.title3.weight(.medium))
                        .foregroundStyle(Theme.rust)
                    Text("Et refleksjonsverktøy med tørre spørsmål og små, konkrete handlinger. Ikke en psykolog. Ikke en krisetjeneste. Er noen i fare, ring 113.")
                        .font(.body)
                        .foregroundStyle(Theme.textSecondary)
                }

                VStack(alignment: .leading, spacing: 10) {
                    Text("Tone").font(.headline)
                    Picker("Tone", selection: $tone) {
                        ForEach(Tone.allCases) { Text($0.title).tag($0) }
                    }
                    .pickerStyle(.segmented)
                    Text(tone.explanation).font(.subheadline).foregroundStyle(Theme.textSecondary)
                    Toggle("Mørk humor", isOn: $darkHumor)
                        .frame(minHeight: Theme.minTap)
                    Text("Slås av automatisk hvis samtalen handler om fare.")
                        .font(.footnote).foregroundStyle(Theme.textSecondary)
                }

                VStack(alignment: .leading, spacing: 10) {
                    Toggle("Lagre samtaler i historikk", isOn: $saveHistory)
                        .frame(minHeight: Theme.minTap)
                    Text(saveHistory
                         ? "Samtaler lagres på serveren til du sletter dem."
                         : "Samtaler lagres bare midlertidig på serveren (slettes automatisk etter et døgn) og vises ikke i historikk.")
                        .font(.footnote).foregroundStyle(Theme.textSecondary)
                    Text("Teksten du skriver sendes til en språkmodell hos Anthropic for å lage svar. Se Personvern i innstillinger.")
                        .font(.footnote).foregroundStyle(Theme.textSecondary)
                }

                if let error {
                    Text(error).font(.callout).foregroundStyle(Theme.rust)
                }

                Button {
                    Task { await begin() }
                } label: {
                    if working { ProgressView().tint(Theme.background) } else { Text("Start") }
                }
                .buttonStyle(PrimaryButtonStyle())
                .disabled(working)
            }
            .padding(20)
            .frame(maxWidth: 640)
            .frame(maxWidth: .infinity)
        }
        .background(Theme.background.ignoresSafeArea())
    }

    private func begin() async {
        working = true
        defer { working = false }
        do {
            try await state.auth.ensureAccount(api: state.api)
            state.me = try await state.api.updateMe(tone: tone, darkHumor: darkHumor, historyEnabled: saveHistory, memoryEnabled: false)
            state.setOnboarded(true)
        } catch {
            self.error = APIError.from(error).userMessage
        }
    }
}
