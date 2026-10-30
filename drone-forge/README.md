# Drone Forge

A small Python state machine that runs the Drone Forge graph: generate civilian drone
concepts, kill physically weak ones early, attack the survivors, check IP and
commercial fit, and stop at a human gate.

The split is deliberate:

- **This package** owns state, the dependency graph, schema validation, reducers,
  energy checks, gates, and the run manifest. Code kills and ranks.
- **Models** (OpenClaw agents or anything else) only propose JSON. They sit behind
  a `Backend`. Their output is rejected unless it matches the node's schema.

OpenClaw gives you skills, workspaces, and subagents. It does not give you a DAG
engine, so the graph lives here.

## Layout

```
graph.json          nodes, dependencies, tiers, schemas, appliers
config.json         budget, reducer weights, energy constants, final formula
schemas/            JSON Schema for every node output and for the concept record
skills/drone-forge/SKILL.md   one `## node: <id>` prompt per agent node
AGENTS.md           standing orders for the orchestrating agent
forge/              runner, state, validation, reducers, CLI
tests/              unittest suite (no third-party test runner needed)
```

## Run

```bash
cd drone-forge
pip install -r requirements.txt
python3 -m unittest discover -s tests -v

python3 -m forge plan                       # dependency waves
python3 -m forge run --run-dir runs/df-2026-001 \
    --idea idea.txt \
    --backend-cmd "python3 my_openclaw_wrapper.py"
python3 -m forge status --run-dir runs/df-2026-001
python3 -m forge decide --run-dir runs/df-2026-001 --concept DF-003 --decision PARK
```

`run` resumes from `runs/<id>/state.json` if it exists, so an interrupted run
continues where it stopped.

## The backend contract

`CommandBackend` runs one command per agent call:

- stdin: `{"node": str, "tier": "local|mid|frontier", "prompt": str, "input": {...}}`
- stdout: one JSON object that matches the node's schema. Set `"_partial": true` if the
  output is incomplete.
- non-zero exit: node `FAILED`. Stdout that is not JSON: node `INVALID`. Over the node's
  `timeout_s`: `TIMEOUT`.

Wire it to OpenClaw with a wrapper script. The wrapper picks the model from `tier` and
passes `prompt` and `input` to the agent. This repo does not contain the wrapper,
because the OpenClaw CLI flags were not verified here.

## Failure behaviour

- A failed or invalid node is recorded with its reason. Its dependents are `SKIPPED`.
  Unrelated branches keep running.
- Frontier calls are capped by `budget.max_frontier_calls`. A node that would go over
  the cap is `FAILED` with a budget reason.
- A concept update that breaks the concept schema is rejected and recorded under
  `unknowns`. The concept is not killed for it.
- Agents cannot set `status`, `verification`, `scores` or `kill_reason` through updates.
  Those are protected, and any attempt is recorded.

## Reducers and gates

| Stage | Who | Rule |
|---|---|---|
| Energy | code | First-order momentum theory. `P_ideal = T^1.5 / sqrt(2·ρ·A)`, then `/ FM × overhead`. Endurance below `min_endurance_min` kills. Missing inputs give `UNCERTAIN`, not a kill. |
| Physics, materials | agent | `FAIL` kills. `UNCERTAIN` survives and is recorded. |
| Hard reducer | code | Weighted score (`config.reducer.weights`). Duplicates by signature are removed. No more than `max_per_group` (3) concepts may share airframe, propulsion, primary mission or defining novelty. Score below `min_score` is dropped. Cap `survivor_cap` (8). Fewer survivors are allowed. |
| Adversarial | agent | `KILL` kills. `REPAIR` enters the repair loop. A survivor with no verdict is killed. |
| Repair | code + agent | Up to `repair.max_cycles` (2). Still `REPAIR` after that: killed. |
| IP gate | agent | `PROBABLY CROWDED` or `NOT_RUN` is ineligible for ranking. |
| Commercial gate | agent | `KILL` or `NOT_RUN` is ineligible for ranking. |
| Final | code | `TOTAL` with the spec's weights. Top three get `BUILD`, `TEST`, `WATCH`. The rest get `ARCHIVE`. |
| Human | code | Run stops in `awaiting_human`. Only `decide` records a decision. |

## Scoring names

The spec's score names were adjusted to match the reducer weights:

- `usefulness` → `mission_value`
- added `cost_score` (higher = cheaper), because the reducer weights cost at 10%
- added `alex_fit`, because the reducer and the final formula both use it

The four risk terms in the final formula are in `risks`:
`technical_risk`, `capital_requirement`, `regulatory_risk`, `complexity`.

## Not in this version

- The OpenClaw wrapper and the 12 OpenClaw agent definitions. The workspace format was
  not verified, so no fake definitions were written.
- Narrative sections of `decision.md` (most interesting failure, unexpected discovery,
  and so on). Code writes data only. A final narrative node can be added to `graph.json`.
- Cost and token accounting per node. The budget counts calls, not dollars.
- Any benchmark of the speed or cost claims. Measure them on a real run before you
  quote numbers.
