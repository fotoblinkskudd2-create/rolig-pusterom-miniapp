# HULL — 60 sekunder for en fremmed

## Sannheten om 1.1

1.1-commiten oppdaterte README, RUN og HULL. `index.html` ble aldri rørt. Nav-buggen, `alert()`, manglende eksport og manglende lokal-first-linje sto fortsatt i koden. 2.0 leverer det 1.1 lovet.

## Fikset i 2.0

1. `switchPage` slår opp knappen via `data-page`. «Pust med meg» flytter nav.
2. «🔒 Alt blir på denne enheten» står øverst på Hjem.
3. `alert()` er erstattet med en rolig linje under fjesene.
4. Historikk → «Ta historikken med deg (.txt)».
5. Isolation Mirror lenket fra Hjem. Kopier-knappen gir tilbakemelding og har fallback.
6. Notater ble satt inn som rå HTML (XSS). Nå escapes de.
7. Pustesirkelen stopper når du forlater siden. Respekterer «redusert bevegelse».

## Nytt i 2.0

- **Fyrlykt.** Sjekker du inn 😔 eller 😕, dukker et varmt kort opp: 116 123, Kirkens SOS, 113, og «Ett minutt pust» (4 runder, så stopp). Ingen popup, ingen alarm. Den er der.
- **Tidevann.** Humøret siste 14 dager som en kystlinje. Ikke et dashboard, ikke en streak, ingen skam over tomme dager.
- **PWA.** `manifest.webmanifest`, `icon.svg`, `sw.js`. Installerbar, virker offline over https.
- **Mørk modus.** Følger systemet.

## Mangler fortsatt

- PNG-ikon 180×180 for eldre iOS (SVG holder for moderne Safari/Chrome).
- Test på ekte iPhone i hjemskjerm-modus.
- Import av eksportert historikk.
