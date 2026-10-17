---
name: backtest
description: Strategy Backtester. Backtester en strategi (MA-kryss, EMA-kryss, RSI, RSI-divergens, breakout/Donchian, MACD, Bollinger) på en aksje eller indeks og rapporterer treffrate, profit factor, maks drawdown, Sharpe, samt testede forbedringer med out-of-sample-kontroll. Bruk ved «backtest», «test strategien», «virker X på Y», eller /backtest.
argument-hint: "<ticker> <strategi> [periode: 1y|2y|3y|5y|10y|max]"
---

# Backtest

**Oppdrag:** «Perform a backtest of [strategy] on [stock/index] over the last [period]. Present win rate, profit factor, maximum drawdown, and improvements to increase the edge.»

Argumenter: `$ARGUMENTS`

## Steg

1. Map brukerens ord til strategi-ID:
   | Bruker sier | ID | Standard |
   |---|---|---|
   | moving average crossover, golden cross | `sma_cross` | fast=50, slow=200 |
   | EMA crossover | `ema_cross` | 12/26 |
   | RSI oversold/overbought | `rsi` | period=14, low=30, high=70 |
   | RSI divergence | `rsi_divergence` | window=10, exit_rsi=65 |
   | breakout, Donchian, turtle | `breakout` / `donchian` | 20/10, 55/20 |
   | MACD crossover | `macd` | 12/26/9 |
   | Bollinger mean reversion | `bollinger` | 20, 2.0 |
   Egne parametre: `--params fast=20,slow=100`.
2. ```bash
   PYTHONPATH=trading-agent python3 -m tradekit backtest <TICKER> <ID> --period <periode>
   ```
   Kurtasje+slippage er 10 bps per side som standard (`--cost-bps`). Bruk 20–30 for Oslo Børs småselskaper, 5 for SPY.
3. Les `baseline`, `filter_tests` og `walk_forward`.

## Format

1. **Oppsett:** ticker, strategi, parametre, periode (`from` → `to`), kostnader, regler (signal på close, handel på neste open).
2. **Resultat-tabell:** handler, win rate, profit factor, snittgevinst/-tap, forventning per handel, CAGR, maks DD, Sharpe, Sortino, eksponering — og **buy & hold** ved siden av. Slår den ikke buy & hold risikojustert, si det først.
3. **Forbedringer:** tabell fra `filter_tests` (trendfilter, ATR-stopp). Marker hva som faktisk hjalp.
4. **Parameteroptimalisering:** `walk_forward.top3` med in-sample vs out-of-sample side om side. Konklusjon: robust / skjør / overtilpasset. Færre enn 10 handler = statistisk støy, si det.
5. **Neste test:** 2–3 konkrete ideer (annen ticker, regime-filter, posisjonsstørrelse etter volatilitet).
6. Siste 10 handler som liten tabell.
7. «Historisk avkastning garanterer ingenting» + ansvarsfraskrivelse.
