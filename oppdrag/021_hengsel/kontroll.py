import json
import os
import sys

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HER)
sys.path.insert(0, os.path.join(HER, ".."))
import hengsel as H  # noqa: E402
from felles.kontroll import kjor  # noqa: E402


def kontroll(k):
    for d in (3, 4, 5):
        sti = os.path.join(HER, "resultat", f"aksel_{d}mm", "rapport.json")
        if not os.path.exists(sti):
            k.sjekk(f"{d} mm: rapport finnes (kjør generer.py)", False)
            continue
        r = json.load(open(sti))
        for navn, v in r["deler"].items():
            k.sjekk(f"{d} mm {navn}: ett gyldig, lukket legeme", v["legeme"]["ok"] and v["legeme"]["legemer"] == 1, v["legeme"])
            k.sjekk(f"{d} mm {navn}: STL vanntett, STEP åpnes igjen med samme volum", v["stl"]["vanntett"] and v["step"]["ok"], f"STL {v['stl']['volum']:.1f} / STEP {v['step']['volum']:.1f} mm³")
        p = r["parametre"]
        innen = [b for b in r["bevegelse"] if b["theta"] <= p["stoppvinkel"]]
        k.sjekk(f"{d} mm: ingen kollisjon A–B og aksling–B for θ = 0…{p['stoppvinkel']:g}° (5°-steg)", all(b["a_b"] == 0 and b["aksling_b"] == 0 for b in innen), len(innen))
        forbi = [b for b in r["bevegelse"] if b["theta"] > p["stoppvinkel"]]
        k.sjekk(f"{d} mm: stoppet griper når θ passerer stoppvinkelen", all(b["a_b"] > 0 for b in forbi), [(b["theta"], b["a_b"]) for b in forbi])
        k.lik(f"{d} mm: akslingen kolliderer ikke med blad A", r["aksling_a"], 0.0)
        k.lik(f"{d} mm: knokeradius følger akseldiameter (d/2 + klaring + vegg)", r["knokeradius"], d / 2 + p["klaring"] + p["veggtykkelse_knoke"], 1e-9)
        k.sjekk(f"{d} mm: utskiftbar aksling er egen fil", os.path.exists(os.path.join(HER, "resultat", f"aksel_{d}mm", "aksling.step")))
    p = H.les()
    k.lik("parameterfil: bladlengde 40 mm og aksling 4 mm (forsøksmål)", (p["bladlengde"], p["akseldiameter"]), (40.0, 4.0))
    for f in ("eksplodert.png", "bevegelse.gif", "sammenstilling_90grader.step"):
        k.sjekk(f"4 mm: {f} generert", os.path.exists(os.path.join(HER, "resultat", "aksel_4mm", f)))


kjor("021 Parametrisk hengsel", HER, kontroll)
