# 16 · Gevinstmåler før og etter

Python + SQLite + CSV-import + nettleser-UI med boksplott per gruppe.

## Start

```bash
python3 generer_data.py   # 85 syntetiske målinger, to oppgavetyper, ett avvik på 240 min, 3 manglende varigheter
python3 app.py            # http://127.0.0.1:8016/
python3 kontroll.py       # 16 kontroller
node e2e.mjs              # 5 nettlesersjekker
```

CSV-format: `dato,oppgavetype,periode(før|etter),varighet_min,feil(0|1),malekilde`. Periodegrenser står i `data/perioder.json`.

## Metode

- **Grupper** = oppgavetype × målekilde. Ulike oppgavetyper slås bare sammen etter et eksplisitt valg, og selv da holdes ulike målekilder adskilt.
- Per periode: n, manglende varighet (telles og utelates), median, kvartiler, min–maks, gjennomsnitt, feil per 100 og volum per uke (mot periodens lengde).
- **Flagg:** lite utvalg (n < 10), manglende periode, ekstremverdier (> Q3 + 3·IQR) og manglende data.
- **Volum mot tid:** endring i timer per uke = tidseffekt V₂·(m₂−m₁)/60 + volumeffekt (V₂−V₁)·m₁/60.
- **Økonomi** regnes bare fra eksplisitt valgt timesats og volum, og har alltid et forbehold om årsak.

## Referanse (syntetiske data)

- Fakturakontroll: median 12 → 9 min. Gjennomsnittet øker (11,5 → 14,6) på grunn av avviket på 240 min, mens medianen er robust. Tidseffekten −0,51 t/uke motvirkes av volumeffekten +0,45 t/uke.
- Tilbudsskriving: lite utvalg (8/4). Nedgangen på 1,24 t/uke kommer mest fra lavere volum (−0,98), ikke fra raskere arbeid (−0,26).
- Scenario: 3 min × 10/uke × 600 kr × 46 uker = 13 800 kr/år, *ikke dokumentert årsak*.

Filer: `resultat/referanse.json`, `resultat/maling.csv`, `resultat/kontroll.txt`, `resultat/e2e.txt`.

## Avvik

UI-et er ren JavaScript uten React. Backend er Python med SQLite.
