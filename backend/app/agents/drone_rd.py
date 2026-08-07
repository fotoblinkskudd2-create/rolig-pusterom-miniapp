"""Drone-R&D agent: Kolibri folding-wing / 6DOF hybrid concept generator.

Produces a parametric spec, a first-order aero/endurance estimate, and an
OpenSCAD-ready CAD export -- everything downstream agents (Biomimicry,
Arctic-Ops, Patent) attach to. Numbers are first-order engineering estimates
for concept screening, not a substitute for real wind-tunnel/CFD validation.
"""
from __future__ import annotations

import math
from datetime import datetime, timezone

from app.agents.base import BaseAgent

CAD_TEMPLATE = """// REGNViking OS - auto-generated parametric export
// Kolibri folding-wing / 6DOF hybrid drone - concept {slug}
span_mm = {span_mm};
chord_mm = {chord_mm};
fold_hinge_count = {hinge_count};
frame_mass_g = {frame_mass_g};

module wing_half() {{
    linear_extrude(height=2)
        polygon(points=[[0,0],[chord_mm,0],[chord_mm*0.35,span_mm/2]]);
}}

module hinge(i) {{
    translate([i * (span_mm / (fold_hinge_count + 1)), 0, 0])
        cylinder(h=6, r=3, center=true, $fn=24);
}}

module drone_frame() {{
    wing_half();
    mirror([0,1,0]) wing_half();
    for (i = [1 : fold_hinge_count]) hinge(i);
}}

drone_frame();
"""


class DroneRDAgent(BaseAgent):
    name = "drone_rd"
    description = "Kolibri folding-wing / 6DOF hybrid drone concept generator"

    def handle(self, kind: str, payload: dict) -> dict:
        if kind == "design_cycle":
            return self._design_cycle(payload)
        raise ValueError(f"unknown task kind for drone_rd: {kind}")

    def _design_cycle(self, payload: dict) -> dict:
        theater = payload.get("theater", "svalbard")  # svalbard | ukraine
        span_mm = float(payload.get("span_mm", 220))
        chord_mm = float(payload.get("chord_mm", 60))
        battery_wh = float(payload.get("battery_wh", 38))
        frame_mass_g = float(payload.get("frame_mass_g", 65))
        payload_mass_g = float(payload.get("payload_mass_g", 40))
        hinge_count = int(payload.get("hinge_count", 4))

        total_mass_g = frame_mass_g + payload_mass_g + battery_wh * 8.5  # ~8.5 g/Wh for LiPo
        wing_area_m2 = (span_mm / 1000) * (chord_mm / 1000) * 0.85  # 0.85 planform factor
        disk_loading = (total_mass_g / 1000 * 9.81) / max(wing_area_m2, 1e-6)  # N/m^2

        # First-order endurance estimate (hover-capable hybrid): energy / avg power draw.
        avg_power_w = 0.55 * math.sqrt(disk_loading) * (total_mass_g / 1000) + 1.2
        endurance_min = (battery_wh * 0.8 / max(avg_power_w, 0.1)) * 60  # 0.8 usable-capacity factor

        slug = f"kolibri-{theater}-{int(datetime.now(timezone.utc).timestamp())}"
        spec = {
            "slug": slug,
            "concept": "Kolibri folding-wing / 6DOF hybrid",
            "theater": theater,
            "geometry": {
                "span_mm": span_mm,
                "chord_mm": chord_mm,
                "hinge_count": hinge_count,
                "fold_state": "6-DOF hover -> folded transit in <2s (hinge-actuated)",
            },
            "mass_budget_g": {
                "frame": frame_mass_g,
                "payload": payload_mass_g,
                "battery": round(battery_wh * 8.5, 1),
                "total": round(total_mass_g, 1),
            },
            "propulsion": "4x coreless hover rotor + 2x forward-transit prop, 6DOF hybrid control",
        }

        simulation = {
            "wing_area_m2": round(wing_area_m2, 4),
            "disk_loading_n_m2": round(disk_loading, 2),
            "avg_power_draw_w": round(avg_power_w, 2),
            "estimated_endurance_min": round(endurance_min, 1),
            "method": "first-order momentum-theory + empirical power heuristic (concept screening only)",
            "confidence": "low-medium: needs wind-tunnel/CFD + flight-test validation before build",
        }

        cad_source = CAD_TEMPLATE.format(
            slug=slug,
            span_mm=span_mm,
            chord_mm=chord_mm,
            hinge_count=hinge_count,
            frame_mass_g=frame_mass_g,
        )

        self.remember("last_spec", spec)
        return {"spec": spec, "simulation": simulation, "cad_source": cad_source}
