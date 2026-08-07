"""Biomimicry agent: shark-skin (denticle riblet) anti-icing surface + solar film layer.

Riblet ratios follow published shark-denticle geometry (height h, spacing s,
h/s ~ 0.5, s ~ 100-200 micron) used in drag-reduction literature; the
ice-adhesion-reduction figure is a heuristic derived from riblet-induced
contact-area reduction, not a lab-measured result -- flag it as such downstream.
"""
from __future__ import annotations

from app.agents.base import BaseAgent


class BiomimicryAgent(BaseAgent):
    name = "biomimicry"
    description = "Shark-skin anti-icing riblets + solar film integration"

    def handle(self, kind: str, payload: dict) -> dict:
        if kind == "surface_layer":
            return self._surface_layer(payload)
        raise ValueError(f"unknown task kind for biomimicry: {kind}")

    def _surface_layer(self, payload: dict) -> dict:
        min_temp_c = float(payload.get("min_temp_c", -30))
        span_mm = float(payload.get("span_mm", 220))
        chord_mm = float(payload.get("chord_mm", 60))

        riblet_spacing_um = 150.0
        riblet_height_um = 75.0  # h/s = 0.5, per shark-denticle drag-reduction studies
        surface_area_m2 = 2 * (span_mm / 1000) * (chord_mm / 1000)  # both wing faces

        # Heuristic: riblets reduce ice-nucleation contact area roughly proportional
        # to (1 - h/s) geometry factor; combined with hydrophobic coating assumption.
        contact_area_reduction_pct = round((riblet_height_um / riblet_spacing_um) * 55, 1)
        solar_film_watt_peak = round(surface_area_m2 * 0.55 * 180, 1)  # 55% usable area, 180 W/m^2 flex film

        anti_icing = {
            "riblet_geometry_um": {"spacing": riblet_spacing_um, "height": riblet_height_um, "ratio_h_s": 0.5},
            "coating": "hydrophobic fluoropolymer over laser-etched riblets",
            "estimated_ice_contact_area_reduction_pct": contact_area_reduction_pct,
            "rated_min_temp_c": min_temp_c,
            "confidence": "heuristic from riblet geometry literature; needs icing-tunnel test",
        }
        solar = {
            "film_type": "flexible thin-film PV laminate over riblet layer",
            "usable_area_m2": round(surface_area_m2 * 0.55, 4),
            "estimated_watt_peak": solar_film_watt_peak,
            "purpose": "trickle-charge / extended Arctic loiter endurance",
        }

        self.remember("last_surface_layer", {"anti_icing": anti_icing, "solar": solar})
        return {"anti_icing": anti_icing, "solar": solar}
