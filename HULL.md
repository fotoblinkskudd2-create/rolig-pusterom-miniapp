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

## 1.2 (05.10.2026) – koden tar igjen dokumentasjonen

1.1-commiten (`3cc07de`) beskrev fiksene over, men endret bare `.md`-filer. `index.html` var urørt: `event.currentTarget`, `alert()`, ingen eksport, ingen lenke. 1.2 legger inn koden:

- Nav markeres via `data-page`, ikke `event` → «Pust med meg» aktiverer Pusterom i nav.
- «🔒 Alt blir på denne enheten» på Hjem.
- `alert()` erstattet med rolig inline-melding.
- «Ta historikken med deg (.txt)» → `pusterom-historikk.txt`. Skjult når historikken er tom.
- Lenke til Isolation Mirror nederst på Hjem.
- Notater vises med `textContent` (HTML i notat kjøres ikke lenger).
- «1 gang» / «N ganger».

Kontroll: Playwright/Chromium 390×844, `file://`. Alle punktene over sjekket, ingen JS-feil. Ikke testet: ekte iPhone/Safari, nedlasting av `.txt` i iOS hjemskjerm-modus (eple: iOS-standalone kan håndtere `download` annerledes – må prøves på telefon).

## Etter 1.2

En fremmed kan: åpne `index.html` → lese «Alt blir på denne enheten» → sjekke inn eller puste → eksportere historikk som `.txt` → åpne Isolation Mirror fra bunnen og kopiere Labben-prompt.

Mangler fortsatt (ikke denne patchen): PWA/ikon, iOS hjemskjerm, dark mode, test på ekte iPhone.
