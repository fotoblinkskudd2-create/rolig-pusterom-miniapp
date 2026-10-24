# 18 · Bestilling med kapasitetssperre

FastAPI + SQLite (WAL) + nettleser-UI. Tre tjenester, to navngitte ressurser, 30-minutters blokker.

## Start

```bash
python3 app.py --demo     # http://127.0.0.1:8018/  (stengt verksted 30.10, fullbooket uke 2.–6.11 for montøren)
python3 kontroll.py       # 22 kontroller, inkludert 20 samtidige HTTP-forsøk mot ekte server
node e2e.mjs              # 5 nettlesersjekker
```

## Hvordan dobbeltbooking hindres

- Tabellen `laas(ressurs, blokk)` har **PRIMARY KEY (ressurs, blokk)**. En reservasjon setter inn én rad per ressurs og blokk i én transaksjon (`BEGIN IMMEDIATE`). Ved én kollisjon rulles hele reservasjonen tilbake.
- *Service* (4 blokker) krever både montør og verksted. Befaring (2) og rådgivning (1) krever montør.
- **Midlertidig reservasjon** holdes i 10 minutter. Utløpte frigjøres før hver operasjon og får status `utløpt`. De kan ikke bekreftes.
- **Avbestilling** sletter låsene i samme transaksjon som statusendringen. En ny avbestilling avvises (409), så kapasitet returneres bare én gang.
- **Stengte perioder** per ressurs (her: verkstedet fredag 30.10).

## Samtidighetskontroll (faktisk resultat)

Kontrollen starter uvicorn i egen prosess, fyller montørens dag slik at bare én befaring (15:00) gjenstår, og sender 20 samtidige `POST /api/reservasjoner` fra 20 tråder:
**1 × 200 og 19 × 409**, én rad i `laas` for blokken. Deretter gir 10 samtidige avbestillinger 1 × 200 (2 blokker frigjort) og 9 × 409.

Filer: `resultat/kontroll.txt`, `resultat/e2e.txt`, `resultat/bestillinger.csv`.

## Utenfor første versjon

Betaling og kalenderinvitasjoner. Avvik: UI-et er ren JavaScript uten React.
