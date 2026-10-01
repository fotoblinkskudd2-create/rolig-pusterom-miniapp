# Testlogg: focusdump

Generert av `output/verify.sh focusdump`.

- Tidspunkt (UTC): 2026-10-01T16:13:05Z
- Node: v22.22.0, npm: 10.9.4
- OS: Linux 6.18.44-fc-v50
- Kodeversjon: 0c66603 (arbeidskopi kan ha uinnsjekkede endringer)
- Nettleser: Chromium fra PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers)

## Ren installasjon

- Kommando: `npm ci --no-audit --no-fund`
- Start: 16:13:05 UTC, exit-kode: **0**

```
npm warn deprecated uuid@7.0.3: uuid@10 and below is no longer supported.  For ESM codebases, update to uuid@latest.  For CommonJS codebases, use uuid@11 (but be aware this version will likely be deprecated in 2028).
added 148 packages in 2s
```

## Bygg (typesjekk klient + server, vite build)

- Kommando: `npm run build`
- Start: 16:13:08 UTC, exit-kode: **0**

```
> focusdump@1.0.0 build
> tsc -p tsconfig.json --noEmit && tsc -p tsconfig.server.json && vite build
vite v8.3.2 building client environment for production...
transforming...
✓ 21 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.72 kB │ gzip:  0.40 kB
dist/assets/index-Cpp9Phu-.css    6.25 kB │ gzip:  2.00 kB
dist/assets/index-ZBeNcSf0.js   244.36 kB │ gzip: 75.96 kB
✓ built in 507ms
```

## Domene- og API-tester

- Kommando: `npx vitest run tests/domain.test.ts tests/api.test.ts --reporter=verbose`
- Start: 16:13:09 UTC, exit-kode: **0**

```
 RUN  v5.0.3 /home/user/rolig-pusterom-miniapp/output/apps/focusdump
 ✓ tests/api.test.ts > FocusDump API > krever innlogging 7ms
 ✓ tests/api.test.ts > FocusDump API > avviser ugyldig input uten delvis lagring 31ms
 ✓ tests/api.test.ts > FocusDump API > grenseverdier 1 og 120 minutter godtas 24ms
 ✓ tests/api.test.ts > FocusDump API > kontrolleksempel ende-til-ende: fangst -> nå-kort -> start -> pause 60 s -> 240 s igjen -> gjenoppta 18ms
 ✓ tests/api.test.ts > FocusDump API > bare ett nå-kort av gangen 2ms
 ✓ tests/api.test.ts > FocusDump API > ulovlig tilstandsendring avvises og data beholdes 7ms
 ✓ tests/api.test.ts > FocusDump API > gammel revisjon gir konflikt med gjeldende versjon 6ms
 ✓ tests/api.test.ts > FocusDump API > dobbel innsending med samme operasjons-id gir én post 7ms
 ✓ tests/api.test.ts > FocusDump API > klientgenerert id (offline) gjentatt gir ikke dobbel post 6ms
 ✓ tests/api.test.ts > FocusDump API > omprioritering flytter oppgaven opp 7ms
 ✓ tests/api.test.ts > FocusDump API > arkiv kan gjenåpnes; sletting krever arkiv og bekreftelse 24ms
 ✓ tests/api.test.ts > FocusDump API > kan ikke arkivere en pågående økt 3ms
 ✓ tests/api.test.ts > FocusDump API > ferdig avslutter økten og daglig oversikt teller den 7ms
 ✓ tests/api.test.ts > FocusDump API > eksport har versjon, tidspunkt, felter og stemmer med databasen 6ms
 ✓ tests/api.test.ts > FocusDump API > konto B kan ikke lese eller endre konto A 84ms
 ✓ tests/api.test.ts > FocusDump API > data overlever serverrestart 19ms
 ✓ tests/api.test.ts > FocusDump API > feil passord og ugyldig JSON gir konkret feil 60ms
 ✓ tests/domain.test.ts > Kontrolleksempel fra oppgaven > tre oppgaver i kø: første velges; pause etter 60 s av 300 s beholder 240 s; gjenoppta fortsetter derfra 5ms
 ✓ tests/domain.test.ts > Timer regnes fra tidsstempler > reload/bakgrunn: samme svar uansett hvor ofte vi spør 1ms
 ✓ tests/domain.test.ts > Timer regnes fra tidsstempler > går aldri under null 0ms
 ✓ tests/domain.test.ts > Timer regnes fra tidsstempler > flere pauser summeres 1ms
 ✓ tests/domain.test.ts > Timer regnes fra tidsstempler > avvis dobbel pause, gjenoppta uten pause og handling etter avslutning 2ms
 ✓ tests/domain.test.ts > Timer regnes fra tidsstempler > avslutning under pause teller ikke pausetiden som fokus 1ms
 ✓ tests/domain.test.ts > Timer regnes fra tidsstempler > formaterer klokke 0ms
 ✓ tests/domain.test.ts > Tilstandsflyt > inbox -> ready -> active -> done; active <-> paused 0ms
 ✓ tests/domain.test.ts > Tilstandsflyt > ulovlige overganger avvises 1ms
 ✓ tests/domain.test.ts > Valg av neste > hopper over arkiverte og ikke-innboks, stabil ved like posisjoner 10ms
 ✓ tests/domain.test.ts > Valg av neste > tomme linjer ignoreres 1ms
 ✓ tests/domain.test.ts > Daglig oversikt > lokal dato bruker klientens tidssone 0ms
 ✓ tests/domain.test.ts > Daglig oversikt > teller ferdige og fokusminutter uten press 3ms
 Test Files  2 passed (2)
      Tests  30 passed (30)
   Start at  16:13:10
   Duration  1.17s (tests 58%, transform 29%, import 12%, worker 1%)
```

## Ende-til-ende i Chromium (390 px, restart, offline, eksport)

- Kommando: `npx vitest run tests/e2e.test.ts --reporter=verbose`
- Start: 16:13:11 UTC, exit-kode: **0**

```
 RUN  v5.0.3 /home/user/rolig-pusterom-miniapp/output/apps/focusdump
 ✓ tests/e2e.test.ts > FocusDump ende-til-ende (390 px) > tomtilstand og registrering 482ms
 ✓ tests/e2e.test.ts > FocusDump ende-til-ende (390 px) > feil input vises ved feltet og lagres ikke 240ms
 ✓ tests/e2e.test.ts > FocusDump ende-til-ende (390 px) > egen input -> Lag nå-kort -> start -> pause 3218ms
 ✓ tests/e2e.test.ts > FocusDump ende-til-ende (390 px) > endre ett felt og se lagringsstatus 260ms
 ✓ tests/e2e.test.ts > FocusDump ende-til-ende (390 px) > konflikt ved gammel revisjon vises med "Hent ny versjon" 496ms
 ✓ tests/e2e.test.ts > FocusDump ende-til-ende (390 px) > data og pauset timer overlever serverrestart og reload 78ms
 ✓ tests/e2e.test.ts > FocusDump ende-til-ende (390 px) > offline: fangst legges i kø og synkroniseres én gang 274ms
 ✓ tests/e2e.test.ts > FocusDump ende-til-ende (390 px) > ferdig, i dag og eksport stemmer med databasen 484ms
 ✓ tests/e2e.test.ts > FocusDump ende-til-ende (390 px) > tastatur og tekstskalering 200 % 230ms
 ✓ tests/e2e.test.ts > FocusDump ende-til-ende (390 px) > desktop-bredde 376ms
 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  16:13:12
   Duration  7.22s (tests 96%, transform 3%, import 1%)
```

## Capacitor iOS-synk (genererer/oppdaterer Xcode-prosjekt, ikke native bygg)

- Kommando: `npx cap sync ios`
- Start: 16:13:19 UTC, exit-kode: **0**

```
✔ Copying web assets from dist to ios/App/App/public in 14.01ms
✔ Creating capacitor.config.json in ios/App/App in 1.74ms
✔ copy ios in 37.70ms
✔ Updating iOS plugins in 3.59ms
[info] All Capacitor plugins have a Package.swift file and will be included in Package.swift
[info] Writing Package.swift
✔ update ios in 38.82ms
[info] Sync finished in 0.104s
```

## Native iOS-bygg

- Kommando: `bash -c command -v xcodebuild || { echo "xcodebuild finnes ikke i dette miljøet (Linux). Native bygg ikke mulig her."; exit 3; }`
- Start: 16:13:20 UTC, exit-kode: **3**

```
xcodebuild finnes ikke i dette miljøet (Linux). Native bygg ikke mulig her.
```

## Samlet

WEB: alle kontroller bestått. iOS: native bygg ikke kjørt – se stegene over.
