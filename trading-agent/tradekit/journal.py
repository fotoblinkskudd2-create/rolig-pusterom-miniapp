"""#6 Trading Journal Analyzer.

CSV-kolonner (minimum): symbol,side,entry_date,entry_price,exit_date,exit_price,qty
Valgfritt: stop,target,setup,notes,fees,entry_time,exit_time
Se examples/journal.csv.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

REQUIRED = ["symbol", "side", "entry_date", "entry_price", "exit_date", "exit_price", "qty"]


def load(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df.columns = [c.strip().lower() for c in df.columns]
    missing = [c for c in REQUIRED if c not in df.columns]
    if missing:
        raise ValueError(f"journal mangler kolonner: {missing}")
    for c in ("entry_date", "exit_date"):
        t = c.replace("date", "time")
        stamp = df[c].astype(str) + (" " + df[t].astype(str) if t in df.columns else "")
        df[c] = pd.to_datetime(stamp, errors="coerce")
    df["side"] = df["side"].str.lower().map(lambda s: "short" if s.startswith("s") else "long")
    sign = np.where(df["side"] == "long", 1, -1)
    fees = df["fees"].fillna(0) if "fees" in df.columns else 0
    df["pnl"] = (df["exit_price"] - df["entry_price"]) * df["qty"] * sign - fees
    df["ret_pct"] = (df["exit_price"] / df["entry_price"] - 1) * 100 * sign
    df["notional"] = df["entry_price"] * df["qty"]
    df["hold_days"] = (df["exit_date"] - df["entry_date"]).dt.total_seconds() / 86400
    if "stop" in df.columns:
        risk = (df["entry_price"] - df["stop"]).abs() * df["qty"]
        df["risk"] = risk.where(risk > 0)
        df["r_multiple"] = df["pnl"] / df["risk"]
    return df.sort_values("entry_date").reset_index(drop=True)


def analyze(df: pd.DataFrame, last: int = 20) -> dict:
    df = df.tail(last).reset_index(drop=True)
    wins, losses = df[df["pnl"] > 0], df[df["pnl"] <= 0]
    findings: list[dict] = []

    def flag(kind, severity, evidence, fix):
        findings.append({"pattern": kind, "severity": severity, "evidence": evidence, "fix": fix})

    # Disposisjonseffekt: holder tapere lenger enn vinnere.
    if len(wins) and len(losses):
        hw, hl = wins["hold_days"].median(), losses["hold_days"].median()
        if hl > hw * 1.3:
            flag("Disposisjonseffekt (sitter med tapere, kutter vinnere)", "høy",
                 f"median holdetid tapere {hl:.1f} d vs vinnere {hw:.1f} d", "Stopp settes ved entry og flyttes aldri bort fra pris.")
        aw, al = wins["pnl"].mean(), -losses["pnl"].mean()
        if al > aw * 1.2:
            flag("Asymmetri: tap større enn gevinster", "høy",
                 f"snittgevinst {aw:.0f} vs snittap {al:.0f} (payoff {aw/al:.2f})", "Krev minst 2R planlagt mål før entry.")

    # Hevntrading: neste handel etter tap kommer raskt og er større.
    rev = []
    for i in range(1, len(df)):
        p, c = df.iloc[i - 1], df.iloc[i]
        if p["pnl"] < 0 and pd.notna(c["entry_date"]) and pd.notna(p["exit_date"]):
            gap_h = (c["entry_date"] - p["exit_date"]).total_seconds() / 3600
            if gap_h <= 24 and c["notional"] > p["notional"] * 1.2:
                rev.append(i)
    if rev:
        after = df.loc[rev, "pnl"]
        flag("Hevntrading", "høy",
             f"{len(rev)} handler åpnet ≤24 t etter tap med >20 % større posisjon; samlet PnL {after.sum():.0f}",
             "Etter et tap: 30 min pause og ALDRI større størrelse på neste handel.")

    # Størrelsesdrift.
    cv = df["notional"].std() / df["notional"].mean() if df["notional"].mean() else 0
    if cv > 0.5:
        big = df["notional"] >= df["notional"].quantile(0.75)
        flag("Inkonsistent posisjonsstørrelse", "middels",
             f"variasjonskoeffisient {cv:.2f}; største kvartil PnL {df.loc[big,'pnl'].sum():.0f} vs resten {df.loc[~big,'pnl'].sum():.0f}",
             "Fast risiko per handel (f.eks. 1 % av konto), størrelse = risiko / (entry − stopp).")

    # Stoppbrudd.
    if "r_multiple" in df.columns:
        breaches = df[df["r_multiple"] < -1.2]
        if len(breaches):
            flag("Stopp ikke respektert", "høy",
                 f"{len(breaches)} handler tapte mer enn 1.2R (verste {breaches['r_multiple'].min():.1f}R)",
                 "Stopp ligger i markedet som ordre, ikke i hodet.")
        early = wins[wins["r_multiple"] < 1]
        if len(wins) and len(early) / len(wins) > 0.5:
            flag("Tar gevinst for tidlig", "middels",
                 f"{len(early)}/{len(wins)} vinnere avsluttet under 1R",
                 "Del-exit på 1R, flytt stopp til break-even, la resten løpe til 2–3R.")

    # Overtrading: flere handler per dag.
    per_day = df.groupby(df["entry_date"].dt.date).size()
    busy = per_day[per_day >= 3]
    if len(busy):
        pnl_busy = df[df["entry_date"].dt.date.isin(busy.index)]["pnl"].sum()
        flag("Overtrading", "middels", f"{len(busy)} dager med ≥3 handler, PnL de dagene {pnl_busy:.0f}",
             "Maks 3 handler per dag. Tredje tap = skjermen av.")

    # Long vs short / setups / symboler / ukedag.
    by = lambda col: df.groupby(col)["pnl"].agg(["count", "sum", lambda s: (s > 0).mean()]).rename(
        columns={"<lambda_0>": "win_rate"}).round(2).reset_index().to_dict("records")
    breakdown = {"side": by("side"), "symbol": by("symbol")}
    if "setup" in df.columns:
        breakdown["setup"] = by("setup")
        s = df.groupby("setup")["pnl"].sum()
        if len(s) > 1 and s.min() < 0:
            flag("Setup som blør", "middels", f"«{s.idxmin()}» har PnL {s.min():.0f}",
                 f"Pause «{s.idxmin()}» i 20 handler eller test den på papir.")
    df["weekday"] = df["entry_date"].dt.day_name()
    breakdown["weekday"] = by("weekday")
    if "entry_time" in df.columns:
        df["hour"] = df["entry_date"].dt.hour
        breakdown["hour"] = by("hour")

    # Tapsrekker og streak-atferd.
    streak = max_streak = 0
    for p in df["pnl"]:
        streak = streak + 1 if p <= 0 else 0
        max_streak = max(max_streak, streak)

    # Tapte muligheter: vinnere med lav R eller tidlig exit (krever target).
    missed = []
    if "target" in df.columns:
        sign = np.where(df["side"] == "long", 1, -1)
        left = (df["target"] - df["exit_price"]) * sign
        m = df[(df["pnl"] > 0) & (left > 0)]
        missed = [{"symbol": r.symbol, "exit": r.exit_price, "target": r.target,
                   "left_on_table": round(float(left[i] * r.qty), 2)} for i, r in m.iterrows()]

    gross_win, gross_loss = wins["pnl"].sum(), -losses["pnl"].sum()
    eq = df["pnl"].cumsum()
    return {
        "trades": len(df),
        "period": f"{df['entry_date'].min().date()} → {df['exit_date'].max().date()}",
        "summary": {
            "net_pnl": round(float(df["pnl"].sum()), 2),
            "win_rate": round(len(wins) / len(df), 2) if len(df) else None,
            "profit_factor": round(float(gross_win / gross_loss), 2) if gross_loss > 0 else None,
            "avg_win": round(float(wins["pnl"].mean()), 2) if len(wins) else None,
            "avg_loss": round(float(losses["pnl"].mean()), 2) if len(losses) else None,
            "expectancy_per_trade": round(float(df["pnl"].mean()), 2),
            "avg_r": round(float(df["r_multiple"].mean()), 2) if "r_multiple" in df.columns else None,
            "max_losing_streak": max_streak,
            "max_drawdown": round(float((eq - eq.cummax()).min()), 2),
            "median_hold_days_win": round(float(wins["hold_days"].median()), 2) if len(wins) else None,
            "median_hold_days_loss": round(float(losses["hold_days"].median()), 2) if len(losses) else None,
        },
        "findings": findings,
        "missed_opportunities": missed,
        "breakdown": breakdown,
        "best_trade": df.loc[df["pnl"].idxmax(), ["symbol", "side", "pnl"]].to_dict(),
        "worst_trade": df.loc[df["pnl"].idxmin(), ["symbol", "side", "pnl"]].to_dict(),
    }


def run(path: str, last: int = 20) -> dict:
    return analyze(load(path), last)
