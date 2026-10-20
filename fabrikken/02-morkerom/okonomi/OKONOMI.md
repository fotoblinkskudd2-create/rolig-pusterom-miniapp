# MØRKEROM — økonomi v0.1

*Generert av `okonomi/modell.py`. Endre tallene der, ikke her.*

Merking: **DOKUMENTERT** = sett i en kilde i dag. **BEREGNET** = regnet ut fra andre tall. **HYPOTESE** = mitt anslag. **UAVKLART** = vet ikke. Valuta: 1 USD = 10.6 NOK (HYPOTESE).

## Stykkliste (BOM)

| Del | USD @1 | USD @500 | Merking | Kilde / kommentar |
|---|---:|---:|---|---|
| ESP32-S3-WROOM-1-N16R8 | 4.50 | 3.40 | HYPOTESE | LCSC-nivå; ikke sjekket i dag |
| OV5640 5 MP DVP-modul m/ fast fokus | 9.00 | 4.80 | DOKUMENTERT / HYPOTESE | eBay: modul €8,99 enkeltvis; 500-pris anslått |
| E-blekk 1,54" 200×200 SSD1681 | 6.50 | 3.20 | HYPOTESE | Waveshare-kort med S3 $15,99 — panel alene langt billigere |
| Kretskort 4-lag (DVP + PSRAM) | 4.00 | 1.10 | HYPOTESE |  |
| Montering (PCBA) + passive | 10.00 | 3.00 | HYPOTESE |  |
| microSD-sokkel + 8 GB kort | 3.50 | 1.90 | HYPOTESE | kortet følger med |
| LiPo 1 000 mAh m/ beskyttelse | 5.00 | 2.10 | HYPOTESE |  |
| Lader + LDO + USB-C | 1.40 | 0.55 | HYPOTESE |  |
| Hall-bryter DRV5032 + magnet | 0.90 | 0.30 | HYPOTESE | deksel = av/på |
| To knapper + LED | 0.60 | 0.20 | HYPOTESE |  |
| Kabinett: front, bak, deksel, knapper (PETG) | 6.00 | 3.00 | BEREGNET / HYPOTESE | 57 g PETG fra CAD |
| Søker (rammesøker v0.1) + objektivring | 0.80 | 0.35 | HYPOTESE |  |
| Håndleddsreim | 0.80 | 0.35 | HYPOTESE |  |
| Emballasje + kort med oppdragsliste | 2.50 | 1.10 | HYPOTESE |  |
| **Sum** | **55.50** | **25.35** | BEREGNET | |

## Enhetskost levert lager (inkl. innfrakt/import + 12 min montering à 450 kr/t)

| Volum | NOK per stk |
|---|---:|
| 1 | 848 |
| 50 | 403 |
| 500 | 403 |

## Pris og dekningsbidrag (500 stk)

| | Ferdig | Bygg-selv-sett |
|---|---:|---:|
| Pris inkl. mva | 1190 kr | 790 kr |
| Pris eks. mva | 952 kr | 632 kr |
| Varekost | 403 kr | 274 kr |
| Frakt ut  kortgebyr  retur | 165 kr | 140 kr |
| **Dekningsbidrag per stk** | **384 kr** | **218 kr** |
| Bruttomargin | 40 % | 35 % |

## Engangskostnader

| Post | NOK | Merking | Kommentar |
|---|---:|---|---|
| CE: RED + EMC + LVD + RoHS (lab  modulær vei) | 60 000 | HYPOTESE | som Stafett; samme lab kan ta begge |
| EN 18031 cybersikkerhet (RED art. 3.3) | 40 000 | UAVKLART | kamera + Wi-Fi + lagring av bilder: vurderes strengere |
| Prototyper (6 runder PCB + print + linser) | 22 000 | HYPOTESE | optikk er det vanskelige |
| Fotografering  nettside  tekst | 10 000 | HYPOTESE |  |
| Buffer 15 % | 19 800 | BEREGNET |  |
| **Sum** | **151 800** | BEREGNET | |

**Break-even: 395 ferdige enheter** (BEREGNET). Første batch på 500 gir 40 267 kr etter engangskostnader  *før* lønn til deg.

## Tre ting tallene sier rett ut

1. **Camp Snap koster $69 (~731 kr).** Mørkerom koster 1190 kr. Prisforskjellen er fremkallingen, e-blekk-ruta, krypteringen og oppdragene. Det er ikke et billigere kamera. Det er et annet kamera. HYPOTESE: noen vil betale for det.
2. **Optikken er risikoen, ikke elektronikken.** En OV5640-modul med fast fokus gir middels bilder. 1-bit-fremkallingen gjør det til en egenskap på bakskjermen, men originalen er fortsatt middels. Budsjett for minst to linserunder.
3. **Ikke selg den på Klarna her heller.** Samme regel som Stafett. Kort og Vipps. Ingen delbetaling.

## Programvaren er gratis

Rull + 48 t + oppdrag kan gis bort som app (Gudak gjorde det i 2017 for $0,99). Men en app kan ikke stoppe deg fra å se i kamerarullen. Det fysiske kameraet uten skjerm er hele poenget, og det er det som selges.

