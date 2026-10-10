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

## Revisjon 10.10.2026: 1.1 fantes bare på papiret

Commit `3cc07de` («1.1: nav-fix, lokal-first, historikk-export …») endret bare `HULL.md`, `README.md` og `RUN.md`. `index.html` var urørt: `event.currentTarget` og `alert()` lå der fortsatt, og det fantes ingen eksport, ingen lokal-first-linje og ingen lenke til Isolation Mirror.

Røyktest før retting: 3/9. Etter retting: 9/9 (`tests/smoke.cjs`).

Rettet i `index.html`:
1. Nav-markeringen følger siden (`data-page` i stedet for `event.currentTarget`).
2. «Alt blir på denne enheten. Ingen konto, ingenting sendes.» på Hjem.
3. `alert()` erstattet med en rolig beskjed over knappen.
4. «Ta historikken med deg» → `pusterom-historikk.txt`.
5. Lenke til Isolation Mirror nederst på Hjem.
6. I tillegg: noter i historikken vises som tekst, ikke HTML. «1 ganger» er rettet til «1 gang».

Mangler fortsatt: PWA/ikon, iOS hjemskjerm, dark mode, test på ekte iPhone (blob-nedlasting og `localStorage` fra `file://` i Safari er ikke verifisert), lenke til hjelpetelefon for den som har det verst.
