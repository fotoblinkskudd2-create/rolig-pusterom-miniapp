# VINDUSVAKT — spesifikasjon v0.1

*Verden fortsatte. Her er beviset.*

## 1. Hva den er

En 7,5" e-blekk-ramme som står i vinduskarmen. Skjermen vender inn mot rommet. Bak sitter et lite kamera som ser ut av vinduet. Én gang i timen våkner rammen, ser ut, beholder et 112 × 84 piksler svart-hvitt bilde og en lysverdi, og sovner igjen. Foran viser den:

| Side | Innhold |
|---|---|
| **Uka i vinduet** | 7 dager × 4 tider (08, 12, 16, 20). Dagens lys i én linje under. |
| **I dag** | Siste bilde stort (336 × 252), dagslengde eller *dager til sola* i mørketida, blåtime, lyskurven for de siste 7 døgnene. |
| **Året** | Dagslengden for hele året på dette stedet, med en prikk: *du er her*. Mørketid skravert. |

Én knapp blar. Hold den i 3 sekunder for å koble til telefonen (QR, eget nett i 10 min).

## 2. Prinsipper

1. **Originalbildet finnes ikke.** OV2640 leverer 320 × 240 gråtoner rett fra sensoren, ingen JPEG. Det som lagres, er 1-bit 112 × 84 og 336 × 252 (bare det siste). En person 20 m unna er 1–2 piksler.
2. **Ingen tekst om deg.** Ingen «dager inne», ingen streak. Bare verden og lyset.
3. **Linsedeksel = privat.** Skyv det over linsa, så tar rammen ingen bilder. En hall-bryter merker det. Skjermen sier «LINSE LUKKET».
4. **Ingen nett ut.** Sola regnes ut lokalt (NOAA-algoritmen). Stedet settes én gang fra telefonen.
5. **Ingen helsepåstander om lys.**

## 3. Maskinvare

| Del | Valg | Hvorfor |
|---|---|---|
| MCU | ESP32-S3-WROOM-1-N16R8 | DVP-kamera, PSRAM, dyp søvn ~15 µA |
| Sensor | OV2640, vidvinkel, fast fokus på uendelig | gråtoner i sensoren; 2 MP er mer enn nok når vi bare beholder 112 × 84 |
| Skjerm | 7,5" 800 × 480 UC8179 (GDEY075T7-klasse) | stor nok til 28 miniatyrer; null strøm statisk |
| Strøm | LiPo 2 000 mAh + USB-C | ingen kabel i vinduskarmen |
| Linsedeksel | skyvedeksel + magnet + hall-bryter | privat-bryter du kan se |
| Kabinett | ramme 194 × 149 × 18 mm, sokkel 204 × 44 × 9 mm, 10° bakover | står støtt på en smal karm |

### Strøm (BEREGNET, se `okonomi/strom.py`)

| Bruk | mAh/døgn | Batteritid (2 000 mAh, 80 %) |
|---|---:|---:|
| normal (ett bilde i timen, 6 sidebytter) | 4,6 | **~352 døgn** |
| mye bruk (20 bytter) | 5,2 | ~306 døgn |
| med 10 min telefon per døgn | 21,2 | ~75 døgn |

## 4. Programvare

```
firmware/core/   arkiv (8 døgn, binærformat VVA1), view (800×480: uke, i dag, året, tilkobling), enhet, api
felles/          sol.h (NOAA: opp/ned, blåtime, mørketid, midnattssol), dither (Atkinson), ramme, fonter, QR
firmware/tools/  scene.h (simulert utsikt der lyset følger ekte solhøyde), devserver, render
```

### Telefon (`http://vindusvakt.local`, rammens eget nett)

| Metode | Sti | Hva |
|---|---|---|
| GET | `/api/state?now=` | sted, sol i dag, dager til sola, liste over prøver (tid + lys) |
| GET | `/api/prove/<ts>.pbm` | én miniatyr |
| GET | `/api/stor.pbm` | siste store bilde |
| GET | `/api/skjerm.pbm` | det skjermen viser |
| POST | `/api/sted` | `{navn, lat_u, lon_u}` (millionedels grader) |

Nøkkel i QR, som i Stafett og Mørkerom.

## 5. Hva den ikke gjør

- Ingen video, ingen bevegelsesdeteksjon, ingen varsler, ingen opplasting.
- Ingen lagring av originalbilder. Det finnes ikke kode for det.
- Ingen værmelding. Bare lyset som faktisk kom.
