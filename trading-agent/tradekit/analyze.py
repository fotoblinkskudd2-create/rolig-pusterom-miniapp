"""#2 Automated Technical Analyst — daglig + ukentlig, poengsatt signal."""

from __future__ import annotations

import numpy as np
import pandas as pd

from . import data, indicators as ind


def _r(x, n=2):
    return None if x is None or (isinstance(x, float) and np.isnan(x)) else round(float(x), n)


def snapshot(df: pd.DataFrame, label: str) -> dict:
    e = ind.enrich(df)
    last = e.iloc[-1]
    prev = e.iloc[-2]
    c = float(last["Close"])
    checks: list[tuple[str, int, str]] = []  # (navn, poeng -2..+2, forklaring)

    def ma_check(n):
        v = last.get(f"sma{n}")
        if pd.notna(v):
            checks.append((f"SMA{n}", 1 if c > v else -1, f"pris {'over' if c > v else 'under'} SMA{n} ({v:.2f})"))

    for n in (20, 50, 200):
        ma_check(n)

    if pd.notna(last["sma50"]) and pd.notna(last["sma200"]):
        golden = last["sma50"] > last["sma200"]
        checks.append(("SMA50/200", 1 if golden else -1, "golden-cross-regime" if golden else "death-cross-regime"))

    tl = ind.trendline(e["Close"], 60 if label == "daily" else 26)
    if tl["slope_pct_per_day"] is not None:
        s = 1 if tl["slope_pct_per_day"] > 0 else -1
        if tl["r2"] and tl["r2"] > 0.6:
            s *= 2
        checks.append(("trendlinje", s, f"helning {tl['annualized_pct']}%/år, R² {tl['r2']}"))

    r = last["rsi"]
    if pd.notna(r):
        if r > 70:
            checks.append(("RSI", -1, f"RSI {r:.1f} overkjøpt"))
        elif r < 30:
            checks.append(("RSI", 1, f"RSI {r:.1f} oversolgt (kontrær)"))
        else:
            checks.append(("RSI", 1 if r > 50 else -1, f"RSI {r:.1f} {'bull' if r > 50 else 'bear'}-sone"))

    if pd.notna(last["macd"]):
        m_up = last["macd"] > last["signal"]
        cross = (prev["macd"] <= prev["signal"]) != (last["macd"] <= last["signal"])
        checks.append(("MACD", (2 if cross else 1) * (1 if m_up else -1),
                       f"MACD {'over' if m_up else 'under'} signal{' — fersk kryssing' if cross else ''}, hist {last['hist']:.3f}"))

    adx_v = last["adx"]
    trend_strength = "sterk trend" if adx_v > 25 else ("svak/ingen trend" if adx_v < 20 else "moderat")

    vol_ratio = last["Volume"] / last["vol_avg20"] if last["vol_avg20"] else np.nan
    obv_slope = e["obv"].iloc[-20:].diff().mean()
    if pd.notna(obv_slope) and e["Volume"].iloc[-20:].sum() > 0:
        checks.append(("OBV", 1 if obv_slope > 0 else -1, f"OBV {'stiger' if obv_slope > 0 else 'faller'} (akkumulering/distribusjon)"))

    div = ind.divergence(e["Close"], e["rsi"])
    if div:
        checks.append(("RSI-divergens", 2 if div == "bullish" else -2, f"{div} divergens"))

    bb_pos = (c - last["bb_lower"]) / (last["bb_upper"] - last["bb_lower"]) if last["bb_upper"] != last["bb_lower"] else np.nan

    score = sum(p for _, p, _ in checks)
    max_score = sum(abs(2 if n in ("trendlinje", "MACD", "RSI-divergens") else 1) for n, _, _ in checks) or 1
    lv = ind.levels(df.iloc[-260:] if label == "daily" else df.iloc[-156:])

    return {
        "timeframe": label,
        "date": str(e.index[-1].date()),
        "close": _r(c),
        "change_pct": _r((c / prev["Close"] - 1) * 100),
        "moving_averages": {k: _r(last[k]) for k in ("sma20", "sma50", "sma200", "ema9", "ema21")},
        "rsi": _r(r, 1),
        "macd": {"macd": _r(last["macd"], 3), "signal": _r(last["signal"], 3), "hist": _r(last["hist"], 3)},
        "stoch_k": _r(last["stoch_k"], 1),
        "adx": _r(adx_v, 1),
        "trend_strength": trend_strength,
        "atr": _r(last["atr"]),
        "atr_pct": _r(last["atr"] / c * 100),
        "hv20_annual_pct": _r(last["hv20"] * 100, 1),
        "bollinger_position": _r(bb_pos),
        "volume_vs_avg20": _r(vol_ratio),
        "trendline": tl,
        "levels": lv,
        "divergence": div,
        "checks": [{"name": n, "points": p, "why": w} for n, p, w in checks],
        "score": score,
        "score_norm": round(score / max_score, 2),
    }


def signal(daily: dict, weekly: dict) -> dict:
    # Ukentlig veier tyngre: den bestemmer retningen, daglig bestemmer timingen.
    combined = 0.6 * weekly["score_norm"] + 0.4 * daily["score_norm"]
    if combined >= 0.35:
        verdict = "BUY"
    elif combined <= -0.35:
        verdict = "SELL"
    else:
        verdict = "HOLD"
    aligned = np.sign(weekly["score_norm"]) == np.sign(daily["score_norm"])
    conf = min(0.95, abs(combined) * (1.0 if aligned else 0.6))

    price = daily["close"]
    atr_v = daily["atr"]
    sup = [s["level"] for s in daily["levels"]["support"]]
    res = [s["level"] for s in daily["levels"]["resistance"]]
    plan = None
    if verdict == "BUY":
        entry = price
        stop = (sup[0] - 0.5 * atr_v) if sup and price - sup[0] < 3 * atr_v else price - 2 * atr_v
        risk = entry - stop
        t1 = res[0] if res and res[0] - entry > risk else entry + 2 * risk
        t2 = res[1] if len(res) > 1 and res[1] > t1 else entry + 3 * risk
        plan = {"side": "long", "entry": entry, "stop": stop, "target1": t1, "target2": t2}
    elif verdict == "SELL":
        entry = price
        stop = (res[0] + 0.5 * atr_v) if res and res[0] - price < 3 * atr_v else price + 2 * atr_v
        risk = stop - entry
        t1 = sup[0] if sup and entry - sup[0] > risk else entry - 2 * risk
        t2 = sup[1] if len(sup) > 1 and sup[1] < t1 else entry - 3 * risk
        plan = {"side": "short/exit", "entry": entry, "stop": stop, "target1": t1, "target2": t2}
    if plan:
        risk = abs(plan["entry"] - plan["stop"])
        plan = {k: (round(v, 2) if isinstance(v, float) else v) for k, v in plan.items()}
        plan["rr_target1"] = round(abs(plan["target1"] - plan["entry"]) / risk, 2) if risk else None
        plan["rr_target2"] = round(abs(plan["target2"] - plan["entry"]) / risk, 2) if risk else None

    return {
        "verdict": verdict,
        "combined_score": round(float(combined), 2),
        "confidence": round(float(conf), 2),
        "timeframes_aligned": bool(aligned),
        "plan": plan,
    }


def run(symbol: str, csv: str | None = None) -> dict:
    df = data.history(symbol, "5y", "1d", csv=csv)
    d = snapshot(df.iloc[-600:], "daily")
    w = snapshot(data.weekly(df), "weekly")
    out = {"symbol": symbol, "daily": d, "weekly": w, "signal": signal(d, w)}
    if not csv:
        try:
            out["meta"] = data.meta(symbol)
        except data.DataError:
            pass
    return out
