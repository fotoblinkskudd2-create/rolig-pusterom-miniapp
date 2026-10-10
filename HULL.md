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

Mangler fortsatt (ikke denne patchen): PWA/ikon, iOS hjemskjerm, dark mode, test på ekte iPhone.

## Kontroll 10.10.2026

1.1-commiten (3cc07de) endret bare dokumentasjon. `index.html` hadde fortsatt punkt 1–5 over.
Reprodusert med `tests/app.test.mjs`: 8 av 11 sjekker feilet, og notatfeltet kjørte HTML (XSS).

Nå rettet i `index.html`: nav via `data-page`, inline-beskjed i stedet for `alert()`,
lokal-first-linje, eksport til `pusterom-historikk.txt`, lenke til Isolation Mirror,
escaping av notater, «1 gang / 2 ganger». Test: 11/11 bestått.

Åpne PR-er #1 (PWA) og #2 (2.0) bygger på eldre kode og vil konflikte. De må besluttes, ikke glemmes.
