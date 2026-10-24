"""Lager- og innkjøpssimulator.

Regler:
- Etterspørsel = bare bevegelser av type «salg». Intern flytting (to rader, netto null) er aldri salg.
- Gjenbestillingspunkt (ROP) = ceil(snitt dagforbruk × ledetid + sikkerhetslager). Ledetid og sikkerhetslager er brukerens inndata per vare;
  regelsettet kan skalere sikkerhetslageret og endre ordresyklus.
- Replay per dag: 1) mottak av simulerte ordre, 2) etterspørsel (ikke dekket = tapt salg, dagen telles som utsolgt),
  3) hvis lagerposisjon (på lager + i bestilling) ≤ ROP: bestill opp til ROP + snitt × ordresyklus.
- Historiske leveringsavvik (mottak med «forventet»-dato) brukes i replay: simulerte ordre på samme vare som skulle
  kommet i avviksperioden, kommer tidligst på den faktiske mottaksdatoen.
- Replay gjelder total beholdning (alle lokasjoner). Ingen innkjøpsordre opprettes – bare forslag.
"""
import csv
import datetime as dt
import hashlib
import io
import json
import math
import sqlite3


def koble(sti=":memory:"):
    db = sqlite3.connect(sti, check_same_thread=False)
    db.row_factory = sqlite3.Row
    db.executescript("""
    CREATE TABLE IF NOT EXISTS vare(varenr TEXT PRIMARY KEY, navn TEXT, kostpris REAL, ledetid_dager INT, sikkerhetslager INT, startbeholdning INT);
    CREATE TABLE IF NOT EXISTS bevegelse(id INTEGER PRIMARY KEY, dato TEXT, varenr TEXT, type TEXT, antall INT, fra_lokasjon TEXT,
        til_lokasjon TEXT, ref TEXT, forventet TEXT);""")
    return db


def importer(db, varer_csv, bev_csv):
    with open(varer_csv, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            db.execute("INSERT OR REPLACE INTO vare VALUES(?,?,?,?,?,?)", (r["varenr"], r["navn"], float(r["kostpris"]), int(r["ledetid_dager"]), int(r["sikkerhetslager"]), int(r["startbeholdning"])))
    with open(bev_csv, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            db.execute("INSERT INTO bevegelse(dato,varenr,type,antall,fra_lokasjon,til_lokasjon,ref,forventet) VALUES(?,?,?,?,?,?,?,?)",
                       (r["dato"], r["varenr"], r["type"], int(r["antall"]), r["fra_lokasjon"], r["til_lokasjon"], r["ref"], r.get("forventet") or None))
    db.commit()


def periode(db):
    a, b = db.execute("SELECT min(dato), max(dato) FROM bevegelse").fetchone()
    return dt.date.fromisoformat(a), dt.date.fromisoformat(b)


def historikk(db, varenr):
    """Faktisk historisk beholdning per dag og per lokasjon. Negative verdier flagges med dato og referanse."""
    v = db.execute("SELECT * FROM vare WHERE varenr=?", (varenr,)).fetchone()
    lok = {"LAGER": v["startbeholdning"]}
    dager, flagg = [], []
    start, slutt = periode(db)
    bev = db.execute("SELECT * FROM bevegelse WHERE varenr=? ORDER BY dato, id", (varenr,)).fetchall()
    i = 0
    for n in range((slutt - start).days + 1):
        d = (start + dt.timedelta(days=n)).isoformat()
        while i < len(bev) and bev[i]["dato"] == d:
            b = bev[i]
            sted = b["til_lokasjon"] if b["antall"] > 0 and b["til_lokasjon"] else (b["fra_lokasjon"] or "LAGER")
            lok[sted] = lok.get(sted, 0) + b["antall"]
            if lok[sted] < 0:
                flagg.append({"dato": d, "lokasjon": sted, "beholdning": lok[sted], "ref": b["ref"] or b["type"]})
            i += 1
        dager.append({"dato": d, "total": sum(lok.values()), **{f"lok_{k}": x for k, x in lok.items()}})
    return dager, flagg


def ettersporsel(db, varenr):
    rader = db.execute("SELECT dato, -sum(antall) n FROM bevegelse WHERE varenr=? AND type='salg' GROUP BY dato", (varenr,)).fetchall()
    return {r["dato"]: r["n"] for r in rader}


def leveringsavvik(db, varenr):
    return [(dt.date.fromisoformat(r["forventet"]), dt.date.fromisoformat(r["dato"]))
            for r in db.execute("SELECT * FROM bevegelse WHERE varenr=? AND type='mottak' AND forventet IS NOT NULL", (varenr,))]


def rop(snitt, ledetid, sikkerhet):
    return math.ceil(snitt * ledetid + sikkerhet)


def replay(db, regelsett):
    start, slutt = periode(db)
    ndager = (slutt - start).days + 1
    ut = {"regelsett": regelsett, "varer": []}
    for v in db.execute("SELECT * FROM vare ORDER BY varenr").fetchall():
        dem = ettersporsel(db, v["varenr"])
        snitt = sum(dem.values()) / ndager
        sikk = v["sikkerhetslager"] * regelsett["sikkerhetsfaktor"]
        r = rop(snitt, v["ledetid_dager"], sikk)
        # (s, S)-politikk: S er alltid minst ROP + 1, så en utløst ordre aldri blir på 0 stk
        opp_til = max(r + 1, r + math.ceil(snitt * regelsett["ordresyklus_dager"]))
        avvik = leveringsavvik(db, v["varenr"])
        paa_lager, ordre, utsolgt, tapt, verdi_sum, antall_ordre, logg = v["startbeholdning"], [], [], 0, 0.0, 0, []
        for n in range(ndager):
            d = start + dt.timedelta(days=n)
            ankommet = [o for o in ordre if o["ankomst"] <= d]
            for o in ankommet:
                paa_lager += o["antall"]
                logg.append(f"{d} mottak {o['antall']}" + (" (forsinket)" if o["forsinket"] else ""))
            ordre = [o for o in ordre if o["ankomst"] > d]
            behov = dem.get(d.isoformat(), 0)
            if behov > paa_lager:
                tapt += behov - paa_lager
                utsolgt.append(d.isoformat())
                paa_lager = 0
            else:
                paa_lager -= behov
            posisjon = paa_lager + sum(o["antall"] for o in ordre)
            if posisjon <= r:
                ankomst = d + dt.timedelta(days=v["ledetid_dager"])
                forsinket = False
                for forv, faktisk in avvik:
                    if forv <= ankomst < faktisk:
                        ankomst, forsinket = faktisk, True
                ordre.append({"antall": opp_til - posisjon, "ankomst": ankomst, "forsinket": forsinket})
                antall_ordre += 1
                logg.append(f"{d} bestill {opp_til - posisjon} (posisjon {posisjon} ≤ ROP {r}), ankomst {ankomst}")
            verdi_sum += paa_lager * v["kostpris"]
        perioder = []
        for d in utsolgt:
            if perioder and (dt.date.fromisoformat(d) - dt.date.fromisoformat(perioder[-1][1])).days == 1:
                perioder[-1][1] = d
            else:
                perioder.append([d, d])
        ut["varer"].append({"varenr": v["varenr"], "navn": v["navn"], "snitt_per_dag": round(snitt, 4), "rop": r, "bestill_opp_til": opp_til,
                            "utsolgt_dager": len(utsolgt), "utsolgtperioder": perioder, "tapt_antall": tapt,
                            "snitt_lagerverdi": round(verdi_sum / ndager, 2), "antall_ordre": antall_ordre, "sluttbeholdning": paa_lager, "logg": logg})
    ut["sum"] = {k: round(sum(x[k] for x in ut["varer"]), 2) for k in ("utsolgt_dager", "tapt_antall", "snitt_lagerverdi", "antall_ordre")}
    ut["hash"] = hashlib.sha256(json.dumps(ut["varer"], sort_keys=True).encode()).hexdigest()
    return ut


def bestillingsforslag(db, regelsett):
    """Forslag basert på faktisk beholdning siste dag i historikken. Ingen ordre sendes."""
    res = {x["varenr"]: x for x in replay(db, regelsett)["varer"]}
    forslag = []
    for v in db.execute("SELECT * FROM vare ORDER BY varenr").fetchall():
        dager, flagg = historikk(db, v["varenr"])
        beh = dager[-1]["total"]
        r = res[v["varenr"]]
        if beh <= r["rop"]:
            forslag.append({"varenr": v["varenr"], "navn": v["navn"], "beholdning": beh, "rop": r["rop"], "foreslatt_antall": r["bestill_opp_til"] - beh,
                            "kostpris": v["kostpris"], "verdi": round((r["bestill_opp_til"] - beh) * v["kostpris"], 2),
                            "merknad": "beholdning har vært negativ i historikken – kontroller telling" if flagg else ""})
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=["varenr", "navn", "beholdning", "rop", "foreslatt_antall", "kostpris", "verdi", "merknad"])
    w.writeheader()
    w.writerows(forslag)
    return forslag, buf.getvalue()


REGELSETT = {
    "A_standard": {"navn": "A: sikkerhetslager × 1, ordresyklus 14 d", "sikkerhetsfaktor": 1.0, "ordresyklus_dager": 14},
    "B_robust": {"navn": "B: sikkerhetslager × 2, ordresyklus 7 d", "sikkerhetsfaktor": 2.0, "ordresyklus_dager": 7},
}
