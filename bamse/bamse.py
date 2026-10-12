#!/usr/bin/env python3
"""Bamse-hjerne: påminnelser, livstegn og familiekobling for en 58 cm eldre-bamse.

Kun standardbibliotek. Kjører på Raspberry Pi (knapp i poten via gpiozero) eller
i terminalen med simulert klokke. Familien får varsler i ntfy-appen – ingen egen app.

  python3 bamse.py --config config.json --sim 07:55 --fart 60
"""
import argparse
import json
import os
import queue
import shutil
import subprocess
import sys
import threading
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta


def hm(s):
    h, m = map(int, s.split(":"))
    return h * 60 + m


def minutter(dt):
    return dt.hour * 60 + dt.minute


def i_stilletid(cfg, dt):
    fra, til, n = hm(cfg["stille_fra"]), hm(cfg["stille_til"]), minutter(dt)
    return (n >= fra or n < til) if fra > til else (fra <= n < til)


def utvid_rutiner(cfg):
    """En rutine med "tider": [...] blir én rutine per klokkeslett."""
    ut = []
    for r in cfg["rutiner"]:
        for t in r.get("tider", [r.get("tid")]):
            d = {k: v for k, v in r.items() if k != "tider"}
            d["tid"] = t
            d["id"] = f'{r["type"]}@{t}'
            ut.append(d)
    return sorted(ut, key=lambda r: hm(r["tid"]))


class Bamse:
    def __init__(self, cfg, si, varsle, tilstandsfil=None):
        self.cfg = cfg
        self.si_ut = si          # si(tekst) -> høyttaler
        self.varsle = varsle     # varsle(tekst, prioritet, tags) -> familien
        self.tilstandsfil = tilstandsfil
        self.rutiner = utvid_rutiner(cfg)
        self.navn = cfg["navn"]
        self.innboks = []        # meldinger fra familien som ikke er lest opp
        self.s = None
        if tilstandsfil and os.path.exists(tilstandsfil):
            with open(tilstandsfil) as f:
                self.s = json.load(f)

    # --- tilstand -------------------------------------------------------
    def _ny_dag(self, dt):
        sist = self.s["sist_kontakt"] if self.s else None
        self.s = {
            "dag": dt.date().isoformat(),
            "rutiner": {r["id"]: {"status": "venter", "purr": 0, "sist": None} for r in self.rutiner},
            "sist_kontakt": sist,
            "kontakt_i_dag": 0,
            "ring_i_dag": 0,
            "meldinger_lest": 0,
            "venter_takk": None,
            "livstegn_varslet": False,
            "rapport_sendt": False,
        }

    def _lagre(self):
        if self.tilstandsfil:
            tmp = self.tilstandsfil + ".tmp"
            with open(tmp, "w") as f:
                json.dump(self.s, f, ensure_ascii=False, indent=1)
            os.replace(tmp, self.tilstandsfil)

    def _sikre_dag(self, now):
        if not self.s or self.s["dag"] != now.date().isoformat():
            self._ny_dag(now)

    def si(self, tekst):
        self.si_ut(tekst)

    # --- klokka driver alt ---------------------------------------------
    def tick(self, now):
        self._sikre_dag(now)
        n = minutter(now)
        for r in self.rutiner:
            st = self.s["rutiner"][r["id"]]
            purr_min = r.get("purr_min", 15)
            if st["status"] == "venter" and n >= hm(r["tid"]):
                if n - hm(r["tid"]) > purr_min:
                    # Bamsen var av da påminnelsen skulle gå. Å si «ta medisinen nå»
                    # to timer for sent kan gi dobbeldose. Ti stille, si fra til familien.
                    st["status"] = "ukjent"
                    if r.get("varsle_familie"):
                        self.varsle(f'Bamsen var av kl {r["tid"]}. Vet ikke om {self.navn} tok {r["type"]}. Ring og sjekk.',
                                    "high", "warning")
                    continue
                self.si(r["tekst"])
                st.update(status="aktiv", sist=now.isoformat())
            elif st["status"] == "aktiv" and now - datetime.fromisoformat(st["sist"]) >= timedelta(minutes=purr_min):
                if st["purr"] < r.get("maks_purr", 2):
                    st["purr"] += 1
                    st["sist"] = now.isoformat()
                    self.si(r.get("purr_tekst", r["tekst"]))
                else:
                    st["status"] = "savnet"
                    if r.get("varsle_familie"):
                        self.varsle(f'{self.navn} har ikke bekreftet {r["type"]} kl {r["tid"]} '
                                    f'({st["purr"] + 1} påminnelser). Ring og sjekk.',
                                    "high" if r["type"] == "medisin" else "default", "pill" if r["type"] == "medisin" else "droplet")

        frist = self.cfg.get("livstegn_frist")
        if frist and not self.s["kontakt_i_dag"] and not self.s["livstegn_varslet"] and n >= hm(frist):
            self.s["livstegn_varslet"] = True
            sist = self.s["sist_kontakt"] or "aldri"
            self.varsle(f"Ingen livstegn fra {self.navn} i dag (frist {frist}). Sist kontakt: {sist}. Ring {self.cfg.get('telefon', '')}.",
                        "urgent", "rotating_light")

        if self.innboks and not i_stilletid(self.cfg, now) and not any(
                st["status"] == "aktiv" for st in self.s["rutiner"].values()):
            fra, tekst = self.innboks.pop(0)
            self.si(f"Du har fått en melding fra {fra}. {tekst}. Klem poten min for å sende en klem tilbake.")
            self.s["meldinger_lest"] += 1
            self.s["venter_takk"] = fra

        rap = self.cfg.get("dagsrapport")
        if rap and not self.s["rapport_sendt"] and n >= hm(rap):
            self.s["rapport_sendt"] = True
            self.varsle(self.rapport(), "low", "teddy_bear")
        self._lagre()

    # --- poten ----------------------------------------------------------
    def _kontakt(self, now):
        self._sikre_dag(now)
        if not self.s["kontakt_i_dag"] and self.s["livstegn_varslet"]:
            self.varsle(f"Livstegn: {self.navn} klemte bamsen kl {now:%H:%M}.", "default", "white_check_mark")
        self.s["kontakt_i_dag"] += 1
        self.s["sist_kontakt"] = now.strftime("%Y-%m-%d %H:%M")

    def klem(self, now):
        """Kort trykk: bekreft påminnelse > takk for melding > småprat."""
        self._kontakt(now)
        for r in self.rutiner:
            st = self.s["rutiner"][r["id"]]
            if st["status"] == "aktiv":
                st["status"] = "bekreftet"
                st["sist"] = now.isoformat()
                self.si(r.get("takk", "Så bra. Takk for at du sa fra."))
                self._lagre()
                return
        if self.s["venter_takk"]:
            self.varsle(f"{self.navn} hørte meldingen din og sender en klem tilbake ❤", "default", "hugging_face")
            self.si("Jeg har sendt klemmen din.")
            self.s["venter_takk"] = None
        else:
            prat = self.cfg.get("prat") or ["Jeg er her."]
            self.si(prat[(self.s["kontakt_i_dag"] - 1) % len(prat)])
        self._lagre()

    def ring(self, now):
        """Langt trykk: ensomhet er et menneskeproblem. Bamsen henter et menneske."""
        self._kontakt(now)
        self.s["ring_i_dag"] += 1
        self.varsle(f"{self.navn} vil gjerne prate med noen NÅ (kl {now:%H:%M}). Ring {self.cfg.get('telefon', '')}.",
                    "high", "telephone_receiver")
        self.si("Jeg har sagt fra til familien din. Noen ringer deg snart.")
        self._lagre()

    def melding(self, fra, tekst):
        self.innboks.append((fra, tekst))

    def rapport(self):
        ikon = {"bekreftet": "✅", "savnet": "❌", "ukjent": "❓", "aktiv": "⏳", "venter": "·"}
        linjer = [f'{ikon[self.s["rutiner"][r["id"]]["status"]]} {r["tid"]} {r["type"]}' for r in self.rutiner]
        linjer.append(f'Klem på poten: {self.s["kontakt_i_dag"]} · Ville prate: {self.s["ring_i_dag"]} · '
                      f'Meldinger lest opp: {self.s["meldinger_lest"]}')
        if self.s["meldinger_lest"] == 0:
            linjer.append(f"Ingen sendte {self.navn} en melding i dag.")
        return f"Dagen til {self.navn}:\n" + "\n".join(linjer)


# --- ut i verden ------------------------------------------------------------
def lag_stemme():
    espeak = shutil.which("espeak-ng")

    def si(tekst):
        print(f"🧸  {tekst}", flush=True)
        if espeak:
            subprocess.run([espeak, "-v", "nb", "-s", "140", tekst], check=False)
    return si


def lag_varsler(cfg):
    server, topic = cfg.get("ntfy_server", "https://ntfy.sh"), cfg.get("topic_ut")
    feilet = []  # sendes på nytt ved neste varsel – et alarmvarsel skal ikke forsvinne fordi wifi hikket

    def send(tekst, prio, tags):
        q = urllib.parse.urlencode({"title": f"Bamsen til {cfg['navn']}", "priority": prio, "tags": tags})
        req = urllib.request.Request(f"{server}/{topic}?{q}", data=tekst.encode(), method="POST")
        urllib.request.urlopen(req, timeout=10).read()

    def varsle(tekst, prio="default", tags=""):
        print(f"📲  [{prio}] {tekst}", flush=True)
        if not topic:
            return
        feilet.append((tekst, prio, tags))
        while feilet:
            try:
                send(*feilet[0])
                feilet.pop(0)
            except Exception as e:
                print(f"⚠️  varsel ikke sendt ({e}), prøver igjen senere", file=sys.stderr)
                return
    return varsle


def lytt_innboks(cfg, hendelser):
    """Familien skriver i ntfy-appen på topic_inn. Bamsen leser det høyt."""
    server, topic = cfg.get("ntfy_server", "https://ntfy.sh"), cfg.get("topic_inn")
    if not topic:
        return
    since = str(int(time.time()))
    while True:
        try:
            with urllib.request.urlopen(f"{server}/{topic}/json?poll=1&since={since}", timeout=15) as r:
                for linje in r.read().decode().splitlines():
                    m = json.loads(linje)
                    if m.get("event") == "message":
                        since = m["id"]
                        hendelser.put(("melding", m.get("title") or "familien", m.get("message", "")))
        except Exception as e:
            print(f"⚠️  innboks: {e}", file=sys.stderr)
        time.sleep(30)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="config.json")
    ap.add_argument("--tilstand", default="bamse-tilstand.json")
    ap.add_argument("--sim", metavar="HH:MM", help="simuler klokka fra dette tidspunktet")
    ap.add_argument("--fart", type=float, default=60, help="simulerte sekunder per ekte sekund")
    ap.add_argument("--gpio", type=int, metavar="PIN", help="knapp i poten på denne GPIO-pinnen")
    a = ap.parse_args()

    with open(a.config) as f:
        cfg = json.load(f)
    hendelser = queue.Queue()

    if a.sim:
        t0, start = time.time(), datetime.combine(datetime.now().date(), datetime.strptime(a.sim, "%H:%M").time())
        klokke = lambda: start + timedelta(seconds=(time.time() - t0) * a.fart)
        tilstand = None  # simulering skal ikke rote til ekte tilstand
    else:
        klokke, tilstand = datetime.now, a.tilstand

    b = Bamse(cfg, lag_stemme(), lag_varsler(cfg), tilstand)

    if a.gpio is not None:
        from gpiozero import Button
        knapp = Button(a.gpio, hold_time=2)
        holdt = {"v": False}
        knapp.when_held = lambda: (holdt.update(v=True), hendelser.put(("ring",)))
        knapp.when_released = lambda: hendelser.put(("klem",)) if not holdt["v"] else holdt.update(v=False)

    def tastatur():
        print("k = klem poten · r = hold poten (vil prate) · m <tekst> = melding fra familien · s = status · q = slutt")
        for linje in sys.stdin:
            linje = linje.strip()
            if linje == "k":
                hendelser.put(("klem",))
            elif linje == "r":
                hendelser.put(("ring",))
            elif linje.startswith("m "):
                hendelser.put(("melding", "Kari", linje[2:]))
            elif linje == "s":
                hendelser.put(("status",))
            elif linje == "q":
                hendelser.put(("slutt",))
    threading.Thread(target=tastatur, daemon=True).start()
    threading.Thread(target=lytt_innboks, args=(cfg, hendelser), daemon=True).start()

    while True:
        now = klokke()
        try:
            while True:
                h = hendelser.get_nowait()
                if h[0] == "klem":
                    b.klem(now)
                elif h[0] == "ring":
                    b.ring(now)
                elif h[0] == "melding":
                    b.melding(h[1], h[2])
                elif h[0] == "status":
                    print(f"[{now:%H:%M}]\n{b.rapport()}")
                elif h[0] == "slutt":
                    return
        except queue.Empty:
            pass
        b.tick(now)
        time.sleep(1)


if __name__ == "__main__":
    main()
