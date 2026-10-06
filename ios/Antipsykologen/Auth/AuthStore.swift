import Foundation
import AuthenticationServices
import CryptoKit

/// Holder på innloggingen.
/// - Enhetsnøkkel (refresh token) ligger i Keychain.
/// - Tilgangstoken (kortlivet) ligger bare i minnet.
@MainActor
@Observable
final class AuthStore {
    private static let refreshAccount = "refreshToken"

    private(set) var userId: String? = nil
    @ObservationIgnored private var accessToken: String? = nil
    @ObservationIgnored private var accessExpiresAt: Date? = nil
    @ObservationIgnored private var refreshInFlight: Task<String, Error>? = nil

    var hasAccount: Bool { Keychain.get(Self.refreshAccount) != nil }

    /// Gir et gyldig tilgangstoken; oppretter anonym konto hvis enheten ikke har en.
    func accessToken(api: APIClient, forceRefresh: Bool = false) async throws -> String {
        if !forceRefresh, let token = accessToken, let exp = accessExpiresAt, exp.timeIntervalSinceNow > 30 {
            return token
        }
        if let running = refreshInFlight { return try await running.value }
        let task = Task<String, Error> { @MainActor in
            defer { self.refreshInFlight = nil }
            if let refresh = Keychain.get(Self.refreshAccount) {
                struct Body: Encodable { let refreshToken: String }
                do {
                    let r: AuthResponse = try await api.postUnauthenticated("/v1/auth/token", body: Body(refreshToken: refresh))
                    self.apply(r)
                    return r.accessToken
                } catch APIError.unauthorized {
                    // Nøkkelen er trukket tilbake (f.eks. konto slettet på annen måte).
                    Keychain.delete(Self.refreshAccount)
                    throw APIError.unauthorized
                }
            }
            let r: AuthResponse = try await api.postUnauthenticated("/v1/auth/anonymous", body: EmptyBody())
            try self.store(r)
            return r.accessToken
        }
        refreshInFlight = task
        return try await task.value
    }

    func ensureAccount(api: APIClient) async throws {
        _ = try await accessToken(api: api)
    }

    private func store(_ r: AuthResponse) throws {
        if let refresh = r.refreshToken { try Keychain.set(refresh, for: Self.refreshAccount) }
        apply(r)
    }

    private func apply(_ r: AuthResponse) {
        userId = r.userId
        accessToken = r.accessToken
        accessExpiresAt = ISODate.parse(r.accessExpiresAt)
    }

    /// Fjerner alt lokalt om kontoen (etter kontosletting eller utlogging).
    func signOutLocally() {
        Keychain.delete(Self.refreshAccount)
        accessToken = nil
        accessExpiresAt = nil
        userId = nil
    }

    // MARK: - Sign in with Apple (valgfritt; krever capability og APPLE_BUNDLE_ID på serveren)

    @ObservationIgnored private(set) var currentNonce: String? = nil

    func prepareAppleRequest(_ request: ASAuthorizationAppleIDRequest) {
        let nonce = Self.randomNonce()
        currentNonce = nonce
        request.requestedScopes = []
        request.nonce = SHA256.hash(data: Data(nonce.utf8)).map { String(format: "%02x", $0) }.joined()
    }

    func completeApple(_ result: Result<ASAuthorization, Error>, api: APIClient) async throws {
        guard case let .success(auth) = result,
              let credential = auth.credential as? ASAuthorizationAppleIDCredential,
              let tokenData = credential.identityToken,
              let identityToken = String(data: tokenData, encoding: .utf8),
              let nonce = currentNonce else {
            throw APIError.unauthorized
        }
        struct Body: Encodable { let identityToken: String; let rawNonce: String }
        // Sender nåværende tilgangstoken slik at en anonym konto kobles til Apple-ID-en.
        let bearer = try? await accessToken(api: api)
        let r: AuthResponse = try await api.postUnauthenticated(
            "/v1/auth/apple", body: Body(identityToken: identityToken, rawNonce: nonce), bearer: bearer)
        try store(r)
    }

    private static func randomNonce(length: Int = 32) -> String {
        var bytes = [UInt8](repeating: 0, count: length)
        _ = SecRandomCopyBytes(kSecRandomDefault, length, &bytes)
        return Data(bytes).base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}
