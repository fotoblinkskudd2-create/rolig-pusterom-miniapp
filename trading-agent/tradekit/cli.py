"""tradekit CLI. Alle kommandoer skriver JSON til stdout (Claude leser det).

  python -m tradekit ideas tech --top 5
  python -m tradekit analyze AAPL
  python -m tradekit news "Equinor" --symbol EQNR.OL
  python -m tradekit backtest SPY sma_cross --period 5y
  python -m tradekit portfolio "AAPL:30,MSFT:20,EQNR.OL:25,BTC-USD:25" --value 250000 --base NOK
  python -m tradekit journal examples/journal.csv --last 20
  python -m tradekit plan us --watchlist AAPL,NVDA --md
"""

from __future__ import annotations

import argparse
import json
import sys

import numpy as np
import pandas as pd

from . import analyze, backtest, data, journal, news, plan, portfolio, setups
from .universe import UNIVERSES, resolve


def _default(o):
    if isinstance(o, (np.integer,)):
        return int(o)
    if isinstance(o, (np.floating,)):
        return None if np.isnan(o) else float(o)
    if isinstance(o, (np.bool_,)):
        return bool(o)
    if isinstance(o, (pd.Timestamp,)):
        return o.isoformat()
    return str(o)


def emit(obj, out: str | None = None):
    text = json.dumps(obj, indent=2, ensure_ascii=False, default=_default)
    if out:
        with open(out, "w") as f:
            f.write(text)
    print(text)


def _kv(s: str | None) -> dict:
    if not s:
        return {}
    out = {}
    for part in s.split(","):
        k, _, v = part.partition("=")
        out[k.strip()] = float(v) if "." in v else int(v)
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(prog="tradekit", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", help="skriv JSON også til fil")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("ideas", help="#1 skann univers etter setups")
    p.add_argument("universe", help=f"liste (AAPL,MSFT) eller én av: {', '.join(UNIVERSES)}")
    p.add_argument("--top", type=int, default=5)
    p.add_argument("--csv")

    p = sub.add_parser("analyze", help="#2 teknisk analyse daglig+ukentlig")
    p.add_argument("symbol")
    p.add_argument("--csv")

    p = sub.add_parser("news", help="#3 nyheter + prisreaksjon")
    p.add_argument("query")
    p.add_argument("--symbol")
    p.add_argument("--limit", type=int, default=15)

    p = sub.add_parser("backtest", help="#4 backtest")
    p.add_argument("symbol")
    p.add_argument("strategy", help=", ".join(sorted(backtest.DEFAULTS)))
    p.add_argument("--period", default="5y", help=", ".join(backtest.PERIODS))
    p.add_argument("--params", help="f.eks. fast=20,slow=100")
    p.add_argument("--cost-bps", type=float, default=10)
    p.add_argument("--no-optimize", action="store_true")
    p.add_argument("--csv")

    p = sub.add_parser("portfolio", help="#5 porteføljerisiko")
    p.add_argument("holdings", help="TICKER:prosent,…")
    p.add_argument("--benchmark", default="^GSPC")
    p.add_argument("--period", default="2y")
    p.add_argument("--value", type=float, default=100_000)
    p.add_argument("--base", help="konverter alt til valuta, f.eks. NOK")
    p.add_argument("--max-weight", type=float, default=25, help="tak i prosent")
    p.add_argument("--shock", type=float, default=-20, help="markedssjokk i prosent")

    p = sub.add_parser("journal", help="#6 journal-analyse")
    p.add_argument("csv")
    p.add_argument("--last", type=int, default=20)

    p = sub.add_parser("plan", help="#7 dagsplan")
    p.add_argument("market", choices=list(plan.MARKETS))
    p.add_argument("--date")
    p.add_argument("--tz", default="Europe/Oslo")
    p.add_argument("--account", type=float, default=100_000)
    p.add_argument("--risk-pct", type=float, default=0.5)
    p.add_argument("--max-loss-pct", type=float, default=1.5)
    p.add_argument("--max-trades", type=int, default=4)
    p.add_argument("--watchlist", help="liste eller univers-navn")
    p.add_argument("--md", action="store_true", help="skriv markdown-sjekkliste i stedet for JSON")

    p = sub.add_parser("quote", help="siste pris + metadata")
    p.add_argument("symbol")

    a = ap.parse_args(argv)
    try:
        if a.cmd == "ideas":
            res = setups.run(a.universe, a.top, a.csv)
        elif a.cmd == "analyze":
            res = analyze.run(a.symbol.upper(), a.csv)
        elif a.cmd == "news":
            res = news.run(a.query, a.symbol.upper() if a.symbol else None, a.limit)
        elif a.cmd == "backtest":
            res = backtest.run(a.symbol.upper(), a.strategy, a.period, _kv(a.params), a.cost_bps, a.csv,
                               optimize=not a.no_optimize)
        elif a.cmd == "portfolio":
            res = portfolio.run(a.holdings, a.benchmark, a.period, a.value, a.base, a.max_weight / 100, a.shock / 100)
        elif a.cmd == "journal":
            res = journal.run(a.csv, a.last)
        elif a.cmd == "plan":
            res = plan.build(a.market, a.date, a.tz, a.account, a.risk_pct, a.max_loss_pct, a.max_trades,
                             resolve(a.watchlist) if a.watchlist else None)
            if a.md:
                text = plan.to_markdown(res)
                if a.out:
                    open(a.out, "w").write(text)
                print(text)
                return 0
        elif a.cmd == "quote":
            res = data.meta(a.symbol.upper())
    except (data.DataError, ValueError) as exc:
        emit({"error": str(exc)})
        return 2
    emit(res, a.out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
