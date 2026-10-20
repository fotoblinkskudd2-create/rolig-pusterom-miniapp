# HULL — Stafett v0.1

Testet 20.10.2026, 15:04–16:00 UTC, i en container uten maskinvare. Her er hva som ble bevist, hva som ble funnet, og hva som ikke er bevist.

## Bevist (kjørt, grønt)

| Test | Resultat | Kommando |
|---|---|---|
| Enhetstester, kjerne (tid, sommertid, JSON, tekstrens, kjølerom, forfall, fravær, logg, kompaktering, API, hjul, fuzzing 30 000 runder) | **156 / 156** med AddressSanitizer + UBSan | `make test` |
| Ende-til-ende: telefon-UI i Chromium mot ekte kjerne | **37 / 37** | `make e2e` |
| ESP32-C3-firmware kompilerer | 1 507 kB (47 % av 3 MB app), 61 kB RAM | `make esp32` |
| CAD: tre deler vanntette (trimesh) | skall 101,6 g, bunn 39,7 g, hjul 15,2 g PETG | `cd cad && python3 render.py` |
| Fremmed-test: ren klon → simulator kjører | **48 s** (inkl. kompilering av 156 tester) | se README |

## Feil funnet og drept underveis

Hver av disse ville ha nådd en ekte bruker.

| # | Feil | Funnet av | Fiks |
|---|---|---|---|
| 1 | Fravær-terskel 6 t → *hver natt* ble vist som «BORTE» | første skjermrender | 12 t. En vanlig natt er ikke tapt tid. |
| 2 | Kjølerom-siden: butikknavn kolliderte med «KLAR»-teksten | skjermrender | bredde regnes fra høyre tekst |
| 3 | Tidslinja rant inn i forklaringen | skjermrender | radhøyde 30 → 27 |
| 4 | Nedtelling viste «47 t» rett etter innlegging | e2e | runder opp: `igjen()` |
| 5 | **API-et brukte telefonens klokke i svaret selv om enheten nektet å stille klokka** → feil nedtelling, feil «borte» | e2e | `sett_klokke` returnerer `bool`; svaret bruker enhetens tid. Enhetstest lagt til. |
| 6 | Parring fungerte ikke hvis siden allerede var åpen (bare hash endres) | e2e | `hashchange`-lytter |
| 7 | Devserver leste `Content-Length` med store/små bokstaver som teller (Node sender det med små) | e2e | hoder leses uten hensyn til store/små bokstaver |
| 8 | Svar sto over noten de svarte på | simulator-skjermbilde | tråder både på telefon og e-blekk |
| 9 | Strømbudsjettet antok dyp søvn, men hjulet (GPIO9) kan ikke vekke C3 fra dyp søvn | firmware-gjennomgang | lett søvn, ny beregning: ~45 døgn på batteri |
| 10 | Wi-Fi alltid på ville tømt batteriet på ~13 t | strømbudsjett | på batteri: Wi-Fi bare 10 min etter trykk |
| 11 | App for stor for standardpartisjon (114 %) | `arduino-cli` | `huge_app`-partisjon, ~896 kB LittleFS til loggen |
| 12 | CAD: FPC-kabelen stakk gjennom frontleppa | render | brettet bakover |

## Ikke bevist (ærlig)

- **Ingenting er kjørt på ekte maskinvare.** SSD1683-driveren følger databladets sekvenser, men er ikke sett på et panel. Første gang den kjøres, er en test.
- **Strømtallene er beregnet fra antatte strømmer**, ikke målt.
- **Kvadraturdekodingen** (EC11) er standard tabellmetode. Ikke testet med ekte prell.
- **Toleransene i kabinettet** (panel-lomme +0,3 mm, EC11-hull 7,4 mm) er ikke printet.
- **Om det hjelper.** Det kan bare én ting vise: fire uker på en ekte pult.

## 60 sekunder for en fremmed

En fremmed kan: klone → `make test` → `make dev` → åpne simulatoren → skrive en note → se den på e-blekkskjermen → legge noe i kjølerommet → trykke **+48 t** → droppe det → se «Latt være: 1 ting · 1 899 kr».
Det er hele produktet. Det tar under ett minutt.

## Neste (ikke denne runden)

1. Bestill 2× panel + 2× ESP32-C3-SuperMini-kort, kjør `epd.h` på ekte.
2. Print kabinettet, mål toleranser, juster `stafett.scad`.
3. KiCad-skjema og PCB fra pinnetabellen i `stafett.ino`.
4. Hjemmenett-modus (STA) i tillegg til eget tilgangspunkt.
5. Fire uker på pulten. Tell noter, kjølerom, drop.
