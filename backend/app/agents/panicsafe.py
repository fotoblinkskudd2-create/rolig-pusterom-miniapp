"""PanicSafe / PanicGuard agent: breathing-valve physics + patient scenario simulation.

IMPORTANT: this produces a device CONCEPT and a simulated training scenario for
product/engineering screening. It is not a certified medical device and the
"clinical" export is a documentation scaffold, not proof of clinical validity --
real deployment requires MDR/FDA-appropriate testing and licensed clinical review.
"""
from __future__ import annotations

import math
from datetime import datetime, timezone

from app.agents.base import BaseAgent

# Templated PTSD/panic scenarios for scenario generation (non-clinical, for
# product/UX screening only -- not diagnostic).
_SCENARIOS = [
    {
        "id": "sudden_noise",
        "trigger": "sudden loud noise (door slam / vehicle backfire)",
        "typical_hr_spike_bpm": 35,
        "typical_time_to_peak_s": 8,
    },
    {
        "id": "crowd_enclosure",
        "trigger": "crowded enclosed space with no visible exit",
        "typical_hr_spike_bpm": 28,
        "typical_time_to_peak_s": 45,
    },
    {
        "id": "conflict_reminder",
        "trigger": "sensory reminder of prior traumatic event (smell/sound/sight)",
        "typical_hr_spike_bpm": 40,
        "typical_time_to_peak_s": 15,
    },
]


class PanicSafeAgent(BaseAgent):
    name = "panicsafe"
    description = "PanicGuard valve physics + patient scenario simulation + protocol export"

    def handle(self, kind: str, payload: dict) -> dict:
        if kind == "patient_simulation":
            return self._patient_simulation(payload)
        raise ValueError(f"unknown task kind for panicsafe: {kind}")

    def _valve_physics(self, orifice_mm: float, target_flow_lpm: float) -> dict:
        # Orifice flow equation (incompressible approx): Q = Cd * A * sqrt(2*dP/rho)
        cd = 0.62
        rho_air = 1.2  # kg/m^3
        area_m2 = math.pi * (orifice_mm / 2000) ** 2
        target_flow_m3s = target_flow_lpm / 60000
        # Solve required pressure drop for the target flow at this orifice size.
        dp_pa = ((target_flow_m3s / (cd * area_m2)) ** 2) * rho_air / 2 if area_m2 > 0 else 0
        return {
            "orifice_diameter_mm": orifice_mm,
            "discharge_coefficient": cd,
            "required_pressure_drop_pa": round(dp_pa, 1),
            "target_exhale_resistance": (
                "tunable orifice (2.0-4.5mm) gives graded exhale resistance for box-breathing pacing"
            ),
            "purpose": "adjustable exhalation resistance valve paces slow exhale (vagal downregulation)",
        }

    def _patient_simulation(self, payload: dict) -> dict:
        scenario_id = payload.get("scenario_id", "sudden_noise")
        scenario = next((s for s in _SCENARIOS if s["id"] == scenario_id), _SCENARIOS[0])
        baseline_hr = float(payload.get("baseline_hr_bpm", 72))
        orifice_mm = float(payload.get("orifice_mm", 3.2))
        target_flow_lpm = float(payload.get("target_flow_lpm", 12))

        valve = self._valve_physics(orifice_mm, target_flow_lpm)

        peak_hr = baseline_hr + scenario["typical_hr_spike_bpm"]
        # Device-assisted paced breathing recovery model: exponential decay back to
        # baseline, with device use cutting recovery time constant ~35% (device-on
        # assumption from paced-breathing HRV literature; needs field validation).
        tau_unassisted_s = 240
        tau_assisted_s = tau_unassisted_s * 0.65
        recovery_curve = [
            {
                "t_s": t,
                "hr_bpm_unassisted": round(baseline_hr + (peak_hr - baseline_hr) * math.exp(-t / tau_unassisted_s), 1),
                "hr_bpm_with_device": round(baseline_hr + (peak_hr - baseline_hr) * math.exp(-t / tau_assisted_s), 1),
            }
            for t in range(0, 301, 30)
        ]

        outcome = {
            "scenario": scenario,
            "baseline_hr_bpm": baseline_hr,
            "peak_hr_bpm": peak_hr,
            "recovery_curve": recovery_curve,
            "time_to_baseline_unassisted_s": round(tau_unassisted_s * 3, 0),
            "time_to_baseline_with_device_s": round(tau_assisted_s * 3, 0),
        }

        adhd_layer = {
            "biohacking_checklist": [
                "morning bright light 10min within 30min of waking",
                "protein-forward breakfast, delay caffeine 90min post-wake",
                "box-breathing with PanicGuard valve: 4-4-4-4 before high-focus blocks",
                "body-doubling or 25/5 Pomodoro with visible timer",
                "cold-exposure 30-60s post-workout for dopamine/norepinephrine reset",
            ],
            "device_integration": "PanicGuard valve doubles as a tactile focus-reset tool between Pomodoro blocks",
        }

        protocol_md = self._protocol_markdown(scenario, valve, outcome)

        self.remember("last_session", {"scenario": scenario, "valve": valve})
        return {
            "valve_physics": valve,
            "patient_outcome": outcome,
            "adhd_biohacking": adhd_layer,
            "protocol_md": protocol_md,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    def _protocol_markdown(self, scenario: dict, valve: dict, outcome: dict) -> str:
        return f"""# PanicGuard Test Protocol (draft, non-clinical)

**Scenario simulated:** {scenario['trigger']}

## Device parameters
- Orifice diameter: {valve['orifice_diameter_mm']} mm
- Required pressure drop: {valve['required_pressure_drop_pa']} Pa
- Target exhale flow: paced via {valve['target_exhale_resistance']}

## Simulated outcome
- Baseline HR: {outcome['baseline_hr_bpm']} bpm
- Peak HR: {outcome['peak_hr_bpm']} bpm
- Modeled recovery to baseline (unassisted): {outcome['time_to_baseline_unassisted_s']} s
- Modeled recovery to baseline (with device): {outcome['time_to_baseline_with_device_s']} s

## Disclaimer
This is a simulated engineering/product-screening protocol generated by REGNViking OS.
It is **not** a clinical trial and does **not** constitute medical device certification.
Before any patient-facing use: engage a licensed clinician, run a real IRB-approved
pilot, and pursue the applicable regulatory pathway (Norway: DIREKTORATET FOR
MEDISINSKE PRODUKTER / EU MDR; and/or local equivalent for target markets).
"""
