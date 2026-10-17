"""#7 Fully Automated Trading Plan — dagsplan med tidsstempler.

Tider regnes i børsens tidssone og vises også i din (default Europe/Oslo),
så sommertid-forskyvninger mellom USA og Europa håndteres automatisk.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from . import data, indicators as ind

MARKETS = {
    "us": {"name": "NYSE/Nasdaq", "tz": "America/New_York", "open": "09:30", "close": "16:00", "pre": "04:00",
           "futures": "ES=F", "vol": "^VIX", "lunch": ("11:30", "13:30"), "power": "15:00"},
    "oslo": {"name": "Oslo Børs", "tz": "Europe/Oslo", "open": "09:00", "close": "16:20", "pre": "08:00",
             "futures": "OSEBX.OL", "vol": "^V2TX", "lunch": ("11:30", "13:30"), "power": "15:30"},
    "eu": {"name": "Xetra/Euronext", "tz": "Europe/Berlin", "open": "09:00", "close": "17:30", "pre": "08:00",
           "futures": "^STOXX50E", "vol": "^V2TX", "lunch": ("12:00", "14:00"), "power": "16:30"},
    "uk": {"name": "LSE", "tz": "Europe/London", "open": "08:00", "close": "16:30", "pre": "07:00",
           "futures": "^FTSE", "vol": "^V2TX", "lunch": ("11:30", "13:30"), "power": "15:30"},
    "fx": {"name": "FX (London + NY-overlapp)", "tz": "Europe/London", "open": "08:00", "close": "17:00", "pre": "07:00",
           "futures": "DX-Y.NYB", "vol": "^VIX", "lunch": ("11:00", "12:30"), "power": "13:30"},
    "crypto": {"name": "Krypto (24/7, handles rundt US-åpning)", "tz": "America/New_York", "open": "09:30",
               "close": "16:00", "pre": "07:00", "futures": "BTC-USD", "vol": "^VIX", "lunch": ("11:30", "13:30"),
               "power": "15:00"},
}


def _t(day: date, hhmm: str, tz: str) -> datetime:
    h, m = map(int, hhmm.split(":"))
    return datetime(day.year, day.month, day.day, h, m, tzinfo=ZoneInfo(tz))


def _fmt(dt: datetime, local: str) -> str:
    return f"{dt.strftime('%H:%M')} ({dt.astimezone(ZoneInfo(local)).strftime('%H:%M')} lokal)"


def levels_for(symbol: str) -> dict:
    df = data.history(symbol, "1y", "1d")
    e = ind.enrich(df)
    p = df.iloc[-1]
    pivot = (p["High"] + p["Low"] + p["Close"]) / 3
    lv = ind.levels(df.iloc[-260:])
    return {
        "symbol": symbol,
        "last_close": round(float(p["Close"]), 2),
        "prev_high": round(float(p["High"]), 2),
        "prev_low": round(float(p["Low"]), 2),
        "pivot": round(float(pivot), 2),
        "r1": round(float(2 * pivot - p["Low"]), 2),
        "s1": round(float(2 * pivot - p["High"]), 2),
        "atr": round(float(e["atr"].iloc[-1]), 2),
        "trend": "opp" if p["Close"] > e["sma50"].iloc[-1] > e["sma200"].iloc[-1] else
                 ("ned" if p["Close"] < e["sma50"].iloc[-1] < e["sma200"].iloc[-1] else "sidelengs"),
        "rsi": round(float(e["rsi"].iloc[-1]), 1),
        "nearest_support": lv["support"][0]["level"] if lv["support"] else None,
        "nearest_resistance": lv["resistance"][0]["level"] if lv["resistance"] else None,
    }


def build(market: str = "us", day: str | None = None, local_tz: str = "Europe/Oslo", account: float = 100_000,
          risk_pct: float = 0.5, max_daily_loss_pct: float = 1.5, max_trades: int = 4,
          watchlist: list[str] | None = None) -> dict:
    m = MARKETS[market]
    d = date.fromisoformat(day) if day else date.today()
    tz = m["tz"]
    o, c = _t(d, m["open"], tz), _t(d, m["close"], tz)
    pre = _t(d, m["pre"], tz)
    ls, le = _t(d, m["lunch"][0], tz), _t(d, m["lunch"][1], tz)
    pw = _t(d, m["power"], tz)
    risk_amt = account * risk_pct / 100
    loss_cap = account * max_daily_loss_pct / 100

    steps = [
        ("PRE-MARKET", pre, [
            f"Sjekk {m['futures']} og {m['vol']}: retning over natten, gap-størrelse vs ATR",
            "Makrokalender i dag (CPI/FOMC/NFP/rentemøter/rapporter) — merk klokkeslett, ingen nye posisjoner 5 min før/etter",
            "Nyheter på watchlist: rapporter, oppgraderinger, guiding (bruk /news-to-trade)",
            "Gappers: ±3 % med volum — legg til de med katalysator",
        ]),
        ("PRE-MARKET", o - timedelta(minutes=60), [
            "Kjør /trade-ideas på watchlist — maks 5 kandidater",
            "Marker nivåer per kandidat: gårsdagens H/L/C, pivot, nærmeste støtte/motstand (tabellen under)",
            f"Skriv ned for hver: entry-trigger, stopp, mål, størrelse = {risk_amt:,.0f} / (entry − stopp)",
            "Hvis-så-plan: «Hvis X bryter Y på volum, så …» — ingen plan = ingen handel",
        ]),
        ("PRE-MARKET", o - timedelta(minutes=10), [
            "Tilstand-sjekk: søvn, stress, sinne? Under 6/10 → kun papir i dag",
            f"Bekreft dagens tapsgrense {loss_cap:,.0f} og maks {max_trades} handler",
            "Ordrer klare men IKKE sendt. Lukk sosiale medier",
        ]),
        ("ÅPNING", o, [
            "Første 5 min: observer. Ingen markedsordrer i åpningsauksjonen",
            "Noter opening range (høy/lav første 15 min) per kandidat",
        ]),
        ("ÅPNING", o + timedelta(minutes=15), [
            "ORB-regel: entry ved brudd av 15-min range i retning av dagstrend + volum > snitt",
            "Stopp på motsatt side av range eller 1×ATR(5m) — det minste som gir mening",
            "Gap-fade kun hvis gap > 1×daglig ATR og ingen nyhet bak",
        ]),
        ("ÅPNING", o + timedelta(minutes=60), [
            "Første time ferdig: vurder åpne posisjoner — flytt stopp til break-even ved +1R",
            "Ta 1/3–1/2 gevinst ved 1.5–2R, la resten løpe",
        ]),
        ("MIDT-SESJON", ls, [
            "Lunsj-dødsone: lav likviditet, falske brudd. Ingen nye ORB-handler",
            "Midt-sesjonsjustering: er markedet trend- eller range-dag? (ADX, VWAP-respekt)",
            "Range-dag → mean reversion mot VWAP; trend-dag → kun pullbacks i trendretning",
        ]),
        ("MIDT-SESJON", le, [
            "Re-skann: nye nivåer, relativ styrke vs indeks",
            f"Sjekk tapsgrense: realisert + urealisert ≥ −{loss_cap:,.0f} → skjermen av, dagen er over",
        ]),
        ("LUKKING", pw, [
            "Power hour: institusjonell flyt. Følg trend-dag-vinnere, stram stopper",
            "Ingen nye posisjoner etter 30 min før stenging uten swing-plan",
        ]),
        ("LUKKING", c - timedelta(minutes=15), [
            "Bestem per posisjon: flat (intraday) eller swing (kun hvis plan + stopp ligger i markedet over natten)",
            "Kanseller alle hengende ordrer som ikke er del av planen",
        ]),
        ("ETTER STENGING", c + timedelta(minutes=15), [
            "Logg alle handler i journal.csv (entry, exit, stopp, setup, følelse 1–10)",
            "Ett skjermbilde per handel med nivåer",
            "Fredag: kjør /trading-journal på siste 20 handler",
        ]),
    ]
    checklist = [{"phase": ph, "time": _fmt(t, local_tz), "exchange_time": t.isoformat(), "tasks": tasks}
                 for ph, t, tasks in steps]
    out = {
        "market": m["name"],
        "date": d.isoformat(),
        "exchange_tz": tz,
        "local_tz": local_tz,
        "weekend": d.weekday() >= 5 and market != "crypto",
        "risk_rules": {
            "account": account,
            "risk_per_trade": risk_amt,
            "risk_per_trade_pct": risk_pct,
            "max_daily_loss": loss_cap,
            "max_daily_loss_pct": max_daily_loss_pct,
            "max_trades": max_trades,
            "hard_stops": [
                "Tre tap på rad → stopp for dagen",
                "Aldri øk størrelse etter tap",
                "Ingen handel uten stopp i markedet",
                "Ikke trade med lånte penger eller penger som trengs til regninger",
            ],
        },
        "checklist": checklist,
    }
    if watchlist:
        out["levels"], out["errors"] = [], {}
        for s in watchlist:
            try:
                out["levels"].append(levels_for(s))
            except data.DataError as exc:
                out["errors"][s] = str(exc)
    return out


def to_markdown(p: dict) -> str:
    lines = [f"# Dagsplan — {p['market']} — {p['date']}", ""]
    if p["weekend"]:
        lines += ["> ⚠️ Helg: markedet er stengt. Bruk dagen til review og backtest.", ""]
    r = p["risk_rules"]
    lines += [
        "## Risikorammer",
        f"- Risiko per handel: **{r['risk_per_trade']:,.0f}** ({r['risk_per_trade_pct']} %)",
        f"- Maks dagstap: **{r['max_daily_loss']:,.0f}** ({r['max_daily_loss_pct']} %)",
        f"- Maks handler: **{r['max_trades']}**",
        *[f"- {h}" for h in r["hard_stops"]],
        "",
    ]
    phase = None
    for step in p["checklist"]:
        if step["phase"] != phase:
            phase = step["phase"]
            lines += [f"## {phase}", ""]
        lines.append(f"**{step['time']}**")
        lines += [f"- [ ] {t}" for t in step["tasks"]]
        lines.append("")
    if p.get("levels"):
        lines += ["## Nivåer (fra siste daglige lukking)", "",
                  "| Symbol | Close | Prev H | Prev L | Pivot | R1 | S1 | ATR | Trend | RSI | Støtte | Motstand |",
                  "|---|---|---|---|---|---|---|---|---|---|---|---|"]
        for x in p["levels"]:
            lines.append(f"| {x['symbol']} | {x['last_close']} | {x['prev_high']} | {x['prev_low']} | {x['pivot']} | "
                         f"{x['r1']} | {x['s1']} | {x['atr']} | {x['trend']} | {x['rsi']} | "
                         f"{x['nearest_support']} | {x['nearest_resistance']} |")
    return "\n".join(lines) + "\n"
