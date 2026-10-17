---
name: trade-ideas
description: Trading Ideas Generator. Skanner en aksje, indeks, sektor eller liste og gir 5 setups med entry, mål, stopp, R:R og historisk treffrate, pluss teknisk og fundamental begrunnelse. Bruk når brukeren ber om trading-ideer, setups, «hva skal jeg kjøpe/shorte», eller /trade-ideas.
argument-hint: "<ticker | liste | univers: tech, semis, energy, banks, health, oslo, sectors, indices, crypto, fx, commodities, us-mega>"
---

# Trade Ideas

**Oppdrag:** «Scan today's market and generate 5 high-probability trading setups for $ARGUMENTS. Include entry price, exit targets, stop-loss, and risk/reward ratio. Explain why each setup works based on technical and fundamental factors.»

## Steg

1. Kjør skannet (én enkelt ticker fungerer også):
   ```bash
   PYTHONPATH=trading-agent python3 -m tradekit ideas "$ARGUMENTS" --top 8
   ```
   Universer: se `trading-agent/tradekit/universe.py`. Ukjent sektor → lag en kommaseparert liste med 8–15 relevante tickere selv (Yahoo-format: `EQNR.OL`, `^GSPC`, `BTC-USD`).
2. Hvis færre enn 5 ideer: utvid universet (naboer i sektoren, sektor-ETF) og kjør igjen. Aldri dikt opp en setup motoren ikke fant.
3. Fundamentalt: for hver av de 5 endelige, gjør ett `WebSearch` (siste rapport, guiding, estimatendringer, kommende katalysator/rapportdato). Rapport innen setupens horisont = flagg «binær hendelse».
4. Rangér: motorens `quality`, men flytt ned ideer med rapport innen 5 dager eller mot ukentlig trend (`weekly_aligned: false`).

## Format

Tabell først:

| # | Ticker | Setup | Retning | Entry | Stopp | Mål 1 | Mål 2 | R:R (M1/M2) | Treff hist. (n) |

Så per idé, 4 linjer:
- **Teknisk:** hvorfor setupen fungerer (bruk `why_technical` + RSI/ADX/nivåer fra JSON).
- **Fundamentalt:** fra søket, med kilde.
- **Ugyldig hvis:** konkret pris/hendelse som dreper ideen.
- **Størrelse:** ved 1 % risiko på en konto på X (spør om konto, ellers anta 100 000).

Avslutt med datadato fra motoren og ansvarsfraskrivelsen.
