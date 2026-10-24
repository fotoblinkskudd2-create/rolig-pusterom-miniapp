"""Versjonert register over kode og avhengigheter i kundeleveranser.

- En «oversikt» er knyttet til én leveranserevisjon (f.eks. git-commit eller tag) og endres ikke etter at den er låst.
- Komponent-identitet = (type, navn, versjon). Samme pakke i to versjoner er to rader.
- Lisens lagres slik den er OPPGITT i kilden (låsefil eller manuelt), med kilde. Ingen tolkning av kompatibilitet.
- Arbeidskø: ukjent/manglende lisens, og manglende attribusjonstekst der den oppgitte lisensen er på listen
  KREVER_ATTRIBUSJON (en registrert regel, ikke en juridisk vurdering).
Støttede importformater: package-lock.json (v2/v3, felt «packages»), requirements.txt (bare navn==versjon; lisens blir ukjent).
"""
import datetime as dt
import json
import re
import sqlite3

KREVER_ATTRIBUSJON = {"MIT", "BSD-2-Clause", "BSD-3-Clause", "Apache-2.0", "ISC"}
FORBEHOLD = "Oversikten viser dokumentert metadata. Den er ingen juridisk vurdering eller garanti for lisenskompatibilitet."


def koble(sti=":memory:"):
    db = sqlite3.connect(sti, check_same_thread=False)
    db.row_factory = sqlite3.Row
    db.executescript("""
    CREATE TABLE IF NOT EXISTS oversikt(id INTEGER PRIMARY KEY, leveranse TEXT, revisjon TEXT, opprettet TEXT, laast TEXT, UNIQUE(leveranse, revisjon));
    CREATE TABLE IF NOT EXISTS komponent(id INTEGER PRIMARY KEY, oversikt_id INT, type TEXT CHECK(type IN ('egen','tredjepart')), navn TEXT, versjon TEXT,
        lisens TEXT, lisens_kilde TEXT, kilde TEXT, attribusjon TEXT, UNIQUE(oversikt_id, type, navn, versjon));
    """)
    return db


def ny_oversikt(db, leveranse, revisjon, tid=None):
    cur = db.execute("INSERT INTO oversikt(leveranse, revisjon, opprettet) VALUES(?,?,?)", (leveranse, revisjon, tid or dt.datetime.now().isoformat(timespec="seconds")))
    db.commit()
    return cur.lastrowid


def _ulaast(db, oid):
    r = db.execute("SELECT laast FROM oversikt WHERE id=?", (oid,)).fetchone()
    if r is None:
        raise KeyError(oid)
    if r[0]:
        raise PermissionError(f"oversikt {oid} er låst {r[0]} og kan ikke endres; lag en ny oversikt for ny revisjon")


def legg_til(db, oid, type_, navn, versjon, lisens=None, lisens_kilde="manuelt", kilde="", attribusjon=None):
    _ulaast(db, oid)
    lisens = (lisens or "").strip() or None
    db.execute("""INSERT INTO komponent(oversikt_id,type,navn,versjon,lisens,lisens_kilde,kilde,attribusjon) VALUES(?,?,?,?,?,?,?,?)
        ON CONFLICT(oversikt_id,type,navn,versjon) DO UPDATE SET lisens=coalesce(excluded.lisens, lisens), lisens_kilde=CASE WHEN excluded.lisens IS NULL THEN lisens_kilde ELSE excluded.lisens_kilde END,
        kilde=excluded.kilde, attribusjon=coalesce(excluded.attribusjon, attribusjon)""",
               (oid, type_, navn, versjon, lisens, lisens_kilde if lisens else None, kilde, attribusjon))
    db.commit()


def importer_package_lock(db, oid, sti):
    data = json.load(open(sti, encoding="utf-8"))
    n = 0
    for nokkel, p in data.get("packages", {}).items():
        if not nokkel:  # rotprosjektet
            continue
        navn = p.get("name") or nokkel.split("node_modules/")[-1]
        legg_til(db, oid, "tredjepart", navn, p.get("version", "ukjent"), p.get("license"), "package-lock.json" if p.get("license") else None, p.get("resolved", "npm"))
        n += 1
    return n


def importer_requirements(db, oid, sti):
    n = 0
    for linje in open(sti, encoding="utf-8"):
        m = re.match(r"^\s*([A-Za-z0-9_.\-]+)\s*==\s*([A-Za-z0-9_.\-+]+)", linje)
        if m:
            legg_til(db, oid, "tredjepart", m.group(1).lower(), m.group(2), None, None, "PyPI (requirements.txt)")
            n += 1
    return n


def las(db, oid, tid=None):
    db.execute("UPDATE oversikt SET laast=? WHERE id=? AND laast IS NULL", (tid or dt.datetime.now().isoformat(timespec="seconds"), oid))
    db.commit()


def komponenter(db, oid):
    return [dict(r) for r in db.execute("SELECT * FROM komponent WHERE oversikt_id=? ORDER BY type, navn, versjon", (oid,))]


def arbeidsko(db, oid):
    ko = []
    for k in komponenter(db, oid):
        if not k["lisens"] or k["lisens"].upper() in ("UNKNOWN", "UNLICENSED", "SEE LICENSE IN LICENSE"):
            ko.append({**k, "problem": "ukjent lisens", "handling": "finn lisens i pakkens kildekode/register og registrer med kilde"})
        elif k["type"] == "tredjepart" and k["lisens"] in KREVER_ATTRIBUSJON and not k["attribusjon"]:
            ko.append({**k, "problem": "manglende attribusjon", "handling": f"legg inn opphavsrettslinje fra pakken ({k['lisens']} står på attribusjonslisten)"})
    return ko


def attribusjonsfil(db, oid):
    o = db.execute("SELECT * FROM oversikt WHERE id=?", (oid,)).fetchone()
    linjer = [f"TREDJEPARTSKOMPONENTER – {o['leveranse']} @ {o['revisjon']}", "", FORBEHOLD, ""]
    for k in komponenter(db, oid):
        if k["type"] != "tredjepart":
            continue
        linjer.append(f"{k['navn']} {k['versjon']}")
        linjer.append(f"  Lisens (oppgitt): {k['lisens'] or 'UKJENT – må avklares'}" + (f"  [kilde: {k['lisens_kilde']}]" if k["lisens_kilde"] else ""))
        linjer.append(f"  {k['attribusjon'] or 'ATTRIBUSJON MANGLER'}")
        linjer.append("")
    return "\n".join(linjer)


def sammenlign(db, a, b):
    ka = {(k["type"], k["navn"]): k for k in komponenter(db, a)}
    kb = {(k["type"], k["navn"]): k for k in komponenter(db, b)}
    ut = []
    for n in sorted(set(ka) | set(kb)):
        x, y = ka.get(n), kb.get(n)
        if x and not y:
            ut.append({"navn": n[1], "endring": "fjernet", "fra": x["versjon"], "til": None})
        elif y and not x:
            ut.append({"navn": n[1], "endring": "ny", "fra": None, "til": y["versjon"]})
        elif x["versjon"] != y["versjon"] or x["lisens"] != y["lisens"]:
            ut.append({"navn": n[1], "endring": "endret", "fra": f"{x['versjon']} ({x['lisens']})", "til": f"{y['versjon']} ({y['lisens']})"})
    return ut
