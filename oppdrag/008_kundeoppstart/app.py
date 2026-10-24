"""Start: python3 app.py --demo   →  http://127.0.0.1:8008/"""
import argparse
import base64
import json
import os
import shutil

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from motor import Avvist, Motor

HER = os.path.dirname(os.path.abspath(__file__))


def pdf_stub(tekst):
    """Minimal syntetisk PDF-lignende fil for demoen."""
    return f"%PDF-1.4\n% syntetisk demodokument: {tekst}\n%%EOF\n".encode()


def last_demo(m):
    m.opprett(json.load(open(os.path.join(HER, "data", "sak.json"), encoding="utf-8")))
    m.last_opp("D1", "avtale_signert.pdf", pdf_stub("signert avtale"))
    m.behandle("D1", 1, True)
    m.last_opp("D2", "plantegning.png", b"\x89PNG syntetisk" + b"0" * 1000)
    m.behandle("D2", 1, True)
    m.last_opp("D3", "effekt_uke42.csv", b"tid;kW\n2026-10-19T00:00;42.1\n2026-10-19T01:00;40.3\n")
    m.behandle("D3", 1, True)
    # D4 og D6 mangler (to obligatoriske mangler). D5 er valgfri.


class Opplasting(BaseModel):
    filnavn: str
    innhold_base64: str


class Behandling(BaseModel):
    godkjenn: bool
    grunn: str = ""


def lag_app(m: Motor):
    app = FastAPI(title="Kundeoppstart (lokal demo)")

    def feil(e):
        raise HTTPException(400 if isinstance(e, Avvist) else 404, str(e))

    @app.get("/api/saker/{sid}")
    async def oversikt(sid: str):
        return m.oversikt(sid)

    @app.post("/api/krav/{kid}/filer")
    async def last_opp(kid: str, o: Opplasting):
        try:
            return {"versjon": m.last_opp(kid, o.filnavn, base64.b64decode(o.innhold_base64))}
        except (Avvist, KeyError) as e:
            feil(e)

    @app.post("/api/krav/{kid}/filer/{v}/behandling")
    async def behandle(kid: str, v: int, b: Behandling):
        try:
            m.behandle(kid, v, b.godkjenn, b.grunn)
            return {"ok": True}
        except (Avvist, KeyError) as e:
            feil(e)

    @app.post("/api/saker/{sid}/ferdigstill")
    async def ferdigstill(sid: str):
        try:
            m.ferdigstill(sid)
            return {"ok": True}
        except Avvist as e:
            feil(e)

    @app.get("/api/saker/{sid}/overlevering.zip")
    async def pakke(sid: str):
        try:
            return Response(m.overleveringspakke(sid), media_type="application/zip",
                            headers={"Content-Disposition": f"attachment; filename=overlevering_{sid}.zip"})
        except Avvist as e:
            feil(e)

    app.mount("/felles", StaticFiles(directory=os.path.join(HER, "..", "felles", "web")), name="felles")
    app.mount("/", StaticFiles(directory=os.path.join(HER, "ui"), html=True), name="ui")
    return app


if __name__ == "__main__":
    import uvicorn
    a = argparse.ArgumentParser()
    a.add_argument("--data", default=os.path.join(HER, "lokal_data"))
    a.add_argument("--demo", action="store_true")
    a.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8008)))
    arg = a.parse_args()
    if arg.demo:
        shutil.rmtree(arg.data, ignore_errors=True)
    os.makedirs(arg.data, exist_ok=True)
    m = Motor(os.path.join(arg.data, "oppstart.db"), os.path.join(arg.data, "lager"))
    if arg.demo:
        last_demo(m)
    print(f"Lokal demo: http://127.0.0.1:{arg.port}/")
    uvicorn.run(lag_app(m), host="127.0.0.1", port=arg.port, log_level="warning")
