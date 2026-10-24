"""Marginvakt: datamodell og nøkkeltall.

Definisjoner (eks. mva):
  inntekt            = prosjektpris i gjeldende (eller valgt) prosjektversjon
  direkte_kostnader  = underleverandører + andre kostnader. Refusjoner (viderefakturerte utlegg) er IKKE med.
  refusjoner         = vises separat: utlegg som kunden betaler krone for krone. Inngår verken i inntekt eller kostnad.
  dekningsbidrag     = inntekt − direkte_kostnader
  effektiv_timeinntekt = dekningsbidrag / faktiske timer   (None hvis 0 timer)
  internkost_timer   = Σ timer × timesats gyldig på timens dato (satshistorikk)
  resultat_etter_tid = dekningsbidrag − internkost_timer
Rapporter lagres som frosne øyeblikksbilder (JSON) og beregnes aldri på nytt.
"""
import datetime as dt
import json
import sqlite3

SKJEMA = """
CREATE TABLE IF NOT EXISTS sats(id INTEGER PRIMARY KEY, gyldig_fra TEXT NOT NULL, kr_per_time REAL NOT NULL);
CREATE TABLE IF NOT EXISTS prosjekt(id TEXT PRIMARY KEY, navn TEXT, kunde TEXT);
CREATE TABLE IF NOT EXISTS prosjektversjon(prosjekt_id TEXT, versjon INT, pris REAL, gyldig_fra TEXT, merknad TEXT,
    PRIMARY KEY(prosjekt_id, versjon));
CREATE TABLE IF NOT EXISTS estimat(prosjekt_id TEXT, aktivitet TEXT, timer REAL, PRIMARY KEY(prosjekt_id, aktivitet));
CREATE TABLE IF NOT EXISTS timer(id INTEGER PRIMARY KEY, prosjekt_id TEXT, aktivitet TEXT, dato TEXT, timer REAL);
CREATE TABLE IF NOT EXISTS kostnad(id INTEGER PRIMARY KEY, prosjekt_id TEXT, type TEXT CHECK(type IN ('underleverandør','annen','refusjon')),
    beskrivelse TEXT, belop REAL, dato TEXT);
CREATE TABLE IF NOT EXISTS grense(navn TEXT PRIMARY KEY, verdi REAL);
CREATE TABLE IF NOT EXISTS rapport(id INTEGER PRIMARY KEY, prosjekt_id TEXT, laget TEXT, innhold TEXT);
"""


def koble(sti=":memory:"):
    db = sqlite3.connect(sti, check_same_thread=False)
    db.row_factory = sqlite3.Row
    db.executescript(SKJEMA)
    return db


def sats_paa(db, dato):
    r = db.execute("SELECT kr_per_time FROM sats WHERE gyldig_fra<=? ORDER BY gyldig_fra DESC LIMIT 1", (dato,)).fetchone()
    if r is None:
        raise ValueError(f"ingen timesats gyldig på {dato}")
    return r[0]


def versjon(db, pid, versjon_nr=None):
    if versjon_nr is None:
        r = db.execute("SELECT * FROM prosjektversjon WHERE prosjekt_id=? ORDER BY versjon DESC LIMIT 1", (pid,)).fetchone()
    else:
        r = db.execute("SELECT * FROM prosjektversjon WHERE prosjekt_id=? AND versjon=?", (pid, versjon_nr)).fetchone()
    if r is None:
        raise ValueError(f"prosjekt {pid} mangler versjon")
    return dict(r)


def ny_prosjektversjon(db, pid, pris, gyldig_fra, merknad=""):
    n = db.execute("SELECT coalesce(max(versjon),0)+1 FROM prosjektversjon WHERE prosjekt_id=?", (pid,)).fetchone()[0]
    db.execute("INSERT INTO prosjektversjon VALUES(?,?,?,?,?)", (pid, n, pris, gyldig_fra, merknad))
    db.commit()
    return n


def grenser(db):
    standard = {"min_effektiv_timeinntekt": 700.0, "maks_timeavvik_prosent": 20.0, "min_dekningsgrad_prosent": 30.0}
    standard.update({r["navn"]: r["verdi"] for r in db.execute("SELECT * FROM grense")})
    return standard


def nokkeltall(db, pid, versjon_nr=None):
    p = db.execute("SELECT * FROM prosjekt WHERE id=?", (pid,)).fetchone()
    if p is None:
        raise KeyError(pid)
    v = versjon(db, pid, versjon_nr)
    inntekt = v["pris"]
    kost = {t: 0.0 for t in ("underleverandør", "annen", "refusjon")}
    for r in db.execute("SELECT type, sum(belop) s FROM kostnad WHERE prosjekt_id=? GROUP BY type", (pid,)):
        kost[r["type"]] = r["s"]
    direkte = kost["underleverandør"] + kost["annen"]
    db_ = inntekt - direkte
    timer_rader = db.execute("SELECT aktivitet, dato, timer FROM timer WHERE prosjekt_id=?", (pid,)).fetchall()
    faktiske = sum(r["timer"] for r in timer_rader)
    internkost = sum(r["timer"] * sats_paa(db, r["dato"]) for r in timer_rader)
    est = {r["aktivitet"]: r["timer"] for r in db.execute("SELECT * FROM estimat WHERE prosjekt_id=?", (pid,))}
    fakt = {}
    for r in timer_rader:
        fakt[r["aktivitet"]] = fakt.get(r["aktivitet"], 0) + r["timer"]
    aktiviteter = []
    for a in sorted(set(est) | set(fakt)):
        e, f = est.get(a), fakt.get(a, 0.0)
        aktiviteter.append({"aktivitet": a, "estimert": e, "faktisk": f, "avvik_timer": None if e is None else f - e,
                            "avvik_prosent": None if not e else (f - e) / e * 100})
    eff = db_ / faktiske if faktiske else None
    g = grenser(db)
    varsler = []
    if eff is not None and eff < g["min_effektiv_timeinntekt"]:
        varsler.append(f"effektiv timeinntekt {eff:.0f} kr/t under grensen {g['min_effektiv_timeinntekt']:.0f}")
    grad = db_ / inntekt * 100 if inntekt else None
    if grad is not None and grad < g["min_dekningsgrad_prosent"]:
        varsler.append(f"dekningsgrad {grad:.1f} % under grensen {g['min_dekningsgrad_prosent']:.0f} %")
    for a in aktiviteter:
        if a["avvik_prosent"] is not None and a["avvik_prosent"] > g["maks_timeavvik_prosent"]:
            varsler.append(f"{a['aktivitet']}: {a['avvik_prosent']:.0f} % over estimat")
        if a["estimert"] is None:
            varsler.append(f"{a['aktivitet']}: timer uten estimat")
    est_sum = sum(est.values())
    return {"prosjekt": dict(p), "versjon": v["versjon"], "inntekt": inntekt,
            "underleverandører": kost["underleverandør"], "andre_kostnader": kost["annen"], "direkte_kostnader": direkte,
            "refusjoner": kost["refusjon"], "dekningsbidrag": db_, "dekningsgrad_prosent": grad,
            "estimerte_timer": est_sum, "faktiske_timer": faktiske, "effektiv_timeinntekt": eff,
            "estimert_timeinntekt": db_ / est_sum if est_sum else None,
            "internkost_timer": internkost, "resultat_etter_egen_tid": db_ - internkost,
            "aktiviteter": aktiviteter, "varsler": varsler, "grenser": g}


def lag_rapport(db, pid, laget=None):
    laget = laget or dt.datetime.now().isoformat(timespec="seconds")
    innhold = nokkeltall(db, pid)
    innhold["rapport_laget"] = laget
    cur = db.execute("INSERT INTO rapport(prosjekt_id, laget, innhold) VALUES(?,?,?)", (pid, laget, json.dumps(innhold, ensure_ascii=False)))
    db.commit()
    return cur.lastrowid


def hent_rapport(db, rid):
    r = db.execute("SELECT innhold FROM rapport WHERE id=?", (rid,)).fetchone()
    return json.loads(r[0]) if r else None


def importer(db, data):
    """Importformat: se data/demo.json. Alle seksjoner er valgfrie."""
    for s in data.get("satser", []):
        db.execute("INSERT INTO sats(gyldig_fra, kr_per_time) VALUES(?,?)", (s["gyldig_fra"], s["kr_per_time"]))
    for p in data.get("prosjekter", []):
        db.execute("INSERT INTO prosjekt VALUES(?,?,?)", (p["id"], p["navn"], p.get("kunde", "")))
        db.execute("INSERT INTO prosjektversjon VALUES(?,?,?,?,?)", (p["id"], 1, p["pris"], p.get("startdato", ""), "opprinnelig"))
        for a, t in p.get("estimat", {}).items():
            db.execute("INSERT INTO estimat VALUES(?,?,?)", (p["id"], a, t))
    for t in data.get("timer", []):
        db.execute("INSERT INTO timer(prosjekt_id, aktivitet, dato, timer) VALUES(?,?,?,?)", (t["prosjekt"], t["aktivitet"], t["dato"], t["timer"]))
    for k in data.get("kostnader", []):
        db.execute("INSERT INTO kostnad(prosjekt_id, type, beskrivelse, belop, dato) VALUES(?,?,?,?,?)",
                   (k["prosjekt"], k["type"], k.get("beskrivelse", ""), k["belop"], k.get("dato", "")))
    db.commit()
