import SwiftUI

struct MessageBubble: View {
    let message: MessageDTO
    let isStreaming: Bool

    private var kindLabel: String? {
        switch message.kind {
        case .correction: return "Du har misforstått"
        case .toneMilder: return "Mildere, takk"
        case .toneSharper: return "Skarpere, takk"
        case .nextStep: return "Ett konkret neste steg"
        case .import: return "Innlimt tekst"
        case .message: return nil
        }
    }

    var body: some View {
        if message.isAssistant {
            assistant
        } else {
            user
        }
    }

    private var assistant: some View {
        VStack(alignment: .leading, spacing: 6) {
            if message.content.isEmpty && isStreaming {
                HStack(spacing: 8) {
                    ProgressView()
                    Text("Tenker …").foregroundStyle(Theme.textSecondary)
                }
            } else {
                Text(message.content)
                    .font(.body)
                    .foregroundStyle(Theme.textPrimary)
                    .textSelection(.enabled)
            }
            if isStreaming && !message.content.isEmpty {
                Text("Skriver …").font(.caption).foregroundStyle(Theme.textSecondary)
            }
            if let note = message.incompleteNote, !isStreaming {
                Label(note, systemImage: message.status == .failed ? "xmark.circle" : "pause.circle")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(Theme.rust)
            }
            if message.correctedAt != nil {
                Label("Du sa at denne bommet", systemImage: "arrow.uturn.backward")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(alignment: .leading) {
            Rectangle().fill(Theme.green).frame(width: 3).padding(.vertical, 10)
                .accessibilityHidden(true)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(assistantAccessibilityLabel)
    }

    private var assistantAccessibilityLabel: String {
        var parts = ["Antipsykologen:"]
        parts.append(message.content.isEmpty ? "tenker" : message.content)
        if isStreaming { parts.append("Skriver fortsatt.") }
        if let note = message.incompleteNote, !isStreaming { parts.append(note) }
        if message.correctedAt != nil { parts.append("Du har sagt at denne bommet.") }
        return parts.joined(separator: " ")
    }

    private var user: some View {
        VStack(alignment: .trailing, spacing: 4) {
            if let kindLabel {
                Text(kindLabel).font(.caption.weight(.semibold)).foregroundStyle(Theme.rust)
            }
            if !message.content.isEmpty {
                Text(message.content)
                    .font(.body)
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(message.kind == .import ? 12 : nil)
                    .textSelection(.enabled)
            }
        }
        .padding(14)
        .background(Theme.greenSoft, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .frame(maxWidth: .infinity, alignment: .trailing)
        .padding(.leading, 40)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Du: " + [kindLabel, message.content.isEmpty ? nil : message.content].compactMap { $0 }.joined(separator: ". "))
    }
}

/// Verifiserte hjelpetilbud. Vises når samtalen har faresignal.
struct SafetyResourcesCard: View {
    let resources: [ResourceDTO]
    let checkedDate: String?
    @Environment(\.openURL) private var openURL

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Hjelp nå")
                .font(Theme.heading(.title3))
                .accessibilityAddTraits(.isHeader)
            Text("Er noen i fare akkurat nå, ring 113 (helse) eller 112 (politi).")
                .font(.callout.weight(.medium))
            ForEach(resources) { r in
                VStack(alignment: .leading, spacing: 4) {
                    Text(r.name).font(.headline)
                    Text(r.description).font(.subheadline).foregroundStyle(Theme.textSecondary)
                    Text(r.hours).font(.caption).foregroundStyle(Theme.textSecondary)
                    HStack(spacing: 8) {
                        if let tel = r.telURL {
                            Button {
                                openURL(tel)
                            } label: {
                                Label("Ring \(r.phone)", systemImage: "phone")
                            }
                            .buttonStyle(ChipButtonStyle(accent: Theme.rust))
                            .accessibilityLabel("Ring \(r.name), \(r.phone)")
                        }
                        if let chat = r.chatUrl, let url = URL(string: chat) {
                            Link(destination: url) { Label("Chat", systemImage: "bubble.left") }
                                .buttonStyle(ChipButtonStyle())
                                .accessibilityLabel("Chat med \(r.name)")
                        }
                    }
                }
                .padding(.vertical, 4)
            }
            if let checkedDate {
                Text("Kontaktinformasjon kontrollert \(checkedDate). Gjelder Norge.")
                    .font(.caption2).foregroundStyle(Theme.textSecondary)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.rustSoft, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}
