"""Indikatorer. Rene pandas-funksjoner, ingen magi."""

from __future__ import annotations

import numpy as np
import pandas as pd


def sma(s: pd.Series, n: int) -> pd.Series:
    return s.rolling(n, min_periods=n).mean()


def ema(s: pd.Series, n: int) -> pd.Series:
    return s.ewm(span=n, adjust=False, min_periods=n).mean()


def rsi(s: pd.Series, n: int = 14) -> pd.Series:
    d = s.diff()
    up = d.clip(lower=0).ewm(alpha=1 / n, adjust=False, min_periods=n).mean()
    down = (-d.clip(upper=0)).ewm(alpha=1 / n, adjust=False, min_periods=n).mean()
    rs = up / down.replace(0, np.nan)
    out = 100 - 100 / (1 + rs)
    return out.where(down != 0, 100.0)


def macd(s: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> pd.DataFrame:
    line = ema(s, fast) - ema(s, slow)
    sig = line.ewm(span=signal, adjust=False).mean()
    return pd.DataFrame({"macd": line, "signal": sig, "hist": line - sig})


def atr(df: pd.DataFrame, n: int = 14) -> pd.Series:
    pc = df["Close"].shift()
    tr = pd.concat([df["High"] - df["Low"], (df["High"] - pc).abs(), (df["Low"] - pc).abs()], axis=1).max(axis=1)
    return tr.ewm(alpha=1 / n, adjust=False, min_periods=n).mean()


def bollinger(s: pd.Series, n: int = 20, k: float = 2.0) -> pd.DataFrame:
    mid = sma(s, n)
    sd = s.rolling(n).std()
    return pd.DataFrame({"mid": mid, "upper": mid + k * sd, "lower": mid - k * sd, "width": (2 * k * sd) / mid})


def adx(df: pd.DataFrame, n: int = 14) -> pd.Series:
    up = df["High"].diff()
    down = -df["Low"].diff()
    plus_dm = np.where((up > down) & (up > 0), up, 0.0)
    minus_dm = np.where((down > up) & (down > 0), down, 0.0)
    a = atr(df, n)
    plus_di = 100 * pd.Series(plus_dm, index=df.index).ewm(alpha=1 / n, adjust=False).mean() / a
    minus_di = 100 * pd.Series(minus_dm, index=df.index).ewm(alpha=1 / n, adjust=False).mean() / a
    dx = 100 * (plus_di - minus_di).abs() / (plus_di + minus_di).replace(0, np.nan)
    return dx.ewm(alpha=1 / n, adjust=False, min_periods=n).mean()


def stoch(df: pd.DataFrame, n: int = 14, d: int = 3) -> pd.DataFrame:
    lo = df["Low"].rolling(n).min()
    hi = df["High"].rolling(n).max()
    k = 100 * (df["Close"] - lo) / (hi - lo).replace(0, np.nan)
    return pd.DataFrame({"k": k, "d": k.rolling(d).mean()})


def obv(df: pd.DataFrame) -> pd.Series:
    return (np.sign(df["Close"].diff()).fillna(0) * df["Volume"]).cumsum()


def swing_points(df: pd.DataFrame, window: int = 5) -> tuple[pd.Series, pd.Series]:
    """Lokale topper/bunner: høyest/lavest innenfor ±window bar."""
    w = 2 * window + 1
    highs = df["High"][df["High"] == df["High"].rolling(w, center=True).max()]
    lows = df["Low"][df["Low"] == df["Low"].rolling(w, center=True).min()]
    return highs, lows


def levels(df: pd.DataFrame, window: int = 5, tolerance: float = 0.015, max_levels: int = 6) -> dict:
    """Støtte/motstand ved å klynge swing-punkter. Styrke = antall berøringer."""
    highs, lows = swing_points(df, window)
    pts = sorted(list(highs.values) + list(lows.values))
    clusters: list[list[float]] = []
    for p in pts:
        if clusters and abs(p - np.mean(clusters[-1])) / np.mean(clusters[-1]) <= tolerance:
            clusters[-1].append(p)
        else:
            clusters.append([p])
    price = float(df["Close"].iloc[-1])
    lv = [{"level": round(float(np.mean(c)), 2), "touches": len(c)} for c in clusters]
    support = sorted([x for x in lv if x["level"] < price], key=lambda x: price - x["level"])[:max_levels]
    resistance = sorted([x for x in lv if x["level"] > price], key=lambda x: x["level"] - price)[:max_levels]
    return {"support": support, "resistance": resistance}


def trendline(s: pd.Series, lookback: int = 60) -> dict:
    """Lineær regresjon på log-pris: helning i %/dag og R²."""
    y = np.log(s.dropna().iloc[-lookback:].values)
    if len(y) < 10:
        return {"slope_pct_per_day": None, "r2": None}
    x = np.arange(len(y))
    b, a = np.polyfit(x, y, 1)
    fit = a + b * x
    ss_res = ((y - fit) ** 2).sum()
    ss_tot = ((y - y.mean()) ** 2).sum()
    return {
        "slope_pct_per_day": round(float((np.exp(b) - 1) * 100), 4),
        "annualized_pct": round(float((np.exp(b * 252) - 1) * 100), 2),
        "r2": round(float(1 - ss_res / ss_tot) if ss_tot else 0.0, 3),
        "channel_now": round(float(np.exp(fit[-1])), 4),
    }


def enrich(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    c = out["Close"]
    for n in (10, 20, 50, 100, 200):
        out[f"sma{n}"] = sma(c, n)
    for n in (9, 21, 50):
        out[f"ema{n}"] = ema(c, n)
    out["rsi"] = rsi(c)
    out = out.join(macd(c))
    out["atr"] = atr(out)
    bb = bollinger(c)
    out["bb_upper"], out["bb_lower"], out["bb_width"] = bb["upper"], bb["lower"], bb["width"]
    out["adx"] = adx(out)
    st = stoch(out)
    out["stoch_k"], out["stoch_d"] = st["k"], st["d"]
    out["obv"] = obv(out)
    out["vol_avg20"] = out["Volume"].rolling(20).mean()
    out["hv20"] = np.log(c).diff().rolling(20).std() * np.sqrt(252)
    out["hi20"] = out["High"].rolling(20).max()
    out["lo20"] = out["Low"].rolling(20).min()
    out["hi252"] = out["High"].rolling(252, min_periods=60).max()
    out["lo252"] = out["Low"].rolling(252, min_periods=60).min()
    return out


def divergence(price: pd.Series, osc: pd.Series, lookback: int = 40, window: int = 5) -> str | None:
    """Enkel RSI-divergens på de to siste swing-punktene i vinduet."""
    p = price.iloc[-lookback:]
    o = osc.iloc[-lookback:]
    w = 2 * window + 1
    lows = p[p == p.rolling(w, center=True, min_periods=window + 1).min()]
    highs = p[p == p.rolling(w, center=True, min_periods=window + 1).max()]
    if len(lows) >= 2:
        a, b = lows.index[-2], lows.index[-1]
        if p[b] < p[a] and o[b] > o[a]:
            return "bullish"
    if len(highs) >= 2:
        a, b = highs.index[-2], highs.index[-1]
        if p[b] > p[a] and o[b] < o[a]:
            return "bearish"
    return None
