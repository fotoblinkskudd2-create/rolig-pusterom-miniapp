# VINDUSVAKT — økonomi v0.1

*Generert av `okonomi/modell.py`. Endre tallene der, ikke her.*

Merking: **DOKUMENTERT** = sett i en kilde i dag. **BEREGNET** = regnet ut fra andre tall. **HYPOTESE** = mitt anslag. **UAVKLART** = vet ikke. Valuta: 1 USD = 10.6 NOK (HYPOTESE).

## Stykkliste (BOM)

| Del | USD @1 | USD @500 | Merking | Kilde / kommentar |
|---|---:|---:|---|---|
| E-blekk 7,5" 800×480 (UC8179) råpanel | 45.00 | 24.00 | DOKUMENTERT / HYPOTESE | Waveshare 7,5" råpanel $45–55 enkeltvis; 500-pris anslått |
| E-blekk-booster + FPC 24p | 2.20 | 0.75 | HYPOTESE | som Stafett |
| ESP32-S3-WROOM-1-N16R8 | 4.50 | 3.40 | HYPOTESE |  |
| OV2640 DVP-modul, vidvinkel | 5.50 | 2.60 | HYPOTESE | gråtoner rett fra sensoren; 2 MP er mer enn nok |
| Kretskort 4-lag | 4.00 | 1.10 | HYPOTESE |  |
| Montering (PCBA) + passive | 9.00 | 2.80 | HYPOTESE |  |
| LiPo 2 000 mAh m/ beskyttelse | 7.00 | 3.00 | HYPOTESE | ingen kabel i vinduskarmen |
| Lader + LDO + USB-C | 1.40 | 0.55 | HYPOTESE |  |
| Hall-bryter + magnet (linsedeksel) | 0.90 | 0.30 | HYPOTESE |  |
| Knapp | 0.30 | 0.10 | HYPOTESE |  |
| Kabinett: front, bak, sokkel, deksel, knapp (PETG) | 14.00 | 6.50 | BEREGNET / HYPOTESE | 206 g PETG fra CAD |
| Emballasje | 3.00 | 1.40 | HYPOTESE |  |
| **Sum** | **96.80** | **46.50** | BEREGNET | |

## Enhetskost levert lager (inkl. innfrakt/import + 12 min montering à 450 kr/t)

| Volum | NOK per stk |
|---|---:|
| 1 | 1 388 |
| 50 | 637 |
| 500 | 637 |

## Pris og dekningsbidrag (500 stk)

| | Ferdig | Bygg-selv-sett |
|---|---:|---:|
| Pris inkl. mva | 1690 kr | 990 kr |
| Pris eks. mva | 1 352 kr | 792 kr |
| Varekost | 637 kr | 480 kr |
| Frakt ut  kortgebyr  retur | 197 kr | 152 kr |
| **Dekningsbidrag per stk** | **518 kr** | **159 kr** |
| Bruttomargin | 38 % | 20 % |

## Engangskostnader

| Post | NOK | Merking | Kommentar |
|---|---:|---|---|
| CE: RED + EMC + LVD + RoHS (lab  modulær vei) | 60 000 | HYPOTESE | samme lab som Stafett og Mørkerom |
| EN 18031 cybersikkerhet (RED art. 3.3) | 40 000 | UAVKLART |  |
| Juridisk vurdering: kamera mot offentlig område | 15 000 | HYPOTESE | Datatilsynet-spørsmål + advokattime |
| Prototyper (5 runder) | 18 000 | HYPOTESE |  |
| Fotografering  nettside  tekst | 10 000 | HYPOTESE |  |
| Buffer 15 % | 21 450 | BEREGNET |  |
| **Sum** | **164 450** | BEREGNET | |

**Break-even: 318 ferdige enheter** (BEREGNET). Første batch på 500 gir 94 304 kr etter engangskostnader  *før* lønn til deg.

## Tre ting tallene sier rett ut

1. **Panelet er halve stykklisten.** 7,5" e-blekk koster ~254 kr selv ved 500 stk. TRMNL selger en 7,5"-ramme for $139 (~1473 kr). Vindusvakt koster 1690 kr og har kamera, batteri og lokal logikk. HYPOTESE: prisen tåles fordi den ikke krever abonnement eller sky.
2. **Juss før salg.** Et kamera som peker ut av et vindu kan fange offentlig område. Designet lagrer aldri originalbildet, men det må vurderes før første salg. 15 000 kr er satt av.
3. **Felles CE-runde.** Stafett, Mørkerom og Vindusvakt bruker samme ESP32-familie. Én lab, tre produkter: HYPOTESE om 30–40 % lavere sertifiseringskost per produkt.

## Programvaren er gratis

Sol, mørketid og dagslengde kan gis bort som side i Pusterom. Rammen selges til dem som vil ha vinduet på veggen også når de ikke ser ut.

