# Systemvarianter – modellresultater [modell]

Generert av `varianter.py` fra `problem.py` og `beste.json`. Alle tall er `[modell]` og bygger på antakelsene i `problem.py`. Ingenting er målt. Netto kostnad < 0 betyr at varianten sparer penger.

### Sykehjem, mid (nominelle antakelser)

| Variant | Poeng | QALY/100/år | Netto kommune kr/beb/år | Netto samfunn kr/beb/år | ICER kr/QALY | Fall/1000 døgn | Hoftebrudd/100/år | Frigjort t/beb/år | Kontakt min/døgn | Falske alarmer/beb/natt |
|---|---|---|---|---|---|---|---|---|---|---|
| A Dagens praksis (fast 2 t-runde) | 0.189 | 0.00 | 0 | 0 | – | 3.75 | 2.88 | 0.00 | 0.00 | 0.00 |
| B Radar-tilsyn, tid tatt ut som kutt (referanse) | 0.633 | 1.42 | -6 506 | -6 853 | dominant (sparer) | 3.63 | 2.79 | 31.60 | 0.00 | 0.14 |
| C «Stille vakt» kjerne | 0.807 | 4.02 | 558 | -1 536 | dominant (sparer) | 3.03 | 2.32 | 34.60 | 3.50 | 0.04 |
| D «Stille vakt» full (beste.json: + kosedyr, smartkopp, Resyone) | 0.824 | 4.82 | 2 093 | 0 | dominant (sparer) | 3.03 | 2.32 | 38.10 | 3.80 | 0.04 |
| P «Stille vakt» pilot (anbefalt: kjerne + kosedyr) | 0.812 | 4.29 | 757 | -1 337 | dominant (sparer) | 3.03 | 2.32 | 34.10 | 3.40 | 0.04 |
| E Kjerne med radar i kantmodul (SV-1R) | 0.796 | 4.12 | 1 568 | -702 | dominant (sparer) | 2.97 | 2.28 | 34.40 | 3.40 | 0.04 |
| F Kjerne, men all frigjort tid tas ut som kutt | 0.758 | 2.92 | -7 525 | -9 619 | dominant (sparer) | 3.03 | 2.32 | 34.60 | 0.00 | 0.04 |
| G Japansk robotpakke (kamera m/samtykke, PARO, Resyone, HAL, DFree) | 0.379 | 1.63 | 5 714 | 5 328 | 327 484 | 3.62 | 2.78 | 18.70 | 1.50 | 0.14 |
| H Kontakttid uten sensor (fast 3 t + MOBID-2 + kontakt) | 0.717 | 2.19 | -381 | -1 603 | dominant (sparer) | 3.33 | 2.55 | 14.40 | 1.40 | 0.00 |

### Sykehjem, pessimistisk (effekter / 1,3, kost og tidsbruk × 1,3)

| Variant | Poeng | QALY/100/år | Netto kommune kr/beb/år | Netto samfunn kr/beb/år | ICER kr/QALY | Fall/1000 døgn | Hoftebrudd/100/år | Frigjort t/beb/år | Kontakt min/døgn | Falske alarmer/beb/natt |
|---|---|---|---|---|---|---|---|---|---|---|
| A Dagens praksis (fast 2 t-runde) | 0.189 | 0.00 | 0 | 0 | – | 3.75 | 2.88 | 0.00 | 0.00 | 0.00 |
| B Radar-tilsyn, tid tatt ut som kutt (referanse) | 0.613 | 1.12 | -1 032 | -1 299 | dominant (sparer) | 3.66 | 2.81 | 22.50 | 0.00 | 0.14 |
| C «Stille vakt» kjerne | 0.659 | 2.83 | 4 702 | 3 063 | 108 410 | 3.19 | 2.44 | 22.30 | 2.20 | 0.04 |
| D «Stille vakt» full (beste.json: + kosedyr, smartkopp, Resyone) | 0.639 | 3.42 | 7 089 | 5 451 | 159 407 | 3.19 | 2.44 | 24.20 | 2.40 | 0.04 |
| P «Stille vakt» pilot (anbefalt: kjerne + kosedyr) | 0.663 | 3.04 | 4 960 | 3 322 | 109 335 | 3.19 | 2.44 | 21.70 | 2.20 | 0.04 |
| E Kjerne med radar i kantmodul (SV-1R) | 0.623 | 2.92 | 6 052 | 4 268 | 146 132 | 3.14 | 2.41 | 22.00 | 2.20 | 0.04 |
| F Kjerne, men all frigjort tid tas ut som kutt | 0.729 | 2.26 | -512 | -2 151 | dominant (sparer) | 3.19 | 2.44 | 22.30 | 0.00 | 0.04 |
| G Japansk robotpakke (kamera m/samtykke, PARO, Resyone, HAL, DFree) | 0.239 | 1.13 | 9 824 | 9 528 | 846 050 | 3.65 | 2.80 | 12.60 | 1.00 | 0.14 |
| H Kontakttid uten sensor (fast 3 t + MOBID-2 + kontakt) | 0.630 | 1.48 | 1 379 | 436 | 29 429 | 3.43 | 2.63 | 7.40 | 0.70 | 0.00 |

### Hjemmetjeneste (100 brukere med nattlig tilsyn), mid

| Variant | Poeng | QALY/100/år | Netto kommune kr/beb/år | Netto samfunn kr/beb/år | ICER kr/QALY | Fall/1000 døgn | Hoftebrudd/100/år | Frigjort t/beb/år | Kontakt min/døgn | Falske alarmer/beb/natt |
|---|---|---|---|---|---|---|---|---|---|---|
| A Dagens praksis (fast 2 t-runde) | 0.189 | 0.00 | 0 | 0 | – | 2.19 | 1.60 | 0.00 | 0.00 | 0.00 |
| B Radar-tilsyn, tid tatt ut som kutt (referanse) | 0.650 | 1.73 | -58 599 | -58 630 | dominant (sparer) | 2.18 | 1.59 | 168 | 0.00 | 0.14 |
| C «Stille vakt» kjerne | 0.924 | 6.91 | -20 891 | -22 059 | dominant (sparer) | 1.83 | 1.33 | 183 | 18.20 | 0.04 |
| D «Stille vakt» full (beste.json: + kosedyr, smartkopp, Resyone) | 0.926 | 7.18 | -20 235 | -21 404 | dominant (sparer) | 1.83 | 1.33 | 182 | 18.10 | 0.04 |
| P «Stille vakt» pilot (anbefalt: kjerne + kosedyr) | 0.925 | 7.01 | -20 692 | -21 861 | dominant (sparer) | 1.83 | 1.33 | 182 | 18.20 | 0.04 |
| E Kjerne med radar i kantmodul (SV-1R) | 0.912 | 7.16 | -19 819 | -21 004 | dominant (sparer) | 1.82 | 1.33 | 183 | 18.20 | 0.04 |
| F Kjerne, men all frigjort tid tas ut som kutt | 0.767 | 3.12 | -63 617 | -64 786 | dominant (sparer) | 1.83 | 1.33 | 183 | 0.00 | 0.04 |
| G Japansk robotpakke (kamera m/samtykke, PARO, Resyone, HAL, DFree) | 0.715 | 3.52 | -17 879 | -17 969 | dominant (sparer) | 2.16 | 1.58 | 128 | 10.50 | 0.14 |
| H Kontakttid uten sensor (fast 3 t + MOBID-2 + kontakt) | 0.864 | 4.52 | -13 436 | -14 221 | dominant (sparer) | 1.95 | 1.42 | 106 | 10.50 | 0.00 |

### Hvor kommer QALY-gevinsten fra? (pilotvariant P, sykehjem, mid)

| Kilde | QALY/100/år | Andel |
|---|---|---|
| sovn | 1.24 | 29 % |
| kontakt | 1.05 | 25 % |
| smerte | 0.92 | 21 % |
| fall | 0.35 | 8 % |
| toalett | 0.30 | 7 % |
| selskap | 0.28 | 7 % |
| trykksaar | 0.07 | 2 % |
| liggetid | 0.04 | 1 % |
| drikke | 0.03 | 1 % |
| forflytning | 0.00 | 0 % |

| Kostnadspost | NOK/år per 100 beboere |
|---|---|
| sensor | 282 610 |
| opplaering | 245 700 |
| infrastruktur | 73 690 |
| toalett | 67 380 |
| smertebehandling | 34 320 |
| selskap | 12 000 |
| **Brutto** | **715 700** |
