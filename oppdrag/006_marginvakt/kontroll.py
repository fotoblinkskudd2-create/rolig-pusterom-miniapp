import json
import os
import sys

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HER)
sys.path.insert(0, os.path.join(HER, ".."))
from fastapi.testclient import TestClient  # noqa: E402

import motor  # noqa: E402
from app import lag_app  # noqa: E402
from felles.kontroll import kjor  # noqa: E402


def kontroll(k):
    db = motor.koble()
    motor.importer(db, json.load(open(os.path.join(HER, "data", "demo.json"), encoding="utf-8")))
    c = TestClient(lag_app(db))
    alle = {p["prosjekt"]["id"]: p for p in c.get("/api/prosjekter").json()}
    k.lik("seks prosjekter", len(alle), 6)
    p1 = alle["P1"]
    k.lik("P1 dekningsbidrag = 40 000 − 1 200", p1["dekningsbidrag"], 38800)
    k.lik("P1 effektiv timeinntekt = 38 800 / 50 t", p1["effektiv_timeinntekt"], 776)
    k.lik("P1 internkost 50 t × 450", p1["internkost_timer"], 22500)
    k.lik("P1 refusjon vises separat og påvirker ikke DB", (p1["refusjoner"], p1["direkte_kostnader"]), (2500, 1200))
    a = p1["aktiviteter"][0]
    k.lik("P1 avvik design +2 t (20 %)", (a["aktivitet"], a["avvik_timer"], round(a["avvik_prosent"], 1)), ("design", 2, 20.0))
    p4 = alle["P4"]
    k.lik("P4 internkost bruker sats på timens dato (45×450 + 25×520)", p4["internkost_timer"], 33250)
    k.lik("P4 effektiv timeinntekt 62 000 / 70", round(p4["effektiv_timeinntekt"], 2), 885.71)
    k.sjekk("P5 varsler lav timeinntekt og overskredet estimat",
            any("timeinntekt" in v for v in alle["P5"]["varsler"]) and any("over estimat" in v for v in alle["P5"]["varsler"]), alle["P5"]["varsler"])
    k.lik("P6 uten timer gir ukjent (None), ikke uendelig/null", alle["P6"]["effektiv_timeinntekt"], None)

    # Doble timer
    for t in db.execute("SELECT * FROM timer WHERE prosjekt_id='P3'").fetchall():
        c.post("/api/timer", json={"prosjekt": "P3", "aktivitet": t["aktivitet"], "dato": t["dato"], "timer": t["timer"]})
    p3 = c.get("/api/prosjekter/P3").json()
    k.lik("doble timer halverer effektiv timeinntekt", p3["effektiv_timeinntekt"], alle["P3"]["effektiv_timeinntekt"] / 2)

    # Refusjon dobbelttelles ikke
    for_ = c.get("/api/prosjekter/P1").json()
    c.post("/api/kostnader", json={"prosjekt": "P1", "type": "refusjon", "beskrivelse": "Parkering (viderefakturert)", "belop": 300})
    etter = c.get("/api/prosjekter/P1").json()
    k.sjekk("ny refusjon endrer verken inntekt, kostnad, DB eller timeinntekt",
            all(for_[x] == etter[x] for x in ("inntekt", "direkte_kostnader", "dekningsbidrag", "effektiv_timeinntekt")) and etter["refusjoner"] == 2800)

    # Rapport er frossen ved senere satsendring
    rid = c.post("/api/prosjekter/P4/rapporter").json()["id"]
    c.post("/api/satser", json={"gyldig_fra": "2026-09-01", "kr_per_time": 600})
    ny = c.get("/api/prosjekter/P4").json()
    k.sjekk("ny sats endrer løpende beregning", ny["internkost_timer"] != 33250, ny["internkost_timer"])
    rap = c.get("/api/prosjekter/P4/rapporter").json()[0]
    k.lik("lagret rapport beholder internkost 33 250 etter satsendring", (rap["id"], rap["internkost_timer"]), (rid, 33250))
    # Prosjektversjon
    c.post("/api/prosjekter/P4/versjoner", json={"pris": 90000, "gyldig_fra": "2026-10-10", "merknad": "tillegg avtalt"})
    k.lik("ny prosjektversjon brukes som standard", c.get("/api/prosjekter/P4").json()["inntekt"], 90000)
    k.lik("versjon 1 kan fortsatt hentes", c.get("/api/prosjekter/P4?versjon=1").json()["inntekt"], 80000)
    k.lik("rapporten viser fortsatt versjon 1", c.get("/api/prosjekter/P4/rapporter").json()[0]["versjon"], 1)
    # Grenser
    c.put("/api/grenser", json={"min_effektiv_timeinntekt": 900})
    k.sjekk("brukerdefinert grense utløser internt varsel for P1 (776 < 900)", any("under grensen 900" in v for v in c.get("/api/prosjekter/P1").json()["varsler"]))
    k.lik("ugyldig kostnadstype avvises", c.post("/api/kostnader", json={"prosjekt": "P1", "type": "gave", "belop": 1}).status_code, 400)
    csv = c.get("/api/eksport.csv").text
    k.lik("CSV-eksport har header + 6 prosjekter", len(csv.strip().splitlines()), 7)
    os.makedirs(os.path.join(HER, "resultat"), exist_ok=True)
    open(os.path.join(HER, "resultat", "nokkeltall.csv"), "w", encoding="utf-8").write(csv)


kjor("006 Marginvakt", HER, kontroll)
