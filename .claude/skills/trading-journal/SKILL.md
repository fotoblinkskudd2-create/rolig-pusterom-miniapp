---
name: trading-journal
description: Trading Journal Analyzer. Gjennomgår de siste 20 handlene (CSV eller limt inn), finner gjentatte feil, tapte muligheter og atferdsbias, og gir 3 personlige regler for mer konsistens. Bruk ved «se på tradene mine», «analyser journalen», «hvorfor taper jeg», eller /trading-journal.
argument-hint: "<sti til journal.csv eller lim inn handlene>"
---

# Journal-analyse

**Oppdrag:** «Review my last 20 trades: $ARGUMENTS. Identify recurring errors, missed opportunities, and behavioral biases. Give me 3 personalized rules to immediately increase consistency.»

## Steg

1. Har brukeren limt inn handler som tekst/tabell: skriv dem til `trading-agent/journal.csv` med kolonnene
   `symbol,side,entry_date,entry_time,entry_price,exit_date,exit_time,exit_price,qty,stop,target,setup,fees,notes`
   (minimum de 7 første uten tider; `stop` trengs for R-multipler og stoppbrudd). Mal: `trading-agent/examples/journal.csv`.
2. ```bash
   PYTHONPATH=trading-agent python3 -m tradekit journal <sti> --last 20
   ```
3. Les `notes`-kolonnen selv — «håpet», «hevn», «flyttet stopp» er bevis på bias motoren ikke kan telle.

## Format

1. **Fasit:** netto PnL, win rate, profit factor, payoff (snittgevinst/snittap), snitt-R, lengste tapsrekke.
2. **Gjentatte feil:** `findings` sortert etter alvor, hver med bevis (tall) og hvilke handler det gjelder.
3. **Tapte muligheter:** `missed_opportunities` + vinnere avsluttet under 1R.
4. **Atferdsbias:** navngi dem (disposisjonseffekt, hevntrading, overtillit etter gevinst, tapsaversjon, FOMO) — bare de dataene støtter.
5. **Hva som fungerer:** beste setup/side/ukedag fra `breakdown`. Gjør mer av det.
6. **3 regler:** konkrete, målbare, kan sjekkes på hver handel. Ikke «vær disiplinert». Eksempel: «Etter et tap: minst 30 min før neste entry, og samme eller mindre størrelse.»
7. Foreslå å kjøre igjen etter neste 20 handler.
