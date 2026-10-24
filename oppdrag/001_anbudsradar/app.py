"""Start: python3 app.py [--db radar.db] [--idag 2026-10-24]
Importer først: python3 app.py --importer data/import_1.csv data/import_2.csv
"""
import argparse
import datetime as dt
import os
import sys

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HER, ".."))
import radar  # noqa: E402
from felles.web import App, Svar  # noqa: E402


def lag_app(db, profil, idag):
    app = App(os.path.join(HER, "ui"), {"/felles/": os.path.join(HER, "..", "felles", "web")})

    def filtre(q):
        return dict(fagomrade=q.get("fagomrade") or None, sted=q.get("sted") or None,
                    frist_innen=int(q["frist_innen"]) if q.get("frist_innen") else None,
                    vis_utlopte=q.get("vis_utlopte") == "1")

    @app.rute("GET", "/api/oversikt")
    def ov(req):
        rader = radar.oversikt(db, profil, idag, **filtre(req.query))
        imp = [dict(r) for r in db.execute("SELECT * FROM importer ORDER BY id")]
        fag = [r[0] for r in db.execute("SELECT DISTINCT fagområde FROM kunngjoring ORDER BY 1")]
        return {"idag": idag.isoformat(), "profil": profil, "rader": rader, "importer": imp, "fagområder": fag}

    @app.rute("GET", "/api/eksport.csv")
    def eks(req):
        tekst = radar.eksport_prioritering(radar.oversikt(db, profil, idag, **filtre(req.query)))
        return Svar(tekst.encode("utf-8"), 200, "text/csv; charset=utf-8",
                    {"Content-Disposition": "attachment; filename=prioritering.csv"})
    return app


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("--db", default=os.path.join(HER, "radar.db"))
    a.add_argument("--idag", default=dt.date.today().isoformat())
    a.add_argument("--importer", nargs="*")
    a.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8001)))
    arg = a.parse_args()
    db = radar.koble(arg.db)
    if arg.importer:
        for f in arg.importer:
            print(f, radar.importer_csv(db, f))
        sys.exit(0)
    lag_app(db, radar.les_profil(os.path.join(HER, "data", "profil.json")), dt.date.fromisoformat(arg.idag)).start(arg.port)
