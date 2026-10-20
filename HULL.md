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

## 19.10.2026 — revisjon

1.1 over var dokumentert, men ikke kodet: `index.html` hadde fortsatt `event.currentTarget`, `alert()`, ingen lokal-first-linje, ingen eksport, ingen lenke. I tillegg: notat ble satt inn med `innerHTML` uten escaping. Alt fikset og testet (`test/pusterom.test.mjs`, 7/7).

## 20.10.2026 — det som manglet etter 1.1

- [x] PWA/ikon: `manifest.webmanifest`, `ikoner/`, `sw.js` (alle sider offline, testet med nettet av)
- [x] iOS Hjem-skjerm: `apple-touch-icon`, `apple-mobile-web-app-*` på alle sider
- [x] Dark mode: alle sider, også `index.html`
- [ ] Test på ekte iPhone — krever at repoet serveres over https (f.eks. GitHub Pages)
