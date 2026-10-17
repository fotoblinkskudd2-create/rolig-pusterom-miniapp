"""#5 Portfolio Risk Manager.

Input: "AAPL:30,MSFT:20,EQNR.OL:25,BTC-USD:25" (vekter i %).
Leverer: vol, beta, risikobidrag, skjulte korrelasjoner, VaR/CVaR,
stresstest −20 % marked, risk-parity-rebalansering og hedgestørrelse.
"""

from __future__ import annotations

import math

import numpy as np
import pandas as pd

from . import data


def parse(spec: str) -> dict[str, float]:
    w = {}
    for part in spec.split(","):
        if not part.strip():
            continue
        sym, _, pct = part.partition(":")
        w[sym.strip().upper()] = float(pct or 0)
    total = sum(w.values())
    if total <= 0:
        raise ValueError("vekter mangler — bruk TICKER:prosent")
    return {k: v / total for k, v in w.items()}


def _bs_put(s, k, t, vol, r=0.04):
    if t <= 0 or vol <= 0:
        return max(k - s, 0)
    d1 = (math.log(s / k) + (r + vol ** 2 / 2) * t) / (vol * math.sqrt(t))
    d2 = d1 - vol * math.sqrt(t)
    n = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
    return k * math.exp(-r * t) * n(-d2) - s * n(-d1)


def erc_weights(cov: np.ndarray, iters: int = 500) -> np.ndarray:
    """Equal Risk Contribution via enkel fastpunkt-iterasjon."""
    n = cov.shape[0]
    w = np.ones(n) / n
    for _ in range(iters):
        mrc = cov @ w
        rc = w * mrc
        target = rc.sum() / n
        w = w * (target / np.maximum(rc, 1e-12)) ** 0.5
        w /= w.sum()
    return w


def _cap(w: np.ndarray, cap: float) -> np.ndarray:
    w = w.copy()
    for _ in range(50):
        over = w > cap
        if not over.any():
            break
        excess = (w[over] - cap).sum()
        w[over] = cap
        under = ~over
        w[under] += excess * w[under] / w[under].sum()
    return w


def run(spec: str, benchmark: str = "^GSPC", period: str = "2y", value: float = 100_000,
        base: str | None = None, max_weight: float = 0.25, shock: float = -0.20) -> dict:
    weights = parse(spec)
    syms = list(weights)
    closes, errors, currencies = {}, {}, {}
    for s in syms + [benchmark]:
        try:
            closes[s] = data.history(s, period, "1d")["Close"]
            try:
                currencies[s] = data.meta(s).get("currency")
            except (data.DataError, KeyError, IndexError):
                currencies[s] = None
        except data.DataError as exc:
            errors[s] = str(exc)
    if any(s in errors for s in syms) or benchmark in errors:
        return {"error": "mangler data", "details": errors}

    if base:
        base = base.upper()
        for s in syms + [benchmark]:
            cur = currencies.get(s)
            if cur and cur.upper() != base:
                fx = data.history(f"{cur.upper()}{base}=X", period, "1d")["Close"]
                closes[s] = (closes[s] * fx.reindex(closes[s].index).ffill()).dropna()

    px = pd.DataFrame(closes).dropna()
    rets = px.pct_change().dropna()
    R = rets[syms]
    b = rets[benchmark]
    w = np.array([weights[s] for s in syms])
    cov = R.cov().values * 252
    port = R @ w
    port_vol = float(np.sqrt(w @ cov @ w))
    mrc = cov @ w
    rc = w * mrc / (port_vol ** 2)
    var_b = b.var()
    betas = {s: float(R[s].cov(b) / var_b) for s in syms}
    down = b < 0
    down_betas = {s: float(R[s][down].cov(b[down]) / b[down].var()) for s in syms}
    port_beta = float(sum(weights[s] * betas[s] for s in syms))
    port_down_beta = float(sum(weights[s] * down_betas[s] for s in syms))
    vols = R.std() * np.sqrt(252)

    corr = R.corr()
    hidden = []
    for i, a in enumerate(syms):
        for c in syms[i + 1:]:
            v = corr.loc[a, c]
            if v >= 0.6:
                hidden.append({"pair": f"{a} ↔ {c}", "corr": round(float(v), 2),
                               "combined_weight_pct": round((weights[a] + weights[c]) * 100, 1)})
    hidden.sort(key=lambda x: x["corr"], reverse=True)

    # Klynger: komponenter i grafen corr ≥ 0.7.
    clusters, seen = [], set()
    for s in syms:
        if s in seen:
            continue
        stack, comp = [s], []
        while stack:
            x = stack.pop()
            if x in seen:
                continue
            seen.add(x)
            comp.append(x)
            stack += [y for y in syms if y not in seen and corr.loc[x, y] >= 0.7]
        if len(comp) > 1:
            clusters.append({"members": comp, "weight_pct": round(sum(weights[m] for m in comp) * 100, 1)})

    eq = (1 + port).cumprod()
    dd = eq / eq.cummax() - 1
    var95 = float(-np.percentile(port, 5))
    cvar95 = float(-port[port <= np.percentile(port, 5)].mean())

    # Historisk stress: benchmarkens verste peak→trough i vinduet.
    beq = (1 + b).cumprod()
    trough = (beq / beq.cummax() - 1).idxmin()
    peak = beq.loc[:trough].idxmax()
    hist_b = float(beq[trough] / beq[peak] - 1)
    hist_p = float(eq[trough] / eq[peak] - 1)

    shock_rows = []
    for s in syms:
        move = down_betas[s] * shock
        shock_rows.append({"symbol": s, "beta": round(betas[s], 2), "downside_beta": round(down_betas[s], 2),
                           "est_move_pct": round(move * 100, 1),
                           "est_loss": round(weights[s] * value * move, 0)})
    est_port = port_down_beta * shock

    erc = _cap(erc_weights(R.cov().values), max_weight)
    blend = _cap(0.5 * w + 0.5 * erc, max_weight)
    new_vol = float(np.sqrt(blend @ cov @ blend))
    new_beta = float(sum(blend[i] * betas[s] for i, s in enumerate(syms)))

    weak = []
    for i, s in enumerate(syms):
        if weights[s] > max_weight:
            weak.append(f"{s}: {weights[s]*100:.0f} % vekt > {max_weight*100:.0f} % tak — enkeltnavnrisiko")
        if rc[i] > weights[s] * 1.5 and rc[i] > 0.15:
            weak.append(f"{s}: {weights[s]*100:.0f} % av kapitalen men {rc[i]*100:.0f} % av risikoen")
        if down_betas[s] > 1.5:
            weak.append(f"{s}: nedside-beta {down_betas[s]:.2f} — faller mye mer enn markedet i røde dager")
    for c in clusters:
        if c["weight_pct"] > 40:
            weak.append(f"Klynge {', '.join(c['members'])} = {c['weight_pct']} % — de er i praksis én posisjon")
    if port_down_beta > 1.1:
        weak.append(f"Portefølje-nedsidebeta {port_down_beta:.2f}: et −20 % marked gir ca {est_port*100:.0f} %")

    # Hedge: 3-mnd 10 % OTM put på benchmark, størrelse for å dekke beta-eksponering.
    bpx = float(px[benchmark].iloc[-1])
    bvol = float(b.std() * np.sqrt(252)) + 0.03
    strike = bpx * 0.90
    put = _bs_put(bpx, strike, 0.25, bvol)
    hedge_notional = value * max(port_down_beta, 0)
    units = hedge_notional / bpx
    put_at_shock = max(strike - bpx * (1 + shock), 0)
    hedges = {
        "benchmark": benchmark,
        "benchmark_price": round(bpx, 2),
        "beta_notional_to_hedge": round(hedge_notional, 0),
        "protective_put_10pct_otm_3m": {
            "strike": round(strike, 2),
            "est_premium_per_unit": round(put, 2),
            "units_for_full_beta": round(units, 2),
            "est_cost": round(put * units, 0),
            "est_cost_pct_of_portfolio": round(put * units / value * 100, 2),
            "payoff_at_shock": round(put_at_shock * units, 0),
        },
        "short_index_for_50pct_hedge": {"notional": round(hedge_notional * 0.5, 0),
                                        "saves_at_shock": round(-hedge_notional * 0.5 * shock, 0)},
        "collar_note": "Selg 5 % OTM call samme forfall for å finansiere putten — gir bort oppside over strike.",
        "premium_note": "Opsjonspris er Black-Scholes på historisk vol + 3 vol-punkter. Sjekk ekte kjede før du handler.",
    }

    return {
        "as_of": str(px.index[-1].date()),
        "observations": len(R),
        "base_currency": base or "lokal valuta per aktivum",
        "note": "Daglige close-til-close-avkastninger på tvers av tidssoner (Oslo stenger før New York) "
                "undervurderer korrelasjon/beta for ikke-amerikanske aktiva. Krypto kun på børsdager.",
        "portfolio_value": value,
        "portfolio": {
            "annual_vol_pct": round(port_vol * 100, 1),
            "beta": round(port_beta, 2),
            "downside_beta": round(port_down_beta, 2),
            "var95_1d_pct": round(var95 * 100, 2),
            "cvar95_1d_pct": round(cvar95 * 100, 2),
            "var95_1d_amount": round(var95 * value, 0),
            "max_drawdown_pct": round(float(dd.min()) * 100, 1),
            "effective_bets": round(float(1 / (rc ** 2).sum()), 2),
            "diversification_ratio": round(float((w * vols.values).sum() / port_vol), 2),
        },
        "assets": [
            {"symbol": s, "currency": currencies.get(s), "weight_pct": round(weights[s] * 100, 1),
             "risk_contribution_pct": round(float(rc[i]) * 100, 1), "annual_vol_pct": round(float(vols[s]) * 100, 1),
             "beta": round(betas[s], 2), "downside_beta": round(down_betas[s], 2),
             "corr_to_benchmark": round(float(R[s].corr(b)), 2)}
            for i, s in enumerate(syms)
        ],
        "correlation_matrix": corr.round(2).to_dict(),
        "hidden_correlations": hidden,
        "clusters": clusters,
        "weak_points": weak,
        "stress_test": {
            "shock_pct": shock * 100,
            "est_portfolio_move_pct": round(est_port * 100, 1),
            "est_loss": round(est_port * value, 0),
            "per_asset": shock_rows,
            "historical_worst_benchmark_dd": {"from": str(peak.date()), "to": str(trough.date()),
                                              "benchmark_pct": round(hist_b * 100, 1),
                                              "portfolio_pct": round(hist_p * 100, 1)},
        },
        "rebalance": {
            "method": f"50/50 nåværende + Equal Risk Contribution, tak {max_weight*100:.0f} %",
            "targets": [{"symbol": s, "from_pct": round(w[i] * 100, 1), "to_pct": round(blend[i] * 100, 1),
                         "trade_amount": round((blend[i] - w[i]) * value, 0)} for i, s in enumerate(syms)],
            "new_annual_vol_pct": round(new_vol * 100, 1),
            "new_beta": round(new_beta, 2),
        },
        "hedges": hedges,
    }
