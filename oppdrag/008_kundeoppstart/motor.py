"""Kundeoppstart med dokumentkrav. Lokal demo: ingen innlogging, ingen flerbrukersikkerhet.

Statusmodell per filversjon: mottatt → godkjent | avvist; en godkjent versjon blir 'erstattet' når en ny
versjon lastes opp. Et krav er oppfylt bare når siste versjon er godkjent. Saken kan ferdigstilles
når alle obligatoriske krav er oppfylt.
"""
import datetime as dt
import hashlib
import io
import json
import os
import sqlite3
import zipfile

SKJEMA = """
CREATE TABLE IF NOT EXISTS sak(id TEXT PRIMARY KEY, kunde TEXT, tittel TEXT, status TEXT DEFAULT 'åpen', ferdigstilt TEXT);
CREATE TABLE IF NOT EXISTS krav(id TEXT PRIMARY KEY, sak_id TEXT, navn TEXT, obligatorisk INT, filtyper TEXT,
    maks_bytes INT, ansvarlig TEXT, frist TEXT);
CREATE TABLE IF NOT EXISTS fil(id INTEGER PRIMARY KEY, krav_id TEXT, versjon INT, filnavn TEXT, sha256 TEXT, bytes INT,
    mottatt TEXT, status TEXT, avvisningsgrunn TEXT, behandlet TEXT);
CREATE TABLE IF NOT EXISTS logg(id INTEGER PRIMARY KEY, sak_id TEXT, tid TEXT, hendelse TEXT, detalj TEXT);
"""


class Avvist(Exception):
    pass


class Motor:
    def __init__(self, db_sti=":memory:", lager="lager", klokke=None):
        self.db = sqlite3.connect(db_sti, check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.db.executescript(SKJEMA)
        self.lager = lager
        os.makedirs(lager, exist_ok=True)
        self.klokke = klokke or (lambda: dt.datetime.now().isoformat(timespec="seconds"))

    def logg(self, sak, hendelse, detalj=""):
        self.db.execute("INSERT INTO logg(sak_id,tid,hendelse,detalj) VALUES(?,?,?,?)", (sak, self.klokke(), hendelse, detalj))

    def opprett(self, data):
        self.db.execute("INSERT INTO sak(id,kunde,tittel) VALUES(?,?,?)", (data["id"], data["kunde"], data["tittel"]))
        for k in data["krav"]:
            self.db.execute("INSERT INTO krav VALUES(?,?,?,?,?,?,?,?)", (k["id"], data["id"], k["navn"], int(k["obligatorisk"]),
                            ",".join(k["filtyper"]), k["maks_bytes"], k["ansvarlig"], k["frist"]))
        self.logg(data["id"], "sak opprettet", f"{len(data['krav'])} krav")
        self.db.commit()

    def krav(self, kid):
        r = self.db.execute("SELECT * FROM krav WHERE id=?", (kid,)).fetchone()
        if not r:
            raise KeyError(kid)
        return dict(r)

    def last_opp(self, kid, filnavn, innhold: bytes):
        k = self.krav(kid)
        sak = self.db.execute("SELECT status FROM sak WHERE id=?", (k["sak_id"],)).fetchone()[0]
        if sak == "ferdigstilt":
            raise Avvist("saken er ferdigstilt; nye filer tas ikke imot")
        ext = filnavn.rsplit(".", 1)[-1].lower() if "." in filnavn else ""
        if ext not in k["filtyper"].split(","):
            self.logg(k["sak_id"], "opplasting avvist", f"{kid}: filtype .{ext} ikke tillatt ({k['filtyper']})")
            self.db.commit()
            raise Avvist(f"filtype .{ext} er ikke tillatt for {k['navn']} (tillatt: {k['filtyper']})")
        if len(innhold) > k["maks_bytes"]:
            self.logg(k["sak_id"], "opplasting avvist", f"{kid}: {len(innhold)} B > {k['maks_bytes']} B")
            self.db.commit()
            raise Avvist(f"filen er {len(innhold)} B, maks {k['maks_bytes']} B")
        if len(innhold) == 0:
            raise Avvist("tom fil")
        h = hashlib.sha256(innhold).hexdigest()
        with open(os.path.join(self.lager, h), "wb") as f:
            f.write(innhold)
        forrige = self.db.execute("SELECT * FROM fil WHERE krav_id=? ORDER BY versjon DESC LIMIT 1", (kid,)).fetchone()
        v = (forrige["versjon"] + 1) if forrige else 1
        if forrige and forrige["status"] in ("godkjent", "mottatt"):
            self.db.execute("UPDATE fil SET status='erstattet' WHERE id=?", (forrige["id"],))
        self.db.execute("INSERT INTO fil(krav_id,versjon,filnavn,sha256,bytes,mottatt,status) VALUES(?,?,?,?,?,?,'mottatt')",
                        (kid, v, filnavn, h, len(innhold), self.klokke()))
        self.logg(k["sak_id"], "fil mottatt", f"{kid} v{v} {filnavn} sha256={h[:12]}…" + (f" (erstatter v{v - 1})" if forrige else ""))
        self.db.commit()
        return v

    def behandle(self, kid, versjon, godkjenn, grunn=""):
        f = self.db.execute("SELECT * FROM fil WHERE krav_id=? AND versjon=?", (kid, versjon)).fetchone()
        if not f:
            raise KeyError(f"{kid} v{versjon}")
        siste = self.db.execute("SELECT max(versjon) FROM fil WHERE krav_id=?", (kid,)).fetchone()[0]
        if versjon != siste:
            raise Avvist("bare siste versjon kan behandles")
        if f["status"] != "mottatt":
            raise Avvist(f"versjonen har status {f['status']}")
        if not godkjenn and not grunn.strip():
            raise Avvist("avvisning krever begrunnelse")
        status = "godkjent" if godkjenn else "avvist"
        self.db.execute("UPDATE fil SET status=?, avvisningsgrunn=?, behandlet=? WHERE id=?", (status, grunn or None, self.klokke(), f["id"]))
        self.logg(self.krav(kid)["sak_id"], f"fil {status}", f"{kid} v{versjon}" + (f": {grunn}" if grunn else ""))
        self.db.commit()

    def oversikt(self, sak_id):
        sak = dict(self.db.execute("SELECT * FROM sak WHERE id=?", (sak_id,)).fetchone())
        krav = []
        for k in self.db.execute("SELECT * FROM krav WHERE sak_id=? ORDER BY id", (sak_id,)):
            filer = [dict(f) for f in self.db.execute("SELECT * FROM fil WHERE krav_id=? ORDER BY versjon", (k["id"],))]
            siste = filer[-1] if filer else None
            kontroll = "mangler" if not siste else {"godkjent": "oppfylt", "mottatt": "til kontroll", "avvist": "avvist"}.get(siste["status"], siste["status"])
            krav.append({**dict(k), "obligatorisk": bool(k["obligatorisk"]), "filer": filer, "kontrollstatus": kontroll})
        blokkerer = [f"{k['id']} {k['navn']}: {k['kontrollstatus']}" for k in krav if k["obligatorisk"] and k["kontrollstatus"] != "oppfylt"]
        logg = [dict(r) for r in self.db.execute("SELECT tid,hendelse,detalj FROM logg WHERE sak_id=? ORDER BY id", (sak_id,))]
        return {"sak": sak, "krav": krav, "blokkerer": blokkerer, "kan_ferdigstilles": not blokkerer, "logg": logg}

    def ferdigstill(self, sak_id):
        o = self.oversikt(sak_id)
        if o["blokkerer"]:
            self.logg(sak_id, "ferdigstilling blokkert", "; ".join(o["blokkerer"]))
            self.db.commit()
            raise Avvist("kan ikke ferdigstille: " + "; ".join(o["blokkerer"]))
        self.db.execute("UPDATE sak SET status='ferdigstilt', ferdigstilt=? WHERE id=?", (self.klokke(), sak_id))
        self.logg(sak_id, "sak ferdigstilt")
        self.db.commit()
        return self.overleveringspakke(sak_id)

    def overleveringspakke(self, sak_id):
        o = self.oversikt(sak_id)
        if o["sak"]["status"] != "ferdigstilt":
            raise Avvist("overleveringspakke lages først når saken er ferdigstilt")
        buf = io.BytesIO()
        manifest = {"sak": o["sak"], "generert": self.klokke(), "merknad": "Lokal demo. Ingen flerbrukersikkerhet eller signering.", "filer": []}
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
            for k in o["krav"]:
                godkjent = [f for f in k["filer"] if f["status"] == "godkjent"]
                if not godkjent:
                    manifest["filer"].append({"krav": k["id"], "navn": k["navn"], "obligatorisk": k["obligatorisk"], "fil": None})
                    continue
                f = godkjent[-1]
                sti = f"dokumenter/{k['id']}_v{f['versjon']}_{f['filnavn']}"
                z.write(os.path.join(self.lager, f["sha256"]), sti)
                manifest["filer"].append({"krav": k["id"], "navn": k["navn"], "obligatorisk": k["obligatorisk"], "fil": sti,
                                          "versjon": f["versjon"], "sha256": f["sha256"], "bytes": f["bytes"], "godkjent": f["behandlet"]})
            z.writestr("manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2))
            z.writestr("versjonslogg.json", json.dumps(o["logg"], ensure_ascii=False, indent=2))
        return buf.getvalue()
