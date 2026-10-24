import json
import os
import sys

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HER)
sys.path.insert(0, os.path.join(HER, ".."))
import register as R  # noqa: E402
from adaptere import enhetsregisteret as E  # noqa: E402
from app import last_demo  # noqa: E402
from felles.kontroll import kjor  # noqa: E402


def kontroll(k):
    k.sjekk("mod11: gyldig og formatert orgnr godtas", R.gyldig_orgnr("100 000 075") == "100000075")
    k.lik("mod11: feil kontrollsiffer avvises", R.gyldig_orgnr("123456789"), None)
    db = R.koble()
    last_demo(db)
    alle = R.bedrifter(db)
    fasit = json.load(open(os.path.join(HER, "data", "fasit.json"), encoding="utf-8"))
    k.lik("20 unike bedrifter etter import av 14 CSV-rader + 10 registerrader", len(alle), 20)
    k.lik("ugyldig orgnr avvist og logget", [json.loads(r["rad"])["navn"] for r in db.execute("SELECT * FROM avvist_rad")], ["Feil Orgnr AS"])
    b = {x["orgnr"]: x for x in alle}
    dobbel = [x for x in alle if len(x["kilder"]) == 2]
    k.lik("fire duplikater slått sammen med begge kilder bevart", len(dobbel), 4)
    k.sjekk("formatert orgnr i CSV slått sammen med samme enhet", all(len(set(kk["kilde"] for kk in x["kilder"])) == 2 for x in dobbel))
    b13 = b[fasit[12]["orgnr"]]
    k.lik("nyeste kilde vinner for navn (registeret 20.10.)", (b13["navn"], b13["felt_kilde"]["navn"]), ("Syntetisk Bedrift 13 Nytt Navn AS", "enhetsregisteret (2026-10-20)"))
    k.sjekk("gammelt navn fra CSV er bevart i kilden", any(kk["navn"] == "Syntetisk Bedrift 13 AS" for kk in b13["kilder"]))
    k.lik("navnebytte vises som konflikt", b13["konflikter"], ["navn"])
    k.lik("ulik skrivemåte (TROMSØ/Tromsø) er ikke konflikt", b[fasit[0]["orgnr"]]["konflikter"], [])
    b11 = b[fasit[10]["orgnr"]]
    k.lik("manglende størrelse i CSV fylles fra registeret med kilde", (b11["ansatte"], b11["felt_kilde"]["ansatte"]), (3, "enhetsregisteret (2026-10-20)"))
    ukjente = [x for x in alle if x["ansatte"] is None]
    k.lik("manglende størrelse blir None (ukjent), ikke 0", sorted(x["orgnr"] for x in ukjente), sorted(f["orgnr"] for f in fasit if f["ansatte"] is None))
    k.sjekk("ingen bedrift har ansatte = 0", all(x["ansatte"] != 0 for x in alle))
    k.lik("filter størrelse 10–50 utelater ukjent", len(R.filtrer(alle, min_ansatte=10, maks_ansatte=50)), sum(1 for f in fasit if f["ansatte"] is not None and 10 <= f["ansatte"] <= 50))
    k.lik("…og tar dem med når brukeren ber om det", len(R.filtrer(alle, min_ansatte=10, maks_ansatte=50, ta_med_ukjent_storrelse=True)), sum(1 for f in fasit if f["ansatte"] is None or 10 <= f["ansatte"] <= 50))
    k.lik("filter NACE 43 (bygg/installasjon)", len(R.filtrer(alle, nace="43")), 8)
    k.lik("filter sted Tromsø", len(R.filtrer(alle, sted="tromsø")), 5)
    k.kaster("aktuell uten grunn/neste handling avvises", lambda: R.kvalifiser(db, fasit[0]["orgnr"], "aktuell", "", "", "", "t"), ValueError)
    R.kvalifiser(db, fasit[0]["orgnr"], "aktuell", "Elektro, 3 ansatte, Tromsø – manuell tilbudsprosess", "Ring daglig leder via sentralbord", "2026-11-01", "2026-10-24T10:00")
    csv_ = R.eksport_csv(R.bedrifter(db))
    open(os.path.join(HER, "resultat", "prospekter.csv"), "w", encoding="utf-8").write(csv_) if os.makedirs(os.path.join(HER, "resultat"), exist_ok=True) is None else None
    k.sjekk("eksport har kvalifisering og «ukjent» størrelse", "Ring daglig leder" in csv_ and ",ukjent," in csv_)
    k.sjekk("ingen e-postadresser i registeret eller eksporten", "@" not in csv_ and not any("@" in json.dumps(x) for x in alle))
    k.kaster("nettverkshenting er deaktivert", lambda: E.hent_fra_api(), RuntimeError)


kjor("014 Prospektkart", HER, kontroll)
