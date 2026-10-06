import Foundation

enum AppConfig {
    /// Backend-adresse fra Info.plist (APIBaseURL), satt via Support/*.xcconfig.
    static var apiBaseURL: URL {
        let raw = Bundle.main.object(forInfoDictionaryKey: "APIBaseURL") as? String ?? ""
        return URL(string: raw.trimmingCharacters(in: .whitespaces)) ?? URL(string: "http://localhost:8080")!
    }

    /// Sign in with Apple vises bare når capability er lagt til (se docs/TESTFLIGHT.md).
    static var appleSignInEnabled: Bool {
        (Bundle.main.object(forInfoDictionaryKey: "AppleSignInEnabled") as? String) == "YES"
    }
}
