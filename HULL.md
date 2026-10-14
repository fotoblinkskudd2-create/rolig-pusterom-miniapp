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

## 1.2 — sannhetssjekk

1.1-commiten endret bare `HULL.md`, `README.md`, `RUN.md`. `index.html` var urørt. Nav-buggen, `alert()`, manglende lokal-linje og manglende export sto fortsatt. Pluss: notater ble satt rett inn i `innerHTML` (XSS fra egen historikk).

Nå i koden:

- Nav følger siden, også fra «Pust med meg». Pusten stopper når du går bort.
- «Alt blir på denne enheten» på forsiden.
- Ingen `alert()`. Stille hint under skalaen.
- Notater escapes.
- «Ta historikken med deg» → `pusterom-historikk.txt`, med mønster nederst.
- Lenke til Isolation Mirror.
- Mørk modus og redusert bevegelse følger systemet.

**Mønster** (regnes ut på enheten, ingen nett):

- Etter sjekk-inn: humør 1–2 → pust først. 3 → ett grep. 4–5 → skriv hva som hjalp.
- Denne uka mot forrige.
- Tyngste tid på døgnet.
- Dager med pust/grep mot dager uten.
- Grepet som henger sammen med bedre dager merkes «pleier å hjelpe deg» (krever 2+ dager).
- Tre tunge sjekk-inns på rad → Mental Helse 116 123, Kirkens SOS 22 40 00 40, 113.

Mangler fortsatt: PWA/ikon, test på ekte iPhone.
