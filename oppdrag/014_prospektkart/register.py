"""Bedriftsregister for manuelt, målrettet salg.

- Identitet = organisasjonsnummer (9 siffer, mod11-kontroll). «912 345 678» og «912345678» er samme enhet.
- Sammenslåing: hver kilde lagres som egen rad i `kildeverdi` (kilde, oppdatert, felt). Visningsverdien for et felt
  hentes fra kilden med nyeste oppdateringsdato som HAR verdien. Ingen kildeverdi slettes.
- Manglende antall ansatte lagres som NULL og vises som «ukjent» – aldri 0.
- Ingen e-postadresser gjettes, ingen data hentes bak innlogging, ingen bedrift kontaktes.
"""
import csv
import io
import json
import re
import sqlite3

FELT = ["navn", "nace", "nace_tekst", "kommune", "postnr", "ansatte", "nettside"]


def gyldig_orgnr(o):
    s = re.sub(r"\D", "", str(o or ""))
    if len(s) != 9:
        return None
    v = [3, 2, 7, 6, 5, 4, 3, 2]
    r = 11 - sum(int(a) * b for a, b in zip(s[:8], v)) % 11
    k = 0 if r == 11 else r
    return s if k != 10 and k == int(s[8]) else None


def koble(sti=":memory:"):
    db = sqlite3.connect(sti, check_same_thread=False)
    db.row_factory = sqlite3.Row
    db.executescript("""
    CREATE TABLE IF NOT EXISTS kildeverdi(orgnr TEXT, kilde TEXT, oppdatert TEXT, navn TEXT, nace TEXT, nace_tekst TEXT, kommune TEXT,
        postnr TEXT, ansatte INT, nettside TEXT, raa TEXT, PRIMARY KEY(orgnr, kilde));
    CREATE TABLE IF NOT EXISTS kvalifisering(orgnr TEXT PRIMARY KEY, status TEXT, grunn TEXT, neste_handling TEXT, frist TEXT, endret TEXT);
    CREATE TABLE IF NOT EXISTS avvist_rad(kilde TEXT, rad TEXT, grunn TEXT);
    """)
    return db


def _int_eller_none(v):
    v = (str(v) if v is not None else "").strip()
    return int(v) if re.fullmatch(r"\d+", v) else None


def lagre(db, kilde, oppdatert, rad, raa):
    orgnr = gyldig_orgnr(rad.get("orgnr"))
    if not orgnr:
        db.execute("INSERT INTO avvist_rad VALUES(?,?,?)", (kilde, json.dumps(raa, ensure_ascii=False), f"ugyldig organisasjonsnummer «{rad.get('orgnr')}»"))
        return None
    db.execute("INSERT OR REPLACE INTO kildeverdi VALUES(?,?,?,?,?,?,?,?,?,?,?)",
               (orgnr, kilde, oppdatert, rad.get("navn") or None, rad.get("nace") or None, rad.get("nace_tekst") or None, rad.get("kommune") or None,
                rad.get("postnr") or None, _int_eller_none(rad.get("ansatte")), rad.get("nettside") or None, json.dumps(raa, ensure_ascii=False)))
    return orgnr


def importer_csv(db, sti, kilde, oppdatert):
    """CSV-felt: orgnr,navn,nace,nace_tekst,kommune,postnr,ansatte,nettside. Tom «ansatte» = ukjent."""
    n = 0
    with open(sti, encoding="utf-8-sig") as f:
        for rad in csv.DictReader(f):
            n += lagre(db, kilde, oppdatert, rad, rad) is not None
    db.commit()
    return n


def bedrifter(db):
    ut = {}
    for r in db.execute("SELECT * FROM kildeverdi ORDER BY orgnr, oppdatert DESC, kilde"):
        b = ut.setdefault(r["orgnr"], {"orgnr": r["orgnr"], "kilder": [], **{f: None for f in FELT}, "felt_kilde": {}})
        b["kilder"].append({"kilde": r["kilde"], "oppdatert": r["oppdatert"], **{f: r[f] for f in FELT}})
        for f in FELT:
            if b[f] is None and r[f] is not None:
                b[f] = r[f]
                b["felt_kilde"][f] = f"{r['kilde']} ({r['oppdatert']})"
    for b in ut.values():
        b["oppdatert"] = max(k["oppdatert"] for k in b["kilder"])
        b["konflikter"] = [f for f in FELT if len({str(k[f]).casefold() for k in b["kilder"] if k[f] is not None}) > 1]
        q = db.execute("SELECT * FROM kvalifisering WHERE orgnr=?", (b["orgnr"],)).fetchone()
        b["kvalifisering"] = dict(q) if q else None
    return list(ut.values())


def filtrer(liste, nace=None, sted=None, min_ansatte=None, maks_ansatte=None, ta_med_ukjent_storrelse=False):
    ut = []
    for b in liste:
        if nace and not (b["nace"] or "").startswith(nace):
            continue
        if sted and sted.lower() not in f"{b['kommune'] or ''} {b['postnr'] or ''}".lower():
            continue
        if min_ansatte is not None or maks_ansatte is not None:
            if b["ansatte"] is None:
                if not ta_med_ukjent_storrelse:
                    continue
            elif (min_ansatte is not None and b["ansatte"] < min_ansatte) or (maks_ansatte is not None and b["ansatte"] > maks_ansatte):
                continue
        ut.append(b)
    return ut


def kvalifiser(db, orgnr, status, grunn, neste_handling, frist, endret):
    if status not in ("aktuell", "ikke aktuell", "vurderes"):
        raise ValueError("status må være aktuell, ikke aktuell eller vurderes")
    if status == "aktuell" and not (grunn.strip() and neste_handling.strip()):
        raise ValueError("aktuell krever kvalifiseringsgrunn og neste interne handling")
    db.execute("INSERT OR REPLACE INTO kvalifisering VALUES(?,?,?,?,?,?)", (orgnr, status, grunn, neste_handling, frist, endret))
    db.commit()


def eksport_csv(liste):
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["orgnr", "navn", "nace", "kommune", "postnr", "ansatte", "kilder", "oppdatert", "status", "grunn", "neste_handling", "frist"])
    for b in liste:
        q = b["kvalifisering"] or {}
        w.writerow([b["orgnr"], b["navn"], b["nace"], b["kommune"], b["postnr"], "ukjent" if b["ansatte"] is None else b["ansatte"],
                    "; ".join(f"{k['kilde']} {k['oppdatert']}" for k in b["kilder"]), b["oppdatert"], q.get("status", ""), q.get("grunn", ""),
                    q.get("neste_handling", ""), q.get("frist", "")])
    return buf.getvalue()
