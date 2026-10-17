# Trading-agent

Sju trading-verktøy som Claude Code-skills, en `trading-desk`-agent som styrer dem, og `tradekit`: en Python-motor som henter ekte kursdata og regner ut tallene. Claude tolker resultatene, men prisene kommer alltid fra motoren.

## Oppsett

```bash
pip install -r trading-agent/requirements.txt     # pandas, numpy, requests
PYTHONPATH=trading-agent python3 -m tradekit quote AAPL
python3 -m unittest discover -s trading-agent/tests  # offline, syntetiske data
```

Data: Yahoo Finance sitt åpne chart-API, forsinket rundt 15 min, med cache i 15 min i `~/.cache/tradekit`. Har du ikke nett, gir du `--csv fil.csv` (Date,Open,High,Low,Close,Volume) til `ideas`, `analyze` eller `backtest`.

## De sju verktøyene

| # | Slash-kommando i Claude Code | Motor |
|---|---|---|
| 1 | `/trade-ideas semis` | `tradekit ideas semis --top 5` |
| 2 | `/technical-analysis NVDA` | `tradekit analyze NVDA` |
| 3 | `/news-to-trade Equinor EQNR.OL` | `tradekit news "Equinor" --symbol EQNR.OL` |
| 4 | `/backtest SPY sma_cross 10y` | `tradekit backtest SPY sma_cross --period 10y` |
| 5 | `/portfolio-risk AAPL:30,NVDA:20,EQNR.OL:25,BTC-USD:25` | `tradekit portfolio "…" --base NOK --value 250000` |
| 6 | `/trading-journal trading-agent/examples/journal.csv` | `tradekit journal …csv --last 20` |
| 7 | `/trading-plan oslo` | `tradekit plan oslo --watchlist oslo --md` |

Full runde: be `trading-desk`-agenten om en «morgenbrief». Den lager dagsplanen, skanner etter ideer, sjekker de to beste mot teknisk analyse og nyheter, og vurderer dem opp mot porteføljen din.

## Hva motoren faktisk gjør

- **ideas:** sju setups (trend-pullback, breakout på volum, squeeze, oversolgt sprett, MACD-kryss, breakdown, bear-flagg). Hver setup kjøres bakover på samme ticker, og win rate og forventning i R gjelder den tickeren, ikke en lærebok. Stopp og mål beregnes fra ATR og justeres til nærmeste støtte eller motstand.
- **analyze:** daglig og ukentlig analyse med SMA/EMA, RSI, MACD, ADX, stokastisk, Bollinger, OBV, regresjonstrendlinje, nivåer klynget fra swing-punkter og RSI-divergens. Hver sjekk gir poeng, og ukentlig teller 60 % av signalet.
- **news:** henter overskrifter fra Yahoo og Google News, bruker et grovt sentimentleksikon, og regner ut prisreaksjon og et 1σ-bevegelsesrom for 1, 5, 20 og 60 dager.
- **backtest:** signal på close og handel på neste open. ATR-stopp utløses intradag, og et gap forbi stoppen fylles på open. Kostnad trekkes per side. Motoren tester filtre, finner beste parametre på 70 % av perioden og sjekker dem på de siste 30 %.
- **portfolio:** beta og nedside-beta, risikobidrag, korrelasjonsklynger, VaR og CVaR, og en stresstest for −20 % sammen med det verste historiske fallet i perioden. Rebalanseringen blander nåværende vekter med ERC-vekter og har et vekttak. Hedgeforslaget er en put prisa med Black-Scholes, og alt kan konverteres til valutaen du velger.
- **journal:** finner disposisjonseffekt, asymmetri, hevntrading, ujevn posisjonsstørrelse, brutte stopper, for tidlig gevinsttaking, overtrading og setups som taper penger.
- **plan:** sjekkliste med tidspunkt i både børstid og lokal tid, med riktig sommertid. Den har faste risikorammer og nivåer for watchlisten (pivot, R1/S1, forrige høy og lav, ATR, støtte og motstand).

## Grenser

- Dataene er ikke sanntid og passer ikke for scalping.
- «Sannsynlighet» betyr historisk treffrate med utvalgsstørrelse. Under 15 utvalg er tynt grunnlag.
- Opsjonspriser er modellestimater og ikke priser fra en ekte opsjonskjede.
- Dette er analyse og ikke finansiell rådgivning. Ikke trade med lånte penger.
