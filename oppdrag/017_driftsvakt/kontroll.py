import os
import sys
import urllib.request

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HER)
sys.path.insert(0, os.path.join(HER, ".."))
import testserver  # noqa: E402
import vakt as V  # noqa: E402
from felles.kontroll import kjor  # noqa: E402


def modus(m):
    urllib.request.urlopen(f"http://127.0.0.1:8917/modus/{m}").read()


def kontroll(k):
    srv = testserver.start(8917)
    try:
        konfig = V.les_konfig(os.path.join(HER, "konfig.json"))
        db = V.koble()
        forlop = []

        def steg(m, tid, merknad):
            modus(m)
            r = V.kjor_runde(db, konfig, tid)[0]
            aapen = db.execute("SELECT id FROM hendelse WHERE lukket IS NULL").fetchone()
            forlop.append(f"| {tid[11:]} | {m} | {r[1]} | {r[2] or '–'} | {r[3]:.0f} | {r[4] or ''} | {'#' + str(aapen[0]) if aapen else '–'} | {merknad} |")
            return r

        testserver.TILSTAND["treg_sek"] = 3.0
        k.lik("frisk → ok", steg("frisk", "2026-10-24T10:00:00", "")[1], "ok")
        r = steg("feilende", "2026-10-24T10:00:10", "første feil – under terskel")
        k.lik("feilende → http_feil 503", (r[1], r[2]), ("http_feil", 503))
        k.lik("én feil åpner ikke hendelse (terskel 2)", db.execute("SELECT count(*) FROM hendelse").fetchone()[0], 0)
        steg("feilende", "2026-10-24T10:00:20", "andre feil – hendelse åpnes")
        k.lik("to påfølgende feil åpner én hendelse", db.execute("SELECT count(*) FROM hendelse WHERE lukket IS NULL").fetchone()[0], 1)
        r = steg("treg", "2026-10-24T10:00:30", "treg > timeout")
        k.lik("treg server over tidsgrensen gir timeout, ikke HTTP-feil", (r[1], r[2]), ("timeout", None))
        steg("nede", "2026-10-24T10:00:40", "tilkobling lukket")
        k.lik("fortsatt bare én hendelse etter gjentatte feil", db.execute("SELECT count(*) FROM hendelse").fetchone()[0], 1)
        h = db.execute("SELECT * FROM hendelse").fetchone()
        k.lik("hendelsen teller fire feil", h["antall_feil"], 4)
        k.lik("alle fire feilmålinger er knyttet til hendelsen og beholdt", db.execute("SELECT count(*) FROM maling WHERE hendelse_id=?", (h["id"],)).fetchone()[0], 4)
        k.lik("råmålinger beholdes (5 så langt)", db.execute("SELECT count(*) FROM maling").fetchone()[0], 5)
        steg("frisk", "2026-10-24T10:00:50", "gjenoppretting – hendelse lukkes")
        h = db.execute("SELECT * FROM hendelse").fetchone()
        k.lik("gjenoppretting lukker hendelsen", h["lukket"], "2026-10-24T10:00:50")
        testserver.TILSTAND["treg_sek"] = 0.7
        r = steg("treg", "2026-10-24T10:01:00", "treg men innen timeout")
        k.lik("svar innen timeout men over 500 ms gir «treg»", r[1], "treg")
        testserver.TILSTAND["treg_sek"] = 3.0
        steg("feilende", "2026-10-24T22:10:00", "i vedlikeholdsvindu")
        steg("feilende", "2026-10-24T22:10:10", "i vedlikeholdsvindu")
        k.lik("feil i vedlikeholdsvindu merkes og åpner ikke hendelse", (db.execute("SELECT count(*) FROM maling WHERE vedlikehold=1").fetchone()[0], db.execute("SELECT count(*) FROM hendelse").fetchone()[0]), (2, 1))
        steg("feilende", "2026-10-24T23:00:10", "etter vindu – første feil")
        k.lik("vedlikeholdsfeil teller ikke mot terskelen etter vinduet", db.execute("SELECT count(*) FROM hendelse").fetchone()[0], 1)
        steg("frisk", "2026-10-24T23:00:20", "")
        s = V.status(db, konfig)[0]
        k.lik("tilgjengelighet regnes uten vedlikeholdsmålinger (4 ok/treg av 9)", (s["tilgjengelighet_prosent"], s["malinger_utenfor_vedlikehold"]), (44.44, 9))
        k.kaster("URL som ikke er i konfigurasjonen kontrolleres ikke", lambda: V.kjor_runde(db, konfig, "t", url="http://127.0.0.1:8917/annet"), PermissionError)
        k.kaster("ugyldig URL i konfigurasjonen avvises", lambda: V.les_konfig_data({"endepunkter": [{"id": "x", "url": "ftp://x"}]}), ValueError)
        os.makedirs(os.path.join(HER, "resultat"), exist_ok=True)
        with open(os.path.join(HER, "resultat", "feilforlop.md"), "w", encoding="utf-8") as f:
            f.write("# Dokumentert feilforløp (faktisk kjøring mot lokal testserver)\n\nTerskel: 2 påfølgende feil. Timeout 1,0 s. Treg-grense 500 ms.\n\n")
            f.write("| Tid | Servermodus | Utfall | Status | ms | Årsak | Åpen hendelse | Merknad |\n|---|---|---|---|---:|---|---|---|\n")
            f.write("\n".join(forlop) + "\n")
    finally:
        srv.shutdown()


kjor("017 Driftsvakt", HER, kontroll)
