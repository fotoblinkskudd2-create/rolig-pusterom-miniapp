---
name: trading-plan
description: Fully Automated Trading Plan. Lager en daglig handelsplan for et marked eller aktivum som sjekkliste med tidsstempler (pre-market-skann, åpningsstrategi, justeringer midt i sesjonen, lukking), med nivåer for watchlisten og harde risikorammer. Bruk ved «dagsplan», «trading plan», «sjekkliste for i dag», eller /trading-plan.
argument-hint: "<us|oslo|eu|uk|fx|crypto> [watchlist] [konto]"
---

# Dagsplan

**Oppdrag:** «Design a daily trading plan for $ARGUMENTS. Include pre-market scanning, opening strategy, mid-session adjustments, and closing strategy. Deliver it as a checklist with timestamps that I can follow like a professional trader.»

## Steg

1. Map marked: amerikanske aksjer/indekser → `us`, Oslo Børs → `oslo`, Tyskland/Frankrike → `eu`, London → `uk`, valuta → `fx`, krypto → `crypto`. Watchlist mangler → bruk et univers (`oslo`, `us-mega`, `crypto` …).
2. ```bash
   PYTHONPATH=trading-agent python3 -m tradekit plan <marked> --watchlist "<liste>" --account <konto> --risk-pct 0.5 --max-loss-pct 1.5 --md --out trading-agent/plan-$(date +%F).md
   ```
   Tidene er sommertid-korrekte i både børs- og lokal tid (standard `Europe/Oslo`, endre med `--tz`).
3. Berik med dagens faktiske hendelser: ett `WebSearch` etter økonomisk kalender for dagen og rapporter på watchlisten. Sett dem inn som egne tidsstemplede linjer.
4. Kjør `trade-ideas` på watchlisten hvis brukeren vil ha ferdige kandidater i planen.

## Format

Lever markdown-sjekklisten fra motoren med dine tillegg flettet inn på riktig tidspunkt. Behold risikorammene øverst urørt — de er poenget. Avslutt med en 3-linjers «kveldsreview»-mal: *Fulgte jeg planen? Beste handel og hvorfor? Én ting jeg endrer i morgen.*
