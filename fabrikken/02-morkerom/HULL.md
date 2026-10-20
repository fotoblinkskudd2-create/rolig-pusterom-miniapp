# HULL — Mørkerom v0.1

Testet 20.10.2026, ca. 15:55–16:30 UTC, i en container uten kamera og uten loddebolt.

## Bevist (kjørt, grønt)

| Test | Resultat | Kommando |
|---|---|---|
| Enhetstester: oppdrag (unike per 64 dager, sommertid, linjebredde), rull (48 t, full rull, tvang, kast, avspilling), Atkinson (svart/hvit/grå, gradient monotont, beskjæring), AES-GCM (rundtur, bitflipp, byttet fil, feil nøkkel), enhet + API (403 i mørket), alle skjermer, fuzzing | **2 290 / 2 290** med ASan + UBSan | `make test` |
| Ende-til-ende: fremkallingsrom i Chromium mot ekte kjerne og ekte kryptering | **44 / 44** | `make e2e` |
| ESP32-S3-firmware kompilerer | 1 438 kB (45 % av 3 MB), 72 kB RAM | `make esp32` |
| CAD: fem deler vanntette | front 31,6 g, bak 22,9 g, deksel 1,9 g, knapper 0,6 g PETG | `cd cad && python3 render.py` |
| Fremmed-test: ren klon → bilde i mørket | **46 s** | se README |

## Det e2e-testen beviser om mørket

- API-et nekter både original og 1-bit (403) for alt som ikke er fremkalt.
- `/api/state` avslører bare *når* noe fremkalles, aldri id eller innhold.
- Filen på «minnekortet» starter med `MRK1` og inneholder ingen JPEG-markør. Størrelsen er nøyaktig JPEG + 32 byte.
- Etter 48 timer er originalen byte for byte lik det kameraet så.
- Etter omstart: samme tilstand, og originalen kan fortsatt dekrypteres (nøkkelen overlever).

## Feil funnet og drept

| # | Feil | Funnet av | Fiks |
|---|---|---|---|
| 1 | Ukjente GET-stier (`/api/bilde/../x.jpg`) ga 405 i stedet for 404 | enhetstest | GET uten treff = 404 |
| 2 | **`display: inline-block` på knapper overstyrte `hidden`**: «Ja, fremkall», «Nei» og «Ja, kast for godt» var synlige hele tiden. Ett feiltrykk = bildet kastet. | skjermbilde fra e2e | `[hidden] { display: none !important }` + e2e-sjekker på synlighet |
| 3 | Lysbordet var gjennomsiktig: siden bak skinte gjennom | skjermbilde | ugjennomsiktig bakgrunn |
| 4 | Kontaktark sort-på-sort: mørke bilder forsvant | skjermbilde | hvitt ark, sort ramme per bilde |
| 5 | CAD: aktivt e-blekk-felt lå på feil side av panelet (inne i kameraet) | render uten skjermbilde | snudd |
| 6 | CAD: grep foran kolliderte med åpent deksel | render | grep fjernet |
| 7 | Tre egne regnefeil i testene (tvunget-antall, PBM-hode, kontaktarkbredde) | testkjøring | testene rettet; koden var riktig |

Feil 2 er den viktigste i hele runden. Den ville ha kastet et bilde noen hadde ventet 48 timer på.

## Ikke bevist

- **Ingenting har kjørt på et ekte kamera.** OV5640-oppsettet, `jpg2rgb565` i 1/8-skala og SSD1681-sekvensen følger dokumentasjon og eksempler, men er ikke sett i drift.
- **Bildene er prosedyriske**, ikke fotografier. Ditheringen er testet på dem og på syntetiske gradienter, ikke på ekte sensorstøy.
- **Strømtall er beregnet** fra antatte strømmer.
- **Optikken** (rammesøker, objektivring) er tegnet, ikke printet.
- **Om 48 t er riktig**, og om oppdragene brukes. Det må prøves på ekte folk.

## Neste (ikke denne runden)

1. Freenove ESP32-S3-CAM (har OV5640-sokkel og SD) + 1,54"-panel: kjør firmwaren uendret.
2. Print kabinettet. Mål søkerens utsnitt mot sensorens synsfelt.
3. To prototyper, 24 t og 48 t, hos to personer i to uker.
