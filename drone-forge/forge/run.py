"""CLI.

  python -m forge plan
  python -m forge run    --run-dir runs/df-2026-001 --idea idea.txt --backend-cmd "python3 my_openclaw_wrapper.py"
  python -m forge status --run-dir runs/df-2026-001
  python -m forge decide --run-dir runs/df-2026-001 --concept DF-003 --decision PARK
"""

import argparse
import json
import shlex
import sys
from pathlib import Path

from .artifacts import write_artifacts
from .backend import CommandBackend, Context
from .graph import GRAPH_PATH, load_graph, run, waves
from .state import load_state, new_state, save_state

ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "config.json"
HUMAN_DECISIONS = ("BUILD", "REVISE", "PARK", "KILL")


def cmd_plan(_args):
    nodes = load_graph(GRAPH_PATH)
    for i, layer in enumerate(waves(nodes), 1):
        cells = [f"{n} [{nodes[n].tier}/{nodes[n].kind}]" for n in layer]
        print(f"wave {i}: " + ", ".join(cells))


def cmd_run(args):
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    run_dir = Path(args.run_dir)
    state_path = run_dir / "state.json"
    if state_path.exists():
        state = load_state(state_path)
    else:
        if not args.idea:
            sys.exit("--idea is required for a new run")
        state = new_state(run_dir.name, config["budget"], Path(args.idea).read_text(encoding="utf-8"))

    nodes = load_graph(GRAPH_PATH)
    ctx = Context(config=config, backend=CommandBackend(shlex.split(args.backend_cmd)), run_dir=run_dir)
    run(nodes, state, ctx, persist=lambda s: save_state(s, state_path))

    if state["run_status"] == "running":
        state["run_status"] = "incomplete"
    save_state(state, state_path)
    write_artifacts(run_dir, state, nodes)
    failed = {n: r for n, r in state["nodes"].items() if r.get("status") not in ("SUCCESS", "PARTIAL")}
    print(f"run {state['run_id']}: {state['run_status']}")
    print(f"survivors: {len(state['survivors'])}, killed: {len(state['killed'])}, ranked: {len(state['final_ranking'])}")
    for node_id, rec in failed.items():
        print(f"  {node_id}: {rec.get('status')} {rec.get('reason') or ''}".rstrip())


def cmd_status(args):
    state = load_state(Path(args.run_dir) / "state.json")
    print(json.dumps({k: state[k] for k in ("run_id", "run_status", "budget_used")}, indent=2))
    for node_id, rec in state["nodes"].items():
        print(f"{node_id:18} {rec.get('status')}")


def cmd_decide(args):
    run_dir = Path(args.run_dir)
    state_path = run_dir / "state.json"
    state = load_state(state_path)
    if state["run_status"] != "awaiting_human":
        sys.exit(f"run is {state['run_status']}; human decisions are only taken at the human gate")
    if args.decision not in HUMAN_DECISIONS:
        sys.exit(f"decision must be one of {HUMAN_DECISIONS}")
    if not any(c["concept_id"] == args.concept for c in state["concepts"]):
        sys.exit(f"unknown concept {args.concept}")
    state["human_decisions"].append({"concept_id": args.concept, "decision": args.decision})
    save_state(state, state_path)
    write_artifacts(run_dir, state, load_graph(GRAPH_PATH))
    print(f"{args.concept}: {args.decision} recorded")


def main(argv=None):
    parser = argparse.ArgumentParser(prog="forge")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("plan", help="print dependency waves")

    p_run = sub.add_parser("run", help="start or resume a run")
    p_run.add_argument("--run-dir", required=True)
    p_run.add_argument("--idea", help="text file with the raw idea (new runs only)")
    p_run.add_argument("--backend-cmd", required=True, help="command that answers one JSON request on stdin")
    p_run.set_defaults(func=cmd_run)

    p_status = sub.add_parser("status", help="show node statuses")
    p_status.add_argument("--run-dir", required=True)
    p_status.set_defaults(func=cmd_status)

    p_decide = sub.add_parser("decide", help="record a human decision at the human gate")
    p_decide.add_argument("--run-dir", required=True)
    p_decide.add_argument("--concept", required=True)
    p_decide.add_argument("--decision", required=True)
    p_decide.set_defaults(func=cmd_decide)

    args = parser.parse_args(argv)
    if args.cmd == "plan":
        cmd_plan(args)
    else:
        args.func(args)
    return 0
