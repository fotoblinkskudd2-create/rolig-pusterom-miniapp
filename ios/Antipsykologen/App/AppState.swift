import Foundation
import SwiftUI

/// Felles avhengigheter for appen.
@MainActor
@Observable
final class AppState {
    let auth: AuthStore
    let api: APIClient
    let drafts: DraftStore
    let network: NetworkMonitor

    var me: MeDTO? = nil
    var meta: MetaDTO? = nil
    /// Lokalt flagg: introduksjonen er fullført på denne enheten.
    private(set) var onboarded: Bool

    func setOnboarded(_ value: Bool) {
        onboarded = value
        UserDefaults.standard.set(value, forKey: "onboarded")
    }

    init() {
        let auth = AuthStore()
        self.auth = auth
        self.api = APIClient(baseURL: AppConfig.apiBaseURL, auth: auth)
        self.drafts = DraftStore()
        self.network = NetworkMonitor()
        self.onboarded = UserDefaults.standard.bool(forKey: "onboarded") && auth.hasAccount
    }

    /// Henter profil og serverinfo. Feil her er ikke fatale (appen kan vise utkast offline).
    func refresh() async {
        let fetchedMeta = try? await api.meta()
        if let fetchedMeta { meta = fetchedMeta }
        guard onboarded else { return }
        let fetchedMe = try? await api.me()
        if let fetchedMe { me = fetchedMe }
    }

    /// Hjelpetilbud: fra serveren, ellers fra kopien i appen (virker uten nett).
    var resourceConfig: ResourceConfig? {
        if let meta { return meta.resources }
        guard let url = Bundle.main.url(forResource: "hjelpetilbud.no", withExtension: "json"),
              let data = try? Data(contentsOf: url) else { return nil }
        return try? JSONDecoder().decode(ResourceConfig.self, from: data)
    }

    func resetAfterAccountDeletion() {
        auth.signOutLocally()
        drafts.removeAll()
        me = nil
        setOnboarded(false)
    }
}
