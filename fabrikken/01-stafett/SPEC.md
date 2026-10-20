# STAFETT — spesifikasjon v0.1

*Den som tar over, får vite hva som skjedde.*

## 1. Hva den er

En kile på pulten. 4,2" e-blekk, ett stort hjul, ingen kamera, ingen mikrofon, ingen sky.
Skjermen står alltid på uten å bruke strøm. Det den viser, er det første du ser når du kommer tilbake:

```
┌──────────────────────────────────────────┐
│ STAFETT                 tir 20.10  15:41 │
├──────────────────────────────────────────┤
│ SIST UTE  14:02 · ukjent del             │
│ Kjøpte Lego på Klarna. Beklager. Den     │
│ kommer torsdag. Ikke åpne før du har     │
│ spist.                                   │
├──────────────────────────────────────────┤
│ KJØLEROM                                 │
│ ▢ Robotstøvsuger   3 490 kr    31 t igjen│
│ ▢ Lego 10316       1 899 kr    klar ✓    │
├──────────────────────────────────────────┤
│ NESTE FORFALL  28.10  Klarna   1 412 kr  │
│ BORTE  i går 18:10 → i dag 09:30 (15 t)  │
├──────────────────────────────────────────┤
│ ◉ trykk: jeg er her        stafett.local │
└──────────────────────────────────────────┘
```

## 2. Prinsipper (ufravikelige)

1. **Lokal.** Data lever i enhetens flash. Ingen internett-tilkobling brukes, noensinne. Ingen konto.
2. **Ingen del kan slette en annen dels overlevering.** Noter kan *besvares*, ikke fjernes. (Full sletting = fabrikkreset med hjulet holdt inne i 10 s, med bekreftelse på skjerm.)
3. **Kjølerommet nekter ingenting.** Det viser bare en nedtelling på 48 t og spør igjen når tiden er ute: *kjøp / dropp / 48 t til*. Passiv mekanikk.
4. **Gjeld er en plan, ikke en alarm.** Bare *neste* forfall vises. Ingen totalsum på forsiden.
5. **Ingen helsepåstander.** Stafett er en notatbok med skjerm.

## 3. Maskinvare

| Del | Valg | Hvorfor |
|-----|------|---------|
| MCU | ESP32-C3-MINI-1-N4 (RISC-V 160 MHz, 400 KB SRAM, 4 MB flash, Wi-Fi 4, BLE 5) | Billig, lavt strømforbruk, nok RAM for 15 KB rammebuffer |
| Skjerm | 4,2" 400×300 sort/hvit e-blekk, SSD1683-kontroller (f.eks. Good Display GDEY042T81) | Delvis oppfrisking (~0,4 s), lesbar i dagslys, null strøm statisk |
| Inndata | EC11 roterende enkoder med trykk, 20 hakk, Ø32 mm aluminiumsknott | Ett grep for alt. Fungerer når hendene skjelver. |
| Klokke | 32,768 kHz krystall på XTAL_32K | ±20 ppm ≈ 1,7 s/døgn. 48 t-nedtellinger må stemme uten internett. Tid settes fra telefonen ved hver tilkobling. |
| Strøm | USB-C 5 V (alltid på) + 1 200 mAh LiPo som reserve | Overlever strømbrudd og flytting. |
| Lading | MCP73831 (500 mA) | Enkel, robust |
| Regulator | ME6211C33 LDO 3,3 V, 500 mA | Lav hvilestrøm (40 µA) |
| NFC | NTAG213-klistremerke under logoen (passiv, ingen elektronikk) | Telefon mot logoen → åpner `http://stafett.local/kjol`. ~1 kr. |
| Vekt | Stålplate 80×60×4 mm i bunnen (~150 g) | Kilen skal ikke gli når du trykker på hjulet |

### Strømbudsjett (BEREGNET fra antatte strømmer, se `okonomi/strom.py`)

**På USB (normaldrift):** alltid våken, Wi-Fi alltid på, skjermen oppdateres hvert minutt.

**På batteri (strømbrudd, flytting):** lett søvn mellom oppdateringer (dyp søvn er umulig: hjulknappen sitter på GPIO9, som ikke kan vekke C3 fra dyp søvn). Wi-Fi er *av* — 90 mA ville tømt batteriet på ~13 t.
Trykk på hjulet vekker Wi-Fi i 10 minutter, så telefonen kan koble til. Klokka går videre på 32 kHz-krystallen.

| Oppdatering på batteri | mAh/døgn | Batteritid (1 200 mAh, 80 % brukbart) |
|---|---:|---:|
| hvert minutt | 31,1 | ~31 døgn |
| hvert 5. minutt (standard på batteri) | 21,5 | ~45 døgn |
| bare ved endring | 19,4 | ~49 døgn |

Wi-Fi-økter (10 min/døgn) er den største posten. HYPOTESE til den er målt på ekte maskinvare.

### Komponentrisiko

- **ESP32-C3-MINI-1 er merket «Not For New Designs» hos Digi-Key** (DOKUMENTERT 20.10.2026). LCSC har fortsatt lager. Kjernen er ren C++ uten Arduino-avhengigheter, så flytting til ESP32-C6-MINI-1 eller ESP32-C3-MINI-1U er en ny HAL-fil, ikke en omskriving. Må avklares før PCB-revisjon 2.
- NFC: **NTAG213** holder (URL-en er 24 byte). Billigere enn NTAG215.

## 4. Programvare

```
firmware/
  core/        ← ren C++17, ingen Arduino. Testes på vertsmaskin.
    model.h    ← Overlevering, KjolItem, Forfall, Tilstedemerke
    store.*    ← append-only logg (JSON Lines) med kompaktering
    kjol.*     ← 48 t-logikk, tilstander
    view.*     ← layout → 1-bit rammebuffer 400×300
    font_*.h   ← generert fra Inter (æøå inkludert)
  esp32/       ← Arduino-sketch: SSD1683-driver, enkoder, Wi-Fi, HTTP-API
  test/        ← enhetstester (ingen rammeverk, egen mini-assert)
  tools/       ← render-CLI: tilstand.json → skjerm.png (samme kode som enheten)
```

### HTTP-API (enheten serverer, kun lokalt nett / eget AP)

| Metode | Sti | Kropp | Svar |
|--------|-----|-------|------|
| GET | `/` | — | Telefon-UI (én HTML-fil, gzip i flash) |
| GET | `/api/state?now=<ms>` | — | Hele tilstanden + setter klokka |
| POST | `/api/handoff` | `{del, tekst}` | ny overlevering |
| POST | `/api/handoff/:id/svar` | `{del, tekst}` | svar på en note |
| POST | `/api/kjol` | `{ting, ore, butikk, del}` | nytt kjølerom-element |
| POST | `/api/kjol/:id` | `{valg: kjop\|dropp\|forleng}` | avgjørelse (bare når nedtelling er ferdig, unntatt *dropp*) |
| POST | `/api/forfall` | `{navn, ore, dato, maanedlig}` | nytt forfall |
| POST | `/api/her` | `{del}` | tilstedemerke (samme som trykk på hjulet) |
| GET | `/api/eksport.txt` | — | alt, lesbart, én fil |
| GET | `/skjerm.pbm` | — | nåværende skjermbilde (for test) |

Alle `/api/*` krever nøkkel (header `X-Stafett-Nokkel` eller `?k=`). Nøkkelen genereres ved første oppstart og ligger i QR-koden (hold hjulet 3 s). Telefonen husker den. Uten nøkkel: 401 og en forklaring, ingen data.

### Hjulet

| Handling | Virkning |
|----------|----------|
| Trykk | «Jeg er her»: tilstedemerke med tid. Skjermen viser «Hei. Du var borte i 15 t.» i 5 s. |
| Vri | Bla mellom sider: Oversikt → Noter → Kjølerom → Tidslinje |
| Hold 3 s | Viser QR-kode for `http://stafett.local` + AP-passord |
| Hold 10 s | Fabrikkreset (krever trykk igjen for å bekrefte) |

### «Borte»-deteksjon

Mellomrom mellom to tilstedemerker / telefon-aktiviteter > 12 t (justerbart; 6 t ga falsk «borte» hver natt i første render-test) vises som **BORTE**-linje. Ingen tolkning. Bare tid. Den som kommer tilbake, får vite hvor lenge.

## 5. Kabinett

Kile, 128 × 96 × 52 mm, skjermflate 22° bakover. PETG-print for prototyp, 2 deler + bunnplate.
Se `cad/stafett.py` (parametrisk build123d), `cad/out/*.step|stl`, `cad/render/*.png`.

## 6. Hva den ikke gjør

- Kobler seg ikke til bank, Klarna eller BankID. Du legger inn kjøp og forfall selv, eller en del gjør det.
- Diagnostiserer ikke, minner ikke om medisiner, varsler ingen.
- Har ikke mikrofon eller kamera. Kan ikke bli et overvåkingsverktøy.
