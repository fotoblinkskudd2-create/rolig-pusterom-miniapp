---
name: portfolio-risk
description: Portfolio Risk Manager. Analyserer en portefølje (tickere + %-vekter) for svake punkter, overeksponering og skjulte korrelasjoner, foreslår risikojustert rebalansering og hedging mot et 20 % markedsfall. Bruk ved «sjekk porteføljen», «risiko i porteføljen», «hedge», eller /portfolio-risk.
argument-hint: "TICKER:% , TICKER:% … [verdi] [valuta]"
---

# Porteføljerisiko

**Oppdrag:** «Analyze my portfolio: $ARGUMENTS. Highlight weak points, overexposure, and hidden correlations. Suggest a rebalancing adjusted to risk and hedging strategies to protect against a 20% market downturn.»

## Steg

1. Normaliser input til `TICKER:prosent,…` i Yahoo-format (Equinor → `EQNR.OL`, Bitcoin → `BTC-USD`, S&P-fond → `SPY`). Fond uten ticker: velg nærmeste ETF og si det.
2. ```bash
   PYTHONPATH=trading-agent python3 -m tradekit portfolio "<holdings>" --value <beløp> --base <NOK|USD|EUR> --benchmark <^GSPC|OSEBX.OL|^STOXX50E>
   ```
   Norsk portefølje mest på Oslo Børs → `--benchmark OSEBX.OL`. Ellers `^GSPC`. Verdi ukjent → 100 000.
3. Sektoreksponering finnes ikke i motoren: avled den selv fra tickerne og legg den til i svakhetsvurderingen.

## Format

1. **Dom i én setning:** hva som dreper porteføljen i et krakk.
2. **Nøkkeltall:** vol, beta, nedside-beta, VaR95/CVaR95 (1 dag, % og beløp), historisk maks DD, effektive antall veddemål.
3. **Per aktivum:** vekt vs risikobidrag (dette er kjernen — 20 % vekt med 32 % risiko er en skjult konsentrasjon).
4. **Svake punkter:** `weak_points` + sektoroverlapp du fant.
5. **Skjulte korrelasjoner:** par/klynger. Ingen = si det, men nevn `note` om tidssoner.
6. **Stresstest −20 %:** estimert tap per aktivum og totalt, pluss hva som faktisk skjedde i `historical_worst_benchmark_dd`.
7. **Rebalansering:** tabell fra → til med kjøp/salg-beløp, ny vol og beta.
8. **Hedging (velg 2–3):** beskyttende put (strike, kostnad i %, utbetaling ved −20 %), collar, delvis short indeks/futures, øke kontanter, ukorrelerte aktiva. Opsjonspriser er modellestimater — si det.
9. Ansvarsfraskrivelse.
