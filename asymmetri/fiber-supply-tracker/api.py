"""FiberSupplyTracker – lite API over et kuratert datasett.

Kjør:  pip install fastapi uvicorn && uvicorn api:app --reload
Åpne:  http://127.0.0.1:8000
"""
import json
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

ROOT = Path(__file__).parent
DATA = json.loads((ROOT / "data" / "dataset.json").read_text(encoding="utf-8"))

app = FastAPI(title="FiberSupplyTracker", version="0.1.0")
app.mount("/static", StaticFiles(directory=ROOT / "static"), name="static")


def sortie_cost(spool_km, price_per_km, drone_base_usd, winding_overhead):
    """Kostnad per sortie. Du betaler for hele spolen, ikke distansen du flyr."""
    fiber = spool_km * price_per_km * (1 + winding_overhead)
    return {"fiber_usd": round(fiber, 2), "total_usd": round(fiber + drone_base_usd, 2),
            "fiber_share": round(fiber / (fiber + drone_base_usd), 3)}


@app.get("/")
def index():
    return FileResponse(ROOT / "static" / "index.html")


@app.get("/api/dataset")
def dataset():
    return DATA


@app.get("/api/prices")
def prices(min_confidence: str = Query("low", pattern="^(derived|low|medium|high)$")):
    rank = {"derived": 0, "low": 1, "medium": 2, "high": 3}
    return [p for p in DATA["fiber_prices"] if rank[p["confidence"]] >= rank[min_confidence]]


@app.get("/api/air-defense")
def air_defense():
    return DATA["air_defense"]


@app.get("/api/sortie-cost")
def sortie(
    spool_km: float = Query(DATA["defaults"]["spool_km"], gt=0, le=100),
    price_old: float = Query(5.5, gt=0),
    price_new: float = Query(33.0, gt=0),
    drone_base_usd: float = Query(DATA["defaults"]["drone_base_usd"], ge=0),
    winding_overhead: float = Query(DATA["defaults"]["winding_overhead"], ge=0, le=5),
    sorties_per_month: int = Query(DATA["defaults"]["sorties_per_month"], ge=0),
    ai_share_of_increase: float = Query(0.0, ge=0, le=1,
                                        description="ANTAGELSE: andel av prisøkningen du tilskriver AI-datasentre"),
):
    old = sortie_cost(spool_km, price_old, drone_base_usd, winding_overhead)
    new = sortie_cost(spool_km, price_new, drone_base_usd, winding_overhead)
    if old["total_usd"] == 0:
        raise HTTPException(400, "Nullkostnad gir ingen mening")
    delta = new["total_usd"] - old["total_usd"]
    return {
        "old": old, "new": new,
        "delta_per_sortie_usd": round(delta, 2),
        "delta_per_month_usd": round(delta * sorties_per_month),
        "ai_attributed_per_sortie_usd": round(delta * ai_share_of_increase, 2),
        "ai_attributed_per_month_usd": round(delta * ai_share_of_increase * sorties_per_month),
        "warning": "ai_share_of_increase er din antagelse. Ingen kilde kvantifiserer AI-andelen av FPV-fiberprisen.",
    }
