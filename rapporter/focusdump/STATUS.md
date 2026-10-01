# FocusDump: status

| App | Kravversjon | Kodeversjon | Eier | Status |
|---|---|---|---|---|
| FocusDump (`focusdump`) | byggeinstrukser-30, claude-code/oppgaver/focusdump.md (kontrollert 1. okt. 2026) | 1.0.0, branch `claude/30-apper` | Claude Code (hovedagent) | **WEB_VERIFISERT** · **IOS_IKKE_VERIFISERT** |

## Implementert (brukerhandlinger)

- Lage konto, logge inn og ut. Hver konto ser bare egne data.
- Skrive ned mange oppgaver, én per linje, med tilgjengelige minutter. Utkastet lagres lokalt mens du skriver.
- «Lag nå-kort»: øverste oppgave i innboksen blir nå-kortet. Bare ett nå-kort om gangen.
- Starte, pause, fortsette og fullføre en fokusøkt. Timeren regnes fra tidsstempler og tåler reload og restart.
- Endre tekst og minutter. En gammel revisjon gir konflikt med «Hent ny versjon».
- Flytte oppgaver opp og ned, legge nå-kortet tilbake, gjenåpne ferdige oppgaver.
- Arkivere og gjenåpne fra arkivet, og slette permanent med tostegs bekreftelse.
- Daglig oversikt (ferdig, økter, fokusminutter, skrevet ned) uten streaks eller press.
- Eksportere JSON (versjon, tidspunkt og feltbeskrivelse) og CSV.
- Offline: siste liste vises fra IndexedDB. Fangst og timerhandlinger går i kø med operasjons-id og synkroniseres uten dobling.

## Verifisert

Se `TESTLOGG.md` for kommandoer, tidspunkt, exit-koder og testnavn. Kjør den på nytt med `output/verify.sh focusdump`.

- Ren `npm ci` → exit 0.
- `npm run build` (typesjekk av klient og server, Vite) → exit 0.
- 30 domene- og API-tester → exit 0. De dekker kontrolleksempelet (240 s igjen etter pause ved 60 s av 300 s), grenseverdiene 1 og 120, ugyldig input uten delvis lagring, ulovlige overganger, gammel revisjon, dobbel innsending, klient-id, at konto B ikke når konto A, restart og eksport kontrollert mot databasen.
- 10 e2e-tester i Chromium ved 390 px → exit 0. De dekker tomtilstand, feilmelding, hele brukerreisen med egen input, at timeren står stille under pause, endring av ett felt, konflikt-UI, serverrestart og reload, offline-kø med synkronisering til nøyaktig én rad, eksport kontrollert mot databasen, tastatur, 200 % tekst og desktop. Ingen horisontal rulling, og alle trykkflater er minst 44 px.
- Skjermbilder ligger i `skjermbilder/`.

## Blokkert

- Native iOS-bygg: `xcodebuild` finnes ikke i byggemiljøet (Linux). Neste steg står i `output/apps/focusdump/docs/IOS.md`.

## Ikke implementert

- Native Home Screen Quick Action på iOS. PWA-snarveien `/#fang` finnes.
- Lokale varsler når tiden er ute. Dette er bevisst: appen lover ikke iOS-varsler.
- Senere milepæl: iOS-widget og test med fem brukere.

## Artefakter

- Prosjekt: `output/apps/focusdump/` (README, docs/API.md, docs/SKJEMA.md, docs/IOS.md, ios/).
- Testlogg: `rapporter/focusdump/TESTLOGG.md`.
- Skjermbilder: `rapporter/focusdump/skjermbilder/`.
- Eksporteksempel: `rapporter/focusdump/eksport-eksempel.json`.

## Neste handling

Bygg og test kjerneflyten på iOS-simulator på en Mac med Xcode (steg 1–4 i docs/IOS.md).
