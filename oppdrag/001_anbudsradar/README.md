# 1 · Anbudsradar for én SMB-nisje

Lokal radar for en fiktiv elektrobedrift (ladeinfrastruktur, Nord-Norge). Python + SQLite + enkelt nettgrensesnitt.

## Start

```bash
python3 app.py --db radar.db --importer data/import_1.csv data/import_2.csv   # importer
python3 app.py --db radar.db --idag 2026-10-24                                 # http://127.0.0.1:8001/
python3 kontroll.py      # motorkontroller  → resultat/kontroll.txt
node e2e.mjs             # nettleserkontroll → resultat/e2e.txt, skjermbilde.png
```

## Hva den gjør

- **Import fra CSV** (`data/import_*.csv`). Hver import lagres i `importer` med antall nye/endrede/duplikater.
- **Duplikatregel:** samme `kunngjoring_id` = samme kunngjøring. Gjentatte rader i én fil telles én gang og logges med radnummer.
- **Endringssporing:** feltene tittel, frist, verdi, sted, CPV og URL sammenlignes mot forrige versjon; endringer lagres som gammel → ny per import.
- **Frist:** `åpen` / `utløpt` / `ukjent`. Tom eller ugyldig frist blir *ukjent* (med kildens råverdi vist) og aldri tolket som utløpt.
- **Matching** mot `data/profil.json`: nøkkelord, CPV-prefiks, fagområde, region, maks verdi. Hver poengsum har en liste med *hvorfor*.
- **Filtrering** på fagområde, sted/region og frist innen N dager. Utløpte skjules som standard.
- **Prioriteringsliste** eksporteres som CSV (`/api/eksport.csv`, knapp i grensesnittet).

## Ekstern kilde

`adaptere/ekstern_kilde.py` er et grensesnitt som kaster feil til sjekklisten i `adaptere/README.md`
(dokumentasjon, tilgangsvilkår, rate-grenser, felt-mapping) er fylt ut. Appen gjør ingen nettverkskall.

## Faktisk kontrollresultat

Se `resultat/kontroll.txt` (26 sjekker) og `resultat/e2e.txt` (7 nettlesersjekker). Eksportert liste: `resultat/prioritering.csv`.

## Avgrensning

Ingen automatisk innsending av tilbud. Alle kunngjøringer er syntetiske (`eksempel.invalid`-URL-er).
