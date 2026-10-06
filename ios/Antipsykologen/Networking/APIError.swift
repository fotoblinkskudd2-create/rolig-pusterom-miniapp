import Foundation

/// Feil vist til brukeren. Meldingene er på norsk og sier hva som skjedde med teksten.
enum APIError: Error, Equatable, LocalizedError {
    case offline
    case connectionLost
    case timeout
    case unauthorized
    case server(status: Int, code: String, message: String, retryable: Bool)
    case invalidResponse

    var errorDescription: String? { userMessage }

    var userMessage: String {
        switch self {
        case .offline:
            return "Du er uten nett. Teksten din er lagret. Nye svar krever nett."
        case .connectionLost:
            return "Forbindelsen ble brutt. Teksten din er lagret. Prøv igjen når du har nett."
        case .timeout:
            return "Serveren svarte ikke i tide. Teksten din er lagret."
        case .unauthorized:
            return "Innloggingen har utløpt. Prøv igjen."
        case let .server(_, _, message, _):
            return message
        case .invalidResponse:
            return "Fikk et uventet svar fra serveren. Prøv igjen."
        }
    }

    var isRetryable: Bool {
        switch self {
        case .offline, .connectionLost, .timeout, .invalidResponse: return true
        case .unauthorized: return true
        case let .server(_, _, _, retryable): return retryable
        }
    }

    var code: String {
        switch self {
        case .offline: return "offline"
        case .connectionLost: return "connection_lost"
        case .timeout: return "timeout"
        case .unauthorized: return "unauthorized"
        case let .server(_, code, _, _): return code
        case .invalidResponse: return "invalid_response"
        }
    }

    /// Oversetter URLSession-feil til noe brukeren forstår.
    static func from(_ error: Error) -> APIError {
        if let e = error as? APIError { return e }
        if let u = error as? URLError {
            switch u.code {
            case .notConnectedToInternet, .dataNotAllowed, .internationalRoamingOff:
                return .offline
            case .networkConnectionLost, .cannotConnectToHost, .cannotFindHost, .dnsLookupFailed,
                 .secureConnectionFailed:
                return .connectionLost
            case .timedOut:
                return .timeout
            default:
                return .connectionLost
            }
        }
        return .invalidResponse
    }
}
