# 7 · Likviditetslab for 13 uker

TypeScript-motor (`src/likviditet.ts`) + nettleser-UI med graf, ukestabell og flytting av poster.

## Start

```bash
tsc -p . && python3 ../felles/serve.py 8007   # http://127.0.0.1:8007/007_likviditet/
node kontroll.mjs                              # 17 kontroller
node e2e.mjs                                   # 7 nettlesersjekker
```

## Modell

- Inndata: inngående saldo, startdato (mandag) og poster med dato, beløp (hele kroner, + inn / − ut), kategori og **sikkerhet** (`registrert` = fakturert/forpliktet, `antatt` = ikke fakturert/anslått).
- Lønn, arbeidsgiveravgift, MVA, renter og avdrag er **eksplisitte poster**. Ingenting beregnes implisitt.
- Ukesoversikt: inngående, inn/ut fordelt på registrert og antatt (antatt vises i kursiv/oransje), netto, utgående, negativ-flagg og laveste saldo.
- Poster utenfor de 13 ukene listes separat i stedet for å forsvinne.
- **Flytting** endrer bare datoen til én post; totalbeløpet er uendret (kontrollert). Flyttinger lagres i `localStorage` per scenario.
- **Scenarioer:** `data/scenario_forsinket.json` (kunde A/B/C betaler 2/3/4 uker sent) og `data/scenario_ansettelse.json` (ny ansatt med lønn, AGA og utstyr som inndata). To scenarioer kan sammenlignes i graf og tabell.

## Kontroller (faktiske resultater)

- Saldoen uke for uke stemmer med en uavhengig beregning per dagindeks. Sluttsaldo 123 800 kr.
- Forsinket scenario: laveste saldo går fra 65 000 til **−58 500 kr (uke 4)**. Uke 4–5 er negative og føres korrekt videre.
- Ansettelse: differanse i uke 13 = −38 000 − 10 700 − 25 000 = −73 700 kr.

Filer: `resultat/kontroll.txt`, `resultat/e2e.txt`, `resultat/{basis,forsinket,ansettelse}.csv`, `resultat/skjermbilde.png`.

## Avvik

UI-et er ren JavaScript uten React.
