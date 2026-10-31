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

## Etter 1.2 (rettingsrunde)

Fikset etter kartlegging mot koden:

- Eksport finnes nå. Før lovte dokumentasjonen «Ta historikken med deg», men knappen manglet.
- «Pust med meg» setter nå riktig fane aktiv i navigasjonen.
- Krisehenvisning (113, Mental Helse 116 123) på Hjem og i Isolation Mirror.
- Ødelagt eller full lagring knekker ikke siden, og notatet tapes ikke ved feil.
- Notat vises som ren tekst, ikke som HTML.
- Isolation Mirror sier tydelig at kopiert prompt går til Labben/Grok. Kopiering gir bekreftelse, med fallback.
- Pusteøvelsen stopper når brukeren forlater siden. Støtte for redusert bevegelse.
- Zoom er ikke lenger blokkert. Dempet tekst har kontrast over 4,5:1.

Fortsatt åpent: innholdet i Labben-prompten (`Drepe minst 3`, `IRP`, `Klasse M`, `Seed 7`) er ikke forklart. Eieren må avgjøre hva den skal si. PWA/ikon, dark mode og test på ekte iPhone gjenstår.
