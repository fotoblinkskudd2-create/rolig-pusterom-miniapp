#!/usr/bin/env python3
"""Sammenlign systemvarianter i tre scenarier (mid, pessimistisk, hjemmetjeneste) og skriv varianter.md.
Kjør: python3 produkter/hoyteknologisk_eldreomsorg_inspirert/varianter.py"""
import importlib.util
import json
import os

HER = os.path.dirname(os.path.abspath(__file__))
BESTE = json.load(open(os.path.join(HER, "beste.json")))[0]["design"]


def last(pessimisme="1.0", setting="sykehjem"):
    os.environ["ELDRE_PESSIMISME"], os.environ["ELDRE_SETTING"] = pessimisme, setting
    spec = importlib.util.spec_from_file_location("problem_v", os.path.join(HER, "problem.py"))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def varianter(p):
    ref = {k: v for k, v in p.REFERANSE.items() if not k.startswith("_")}
    kjerne = dict(BESTE, selskap="ingen", drikke="ingen", forflytning="takheis", lav_seng_matte=False,
                  hoftebeskytter=False, hal=False)
    return [
        ("A Dagens praksis (fast 2 t-runde)", dict(p.DAGENS)),
        ("B Radar-tilsyn, tid tatt ut som kutt (referanse)", ref),
        ("C «Stille vakt» kjerne", kjerne),
        ("D «Stille vakt» full (beste.json: + kosedyr, smartkopp, Resyone)", dict(BESTE)),
        ("P «Stille vakt» pilot (anbefalt: kjerne + kosedyr)", dict(kjerne, selskap="kosedyr")),
        ("E Kjerne med radar i kantmodul (SV-1R)", dict(kjerne, sensor="kombi", maaleintervall_s=1.0)),
        ("F Kjerne, men all frigjort tid tas ut som kutt", dict(kjerne, kontaktandel=0.0)),
        ("G Japansk robotpakke (kamera m/samtykke, PARO, Resyone, HAL, DFree)",
         dict(ref, sensor="kamera_samtykke", terskel=2.0, nattrunde="behovsstyrt", selskap="paro",
              forflytning="resyone", hal=True, toalett="dfree", kontaktandel=0.5)),
        ("H Kontakttid uten sensor (fast 3 t + MOBID-2 + kontakt)",
         dict(kjerne, sensor="ingen", nattrunde="fast_3t")),
    ]


KOL = [("_qaly_per_100", "QALY/100/år"), ("_netto_kommune_kr_per_beboer", "Netto kommune kr/beb/år"),
       ("_netto_samfunn_kr_per_beboer", "Netto samfunn kr/beb/år"), ("_icer_kr_per_qaly", "ICER kr/QALY"),
       ("_fall_per_1000_dogn", "Fall/1000 døgn"), ("_hoftebrudd_per_100", "Hoftebrudd/100/år"),
       ("_frigjort_t_per_beboer", "Frigjort t/beb/år"), ("_kontakt_min_dogn", "Kontakt min/døgn"),
       ("_falske_alarmer_beboer_natt", "Falske alarmer/beb/natt")]


def tabell(p, tittel):
    ut = [f"### {tittel}", "", "| Variant | Poeng | " + " | ".join(k[1] for k in KOL) + " |",
          "|---|---|" + "---|" * len(KOL)]
    from maskin import Maskin
    m = Maskin(p, "livskvalitet_per_krone")
    for navn, d in varianter(p):
        d = p.rydd(dict(d))
        s = p.score(d)
        icer = s["_icer_kr_per_qaly"]
        verdier = []
        for k, _ in KOL:
            v = s[k]
            if k == "_icer_kr_per_qaly":
                v = "dominant (sparer)" if s["_netto_samfunn_kr_per_beboer"] <= 0 and s["_qaly_per_100"] > 0.05 else ("–" if icer < 0 else f"{icer:,.0f}".replace(",", " "))
            elif isinstance(v, float):
                v = f"{v:.2f}" if abs(v) < 100 else f"{v:,.0f}".replace(",", " ")
            else:
                v = f"{v:,}".replace(",", " ")
            verdier.append(str(v))
        ut.append(f"| {navn} | {m.poeng(d):.3f} | " + " | ".join(verdier) + " |")
    return "\n".join(ut) + "\n"


def qaly_kilder(p):
    d = p.rydd(dict(BESTE, drikke="ingen", forflytning="takheis"))     # pilotvarianten P
    r = p.simuler(d)
    linjer = ["| Kilde | QALY/100/år | Andel |", "|---|---|---|"]
    tot = r["qaly"]
    for k, v in sorted(r["q"].items(), key=lambda x: -x[1]):
        linjer.append(f"| {k} | {v:.2f} | {v / tot * 100:.0f} % |")
    linjer += ["", "| Kostnadspost | NOK/år per 100 beboere |", "|---|---|"]
    for k, v in sorted(r["kost"].items(), key=lambda x: -x[1]):
        if v:
            linjer.append(f"| {k} | {v:,.0f} |".replace(",", " "))
    linjer.append(f"| **Brutto** | **{r['brutto']:,.0f}** |".replace(",", " "))
    return "\n".join(linjer) + "\n"


if __name__ == "__main__":
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(HER)))
    deler = ["# Systemvarianter – modellresultater [modell]", "",
             "Generert av `varianter.py` fra `problem.py` og `beste.json`. Alle tall er `[modell]` og bygger på "
             "antakelsene i `problem.py`. Ingenting er målt. Netto kostnad < 0 betyr at varianten sparer penger.", ""]
    deler.append(tabell(last(), "Sykehjem, mid (nominelle antakelser)"))
    deler.append(tabell(last("1.3"), "Sykehjem, pessimistisk (effekter / 1,3, kost og tidsbruk × 1,3)"))
    deler.append(tabell(last("1.0", "hjemme"), "Hjemmetjeneste (100 brukere med nattlig tilsyn), mid"))
    deler.append("### Hvor kommer QALY-gevinsten fra? (pilotvariant P, sykehjem, mid)\n")
    deler.append(qaly_kilder(last()))
    open(os.path.join(HER, "varianter.md"), "w").write("\n".join(deler))
    print("\n".join(deler))
