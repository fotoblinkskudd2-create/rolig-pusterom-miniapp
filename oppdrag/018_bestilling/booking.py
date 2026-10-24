"""Bestilling med kapasitetssperre.

Tidsblokker à 30 min. En tjeneste krever et antall sammenhengende blokker på ALLE sine navngitte ressurser.
Dobbeltbooking hindres i databasen: tabellen `laas` har PRIMARY KEY (ressurs, blokk). En reservasjon setter inn
én rad per (ressurs, blokk) i én transaksjon (BEGIN IMMEDIATE). Kolliderer én rad, rulles alt tilbake.
Midlertidige reservasjoner har utløpstid; utløpte frigjøres før hver operasjon (og ved eksplisitt rydding).
Avbestilling sletter låsene og markerer bestillingen; en ny avbestilling returnerer ikke kapasitet på nytt.
Ingen betaling, ingen kalenderinvitasjoner.
"""
import csv
import datetime as dt
import io
import sqlite3
import uuid

BLOKK_MIN = 30
TJENESTER = {
    "radgivning": {"navn": "Rådgivning", "blokker": 1, "ressurser": ["montor"]},
    "befaring": {"navn": "Befaring", "blokker": 2, "ressurser": ["montor"]},
    "service": {"navn": "Service på verksted", "blokker": 4, "ressurser": ["montor", "verksted"]},
}
RESSURSER = {"montor": "Montør Ola (fiktiv)", "verksted": "Verksted 1"}
APNING = (8, 16)  # 08:00–16:00, mandag–fredag


class Avvist(Exception):
    pass


def koble(sti):
    db = sqlite3.connect(sti, timeout=10, isolation_level=None, check_same_thread=False)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA journal_mode=WAL")
    db.executescript("""
    CREATE TABLE IF NOT EXISTS bestilling(id TEXT PRIMARY KEY, tjeneste TEXT, start TEXT, slutt TEXT, kunde TEXT, status TEXT,
        opprettet TEXT, utloper TEXT, bekreftet TEXT, avbestilt TEXT);
    CREATE TABLE IF NOT EXISTS laas(ressurs TEXT, blokk TEXT, bestilling_id TEXT, PRIMARY KEY(ressurs, blokk));
    CREATE TABLE IF NOT EXISTS stengt(ressurs TEXT, fra TEXT, til TEXT, grunn TEXT);
    """)
    return db


def blokker(start, antall):
    s = dt.datetime.fromisoformat(start)
    if s.minute % BLOKK_MIN or s.second:
        raise Avvist(f"start må være på hel {BLOKK_MIN}-minuttersblokk")
    return [(s + dt.timedelta(minutes=BLOKK_MIN * i)).isoformat(timespec="minutes") for i in range(antall)]


def innenfor_apning(bl):
    for b in bl:
        t = dt.datetime.fromisoformat(b)
        if t.weekday() > 4 or not (APNING[0] <= t.hour < APNING[1]):
            return False
    return True


def rydd_utlopte(db, naa):
    db.execute("BEGIN IMMEDIATE")
    ider = [r[0] for r in db.execute("SELECT id FROM bestilling WHERE status='reservert' AND utloper<=?", (naa,))]
    for i in ider:
        db.execute("DELETE FROM laas WHERE bestilling_id=?", (i,))
        db.execute("UPDATE bestilling SET status='utløpt' WHERE id=?", (i,))
    db.execute("COMMIT")
    return len(ider)


def reserver(db, tjeneste, start, kunde, naa, hold_min=10):
    t = TJENESTER.get(tjeneste)
    if not t:
        raise Avvist("ukjent tjeneste")
    bl = blokker(start, t["blokker"])
    if not innenfor_apning(bl):
        raise Avvist("utenfor åpningstid (man–fre 08–16)")
    rydd_utlopte(db, naa)
    bid = uuid.uuid4().hex[:10]
    slutt = (dt.datetime.fromisoformat(bl[-1]) + dt.timedelta(minutes=BLOKK_MIN)).isoformat(timespec="minutes")
    db.execute("BEGIN IMMEDIATE")
    try:
        for r in t["ressurser"]:
            s = db.execute("SELECT grunn FROM stengt WHERE ressurs=? AND fra<? AND til>?", (r, slutt, bl[0])).fetchone()
            if s:
                raise Avvist(f"{RESSURSER[r]} er stengt i perioden ({s[0]})")
        utlop = (dt.datetime.fromisoformat(naa) + dt.timedelta(minutes=hold_min)).isoformat(timespec="seconds")
        db.execute("INSERT INTO bestilling VALUES(?,?,?,?,?,'reservert',?,?,NULL,NULL)", (bid, tjeneste, bl[0], slutt, kunde, naa, utlop))
        for r in t["ressurser"]:
            for b in bl:
                db.execute("INSERT INTO laas VALUES(?,?,?)", (r, b, bid))  # PRIMARY KEY hindrer dobbeltbooking
        db.execute("COMMIT")
    except sqlite3.IntegrityError:
        db.execute("ROLLBACK")
        raise Avvist("tidspunktet er ikke ledig")
    except Exception:
        db.execute("ROLLBACK")
        raise
    return {"id": bid, "start": bl[0], "slutt": slutt, "utloper": utlop}


def bekreft(db, bid, naa):
    rydd_utlopte(db, naa)
    db.execute("BEGIN IMMEDIATE")
    r = db.execute("SELECT status FROM bestilling WHERE id=?", (bid,)).fetchone()
    if not r or r[0] != "reservert":
        db.execute("ROLLBACK")
        raise Avvist(f"kan ikke bekrefte (status {r[0] if r else 'ukjent'})")
    db.execute("UPDATE bestilling SET status='bekreftet', bekreftet=?, utloper=NULL WHERE id=?", (naa, bid))
    db.execute("COMMIT")


def avbestill(db, bid, naa):
    db.execute("BEGIN IMMEDIATE")
    r = db.execute("SELECT status FROM bestilling WHERE id=?", (bid,)).fetchone()
    if not r or r[0] not in ("reservert", "bekreftet"):
        db.execute("ROLLBACK")
        raise Avvist(f"kan ikke avbestille (status {r[0] if r else 'ukjent'})")
    frigjort = db.execute("DELETE FROM laas WHERE bestilling_id=?", (bid,)).rowcount
    db.execute("UPDATE bestilling SET status='avbestilt', avbestilt=? WHERE id=?", (naa, bid))
    db.execute("COMMIT")
    return frigjort


def ledige_starter(db, tjeneste, dag, naa):
    rydd_utlopte(db, naa)
    t = TJENESTER[tjeneste]
    ut = []
    d = dt.datetime.fromisoformat(dag + "T00:00")
    for h in range(APNING[0] * 60, APNING[1] * 60, BLOKK_MIN):
        s = (d + dt.timedelta(minutes=h)).isoformat(timespec="minutes")
        bl = blokker(s, t["blokker"])
        if not innenfor_apning(bl):
            continue
        slutt = (dt.datetime.fromisoformat(bl[-1]) + dt.timedelta(minutes=BLOKK_MIN)).isoformat(timespec="minutes")
        opptatt = any(db.execute("SELECT 1 FROM laas WHERE ressurs=? AND blokk=?", (r, b)).fetchone() for r in t["ressurser"] for b in bl)
        stengt = any(db.execute("SELECT 1 FROM stengt WHERE ressurs=? AND fra<? AND til>?", (r, slutt, bl[0])).fetchone() for r in t["ressurser"])
        if not opptatt and not stengt:
            ut.append(s)
    return ut


def eksport_csv(db):
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["id", "tjeneste", "start", "slutt", "kunde", "status", "opprettet", "bekreftet", "avbestilt"])
    for r in db.execute("SELECT * FROM bestilling ORDER BY start"):
        w.writerow([r["id"], TJENESTER[r["tjeneste"]]["navn"], r["start"], r["slutt"], r["kunde"], r["status"], r["opprettet"], r["bekreftet"] or "", r["avbestilt"] or ""])
    return buf.getvalue()


def demo(db, naa="2026-10-26T07:00:00"):
    """Fiktive data: stengt fredag 30.10 (verksted), og hele uke 45 (2.–6.11) fullbooket for montøren."""
    db.execute("INSERT INTO stengt VALUES('verksted','2026-10-30T00:00','2026-10-31T00:00','vedlikehold av løfteplattform')")
    for dag in range(2, 7):
        for h in range(8, 16):
            b = reserver(db, "befaring", f"2026-11-{dag:02d}T{h:02d}:00", f"Fiktiv kunde {dag}-{h}", naa)
            bekreft(db, b["id"], naa)
