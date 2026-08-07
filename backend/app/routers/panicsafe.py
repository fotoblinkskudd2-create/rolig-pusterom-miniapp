from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.db import get_conn, loads
from app.services import run_panicsafe_cycle

router = APIRouter(prefix="/api/panicsafe", tags=["panicsafe"])


class SimulationRequest(BaseModel):
    scenario_id: str = "sudden_noise"
    baseline_hr_bpm: float = 72
    orifice_mm: float = 3.2
    target_flow_lpm: float = 12


@router.get("/sessions")
def list_sessions():
    rows = get_conn().execute("SELECT * FROM panicsafe_sessions ORDER BY id DESC").fetchall()
    out = []
    for r in rows:
        d = dict(r)
        d["outcome_json"] = loads(d["outcome_json"])
        out.append(d)
    return {"sessions": out}


@router.post("/simulate")
def simulate(req: SimulationRequest):
    return run_panicsafe_cycle(req.model_dump())
