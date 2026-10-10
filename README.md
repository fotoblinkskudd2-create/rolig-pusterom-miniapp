# rolig-pusterom-miniapp

Rolig mini-app for stress og nedstemthet. Fire sider: **Hjem** (sjekk inn), **Pusterom** (4-2-6-pust), **Små grep**, **Historikk**. I tillegg kommer to rom: **Systemrommet** (hvem er her, lapper mellom deler, kjøpsbrems 48 t) og **Isolation Mirror**.

Ren HTML. Ingen konto, ingen sky, ingen sporing. Alt lagres i nettleseren på enheten. Appen kan installeres på hjemskjermen og virker uten nett når den kjøres fra en webadresse.

**Stadium:** lokal prototype, 45 automatiske tester i Chromium. Den er ikke testet på ekte iPhone eller av brukere. Se `LOGG.md`.

## Kom i gang

- **Raskest:** åpne `index.html` i nettleseren.
- **Som app på telefonen:** se `RUN.md`.
- **Tester:** `npm install && npm test` (45 tester, Playwright/Chromium).

## Filer

| Fil | Hva |
|-----|-----|
| `index.html` | Appen |
| `systemrom.html` | Systemrommet: hvem er her, lapper, kjøpsbrems 48 t |
| `isolation-mirror.html` | Note/bilde → privat protokoll + Labben-prompt |
| `manifest.webmanifest`, `sw.js`, `icons/` | Installering og bruk uten nett |
| `tests/` | Brukerkrav som kjørbare tester |
| `tools/serve.mjs` | Lokal server (service worker krever http) |
| `tools/make-icons.mjs` | Lager PNG-ikonene fra motivet i `icons/icon.svg` |
| `RUN.md` | Bruk, data, eksport |
| `HULL.md` | Hva en fremmed møter, og hva som manglet |
| `LOGG.md` | Beslutninger, kontroller, neste arbeidsordre |
| `KART.md` | Alle 86 grener: hva som er landet, hva som kan slettes, hva som skal flyttes |

**1.3 (10.10.2026):** Systemrommet hentet ut av Kubernetes-PR-en (#2), skrevet om og lagt inn i appen. Det er med i sikkerhetskopien og i «Slett alt», og 15 nye tester dekker det. To feil fra originalen er rettet: et ferskt kjøp viste «2 døgn 0 t», og «mens du var borte» mistet det andre gjorde når samme navn ble logget to ganger. `KART.md` rydder i 86 grener.

**1.2 (05.10.2026):** Rettelsene som 1.1 bare beskrev, er nå gjort i koden. I tillegg: sikkerhetskopi og gjenoppretting, hjelpenumre, PWA/offline, mørk modus, tilgjengelighet og en testpakke. Detaljer i `LOGG.md`.
