"""Arctic-Ops agent: applies Svalbard / Ukraine operational constraints to a drone spec."""
from __future__ import annotations

from app.agents.base import BaseAgent

# Simplified LiPo capacity derating vs temperature (fraction of rated Wh available).
_TEMP_DERATE_CURVE = [
    (-30, 0.45), (-20, 0.62), (-10, 0.78), (0, 0.90), (10, 0.97), (20, 1.0),
]


def _derate_factor(temp_c: float) -> float:
    pts = sorted(_TEMP_DERATE_CURVE)
    if temp_c <= pts[0][0]:
        return pts[0][1]
    if temp_c >= pts[-1][0]:
        return pts[-1][1]
    for (t0, f0), (t1, f1) in zip(pts, pts[1:]):
        if t0 <= temp_c <= t1:
            span = t1 - t0
            ratio = (temp_c - t0) / span if span else 0
            return f0 + (f1 - f0) * ratio
    return 1.0


class ArcticOpsAgent(BaseAgent):
    name = "arctic_ops"
    description = "Svalbard / Ukraine cold-weather + contested-environment ops constraints"

    def handle(self, kind: str, payload: dict) -> dict:
        if kind == "apply_constraints":
            return self._apply(payload)
        raise ValueError(f"unknown task kind for arctic_ops: {kind}")

    def _apply(self, payload: dict) -> dict:
        theater = payload.get("theater", "svalbard")
        min_temp_c = float(payload.get("min_temp_c", -30))
        endurance_min = float(payload.get("estimated_endurance_min", 20))

        derate = _derate_factor(min_temp_c)
        derated_endurance_min = round(endurance_min * derate, 1)

        constraints = {
            "theater": theater,
            "min_operating_temp_c": min_temp_c,
            "battery_cold_derate_factor": round(derate, 2),
            "derated_endurance_min": derated_endurance_min,
            "material_notes": (
                "carbon-fiber frame embrittles below -25C -- use glass-fiber/PA12 hybrid "
                "hinge inserts to keep fold mechanism ductile"
            ),
        }

        if theater == "svalbard":
            constraints["environment"] = {
                "wind_gust_design_ms": 18,
                "katabatic_gust_margin": "size control-surface authority for 1.4x hover thrust margin",
                "gps": "GNSS available but polar-orbit gap coverage -- carry IMU dead-reckoning fallback",
                "wildlife_reg": "keep >150m from polar bear / bird colonies per Svalbard environmental rules",
            }
        elif theater == "ukraine":
            constraints["environment"] = {
                "ew_resilience": "GPS-denied INS/visual-odometry fallback required; frequency-hopping link",
                "signature": "minimize RF/IR signature -- brushless motor shielding, low-IR battery placement",
                "airspace": "operate under applicable military/civil airspace deconfliction rules",
            }
        else:
            constraints["environment"] = {"note": "generic cold-climate profile applied"}

        self.remember("last_constraints", constraints)
        return {"constraints": constraints}
