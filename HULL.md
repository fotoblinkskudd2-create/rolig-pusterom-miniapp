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

## 1.2 — hullet i 1.1

1.1-commiten endret bare README, RUN og HULL. `index.html` var urørt. Alle fem punktene over sto fortsatt åpne.
1.2 lukker 1–4 i koden, legger til lenke til Isolation Mirror fra Hjem, og viser notater med `textContent` (før: `innerHTML`, så HTML i en note ble kjørt).
Testet i Chromium: ingen dialog, nav følger «Pust med meg», eksport gir `.txt`.

## Etter 1.2

En fremmed kan: åpne `index.html` → lese «Alt blir på denne enheten» → sjekke inn eller puste → eksportere historikk som `.txt` → åpne Isolation Mirror fra bunnen og kopiere Labben-prompt.

Mangler fortsatt (ikke denne patchen): PWA/ikon, iOS hjemskjerm, dark mode, test på ekte iPhone.
