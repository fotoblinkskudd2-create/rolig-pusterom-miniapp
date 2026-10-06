import Foundation

// API-kontrakt: se docs/API.md. Alle ID-er er UUID-strenger fra serveren.

enum MessageStatus: String, Codable, Sendable {
    case created, generating, completed, cancelled, failed

    /// Norsk betegnelse for skjermleser og statuslinje.
    var label: String {
        switch self {
        case .created: return "Opprettet"
        case .generating: return "Skriver"
        case .completed: return "Fullført"
        case .cancelled: return "Avbrutt"
        case .failed: return "Feilet"
        }
    }
}

enum MessageKind: String, Codable, Sendable {
    case message, `import`, correction
    case toneMilder = "tone_milder"
    case toneSharper = "tone_sharper"
    case nextStep = "next_step"
}

enum Topic: String, Codable, CaseIterable, Identifiable, Sendable {
    case parforhold, arbeid, utsettelse, annet
    var id: String { rawValue }
    var title: String {
        switch self {
        case .parforhold: return "Parforhold"
        case .arbeid: return "Arbeid og grenser"
        case .utsettelse: return "Utsettelse og egne mønstre"
        case .annet: return "Noe annet"
        }
    }
    var subtitle: String {
        switch self {
        case .parforhold: return "Krangel, avstand, ansvar, grenser."
        case .arbeid: return "Ja til alt, nei til ingenting."
        case .utsettelse: return "Du vet hva du skal. Du gjør noe annet."
        case .annet: return "Fritt."
        }
    }
}

enum Tone: String, Codable, CaseIterable, Identifiable, Sendable {
    case mild, torr, skarp
    var id: String { rawValue }
    var title: String {
        switch self {
        case .mild: return "Mild"
        case .torr: return "Tørr"
        case .skarp: return "Skarp"
        }
    }
    var explanation: String {
        switch self {
        case .mild: return "Varm og rolig. Fortsatt ærlig."
        case .torr: return "Korte setninger. Litt tørr humor."
        case .skarp: return "Direkte. Påpeker motsetninger."
        }
    }
}

struct MessageDTO: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let conversationId: String
    let seq: Int
    let role: String
    let kind: MessageKind
    var content: String
    var status: MessageStatus
    var incompleteReason: String?
    var errorCode: String?
    let clientMessageId: String?
    let replyTo: String?
    var correctedAt: String?
    var safetyLevel: String?
    var generatedBy: String?
    let createdAt: String

    var isAssistant: Bool { role == "assistant" }

    /// Tekst som forklarer hvorfor et svar ikke er helt, eller nil.
    var incompleteNote: String? {
        switch (status, incompleteReason) {
        case (.cancelled, "user_cancelled"?): return "Avbrutt – du stoppet svaret."
        case (.cancelled, "client_disconnected"?), (.cancelled, "connection_lost"?):
            return "Avbrutt – forbindelsen ble brutt."
        case (.cancelled, "superseded"?): return "Avbrutt – erstattet av et nytt forsøk."
        case (.cancelled, "server_restart"?), (.failed, "server_restart"?): return "Avbrutt – tjenesten startet på nytt."
        case (.cancelled, _), (.failed, "timeout"?): return status == .cancelled ? "Avbrutt." : "Feilet – tok for lang tid."
        case (.completed, "max_tokens"?): return "Ufullstendig – svaret ble for langt og ble kuttet."
        case (.failed, _): return "Feilet. Ingen svar ble lagret."
        default: return nil
        }
    }
}

struct ConversationDTO: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let topic: Topic
    var title: String?
    var tone: Tone
    var darkHumor: Bool
    let persisted: Bool
    let expiresAt: String?
    var safetyLevel: String
    var closedAt: String?
    let createdAt: String
    var updatedAt: String
    var messageCount: Int?

    var humorLocked: Bool { safetyLevel == "concern" || safetyLevel == "acute" }
}

struct ConversationDetail: Codable, Sendable {
    let conversation: ConversationDTO
    let messages: [MessageDTO]
}

struct ConversationList: Codable, Sendable { let conversations: [ConversationDTO] }

struct MeDTO: Codable, Equatable, Sendable {
    let id: String
    let signedInWithApple: Bool
    var tone: Tone
    var darkHumor: Bool
    var historyEnabled: Bool
    var memoryEnabled: Bool
}

struct MemoryDTO: Codable, Identifiable, Equatable, Sendable {
    let id: String
    var content: String
    let sourceConversationId: String?
    let createdAt: String
}
struct MemoryList: Codable, Sendable { let memories: [MemoryDTO] }
struct MemorySuggestions: Codable, Sendable {
    let suggestions: [String]
    let sourceConversationId: String
}

struct ActionCardDraft: Codable, Equatable, Sendable {
    var what: String
    var when: String
    var doneWhen: String
    var ifStuck: String
}
struct ActionCardDraftResponse: Codable, Sendable {
    let draft: ActionCardDraft
    let modelBacked: Bool
}

enum ActionCardStatus: String, Codable, CaseIterable, Sendable {
    case open, done
    case setAside = "set_aside"
    var label: String {
        switch self {
        case .open: return "Åpen"
        case .done: return "Gjort"
        case .setAside: return "Lagt bort"
        }
    }
}

struct ActionCardDTO: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let conversationId: String?
    var what: String
    var when: String
    var doneWhen: String
    var ifStuck: String
    var status: ActionCardStatus
    let createdAt: String
}
struct ActionCardList: Codable, Sendable { let actionCards: [ActionCardDTO] }

struct ResourceDTO: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let name: String
    let phone: String
    let chatUrl: String?
    let hours: String
    let description: String
    let source: String

    var telURL: URL? { URL(string: "tel:" + phone.replacingOccurrences(of: " ", with: "")) }
}

struct ResourceConfig: Codable, Sendable {
    let country: String
    let checkedDate: String
    let outsideNorway: String
    let resources: [ResourceDTO]
}

struct MetaDTO: Codable, Sendable {
    struct Limits: Codable, Sendable {
        let maxMessageChars: Int
        let maxImportChars: Int
    }
    let provider: String
    let modelBacked: Bool
    let chatModel: String
    let limits: Limits
    let ephemeralTtlHours: Double
    let resources: ResourceConfig
}

struct AuthResponse: Codable, Sendable {
    let userId: String
    let refreshToken: String?
    let accessToken: String
    let accessExpiresAt: String
}

struct APIErrorBody: Codable, Sendable {
    struct Inner: Codable, Sendable {
        let code: String
        let message: String
        let retryable: Bool?
    }
    let error: Inner
}

/// Hendelser i en strømmet samtale (SSE fra POST /v1/conversations/:id/messages).
enum StreamEvent: Equatable, Sendable {
    case userMessage(MessageDTO, replay: Bool)
    case assistantMessage(MessageDTO)
    case delta(String)
    case safety(level: String, resources: [ResourceDTO])
    case error(code: String, message: String, retryable: Bool)
    case done(MessageDTO)
}

enum ISODate {
    static func parse(_ s: String) -> Date? {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let d = f.date(from: s) { return d }
        f.formatOptions = [.withInternetDateTime]
        return f.date(from: s)
    }
}
