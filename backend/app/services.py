"""Workflow orchestration: chains multiple agents into the multi-step cycles the
acceptance criteria describe (design cycle, patient simulation cycle). This is the
'master orchestrator' composing the specialized agents rather than a single agent
doing everything itself.
"""
from __future__ import annotations

import time

from app.db import dumps, now, tx
from app.orchestrator import get_kernel


def run_drone_design_cycle(payload: dict) -> dict:
    """Full R&D loop: Drone-R&D -> Biomimicry -> Arctic-Ops -> Patent -> Gonzo-Critique.
    Acceptance target (Subtask 2): produces a patentable concept + simulation report
    in well under 15 minutes -- this synchronous chain typically completes in well
    under a second since every step is local computation, no network round-trip.
    """
    started = time.monotonic()
    kernel = get_kernel()

    drone_task = kernel.run_sync("drone_rd", "design_cycle", payload)
    drone_result = drone_task["result"]
    spec, simulation, cad_source = drone_result["spec"], drone_result["simulation"], drone_result["cad_source"]

    bio_task = kernel.run_sync(
        "biomimicry", "surface_layer",
        {"min_temp_c": payload.get("min_temp_c", -30), **spec["geometry"]},
    )
    bio_result = bio_task["result"]

    arctic_task = kernel.run_sync(
        "arctic_ops", "apply_constraints",
        {
            "theater": payload.get("theater", "svalbard"),
            "min_temp_c": payload.get("min_temp_c", -30),
            "estimated_endurance_min": simulation["estimated_endurance_min"],
        },
    )
    arctic_result = arctic_task["result"]

    full_spec = {**spec, "surface_layer": bio_result, "ops_constraints": arctic_result["constraints"]}

    cad_path = None
    with tx() as conn:
        cur = conn.execute(
            """INSERT INTO inventions (title, domain, summary, spec_json, simulation_json,
               cad_export_path, status, created_at)
               VALUES (?, 'drone', ?, ?, ?, ?, 'concept', ?)""",
            (
                f"Kolibri hybrid drone - {payload.get('theater', 'svalbard')} config",
                "Folding-wing 6DOF hybrid drone with shark-skin anti-icing and solar film, "
                "sized for Arctic/Ukraine cold-and-contested operations.",
                dumps(full_spec),
                dumps(simulation),
                cad_path,
                now(),
            ),
        )
        invention_id = cur.lastrowid

    from app.config import BASE_DIR, DATA_DIR
    cad_dir = DATA_DIR / "cad_exports"
    cad_dir.mkdir(parents=True, exist_ok=True)
    cad_file = cad_dir / f"invention_{invention_id}.scad"
    cad_file.write_text(cad_source, encoding="utf-8")
    try:
        cad_rel = str(cad_file.relative_to(BASE_DIR))
    except ValueError:
        cad_rel = str(cad_file)
    with tx() as conn:
        conn.execute(
            "UPDATE inventions SET cad_export_path = ? WHERE id = ?",
            (cad_rel, invention_id),
        )

    patent_task = kernel.run_sync(
        "patent", "draft_patent",
        {
            "invention_id": invention_id,
            "title": f"Cold-climate folding-wing hybrid UAV with biomimetic anti-icing surface",
            "domain": "aerospace/mechanical",
            "features": [
                "a foldable multi-hinge wing structure enabling hover-to-transit reconfiguration",
                "a hydrophobic riblet surface layer patterned on shark-denticle geometry for ice-adhesion reduction",
                "an integrated flexible photovoltaic film for cold-climate endurance extension",
                "a 6-degree-of-freedom hybrid rotor/wing propulsion control scheme",
            ],
        },
    )
    patent_result = patent_task["result"]

    critique_task = kernel.run_sync(
        "gonzo_critique", "critique",
        {
            "artifact_type": "drone_invention",
            "text": dumps({"spec": full_spec, "simulation": simulation, "novelty_risk": patent_result["novelty_risk"]}),
        },
    )

    elapsed_s = round(time.monotonic() - started, 2)
    return {
        "invention_id": invention_id,
        "spec": full_spec,
        "simulation": simulation,
        "cad_export_path": cad_rel,
        "patent": patent_result,
        "gonzo_critique": critique_task["result"],
        "elapsed_seconds": elapsed_s,
        "acceptance_under_15min": elapsed_s < 900,
    }


def run_panicsafe_cycle(payload: dict) -> dict:
    """Patient simulation -> device concept -> patent draft -> Gonzo-Critique."""
    kernel = get_kernel()
    sim_task = kernel.run_sync("panicsafe", "patient_simulation", payload)
    sim_result = sim_task["result"]

    with tx() as conn:
        conn.execute(
            """INSERT INTO panicsafe_sessions (scenario, valve_params_json, patient_profile_json,
               outcome_json, protocol_md, created_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                sim_result["patient_outcome"]["scenario"]["id"],
                dumps(sim_result["valve_physics"]),
                dumps(payload),
                dumps(sim_result["patient_outcome"]),
                sim_result["protocol_md"],
                now(),
            ),
        )

    patent_task = kernel.run_sync(
        "patent", "draft_patent",
        {
            "title": "Adjustable exhalation-resistance breathing valve for guided panic-response training",
            "domain": "medical device / respiratory training",
            "features": [
                "a tunable orifice providing graded exhalation resistance for paced breathing",
                "a coupling to a paced-breathing timing protocol for panic/PTSD response training",
            ],
        },
    )

    critique_task = kernel.run_sync(
        "gonzo_critique", "critique",
        {"artifact_type": "panicsafe_device", "text": sim_result["protocol_md"]},
    )

    return {
        "simulation": sim_result,
        "patent": patent_task["result"],
        "gonzo_critique": critique_task["result"],
    }
