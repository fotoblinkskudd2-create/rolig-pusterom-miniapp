"""Start: python3 app.py --demo [--idag 2026-10-24]  →  http://127.0.0.1:8009/"""
import argparse
import datetime as dt
import json
import os
import sys

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HER, ".."))
import avtaler as A  # noqa: E402
from felles.web import App, HttpFeil, Svar  # noqa: E402


def last_demo(db):
    for a in json.load(open(os.path.join(HER, "data", "avtaler.json"), encoding="utf-8")):
        A.opprett(db, a, "2026-10-01T09:00:00")


def lag_app(db, idag, klokke):
    app = App(os.path.join(HER, "ui"), {"/felles/": os.path.join(HER, "..", "felles", "web")})

    @app.rute("GET", "/api/avtaler")
    def alle(req):
        return {"idag": idag.isoformat(), "avtaler": A.oversikt(db, idag), "ko": A.arbeidsko(db, idag)}

    @app.rute("GET", "/api/avtaler/{aid}/historikk")
    def hist(req):
        return A.historikk(db, req.params["aid"])

    @app.rute("POST", "/api/avtaler/{aid}/endre")
    def endre(req):
        d = req.json()
        try:
            A.endre(db, req.params["aid"], d["endringer"], klokke(), d.get("av", "bruker"))
        except ValueError as e:
            raise HttpFeil(400, str(e))
        return {"ok": True}

    @app.rute("POST", "/api/avtaler/{aid}/bekreft")
    def bekreft(req):
        A.bekreft(db, req.params["aid"], req.json().get("av", "bruker"), klokke())
        return {"ok": True}

    @app.rute("GET", "/api/kalender.ics")
    def kal(req):
        ider = set((req.query.get("ider") or "").split(",")) - {""}
        valgt = [a for a in A.oversikt(db, idag) if (not ider or a["id"] in ider) and a["status"] != "avsluttet"]
        return Svar(A.ics(valgt, dt.datetime.now(dt.timezone.utc)).encode(), 200, "text/calendar; charset=utf-8",
                    {"Content-Disposition": "attachment; filename=avtalefrister.ics"})
    return app


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("--db", default=os.path.join(HER, "avtaler.db"))
    a.add_argument("--demo", action="store_true")
    a.add_argument("--idag", default=dt.date.today().isoformat())
    a.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8009)))
    arg = a.parse_args()
    if arg.demo and os.path.exists(arg.db):
        os.remove(arg.db)
    db = A.koble(arg.db)
    if arg.demo:
        last_demo(db)
    lag_app(db, dt.date.fromisoformat(arg.idag), lambda: dt.datetime.now().isoformat(timespec="seconds")).start(arg.port)
