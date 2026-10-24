import datetime as dt
import os
import sys

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HER, ".."))
import radar  # noqa: E402
from felles.kontroll import kjor  # noqa: E402
from adaptere.ekstern_kilde import EksternKilde  # noqa: E402

IDAG = dt.date(2026, 10, 24)


def kontroll(k):
    db = radar.koble()
    profil = radar.les_profil(os.path.join(HER, "data", "profil.json"))
    r1 = radar.importer_csv(db, os.path.join(HER, "data", "import_1.csv"), "2026-10-14T08:00:00")
    k.lik("import 1 har 15 rader", r1["rader"], 15)
    k.lik("duplikat i import 1 telles én gang (14 unike)", r1["unike"], 14)
    k.lik("duplikatet logges med radnummer", r1["duplikater"], [{"kunngjoring_id": "KG-2026-0101", "radnr": 14}])
    k.lik("antall kunngjøringer i databasen etter import 1", db.execute("SELECT count(*) FROM kunngjoring").fetchone()[0], 14)

    alle = {r["kunngjoring_id"]: r for r in radar.oversikt(db, profil, IDAG, vis_utlopte=True)}
    k.lik("tom frist gir status ukjent", alle["KG-2026-0106"]["frist_status"], "ukjent")
    k.lik("«ikke oppgitt» gir status ukjent, ikke utløpt", alle["KG-2026-0113"]["frist_status"], "ukjent")
    k.lik("passert frist gir utløpt", alle["KG-2026-0105"]["frist_status"], "utløpt")
    k.sjekk("ukjent frist oppgir kildeverdien i advarselen",
            any("ikke oppgitt" in a for a in alle["KG-2026-0113"]["advarsler"]))
    standard = [r["kunngjoring_id"] for r in radar.oversikt(db, profil, IDAG)]
    k.sjekk("utløpt skjules som standard, ukjent frist vises",
            "KG-2026-0105" not in standard and "KG-2026-0106" in standard and "KG-2026-0113" in standard)

    r2 = radar.importer_csv(db, os.path.join(HER, "data", "import_2.csv"), "2026-10-21T08:00:00")
    k.lik("import 2: én ny kunngjøring", r2["nye"], 1)
    k.lik("import 2: tre endrede (frist 0101, verdi 0104, frist 0106)", r2["endrede"], 3)
    k.lik("totalt antall etter to importer (ingen dobbelttelling)", db.execute("SELECT count(*) FROM kunngjoring").fetchone()[0], 15)
    alle = {r["kunngjoring_id"]: r for r in radar.oversikt(db, profil, IDAG, vis_utlopte=True)}
    e = alle["KG-2026-0101"]["endringer_siste_import"]
    k.lik("endret frist registreres med gammel og ny verdi", [(x["felt"], x["gammel"], x["ny"]) for x in e],
          [("frist", "2026-11-20", "2026-11-27")])
    k.lik("frist som kom på plass endrer status til åpen", alle["KG-2026-0106"]["frist_status"], "åpen")
    k.sjekk("uendret kunngjøring har ingen endringer", alle["KG-2026-0102"]["endringer_siste_import"] == [])
    k.sjekk("kunngjøring som ikke var med i import 2 beholdes og merkes",
            alle["KG-2026-0103"]["med_i_siste_import"] is False)
    k.lik("oppdateringsdato følger siste endring", alle["KG-2026-0101"]["oppdatert"], "2026-10-21T08:00:00")
    k.lik("oppdateringsdato for uendret kunngjøring er første import", alle["KG-2026-0102"]["oppdatert"], "2026-10-14T08:00:00")

    # filtre
    k.sjekk("filter fagområde=lading", {r["fagområde"] for r in radar.oversikt(db, profil, IDAG, fagomrade="lading")} == {"lading"})
    k.sjekk("filter sted=Nordland", all(r["region"] == "Nordland" for r in radar.oversikt(db, profil, IDAG, sted="nordland")))
    innen = radar.oversikt(db, profil, IDAG, frist_innen=10)
    k.sjekk("frist innen 10 dager utelater ukjent frist", all(r["dager_igjen"] is not None and r["dager_igjen"] <= 10 for r in innen),
            [r["kunngjoring_id"] for r in innen])
    pri = radar.oversikt(db, profil, IDAG)
    k.sjekk("prioritering er sortert på score", all(pri[i]["score"] >= pri[i + 1]["score"] for i in range(len(pri) - 1)))
    k.sjekk("hver prioritert rad har grunner eller tom liste og kilde-URL", all("url" in r and isinstance(r["grunner"], list) for r in pri))
    k.sjekk("for stor verdi gir advarsel", any("over profilens maks" in a for a in alle["KG-2026-0109"]["advarsler"]))
    csv = radar.eksport_prioritering(pri, os.path.join(HER, "resultat", "prioritering.csv"))
    k.sjekk("CSV-eksport har én rad per prioritert kunngjøring", csv.strip().count("\n") == len(pri), f"{len(pri)} rader")
    k.kaster("ekstern adapter er deaktivert", lambda: EksternKilde().hent("2026-10-01"), RuntimeError)
    k.notat("Topp 3: " + " | ".join(f"{r['kunngjoring_id']} {r['tittel']} ({r['score']})" for r in pri[:3]))


kjor("001 Anbudsradar", HER, kontroll)
