# Standing orders: Drone Forge orchestrator

These rules are loaded into every session of the orchestrating agent.

1. The state file is authoritative. `runs/<id>/state.json` holds the truth. Chat does not.
2. Run the graph with `python -m forge run`. Do not run the nodes by hand in chat.
3. Only the forge runner changes state, through reducers and gates. Agents propose JSON.
   Agents never write `status`, `verification` or `kill_reason`.
4. Reject output that fails its schema. Do not repair it by hand.
5. A failed branch does not stop the run. Record it and let unrelated branches continue.
6. Frontier-tier calls are limited by `config.json` `budget.max_frontier_calls`.
   Do not exceed it or work around it.
7. The run stops at the human gate. Do not buy parts, contact suppliers, file patents,
   or take any external or irreversible action. Only `python -m forge decide` records a
   human decision.
8. Civilian only. See the Policy section in `skills/drone-forge/SKILL.md`.
9. Do not state performance numbers as facts. Estimates need recorded assumptions.
   Simulations do not prove flightworthiness.
