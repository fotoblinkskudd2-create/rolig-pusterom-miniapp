import Foundation

/// Inkrementell parser for Server-Sent Events.
/// Mates med én linje om gangen (uten linjeskift). Tomme linjer avslutter en hendelse.
struct SSEParser {
    struct RawEvent: Equatable {
        var event: String
        var data: String
    }

    private var eventName = ""
    private var dataLines: [String] = []

    mutating func consume(line rawLine: String) -> RawEvent? {
        let line = rawLine.hasSuffix("\r") ? String(rawLine.dropLast()) : rawLine
        if line.isEmpty {
            defer { eventName = ""; dataLines = [] }
            guard !dataLines.isEmpty else { return nil }
            return RawEvent(event: eventName.isEmpty ? "message" : eventName, data: dataLines.joined(separator: "\n"))
        }
        if line.hasPrefix(":") { return nil } // kommentar / hjerteslag
        let (field, value) = Self.split(line)
        switch field {
        case "event": eventName = value
        case "data": dataLines.append(value)
        default: break
        }
        return nil
    }

    private static func split(_ line: String) -> (String, String) {
        guard let idx = line.firstIndex(of: ":") else { return (line, "") }
        let field = String(line[..<idx])
        var value = String(line[line.index(after: idx)...])
        if value.hasPrefix(" ") { value.removeFirst() }
        return (field, value)
    }

    /// Oversetter en rå hendelse til en typet StreamEvent. Ukjente hendelser ignoreres.
    static func decode(_ raw: RawEvent) throws -> StreamEvent? {
        let data = Data(raw.data.utf8)
        let dec = JSONDecoder()
        struct MessageWrap: Decodable { let message: MessageDTO; let replay: Bool? }
        struct Delta: Decodable { let text: String }
        struct Safety: Decodable { let level: String; let resources: [ResourceDTO] }
        struct Err: Decodable { let code: String?; let message: String; let retryable: Bool? }
        switch raw.event {
        case "user_message":
            let w = try dec.decode(MessageWrap.self, from: data)
            return .userMessage(w.message, replay: w.replay ?? false)
        case "assistant_message":
            return .assistantMessage(try dec.decode(MessageWrap.self, from: data).message)
        case "delta":
            return .delta(try dec.decode(Delta.self, from: data).text)
        case "safety":
            let s = try dec.decode(Safety.self, from: data)
            return .safety(level: s.level, resources: s.resources)
        case "error":
            let e = try dec.decode(Err.self, from: data)
            return .error(code: e.code ?? "unknown", message: e.message, retryable: e.retryable ?? false)
        case "done":
            return .done(try dec.decode(MessageWrap.self, from: data).message)
        default:
            return nil
        }
    }
}

/// Splitter en bytestrøm i linjer uten å miste tomme linjer
/// (AsyncBytes.lines hopper over tomme linjer, som SSE trenger).
struct LineSplitter {
    private var buffer: [UInt8] = []

    mutating func push(_ byte: UInt8) -> String? {
        if byte == 0x0A {
            defer { buffer.removeAll(keepingCapacity: true) }
            return String(decoding: buffer, as: UTF8.self)
        }
        buffer.append(byte)
        return nil
    }
}
