"""Start: python3 app.py --demo  →  http://127.0.0.1:8014/"""
import argparse
import datetime as dt
import os
import sys

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HER)
sys.path.insert(0, os.path.join(HER, ".."))
import register as R  # noqa: E402
from adaptere import enhetsregisteret as E  # noqa: E402
from felles.web import App, HttpFeil, Svar  # noqa: E402


def last_demo(db):
    R.importer_csv(db, os.path.join(HER, "data", "manuell_liste.csv"), "manuell_liste.csv", "2026-09-15")
    E.importer_json(db, os.path.join(HER, "data", "enhetsregisteret_utdrag.json"), "2026-10-20")


def lag_app(db):
    app = App(os.path.join(HER, "ui"), {"/felles/": os.path.join(HER, "..", "felles", "web")})

    def filtre(q):
        tall = lambda k: int(q[k]) if q.get(k) else None
        return dict(nace=q.get("nace") or None, sted=q.get("sted") or None, min_ansatte=tall("min"), maks_ansatte=tall("maks"), ta_med_ukjent_storrelse=q.get("ukjent") == "1")

    @app.rute("GET", "/api/bedrifter")
    def liste(req):
        alle = R.bedrifter(db)
        avvist = [dict(r) for r in db.execute("SELECT * FROM avvist_rad")]
        return {"bedrifter": R.filtrer(alle, **filtre(req.query)), "totalt": len(alle), "avvist": avvist}

    @app.rute("POST", "/api/kvalifiser/{orgnr}")
    def kval(req):
        b = req.json()
        try:
            R.kvalifiser(db, req.params["orgnr"], b["status"], b.get("grunn", ""), b.get("neste_handling", ""), b.get("frist", ""), dt.datetime.now().isoformat(timespec="seconds"))
        except ValueError as e:
            raise HttpFeil(400, str(e))
        return {"ok": True}

    @app.rute("GET", "/api/eksport.csv")
    def eks(req):
        return Svar(R.eksport_csv(R.filtrer(R.bedrifter(db), **filtre(req.query))).encode(), 200, "text/csv; charset=utf-8", {"Content-Disposition": "attachment; filename=prospekter.csv"})
    return app


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("--db", default=os.path.join(HER, "prospekter.db"))
    a.add_argument("--demo", action="store_true")
    a.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8014)))
    arg = a.parse_args()
    if arg.demo and os.path.exists(arg.db):
        os.remove(arg.db)
    db = R.koble(arg.db)
    if arg.demo:
        last_demo(db)
    lag_app(db).start(arg.port)
