import SwiftUI
import UIKit

/// Varm grå bakgrunn, mørk grønn, rustfargede detaljer. Lys og mørk variant.
enum Theme {
    static let background = dynamic(light: 0xEEEBE6, dark: 0x1C1B19)
    static let surface = dynamic(light: 0xF8F6F2, dark: 0x282623)
    static let surfaceRaised = dynamic(light: 0xFFFFFF, dark: 0x32302C)
    static let green = dynamic(light: 0x23453A, dark: 0x8DBFA8)
    static let greenSoft = dynamic(light: 0xDCE6E0, dark: 0x2B3B34)
    static let rust = dynamic(light: 0x9A4A24, dark: 0xE08A57)
    static let rustSoft = dynamic(light: 0xF2E1D6, dark: 0x3D2A20)
    static let textPrimary = Color(uiColor: .label)
    static let textSecondary = dynamic(light: 0x55524C, dark: 0xB5B0A7)
    static let hairline = dynamic(light: 0xD8D3CB, dark: 0x3A3733)

    /// Minste trykkflate (Apple HIG: 44 pt).
    static let minTap: CGFloat = 44

    static func heading(_ style: Font.TextStyle = .title) -> Font {
        .system(style, design: .serif).weight(.semibold)
    }

    private static func dynamic(light: UInt32, dark: UInt32) -> Color {
        Color(uiColor: UIColor { traits in
            UIColor(hex: traits.userInterfaceStyle == .dark ? dark : light)
        })
    }
}

extension UIColor {
    convenience init(hex: UInt32) {
        self.init(red: CGFloat((hex >> 16) & 0xFF) / 255,
                  green: CGFloat((hex >> 8) & 0xFF) / 255,
                  blue: CGFloat(hex & 0xFF) / 255,
                  alpha: 1)
    }
}

/// Primærknapp: mørk grønn, stor trykkflate.
struct PrimaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .frame(maxWidth: .infinity, minHeight: Theme.minTap)
            .padding(.horizontal, 16)
            .foregroundStyle(Theme.background)
            .background(Theme.green.opacity(isEnabled ? (configuration.isPressed ? 0.8 : 1) : 0.4),
                        in: RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

/// Sekundærknapp / kontrollbrikke.
struct ChipButtonStyle: ButtonStyle {
    var accent: Color = Theme.green
    @Environment(\.isEnabled) private var isEnabled
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.medium))
            .multilineTextAlignment(.center)
            .frame(minHeight: Theme.minTap)
            .padding(.horizontal, 14)
            .foregroundStyle(accent.opacity(isEnabled ? 1 : 0.4))
            .background(Theme.surfaceRaised.opacity(configuration.isPressed ? 0.6 : 1),
                        in: RoundedRectangle(cornerRadius: 10, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).stroke(Theme.hairline))
    }
}

struct Card<Content: View>: View {
    @ViewBuilder var content: Content
    var body: some View {
        VStack(alignment: .leading, spacing: 8) { content }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Theme.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}
