"""Anbudsradar: import, deduplisering, endringssporing, matching og prioritering.

Datamodell (SQLite):
  importer(id, fil, tidspunkt, rader, nye, endrede, duplikater_i_fil)
  kunngjoring(kunngjoring_id PK, kilde, ..., sist_oppdatert_import, forst_sett_import)
  endring(kunngjoring_id, import_id, felt, gammel, ny)

Duplikatregel: samme kunngjoring_id (kildens referanse) er samme kunngjøring.
Gjentatt rad i samme fil telles én gang og logges som duplikat.
"""
import datetime as dt
import json
import os
import sqlite3
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from felles.filer import les_csv, skriv_csv  # noqa: E402

FELT = ["kilde", "tittel", "oppdragsgiver", "fagområde", "sted", "region", "cpv",
        "frist", "estimert_verdi_nok", "publisert", "url"]
SPORET = ["tittel", "frist", "estimert_verdi_nok", "sted", "cpv", "url"]


def koble(sti=":memory:"):
    db = sqlite3.connect(sti, check_same_thread=False)
    db.row_factory = sqlite3.Row
    db.executescript("""
    CREATE TABLE IF NOT EXISTS importer(id INTEGER PRIMARY KEY, fil TEXT, tidspunkt TEXT,
        rader INT, nye INT, endrede INT, duplikater_i_fil INT);
    CREATE TABLE IF NOT EXISTS kunngjoring(kunngjoring_id TEXT PRIMARY KEY, kilde TEXT, tittel TEXT,
        oppdragsgiver TEXT, fagområde TEXT, sted TEXT, region TEXT, cpv TEXT, frist TEXT,
        frist_raa TEXT, estimert_verdi_nok REAL, publisert TEXT, url TEXT,
        forst_sett_import INT, sist_oppdatert_import INT, sist_sett_import INT);
    CREATE TABLE IF NOT EXISTS endring(kunngjoring_id TEXT, import_id INT, felt TEXT, gammel TEXT, ny TEXT);
    """)
    return db


def tolk_dato(tekst):
    """Returnerer ISO-dato eller None. Tom/ugyldig tekst gir None (ukjent), aldri en gjettet dato."""
    t = (tekst or "").strip()
    for fmt in ("%Y-%m-%d", "%d.%m.%Y"):
        try:
            return dt.datetime.strptime(t, fmt).date().isoformat()
        except ValueError:
            pass
    return None


def normaliser(rad):
    ut = {k: (rad.get(k) or "").strip() for k in FELT}
    ut["frist_raa"] = ut["frist"]
    ut["frist"] = tolk_dato(ut["frist"])
    try:
        ut["estimert_verdi_nok"] = float(ut["estimert_verdi_nok"]) if ut["estimert_verdi_nok"] else None
    except ValueError:
        ut["estimert_verdi_nok"] = None
    return ut


def importer_csv(db, sti, tidspunkt=None):
    tidspunkt = tidspunkt or dt.datetime.now().isoformat(timespec="seconds")
    rader = les_csv(sti)
    cur = db.execute("INSERT INTO importer(fil,tidspunkt,rader) VALUES(?,?,?)",
                     (os.path.basename(sti), tidspunkt, len(rader)))
    imp = cur.lastrowid
    sett, nye, endrede, dup = set(), 0, 0, []
    for radnr, raa in rader:
        kid = (raa.get("kunngjoring_id") or "").strip()
        if not kid:
            continue
        if kid in sett:
            dup.append((kid, radnr))
            continue
        sett.add(kid)
        r = normaliser(raa)
        gml = db.execute("SELECT * FROM kunngjoring WHERE kunngjoring_id=?", (kid,)).fetchone()
        if gml is None:
            db.execute(f"""INSERT INTO kunngjoring(kunngjoring_id,{','.join(FELT)},frist_raa,
                forst_sett_import,sist_oppdatert_import,sist_sett_import)
                VALUES(?,{','.join('?' * len(FELT))},?,?,?,?)""",
                       [kid] + [r[k] for k in FELT] + [r["frist_raa"], imp, imp, imp])
            nye += 1
            continue
        endret = False
        for felt in SPORET:
            if str(gml[felt]) != str(r[felt]):
                db.execute("INSERT INTO endring VALUES(?,?,?,?,?)", (kid, imp, felt, gml[felt], r[felt]))
                endret = True
        sets = ",".join(f"{k}=?" for k in FELT) + ",frist_raa=?,sist_sett_import=?"
        verdier = [r[k] for k in FELT] + [r["frist_raa"], imp]
        if endret:
            sets += ",sist_oppdatert_import=?"
            verdier.append(imp)
            endrede += 1
        db.execute(f"UPDATE kunngjoring SET {sets} WHERE kunngjoring_id=?", verdier + [kid])
    db.execute("UPDATE importer SET nye=?,endrede=?,duplikater_i_fil=? WHERE id=?", (nye, endrede, len(dup), imp))
    db.commit()
    return {"import_id": imp, "rader": len(rader), "unike": len(sett), "nye": nye,
            "endrede": endrede, "duplikater": [{"kunngjoring_id": k, "radnr": n} for k, n in dup]}


def frists_status(frist, idag):
    if frist is None:
        return "ukjent", None
    dager = (dt.date.fromisoformat(frist) - idag).days
    return ("utløpt" if dager < 0 else "åpen"), dager


def vurder(rad, profil, idag):
    """Returnerer (score, grunner, advarsler). Alle grunner er sporbare til profil og felt."""
    score, grunner, adv = 0, [], []
    tekst = f"{rad['tittel']} {rad['fagområde']}".lower()
    for ord_, vekt in profil["nøkkelord"].items():
        if ord_ in tekst:
            score += vekt
            grunner.append(f"nøkkelord «{ord_}» (+{vekt})")
    for pref, vekt in profil["cpv_prefiks"].items():
        if (rad["cpv"] or "").startswith(pref):
            score += vekt
            grunner.append(f"CPV {rad['cpv']} starter med {pref} (+{vekt})")
            break
    if rad["fagområde"] in profil["fagområder"]:
        score += 2
        grunner.append(f"fagområde «{rad['fagområde']}» i profil (+2)")
    if rad["region"] in profil["regioner"]:
        score += 2
        grunner.append(f"region {rad['region']} i profil (+2)")
    else:
        adv.append(f"region {rad['region']} utenfor profil")
    v = rad["estimert_verdi_nok"]
    if v is not None and v > profil["maks_verdi_nok"]:
        adv.append(f"estimert verdi {v:,.0f} over profilens maks {profil['maks_verdi_nok']:,.0f}".replace(",", " "))
        score -= 3
    status, dager = frists_status(rad["frist"], idag)
    if status == "ukjent":
        adv.append(f"frist ukjent (kildeverdi: «{rad['frist_raa']}»)")
    elif status == "utløpt":
        adv.append("frist utløpt")
    elif dager < profil["min_dager_igjen"]:
        adv.append(f"kun {dager} dager igjen")
    return score, grunner, adv, status, dager


def oversikt(db, profil, idag, fagomrade=None, sted=None, frist_innen=None, vis_utlopte=False):
    siste = db.execute("SELECT max(id) FROM importer").fetchone()[0]
    ut = []
    for rad in db.execute("SELECT * FROM kunngjoring ORDER BY kunngjoring_id"):
        rad = dict(rad)
        if fagomrade and rad["fagområde"] != fagomrade:
            continue
        if sted and sted.lower() not in f"{rad['sted']} {rad['region']}".lower():
            continue
        score, grunner, adv, status, dager = vurder(rad, profil, idag)
        if status == "utløpt" and not vis_utlopte:
            continue
        if frist_innen is not None and (dager is None or dager > frist_innen):
            continue
        endringer = [dict(e) for e in db.execute(
            "SELECT felt,gammel,ny,import_id FROM endring WHERE kunngjoring_id=? AND import_id=?",
            (rad["kunngjoring_id"], siste))]
        rad.update(score=score, grunner=grunner, advarsler=adv, frist_status=status, dager_igjen=dager,
                   endringer_siste_import=endringer,
                   ny_i_siste_import=rad["forst_sett_import"] == siste,
                   med_i_siste_import=rad["sist_sett_import"] == siste,
                   oppdatert=db.execute("SELECT tidspunkt FROM importer WHERE id=?",
                                        (rad["sist_oppdatert_import"],)).fetchone()[0])
        ut.append(rad)
    # Prioritering: utløpte sist, så score synkende, så tidligst kjent frist; ukjent frist sist innen samme score
    ut.sort(key=lambda r: (r["frist_status"] == "utløpt", -r["score"], r["dager_igjen"] is None, r["dager_igjen"] or 0))
    return ut


def eksport_prioritering(rader, sti=None):
    felt = ["prioritet", "kunngjoring_id", "tittel", "oppdragsgiver", "sted", "frist", "frist_status",
            "dager_igjen", "score", "grunner", "advarsler", "oppdatert", "url"]
    ut = [{**r, "prioritet": i + 1, "grunner": "; ".join(r["grunner"]), "advarsler": "; ".join(r["advarsler"]),
           "frist": r["frist"] or "ukjent"} for i, r in enumerate(rader)]
    return skriv_csv(sti, ut, felt)


def les_profil(sti):
    with open(sti, encoding="utf-8") as f:
        return json.load(f)
