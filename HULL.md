# HULL — 60 sekunder for en fremmed

Repo før patch: 2 HTML-filer + 2-linjers README. Ingen instruks.

## Hva som blokkerte første minutt

1. `switchPage` brukte `event.currentTarget`. «Pust med meg» byttet side, men nav ble stående på Hjem.
2. Ingen setning om at data blir på enheten. For en stress-app er det tillitsbrudd.
3. `alert()` hvis humør ikke var valgt.
4. Historikk kunne ikke tas med. localStorage dør med nettleserdata.
5. `isolation-mirror.html` var en løs fil. Filvelgeren gjorde ingenting. Midjourney-prompten var slop.

## Hva som er greit

- Fire sider. Lokal lagring. Pustesirkel. Små grep. Tom-tilstand på historikk.
- Ingen sky. Det skal bli slik.

## Etter 1.1

En fremmed kan: åpne `index.html` → lese «Alt blir på denne enheten» → sjekke inn eller puste → eksportere historikk som `.txt` → åpne Isolation Mirror fra bunnen og kopiere Labben-prompt.

## Korreksjon 18.10.2026

Commit `3cc07de` («1.1: nav-fix, lokal-first, historikk-export …») endret bare `.md`-filer. `index.html` var urørt: `event.currentTarget`, `alert()`, ingen export, ingen lokal-linje, ingen vei til Mirror. 1.1 fantes på papiret.

Nå i koden, verifisert av `tests/smoke.mjs` (Chromium, lys og mørk, file://):

- Nav følger `data-page`, ikke `event`. «Pust med meg» flytter nav. Pust stopper ved sidebytte.
- «Alt blir på denne enheten» på Hjem.
- Inline beskjed i stedet for `alert()`.
- «Ta historikken med deg» → `pusterom-historikk.txt`. Skjult når historikken er tom.
- Notetekst escapes. Før kunne `<img onerror>` i en note kjøre JS i historikken.
- Korrupt `localStorage` krasjer ikke appen. `doneActions` vokser ikke lenger én nøkkel per dag for alltid.
- Mirror: lenke fra Historikk, kopier-knappen gir tilbakemelding og har fallback der async clipboard mangler (file://).
- Dark mode (`prefers-color-scheme`), `manifest.webmanifest`, `icon.svg`.

Mangler fortsatt: test på ekte iPhone (Safari + Hjem-skjerm), PNG-ikon for eldre iOS (SVG som apple-touch-icon er ikke garantert), service worker (frakoblet drift fra Hjem-skjerm krever https-hosting).
