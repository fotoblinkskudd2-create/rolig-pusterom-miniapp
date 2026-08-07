from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db import get_conn, loads
from app.services import run_drone_design_cycle

router = APIRouter(prefix="/api/inventions", tags=["inventions"])


class DesignCycleRequest(BaseModel):
    theater: str = "svalbard"
    min_temp_c: float = -30
    span_mm: float = 220
    chord_mm: float = 60
    battery_wh: float = 38
    frame_mass_g: float = 65
    payload_mass_g: float = 40
    hinge_count: int = 4


@router.get("")
def list_inventions():
    rows = get_conn().execute("SELECT * FROM inventions ORDER BY id DESC").fetchall()
    out = []
    for r in rows:
        d = dict(r)
        d["spec_json"] = loads(d["spec_json"])
        d["simulation_json"] = loads(d["simulation_json"])
        out.append(d)
    return {"inventions": out}


@router.get("/{invention_id}")
def get_invention(invention_id: int):
    row = get_conn().execute("SELECT * FROM inventions WHERE id = ?", (invention_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="invention not found")
    d = dict(row)
    d["spec_json"] = loads(d["spec_json"])
    d["simulation_json"] = loads(d["simulation_json"])
    return d


@router.post("/design-cycle")
def design_cycle(req: DesignCycleRequest):
    return run_drone_design_cycle(req.model_dump())
