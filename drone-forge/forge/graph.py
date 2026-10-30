"""Dependency-aware runner.

A node runs when all its dependencies are DONE. A node whose dependency is
BLOCKING is SKIPPED, and unrelated branches keep running. Agent nodes in one
wave run in parallel up to max_parallel_width. Code nodes run on the main thread.
State is persisted after every settled node.
"""

import json
from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import TimeoutError as FutureTimeout
from dataclasses import dataclass
from pathlib import Path

from . import reducers
from .backend import (
    BackendError,
    BackendTimeout,
    BudgetExhausted,
    InvalidOutput,
    checked_output,
    load_prompt,
    spend,
)
from .state import BLOCKING, DONE, NODE_PENDING, active_concepts, node_status

GRAPH_PATH = Path(__file__).resolve().parent.parent / "graph.json"


@dataclass(frozen=True)
class Node:
    id: str
    kind: str
    tier: str
    deps: tuple
    schema: str | None
    apply: str | None
    handler: str | None
    timeout_s: int


def load_graph(path):
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    nodes = {}
    for r in raw["nodes"]:
        if r["id"] in nodes:
            raise ValueError(f"duplicate node {r['id']}")
        nodes[r["id"]] = Node(
            id=r["id"],
            kind=r["kind"],
            tier=r.get("tier", "none"),
            deps=tuple(r.get("deps", [])),
            schema=r.get("schema"),
            apply=r.get("apply"),
            handler=r.get("handler"),
            timeout_s=int(r.get("timeout_s", 300)),
        )
    for n in nodes.values():
        for d in n.deps:
            if d not in nodes:
                raise ValueError(f"{n.id} depends on unknown node {d}")
        if n.kind == "agent" and not n.schema:
            raise ValueError(f"agent node {n.id} has no schema")
        if n.kind == "code" and not n.handler:
            raise ValueError(f"code node {n.id} has no handler")
        if n.kind == "code" and n.handler not in reducers.HANDLERS:
            raise ValueError(f"unknown handler {n.handler} in {n.id}")
    waves(nodes)
    return nodes


def waves(nodes):
    """Topological layers. Raises ValueError on a cycle."""
    remaining = {n.id: set(n.deps) for n in nodes.values()}
    done, layers = set(), []
    while remaining:
        layer = sorted(i for i, deps in remaining.items() if deps <= done)
        if not layer:
            raise ValueError(f"dependency cycle among {sorted(remaining)}")
        layers.append(layer)
        done.update(layer)
        for i in layer:
            del remaining[i]
    return layers


def _record(state, node_id, status, reason=None):
    rec = state["nodes"].setdefault(node_id, {"attempts": 0})
    rec["status"] = status
    rec["reason"] = reason


def _fail(state, node, status, reason, retries):
    rec = state["nodes"].setdefault(node.id, {"attempts": 0})
    rec["attempts"] = rec.get("attempts", 0) + 1
    retryable = node.kind == "agent" and status in {"FAILED", "INVALID"} and rec["attempts"] <= retries
    _record(state, node.id, NODE_PENDING if retryable else status, reason)


def _skip_blocked(nodes, state):
    changed = True
    while changed:
        changed = False
        for n in nodes.values():
            if node_status(state, n.id) != NODE_PENDING:
                continue
            blockers = [d for d in n.deps if node_status(state, d) in BLOCKING]
            if blockers:
                _record(state, n.id, "SKIPPED", f"dependency {blockers[0]} is {node_status(state, blockers[0])}")
                changed = True


def _ready(nodes, state):
    return [
        n
        for n in nodes.values()
        if node_status(state, n.id) == NODE_PENDING and all(node_status(state, d) in DONE for d in n.deps)
    ]


def build_payload(node, state):
    return {
        "run_id": state["run_id"],
        "idea": state["idea"],
        "inputs": {d: state["outputs"][d] for d in node.deps if d in state["outputs"]},
        "concepts": active_concepts(state),
    }


def _apply(node, state, out, ctx):
    if not node.apply or node.apply == "store":
        return
    name, _, arg = node.apply.partition(":")
    reducers.APPLIERS[name](state, out, ctx, *([arg] if arg else []))


def _run_agents(batch, state, ctx, retries):
    jobs = []
    for n in batch:
        try:
            spend(state, n.tier)
        except BudgetExhausted as exc:
            _fail(state, n, "FAILED", str(exc), 0)
            continue
        jobs.append((n, ctx.backend.call, (n.id, n.tier, load_prompt(n.id), build_payload(n, state), n.timeout_s)))

    pool = ThreadPoolExecutor(max_workers=max(1, ctx.config["budget"]["max_parallel_width"]))
    try:
        futures = [(n, pool.submit(fn, *args)) for n, fn, args in jobs]
        for n, future in futures:
            try:
                raw = future.result(timeout=n.timeout_s)
                out, partial = checked_output(raw, n.schema)
                state["outputs"][n.id] = out
                _apply(n, state, out, ctx)
                _record(state, n.id, "PARTIAL" if partial else "SUCCESS")
            except (FutureTimeout, BackendTimeout) as exc:
                _fail(state, n, "TIMEOUT", f"timed out after {n.timeout_s}s", retries)
            except BackendError as exc:
                _fail(state, n, "FAILED", str(exc), retries)
            except InvalidOutput as exc:
                _fail(state, n, "INVALID", str(exc), retries)
    finally:
        pool.shutdown(wait=False, cancel_futures=True)


def _run_code(node, state, ctx):
    try:
        reducers.HANDLERS[node.handler](state, ctx)
        _record(state, node.id, "SUCCESS")
    except InvalidOutput as exc:
        _fail(state, node, "INVALID", str(exc), 0)
    except BackendTimeout as exc:
        _fail(state, node, "TIMEOUT", str(exc), 0)
    except BackendError as exc:
        _fail(state, node, "FAILED", str(exc), 0)
    except Exception as exc:  # a failed branch must not crash the run
        _fail(state, node, "FAILED", f"{type(exc).__name__}: {exc}", 0)


def run(nodes, state, ctx, persist):
    """Run until no node is runnable. Calls persist(state) after every settled batch."""
    retries = ctx.config.get("retries", {}).get("agent", 0)
    while True:
        _skip_blocked(nodes, state)
        batch = _ready(nodes, state)
        if not batch:
            persist(state)
            return
        for n in batch:
            if n.kind == "code":
                _run_code(n, state, ctx)
                persist(state)
        agents = [n for n in batch if n.kind == "agent"]
        if agents:
            _run_agents(agents, state, ctx, retries)
            persist(state)
