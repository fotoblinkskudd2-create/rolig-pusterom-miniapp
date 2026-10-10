# RUN

## Åpne som fil

1. Last ned hele mappen (eller minst `index.html` og `isolation-mirror.html` i samme mappe).
2. Åpne `index.html` i Safari, Chrome eller Firefox.

Alt virker unntatt installering og bruk uten nett. Det krever at appen kjøres fra en webadresse (se under).

## Som app på telefonen (PWA)

Service worker og hjemskjerm-ikon krever http(s).

- **Lokalt:** `node tools/serve.mjs` → åpne `http://localhost:8080`.
- **På telefonen:** legg mappen på en statisk vert med https, for eksempel GitHub Pages. Det er ikke gjort; det er en publiseringsbeslutning. Åpne adressen én gang på nett.
  - **iPhone:** Safari → Del → Legg til på Hjem-skjerm.
  - **Android:** Chrome → meny → Installer app.
- Etter første besøk åpner appen uten nett. Langt trykk på ikonet gir snarveiene «Pust nå» og «Historikk» (Android/Chrome).

## Hva som lagres lokalt

| Nøkkel | Innhold |
|--------|---------|
| `checkins` | tid, humør 1–5, valgfritt notat (maks 1000 tegn) |
| `breaths` | tid og antall fullførte runder per pusteøkt |
| `doneActions` | hvilke «små grep» som er merket, per dag (siste 60 dager) |
| `systemrom.front` | hvem som er her: navn, tid, valgfri note (maks 500) |
| `systemrom.lapper` | lapper: fra, til, tekst, hvem som har sett dem (maks 300) |
| `systemrom.brems` | kjøpsbrems: hva, pris, betaling, stemmer, avgjørelse (maks 300) |

Ingenting sendes på nett. Testen «hele brukerreisen gjør ingen nettverkskall» kontrollerer det. Service workeren mellomlagrer bare appens egne filer. Isolation Mirror viser bildet bare i fanen, og bildet lagres ikke.

## Ta historikken med deg

Historikk → **Dine data**:

- **Ta historikken med deg (.txt):** lesbar fil, `pusterom-historikk-ÅÅÅÅ-MM-DD.txt`.
- **Lag sikkerhetskopi (.json):** fil som kan hentes inn igjen.
- **Hent inn sikkerhetskopi:** slår sammen med det som finnes. Ingenting overskrives, og duplikater hoppes over. Ugyldige oppføringer og feil filer avvises.
- **Slett alt på denne enheten:** to trykk.

I installert app på iPhone skal Del-arket åpnes i stedet for nedlasting. Det er ikke testet på ekte iPhone ennå; se `LOGG.md`.

## Systemrommet

Hjem → **Systemrommet**. For et hode med flere i.

- **Hvem er her nå?** Skriv navn, alder eller «vet ikke». Kjente navn blir knapper.
- **Mens du var borte:** når et navn logges, vises det som skjedde siden sist dette navnet var her, før noen andre kom.
- **Lapper:** beskjed til ett navn eller til alle. «Til deg» vises for den det gjelder. Å fjerne en lapp krever to trykk.
- **Kjøpsbrems:** skriv ned det du har lyst på i stedet for å kjøpe. Det låses i 48 timer, og så kan alle stemme. «Kjøp» finnes ikke før tiden har gått; «Slipp» kan du trykke når som helst. Det som slippes, telles, og avbetaling eller kreditt telles som gjeld som aldri ble til.

Alt er med i sikkerhetskopien, og «Slett alt» fjerner det også. Snarvei fra hjemskjerm-ikonet: «Kjøpsbrems».

## Isolation Mirror → Grok-bot

Historikk → **Isolation Mirror** → skriv notat → **Generer** → **Kopier prompt** → lim inn i Labben eller i Grok-bot med `/lab`. Hvis utklippstavlen er sperret, markeres teksten slik at du kan kopiere selv.

## Tester

```
npm install
npm test
```

Testene kjører i Chromium via Playwright. Hvis Chromium ikke er installert, kjør `npx playwright install chromium`, eller sett `CHROMIUM_PATH`. Kjør mot en annen versjon av appen med `APP_DIR=/sti npm test`. Testene kjører også automatisk på GitHub ved hver push (`.github/workflows/test.yml`).
