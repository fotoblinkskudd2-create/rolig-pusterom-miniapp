import Foundation

/// Pure, time-driven breath cycle (4s in, 2s hold, 6s out — same as web 1.0).
/// No timers inside: the view asks `phase(at:)` from a TimelineView, so there is
/// no drift and nothing to invalidate when the view disappears.
public struct BreathCycle: Equatable, Sendable {
    public enum Phase: String, CaseIterable, Sendable {
        case inhale, hold, exhale
        public var prompt: String {
            switch self {
            case .inhale: "Pust inn…"
            case .hold: "Hold…"
            case .exhale: "Pust ut…"
            }
        }
    }

    public let inhale: TimeInterval
    public let hold: TimeInterval
    public let exhale: TimeInterval

    public init(inhale: TimeInterval = 4, hold: TimeInterval = 2, exhale: TimeInterval = 6) {
        precondition(inhale > 0 && hold >= 0 && exhale > 0, "durations must be positive")
        self.inhale = inhale
        self.hold = hold
        self.exhale = exhale
    }

    public var period: TimeInterval { inhale + hold + exhale }

    /// Phase and 0...1 circle scale progress for elapsed seconds since start.
    public func state(elapsed: TimeInterval) -> (phase: Phase, scale: Double) {
        let t = max(0, elapsed).truncatingRemainder(dividingBy: period)
        if t < inhale { return (.inhale, t / inhale) }
        if t < inhale + hold { return (.hold, 1) }
        return (.exhale, 1 - (t - inhale - hold) / exhale)
    }
}
