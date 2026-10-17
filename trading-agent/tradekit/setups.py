"""#1 Trading Ideas Generator — skanner et univers etter setups.

Hver setup er en vektorisert betingelse + ATR-baserte stopp/mål.
"Sannsynlighet" er ikke synsing: vi kjører samme trigger bakover i
historikken for symbolet og måler hvor ofte mål ble truffet før stopp.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

import numpy as np
import pandas as pd

from . import data, indicators as ind
from .universe import resolve


@dataclass
class Setup:
    name: str
    side: str  # long | short
    why: str
    cond: Callable[[pd.DataFrame], pd.Series]
    stop_atr: float
    target_atr: float
    horizon: int = 20  # bar


def _c(e):
    return e["Close"]


SETUPS: list[Setup] = [
    Setup(
        "Trend-pullback til EMA21", "long",
        "Opptrend (pris > SMA50 > SMA200) som har trukket seg ned til EMA21 med RSI avkjølt til 40–55. "
        "Kjøper styrke på rabatt, med trenden i ryggen.",
        lambda e: (_c(e) > e["sma50"]) & (e["sma50"] > e["sma200"])
        & ((_c(e) - e["ema21"]).abs() <= 0.6 * e["atr"]) & e["rsi"].between(40, 55),
        stop_atr=1.5, target_atr=3.0,
    ),
    Setup(
        "Breakout over 20-dagers topp på volum", "long",
        "Lukker over forrige 20-dagers høy med volum ≥1.5× snitt og ADX > 20. Momentum + deltakelse.",
        lambda e: (_c(e) > e["hi20"].shift()) & (e["Volume"] > 1.5 * e["vol_avg20"]) & (e["adx"] > 20),
        stop_atr=1.5, target_atr=3.0,
    ),
    Setup(
        "Volatilitets-squeeze i opptrend", "long",
        "Bollinger-bredden i laveste 10 % av siste 120 dager mens pris > SMA50. Kompresjon før ekspansjon.",
        lambda e: (e["bb_width"] <= e["bb_width"].rolling(120, min_periods=60).quantile(0.10))
        & (_c(e) > e["sma50"]),
        stop_atr=1.2, target_atr=3.0,
    ),
    Setup(
        "Oversolgt sprett i langsiktig opptrend", "long",
        "Pris > SMA200, men RSI < 35 og stokastisk krysser opp fra < 20. Mean reversion i en bull-struktur.",
        lambda e: (_c(e) > e["sma200"]) & (e["rsi"] < 35)
        & (e["stoch_k"] > e["stoch_d"]) & (e["stoch_k"].shift() <= e["stoch_d"].shift()) & (e["stoch_k"] < 30),
        stop_atr=1.5, target_atr=2.5, horizon=15,
    ),
    Setup(
        "MACD-kryss over null-linjen", "long",
        "MACD krysser over signal mens begge er over null og pris > SMA50. Trendfortsettelse.",
        lambda e: (e["macd"] > e["signal"]) & (e["macd"].shift() <= e["signal"].shift())
        & (e["macd"] > 0) & (_c(e) > e["sma50"]),
        stop_atr=1.5, target_atr=3.0,
    ),
    Setup(
        "Breakdown under 20-dagers bunn", "short",
        "Lukker under forrige 20-dagers lav, under SMA200, volum ≥1.3× snitt. Svakhet som akselererer.",
        lambda e: (_c(e) < e["lo20"].shift()) & (_c(e) < e["sma200"]) & (e["Volume"] > 1.3 * e["vol_avg20"]),
        stop_atr=1.5, target_atr=3.0,
    ),
    Setup(
        "Bear-flagg: rally til EMA21 i nedtrend", "short",
        "Pris < SMA50 < SMA200, rally opp mot EMA21 med RSI 45–60. Selger styrke i svak struktur.",
        lambda e: (_c(e) < e["sma50"]) & (e["sma50"] < e["sma200"])
        & ((_c(e) - e["ema21"]).abs() <= 0.6 * e["atr"]) & e["rsi"].between(45, 60),
        stop_atr=1.5, target_atr=3.0,
    ),
]


def forward_stats(e: pd.DataFrame, s: Setup, min_gap: int = 5) -> dict:
    """Hit-rate: traff mål før stopp innen horisonten? Konservativt: samme bar = stopp."""
    trig = s.cond(e).fillna(False).values
    hi, lo, cl, a = e["High"].values, e["Low"].values, e["Close"].values, e["atr"].values
    n = len(e)
    wins = losses = timeouts = 0
    r_mults = []
    last = -10**9
    for i in np.flatnonzero(trig):
        if i - last < min_gap or i >= n - 1 or np.isnan(a[i]):
            continue
        last = i
        entry = cl[i]
        if s.side == "long":
            stop, tgt = entry - s.stop_atr * a[i], entry + s.target_atr * a[i]
        else:
            stop, tgt = entry + s.stop_atr * a[i], entry - s.target_atr * a[i]
        res = None
        for j in range(i + 1, min(n, i + 1 + s.horizon)):
            hit_stop = lo[j] <= stop if s.side == "long" else hi[j] >= stop
            hit_tgt = hi[j] >= tgt if s.side == "long" else lo[j] <= tgt
            if hit_stop:
                res = -1.0
                break
            if hit_tgt:
                res = s.target_atr / s.stop_atr
                break
        if res is None:
            if i + s.horizon >= n:
                continue  # fortsatt åpen, telles ikke
            exit_px = cl[min(n - 1, i + s.horizon)]
            res = ((exit_px - entry) if s.side == "long" else (entry - exit_px)) / (s.stop_atr * a[i])
            timeouts += 1
        elif res > 0:
            wins += 1
        else:
            losses += 1
        r_mults.append(res)
    total = len(r_mults)
    return {
        "samples": total,
        "win_rate": round((sum(1 for r in r_mults if r > 0) / total), 2) if total else None,
        "target_before_stop": wins,
        "stopped": losses,
        "timed_out": timeouts,
        "expectancy_R": round(float(np.mean(r_mults)), 2) if total else None,
    }


def _structure(e: pd.DataFrame, s: Setup) -> dict:
    last = e.iloc[-1]
    entry = float(last["Close"])
    a = float(last["atr"])
    lv = ind.levels(e.iloc[-260:])
    if s.side == "long":
        stop = entry - s.stop_atr * a
        sup = [x["level"] for x in lv["support"] if x["level"] < entry]
        if sup and entry - sup[0] < s.stop_atr * a * 1.5:
            stop = min(stop, sup[0] - 0.25 * a)  # stopp under strukturell støtte
        risk = entry - stop
        res = [x["level"] for x in lv["resistance"]]
        t1 = entry + 2 * risk
        t2 = max(entry + s.target_atr * a, entry + 3 * risk)
        if res and res[0] > entry + 1.5 * risk:
            t1 = res[0]
    else:
        stop = entry + s.stop_atr * a
        res = [x["level"] for x in lv["resistance"] if x["level"] > entry]
        if res and res[0] - entry < s.stop_atr * a * 1.5:
            stop = max(stop, res[0] + 0.25 * a)
        risk = stop - entry
        sup = [x["level"] for x in lv["support"]]
        t1 = entry - 2 * risk
        t2 = min(entry - s.target_atr * a, entry - 3 * risk)
        if sup and sup[0] < entry - 1.5 * risk:
            t1 = sup[0]
    return {
        "entry": round(entry, 2),
        "stop": round(stop, 2),
        "target1": round(t1, 2),
        "target2": round(t2, 2),
        "risk_per_share": round(risk, 2),
        "risk_pct": round(risk / entry * 100, 2),
        "rr_target1": round(abs(t1 - entry) / risk, 2),
        "rr_target2": round(abs(t2 - entry) / risk, 2),
        "levels": lv,
    }


def scan_symbol(symbol: str, df: pd.DataFrame, lookback_trigger: int = 3) -> list[dict]:
    e = ind.enrich(df)
    w = ind.enrich(data.weekly(df))
    wk_trend = "up" if w["Close"].iloc[-1] > w["sma20"].iloc[-1] else "down"
    out = []
    for s in SETUPS:
        cond = s.cond(e).fillna(False)
        recent = cond.iloc[-lookback_trigger:]
        if not recent.any():
            continue
        stats = forward_stats(e, s)
        plan = _structure(e, s)
        aligned = (s.side == "long" and wk_trend == "up") or (s.side == "short" and wk_trend == "down")
        hr = stats["win_rate"] or 0
        exp = stats["expectancy_R"] or 0
        sample_w = min(1.0, stats["samples"] / 15)
        quality = (
            40 * hr * sample_w
            + 15 * max(-1, min(2, exp))
            + 15 * (1 if aligned else -1)
            + 10 * min(plan["rr_target1"], 3) / 3
            + 5 * (1 if recent.iloc[-1] else 0)
        )
        out.append({
            "symbol": symbol,
            "setup": s.name,
            "side": s.side,
            "triggered": str(recent[recent].index[-1].date()),
            "why_technical": s.why,
            "weekly_trend": wk_trend,
            "weekly_aligned": aligned,
            "plan": plan,
            "history": stats,
            "quality": round(float(quality), 1),
            "rsi": round(float(e["rsi"].iloc[-1]), 1),
            "adx": round(float(e["adx"].iloc[-1]), 1),
        })
    return out


def run(spec: str, top: int = 5, csv: str | None = None) -> dict:
    symbols = resolve(spec)
    ideas, errors = [], {}
    for sym in symbols:
        try:
            df = data.history(sym, "5y", "1d", csv=csv)
            if len(df) < 250:
                errors[sym] = "for kort historikk (<250 dager)"
                continue
            ideas.extend(scan_symbol(sym, df))
        except data.DataError as exc:
            errors[sym] = str(exc)
    ideas.sort(key=lambda x: x["quality"], reverse=True)
    # Maks to ideer per symbol, ellers dominerer ett navn.
    picked, per = [], {}
    for i in ideas:
        if per.get(i["symbol"], 0) < 2:
            picked.append(i)
            per[i["symbol"]] = per.get(i["symbol"], 0) + 1
        if len(picked) >= top:
            break
    return {"universe": spec, "scanned": len(symbols), "found": len(ideas), "ideas": picked, "errors": errors}
