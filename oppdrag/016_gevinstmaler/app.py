"""Start: python3 app.py  →  http://127.0.0.1:8016/   (importerer data/malinger.csv; egen CSV kan lastes opp i grensesnittet)"""
import argparse
import csv
import io
import json
import os
import sys
import tempfile

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HER, ".."))
import maling as M  # noqa: E402
from felles.web import App, HttpFeil, Svar  # noqa: E402


def lag_app(db, perioder):
    app = App(os.path.join(HER, "ui"), {"/felles/": os.path.join(HER, "..", "felles", "web")})
    tilstand = {"slaa_sammen": None}

    @app.rute("GET", "/api/grupper")
    def gr(req):
        totalt = db.execute("SELECT count(*) FROM maling").fetchone()[0]
        g = M.grupper(db, perioder, tilstand["slaa_sammen"])
        brukt = sum(x["for"]["registrert"] + x["etter"]["registrert"] for x in g)
        return {"grupper": g, "perioder": perioder, "forbehold": M.FORBEHOLD, "rader_totalt": totalt, "rader_utenfor_perioder": totalt - brukt,
                "min_n": M.MIN_N, "slaa_sammen": tilstand["slaa_sammen"]}

    @app.rute("POST", "/api/slaa_sammen")
    def slaa(req):
        tilstand["slaa_sammen"] = req.json() or None  # eksplisitt brukervalg, f.eks. {"Fakturakontroll": "Alt kontor", "Tilbudsskriving": "Alt kontor"}
        return {"ok": True}

    @app.rute("POST", "/api/okonomi")
    def ok(req):
        b = req.json()
        g = next((x for x in M.grupper(db, perioder, tilstand["slaa_sammen"]) if x["gruppe"] == b["gruppe"] and x["malekilde"] == b["malekilde"]), None)
        if g is None:
            raise HttpFeil(404, "ukjent gruppe")
        if not (b.get("timesats") and b.get("volum_per_uke")):
            raise HttpFeil(400, "timesats og volum må velges eksplisitt")
        return M.okonomi(g, float(b["timesats"]), float(b["volum_per_uke"]))

    @app.rute("POST", "/api/import")
    def imp(req):
        with tempfile.NamedTemporaryFile("w", suffix=".csv", delete=False, encoding="utf-8") as f:
            f.write(req.raa.decode("utf-8"))
        try:
            db.execute("DELETE FROM maling")
            M.importer(db, f.name)
        except (KeyError, ValueError) as e:
            raise HttpFeil(400, f"ugyldig CSV: {e}")
        return {"ok": True}

    @app.rute("GET", "/api/eksport.csv")
    def eks(req):
        buf = io.StringIO()
        w = csv.writer(buf)
        w.writerow(["gruppe", "malekilde", "periode", "n", "manglende", "median", "q1", "q3", "min", "maks", "snitt", "feil_per_100", "volum_per_uke", "advarsler"])
        for g in M.grupper(db, perioder, tilstand["slaa_sammen"]):
            for p, s in (("før", g["for"]), ("etter", g["etter"])):
                w.writerow([g["gruppe"], g["malekilde"], p, s["n"], s["manglende_varighet"], s["median"], s["q1"], s["q3"], s["min"], s["maks"],
                            None if s["snitt"] is None else round(s["snitt"], 2), None if s["feil_per_100"] is None else round(s["feil_per_100"], 1), round(s["volum_per_uke"], 2), " | ".join(g["advarsler"])])
        return Svar(buf.getvalue().encode(), 200, "text/csv; charset=utf-8", {"Content-Disposition": "attachment; filename=maling.csv"})
    return app


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8016)))
    arg = a.parse_args()
    db = M.koble()
    M.importer(db, os.path.join(HER, "data", "malinger.csv"))
    lag_app(db, json.load(open(os.path.join(HER, "data", "perioder.json"), encoding="utf-8"))).start(arg.port)
