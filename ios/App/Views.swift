import SwiftUI
import RoligCore

struct CheckinView: View {
    @Environment(AppModel.self) private var model
    @State private var mood: Mood?
    @State private var note = ""
    @State private var saved = false

    var body: some View {
        VStack(spacing: 20) {
            Text("Hei. Du er trygg her.").font(.title2)
            Text("Alt blir på denne enheten.").font(.footnote).foregroundStyle(.secondary)
            HStack {
                ForEach(Mood.allCases, id: \.self) { m in
                    Button(m.emoji) { mood = m }
                        .font(.largeTitle)
                        .opacity(mood == nil || mood == m ? 1 : 0.4)
                        .accessibilityLabel("Humør \(m.rawValue) av 5")
                }
            }
            TextField("Vil du skrive noen ord? (valgfritt)", text: $note, axis: .vertical)
                .textFieldStyle(.roundedBorder)
            Button("Lagre sjekk-inn") {
                guard let mood else { return }
                model.checkin(mood, note)
                (self.mood, note, saved) = (nil, "", true)
            }
            .buttonStyle(.borderedProminent)
            .disabled(mood == nil) // replaces web alert()
            if saved { Text("Takk. Det er bra at du sjekket inn.") }
        }
        .padding()
        .sensoryFeedback(.success, trigger: saved)
    }
}

struct BreathView: View {
    @State private var start: Date?
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    private let cycle = BreathCycle()

    var body: some View {
        VStack(spacing: 32) {
            TimelineView(.animation(paused: start == nil)) { ctx in
                let s = cycle.state(elapsed: start.map { ctx.date.timeIntervalSince($0) } ?? 0)
                VStack(spacing: 24) {
                    Circle().fill(.teal.opacity(0.35))
                        .frame(width: 220, height: 220)
                        .scaleEffect(reduceMotion ? 1 : 0.6 + 0.4 * s.scale)
                    Text(start == nil ? "Trykk start" : s.phase.prompt).font(.title3)
                }
            }
            Button(start == nil ? "Start" : "Stopp") { start = start == nil ? .now : nil }
                .buttonStyle(.borderedProminent)
        }
        .onDisappear { start = nil }
    }
}

struct ActionsView: View {
    @Environment(AppModel.self) private var model
    var body: some View {
        List(SmallActions.all.indices, id: \.self) { i in
            Button { model.toggle(i) } label: {
                Label(SmallActions.all[i], systemImage: model.store.isDone(i) ? "checkmark.circle.fill" : "circle")
            }
        }
    }
}

struct HistoryView: View {
    @Environment(AppModel.self) private var model
    var body: some View {
        List {
            Section {
                Text("Du har tatt vare på deg selv \(model.store.countLast7Days()) ganger denne uken.")
                ShareLink("Ta historikken med deg", item: model.store.exportText())
            }
            if model.store.snapshot.checkins.isEmpty {
                Text("Ingen sjekk-ins ennå. Det er greit.").foregroundStyle(.secondary)
            }
            ForEach(model.store.recent()) { c in
                VStack(alignment: .leading) {
                    Text("\(c.date.formatted(.dateTime.weekday().day().month())) · \(c.mood.emoji)")
                    if !c.note.isEmpty { Text(c.note) } // Text never interprets HTML
                }
            }
        }
    }
}
