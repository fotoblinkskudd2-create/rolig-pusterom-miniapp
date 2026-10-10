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

## 1.1 – sannheten

1.1-commiten oppdaterte bare README/HULL/RUN. Punkt 1–4 over var fortsatt i `index.html`.
Punkt 5 ble fikset i `isolation-mirror.html`, men ingen lenke pekte dit.

## Etter 1.2

Alle fem er lukket, og har test i `test/smoke.mjs`. I tillegg funnet og fikset:

6. Notater ble satt inn med `innerHTML` – en note med `<img onerror=…>` kjørte kode. Nå ren tekst.
7. Pustesirkelen brukte 4 s overgang på en 6 s utpust. Nå følger animasjonen hvert steg.
8. Pusten fortsatte å gå i bakgrunnen når du byttet side.
9. `doneActions` vokste for alltid. Nå beholdes 14 dager.
10. «Du har tatt vare på deg selv 0 ganger … Det er fint.» Nå teller uken sjekk-inn, pusteøkter og små grep, og sier noe varmt når den er tom.
11. `user-scalable=no` stengte zoom for svaksynte. Fjernet.
12. Dager regnet som «nå minus 24 t» – på kvelden etter overgang til vintertid viste grafen samme dag to ganger. Nå kalenderdager, med test som låser klokka til 26.10.2026 23:30 i Oslo.

Fortsatt åpent: test på ekte iPhone (særlig eksport-nedlasting og Hjem-skjerm-ikon).
