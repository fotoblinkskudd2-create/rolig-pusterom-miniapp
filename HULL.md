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

## 10.11: 1.1 var aldri levert

Commit `3cc07de` beskrev punkt 1–4 som fikset. Diffen rørte bare `HULL.md`, `README.md`, `RUN.md`. `index.html` hadde fortsatt `event.currentTarget`, `alert()`, ingen lokal-linje, ingen export. Fikset i 1.2 og verifisert i Chromium (Playwright): nav følger side, ingen dialog, export laster ned, notat-HTML vises som tekst.

## Etter 1.1 (nå sant fra 1.2)

En fremmed kan: åpne `index.html` → lese «Alt blir på denne enheten» → sjekke inn eller puste → eksportere historikk som `.txt` → åpne Isolation Mirror fra bunnen og kopiere Labben-prompt.

Mangler fortsatt (ikke denne patchen): PWA/ikon, iOS hjemskjerm, dark mode, test på ekte iPhone.
