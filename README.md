# rolig-pusterom-miniapp

Rolig mini-app for stress og nedstemthet. Fire sider: **Hjem** (sjekk inn), **Pusterom** (4-2-6-pust), **Små grep**, **Historikk**. I tillegg kommer **Isolation Mirror**.

Ren HTML. Ingen konto, ingen sky, ingen sporing. Alt lagres i nettleseren på enheten. Appen kan installeres på hjemskjermen og virker uten nett når den kjøres fra en webadresse.

**Stadium:** lokal prototype, testet automatisk i Chromium. Den er ikke testet på ekte iPhone eller av brukere. Se `LOGG.md`.

## Kom i gang

- **Raskest:** åpne `index.html` i nettleseren.
- **Som app på telefonen:** se `RUN.md`.
- **Tester:** `npm install && npm test` (30 tester, Playwright/Chromium).

## Filer

| Fil | Hva |
|-----|-----|
| `index.html` | Appen |
| `isolation-mirror.html` | Note/bilde → privat protokoll + Labben-prompt |
| `manifest.webmanifest`, `sw.js`, `icons/` | Installering og bruk uten nett |
| `tests/` | Brukerkrav som kjørbare tester |
| `tools/serve.mjs` | Lokal server (service worker krever http) |
| `tools/make-icons.mjs` | Lager PNG-ikonene fra motivet i `icons/icon.svg` |
| `RUN.md` | Bruk, data, eksport |
| `HULL.md` | Hva en fremmed møter, og hva som manglet |
| `LOGG.md` | Beslutninger, kontroller, neste arbeidsordre |

**1.2 (05.10.2026):** Rettelsene som 1.1 bare beskrev, er nå gjort i koden. I tillegg: sikkerhetskopi og gjenoppretting, hjelpenumre, PWA/offline, mørk modus, tilgjengelighet og en testpakke. Detaljer i `LOGG.md`.
