"""Start: python3 app.py  →  http://127.0.0.1:8012/  (importerer data/*.csv til minne ved oppstart)"""
import argparse
import os
import sys

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HER, ".."))
import motor as M  # noqa: E402
from felles.web import App, Svar  # noqa: E402


def lag_app(db):
    app = App(os.path.join(HER, "ui"), {"/felles/": os.path.join(HER, "..", "felles", "web")})

    def regel(q, prefiks):
        return {"navn": q.get(prefiks + "navn") or prefiks, "sikkerhetsfaktor": float(q.get(prefiks + "sf", 1)), "ordresyklus_dager": int(q.get(prefiks + "oc", 14))}

    @app.rute("GET", "/api/sammenlign")
    def sammenlign(req):
        a, b = regel(req.query, "a_"), regel(req.query, "b_")
        return {"a": M.replay(db, a), "b": M.replay(db, b)}

    @app.rute("GET", "/api/historikk/{varenr}")
    def hist(req):
        dager, flagg = M.historikk(db, req.params["varenr"])
        return {"dager": dager, "negative": flagg}

    @app.rute("GET", "/api/forslag.csv")
    def forslag(req):
        return Svar(M.bestillingsforslag(db, regel(req.query, "a_"))[1].encode(), 200, "text/csv; charset=utf-8",
                    {"Content-Disposition": "attachment; filename=bestillingsforslag.csv"})
    return app


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8012)))
    arg = a.parse_args()
    db = M.koble()
    M.importer(db, os.path.join(HER, "data", "varer.csv"), os.path.join(HER, "data", "bevegelser.csv"))
    lag_app(db).start(arg.port)
