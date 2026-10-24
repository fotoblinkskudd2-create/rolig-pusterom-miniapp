import concurrent.futures as cf
import json
import os
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HER)
sys.path.insert(0, os.path.join(HER, ".."))
import booking as B  # noqa: E402
from felles.kontroll import kjor  # noqa: E402

T0 = "2026-10-26T07:00:00"


def post(url, data=None):
    req = urllib.request.Request(url, data=json.dumps(data or {}).encode(), headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def kontroll(k):
    mappe = tempfile.mkdtemp()
    db = B.koble(os.path.join(mappe, "a.db"))
    B.demo(db, T0)
    k.lik("tre tjenester og to ressurser", (len(B.TJENESTER), len(B.RESSURSER)), (3, 2))
    k.lik("fullbooket uke: ingen ledig befaring 3.11", B.ledige_starter(db, "befaring", "2026-11-03", T0), [])
    k.lik("fullbooket uke: service krever montør → heller ikke ledig", B.ledige_starter(db, "service", "2026-11-04", T0), [])
    k.lik("stengt verksted fredag 30.10: ingen service", B.ledige_starter(db, "service", "2026-10-30", T0), [])
    k.sjekk("stengt verksted hindrer ikke rådgivning samme dag", len(B.ledige_starter(db, "radgivning", "2026-10-30", T0)) == 16)
    k.kaster("reservasjon i stengt periode avvises", lambda: B.reserver(db, "service", "2026-10-30T09:00", "x", T0), B.Avvist)
    k.kaster("utenfor åpningstid avvises", lambda: B.reserver(db, "befaring", "2026-10-27T15:30", "x", T0), B.Avvist)
    # Utløp
    r = B.reserver(db, "befaring", "2026-10-27T09:00", "Kunde A", T0, hold_min=10)
    k.kaster("samme tid kan ikke reserveres mens holdet varer", lambda: B.reserver(db, "befaring", "2026-10-27T09:30", "Kunde B", "2026-10-26T07:05:00"), B.Avvist)
    r2 = B.reserver(db, "befaring", "2026-10-27T09:30", "Kunde B", "2026-10-26T07:11:00")
    k.sjekk("utløpt reservasjon frigjøres (ny kunde får 09:30 etter 10 min)", bool(r2["id"]))
    k.lik("utløpt reservasjon har status utløpt", db.execute("SELECT status FROM bestilling WHERE id=?", (r["id"],)).fetchone()[0], "utløpt")
    k.kaster("utløpt reservasjon kan ikke bekreftes", lambda: B.bekreft(db, r["id"], "2026-10-26T07:12:00"), B.Avvist)
    B.bekreft(db, r2["id"], "2026-10-26T07:12:00")
    # Avbestilling returnerer kapasitet én gang
    for_ = len(B.ledige_starter(db, "radgivning", "2026-10-27", T0))
    k.lik("avbestilling frigjør to blokker", B.avbestill(db, r2["id"], "2026-10-26T08:00:00"), 2)
    k.lik("…og gir to nye ledige rådgivningstider", len(B.ledige_starter(db, "radgivning", "2026-10-27", T0)) - for_, 2)
    k.kaster("ny avbestilling av samme bestilling avvises", lambda: B.avbestill(db, r2["id"], "2026-10-26T08:01:00"), B.Avvist)
    k.lik("kapasiteten er ikke returnert to ganger", len(B.ledige_starter(db, "radgivning", "2026-10-27", T0)) - for_, 2)
    k.lik("ingen låser uten aktiv bestilling", db.execute("SELECT count(*) FROM laas l JOIN bestilling b ON b.id=l.bestilling_id WHERE b.status NOT IN ('reservert','bekreftet')").fetchone()[0], 0)

    # Samtidighet over HTTP mot ekte server (flere tråder i uvicorn, egen tilkobling per forespørsel)
    dbsti = os.path.join(mappe, "http.db")
    c = B.koble(dbsti)
    B.demo(c, T0)
    # Fyll mandag 26.10 08:00–15:00 for montør slik at bare 15:00 og 15:30 (én befaring) gjenstår
    for h in range(8, 15):
        b = B.reserver(c, "befaring", f"2026-10-26T{h:02d}:00", "fyll", T0)
        B.bekreft(c, b["id"], T0)
    c.close()
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        port = s.getsockname()[1]
    proc = subprocess.Popen([sys.executable, "-c", f"import sys;sys.path.insert(0,{HER!r});import uvicorn,app;uvicorn.run(app.lag_app({dbsti!r}, lambda: '{T0}'),host='127.0.0.1',port={port},log_level='error')"])
    try:
        for _ in range(100):
            try:
                urllib.request.urlopen(f"http://127.0.0.1:{port}/api/tjenester", timeout=1)
                break
            except OSError:
                time.sleep(0.1)
        url = f"http://127.0.0.1:{port}/api/reservasjoner"
        with cf.ThreadPoolExecutor(20) as ex:
            svar = list(ex.map(lambda i: post(url, {"tjeneste": "befaring", "start": "2026-10-26T15:00", "kunde": f"Samtidig {i}"}), range(20)))
        ok = [s for s in svar if s[0] == 200]
        nei = [s for s in svar if s[0] == 409]
        k.lik("20 samtidige forsøk på siste ledige blokk: nøyaktig ett lykkes", (len(ok), len(nei)), (1, 19))
        c = B.koble(dbsti)
        k.lik("databasen har én aktiv bestilling på 15:00", c.execute("SELECT count(*) FROM bestilling WHERE start='2026-10-26T15:00' AND status='reservert'").fetchone()[0], 1)
        k.lik("ingen dobbel lås på montørens 15:00-blokk", c.execute("SELECT count(*) FROM laas WHERE ressurs='montor' AND blokk='2026-10-26T15:00'").fetchone()[0], 1)
        # Samtidig avbestilling
        bid = ok[0][1]["id"]
        with cf.ThreadPoolExecutor(10) as ex:
            av = list(ex.map(lambda i: post(f"{url}/{bid}/avbestill"), range(10)))
        k.lik("10 samtidige avbestillinger: én frigjør 2 blokker, ni avvises", sorted(s[0] for s in av), [200] + [409] * 9)
        k.lik("frigjorte blokker totalt = 2", sum(s[1].get("frigjorte_blokker", 0) for s in av), 2)
        os.makedirs(os.path.join(HER, "resultat"), exist_ok=True)
        csvtekst = urllib.request.urlopen(f"http://127.0.0.1:{port}/api/eksport.csv").read().decode()
        open(os.path.join(HER, "resultat", "bestillinger.csv"), "w", encoding="utf-8").write(csvtekst)
        k.sjekk("eksport inneholder avbestilt bestilling", "avbestilt" in csvtekst)
    finally:
        proc.terminate()


kjor("018 Bestilling med kapasitetssperre", HER, kontroll)
