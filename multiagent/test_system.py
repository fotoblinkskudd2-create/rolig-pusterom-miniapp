"""Kjør: python -m unittest multiagent.test_system -v"""
import unittest

from .agents import Rodtlag, Tekniker, default_agents
from .model import Component, Idea
from .orchestrator import DIM_WEIGHTS, evaluate, improve
from .revision import apply_fix
from .seeds import seed_ideas


def _idea(**overrides) -> Idea:
    base = dict(
        name="test",
        pitch="p",
        form="lampe",
        differentiators=["a", "b", "c"],
        components=[Component("LED-ring", "høy")],
        unit_cost=100,
        price=400,
        competitors=3,
        segment_score=7,
        dev_months=3,
        reg_risk=0,
        recurring=True,
        scalable=True,
    )
    base.update(overrides)
    return Idea(**base)


class ScoringTests(unittest.TestCase):
    def test_scores_are_within_0_and_10(self):
        for idea in seed_ideas():
            ev = evaluate(idea, default_agents())
            for r in ev.results:
                self.assertTrue(0 <= r.score <= 10, (idea.name, r.agent, r.score))
            self.assertTrue(0 <= ev.total <= 10)

    def test_weights_sum_to_one(self):
        self.assertAlmostEqual(sum(DIM_WEIGHTS.values()), 1.0)

    def test_long_development_is_flagged(self):
        a = Tekniker().assess(_idea(dev_months=12))
        self.assertEqual(a.fix, "kutt_scope")
        self.assertTrue(a.objections)

    def test_health_risk_is_flagged_and_fixable(self):
        a = Rodtlag().assess(_idea(reg_risk=3))
        self.assertEqual(a.fix, "fjern_helseløfte")
        fixed, changed = apply_fix(_idea(reg_risk=3), a.fix)
        self.assertTrue(changed)
        self.assertLess(fixed.reg_risk, 3)


class RevisionTests(unittest.TestCase):
    def test_apply_fix_does_not_mutate_original(self):
        original = _idea(dev_months=12)
        apply_fix(original, "kutt_scope")
        self.assertEqual(original.dev_months, 12)

    def test_noop_fix_reports_unchanged(self):
        _, changed = apply_fix(_idea(dev_months=3), "kutt_scope")
        self.assertFalse(changed)


class LoopTests(unittest.TestCase):
    def test_improvement_never_decreases_total(self):
        for idea in seed_ideas():
            out = improve(idea, default_agents())
            self.assertGreaterEqual(out.final.total, out.start.total - 1e-9, idea.name)

    def test_loop_stops_within_max_rounds(self):
        out = improve(seed_ideas()[2], default_agents(), max_rounds=2)
        self.assertLessEqual(len([l for l in out.log if l.startswith("Runde")]), 2)

    def test_input_idea_is_not_mutated(self):
        idea = seed_ideas()[2]
        before = (idea.price, idea.dev_months, len(idea.components))
        improve(idea, default_agents())
        self.assertEqual(before, (idea.price, idea.dev_months, len(idea.components)))


if __name__ == "__main__":
    unittest.main()
