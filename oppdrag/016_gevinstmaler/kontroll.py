import json
import os
import statistics as st
import sys

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HER)
sys.path.insert(0, os.path.join(HER, ".."))
import maling as M  # noqa: E402
from app import lag_app  # noqa: E402
from felles.kontroll import kjor  # noqa: E402


def kontroll(k):
    db = M.koble()
    M.importer(db, os.path.join(HER, "data", "malinger.csv"))
    P = json.load(open(os.path.join(HER, "data", "perioder.json"), encoding="utf-8"))
    g = {x["gruppe"]: x for x in M.grupper(db, P)}
    k.lik("to grupper – typene slås ikke sammen automatisk", sorted(g), ["Fakturakontroll", "Tilbudsskriving"])
    fk = g["Fakturakontroll"]
    v = sorted(r[0] for r in db.execute("SELECT varighet_min FROM maling WHERE oppgavetype='Fakturakontroll' AND periode='etter' AND varighet_min IS NOT NULL"))
    k.lik("median etter = uavhengig median", fk["etter"]["median"], st.median(v))
    k.sjekk("ekstremavviket (240 min) flagges", any("240" in a for a in fk["advarsler"]))
    k.sjekk("median er robust mot avviket, gjennomsnittet ikke", fk["etter"]["median"] < fk["for"]["median"] and fk["etter"]["snitt"] > fk["for"]["snitt"],
            f"median {fk['for']['median']}→{fk['etter']['median']}, snitt {fk['for']['snitt']:.2f}→{fk['etter']['snitt']:.2f}")
    k.lik("manglende varigheter telles separat (2 før, 1 etter)", (fk["for"]["manglende_varighet"], fk["etter"]["manglende_varighet"]), (2, 1))
    tb = g["Tilbudsskriving"]
    k.sjekk("lite utvalg flagges for Tilbudsskriving", any("lite utvalg" in a for a in tb["advarsler"]), tb["advarsler"])
    d = tb["dekomponering"]
    k.lik("dekomponering: tid + volum = total", d["tidseffekt_timer_uke"] + d["volumeffekt_timer_uke"], d["total_timer_uke"], 1e-12)
    k.lik("dekomponering: total = timer etter − timer før", d["total_timer_uke"], d["timer_uke_etter"] - d["timer_uke_for"], 1e-12)
    k.lik("Tilbudsskriving: volumeffekt (1 − 2) × 59 / 60", d["volumeffekt_timer_uke"], (1 - 2) * 59 / 60, 1e-12)
    k.sjekk("volumendring skilles fra tidsendring (volum dominerer for Tilbudsskriving)", abs(d["volumeffekt_timer_uke"]) > abs(d["tidseffekt_timer_uke"]))
    k.lik("volum per uke regnes mot periodens 4 uker", (fk["for"]["volum_per_uke"], fk["etter"]["volum_per_uke"]), (32 / 4, 41 / 4))
    o = M.okonomi(fk, 600, 10)
    k.lik("økonomi: (9 − 12) min × 10/uke × 600 kr × 46 uker", round(o["kr_per_aar"], 2), round(10 * 3 / 60 * 600 * 46, 2))
    k.sjekk("økonomi har forbehold om årsak", "ikke dokumentert årsak" in o["forbehold"])
    sammen = M.grupper(db, P, {"Fakturakontroll": "Kontor", "Tilbudsskriving": "Kontor"})
    k.lik("sammenslåing bare ved eksplisitt valg, og bare innen samme målekilde", sorted((x["gruppe"], tuple(x["typer"])) for x in sammen),
          [("Kontor", ("Fakturakontroll",)), ("Kontor", ("Tilbudsskriving",))])
    app = lag_app(db, P)
    k.lik("API krever eksplisitt timesats og volum", app.behandle("POST", "/api/okonomi", json.dumps({"gruppe": "Fakturakontroll", "malekilde": "tidsstempel i fakturasystem"}).encode()).status, 400)
    csv_ = app.behandle("GET", "/api/eksport.csv").kropp.decode()
    os.makedirs(os.path.join(HER, "resultat"), exist_ok=True)
    open(os.path.join(HER, "resultat", "maling.csv"), "w", encoding="utf-8").write(csv_)
    json.dump({x: {"for": g[x]["for"], "etter": g[x]["etter"], "dekomponering": g[x]["dekomponering"], "advarsler": g[x]["advarsler"]} for x in g},
              open(os.path.join(HER, "resultat", "referanse.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    k.lik("eksport: 2 grupper × 2 perioder", len(csv_.strip().splitlines()), 5)


kjor("016 Gevinstmåler", HER, kontroll)
