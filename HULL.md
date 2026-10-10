# HULL — 60 sekunder for en fremmed

## Hva som blokkerte første minutt (1.0)

1. `switchPage` brukte `event.currentTarget`. «Pust med meg» byttet side, men nav ble stående på Hjem.
2. Ingen setning om at data blir på enheten. For en stress-app er det tillitsbrudd.
3. `alert()` hvis humør ikke var valgt.
4. Historikk kunne ikke tas med. localStorage dør med nettleserdata.
5. `isolation-mirror.html` var en løs fil. Filvelgeren gjorde ingenting. Midjourney-prompten var slop.

## Hull i 1.1

1.1-commiten lovet 1–4 fikset. Bare dokumentasjonen ble endret. Punkt 5 ble fikset, 1–4 ble ikke.

Også funnet ved gjennomgang:

- Notater satt inn med `innerHTML`. `<img onerror>` i en note kjørte kode.
- «Denne uken» var siste 7 dager, ikke uka.
- Pusten fortsatte når du byttet side.
- Utpust-animasjonen var 4 s, men fasen 6 s.
- `doneActions` vokste for alltid.
- `user-scalable=no` sperret zoom.
- Kopier i Isolation Mirror ga ingen beskjed, og feilet stille på `file://`.

## Etter 1.2

Alt over er fikset og dekket av `test/smoke.mjs`.

En fremmed kan: åpne `index.html` → lese «Alt blir på denne enheten» → sjekke inn eller puste → se kurven → laste ned historikk eller ta sikkerhetskopi → åpne Isolation Mirror fra forsiden og kopiere Labben-prompt.

## Mangler fortsatt

- Test på ekte iPhone (hjemskjerm, safe area, wake lock).
- Påminnelser. Krever notifikasjoner, og det er et valg, ikke en fiks.
