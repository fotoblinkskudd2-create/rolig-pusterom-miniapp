import json
import os
import sys

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HER, ".."))
import avstem  # noqa: E402
from felles.kontroll import kjor  # noqa: E402


def kontroll(k):
    ordre = avstem.les(os.path.join(HER, "data", "ordre.csv"), "ordre")
    faktura = avstem.les(os.path.join(HER, "data", "faktura.csv"), "faktura")
    k.lik("40 fakturalinjer lest", len(faktura), 40)
    funn = avstem.avstem(ordre, faktura)
    avstem.skriv_rapport(funn, os.path.join(HER, "resultat"))
    fasit = json.load(open(os.path.join(HER, "data", "fasit.json"), encoding="utf-8"))
    faktisk = {str(f["kilde_rad"]): f for f in funn}
    feil = [(rad, v["forventet"], faktisk[rad]["status"]) for rad, v in fasit.items() if faktisk[rad]["status"] != v["forventet"]]
    k.sjekk("alle 40 linjer samsvarer med fasit", not feil, feil)
    tell = lambda s: sum(1 for f in funn if f["status"] == s)
    k.lik("fem kjente avvik funnet (4 bekreftet + 1 mulig)", (tell("bekreftet_avvik"), tell("mulig_avvik")), (4, 1))
    k.lik("to tvetydige tilfeller er uavklart", tell("uavklart"), 2)
    a1 = next(f for f in funn if f["fakturanr"] == "F7001")
    k.sjekk("uavklart med to kandidater navngir begge", "PO-3001" in a1["grunner"][0] and "PO-3002" in a1["grunner"][0], a1["grunner"])
    # Like beløp hos ulike leverandører
    like = [f for f in funn if f["belop"] == 1000.0]
    k.sjekk("like beløp (1000,00) hos ulike leverandører er ikke duplikater",
            len(like) >= 2 and len({f["leverandor_orgnr"] for f in like}) == len(like) and all(f["status"] == "ok" for f in like),
            [(f["fakturanr"], f["leverandor"], f["status"]) for f in like])
    dup = next(f for f in funn if f["matchtype"] == "duplikat")
    k.sjekk("duplikat viser hvilken rad det dupliserer", "rad 12" in dup["grunner"][0], dup["grunner"])
    k.sjekk("alle funn har kildefil og radnummer", all(f["kilde_fil"] == "faktura.csv" and f["kilde_rad"] >= 2 for f in funn))
    k.sjekk("sikker match viser ordrefilens radnummer", all(f["ordre_rad"] for f in funn if f["matchtype"] == "sikker"))
    tiln = next(f for f in funn if f["status"] == "ok_tilnaermet")
    k.lik("tilnærmet match finner riktig ordre", tiln["ordrenr"], "PO-1007")
    # Normalisering
    k.lik("beløp «2 495,00»", avstem.tall("2 495,00"), 2495.0)
    k.lik("beløp «1.234,50»", avstem.tall("1.234,50"), 1234.5)
    k.lik("beløp «1,234.50»", avstem.tall("1,234.50"), 1234.5)
    k.lik("ordreref po1002 / PO-1002 / 1002 normaliseres likt", {avstem.ref("po1002"), avstem.ref("PO-1002"), avstem.ref("1002")}, {"1002"})
    k.lik("dato dd.mm.åååå", str(avstem.dato("04.09.2026").date()), "2026-09-04")
    # Tilnærmet match skal aldri gi bekreftet avvik
    o2 = ordre.copy()
    f2 = faktura.copy()
    rad = f2.index[f2.fakturanr == "F5006"][0]
    f2.at[rad, "enhetspris"] = "1240.00"
    f2.at[rad, "belop"] = "22320.00"
    r = next(x for x in avstem.avstem(o2, f2) if x["fakturanr"] == "F5006")
    k.lik("prisavvik på tilnærmet match blir mulig avvik, ikke bekreftet", r["status"], "mulig_avvik")
    k.sjekk("kildefilene er uendret (verktøyet skriver bare til resultat/)",
            avstem.les(os.path.join(HER, "data", "faktura.csv"), "f").equals(faktura))
    k.notat("Rapport: resultat/avviksrapport.html og resultat/avviksrapport.csv")


kjor("003 Fakturaavvik", HER, kontroll)
