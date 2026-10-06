import SwiftUI

@main
struct AntipsykologenApp: App {
    @State private var state = AppState()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(state)
                .tint(Theme.green)
        }
    }
}

struct RootView: View {
    @Environment(AppState.self) private var state

    var body: some View {
        Group {
            if state.onboarded {
                MainTabView()
            } else {
                IntroView()
            }
        }
        .background(Theme.background.ignoresSafeArea())
        .task { await state.refresh() }
    }
}

struct MainTabView: View {
    @Environment(AppState.self) private var state

    var body: some View {
        TabView {
            NavigationStack { StartView() }
                .tabItem { Label("Start", systemImage: "text.bubble") }
            NavigationStack { HistoryView() }
                .tabItem { Label("Historikk", systemImage: "clock") }
            NavigationStack { ActionCardsView() }
                .tabItem { Label("Handlinger", systemImage: "checklist") }
            NavigationStack { SettingsView() }
                .tabItem { Label("Innstillinger", systemImage: "gearshape") }
        }
        .safeAreaInset(edge: .top, spacing: 0) {
            StatusBanners()
        }
    }
}

/// Tydelige bannere: frakoblet, og testmodus (backend uten ekte modell).
struct StatusBanners: View {
    @Environment(AppState.self) private var state

    var body: some View {
        VStack(spacing: 0) {
            if !state.network.isOnline {
                banner("Du er frakoblet. Utkast lagres på telefonen. Nye svar krever nett.",
                       systemImage: "wifi.slash", color: Theme.rust)
            }
            if let meta = state.meta, !meta.modelBacked {
                banner("Testmodus: serveren bruker ikke en språkmodell. Svarene er faste testsvar.",
                       systemImage: "exclamationmark.triangle", color: Theme.rust)
            }
        }
    }

    private func banner(_ text: String, systemImage: String, color: Color) -> some View {
        Label(text, systemImage: systemImage)
            .font(.footnote.weight(.medium))
            .foregroundStyle(color)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Theme.rustSoft)
            .accessibilityElement(children: .combine)
    }
}
