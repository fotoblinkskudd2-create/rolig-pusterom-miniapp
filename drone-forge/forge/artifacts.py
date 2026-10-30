"""Writes the run manifest directory from authoritative state. Data only, no narrative."""

import json
from pathlib import Path

from .graph import waves


def _dump(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def write_artifacts(run_dir, state, nodes):
    run_dir = Path(run_dir)
    scan_ids = [n for n in nodes if n.startswith(("scan_", "tech_", "old_"))]

    _dump(
        run_dir / "manifest.json",
        {
            "run_id": state["run_id"],
            "run_status": state["run_status"],
            "waves": waves(nodes),
            "nodes": state["nodes"],
            "budget": state["budget"],
            "budget_used": state["budget_used"],
        },
    )
    if "intake" in state["outputs"]:
        _dump(run_dir / "intake.json", state["outputs"]["intake"])
    for node_id in scan_ids:
        if node_id in state["outputs"]:
            _dump(run_dir / "scans" / f"{node_id}.json", state["outputs"][node_id])
    for concept in state["concepts"]:
        cid = concept["concept_id"]
        _dump(run_dir / "concepts" / f"{cid}.json", concept)
        if cid in state["verifier_reports"]:
            _dump(run_dir / "verification" / f"{cid}.json", state["verifier_reports"][cid])
        _dump(run_dir / "ip" / f"{cid}.json", concept["ip"])
        _dump(run_dir / "market" / f"{cid}.json", concept["commercial"])
    _dump(run_dir / "simulations" / "evidence.json", state["evidence"])
    _dump(run_dir / "killed.json", state["killed"])
    _dump(run_dir / "survivors.json", state["survivors"])
    _dump(run_dir / "decision.md", _decision_md(state))


def _decision_md(state):
    by_id = {c["concept_id"]: c for c in state["concepts"]}
    lines = [f"# Drone Forge decision: {state['run_id']}", "", f"Run status: **{state['run_status']}**", ""]

    lines += ["## Ranking", ""]
    if state["final_ranking"]:
        lines += ["| Rank | Concept | Total | Use case |", "|---|---|---|---|"]
        for row in state["final_ranking"]:
            c = by_id[row["concept_id"]]
            lines.append(f"| {row['rank']} | {row['concept_id']} {c['defining_novelty']} | {row['total']} | {c['origin']['use_case']} |")
    else:
        lines.append("No concept reached the final reducer.")
    lines.append("")

    lines += ["## Killed", ""]
    for k in state["killed"]:
        lines.append(f"- {k['concept_id']} ({k['stage']}): {k['reason']}")
    lines.append("")

    lines += ["## Unknowns that matter", ""]
    for u in state["unknowns"]:
        lines.append(f"- {u}")
    for c in state["concepts"]:
        for u in c["unknowns"]:
            lines.append(f"- {c['concept_id']}: {u}")
    lines.append("")

    lines += ["## Node failures", ""]
    for node_id, rec in state["nodes"].items():
        if rec.get("status") not in ("SUCCESS", "PARTIAL"):
            lines.append(f"- {node_id}: {rec.get('status')} {rec.get('reason') or ''}".rstrip())
    lines.append("")

    lines += ["## Human decision required", ""]
    if state["run_status"] == "awaiting_human":
        lines.append("The run stops at the human gate. Record one of BUILD, REVISE, PARK, KILL per concept with `python -m forge decide`.")
    else:
        lines.append("The run did not reach the human gate. See the node failures above.")
    if state["human_decisions"]:
        lines += ["", "Recorded decisions:"]
        lines += [f"- {d['concept_id']}: {d['decision']}" for d in state["human_decisions"]]
    lines.append("")
    return "\n".join(lines)
