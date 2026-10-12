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

## Revisjon 12.10.2026 — 1.1 var dokumentert, ikke bygget

DOKUMENTERT: commit `3cc07de` («nav-fix, lokal-first, historikk-export») endret bare README, RUN og HULL. `index.html` var urørt siden 1.0. Punkt 1–4 over var fortsatt feil i koden.

Nå bygget og testet (headless Chromium, 390 px, 9/9 PASS):

1. Nav følger siden via `data-page`, ikke `event.currentTarget`.
2. «Alt blir på denne enheten. Ingen konto, ingen sky.» under spørsmålet.
3. `alert()` erstattet med stille hint under notatfeltet.
4. Historikk → «Ta historikken med deg» → `pusterom-historikk.txt`.
5. Lenke «Isolation Mirror →» nederst på Hjem.
6. Ny: «Trenger du hjelp nå?» med 113, 116 117 og 116 123 (Mental Helse). En stress-app uten vei til hjelp er et sikkerhetshull.
7. Ny: notater vises som tekst, ikke HTML.
8. Ny: zoom er tillatt igjen (`user-scalable=no` fjernet).

Mangler fortsatt: PWA/ikon, iOS hjemskjerm, dark mode, test på ekte iPhone.
eple: ingen fremmed har åpnet appen ennå.
