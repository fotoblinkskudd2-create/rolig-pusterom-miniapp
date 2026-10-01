# iOS-kontrakt (Capacitor)

**Status: IOS_IKKE_VERIFISERT.** Xcode-prosjektet er generert med `npx cap add ios` (Capacitor 8.5.2, Swift Package Manager) og synkronisert med webbygget. Byggemiljøet er Linux uten Xcode, så det er ikke bygget, signert eller testet på simulator eller enhet.

## Backend

En Node-server følger ikke med iPhone-appen. Den native appen bruker en FocusDump-server du selv kjører på en adresse telefonen når:

1. Start serveren med `HOST=0.0.0.0 ALLOWED_ORIGINS=capacitor://localhost SECURE_COOKIES=1` bak HTTPS.
2. Bygg webdelen med `VITE_API_BASE=https://din-server npm run build && npx cap sync ios`.
3. Innlogging i native app bruker Bearer-token, lagret i appens `localStorage` (WKWebView). Cookies brukes bare på web.

## Data lokalt på enheten

- Siste kjente oppgaveliste (IndexedDB, nøkkel `tasks:<bruker-id>`).
- Offline-kø med operasjoner som ikke er sendt (IndexedDB `outbox`).
- Utkast i fangstfeltet (localStorage).
- Innloggingstoken (localStorage, bare i native app).

Dette er lokal lagring, ikke sikkerhetskopi.

## Tillatelser

Ingen. Appen bruker ikke kamera, varsler, posisjon eller kontakter.

## Uten nett

Appen viser sist kjente liste, merket «Viser lagret kopi». Fangst, start, pause, fortsett og ferdig legges i kø med tidspunktet du trykket. Køen sendes når nettet er tilbake. Ved konflikt vises endringen under «Ikke synkronisert ennå» med valget «Forkast». Første innlogging krever nett.

## Timer og skjermlås

Timeren regnes fra lagrede tidsstempler. Etter skjermlås eller at appen er lukket, viser den riktig gjenstående tid når du åpner igjen. Appen sender ingen varsler, og den lover ikke at iOS varsler deg når tiden er ute.

## Gjenstående steg for IOS_VERIFISERT

1. Bruk en Mac med Xcode 16+: `npm ci && npm run build && npx cap sync ios && npx cap open ios`.
2. Velg et signeringsteam i Xcode og bygg til en simulator (iPhone 15, iOS 17+).
3. Test kjerneflyten på simulatoren: logg inn → fangst → Lag nå-kort → start → lås skjermen 60 s → åpne → kontroller at tiden har gått → pause → lukk appen → åpne → kontroller at pausetiden står stille.
4. Test flymodus: fang en oppgave, slå på nett igjen og kontroller at den kommer én gang.
5. Legg inn Home Screen Quick Action for rask fangst: `UIApplicationShortcutItems` i `Info.plist`, med håndtering i `SceneDelegate` som åpner `/#fang`. Test den.
6. Lagre skjermbilder og logg i `rapporter/focusdump/` og sett status til IOS_VERIFISERT først etter det.
