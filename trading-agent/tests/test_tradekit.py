"""Offline-tester på syntetiske data. Kjør: python3 -m unittest discover -s tests"""

import os
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from tradekit import backtest, indicators as ind, journal, plan, portfolio, setups  # noqa: E402


def synthetic(n=1500, drift=0.0004, vol=0.015, seed=7):
    rng = np.random.default_rng(seed)
    r = rng.normal(drift, vol, n)
    close = 100 * np.exp(np.cumsum(r))
    open_ = close * (1 + rng.normal(0, 0.003, n))
    high = np.maximum(open_, close) * (1 + np.abs(rng.normal(0, 0.006, n)))
    low = np.minimum(open_, close) * (1 - np.abs(rng.normal(0, 0.006, n)))
    idx = pd.bdate_range("2020-01-01", periods=n)
    return pd.DataFrame({"Open": open_, "High": high, "Low": low, "Close": close,
                         "Volume": rng.integers(1e6, 5e6, n).astype(float)}, index=idx)


class Indicators(unittest.TestCase):
    def test_rsi_bounds(self):
        r = ind.rsi(synthetic()["Close"]).dropna()
        self.assertTrue(((r >= 0) & (r <= 100)).all())

    def test_rsi_extremes(self):
        up = pd.Series(np.linspace(1, 100, 100))
        self.assertGreater(ind.rsi(up).iloc[-1], 99)

    def test_atr_positive(self):
        self.assertTrue((ind.atr(synthetic()).dropna() > 0).all())

    def test_levels_split_around_price(self):
        df = synthetic()
        lv = ind.levels(df)
        px = df["Close"].iloc[-1]
        self.assertTrue(all(x["level"] < px for x in lv["support"]))
        self.assertTrue(all(x["level"] > px for x in lv["resistance"]))


class Backtest(unittest.TestCase):
    def test_all_strategies_run(self):
        e = ind.enrich(synthetic())
        for name, p in backtest.DEFAULTS.items():
            en, ex = backtest.signals(e, name, p)
            m = backtest.metrics(e, backtest.simulate(e, en, ex))
            self.assertLessEqual(m["max_drawdown_pct"], 0, name)

    def test_always_long_matches_buy_hold(self):
        e = ind.enrich(synthetic())
        en = pd.Series(True, index=e.index)
        ex = pd.Series(False, index=e.index)
        res = backtest.simulate(e, en, ex, cost_bps=0)
        # Inn på open dag 2, så avkastning ≈ close[-1]/open[1].
        expected = e["Close"].iloc[-1] / e["Open"].iloc[1]
        self.assertAlmostEqual(res["equity"].iloc[-1], expected, places=6)

    def test_stop_limits_loss(self):
        e = ind.enrich(synthetic(drift=-0.003, seed=3))
        en = pd.Series(False, index=e.index)
        en.iloc[300] = True
        ex = pd.Series(False, index=e.index)
        res = backtest.simulate(e, en, ex, cost_bps=0, atr_stop=2.0)
        self.assertEqual(res["trades"][0][4], "stop")

    def test_run_with_csv(self):
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, "x.csv")
            synthetic(2000).reset_index(names="Date").to_csv(p, index=False)
            out = backtest.run("TEST", "rsi", "5y", csv=p)
            self.assertIn("walk_forward", out)
            self.assertEqual(len(out["filter_tests"]), 4)


class Setups(unittest.TestCase):
    def test_forward_stats_shape(self):
        e = ind.enrich(synthetic())
        for s in setups.SETUPS:
            st = setups.forward_stats(e, s)
            if st["samples"]:
                self.assertEqual(st["samples"], st["target_before_stop"] + st["stopped"] + st["timed_out"])

    def test_structure_rr(self):
        e = ind.enrich(synthetic())
        plan_ = setups._structure(e, setups.SETUPS[0])
        self.assertLess(plan_["stop"], plan_["entry"])
        self.assertGreater(plan_["target1"], plan_["entry"])
        self.assertGreaterEqual(plan_["rr_target1"], 1.5)


class Portfolio(unittest.TestCase):
    def test_parse_normalizes(self):
        w = portfolio.parse("aapl:60,msft:60")
        self.assertAlmostEqual(sum(w.values()), 1.0)
        self.assertIn("AAPL", w)

    def test_erc_equalizes_risk(self):
        cov = np.diag([0.04, 0.01, 0.09])
        w = portfolio.erc_weights(cov)
        rc = w * (cov @ w)
        self.assertLess(rc.max() / rc.min(), 1.01)

    def test_cap(self):
        w = portfolio._cap(np.array([0.7, 0.2, 0.1]), 0.4)
        self.assertLessEqual(w.max(), 0.4 + 1e-9)
        self.assertAlmostEqual(w.sum(), 1.0)


class Journal(unittest.TestCase):
    def test_example_journal(self):
        out = journal.run(str(ROOT / "examples" / "journal.csv"))
        self.assertEqual(out["trades"], 20)
        names = {f["pattern"] for f in out["findings"]}
        self.assertIn("Hevntrading", names)
        self.assertIn("Stopp ikke respektert", names)


class Plan(unittest.TestCase):
    def test_dst_aware_times(self):
        # 2026-10-19: USA på sommertid, Norge også → NY 09:30 = Oslo 15:30.
        p = plan.build("us", "2026-10-19")
        opening = next(s for s in p["checklist"] if s["phase"] == "ÅPNING")
        self.assertEqual(opening["time"], "09:30 (15:30 lokal)")
        # 2026-10-26: Europa har gått over til vintertid, USA ikke → 14:30.
        p = plan.build("us", "2026-10-26")
        opening = next(s for s in p["checklist"] if s["phase"] == "ÅPNING")
        self.assertEqual(opening["time"], "09:30 (14:30 lokal)")

    def test_markdown(self):
        md = plan.to_markdown(plan.build("oslo", "2026-10-19"))
        self.assertIn("- [ ]", md)
        self.assertIn("Maks dagstap", md)


if __name__ == "__main__":
    unittest.main()
