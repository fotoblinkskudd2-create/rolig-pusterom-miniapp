"""Start: python3 app.py --demo  →  http://127.0.0.1:8020/"""
import argparse
import os
import sys
import tempfile

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HER, ".."))
import lisens as L  # noqa: E402
from demo import last_demo  # noqa: E402
from felles.web import App, HttpFeil, Svar  # noqa: E402


def lag_app(db):
    app = App(os.path.join(HER, "ui"), {"/felles/": os.path.join(HER, "..", "felles", "web")})

    @app.rute("GET", "/api/oversikter")
    def ov(req):
        return {"oversikter": [dict(r) for r in db.execute("SELECT * FROM oversikt ORDER BY id")], "forbehold": L.FORBEHOLD}

    @app.rute("GET", "/api/oversikter/{oid}")
    def en(req):
        oid = int(req.params["oid"])
        return {"komponenter": L.komponenter(db, oid), "ko": L.arbeidsko(db, oid)}

    @app.rute("POST", "/api/oversikter/{oid}/komponent")
    def komp(req):
        b = req.json()
        try:
            L.legg_til(db, int(req.params["oid"]), b["type"], b["navn"], b["versjon"], b.get("lisens"), b.get("lisens_kilde") or "manuelt", b.get("kilde", ""), b.get("attribusjon") or None)
        except PermissionError as e:
            raise HttpFeil(409, str(e))
        return {"ok": True}

    @app.rute("POST", "/api/oversikter/{oid}/las")
    def las(req):
        L.las(db, int(req.params["oid"]))
        return {"ok": True}

    @app.rute("POST", "/api/oversikter")
    def ny(req):
        b = req.json()
        try:
            return {"id": L.ny_oversikt(db, b["leveranse"], b["revisjon"])}
        except Exception as e:
            raise HttpFeil(400, str(e))

    @app.rute("POST", "/api/oversikter/{oid}/import/{fil}")
    def imp(req):
        oid = int(req.params["oid"])
        with tempfile.TemporaryDirectory() as t:
            sti = os.path.join(t, os.path.basename(req.params["fil"]))
            open(sti, "wb").write(req.raa)
            try:
                n = L.importer_package_lock(db, oid, sti) if sti.endswith("package-lock.json") else L.importer_requirements(db, oid, sti)
            except PermissionError as e:
                raise HttpFeil(409, str(e))
        return {"importert": n}

    @app.rute("GET", "/api/sammenlign")
    def sml(req):
        return L.sammenlign(db, int(req.query["a"]), int(req.query["b"]))

    @app.rute("GET", "/api/oversikter/{oid}/attribusjon.txt")
    def att(req):
        return Svar(L.attribusjonsfil(db, int(req.params["oid"])).encode(), 200, "text/plain; charset=utf-8", {"Content-Disposition": "attachment; filename=TREDJEPART.txt"})
    return app


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("--db", default=os.path.join(HER, "lisens.db"))
    a.add_argument("--demo", action="store_true")
    a.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8020)))
    arg = a.parse_args()
    if arg.demo and os.path.exists(arg.db):
        os.remove(arg.db)
    db = L.koble(arg.db)
    if arg.demo:
        last_demo(db)
    lag_app(db).start(arg.port)
