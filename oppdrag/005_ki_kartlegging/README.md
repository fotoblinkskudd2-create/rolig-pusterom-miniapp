# 5 · Betalbar KI-kartlegging

Kartleggingsapp for en avgrenset SMB-tjeneste. TypeScript-modell (`src/modell.ts`) og nettleser-UI uten byggekjede.

## Start

```bash
tsc -p . && python3 ../felles/serve.py 8005   # http://127.0.0.1:8005/005_ki_kartlegging/
node kontroll.mjs                              # 16 kontroller
node e2e.mjs                                   # 7 nettlesersjekker
```

## Modell

- **Aktiviteter** har volum/mnd, minutter per utførelse, feilrate, minutter per feilretting og datatilgang. **Prosesser** (fem i demoen) peker på aktiviteter.
- Gevinst = (timer til utførelse × tidsreduksjon + timer til feilretting × feilreduksjon) × datatilgangsfaktor (god 1, delvis 0,5, ingen 0).
- Tre scenarioer (lav/middels/høy) med eksplisitte faktorer. Alt er deterministisk.
- **Dobbelttelling:** gevinst regnes per *aktivitet*. «Registrere kundedata» (A1) inngår i både Tilbud og Kundehenvendelser, men telles én gang og fordeles likt mellom dem. Kontrollen viser at naiv prosessvis summering ville lagt til 1,95 t/mnd for mye.
- Null volum gir null gevinst.
- Alle resultater merkes **HYPOTESE** til brukeren eksplisitt markerer at verdiene er målt.

## Leveranser i appen

Kundeark (utskrift og JSON), scenarioeksport (CSV), antakelser med avkrysning (6 stk) og pilotgrunnlag/måleplan (Markdown) med valgt prosess, konkret måling, forventet output og stoppkriterium.

## Referanse (middels scenario, fiktiv bedrift)

A1 1,95 + A2 2,925 + A3 3,3067 + A4 0 + A5 2,62 + A6 1,15 = **11,95 t/mnd ≈ 7 171 kr/mnd (hypotese)**.

Resultater: `resultat/kontroll.txt`, `resultat/e2e.txt`, `resultat/scenarioer.csv`, `resultat/pilot_P2.json`.

## Avvik

UI-et er ren JavaScript uten React. Ingen tall er dokumentert gevinst før en pilot er målt.
