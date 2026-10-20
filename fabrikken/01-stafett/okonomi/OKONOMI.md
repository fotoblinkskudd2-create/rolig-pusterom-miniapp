# STAFETT — økonomi v0.1

*Generert av `okonomi/modell.py`. Endre tallene der, ikke her.*

Merking: **DOKUMENTERT** = sett i en kilde i dag. **BEREGNET** = regnet ut fra andre tall. **HYPOTESE** = mitt anslag. **UAVKLART** = vet ikke. Valuta: 1 USD = 10.6 NOK (HYPOTESE).

## Stykkliste (BOM)

| Del | USD @1 | USD @500 | Merking | Kilde / kommentar |
|---|---:|---:|---|---|
| E-blekk 4,2" 400×300 SSD1683 | 24.95 | 14.00 | DOKUMENTERT / HYPOTESE | Adafruit 6381 $24,95 (1–9 stk); 500-pris er anslag mot fabrikk |
| E-blekk-booster: FPC 24p 0,5 mm, spole 10 µH, MOSFET, 3 dioder, 9 kond. | 2.20 | 0.75 | HYPOTESE | råpanel krever ekstern boost (som Waveshare-driverkortet) |
| Strømvei: Schottky + P-MOSFET (USB/batteri) | 0.40 | 0.12 | HYPOTESE | lastdeling mens den lader |
| ESP32-C3-MINI-1-N4 | 1.29 | 1.01 | DOKUMENTERT | LCSC C2838502: $1,29 (1+), $1,01 (100+) |
| Kretskort 2-lag 100×50 | 2.00 | 0.45 | HYPOTESE | typisk kinesisk prototyp-/serie-pris |
| Montering (PCBA) + passive | 8.00 | 2.20 | HYPOTESE |  |
| EC11 enkoder m/trykk | 1.20 | 0.35 | HYPOTESE |  |
| LiPo 1200 mAh 503450 | 6.00 | 2.40 | HYPOTESE | med beskyttelseskrets |
| MCP73831 + ME6211 + krystall | 1.10 | 0.35 | HYPOTESE |  |
| USB-C kontakt | 0.40 | 0.12 | HYPOTESE |  |
| NFC-merke NTAG213 | 0.18 | 0.09 | DOKUMENTERT | 100-pk NTAG213 $9,20 (Walmart); NTAG215 $17,99 |
| Stålplate 80×60×4 (laser) | 4.00 | 0.90 | HYPOTESE | 151 g S235 |
| Kabinett: skall+bunn+hjul (PETG) | 9.00 | 4.50 | BEREGNET / HYPOTESE | 157 g PETG fra CAD; print-farm-pris anslått |
| Skruer M3, innpressmuttere, føtter | 1.00 | 0.30 | HYPOTESE |  |
| Emballasje + trykt kort | 2.50 | 1.10 | HYPOTESE | ingen kabel i esken (de fleste har USB-C) |
| **Sum** | **64.22** | **28.64** | BEREGNET | |

## Enhetskost levert lager (inkl. innfrakt/import + 12 min montering à 450 kr/t)

| Volum | NOK per stk |
|---|---:|
| 1 | 941 |
| 50 | 418 |
| 500 | 418 |

## Pris og dekningsbidrag (500 stk)

| | Ferdig | Bygg-selv-sett |
|---|---:|---:|
| Pris inkl. mva | 1490 kr | 690 kr |
| Pris eks. mva | 1 192 kr | 552 kr |
| Varekost | 418 kr | 289 kr |
| Frakt ut  kortgebyr  retur | 184 kr | 133 kr |
| **Dekningsbidrag per stk** | **590 kr** | **130 kr** |
| Bruttomargin | 49 % | 24 % |

## Engangskostnader

| Post | NOK | Merking | Kommentar |
|---|---:|---|---|
| CE: RED + EMC + LVD + RoHS (lab  modulær vei) | 60 000 | HYPOTESE | $1 200 RED + $500 EMC hos én leverandør; europeisk lab dyrere  så x3 buffer |
| EN 18031 cybersikkerhet (RED art. 3.3) | 40 000 | UAVKLART | ikke dekket av søk; anslag |
| Prototyper (5 runder PCB + print) | 15 000 | HYPOTESE |  |
| Fotografering  nettside  tekst | 10 000 | HYPOTESE |  |
| Buffer 15 % | 18 750 | BEREGNET |  |
| **Sum** | **143 750** | BEREGNET | |

**Break-even: 244 ferdige enheter** (BEREGNET). Første batch på 500 gir 151 135 kr etter engangskostnader  *før* lønn til deg.

## Tre ting tallene sier rett ut

1. **Prototypen koster ca. 941 kr i deler og tid.** Det er prisen for å finne ut om dette i det hele tatt hjelper. Den bør bygges før noe annet bestilles.
2. **CE/RED er den store fasten, ikke verktøy.** Med 3D-print / print-farm til 500 stk slipper vi sprøytestøpeform (HYPOTESE: 150–250k for to deler). Det er den riktige veien for et produkt med ukjent etterspørsel.
3. **Ikke selg den på Klarna.** Målgruppen er mennesker som kjøper impulsivt på kreditt. Kassen skal ha kort og Vipps, ingen delbetaling, og en egen 48 t-knapp: *«Legg i kjølerommet i stedet»*. Det koster salg. Det er hele poenget.

## Programvaren er gratis

Kjernen (overlevering + kjølerom + forfall) kan kjøres som telefon-app uten maskinvare. Den bør gis bort som del av Pusterom. Maskinvaren selges til dem som trenger en *fysisk* ting i rommet — noe som står der når telefonen er i en annen dels lomme. HYPOTESE: det er der verdien er, og det er det prototypen må teste.

