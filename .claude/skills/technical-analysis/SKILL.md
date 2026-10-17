---
name: technical-analysis
description: Automated Technical Analyst. Daglig + ukentlig analyse av én ticker: støtte/motstand, trendlinjer, glidende snitt, momentum, og et steg-for-steg Buy/Hold/Sell-signal med begrunnelse. Bruk når brukeren ber om teknisk analyse, chartanalyse, «analyser X», eller /technical-analysis.
argument-hint: "<ticker>"
---

# Teknisk analyse

**Oppdrag:** «Analyze $ARGUMENTS using daily and weekly charts. Break down support/resistance levels, trend lines, moving averages, and momentum indicators. Provide a step-by-step trading signal (Buy/Hold/Sell) with justification.»

## Steg

1. ```bash
   PYTHONPATH=trading-agent python3 -m tradekit analyze "$ARGUMENTS"
   ```
2. Les `weekly` først (retning), deretter `daily` (timing). `checks` er poengene bak signalet — bruk dem, ikke egne.
3. Signalet er `signal.verdict`. Du kan nedgradere (BUY→HOLD) med begrunnelse (f.eks. rapport om 3 dager, RSI > 75 på ukentlig), men aldri oppgradere mot motoren.

## Format

1. **Bilde i én setning** (trend, styrke, hvor i rangen).
2. **Ukentlig:** trend, SMA20/50/200-plassering, RSI, MACD, trendlinje (helning %/år, R²).
3. **Daglig:** samme + ADX, stokastisk, Bollinger-posisjon, volum vs snitt, divergens.
4. **Nivåer:** tabell støtte/motstand med antall berøringer (flere berøringer = sterkere).
5. **Signal steg for steg:** nummerert liste over `checks` med +/− poeng → sum → verdict + `confidence` + om tidsrammene er enige.
6. **Plan:** entry, stopp, mål 1/2, R:R fra `signal.plan`. HOLD → skriv hvilket nivå som gjør det til BUY eller SELL.
7. Datadato + ansvarsfraskrivelse.
