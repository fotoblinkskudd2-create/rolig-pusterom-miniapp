# MØRKEROM — spesifikasjon v0.1

*Ta bildet. La det ligge. Se det om 48 timer.*

## 1. Hva det er

Et lite kamera uten skjerm, på størrelse med et engangskamera. Du ser gjennom en optisk søker, trykker, og bildet går inn i mørket. 48 timer senere er det fremkalt og vises som et kornete 1-bit-bilde på en 1,54" e-blekk-rute bak. Originalen hentes til telefonen over kameraets eget nett.

```
   ┌──────────────────────────────┐        bak:  ┌────────────────┐
   │ ◯ søker        ▭ utløser     │              │ MØRKEROM  tir  │
   │                              │              │                │
   │        ╭──────╮              │              │       7        │
   │        │  ◉   │ ← objektiv,  │              │   i mørket     │
   │        ╰──────╯   skyvedeksel│              │ neste om 31 t  │
   │                   = av/på    │              │ ────────────── │
   └──────────────────────────────┘              │ I DAG:         │
                                                 │ noe som er     │
                                                 │ varmt          │
                                                 │ 17 igjen · rull│
                                                 └────────────────┘
```

## 2. Prinsipper

1. **Ingen skjerm å se bildet på når det er tatt.** Det er hele mekanikken.
2. **48 timer, per bilde.** Ingen nedtelling på forsiden som maser. Bare *neste* fremkalling.
3. **24 bilder per rull.** Når rullen er full, tar du ikke flere før noen er fremkalt. Knapphet gjør at man ser etter.
4. **Ett oppdrag om dagen.** Valgfritt. Å se etter, ikke å prestere. Ingen poeng, ingen streak.
5. **Ingen sperre er absolutt.** «Fremkall alt nå» ligger bak 10 sekunders hold. Den telles, men ingen dømmer.
6. **Lokal og kryptert.** Bilder ligger AES-256-GCM-kryptert på minnekortet. Kortet alene er ubrukelig. Ingen sky, ingen konto.
7. **Ingen helsepåstander.** Et kamera med en forsinkelse.

## 3. Maskinvare

| Del | Valg | Hvorfor |
|---|---|---|
| MCU | ESP32-S3-WROOM-1-N16R8 (16 MB flash, 8 MB PSRAM) | kamera-grensesnitt (DVP), PSRAM til rammebuffer, AES i maskinvare |
| Sensor | OV5640 5 MP, fast fokus, DVP | JPEG i sensoren, så MCU-en slipper å komprimere |
| Bakskjerm | 1,54" e-blekk 200×200 SSD1681 | null strøm statisk, lesbar ute |
| Søker | optisk rammesøker (to rammer, ingen glass) i v0.1, revers-Galilei (2 akryllinser) i v0.2 | ingen skjerm |
| Knapper | utløser (topp), «bla» (bak) | |
| Av/på | skyvedeksel over objektivet med magnet + hall-sensor | lukket = av, dypsøvn. Åpent = klar. Ingen av/på-knapp å glemme. |
| Lagring | microSD (FAT32) | bildene, kryptert |
| Strøm | LiPo 1 000 mAh, USB-C-lading (TP4056/MCP73831) | |
| Lys | én ravgul LED ved søkeren: blinker mens bildet lagres | ingen blits: blits er påtrengende |

### Strøm (BEREGNET, se `okonomi/strom.py`)

| Tilstand | Strøm (HYPOTESE) |
|---|---|
| Deksel lukket: dypsøvn, RTC | ~15 µA |
| Deksel åpent, sensor i standby | ~45 mA |
| Bilde: oppvåkning + eksponering + JPEG + kryptering + SD | ~260 mA i ~1,2 s |
| E-blekk-oppfrisking | ~8 mA i ~1,5 s |

| Bruk per døgn | mAh/døgn | Batteritid (1 000 mAh, 80 %) |
|---|---:|---:|
| lukket hele døgnet (timesoppvåkning) | 0,89 | begrenset av LiPo-selvutlading, ikke elektronikken |
| 10 min åpent, 3 bilder | 8,7 | ~92 døgn |
| 30 min åpent, 8 bilder | 24,1 | ~33 døgn |
| 2 t åpent, 24 bilder | 93,0 | ~9 døgn |

Åpent deksel er den store posten. Derfor er dekselet av/på-bryteren: lukker du det, sover kameraet.

## 4. Programvare

```
firmware/
  core/       ← ren C++17, testet på vertsmaskin
    rull.*      ← bilder, rull, fremkallingsklokke, hendelseslogg
    oppdrag.h   ← 64 oppdrag, ett per dag (deterministisk fra dato)
    dither.*    ← skalering + Atkinson-dithering til 1-bit
    krypt.*     ← AES-256-GCM-konvolutt (mbedTLS, samme API på vert og ESP32)
    view.*      ← 200×200-skjermene
    enhet.*     ← utløser, bla, deksel, tidtakere
    api.*       ← telefonens fremkallingsrom
  esp32/      ← Arduino-sketch: kamera, SD, SSD1681, knapper, Wi-Fi
  test/       ← enhetstester + e2e
  tools/      ← devserver (simulator), render
felles/       ← json, tid, Ramme<W,H>, fonter (delt med Stafett)
```

### Filformat på minnekortet

```
/MORKEROM/
  logg.jsonl          hendelser (tatt, fremkalt, tvunget, ny rull)
  B0001.mrk           MRK1 | nonce(12) | tag(16) | AES-256-GCM(JPEG)
  B0001.d1            fremkalt 1-bit-bilde, 200×150, ukryptert *først etter* fremkalling
```

Nøkkelen (32 byte) lages ved første oppstart med `esp_random()` og lagres i NVS på ESP32 (flash-kryptering på i produksjon). Hvert bilde får sin egen nonce. Tilleggsdata (AAD) = bilde-id, så en fil ikke kan byttes med en annen.

### Telefonens fremkallingsrom (`http://morkerom.local`, kameraets eget nett)

| Metode | Sti | Hva |
|---|---|---|
| GET | `/` | Fremkallingsrommet (én HTML-fil) |
| GET | `/api/state?now=` | rull, i mørket (uten innhold), fremkalte, dagens oppdrag |
| GET | `/api/bilde/:id.jpg` | original, dekryptert i farta. **403 hvis ikke fremkalt.** |
| GET | `/api/bilde/:id.pbm` | fremkalt 1-bit-versjon |
| GET | `/api/kontaktark.pbm` | alle fremkalte på ett ark |
| POST | `/api/fremkall-alt` | `{bekreft:true}`: tvunget fremkalling (telles) |

Nøkkel i QR (hold «bla» 3 s), som i Stafett.

## 5. Kabinett

110 × 62 × 34 mm, rundede kanter, objektiv til venstre for midten (som et engangskamera), skyvedeksel, søker øverst til venstre, utløser øverst til høyre, e-blekk-rute og «bla»-knapp bak, USB-C på siden, hull til håndleddsreim. Se `cad/morkerom.scad`.

## 6. Hva det ikke gjør

- Ingen deling, ingen opplasting, ingen sosiale funksjoner.
- Ingen skjerm å se bilder på før de er fremkalt, heller ikke på telefonen. API-et nekter.
- Ingen ansiktsgjenkjenning, ingen KI, ingen metadata utover tidspunkt og dagens oppdrag.
