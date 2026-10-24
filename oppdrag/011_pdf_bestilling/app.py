"""Start: python3 app.py  →  http://127.0.0.1:8011/   (arbeidsfiler i arbeid/)"""
import argparse
import json
import os
import subprocess
import sys

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HER, ".."))
import uttrekk as U  # noqa: E402
from felles.web import App, HttpFeil, Svar  # noqa: E402


def lag_app(data, arbeid):
    os.makedirs(arbeid, exist_ok=True)
    app = App(os.path.join(HER, "ui"), {"/felles/": os.path.join(HER, "..", "felles", "web")})

    def sti(fil):
        if "/" in fil or not fil.endswith(".pdf") or not os.path.exists(os.path.join(data, fil)):
            raise HttpFeil(404, "ukjent dokument")
        return os.path.join(arbeid, fil + ".json")

    def hent(fil):
        s = sti(fil)
        if not os.path.exists(s):
            lagre(fil, U.trekk_ut(os.path.join(data, fil), kjor_ocr=False))
        return json.load(open(s, encoding="utf-8"))

    def lagre(fil, dok):
        json.dump(dok, open(sti(fil), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        return dok

    @app.rute("GET", "/api/dokumenter")
    def dokumenter(req):
        return sorted(f for f in os.listdir(data) if f.endswith(".pdf"))

    @app.rute("GET", "/api/dok/{fil}")
    def dok(req):
        return hent(req.params["fil"])

    @app.rute("POST", "/api/dok/{fil}/ocr")
    def ocr(req):
        fil = req.params["fil"]
        return lagre(fil, U.trekk_ut(os.path.join(data, fil), kjor_ocr=True))

    @app.rute("POST", "/api/dok/{fil}/rett")
    def rett(req):
        d, b = hent(req.params["fil"]), req.json()
        try:
            U.rett(d, b["linje"], b["felt"], b["verdi"])
        except ValueError as e:
            raise HttpFeil(400, str(e))
        return lagre(req.params["fil"], d)

    @app.rute("POST", "/api/dok/{fil}/status")
    def status(req):
        d, b = hent(req.params["fil"]), req.json()
        try:
            U.sett_status(d, b["linje"], b["status"])
        except ValueError as e:
            raise HttpFeil(400, str(e))
        return lagre(req.params["fil"], d)

    @app.rute("POST", "/api/dok/{fil}/nullstill")
    def nullstill(req):
        os.remove(sti(req.params["fil"]))
        return hent(req.params["fil"])

    @app.rute("GET", "/api/dok/{fil}/eksport.{fmt}")
    def eks(req):
        e = U.eksport(hent(req.params["fil"]))
        if req.params["fmt"] == "csv":
            return Svar(e["csv"].encode(), 200, "text/csv; charset=utf-8", {"Content-Disposition": f"attachment; filename={req.params['fil']}.csv"})
        return Svar(json.dumps(e["json"], ensure_ascii=False, indent=1).encode(), 200, "application/json", {"Content-Disposition": f"attachment; filename={req.params['fil']}.json"})

    @app.rute("GET", "/api/side/{fil}/{n}")
    def side(req):
        fil, n = req.params["fil"], int(req.params["n"])
        sti(fil)
        png = os.path.join(arbeid, f"{fil}.s{n}.png")
        if not os.path.exists(png):
            subprocess.run(["pdftoppm", "-r", "100", "-f", str(n), "-l", str(n), "-png", "-singlefile", os.path.join(data, fil), png[:-4]], check=True)
        return Svar(open(png, "rb").read(), 200, "image/png")
    return app


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("--arbeid", default=os.path.join(HER, "arbeid"))
    a.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8011)))
    arg = a.parse_args()
    lag_app(os.path.join(HER, "data"), arg.arbeid).start(arg.port)
