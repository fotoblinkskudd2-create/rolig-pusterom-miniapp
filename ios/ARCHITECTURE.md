# Rolig iOS – arkitekturprototype (iterasjon 1)

## Mål (objective declaration)

| Felt | Verdi |
|---|---|
| Mål | Port web 1.0 (4 sider, lokal lagring) til native iOS uten å miste data eller «lokal-first»-løftet |
| Suksesskriterie | Kjerne kompilerer med strict concurrency + warnings-as-errors, alle tester grønne, 0 treff på deprecated-scan |
| Ikke-mål | Sky, konto, Isolation Mirror, widgets, HealthKit |
| Min. iOS | Kjerne: iOS 17. App-skall: iOS 18 (`Tab`-API) |

## Struktur

```
ios/
  Package.swift            SwiftPM, RoligCore + tester (macOS + Linux CI)
  Sources/RoligCore/       Models · Breath · Store  (kun Foundation)
  Tests/RoligCoreTests/    8 XCTest-caser
  App/                     SwiftUI-skall, bygges kun i Xcode
```

## Beslutningsmatrise

| # | Beslutning | Valgt | Forkastet | Begrunnelse / evidens |
|---|---|---|---|---|
| D1 | Lagdeling | Foundation-kjerne + tynt SwiftUI-skall | Alt i app-target | Kjernen kan testes på Linux. Begge bugs under ble funnet her, uten Xcode. |
| D2 | State | `@Observable` (iOS 17) | `ObservableObject`/`@Published` | Den nye standarden. Statisk scan gir 0 treff på det gamle API-et. |
| D3 | Lagring | Én JSON-fil, `.atomic` + `.completeFileProtection` | SwiftData, UserDefaults | Liten datamengde (< 1 MB/år). Fil = speiler web-modellen, lett å eksportere. Kryptert på disk når låst. |
| D4 | Pust-timer | Ren funksjon `state(elapsed:)` + `TimelineView` | `Timer`/`setTimeout`-kjede | Ingen drift: fase etter 1000 sykluser verifisert. Ingenting å rydde opp ved `onDisappear`. |
| D5 | Dag-nøkkel | `yyyy-MM-dd` fra injisert `Calendar` | JS `toDateString()` | Deterministisk og testbar. Ikke avhengig av locale. |
| D6 | Legacy-protokoll | Tolerant decoder (mood `"4"` eller `4`) + per-rad skip + dedupe | Streng decode | Web 1.0 lagrer mood som String. Én dårlig rad skal ikke drepe hele importen. |
| D7 | Validering | Knapp `.disabled` til humør er valgt | `alert()` | Fjerner HULL #3 helt. |
| D8 | Eksport | `ShareLink` med ren tekst | Fil-skriving + UIDocumentPicker | Ett API kall. `Text` tolker aldri HTML. |
| D9 | Korrupt fil | Flytt til `rolig.corrupt-<ts>.json`, start på nytt | `try!` / krasj | Brukerdata blir aldri overskrevet i stillhet. |

## Iterasjonsrapport

| Iter | Endring | Build | Tester | Funn |
|---|---|---|---|---|
| 0 | Første utkast | ✅ 0 warnings | 💥 **krasj** (SIGILL) | `JSONSerialization.data(withJSONObject:)` krasjer på scalar-rad (`"garbage"`). Ikke en `throw`, en trap. |
| 1 | `isValidJSONObject`-guard | ✅ | 7/8 | Decoder-stien hoppet over trimming av `note` (`"  ok  "`). |
| 2 | Trim i `init(from:)` | ✅ strict-concurrency=complete, -warnings-as-errors | **8/8**, 0,014 s | — |
| 3 | Statisk review av App/ | n/a (Linux) | n/a | `Tab` er iOS 18 → min-versjon for skall hevet. Korrupt-fil-sti herdet. |

Metrikker: 2 ekte bugs funnet av 8 tester (begge i protokoll-mismatch-stien). Kjerne + tester + skall = 476 linjer.

### Testdekning per beslutning

| Test | Dekker |
|---|---|
| `testBreathBoundaries` (9 grensepunkter) | D4 |
| `testBreathNoDriftOver1000Cycles` | D4 |
| `testLegacyImportStringMoodAndCorruptRows` (6 rader: 2 ok, 4 dårlige, re-import = 0) | D6 |
| `testLegacyImportNonArrayIsNoop` | D6 |
| `testWeekCountExcludesFutureAndOld` | Store, uke-teller |
| `testToggleActionPerDayAndBounds` (inkl. indeks 99 og -1) | D5 |
| `testFileRoundTrip` | D3 |
| `testExportText` | D8 |

## Funn i eksisterende web-kode

1. **1.1-fiksene finnes ikke i `index.html`.** `HULL.md`/`README.md` sier nav-fix, «Alt blir på denne enheten» og eksport er lagt inn. Men commit `3cc07de` endret bare `.md`-filer. `index.html` har fortsatt `event.currentTarget` og `alert()`, og ingen eksport.
2. `renderHistory` legger `e.note` inn via `innerHTML` (self-XSS, kun lokalt). iOS-porten er immun (`Text`).
3. `mood` lagres som String. Håndteres i D6.

## Ikke verifisert

- `App/` er **ikke kompilert**: Linux har ikke SwiftUI. Bare statisk review. Første steg på Mac: lag et Xcode iOS App-target, legg til `ios/` som lokal pakke, dra inn `App/*.swift` og bygg.
- Ikke testet på ekte iPhone, VoiceOver eller Dynamic Type.

## Neste iterasjon

1. Bygg App/ i Xcode og logg build-output.
2. Vis `lastError` i UI (`.alert`).
3. Import-flyt: web-eksport (JSON) → `importLegacy` via `.fileImporter`.
4. Snapshot-tester for de fire skjermene.

## Kjør

```sh
cd ios && swift test
```
