"""Deterministic gates and reducers. Code kills and ranks. Models only propose.

APPLIERS run on validated node output (main thread).
HANDLERS are code nodes. Both receive (state, ...) and mutate state in place.
"""

import copy
import json
import math
import re
from collections import Counter

from .backend import InvalidOutput, checked_output, load_prompt, spend
from .state import active_concepts, find_concept, kill, reduce_out
from .validate import validation_errors

ARCH_KEYS = ("airframe", "propulsion", "energy", "control", "sensing", "materials")
CONSTRAINT_KEYS = (
    "mass_estimate_g",
    "power_estimate_w",
    "flight_time_estimate_min",
    "payload_g",
    "temperature_range_c",
    "rotor_disk_area_m2",
    "battery_wh",
)
SCORE_KEYS = (
    "physical_feasibility",
    "mission_value",
    "novelty",
    "prototype_ease",
    "ip_whitespace",
    "commercial_value",
    "cost_score",
    "alex_fit",
)
RISK_KEYS = ("technical_risk", "capital_requirement", "regulatory_risk", "complexity")
GROUP_ATTRS = ("airframe", "propulsion", "use_case", "defining_novelty")
PROTECTED = frozenset(
    {"concept_id", "origin", "status", "kill_reason", "verification", "repair_cycles", "repair_deltas", "final_rank"}
)
# Policy guard: the forge never produces these. Matches on text, not intent, so it is a floor, not a judge.
FORBIDDEN = re.compile(
    r"military|militær|weapon|våpen|explosiv|explosive|kamikaze|munition|jamm|covert|targeting|destructive payload",
    re.IGNORECASE,
)


def _defaults():
    return {
        "origin": {"use_case": "", "source_agent": "synthesize", "generation": 1},
        "problem": "",
        "user": "",
        "environment": "",
        "defining_novelty": "",
        "architecture": {k: "" for k in ARCH_KEYS},
        "constraints": {k: None for k in CONSTRAINT_KEYS},
        "scores": {k: 0 for k in SCORE_KEYS},
        "risks": {k: 0 for k in RISK_KEYS},
        "verification": {"physics": "NOT_RUN", "energy": "NOT_RUN", "materials": "NOT_RUN", "adversarial": "NOT_RUN"},
        "ip": {"verdict": "NOT_RUN", "closest_prior_art": [], "possible_novel_core": ""},
        "commercial": {"verdict": "NOT_RUN"},
        "status": "generated",
        "kill_reason": None,
        "repair_cycles": 0,
        "repair_deltas": [],
        "unknowns": [],
        "final_rank": None,
    }


def _fill(target, defaults):
    for key, value in defaults.items():
        if key not in target:
            target[key] = copy.deepcopy(value)
        elif isinstance(value, dict) and isinstance(target[key], dict):
            _fill(target[key], value)
    return target


def _deep_merge(target, source):
    for key, value in source.items():
        if isinstance(value, dict) and isinstance(target.get(key), dict):
            _deep_merge(target[key], value)
        else:
            target[key] = copy.deepcopy(value)
    return target


def _norm(text):
    return re.sub(r"[^a-z0-9æøå]+", " ", str(text).lower()).strip()


def _group_value(concept, attr):
    if attr == "use_case":
        return _norm(concept["origin"]["use_case"])
    if attr == "defining_novelty":
        return _norm(concept["defining_novelty"])
    return _norm(concept["architecture"][attr])


def _signature(concept):
    return tuple(_group_value(concept, attr) for attr in GROUP_ATTRS)


def _check_ids(state, ids):
    missing = [i for i in ids if find_concept(state, i) is None]
    if missing:
        raise InvalidOutput(f"unknown concept_id {', '.join(missing[:5])}")


def _log(state, concept_id, stage, **data):
    state["evidence"].append({"concept_id": concept_id, "stage": stage, **data})


# ---------- appliers ----------


def make_concept(raw, number):
    concept = _fill(copy.deepcopy(raw), _defaults())
    concept["concept_id"] = f"DF-{number:03d}"
    return concept


def add_concepts(state, out, ctx):
    cap = ctx.config["budget"]["max_concepts"]
    raws = out["concepts"]
    if len(state["concepts"]) + len(raws) > cap:
        state["unknowns"].append(f"synthesis returned {len(raws)} concepts; cap is {cap}, the rest were dropped")
        raws = raws[: max(0, cap - len(state["concepts"]))]
    for raw in raws:
        concept = make_concept(raw, len(state["concepts"]) + 1)
        state["concepts"].append(concept)
        text = " ".join(
            [str(concept[k]) for k in ("problem", "user", "environment", "defining_novelty")]
            + [json.dumps(concept["architecture"], ensure_ascii=False)]
        )
        if FORBIDDEN.search(text):
            kill(state, concept, "policy", "forbidden military, weapon, jamming or destructive content")
            continue
        errors = validation_errors("concept", concept)
        if errors:
            kill(state, concept, "schema", errors[0])
            continue
        concept["status"] = "generated"


def apply_verdicts(state, out, ctx, stage):
    _check_ids(state, [v["concept_id"] for v in out["verdicts"]])
    for v in out["verdicts"]:
        concept = find_concept(state, v["concept_id"])
        if concept["status"] in ("killed", "reduced_out", "ranked"):
            continue
        concept["verification"][stage] = v["verdict"]
        concept["unknowns"].extend(v.get("assumptions", []))
        _log(state, v["concept_id"], stage, verdict=v["verdict"], reason=v["reason"])
        if v["verdict"] == "FAIL":
            kill(state, concept, stage, v["reason"])


def apply_updates(state, out, ctx):
    _check_ids(state, [u["concept_id"] for u in out["updates"]])
    for u in out["updates"]:
        concept = find_concept(state, u["concept_id"])
        if concept["status"] in ("killed", "reduced_out", "ranked"):
            continue
        fields = {k: v for k, v in u["fields"].items() if k not in PROTECTED}
        rejected = sorted(set(u["fields"]) & PROTECTED)
        if rejected:
            state["unknowns"].append(f"{u['concept_id']}: agent tried to set protected fields {rejected}")
        new_unknowns = fields.pop("unknowns", [])
        merged = _deep_merge(copy.deepcopy(concept), fields)
        merged["unknowns"] = merged["unknowns"] + new_unknowns
        errors = validation_errors("concept", merged)
        if errors:
            state["unknowns"].append(f"{u['concept_id']}: update rejected, {errors[0]}")
            continue
        concept.clear()
        concept.update(merged)
        if "delta" in u:
            concept["repair_deltas"].append(u["delta"])


def apply_adversarial(state, out, ctx):
    _check_ids(state, [v["concept_id"] for v in out["verifications"]])
    reported = set()
    for v in out["verifications"]:
        concept = find_concept(state, v["concept_id"])
        if concept["status"] in ("killed", "reduced_out", "ranked"):
            continue
        reported.add(v["concept_id"])
        state["verifier_reports"][v["concept_id"]] = v
        concept["unknowns"].extend(v["unknowns"])
        concept["verification"]["adversarial"] = v["verdict"]
        if v["verdict"] == "PASS":
            concept["status"] = "verified"
        elif v["verdict"] == "REPAIR":
            concept["status"] = "repair"
        else:
            kill(state, concept, "adversarial", "; ".join(v["fatal_failures"]) or "KILL verdict without failures")
    for concept in active_concepts(state):
        if concept["status"] == "survivor" and concept["concept_id"] not in reported:
            kill(state, concept, "adversarial", "no adversarial verdict returned")


APPLIERS = {
    "add_concepts": add_concepts,
    "apply_verdicts": apply_verdicts,
    "apply_updates": apply_updates,
    "apply_adversarial": apply_adversarial,
}


# ---------- code handlers ----------


def energy_check(state, ctx):
    """First-order momentum-theory hover power and endurance. Kills absurd energy budgets."""
    e = ctx.config["energy"]
    for concept in active_concepts(state):
        cid = concept["concept_id"]
        k = concept["constraints"]
        mass_g, area, wh = k["mass_estimate_g"], k["rotor_disk_area_m2"], k["battery_wh"]
        if not mass_g or not area or not wh:
            concept["verification"]["energy"] = "UNCERTAIN"
            concept["unknowns"].append("energy: mass, rotor disk area or battery energy missing")
            _log(state, cid, "energy", verdict="UNCERTAIN", reason="missing inputs")
            continue
        thrust_n = (mass_g / 1000) * e["gravity_m_s2"]
        ideal_w = thrust_n**1.5 / math.sqrt(2 * e["air_density_kg_m3"] * area)
        hover_w = ideal_w / e["figure_of_merit"] * e["system_overhead"]
        endurance_min = wh * e["usable_battery_fraction"] / hover_w * 60
        k["power_estimate_w"] = round(hover_w, 1)
        k["flight_time_estimate_min"] = round(endurance_min, 1)
        _log(state, cid, "energy", hover_w=round(hover_w, 1), endurance_min=round(endurance_min, 1))
        if endurance_min < e["min_endurance_min"]:
            concept["verification"]["energy"] = "FAIL"
            kill(state, concept, "energy", f"endurance {endurance_min:.1f} min below {e['min_endurance_min']} min")
        else:
            concept["verification"]["energy"] = "PASS"


def _score(concept, weights):
    total = sum(weights.values())
    return sum(w * concept["scores"][k] for k, w in weights.items()) / total


def hard_reduce(state, ctx):
    r = ctx.config["reducer"]
    pool = [c for c in active_concepts(state) if c["status"] == "generated"]
    ranked = sorted(pool, key=lambda c: _score(c, r["weights"]), reverse=True)
    seen = {}
    counts = {attr: Counter() for attr in GROUP_ATTRS}
    for concept in ranked:
        score = round(_score(concept, r["weights"]), 2)
        signature = _signature(concept)
        if signature in seen:
            reduce_out(state, concept, "hard_reduce", f"duplicate of {seen[signature]}")
            continue
        seen[signature] = concept["concept_id"]
        full = [attr for attr in GROUP_ATTRS if counts[attr][_group_value(concept, attr)] >= r["max_per_group"]]
        if full:
            reduce_out(state, concept, "hard_reduce", f"group cap of {r['max_per_group']} reached for {full}")
            continue
        if score < r["min_score"]:
            reduce_out(state, concept, "hard_reduce", f"score {score} below {r['min_score']}")
            continue
        if len(state["survivors"]) >= r["survivor_cap"]:
            reduce_out(state, concept, "hard_reduce", f"beyond survivor cap of {r['survivor_cap']}")
            continue
        for attr in GROUP_ATTRS:
            counts[attr][_group_value(concept, attr)] += 1
        concept["status"] = "survivor"
        state["survivors"].append(concept["concept_id"])
        state["reducer_scores"].append({"concept_id": concept["concept_id"], "score": score})


def repair_loop(state, ctx):
    """Up to max_cycles of repair followed by re-verification. Anything still REPAIR is killed."""
    cfg = ctx.config["repair"]
    for cycle in range(1, cfg["max_cycles"] + 1):
        todo = [c for c in state["concepts"] if c["status"] == "repair"]
        if not todo:
            break
        for concept in todo:
            concept["repair_cycles"] = cycle
        reports = {c["concept_id"]: state["verifier_reports"].get(c["concept_id"]) for c in todo}

        spend(state, "mid")
        raw = ctx.backend.call("repair", "mid", load_prompt("repair"), {"concepts": todo, "verifier_reports": reports}, cfg["timeout_s"])
        out, _ = checked_output(raw, "updates")
        apply_updates(state, out, ctx)

        spend(state, "mid")
        raw = ctx.backend.call("adversarial", "mid", load_prompt("adversarial"), {"concepts": todo}, cfg["timeout_s"])
        out, _ = checked_output(raw, "verifier")
        apply_adversarial(state, out, ctx)

    for concept in state["concepts"]:
        if concept["status"] == "repair":
            kill(state, concept, "repair", f"still REPAIR after {cfg['max_cycles']} cycles")


def _total(concept, final):
    pos = sum(w * concept["scores"][k] for k, w in final["weights_positive"].items())
    neg = sum(w * concept["risks"][k] for k, w in final["weights_negative"].items())
    return round(pos - neg, 2)


def final_reduce(state, ctx):
    final = ctx.config["final"]
    ranks = final["ranks"]
    eligible, blocked = [], []
    for concept in [c for c in active_concepts(state) if c["status"] == "verified"]:
        if concept["ip"]["verdict"] in ("PROBABLY CROWDED", "NOT_RUN"):
            blocked.append((concept, f"ip gate: {concept['ip']['verdict']}"))
        elif concept["commercial"]["verdict"] in ("KILL", "NOT_RUN"):
            blocked.append((concept, f"commercial gate: {concept['commercial']['verdict']}"))
        else:
            eligible.append(concept)

    eligible.sort(key=lambda c: _total(c, final), reverse=True)
    for index, concept in enumerate(eligible):
        concept["final_rank"] = ranks[index] if index < len(ranks) else "ARCHIVE"
        concept["status"] = "ranked"
        state["final_ranking"].append({"concept_id": concept["concept_id"], "total": _total(concept, final), "rank": concept["final_rank"]})
    for concept, reason in blocked:
        concept["final_rank"] = "ARCHIVE"
        concept["status"] = "ranked"
        concept["kill_reason"] = reason


def human_gate(state, ctx):
    state["run_status"] = "awaiting_human"


HANDLERS = {
    "energy_check": energy_check,
    "hard_reduce": hard_reduce,
    "repair_loop": repair_loop,
    "final_reduce": final_reduce,
    "human_gate": human_gate,
}
