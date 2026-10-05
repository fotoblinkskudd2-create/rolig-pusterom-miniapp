# HULL — 60 sekunder for en fremmed

## 2.0: hva som faktisk var galt

Commiten for 1.1 endret bare README, RUN og HULL. `index.html` var urørt. Alle fem hullene under sto fortsatt åpne. De er lukket nå:

1. ✅ `switchPage` brukte `event.currentTarget`. Nå styrer `data-page` hvilken knapp som er aktiv.
2. ✅ Linjen «Alt blir på denne enheten» står på forsiden og i Historikk.
3. ✅ `alert()` er byttet ut med et rolig hint.
4. ✅ Historikk kan eksporteres som `.txt`. Systemrommet eksporterer alt som `.json`.
5. ✅ Isolation Mirror kan nås fra forsiden.

Også lukket:

- Noter ble satt inn med `innerHTML` uten escaping. Nå escapes all brukertekst.
- Mørk modus via `tokens.css`. Følger systemet.
- PWA: manifest, ikon og offline-skall.

## Hva som er greit

- Lokal lagring. Ingen sky. Det skal bli slik. Nå er det håndhevet av CSP og NetworkPolicy, ikke bare lovet.

## Mangler fortsatt

- Test på ekte iPhone (hjemskjerm og offline).
- PNG-ikoner for eldre iOS (SVG-ikonet dekker moderne nettlesere).
- Import av `.json`-eksport tilbake til en ny enhet.
