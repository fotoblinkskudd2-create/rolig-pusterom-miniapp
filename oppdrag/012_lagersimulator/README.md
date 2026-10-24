# 12 · Lagerbehov og innkjøpssimulator

Python + SQLite (replaymotor) + nettleser-UI for å sammenligne to regelsett.

## Start

```bash
python3 generer_data.py   # 12 varer, 90 dager, interne flyttinger, én forsinket levering (V07), én feilregistrering (V11)
python3 app.py            # http://127.0.0.1:8012/
python3 kontroll.py       # 18 kontroller
node e2e.mjs              # 6 nettlesersjekker
```

## Regler (står også i `motor.py`)

- **Etterspørsel** = bare `salg`. Intern flytting lagres som to rader (ut av LAGER, inn i BIL1) med netto null og blir aldri salg.
- **ROP** = ⌈snitt dagforbruk × ledetid + sikkerhetslager⌉. Ledetid og sikkerhetslager er brukerens verdier per vare (`data/varer.csv`). Regelsettet skalerer sikkerhetslageret og setter ordresyklus.
- **(s, S)-politikk:** når lagerposisjon (på lager + i bestilling) ≤ ROP, bestilles det opp til S = max(ROP + 1, ROP + ⌈snitt × ordresyklus⌉).
- **Replay per dag:** mottak → etterspørsel (udekket = tapt salg og utsolgtdag) → bestillingsregel.
- **Forsinket levering:** historiske mottak med `forventet`-dato brukes i replay. Simulerte ordre som skulle kommet i avviksperioden, kommer tidligst på den faktiske mottaksdatoen.
- **Negativ historisk beholdning** flagges med dato, lokasjon og referanse.
- **Determinisme:** replay gir sha256-hash av resultatet. Samme historikk gir samme hash (kontrollert med to uavhengige databaser).

## Resultat (standarddata)

| | Utsolgtdager | Tapt antall | Snitt lagerverdi | Ordre |
|---|---:|---:|---:|---:|
| A: sikkerhet × 1, syklus 14 d | 8 | 11 | 22 858,54 kr | 70 |
| B: sikkerhet × 2, syklus 7 d | 4 | 7 | 22 960,41 kr | 130 |

V07 er utsolgt 08.–10.08. i A under den forsinkede leveransen, men ikke i B. V11 er utsolgt i begge fordi det registrerte salget overstiger beholdningen.

Filer: `resultat/bestillingsforslag.csv` (bare forslag), `resultat/sammenligning.json`, `resultat/kontroll.txt`, `resultat/e2e.txt`.

## Avvik

UI-et er ren JavaScript uten React.
