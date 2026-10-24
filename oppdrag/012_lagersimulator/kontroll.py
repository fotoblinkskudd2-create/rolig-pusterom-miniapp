import json
import os
import sys

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HER)
sys.path.insert(0, os.path.join(HER, ".."))
import motor as M  # noqa: E402
from felles.kontroll import kjor  # noqa: E402


def ny_db():
    db = M.koble()
    M.importer(db, os.path.join(HER, "data", "varer.csv"), os.path.join(HER, "data", "bevegelser.csv"))
    return db


def kontroll(k):
    db = ny_db()
    k.lik("12 varer", db.execute("SELECT count(*) FROM vare").fetchone()[0], 12)
    start, slutt = M.periode(db)
    k.lik("90 dager historikk", (slutt - start).days + 1, 90)
    # Intern flytting er ikke salg
    v04 = M.ettersporsel(db, "V04")
    flytt_dato = db.execute("SELECT dato FROM bevegelse WHERE varenr='V04' AND type='intern_flytting'").fetchone()[0]
    salg_den_dagen = db.execute("SELECT coalesce(-sum(antall),0) FROM bevegelse WHERE varenr='V04' AND type='salg' AND dato=?", (flytt_dato,)).fetchone()[0]
    k.lik("intern flytting telles ikke som etterspørsel", v04.get(flytt_dato, 0), salg_den_dagen)
    k.lik("interne flyttinger har netto null", db.execute("SELECT sum(antall) FROM bevegelse WHERE type='intern_flytting'").fetchone()[0], 0)
    dager, _ = M.historikk(db, "V04")
    d = next(x for x in dager if x["dato"] == flytt_dato)
    k.sjekk("flytting endrer lokasjon, ikke total", d["lok_BIL1"] == 4 and d["total"] == d["lok_LAGER"] + d["lok_BIL1"], d)
    # Negativ beholdning
    _, flagg = M.historikk(db, "V11")
    k.sjekk("negativ beholdning flagges med dato og referanse", flagg and flagg[0]["dato"] == "2026-07-06" and flagg[0]["ref"] == "FEIL-REG" and flagg[0]["beholdning"] < 0, flagg[:1])
    k.lik("andre varer har ingen negative dager", sum(len(M.historikk(db, f"V{i:02d}")[1]) for i in range(1, 11)), 0)
    # ROP
    k.lik("ROP = ceil(snitt × ledetid + sikkerhetslager)", M.rop(1.2, 21, 3), 29)
    A, B = M.REGELSETT["A_standard"], M.REGELSETT["B_robust"]
    ra, rb = M.replay(db, A), M.replay(db, B)
    v7a = next(v for v in ra["varer"] if v["varenr"] == "V07")
    k.sjekk("forsinket levering påvirker replay (V07-ordre merket forsinket)", any("(forsinket)" in l for l in v7a["logg"]))
    k.sjekk("regelsett A gir utsolgtperiode for V07 under forsinkelsen", any(p[0] <= "2026-08-10" and p[1] >= "2026-08-08" for p in v7a["utsolgtperioder"]), v7a["utsolgtperioder"])
    k.sjekk("regelsett B har færre utsolgtdager", rb["sum"]["utsolgt_dager"] < ra["sum"]["utsolgt_dager"], f"A {ra['sum']['utsolgt_dager']} / B {rb['sum']['utsolgt_dager']}")
    k.sjekk("B har høyere gjennomsnittlig lagerverdi (kostnad for robusthet)", rb["sum"]["snitt_lagerverdi"] > ra["sum"]["snitt_lagerverdi"])
    # Determinisme
    k.lik("samme historikk gir samme replay (hash)", M.replay(ny_db(), A)["hash"], ra["hash"])
    k.lik("samme replay to ganger i samme database", M.replay(db, A)["hash"], ra["hash"])
    # Lagerverdi kontrollregning for én vare uten ordre/utsolgt i et minimalt tilfelle
    mini = M.koble()
    mini.execute("INSERT INTO vare VALUES('X','Test',10,5,0,10)")
    for dag, n in (("2026-07-01", -2), ("2026-07-02", -3), ("2026-07-03", 0)):
        mini.execute("INSERT INTO bevegelse(dato,varenr,type,antall,fra_lokasjon) VALUES(?,?,?,?,'LAGER')", (dag, "X", "salg", n))
    r = M.replay(mini, {"navn": "t", "sikkerhetsfaktor": 0, "ordresyklus_dager": 0})["varer"][0]
    # snitt = 5/3; ROP = ceil(5/3*5)=9. S = ROP + 1 = 10. Dag1: 10-2=8 ≤ 9 → bestill 2. Dag2: 8-3=5, posisjon 7 ≤ 9 → bestill 3. Dag3: posisjon 10 > 9.
    k.lik("håndregnet minireplay: snitt lagerverdi (8+5+5)/3 × 10", r["snitt_lagerverdi"], 60.0)
    k.lik("håndregnet minireplay: to ordre", r["antall_ordre"], 2)
    # Forslag
    forslag, tekst = M.bestillingsforslag(db, A)
    os.makedirs(os.path.join(HER, "resultat"), exist_ok=True)
    open(os.path.join(HER, "resultat", "bestillingsforslag.csv"), "w", encoding="utf-8").write(tekst)
    json.dump({"A": ra["sum"], "B": rb["sum"], "hash_A": ra["hash"]}, open(os.path.join(HER, "resultat", "sammenligning.json"), "w"), indent=1)
    k.sjekk("forslag inneholder bare varer med beholdning ≤ ROP", all(f["beholdning"] <= f["rop"] and f["foreslatt_antall"] > 0 for f in forslag), len(forslag))
    k.sjekk("forslag for V11 merkes med negativ historikk", any(f["varenr"] == "V11" and "negativ" in f["merknad"] for f in forslag) or not any(f["varenr"] == "V11" for f in forslag))
    k.notat(f"A: {ra['sum']} · B: {rb['sum']}")


kjor("012 Lagersimulator", HER, kontroll)
