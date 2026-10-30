"""Authoritative run state. Saved after every node. Chat is not state."""

import json
import os
from pathlib import Path

NODE_PENDING = "PENDING"
DONE = frozenset({"SUCCESS", "PARTIAL"})
BLOCKING = frozenset({"FAILED", "TIMEOUT", "INVALID", "SKIPPED"})
INACTIVE = frozenset({"killed", "reduced_out", "ranked"})


def new_state(run_id, budget, idea):
    return {
        "run_id": run_id,
        "run_status": "running",
        "idea": idea,
        "budget": dict(budget),
        "budget_used": {"agent_calls": 0, "frontier_calls": 0},
        "nodes": {},
        "outputs": {},
        "concepts": [],
        "killed": [],
        "survivors": [],
        "reducer_scores": [],
        "verifier_reports": {},
        "final_ranking": [],
        "evidence": [],
        "unknowns": [],
        "human_decisions": [],
    }


def load_state(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def save_state(state, path):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(tmp, path)


def node_status(state, node_id):
    return state["nodes"].get(node_id, {}).get("status", NODE_PENDING)


def find_concept(state, concept_id):
    for concept in state["concepts"]:
        if concept["concept_id"] == concept_id:
            return concept
    return None


def active_concepts(state):
    return [c for c in state["concepts"] if c["status"] not in INACTIVE]


def kill(state, concept, stage, reason):
    concept["status"] = "killed"
    concept["kill_reason"] = f"{stage}: {reason}"
    state["killed"].append({"concept_id": concept["concept_id"], "stage": stage, "reason": reason})


def reduce_out(state, concept, stage, reason):
    concept["status"] = "reduced_out"
    concept["kill_reason"] = f"{stage}: {reason}"
    state["killed"].append({"concept_id": concept["concept_id"], "stage": stage, "reason": reason})
