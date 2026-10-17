"""Kursdata og nyheter.

Kilde: Yahoo Finance sitt åpne chart-API (forsinket, ikke sanntid).
Fallback: lokal CSV med kolonnene Date,Open,High,Low,Close,Volume.
Cache i ~/.cache/tradekit så samme kall ikke hamrer API-et.
"""

from __future__ import annotations

import json
import os
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

import pandas as pd
import requests

UA = {"User-Agent": "Mozilla/5.0 (tradekit)"}
CACHE_DIR = Path(os.environ.get("TRADEKIT_CACHE", Path.home() / ".cache" / "tradekit"))
CACHE_TTL = int(os.environ.get("TRADEKIT_CACHE_TTL", "900"))


class DataError(RuntimeError):
    pass


def _cache_get(key: str):
    path = CACHE_DIR / f"{key}.json"
    if path.exists() and time.time() - path.stat().st_mtime < CACHE_TTL:
        return json.loads(path.read_text())
    return None


def _cache_put(key: str, payload) -> None:
    try:
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        (CACHE_DIR / f"{key}.json").write_text(json.dumps(payload))
    except OSError:
        pass


def _get(url: str, retries: int = 3):
    last = None
    for attempt in range(retries):
        try:
            r = requests.get(url, headers=UA, timeout=20)
            if r.status_code == 404:
                raise DataError(f"finnes ikke (404) — sjekk ticker i Yahoo-format: {url.split('?')[0].rsplit('/', 1)[-1]}")
            if r.status_code == 429:
                time.sleep(2 ** attempt)
                last = DataError(f"rate-limited (429) {url}")
                continue
            r.raise_for_status()
            return r
        except requests.RequestException as exc:
            last = exc
            time.sleep(2 ** attempt)
    raise DataError(f"klarte ikke hente {url}: {last}")


def load_csv(path: str | Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    df.columns = [c.strip().capitalize() for c in df.columns]
    if "Date" not in df.columns:
        raise DataError("CSV mangler Date-kolonne")
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.set_index("Date").sort_index()
    for col in ("Open", "High", "Low", "Close"):
        if col not in df.columns:
            raise DataError(f"CSV mangler {col}-kolonne")
    if "Volume" not in df.columns:
        df["Volume"] = 0
    return df[["Open", "High", "Low", "Close", "Volume"]].astype(float)


def history(symbol: str, period: str = "2y", interval: str = "1d", csv: str | None = None) -> pd.DataFrame:
    """OHLCV for et symbol. Yahoo-notasjon: AAPL, EQNR.OL, ^GSPC, BTC-USD, EURUSD=X."""
    if csv:
        return load_csv(csv)
    key = f"hist_{symbol}_{period}_{interval}".replace("^", "IDX_").replace("=", "_").replace("/", "_")
    payload = _cache_get(key)
    if payload is None:
        # Lange range-kall nedgraderes stille til månedsbarer av Yahoo; bruk eksplisitt vindu.
        years = {"10y": 10, "20y": 20, "max": 60}.get(period)
        span = f"period1={int(time.time() - years * 365.25 * 86400)}&period2={int(time.time())}" if years else f"range={period}"
        url = (
            f"https://query1.finance.yahoo.com/v8/finance/chart/{quote(symbol)}"
            f"?{span}&interval={interval}&includePrePost=false&events=div,split"
        )
        payload = _get(url).json()
        _cache_put(key, payload)
    try:
        res = payload["chart"]["result"][0]
        q = res["indicators"]["quote"][0]
        adj = res["indicators"].get("adjclose", [{}])
        idx = pd.to_datetime(res["timestamp"], unit="s", utc=True).tz_convert(None).normalize()
    except (KeyError, IndexError, TypeError) as exc:
        err = (payload.get("chart") or {}).get("error")
        raise DataError(f"ingen data for {symbol}: {err or exc}")
    df = pd.DataFrame(
        {"Open": q["open"], "High": q["high"], "Low": q["low"], "Close": q["close"], "Volume": q["volume"]},
        index=idx,
    )
    if adj and adj[0].get("adjclose"):
        # Juster for utbytte/splitt så backtester ikke ser falske gap.
        factor = pd.Series(adj[0]["adjclose"], index=idx) / df["Close"]
        for col in ("Open", "High", "Low", "Close"):
            df[col] = df[col] * factor
    df = df.dropna(subset=["Close"])
    df = df[~df.index.duplicated(keep="last")]
    df.index.name = "Date"
    if df.empty:
        raise DataError(f"tom serie for {symbol}")
    return df.astype(float)


def meta(symbol: str) -> dict:
    key = f"hist_{symbol}_5d_1d".replace("^", "IDX_").replace("=", "_").replace("/", "_")
    payload = _cache_get(key)
    if payload is None:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{quote(symbol)}?range=5d&interval=1d"
        payload = _get(url).json()
        _cache_put(key, payload)
    m = payload["chart"]["result"][0]["meta"]
    return {
        "symbol": m.get("symbol"),
        "name": m.get("longName") or m.get("shortName"),
        "currency": m.get("currency"),
        "exchange": m.get("fullExchangeName"),
        "type": m.get("instrumentType"),
        "price": m.get("regularMarketPrice"),
        "market_time": datetime.fromtimestamp(m.get("regularMarketTime", 0), tz=timezone.utc).isoformat(),
        "52w_high": m.get("fiftyTwoWeekHigh"),
        "52w_low": m.get("fiftyTwoWeekLow"),
    }


def weekly(df: pd.DataFrame) -> pd.DataFrame:
    return df.resample("W-FRI").agg(
        {"Open": "first", "High": "max", "Low": "min", "Close": "last", "Volume": "sum"}
    ).dropna()


def news(query: str, limit: int = 15) -> list[dict]:
    """Overskrifter fra Yahoo Finance-søk + Google News RSS. Dedupliseres på tittel."""
    items: list[dict] = []
    try:
        r = _get(f"https://query1.finance.yahoo.com/v1/finance/search?q={quote(query)}&newsCount={limit}&quotesCount=0")
        for n in r.json().get("news", []):
            items.append({
                "title": n.get("title", ""),
                "publisher": n.get("publisher", ""),
                "link": n.get("link", ""),
                "published": datetime.fromtimestamp(n.get("providerPublishTime", 0), tz=timezone.utc).isoformat(),
                "source": "yahoo",
            })
    except DataError:
        pass
    try:
        r = _get(f"https://news.google.com/rss/search?q={quote(query)}&hl=en-US&gl=US&ceid=US:en")
        root = ET.fromstring(r.content)
        for it in root.iter("item"):
            pub = it.findtext("pubDate") or ""
            try:
                pub = pd.to_datetime(pub, utc=True).isoformat()
            except (ValueError, TypeError):
                pass
            items.append({
                "title": it.findtext("title") or "",
                "publisher": (it.find("source").text if it.find("source") is not None else ""),
                "link": it.findtext("link") or "",
                "published": pub,
                "source": "google",
            })
    except (DataError, ET.ParseError):
        pass
    seen, out = set(), []
    for it in sorted(items, key=lambda x: x["published"], reverse=True):
        k = it["title"].lower()[:80]
        if k and k not in seen:
            seen.add(k)
            out.append(it)
    return out[:limit]
