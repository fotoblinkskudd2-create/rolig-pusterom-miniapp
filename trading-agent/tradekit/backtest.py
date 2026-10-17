"""#4 Strategy Backtester.

Motor: signal på close(t) → handel på open(t+1). Valgfri ATR-stopp som
trigges intradag (gap-through fylles på open). Kurtasje+slippage i bps
per side. Forbedringer testes med in-sample/out-of-sample-split så vi
ikke selger deg en kurvetilpasset løgn.
"""

from __future__ import annotations

import itertools

import numpy as np
import pandas as pd

from . import data, indicators as ind

PERIODS = {"1y": 252, "2y": 504, "3y": 756, "5y": 1260, "10y": 2520, "max": 10**9}


def _cross_up(a, b):
    return (a > b) & (a.shift() <= b.shift())


def _cross_down(a, b):
    return (a < b) & (a.shift() >= b.shift())


def _rsi_div_entries(close: pd.Series, r: pd.Series, n: int) -> pd.Series:
    c, rv = close.values, r.values
    out = np.zeros(len(c), dtype=bool)
    for i in range(2 * n, len(c)):
        w1 = slice(i - 2 * n + 1, i - n + 1)
        w2 = slice(i - n + 1, i + 1)
        a = w1.start + int(np.argmin(c[w1]))
        b = w2.start + int(np.argmin(c[w2]))
        if c[b] < c[a] and rv[b] > rv[a] and rv[b] < 40 and b >= i - 2 and rv[i] > rv[i - 1]:
            out[i] = True
    return pd.Series(out, index=close.index)


def signals(e: pd.DataFrame, strategy: str, p: dict) -> tuple[pd.Series, pd.Series]:
    c = e["Close"]
    if strategy in ("sma_cross", "ma_cross"):
        f, s = ind.sma(c, p["fast"]), ind.sma(c, p["slow"])
        return f > s, f < s
    if strategy == "ema_cross":
        f, s = ind.ema(c, p["fast"]), ind.ema(c, p["slow"])
        return f > s, f < s
    if strategy == "rsi":
        r = ind.rsi(c, p["period"])
        return _cross_up(r, pd.Series(p["low"], index=c.index)), r > p["high"]
    if strategy == "rsi_divergence":
        r = ind.rsi(c, 14)
        return _rsi_div_entries(c, r, p["window"]), r > p["exit_rsi"]
    if strategy in ("breakout", "donchian"):
        hi = e["High"].rolling(p["entry"]).max().shift()
        lo = e["Low"].rolling(p["exit"]).min().shift()
        return c > hi, c < lo
    if strategy == "macd":
        m = ind.macd(c, p["fast"], p["slow"], p["signal"])
        return _cross_up(m["macd"], m["signal"]), _cross_down(m["macd"], m["signal"])
    if strategy == "bollinger":
        bb = ind.bollinger(c, p["period"], p["k"])
        return _cross_up(c, bb["lower"]), c > bb["mid"]
    raise ValueError(f"ukjent strategi: {strategy}")


DEFAULTS = {
    "sma_cross": {"fast": 50, "slow": 200},
    "ma_cross": {"fast": 50, "slow": 200},
    "ema_cross": {"fast": 12, "slow": 26},
    "rsi": {"period": 14, "low": 30, "high": 70},
    "rsi_divergence": {"window": 10, "exit_rsi": 65},
    "breakout": {"entry": 20, "exit": 10},
    "donchian": {"entry": 55, "exit": 20},
    "macd": {"fast": 12, "slow": 26, "signal": 9},
    "bollinger": {"period": 20, "k": 2.0},
}

GRIDS = {
    "sma_cross": {"fast": [10, 20, 50], "slow": [50, 100, 200]},
    "ma_cross": {"fast": [10, 20, 50], "slow": [50, 100, 200]},
    "ema_cross": {"fast": [8, 12, 20], "slow": [26, 50, 100]},
    "rsi": {"period": [2, 7, 14], "low": [10, 25, 30], "high": [55, 65, 70]},
    "rsi_divergence": {"window": [7, 10, 15], "exit_rsi": [55, 65, 70]},
    "breakout": {"entry": [20, 40, 55], "exit": [10, 20]},
    "donchian": {"entry": [20, 40, 55], "exit": [10, 20]},
    "macd": {"fast": [8, 12], "slow": [21, 26], "signal": [5, 9]},
    "bollinger": {"period": [10, 20], "k": [1.5, 2.0, 2.5]},
}


def simulate(e: pd.DataFrame, entries: pd.Series, exits: pd.Series, *, cost_bps: float = 10,
             atr_stop: float | None = None, trend_filter: int | None = None) -> dict:
    o, h, l, c = (e[k].values for k in ("Open", "High", "Low", "Close"))
    a = e["atr"].values
    ent = entries.fillna(False).values.copy()
    ex = exits.fillna(False).values
    if trend_filter:
        ma = ind.sma(e["Close"], trend_filter).values
        ent &= c > np.nan_to_num(ma, nan=np.inf)
    cost = cost_bps / 10_000
    n = len(c)
    equity = np.ones(n)
    pos = 0
    entry_px = stop_px = 0.0
    entry_i = 0
    trades = []
    cash = 1.0
    shares = 0.0
    pending_entry = pending_exit = False
    for i in range(n):
        # 1) Utfør ordre fra gårsdagens signal på dagens open.
        if pending_exit and pos:
            px = o[i] * (1 - cost)
            cash = shares * px
            trades.append((entry_i, i, entry_px, o[i], "signal"))
            pos, shares = 0, 0.0
        if pending_entry and not pos:
            entry_px = o[i]
            shares = cash / (o[i] * (1 + cost))
            pos, entry_i = 1, i
            stop_px = entry_px - atr_stop * a[i - 1] if atr_stop and i > 0 and not np.isnan(a[i - 1]) else -np.inf
        pending_entry = pending_exit = False
        # 2) Intradag stopp.
        if pos and l[i] <= stop_px:
            fill = min(o[i], stop_px)
            cash = shares * fill * (1 - cost)
            trades.append((entry_i, i, entry_px, fill, "stop"))
            pos, shares = 0, 0.0
        # 3) Signaler på close.
        if pos and ex[i]:
            pending_exit = True
        elif not pos and ent[i]:
            pending_entry = True
        equity[i] = shares * c[i] if pos else cash
    if pos:
        trades.append((entry_i, n - 1, entry_px, c[-1], "open"))
    eq = pd.Series(equity, index=e.index)
    return {"equity": eq, "trades": trades}


def metrics(e: pd.DataFrame, res: dict) -> dict:
    eq = res["equity"]
    tr = res["trades"]
    pnl = np.array([(x / en - 1) for _, _, en, x, _ in tr]) if tr else np.array([])
    gains, losses = pnl[pnl > 0], pnl[pnl <= 0]
    rets = eq.pct_change().fillna(0)
    years = max(len(eq) / 252, 1e-9)
    dd = eq / eq.cummax() - 1
    bh = e["Close"] / e["Close"].iloc[0]
    bh_dd = bh / bh.cummax() - 1
    days_in = sum(x - en for en, x, *_ in tr)
    downside = rets[rets < 0].std() * np.sqrt(252)
    return {
        "trades": len(tr),
        "win_rate": round(float(len(gains) / len(pnl)), 3) if len(pnl) else None,
        "profit_factor": round(float(gains.sum() / -losses.sum()), 2) if len(losses) and losses.sum() < 0 else None,
        "avg_win_pct": round(float(gains.mean() * 100), 2) if len(gains) else None,
        "avg_loss_pct": round(float(losses.mean() * 100), 2) if len(losses) else None,
        "expectancy_pct": round(float(pnl.mean() * 100), 2) if len(pnl) else None,
        "total_return_pct": round(float((eq.iloc[-1] - 1) * 100), 2),
        "cagr_pct": round(float((eq.iloc[-1] ** (1 / years) - 1) * 100), 2),
        "max_drawdown_pct": round(float(dd.min() * 100), 2),
        "sharpe": round(float(rets.mean() / rets.std() * np.sqrt(252)), 2) if rets.std() > 0 else None,
        "sortino": round(float(rets.mean() * 252 / downside), 2) if downside and downside > 0 else None,
        "exposure_pct": round(float(days_in / len(eq) * 100), 1),
        "buy_hold_return_pct": round(float((bh.iloc[-1] - 1) * 100), 2),
        "buy_hold_max_dd_pct": round(float(bh_dd.min() * 100), 2),
        "stopped_out": sum(1 for t in tr if t[4] == "stop"),
    }


def _score(m: dict) -> float:
    # Robusthet før avkastning: Sharpe straffet for dyp drawdown og få handler.
    if not m["trades"] or m["sharpe"] is None:
        return -9
    return m["sharpe"] - abs(m["max_drawdown_pct"]) / 100 - (0.5 if m["trades"] < 8 else 0)


def run(symbol: str, strategy: str, period: str = "5y", params: dict | None = None,
        cost_bps: float = 10, csv: str | None = None, optimize: bool = True) -> dict:
    strategy = strategy.lower().replace("-", "_")
    if strategy not in DEFAULTS:
        raise ValueError(f"strategi må være en av {sorted(DEFAULTS)}")
    raw = data.history(symbol, "max" if PERIODS.get(period, 0) > 1260 else "10y", "1d", csv=csv)
    if len(raw) > 30 and (raw.index[-1] - raw.index[-30]).days > 120:
        raise data.DataError("fikk ikke daglige barer fra datakilden")
    e_full = ind.enrich(raw)
    bars = PERIODS.get(period, 1260)
    warm = 250  # indikatorer trenger oppvarming før testvinduet
    e_full = e_full.iloc[-(bars + warm):] if bars < len(e_full) else e_full
    p = {**DEFAULTS[strategy], **(params or {})}

    def bt(frame, prm, **kw):
        en, ex = signals(frame, strategy, prm)
        window = frame.iloc[warm:] if len(frame) > warm + 50 else frame
        r = simulate(window, en.loc[window.index], ex.loc[window.index], cost_bps=cost_bps, **kw)
        return metrics(window, r), r

    base_m, base_r = bt(e_full, p)
    idx = base_r["equity"].index
    out = {
        "symbol": symbol,
        "strategy": strategy,
        "params": p,
        "period": period,
        "from": str(e_full.index[min(warm, len(e_full) - 1)].date()),
        "to": str(e_full.index[-1].date()),
        "cost_bps_per_side": cost_bps,
        "baseline": base_m,
        "last_trades": [
            {"entry": str(idx[a].date()), "exit": str(idx[b].date()),
             "return_pct": round((x / en - 1) * 100, 2), "exit_reason": why}
            for a, b, en, x, why in base_r["trades"][-10:]
        ],
    }
    if not optimize:
        return out

    # Forbedringer: filtre + stopp på baseline-parametre.
    variants = {
        "+ SMA200 trendfilter": dict(trend_filter=200),
        "+ 2×ATR stopp": dict(atr_stop=2.0),
        "+ 3×ATR stopp": dict(atr_stop=3.0),
        "+ SMA200 filter + 2.5×ATR stopp": dict(trend_filter=200, atr_stop=2.5),
    }
    out["filter_tests"] = []
    for name, kw in variants.items():
        m, _ = bt(e_full, p, **kw)
        out["filter_tests"].append({"variant": name, **{k: m[k] for k in (
            "trades", "win_rate", "profit_factor", "cagr_pct", "max_drawdown_pct", "sharpe")}})

    # Walk-forward light: optimer på første 70 %, verifiser på siste 30 %.
    split = warm + int((len(e_full) - warm) * 0.7)
    is_frame = e_full.iloc[:split]
    oos_frame = e_full.iloc[split - warm:]
    grid = GRIDS[strategy]
    keys = list(grid)
    rows = []
    for combo in itertools.product(*(grid[k] for k in keys)):
        prm = dict(zip(keys, combo))
        if "fast" in prm and "slow" in prm and prm["fast"] >= prm["slow"]:
            continue
        m_is, _ = bt(is_frame, prm)
        rows.append((prm, m_is))
    rows.sort(key=lambda x: _score(x[1]), reverse=True)
    best = []
    for prm, m_is in rows[:3]:
        m_oos, _ = bt(oos_frame, prm)
        best.append({
            "params": prm,
            "in_sample": {k: m_is[k] for k in ("trades", "win_rate", "profit_factor", "cagr_pct", "max_drawdown_pct", "sharpe")},
            "out_of_sample": {k: m_oos[k] for k in ("trades", "win_rate", "profit_factor", "cagr_pct", "max_drawdown_pct", "sharpe")},
        })
    base_oos, _ = bt(oos_frame, p)
    out["walk_forward"] = {
        "in_sample": f"{is_frame.index[warm].date()} → {is_frame.index[-1].date()}",
        "out_of_sample": f"{oos_frame.index[warm].date()} → {oos_frame.index[-1].date()}",
        "baseline_out_of_sample": {k: base_oos[k] for k in ("trades", "win_rate", "profit_factor", "cagr_pct", "max_drawdown_pct", "sharpe")},
        "top3": best,
        "combos_tested": len(rows),
    }
    return out
