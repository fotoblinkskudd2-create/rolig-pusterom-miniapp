"""#3 News → Trading Converter. Henter overskrifter + prisreaksjon + forventet bevegelsesrom.

Sentimentet her er et grovt leksikon — Claude gjør den egentlige tolkningen.
"""

from __future__ import annotations

import math

import numpy as np

from . import data, indicators as ind

POS = {"beat", "beats", "surge", "soar", "record", "upgrade", "raises", "raised", "strong", "growth", "buyback",
       "outperform", "rally", "jumps", "approval", "approved", "wins", "contract", "partnership", "dividend", "profit",
       "rises", "gains", "bullish", "expands", "tops"}
NEG = {"miss", "misses", "plunge", "falls", "drop", "drops", "downgrade", "cuts", "cut", "weak", "lawsuit", "probe",
       "investigation", "recall", "loss", "losses", "layoffs", "warning", "warns", "slump", "tariff", "tariffs",
       "fine", "bearish", "sinks", "tumbles", "delay", "halt", "sell-off", "selloff", "default", "fraud"}


def score(title: str) -> int:
    words = {w.strip(".,:;!?'\"()").lower() for w in title.split()}
    return len(words & POS) - len(words & NEG)


def run(query: str, symbol: str | None = None, limit: int = 15) -> dict:
    items = data.news(query, limit)
    for it in items:
        it["sentiment"] = score(it["title"])
    out = {
        "query": query,
        "headlines": items,
        "sentiment_sum": sum(i["sentiment"] for i in items),
        "positive": sum(1 for i in items if i["sentiment"] > 0),
        "negative": sum(1 for i in items if i["sentiment"] < 0),
    }
    if symbol:
        df = data.history(symbol, "1y", "1d")
        e = ind.enrich(df)
        c = float(e["Close"].iloc[-1])
        hv = float(e["hv20"].iloc[-1])
        a = float(e["atr"].iloc[-1])
        # 1σ-bånd fra historisk vol: ±c·σ·√(t/252).
        rng = lambda d: {"low": round(c * math.exp(-hv * math.sqrt(d / 252)), 2),
                         "high": round(c * math.exp(hv * math.sqrt(d / 252)), 2),
                         "pct": round(hv * math.sqrt(d / 252) * 100, 1)}
        r = e["Close"].pct_change()
        out["price"] = {
            "symbol": symbol,
            "close": round(c, 2),
            "ret_1d_pct": round(float(r.iloc[-1] * 100), 2),
            "ret_5d_pct": round(float((c / e["Close"].iloc[-6] - 1) * 100), 2),
            "ret_20d_pct": round(float((c / e["Close"].iloc[-21] - 1) * 100), 2),
            "volume_vs_avg20": round(float(e["Volume"].iloc[-1] / e["vol_avg20"].iloc[-1]), 2) if e["vol_avg20"].iloc[-1] else None,
            "gap_today_pct": round(float((df["Open"].iloc[-1] / df["Close"].iloc[-2] - 1) * 100), 2),
            "atr": round(a, 2),
            "hv20_annual_pct": round(hv * 100, 1),
            "expected_range_1sigma": {"1d": rng(1), "5d": rng(5), "20d": rng(20), "60d": rng(60)},
            "biggest_moves_90d": [
                {"date": str(d.date()), "pct": round(float(v * 100), 2)}
                for d, v in r.iloc[-90:].abs().nlargest(5).items() for v in [r[d]]
            ],
            "sma50_trend": "over" if c > e["sma50"].iloc[-1] else "under",
            "rsi": round(float(e["rsi"].iloc[-1]), 1),
        }
    return out
