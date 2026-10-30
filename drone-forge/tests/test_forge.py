"""Run with:  cd drone-forge && python3 -m unittest discover -s tests -v"""

import copy
import json
import math
import tempfile
import unittest
from pathlib import Path

from forge import reducers
from forge.backend import Backend, BackendError, BudgetExhausted, Context, spend
from forge.graph import GRAPH_PATH, load_graph, run, waves
from forge.state import find_concept, new_state

ROOT = Path(__file__).resolve().parent.parent
CONFIG = json.loads((ROOT / "config.json").read_text(encoding="utf-8"))
SCORE_KEYS = reducers.SCORE_KEYS
RISK_KEYS = reducers.RISK_KEYS


def raw_concept(i, battery=100.0, score=8, **arch):
    architecture = {
        "airframe": f"airframe {i}",
        "propulsion": f"propulsion {i}",
        "energy": "li-ion",
        "control": "PX4",
        "sensing": "RGB + IMU",
        "materials": "CFRP",
    }
    architecture.update(arch)
    return {
        "origin": {"use_case": "aquaculture inspection", "source_agent": "scan_maritime", "generation": 1},
        "problem": f"problem {i}",
        "user": "farm operator",
        "environment": "open water",
        "defining_novelty": f"novelty {i}",
        "architecture": architecture,
        "constraints": {
            "mass_estimate_g": 1500,
            "power_estimate_w": None,
            "flight_time_estimate_min": None,
            "payload_g": 200,
            "temperature_range_c": [-10, 35],
            "rotor_disk_area_m2": 0.2,
            "battery_wh": battery,
        },
        "scores": {k: score for k in SCORE_KEYS},
        "risks": {k: 3 for k in RISK_KEYS},
    }


class FakeBackend(Backend):
    """Answers every node with schema-valid output. Failure and repair are injectable."""

    def __init__(self, fail=None, invalid=None, repair_id=None):
        self.fail = fail or {}
        self.invalid = invalid or {}
        self.repair_id = repair_id
        self.repair_seen = False
        self.calls = []

    def call(self, node_id, tier, prompt, payload, timeout_s):
        self.calls.append((node_id, tier))
        if node_id in self.fail:
            raise BackendError(self.fail[node_id])
        if node_id in self.invalid:
            return self.invalid[node_id]
        cids = [c["concept_id"] for c in payload.get("concepts", [])]
        if node_id == "intake":
            return {
                "actual_problem": "inspect nets", "user": "farmer", "operating_environment": "sea",
                "desired_result": "images", "hard_constraints": [], "price_constraint": "none",
                "certification_constraint": "none", "unknowns": [], "previous_related_concepts": [],
                "must_not_assume": [],
            }
        if node_id.startswith("scan_") or node_id in ("tech_transfer", "old_idea_miner"):
            return {"items": [{"title": node_id, "description": "x"}]}
        if node_id == "synthesize":
            base = raw_concept(1)
            dup = copy.deepcopy(base)
            dup["problem"] = "same thing, different words"
            return {"concepts": [
                base,
                raw_concept(2), raw_concept(3), raw_concept(4),
                raw_concept(5, battery=2.0),                 # energy kill
                dup,                                         # duplicate of 1
                raw_concept(7, novelty="military stealth frame"),  # policy kill
            ]}
        if node_id in ("physics", "materials"):
            return {"verdicts": [{"concept_id": c, "verdict": "PASS", "reason": "ok"} for c in cids]}
        if node_id in ("form", "controls", "propulsion", "autonomy"):
            return {"updates": []}
        if node_id == "adversarial":
            verdicts = []
            for c in cids:
                if c == self.repair_id and not self.repair_seen:
                    self.repair_seen = True
                    verdicts.append({"concept_id": c, "fatal_failures": [], "repairable_failures": ["wind"],
                                     "unknowns": [], "verdict": "REPAIR", "confidence": 0.6})
                else:
                    verdicts.append({"concept_id": c, "fatal_failures": [], "repairable_failures": [],
                                     "unknowns": [], "verdict": "PASS", "confidence": 0.7})
            return {"verifications": verdicts}
        if node_id == "repair":
            return {"updates": [{"concept_id": c["concept_id"], "fields": {"architecture": {"sensing": "RGB + IMU + GNSS"}},
                                 "delta": {"change": "add GNSS", "problem_fixed": "wind drift",
                                           "new_mass_g": 1520, "new_power_w": 165, "new_complexity": "low",
                                           "new_risks": []}} for c in payload["concepts"]]}
        if node_id == "ip_gate":
            return {"updates": [{"concept_id": c, "fields": {"ip": {"verdict": "LOW WHITESPACE",
                                 "closest_prior_art": [], "possible_novel_core": "x"}}} for c in cids]}
        if node_id == "commercial_gate":
            return {"updates": [{"concept_id": c, "fields": {"commercial": {"verdict": "BUYER FOUND"}}} for c in cids]}
        raise AssertionError(f"no fake answer for {node_id}")


def fresh_run(backend, budget=None):
    tmp = tempfile.TemporaryDirectory()
    config = copy.deepcopy(CONFIG)
    if budget:
        config["budget"].update(budget)
    state = new_state("test-run", config["budget"], "a drone that inspects fish nets")
    nodes = load_graph(GRAPH_PATH)
    ctx = Context(config=config, backend=backend, run_dir=Path(tmp.name))
    run(nodes, state, ctx, persist=lambda s: None)
    return tmp, state, config


def status(state, node_id):
    return state["nodes"][node_id]["status"]


class GraphTests(unittest.TestCase):
    def test_graph_loads_and_has_waves(self):
        nodes = load_graph(GRAPH_PATH)
        layers = waves(nodes)
        self.assertEqual(layers[0], ["intake"])
        self.assertEqual(layers[-1], ["human_gate"])

    def test_cycle_is_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "g.json"
            path.write_text(json.dumps({"nodes": [
                {"id": "a", "kind": "agent", "deps": ["b"], "schema": "intake"},
                {"id": "b", "kind": "agent", "deps": ["a"], "schema": "intake"},
            ]}), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "cycle"):
                load_graph(path)

    def test_unknown_dependency_is_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "g.json"
            path.write_text(json.dumps({"nodes": [
                {"id": "a", "kind": "agent", "deps": ["ghost"], "schema": "intake"},
            ]}), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "unknown node"):
                load_graph(path)


class EnergyTests(unittest.TestCase):
    def test_hover_power_matches_hand_calculation(self):
        # 1.5 kg, 0.2 m^2 total disk, 100 Wh battery.
        # T = 14.715 N; P_ideal = T^1.5 / sqrt(2 * 1.225 * 0.2) = 80.63 W
        # P_hover = 80.63 / 0.65 * 1.3 = 161.2 W; endurance = 100 * 0.8 / 161.2 * 60 = 29.8 min
        state = new_state("e", CONFIG["budget"], "x")
        state["concepts"].append(reducers.make_concept(raw_concept(1), 1))
        state["concepts"][0]["status"] = "generated"
        reducers.energy_check(state, Context(CONFIG, None, None))
        c = state["concepts"][0]
        self.assertAlmostEqual(c["constraints"]["power_estimate_w"], 161.2, delta=0.5)
        self.assertAlmostEqual(c["constraints"]["flight_time_estimate_min"], 29.8, delta=0.5)
        self.assertEqual(c["verification"]["energy"], "PASS")

    def test_low_endurance_is_killed(self):
        state = new_state("e", CONFIG["budget"], "x")
        state["concepts"].append(reducers.make_concept(raw_concept(1, battery=2.0), 1))
        state["concepts"][0]["status"] = "generated"
        reducers.energy_check(state, Context(CONFIG, None, None))
        self.assertEqual(state["concepts"][0]["status"], "killed")
        self.assertIn("energy", state["concepts"][0]["kill_reason"])

    def test_missing_inputs_are_uncertain_not_killed(self):
        raw = raw_concept(1)
        raw["constraints"]["rotor_disk_area_m2"] = None
        state = new_state("e", CONFIG["budget"], "x")
        state["concepts"].append(reducers.make_concept(raw, 1))
        state["concepts"][0]["status"] = "generated"
        reducers.energy_check(state, Context(CONFIG, None, None))
        self.assertEqual(state["concepts"][0]["verification"]["energy"], "UNCERTAIN")
        self.assertNotEqual(state["concepts"][0]["status"], "killed")


class ReducerTests(unittest.TestCase):
    def test_group_cap_limits_shared_airframe_to_three(self):
        state = new_state("r", CONFIG["budget"], "x")
        ctx = Context(CONFIG, None, None)
        for i in range(1, 6):
            c = reducers.make_concept(raw_concept(i, airframe="same airframe"), i)
            c["status"] = "generated"
            state["concepts"].append(c)
        reducers.hard_reduce(state, ctx)
        self.assertEqual(len(state["survivors"]), 3)
        capped = [k for k in state["killed"] if "group cap" in k["reason"]]
        self.assertEqual(len(capped), 2)

    def test_score_below_minimum_is_reduced_out(self):
        state = new_state("r", CONFIG["budget"], "x")
        c = reducers.make_concept(raw_concept(1, score=2), 1)
        c["status"] = "generated"
        state["concepts"].append(c)
        reducers.hard_reduce(state, Context(CONFIG, None, None))
        self.assertEqual(c["status"], "reduced_out")
        self.assertEqual(state["survivors"], [])

    def test_schema_invalid_concept_is_killed_not_added_silently(self):
        state = new_state("r", CONFIG["budget"], "x")
        bad = raw_concept(1)
        bad["scores"]["novelty"] = 42  # out of range after defaults
        reducers.add_concepts(state, {"concepts": [bad]}, Context(CONFIG, None, None))
        self.assertEqual(state["concepts"][0]["status"], "killed")
        self.assertIn("schema", state["concepts"][0]["kill_reason"])

    def test_protected_fields_cannot_be_set_by_agents(self):
        state = new_state("r", CONFIG["budget"], "x")
        c = reducers.make_concept(raw_concept(1), 1)
        c["status"] = "survivor"
        state["concepts"].append(c)
        out = {"updates": [{"concept_id": "DF-001", "fields": {"status": "verified", "architecture": {"sensing": "lidar"}}}]}
        reducers.apply_updates(state, out, Context(CONFIG, None, None))
        self.assertEqual(c["status"], "survivor")
        self.assertEqual(c["architecture"]["sensing"], "lidar")
        self.assertTrue(any("protected" in u for u in state["unknowns"]))

    def test_policy_guard_kills_military_text(self):
        state = new_state("r", CONFIG["budget"], "x")
        reducers.add_concepts(state, {"concepts": [raw_concept(1, novelty="military")]}, Context(CONFIG, None, None))
        self.assertEqual(state["concepts"][0]["status"], "killed")
        self.assertIn("policy", state["concepts"][0]["kill_reason"])


class RunTests(unittest.TestCase):
    def test_full_run_reaches_human_gate_with_ranking(self):
        backend = FakeBackend()
        tmp, state, config = fresh_run(backend)
        self.addCleanup(tmp.cleanup)
        self.assertEqual(state["run_status"], "awaiting_human")
        self.assertEqual(state["budget_used"]["frontier_calls"], 2)  # synthesize + form
        self.assertTrue(all(state["nodes"][n]["status"] == "SUCCESS" for n in ("intake", "synthesize", "human_gate")))

        killed = {k["concept_id"]: k["stage"] for k in state["killed"]}
        self.assertEqual(killed["DF-005"], "energy")
        self.assertEqual(killed["DF-007"], "policy")
        self.assertEqual(killed["DF-006"], "hard_reduce")

        # All four fakes share one primary mission, so the group cap of 3 applies: DF-004 is reduced out.
        self.assertEqual(state["concepts"][3]["status"], "reduced_out")
        self.assertIn("group cap", state["concepts"][3]["kill_reason"])
        ranks = {r["concept_id"]: r["rank"] for r in state["final_ranking"]}
        self.assertEqual(sorted(ranks.values()), ["BUILD", "TEST", "WATCH"])

    def test_failed_branch_does_not_stop_unrelated_branches(self):
        backend = FakeBackend(fail={"scan_sar": "boom"})
        tmp, state, _ = fresh_run(backend)
        self.addCleanup(tmp.cleanup)
        self.assertEqual(status(state, "scan_sar"), "FAILED")
        self.assertEqual(status(state, "synthesize"), "SKIPPED")
        self.assertEqual(status(state, "tech_transfer"), "SUCCESS")
        self.assertNotEqual(state["run_status"], "awaiting_human")

    def test_invalid_output_is_rejected_and_recorded(self):
        backend = FakeBackend(invalid={"tech_transfer": {"items": "not a list"}})
        tmp, state, _ = fresh_run(backend)
        self.addCleanup(tmp.cleanup)
        self.assertEqual(status(state, "tech_transfer"), "INVALID")
        self.assertNotIn("tech_transfer", state["outputs"])

    def test_repair_loop_recovers_a_concept(self):
        backend = FakeBackend(repair_id="DF-002")
        tmp, state, _ = fresh_run(backend)
        self.addCleanup(tmp.cleanup)
        c = find_concept(state, "DF-002")
        self.assertEqual(c["status"], "ranked")
        self.assertEqual(c["repair_cycles"], 1)
        self.assertEqual(len(c["repair_deltas"]), 1)
        self.assertEqual(c["verification"]["adversarial"], "PASS")

    def test_frontier_budget_is_enforced(self):
        state = new_state("b", {"max_concepts": 30, "max_frontier_calls": 1, "max_parallel_width": 8}, "x")
        spend(state, "frontier")
        with self.assertRaises(BudgetExhausted):
            spend(state, "frontier")

    def test_frontier_budget_exhaustion_fails_node_not_run(self):
        backend = FakeBackend()
        tmp, state, _ = fresh_run(backend, budget={"max_frontier_calls": 0})
        self.addCleanup(tmp.cleanup)
        self.assertEqual(status(state, "synthesize"), "FAILED")
        self.assertNotIn("synthesize", [c[0] for c in backend.calls])


if __name__ == "__main__":
    unittest.main()
