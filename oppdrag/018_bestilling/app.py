"""Start: python3 app.py --demo  →  http://127.0.0.1:8018/
Endepunktene er synkrone og kjører i FastAPIs trådbasseng med én SQLite-tilkobling per forespørsel,
så samtidige forespørsler faktisk konkurrerer om låsene."""
import argparse
import datetime as dt
import os

from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import booking as B

HER = os.path.dirname(os.path.abspath(__file__))


class Reservasjon(BaseModel):
    tjeneste: str
    start: str
    kunde: str


def lag_app(db_sti, klokke=lambda: dt.datetime.now().isoformat(timespec="seconds")):
    app = FastAPI(title="Bestilling (lokal demo)")

    def db():
        return B.koble(db_sti)

    def kjor(f, *a):
        c = db()
        try:
            return f(c, *a)
        except B.Avvist as e:
            raise HTTPException(409, str(e))
        finally:
            c.close()

    @app.get("/api/tjenester")
    def tjenester():
        return {"tjenester": B.TJENESTER, "ressurser": B.RESSURSER, "naa": klokke()}

    @app.get("/api/ledige")
    def ledige(tjeneste: str, dag: str):
        return kjor(B.ledige_starter, tjeneste, dag, klokke())

    @app.post("/api/reservasjoner")
    def reserver(r: Reservasjon):
        return kjor(B.reserver, r.tjeneste, r.start, r.kunde, klokke())

    @app.post("/api/reservasjoner/{bid}/bekreft")
    def bekreft(bid: str):
        kjor(B.bekreft, bid, klokke())
        return {"ok": True}

    @app.post("/api/reservasjoner/{bid}/avbestill")
    def avbestill(bid: str):
        return {"frigjorte_blokker": kjor(B.avbestill, bid, klokke())}

    @app.get("/api/bestillinger")
    def bestillinger():
        c = db()
        try:
            B.rydd_utlopte(c, klokke())
            return [dict(r) for r in c.execute("SELECT * FROM bestilling ORDER BY start")]
        finally:
            c.close()

    @app.get("/api/eksport.csv", response_class=PlainTextResponse)
    def eksport():
        return kjor(lambda c: B.eksport_csv(c))

    app.mount("/felles", StaticFiles(directory=os.path.join(HER, "..", "felles", "web")), name="felles")
    app.mount("/", StaticFiles(directory=os.path.join(HER, "ui"), html=True), name="ui")
    return app


if __name__ == "__main__":
    import uvicorn
    a = argparse.ArgumentParser()
    a.add_argument("--db", default=os.path.join(HER, "bestilling.db"))
    a.add_argument("--demo", action="store_true")
    a.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8018)))
    arg = a.parse_args()
    if arg.demo:
        for s in ("", "-wal", "-shm"):
            if os.path.exists(arg.db + s):
                os.remove(arg.db + s)
        B.demo(B.koble(arg.db))
    print(f"Lokal demo: http://127.0.0.1:{arg.port}/")
    uvicorn.run(lag_app(arg.db), host="127.0.0.1", port=arg.port, log_level="warning")
