"""Driftsvakt for uttrykkelig angitte helseendepunkter.

- Bare URL-er i konfigurasjonen kontrolleres. Omdirigeringer følges ikke (de kunne ført til andre mål).
- Hver måling lagres rått: tidspunkt, statuskode, responstid, utfall og feilårsak.
  Utfall: ok | treg | http_feil | timeout | tilkoblingsfeil.
- Timeout skilles fra HTTP-feil: timeout = ingen svar innen tidsgrensen; http_feil = svar med feil statuskode.
- Hendelser: etter N påfølgende feil åpnes ÉN hendelse. Nye feil knyttes til den åpne hendelsen (rådata beholdes).
  Første ok-måling lukker hendelsen. Feil i vedlikeholdsvindu merkes «vedlikehold» og åpner ikke hendelse.
- Ingen ekstern varsling.
"""
import datetime as dt
import http.client
import json
import socket
import sqlite3
import time
import urllib.parse


def koble(sti=":memory:"):
    db = sqlite3.connect(sti, check_same_thread=False)
    db.row_factory = sqlite3.Row
    db.executescript("""
    CREATE TABLE IF NOT EXISTS maling(id INTEGER PRIMARY KEY, endepunkt TEXT, tid TEXT, utfall TEXT, status INT, ms REAL, aarsak TEXT,
        vedlikehold INT DEFAULT 0, hendelse_id INT);
    CREATE TABLE IF NOT EXISTS hendelse(id INTEGER PRIMARY KEY, endepunkt TEXT, aapnet TEXT, lukket TEXT, forste_aarsak TEXT, antall_feil INT);
    """)
    return db


def les_konfig(sti):
    return les_konfig_data(json.load(open(sti, encoding="utf-8")))


def les_konfig_data(k):
    for e in k["endepunkter"]:
        u = urllib.parse.urlparse(e["url"])
        if u.scheme not in ("http", "https") or not u.hostname:
            raise ValueError(f"ugyldig URL for {e['id']}: {e['url']}")
    return k


def mal(endepunkt):
    """Én HTTP GET uten omdirigering. Returnerer (utfall, status, ms, årsak)."""
    u = urllib.parse.urlparse(endepunkt["url"])
    klasse = http.client.HTTPSConnection if u.scheme == "https" else http.client.HTTPConnection
    t0 = time.perf_counter()
    c = klasse(u.hostname, u.port, timeout=endepunkt["timeout_sek"])
    try:
        c.request("GET", u.path or "/", headers={"User-Agent": "driftsvakt-lokal/1"})
        r = c.getresponse()
        r.read(4096)
        ms = (time.perf_counter() - t0) * 1000
        if r.status != endepunkt.get("forventet_status", 200):
            return "http_feil", r.status, ms, f"HTTP {r.status} {r.reason}"
        if ms > endepunkt.get("treg_ms", 10**9):
            return "treg", r.status, ms, f"svar etter {ms:.0f} ms (grense {endepunkt['treg_ms']} ms)"
        return "ok", r.status, ms, None
    except (socket.timeout, TimeoutError):
        return "timeout", None, (time.perf_counter() - t0) * 1000, f"ingen svar innen {endepunkt['timeout_sek']} s"
    except (ConnectionError, http.client.HTTPException, OSError) as e:
        return "tilkoblingsfeil", None, (time.perf_counter() - t0) * 1000, f"{type(e).__name__}: {e}"
    finally:
        c.close()


def i_vedlikehold(konfig, eid, tid):
    return next((v for v in konfig.get("vedlikehold", []) if v["endepunkt"] == eid and v["fra"] <= tid < v["til"]), None)


def registrer(db, konfig, eid, tid, utfall, status, ms, aarsak):
    """Lagrer rå måling og oppdaterer hendelser. Skilt fra mal() så forløp kan testes deterministisk."""
    vedl = i_vedlikehold(konfig, eid, tid)
    feil = utfall in ("http_feil", "timeout", "tilkoblingsfeil")
    aapen = db.execute("SELECT * FROM hendelse WHERE endepunkt=? AND lukket IS NULL", (eid,)).fetchone()
    hid = None
    if feil and not vedl:
        if aapen:
            hid = aapen["id"]
            db.execute("UPDATE hendelse SET antall_feil=antall_feil+1 WHERE id=?", (hid,))
        else:
            tidligere = db.execute("SELECT utfall, vedlikehold FROM maling WHERE endepunkt=? ORDER BY id DESC LIMIT ?", (eid, konfig["terskel_feil_for_hendelse"] - 1)).fetchall()
            if len(tidligere) == konfig["terskel_feil_for_hendelse"] - 1 and all(r["utfall"] in ("http_feil", "timeout", "tilkoblingsfeil") and not r["vedlikehold"] for r in tidligere):
                hid = db.execute("INSERT INTO hendelse(endepunkt, aapnet, forste_aarsak, antall_feil) VALUES(?,?,?,?)",
                                 (eid, tid, aarsak, konfig["terskel_feil_for_hendelse"])).lastrowid
                # Knytt de foregående feilmålingene til hendelsen
                ider = [r[0] for r in db.execute("SELECT id FROM maling WHERE endepunkt=? ORDER BY id DESC LIMIT ?", (eid, konfig["terskel_feil_for_hendelse"] - 1))]
                db.executemany("UPDATE maling SET hendelse_id=? WHERE id=?", [(hid, i) for i in ider])
    elif utfall in ("ok", "treg") and aapen:
        db.execute("UPDATE hendelse SET lukket=? WHERE id=?", (tid, aapen["id"]))
    db.execute("INSERT INTO maling(endepunkt,tid,utfall,status,ms,aarsak,vedlikehold,hendelse_id) VALUES(?,?,?,?,?,?,?,?)",
               (eid, tid, utfall, status, ms, aarsak, 1 if vedl else 0, hid))
    db.commit()


def kjor_runde(db, konfig, tid=None, url=None):
    tid = tid or dt.datetime.now().isoformat(timespec="seconds")
    ut = []
    for e in konfig["endepunkter"]:
        if url and e["url"] != url:
            continue
        resultat = mal(e)
        registrer(db, konfig, e["id"], tid, *resultat)
        ut.append((e["id"], *resultat))
    if url and not ut:
        raise PermissionError(f"{url} er ikke uttrykkelig angitt i konfigurasjonen og kontrolleres ikke")
    return ut


def status(db, konfig):
    ut = []
    for e in konfig["endepunkter"]:
        siste = db.execute("SELECT * FROM maling WHERE endepunkt=? ORDER BY id DESC LIMIT 1", (e["id"],)).fetchone()
        aapen = db.execute("SELECT * FROM hendelse WHERE endepunkt=? AND lukket IS NULL", (e["id"],)).fetchone()
        ok = db.execute("SELECT count(*) FROM maling WHERE endepunkt=? AND utfall IN ('ok','treg') AND vedlikehold=0", (e["id"],)).fetchone()[0]
        n = db.execute("SELECT count(*) FROM maling WHERE endepunkt=? AND vedlikehold=0", (e["id"],)).fetchone()[0]
        ut.append({**e, "siste": dict(siste) if siste else None, "aapen_hendelse": dict(aapen) if aapen else None,
                   "tilgjengelighet_prosent": round(100 * ok / n, 2) if n else None, "malinger_utenfor_vedlikehold": n})
    return ut
