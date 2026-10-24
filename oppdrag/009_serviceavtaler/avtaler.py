"""Serviceavtaler: fristberegning, arbeidskø, historikk og ICS-eksport.

Datoregel: siste oppsigelsesdag = sluttdato − varslingsfrist.
  Måneder trekkes fra kalendermåned: hvis dagen ikke finnes, brukes siste dag i måneden
  (31.03 − 1 mnd = 28.02 / 29.02 i skuddår). Dager trekkes fra som kalenderdager.
Manglende varslingsfrist gir status «frist ukjent» – aldri en gjettet dato.
"""
import calendar
import datetime as dt
import json
import sqlite3
import uuid

FELT = ["navn", "leverandor", "start", "slutt", "varsling_antall", "varsling_enhet", "ansvarlig", "pris_per_aar", "originaldokument", "status"]


def koble(sti=":memory:"):
    db = sqlite3.connect(sti, check_same_thread=False)
    db.row_factory = sqlite3.Row
    db.executescript("""
    CREATE TABLE IF NOT EXISTS avtale(id TEXT PRIMARY KEY, navn TEXT, leverandor TEXT, start TEXT, slutt TEXT,
        varsling_antall INT, varsling_enhet TEXT, ansvarlig TEXT, pris_per_aar REAL, originaldokument TEXT,
        status TEXT DEFAULT 'aktiv', vilkaar_bekreftet INT DEFAULT 0, bekreftet_av TEXT, bekreftet_tid TEXT);
    CREATE TABLE IF NOT EXISTS historikk(id INTEGER PRIMARY KEY, avtale_id TEXT, tid TEXT, felt TEXT, gammel TEXT, ny TEXT, av TEXT);
    """)
    return db


def minus_maaneder(d, n):
    m = d.month - n
    aar = d.year + (m - 1) // 12
    mnd = (m - 1) % 12 + 1
    return dt.date(aar, mnd, min(d.day, calendar.monthrange(aar, mnd)[1]))


def siste_oppsigelsesdag(slutt, antall, enhet):
    if antall is None or enhet not in ("dager", "måneder"):
        return None
    s = dt.date.fromisoformat(slutt)
    return minus_maaneder(s, antall) if enhet == "måneder" else s - dt.timedelta(days=antall)


def opprett(db, a, tid, av="import"):
    db.execute(f"INSERT INTO avtale(id,{','.join(FELT)}) VALUES(?,{','.join('?' * len(FELT))})", [a["id"]] + [a.get(f) for f in FELT[:-1]] + [a.get("status", "aktiv")])
    db.execute("INSERT INTO historikk(avtale_id,tid,felt,gammel,ny,av) VALUES(?,?,?,?,?,?)", (a["id"], tid, "opprettet", None, json.dumps(a, ensure_ascii=False), av))
    db.commit()


def endre(db, aid, endringer, tid, av):
    gml = dict(db.execute("SELECT * FROM avtale WHERE id=?", (aid,)).fetchone())
    for f, v in endringer.items():
        if f not in FELT:
            raise ValueError(f"ukjent felt {f}")
        if str(gml[f]) != str(v):
            db.execute("INSERT INTO historikk(avtale_id,tid,felt,gammel,ny,av) VALUES(?,?,?,?,?,?)", (aid, tid, f, gml[f], v, av))
            db.execute(f"UPDATE avtale SET {f}=? WHERE id=?", (v, aid))
    # Endrede vilkår må bekreftes på nytt mot kilden
    if any(f in endringer for f in ("slutt", "varsling_antall", "varsling_enhet", "pris_per_aar")):
        db.execute("UPDATE avtale SET vilkaar_bekreftet=0, bekreftet_av=NULL, bekreftet_tid=NULL WHERE id=?", (aid,))
    db.commit()


def bekreft(db, aid, av, tid):
    db.execute("UPDATE avtale SET vilkaar_bekreftet=1, bekreftet_av=?, bekreftet_tid=? WHERE id=?", (av, tid, aid))
    db.execute("INSERT INTO historikk(avtale_id,tid,felt,gammel,ny,av) VALUES(?,?,?,?,?,?)", (aid, tid, "vilkår bekreftet mot originaldokument", None, None, av))
    db.commit()


def vurder(rad, idag):
    a = dict(rad)
    frist = siste_oppsigelsesdag(a["slutt"], a["varsling_antall"], a["varsling_enhet"])
    a["siste_oppsigelsesdag"] = frist.isoformat() if frist else None
    slutt = dt.date.fromisoformat(a["slutt"])
    if a["status"] == "avsluttet":
        a["ko_status"], a["dager_til_frist"] = "avsluttet", None
    elif frist is None:
        a["ko_status"], a["dager_til_frist"] = "frist ukjent", None
    else:
        d = (frist - idag).days
        a["dager_til_frist"] = d
        a["ko_status"] = ("frist passert" if slutt >= idag else "utløpt") if d < 0 else ("handling nå" if d <= 30 else ("planlegg" if d <= 90 else "ok"))
    a["vilkaar_bekreftet"] = bool(a["vilkaar_bekreftet"])
    return a


def oversikt(db, idag):
    return [vurder(r, idag) for r in db.execute("SELECT * FROM avtale ORDER BY id")]


def arbeidsko(db, idag):
    rek = {"frist ukjent": 0, "handling nå": 1, "frist passert": 2, "planlegg": 3, "utløpt": 4}
    ko = [a for a in oversikt(db, idag) if a["ko_status"] in rek]
    return sorted(ko, key=lambda a: (rek[a["ko_status"]], a["dager_til_frist"] if a["dager_til_frist"] is not None else -10**6))


def historikk(db, aid):
    return [dict(r) for r in db.execute("SELECT tid,felt,gammel,ny,av FROM historikk WHERE avtale_id=? ORDER BY id", (aid,))]


def _esc(t):
    return str(t).replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")


def ics(avtaler, laget):
    """Heldagshendelser for siste oppsigelsesdag og sluttdato. Ingen påminnelser sendes; filen importeres manuelt."""
    stempel = laget.strftime("%Y%m%dT%H%M%SZ")
    linjer = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//oppdrag009//serviceavtaler//NO", "CALSCALE:GREGORIAN"]
    for a in avtaler:
        for type_, dato in (("Siste oppsigelsesdag", a["siste_oppsigelsesdag"]), ("Avtale utløper", a["slutt"])):
            if not dato:
                continue
            d = dt.date.fromisoformat(dato)
            uid = uuid.uuid5(uuid.NAMESPACE_URL, f"oppdrag009/{a['id']}/{type_}/{dato}")
            linjer += ["BEGIN:VEVENT", f"UID:{uid}", f"DTSTAMP:{stempel}", f"DTSTART;VALUE=DATE:{d:%Y%m%d}",
                       f"DTEND;VALUE=DATE:{d + dt.timedelta(days=1):%Y%m%d}",
                       f"SUMMARY:{_esc(type_ + ': ' + a['navn'])}",
                       f"DESCRIPTION:{_esc('Ansvarlig: ' + (a['ansvarlig'] or 'ukjent') + '. Kilde: ' + (a['originaldokument'] or 'mangler') + ('' if a['vilkaar_bekreftet'] else '. VILKÅR IKKE BEKREFTET'))}",
                       "END:VEVENT"]
    linjer.append("END:VCALENDAR")
    return "\r\n".join(linjer) + "\r\n"
