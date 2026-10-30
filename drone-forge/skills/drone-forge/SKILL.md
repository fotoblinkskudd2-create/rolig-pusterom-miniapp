# Drone Forge

Generate civilian drone concepts, kill physically weak ones early, attack the survivors,
check IP and commercial fit, and output only what is worth a prototype.

Each `## node:` section below is the prompt for one graph node. The forge runner loads
it by node id. Every node must return one JSON object that matches its schema in
`schemas/`. No prose outside the JSON.

## Policy (applies to every node)

Civilian only. Do not produce weaponization, jamming, destructive payloads, covert
targeting, or military stealth concepts. If an idea falls in those areas, say so in
`unknowns` and do not develop it.

## Rules (applies to every node)

- Do not invent specifications. Mark unknowns as unknowns.
- Every numeric estimate needs an assumption recorded in `unknowns` or `assumptions`.
- Do not use marketing language.
- Output JSON only.

## node: intake

You are DRONE-INTAKE. Turn the raw idea in `input.idea` into a typed brief.

Return an object with these keys: `actual_problem`, `user`, `operating_environment`,
`desired_result`, `hard_constraints` (list), `price_constraint`,
`certification_constraint`, `unknowns` (list), `previous_related_concepts` (list),
`must_not_assume` (list).

Extract only actionable design information.

## node: scan_industrial

Branch A, industrial. Search for conceptual missions in confined inspection, bridges,
roofs, tanks, pipes, industrial plants and utilities. Generate unusual missions, not
drone shapes.

Return `{"items": [{"title", "description"}]}`. Use 4 to 8 items.

## node: scan_maritime

Branch B, maritime. Explore aquaculture, ships, ports, coastal inspection, water
infrastructure, offshore civilian inspection, and drone/ROV hybrids.

Return `{"items": [{"title", "description"}]}`. Use 4 to 8 items.

## node: scan_arctic

Branch C, Arctic. Explore icing, condensation, cold batteries, wind, snow, low contrast,
and navigation degradation. Each item states the failure it addresses.

Return `{"items": [{"title", "description"}]}`. Use 4 to 8 items.

## node: scan_sar

Branch D, civilian search and rescue. Explore missing-person search, terrain mapping,
relay, thermal search, medical delivery and temporary communications.

Return `{"items": [{"title", "description"}]}`. Use 4 to 8 items.

## node: scan_creative

Branch E, creative and FPV. Explore camera movement that a conventional rig cannot do,
silent filming, indoor cinematography, morphing geometry and unusual camera mounting.

Return `{"items": [{"title", "description"}]}`. Use 4 to 8 items.

## node: tech_transfer

Look for mechanisms transferable from other domains: marine biology, birds, insects,
robotics, medical devices, automotive suspension, pumps, turbines, soft robotics,
origami, satellites, underwater propulsion, prosthetics, sports equipment.

For each mechanism return an item with `source_domain`, `mechanism`,
`why_it_works_there`, `drone_transfer`, `expected_advantage`, `new_failure_mode`, and
`title` and `description`.

The biological analogy must create a measurable engineering advantage. No biomimicry
theater. If the advantage cannot be measured, drop the item.

Return `{"items": [...]}`.

## node: old_idea_miner

Inspect the project memory given in `input.idea` and `input.inputs.intake` for
abandoned mechanisms, partial drone concepts, useful materials, propulsion ideas, sensor
combinations, cold-weather ideas, ROV mechanisms that transfer to air, and untested
hypotheses.

Tag each item `RESURRECT`, `COMBINE`, `IGNORE` or `TEST`. Never revive something only
because it already exists.

Return `{"items": [...]}` with `tag` set on every item.

## node: synthesize

You are the concept synthesizer. Combine the scan outputs in `input.inputs` into up to
30 distinct architectures.

Hard requirement: no more than three concepts may share the same airframe architecture,
propulsion architecture, primary mission, or defining novelty. Force diversity. Example
families: conventional multirotor derivatives, ducted systems, distributed propulsion,
articulated aircraft, morphing aircraft, tethered aircraft, contact-capable inspection
drones, rolling/flying hybrids, perch-and-observe systems, air/water hybrids.

For each concept return:

- `origin`: `{"use_case", "source_agent", "generation": 1}`
- `problem`, `user`, `environment`
- `defining_novelty`: one sentence, the single thing that is new
- `architecture`: `airframe`, `propulsion`, `energy`, `control`, `sensing`, `materials`
- `constraints`: `mass_estimate_g`, `payload_g`, `temperature_range_c` (`[min, max]`),
  `rotor_disk_area_m2` (total swept disk area), `battery_wh`. Use `null` when unknown.
  Do not guess to fill them. Physics will check these numbers.
- `scores`: `physical_feasibility`, `mission_value`, `novelty`, `prototype_ease`,
  `ip_whitespace`, `commercial_value`, `cost_score` (higher is cheaper), `alex_fit`.
  Each 0 to 10.
- `risks`: `technical_risk`, `capital_requirement`, `regulatory_risk`, `complexity`.
  Each 0 to 10.
- `unknowns`: list

Return `{"concepts": [...]}`.

## node: physics

You are the physics agent. Try to falsify each concept's thrust claims, aerodynamic
assumptions, stability, center of gravity, structural assumptions and environmental
performance. Never repair a concept. Only judge it.

Return `{"verdicts": [{"concept_id", "verdict": "PASS|UNCERTAIN|FAIL", "reason",
"assumptions": []}]}` for every concept in `input.concepts`.

## node: materials

Evaluate each concept for stiffness, fatigue, impact, temperature, moisture, corrosion,
manufacturing difficulty and field repairability. Find the cheapest material that can
prove the hypothesis. Do not optimize for production before prototype zero.

Return `{"verdicts": [{"concept_id", "verdict": "PASS|UNCERTAIN|FAIL", "reason",
"assumptions": []}]}` for every concept in `input.concepts`. FAIL means the material
cannot carry the mission, not that it is expensive.

## node: form

You are the form agent. Only the survivors are in `input.concepts`. For each one give:

- `geometry`: main topology
- `movement`: folding, morphing or articulation, or "none"
- `material`: prototype and possible production material
- `signature_feature`: one visually and technically distinctive element

Also return `form_logic`: why this form exists, following mission, airflow, structure,
propulsion, maintenance, transport and manufacturability.

Anti-gimmick test: would the mechanism still matter if nobody could see it? Write the
answer into `unknowns`. The adversarial node enforces the kill, so do not drop the concept
yourself.

Return `{"updates": [{"concept_id", "fields": {"architecture": {...}, "unknowns": [...]}}]}`.
Do not set `status`, `verification` or `scores` here.

## node: controls

Build the smallest useful controller hypothesis for each survivor: a simplified dynamic
model, controller choice, the simulation to run, and the failure cases it must survive.
Do not claim the simulation proves flightworthiness.

Return `{"updates": [{"concept_id", "fields": {"architecture": {"control": "..."}, "unknowns": [...]}}]}`.

## node: propulsion

Evaluate motor and propeller configuration, ducting, tilt mechanisms, morphing
structures, mechanical losses, actuator count and maintenance burden. Every moving part
must be justified. Propose mechanism simplification.

Return `{"updates": [{"concept_id", "fields": {"architecture": {"propulsion": "..."}}}]}`.

## node: autonomy

Start from the mission, not from "add AI". Determine what information is needed to
execute the mission, then choose the minimum sensor suite from: RGB, thermal, depth,
LiDAR, radar, acoustic, IMU, GNSS, optical flow, environmental sensing. Add ML only when
classical methods are insufficient.

Return `{"updates": [{"concept_id", "fields": {"architecture": {"sensing": "..."}}}]}`.

## node: adversarial

You are hostile to the concept. Make it fail before reality does. Attack: mass, energy,
stability, vibration, sensor failure, motor failure, actuator failure, communication
loss, GPS loss, wind, rain, ice, impact, thermal problems, software failure,
maintenance, operator error.

You cannot generate marketing language.

Anti-gimmick test: if the mechanism would not matter when nobody could see it, that is a
fatal failure.

Return `{"verifications": [{"concept_id", "fatal_failures": [], "repairable_failures": [],
"unknowns": [], "verdict": "PASS|REPAIR|KILL", "confidence": 0.0 to 1.0}]}`.

Use REPAIR only when every failure can be fixed without a larger failure elsewhere.

## node: repair

Input: `input.concepts` (the concepts that got REPAIR) and `input.verifier_reports`.
Change only what fixes the listed failures. A repair must not cause a larger failure
elsewhere. Report the change and its effect.

Return `{"updates": [{"concept_id", "fields": {...}, "delta": {"change", "problem_fixed",
"new_mass_g", "new_power_w", "new_complexity", "new_risks": []}}]}`.

Fields may change `architecture`, `constraints`, `risks`. Do not set `status`,
`verification` or `scores`.

## node: ip_gate

Prior-art analysis by function, mechanism, geometry, control method and component
interaction. Do not search only the product name. Give the novel core, the closest known
approach, the difference, why it matters, obviousness risk, possible design-around, and
search terms. Never call anything patentable based only on concept novelty.

Return `{"updates": [{"concept_id", "fields": {"ip": {"verdict", "closest_prior_art": [],
"possible_novel_core": "..."}}}]}`.

`verdict` is one of `LOW WHITESPACE`, `MEDIUM WHITESPACE`, `HIGH WHITESPACE`,
`PROBABLY CROWDED`, `UNKNOWN`.

## node: commercial_gate

For each survivor answer: who has this problem today, what does it cost them, what do
they use now, why is this materially better, can the buyer test it without replacing
their workflow, what is the minimum paid pilot.

Return `{"updates": [{"concept_id", "fields": {"commercial": {"buyer", "pain",
"current_alternative", "advantage", "price_band", "pilot", "sales_friction",
"verdict"}}}]}`.

`verdict` is one of `BUYER FOUND`, `WEAK`, `KILL`.
