---
name: news-to-trade
description: News to Trading Converter. Oppsummerer siste nyheter om et selskap eller en sektor og oversetter dem til handelsimplikasjoner — kort og lang sikt, forventet bevegelsesrom og anbefalt posisjonering. Bruk når brukeren spør om nyheter og hva de betyr for aksjen/sektoren, eller /news-to-trade.
argument-hint: "<selskap eller sektor> [ticker]"
---

# Nyheter → handel

**Oppdrag:** «Summarize the latest news on $ARGUMENTS and translate them into trading implications. Provide possible short- and long-term effects, expected price movement range, and recommended positioning.»

## Steg

1. Overskrifter + prisreaksjon (ta med `--symbol` når du vet tickeren):
   ```bash
   PYTHONPATH=trading-agent python3 -m tradekit news "<selskap/sektor>" --symbol <TICKER> --limit 20
   ```
   Sektor: kjør på sektor-ETF-en (XLE, XLK, …) som `--symbol`.
2. Les de 3–5 viktigste sakene i fulltekst med `WebFetch` eller `WebSearch` — overskrifter lyver. Sjekk også neste rapportdato og makrohendelser som treffer sektoren.
3. Motorens `sentiment` er et grovt ordleksikon. Din tolkning gjelder, men si når du er uenig med den.
4. Er nyheten allerede priset inn? Sammenlign `ret_1d/5d/20d_pct`, `gap_today_pct` og `volume_vs_avg20` med hvor stor nyheten er.

## Format

- **Nyhetsbildet:** 3–6 punkter, nyeste først, hver med dato og kilde-lenke.
- **Kort sikt (1–10 dager):** retning, katalysatorer, hva som allerede er priset.
- **Lang sikt (1–6 mnd):** påvirkning på inntjening/multippel/tema.
- **Forventet bevegelsesrom:** tabell fra `expected_range_1sigma` (1d/5d/20d/60d, lav–høy, ±%). Si at det er 1σ (~68 %) fra historisk vol, ikke opsjonsimplisert.
- **Posisjonering:** én av *kjøp / vent på nivå / reduser / sikre / short / stå utenfor*, med entry-sone, stopp og ugyldighetsnivå.
- Datadato + ansvarsfraskrivelse.
