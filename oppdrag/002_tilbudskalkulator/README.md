# 2 · Tilbudskalkulator for håndverkere

TypeScript-beregningsmotor (`src/kalkyle.ts`) + PDF-generator (`src/tilbudpdf.ts`, egen avhengighetsfri PDF-skriver i `../felles/web/pdf.js`) + nettleser-UI (`index.html`, `ui.js`).

## Start

```bash
tsc -p .                          # bygger dist/ (dist er sjekket inn, så appen kjører uten bygg)
python3 ../felles/serve.py 8002   # http://127.0.0.1:8002/002_tilbudskalkulator/  → «Last demo»
node kontroll.mjs                 # referanseberegninger → resultat/kontroll.txt + PDF-er
node e2e.mjs                      # nettleserflyt → resultat/e2e.txt
```

## Flyt

Kunde → Mengder → Materialer → Arbeid → Pris → PDF, pluss Prisliste og Sammenlign. Alt lagres i `localStorage`.

## Regler som er implementert

- Alle beløp i **hele øre**. Hver material- og arbeidslinje avrundes til øre; summer er eksakte summer av linjer.
- **Påslag** regnes på kost: `salg = kost × (1 + p)`. **Margin** regnes av salgspris: `salg = kost / (1 − m)`. Begge vises alltid side om side.
- **Avgift** (navn og sats) er en eksplisitt parameter. Uten sats beregnes ikke tilbudet. 0 % er gyldig.
- **Prisversjoner:** ny prisliste lagres som ny versjon. Et tilbud får en *kopi* av prisgrunnlaget når det opprettes, så gamle tilbud beholder sin opprinnelige pris. «Ny versjon med gjeldende prisliste» lager eksplisitt en ny tilbudsversjon.
- Linjepris i PDF = salgspris fordelt etter kost med største-rest-metoden, så linjene summerer eksakt.

## Håndregnet referanse (oppdiktede satser, timesats 650 kr)

| | Bad (påslag 25 %) | Terrasse (margin 30 %) |
|---|---:|---:|
| Materialer | 15 981,60 | 6 398,50 |
| Arbeid | 36,6 t → 23 790,00 | 21,5 t → 13 975,00 |
| Kost | 39 771,60 | 20 373,50 |
| Salg eks. mva | 49 714,50 | 29 105,00 |
| MVA 25 % | 12 428,63 | 7 276,25 |
| **Total** | **62 143,13** | **36 381,25** |

Flis 450 → 495 kr/m² (26,4 m²): bad v2 = **63 999,38**, mens v1 fortsatt er 62 143,13.

## Kontrollresultat

`resultat/kontroll.txt` (31 sjekker, PDF-tekst verifisert uavhengig med pypdf) og `resultat/e2e.txt` (8 nettlesersjekker).
PDF-er: `resultat/T-001_v1.pdf`, `T-001_v2.pdf`, `T-002_v1.pdf`.

## Avvik fra oppdraget

Grensesnittet er skrevet i ren JavaScript-modul uten React, slik at det kjører uten byggekjede og uten nett. Beregningsmotoren er TypeScript som bestilt.
Ingen utsending, ingen betaling.
