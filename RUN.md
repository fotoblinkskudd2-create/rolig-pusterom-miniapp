# RUN

## Åpne

1. Last ned `index.html` og `isolation-mirror.html` i samme mappe.
2. Åpne `index.html` i Safari eller Chrome.
3. På iPhone: Del → Legg til på Hjem-skjerm (valgfritt).

Ingen server. Ingen konto.

## Hva som lagres lokalt

| Nøkkel | Innhold |
|--------|---------|
| `checkins` | tid, humør 1–5, valgfri note |
| `doneActions` | hvilke «små grep» merket i dag |

Ingenting går på nett. Isolation Mirror viser bilde kun i denne fanen. Filen lastes ikke opp.

## Export

Historikk → «Ta historikken med deg» → `pusterom-historikk.txt`.

## Isolation Mirror → Grok-bot

Skriv note → Generer → Kopier prompt → lim i Labben eller Grok-bot med `/lab`.

## Test (for utviklere og agenter)

```
NODE_PATH=$(npm root -g) node tests/smoke.cjs
```

Krever Node og Playwright med Chromium (`npm i -g playwright && npx playwright install chromium`). Røyktesten åpner begge HTML-filene headless og sjekker lokal-first-linje, nav, sjekk-inn uten `alert()`, at noter vises som tekst, eksport og lenken til Isolation Mirror. Exit 0 = alt OK.
