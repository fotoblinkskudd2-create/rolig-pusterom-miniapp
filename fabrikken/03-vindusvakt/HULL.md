# HULL — Vindusvakt v0.1

Testet 20.10.2026, ca. 16:35–17:00 UTC, i en container uten vindu, kamera eller panel.

## Bevist (kjørt, grønt)

| Test | Resultat | Kommando |
|---|---|---|
| Enhetstester: sol mot kjente verdier (Oslo 21.06 og 21.12 ±3 min, Tromsø mørketid 28.11–15.01, midnattssol, Svalbard uten blåtime, ekvator 12 t), arkiv (sortering, 8 døgn, binærformat, fuzzing), prøver (natt forblir natt), sted (grenser, UTF-8-kutt), enhet (ett bilde per time, linsedeksel, kamerafeil), API, alle sider i fire scenarier | **125 / 125** med ASan + UBSan | `make test` |
| Ende-til-ende: telefon i Chromium mot ekte kjerne; hopp fra oktober inn i mørketida i Tromsø, time for time | **30 / 30** | `make e2e` |
| ESP32-S3-firmware kompilerer | 1 414 kB (44 %), 111 kB RAM | `make esp32` |
| CAD: fem deler vanntette | front 65,6 g, bak 76,4 g, sokkel 63,1 g PETG | `cd cad && python3 render.py` |
| Fremmed-test: ren klon → simulator | **40 s** | se README |

## Feil funnet og drept

| # | Feil | Funnet av | Fiks |
|---|---|---|---|
| 1 | Midnattssol sa «Lyset står stille i dag» | skjermrender | viser nå når sola går ned igjen («ikke før 26. jul») |
| 2 | Mørketidsteksten sa at kurven «har snudd» før 21. desember | lesing av render | to tekster: før og etter solverv |
| 3 | **`PI` kolliderte med Arduino.h-makroen**: delt kode kompilerte på vert, ikke på ESP32 | `arduino-cli` | `PI_` |
| 4 | Render-verktøyet skrev stille til en mappe med samme navn som programmet | tom render-mappe | ny mappe; verktøyet avslutter med feil hvis det ikke kan skrive |
| 5 | Bakdekselet var ikke vanntett (skinner og ring berørte platen flate mot flate) | trimesh | 0,2 mm overlapp |
| 6 | Foten ble en loddrett plate, ikke en kile | render | sokkel med skrå spalt |
| 7 | To egne feil i testene (PBM-hode 10 tegn, timeavstand ±ms) | testkjøring | testene rettet |

Feil 3 viser hvorfor ESP32-bygget er en del av testen, ikke et steg etterpå. Delt kode som bare bygger på vertsmaskinen, er ikke delt kode.

## Ikke bevist

- **Ingenting har kjørt på maskinvare.** UC8179-polariteten er merket HYPOTESE i driveren.
- **Utsikten er simulert.** Lyset følger ekte solhøyde, men ekte vinduer har refleksjoner, dugg, snø på ruta og naboens lys.
- **Juridisk status** (kamera mot offentlig område): UAVKLART.
- **Kulde:** LiPo-lading under 0 °C er ikke håndtert i firmware. Må på plass før noen setter den i et vindu i Karasjok.

## Neste

1. Spør Datatilsynet med SPEC.md §2 som vedlegg.
2. Panel + Freenove S3-CAM i et nordvendt vindu i Tromsø, 1. desember–15. januar.
3. Temperatursensor og ladesperre under 0 °C.
