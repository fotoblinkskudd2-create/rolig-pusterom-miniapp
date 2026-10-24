"""FastAPI-backend.  Start: python3 app.py [--db marginvakt.db] [--demo]"""
import argparse
import json
import os

from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import motor

HER = os.path.dirname(os.path.abspath(__file__))


class Timer(BaseModel):
    prosjekt: str
    aktivitet: str
    dato: str
    timer: float


class Kostnad(BaseModel):
    prosjekt: str
    type: str
    beskrivelse: str = ""
    belop: float
    dato: str = ""


class Versjon(BaseModel):
    pris: float
    gyldig_fra: str
    merknad: str = ""


class Sats(BaseModel):
    gyldig_fra: str
    kr_per_time: float


def lag_app(db):
    # async-endepunkter kjører i event-loopen, så den delte SQLite-tilkoblingen brukes fra én tråd om gangen.
    app = FastAPI(title="Marginvakt (lokal demo)")

    @app.get("/api/prosjekter")
    async def prosjekter():
        return [motor.nokkeltall(db, r["id"]) for r in db.execute("SELECT id FROM prosjekt ORDER BY id")]

    @app.get("/api/prosjekter/{pid}")
    async def prosjekt(pid: str, versjon: int | None = None):
        try:
            return motor.nokkeltall(db, pid, versjon)
        except KeyError:
            raise HTTPException(404, "ukjent prosjekt")

    @app.post("/api/timer")
    async def ny_timer(t: Timer):
        db.execute("INSERT INTO timer(prosjekt_id, aktivitet, dato, timer) VALUES(?,?,?,?)", (t.prosjekt, t.aktivitet, t.dato, t.timer))
        db.commit()
        return motor.nokkeltall(db, t.prosjekt)

    @app.post("/api/kostnader")
    async def ny_kostnad(k: Kostnad):
        if k.type not in ("underleverandør", "annen", "refusjon"):
            raise HTTPException(400, "type må være underleverandør, annen eller refusjon")
        db.execute("INSERT INTO kostnad(prosjekt_id, type, beskrivelse, belop, dato) VALUES(?,?,?,?,?)", (k.prosjekt, k.type, k.beskrivelse, k.belop, k.dato))
        db.commit()
        return motor.nokkeltall(db, k.prosjekt)

    @app.post("/api/prosjekter/{pid}/versjoner")
    async def ny_versjon(pid: str, v: Versjon):
        return {"versjon": motor.ny_prosjektversjon(db, pid, v.pris, v.gyldig_fra, v.merknad)}

    @app.get("/api/prosjekter/{pid}/versjoner")
    async def versjoner(pid: str):
        return [dict(r) for r in db.execute("SELECT * FROM prosjektversjon WHERE prosjekt_id=? ORDER BY versjon", (pid,))]

    @app.get("/api/satser")
    async def satser():
        return [dict(r) for r in db.execute("SELECT * FROM sats ORDER BY gyldig_fra")]

    @app.post("/api/satser")
    async def ny_sats(s: Sats):
        db.execute("INSERT INTO sats(gyldig_fra, kr_per_time) VALUES(?,?)", (s.gyldig_fra, s.kr_per_time))
        db.commit()
        return await satser()

    @app.get("/api/grenser")
    async def hent_grenser():
        return motor.grenser(db)

    @app.put("/api/grenser")
    async def sett_grenser(g: dict[str, float]):
        for k, v in g.items():
            db.execute("INSERT OR REPLACE INTO grense VALUES(?,?)", (k, v))
        db.commit()
        return motor.grenser(db)

    @app.post("/api/prosjekter/{pid}/rapporter")
    async def rapport(pid: str):
        return {"id": motor.lag_rapport(db, pid)}

    @app.get("/api/prosjekter/{pid}/rapporter")
    async def rapporter(pid: str):
        return [{"id": r["id"], "laget": r["laget"], **json.loads(r["innhold"])} for r in db.execute("SELECT * FROM rapport WHERE prosjekt_id=? ORDER BY id", (pid,))]

    @app.post("/api/import")
    async def imp(data: dict):
        motor.importer(db, data)
        return {"ok": True}

    @app.get("/api/eksport.csv", response_class=PlainTextResponse)
    async def eksport():
        linjer = ["prosjekt;versjon;inntekt;direkte_kostnader;refusjoner;dekningsbidrag;faktiske_timer;effektiv_timeinntekt;internkost_timer;resultat_etter_egen_tid;varsler"]
        for n in await prosjekter():
            linjer.append(";".join(str(x) for x in [n["prosjekt"]["id"], n["versjon"], n["inntekt"], n["direkte_kostnader"], n["refusjoner"], n["dekningsbidrag"],
                                                    n["faktiske_timer"], "" if n["effektiv_timeinntekt"] is None else round(n["effektiv_timeinntekt"], 2),
                                                    round(n["internkost_timer"], 2), round(n["resultat_etter_egen_tid"], 2), " | ".join(n["varsler"])]))
        return "\n".join(linjer) + "\n"

    app.mount("/felles", StaticFiles(directory=os.path.join(HER, "..", "felles", "web")), name="felles")
    app.mount("/", StaticFiles(directory=os.path.join(HER, "ui"), html=True), name="ui")
    return app


if __name__ == "__main__":
    import uvicorn
    a = argparse.ArgumentParser()
    a.add_argument("--db", default=os.path.join(HER, "marginvakt.db"))
    a.add_argument("--demo", action="store_true", help="tøm og last data/demo.json")
    a.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8006)))
    arg = a.parse_args()
    if arg.demo and os.path.exists(arg.db):
        os.remove(arg.db)
    db = motor.koble(arg.db)
    if arg.demo:
        motor.importer(db, json.load(open(os.path.join(HER, "data", "demo.json"), encoding="utf-8")))
    print(f"Lokal demo: http://127.0.0.1:{arg.port}/")
    uvicorn.run(lag_app(db), host="127.0.0.1", port=arg.port, log_level="warning")
