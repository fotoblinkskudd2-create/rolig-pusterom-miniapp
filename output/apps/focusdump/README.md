# FocusDump

Tøm hodet. Velg én handling. Start fem minutter.

For personer som trenger kort vei fra mange tanker til én handling. Appen tar imot alt du skriver ned. Den lager ett nå-kort med neste steg og en timer du kan sette på pause.

**Status:** WEB_VERIFISERT · IOS_IKKE_VERIFISERT (se `../../../rapporter/focusdump/STATUS.md`).

## Funksjoner

| Funksjon | Hvor |
|---|---|
| Innboks med rask tekstfangst (én per linje, utkast lagres lokalt) | Fanen «Innboks» |
| Nå-kort med ett neste steg («Lag nå-kort» velger øverste i innboksen) | Fanen «Nå» |
| Femminuttstimer med pause og gjenoppta, regnet fra tidsstempler | Fanen «Nå» |
| Omprioritering (↑/↓), endring, arkiv og gjenåpning | «Innboks» og «Historikk» |
| Daglig oversikt uten prestasjonspress | Fanen «I dag» |
| Eksport JSON/CSV med formatversjon og tidspunkt | Fanen «Historikk» |

## Kom i gang

Krever Node 22.13 eller nyere. SQLite følger med Node (`node:sqlite`), så du trenger ingen native moduler.

```bash
npm ci
npm run build
npm run seed     # valgfritt: DEMO-konto demo@focusdump.local / demo-passord
npm start        # http://127.0.0.1:8787
```

Utvikling: `npm run dev:server` (API på 8787) og `npm run dev` (Vite på 5173 med proxy).

Miljøvariabler: `PORT` (8787), `HOST` (127.0.0.1), `DB_PATH` (`data/focusdump.db`), `SECURE_COOKIES=1` bak HTTPS, `ALLOWED_ORIGINS` (f.eks. `capacitor://localhost` for iOS-appen), `LOG=1`.

## Tester

```bash
npm test          # domene + API (egen temp-database)
npm run test:e2e  # Chromium 390 px: hel brukerreise, restart, offline-kø, konflikt, eksport (krever build)
npm run test:all  # bygg + alt
```

Fra repo-roten skriver `output/verify.sh focusdump` en full testlogg til `rapporter/focusdump/TESTLOGG.md`.

## Arkitektur

- `server/core/` er den felles kjernen: HTTP-ruter, konto, revisjon, idempotens og migrasjoner. Den er lik i alle appene.
- `server/app/` er FocusDump-spesifikk: `domain.ts` (ren logikk, brukes også av klienten), `migrations.ts` og `routes.ts`.
- `src/core/` er felles klientkjerne: API-klient, offline-kø i IndexedDB, skall og skjemakomponenter.
- `src/app/` er FocusDump-skjermene.
- `docs/API.md` beskriver API-et, `docs/SKJEMA.md` datamodellen og `docs/IOS.md` iOS-kontrakten.

## Kontoer og data

Hver konto ser bare egne data. Alle spørringer filtrerer på `owner_id`, og testen «konto B kan ikke lese konto A» bekrefter det. Passord hashes med scrypt. Økten ligger i en HttpOnly-cookie på web og i et Bearer-token i native app.

## Offline

App-skallet mellomlagres av service workeren. Siste kjente liste lagres i IndexedDB. Fangst, start, pause, fortsett og ferdig legges i en lokal kø uten nett, med operasjons-id. Køen sendes når nettet er tilbake, og samme id gjør at ingenting dobles. En konflikt vises og blir aldri overskrevet i stillhet. IndexedDB er lokal lagring, ikke sky-backup.

## Faktiske begrensninger

- Appen sender ingen varsler når tiden er ute. Den lover ikke varsling i bakgrunnen på iOS.
- Bare innboksoppgaver kan endres og omprioriteres mens du er frakoblet. Endring av tekst krever nett.
- Native iOS-bygg er ikke kjørt (ingen Xcode i byggemiljøet).
- Snarveien for rask fangst finnes som PWA-snarvei (`/#fang`). Native Home Screen Quick Action er ikke implementert.
- Senere milepæl, ikke startet: iOS-widget og test med fem brukere.
