import base64
import hashlib
import io
import json
import os
import sys
import tempfile
import zipfile

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HER)
sys.path.insert(0, os.path.join(HER, ".."))
from fastapi.testclient import TestClient  # noqa: E402

from app import lag_app, last_demo, pdf_stub  # noqa: E402
from felles.kontroll import kjor  # noqa: E402
from motor import Motor  # noqa: E402

SAK = "KS-2026-014"


def kontroll(k):
    tid = iter(f"2026-10-24T10:{i:02d}:00" for i in range(60))
    m = Motor(":memory:", tempfile.mkdtemp(), klokke=lambda: next(tid))
    last_demo(m)
    c = TestClient(lag_app(m))
    opp = lambda kid, navn, data: c.post(f"/api/krav/{kid}/filer", json={"filnavn": navn, "innhold_base64": base64.b64encode(data).decode()})
    o = c.get(f"/api/saker/{SAK}").json()
    k.lik("seks dokumentkrav", len(o["krav"]), 6)
    k.lik("to obligatoriske mangler blokkerer", o["blokkerer"], ["D4 Kontaktliste driftsansvarlig: mangler", "D6 Samsvarserklæring eksisterende anlegg: mangler"])
    k.sjekk("valgfritt krav D5 blokkerer ikke", not any(b.startswith("D5") for b in o["blokkerer"]))
    r = c.post(f"/api/saker/{SAK}/ferdigstill")
    k.lik("ferdigstilling blokkeres ved manglende krav", r.status_code, 400)
    k.lik("pakke kan ikke lages før ferdigstilling", c.get(f"/api/saker/{SAK}/overlevering.zip").status_code, 400)
    r = opp("D4", "kontakter.docx", b"x" * 100)
    k.sjekk("feil filtype avvises", r.status_code == 400 and ".docx" in r.json()["detail"], r.json())
    r = opp("D4", "kontakter.pdf", b"x" * 60000)
    k.sjekk("for stor fil avvises", r.status_code == 400 and "maks 50000" in r.json()["detail"], r.json())
    k.lik("tom fil avvises", opp("D4", "tom.pdf", b"").status_code, 400)
    k.lik("gyldig fil mottas som v1", opp("D4", "kontakter.pdf", pdf_stub("kontaktliste")).json(), {"versjon": 1})
    o = c.get(f"/api/saker/{SAK}").json()
    d4 = next(x for x in o["krav"] if x["id"] == "D4")
    k.lik("mottatt er ikke godkjent", d4["kontrollstatus"], "til kontroll")
    k.sjekk("mottatt krav blokkerer fortsatt", any(b.startswith("D4") for b in o["blokkerer"]))
    k.lik("avvisning uten grunn avvises", c.post("/api/krav/D4/filer/1/behandling", json={"godkjenn": False}).status_code, 400)
    c.post("/api/krav/D4/filer/1/behandling", json={"godkjenn": False, "grunn": "mangler telefonnummer til vakt"})
    d4 = next(x for x in c.get(f"/api/saker/{SAK}").json()["krav"] if x["id"] == "D4")
    k.lik("avvisningsgrunn lagres", (d4["kontrollstatus"], d4["filer"][0]["avvisningsgrunn"]), ("avvist", "mangler telefonnummer til vakt"))
    opp("D4", "kontakter_v2.pdf", pdf_stub("kontaktliste med vakt"))
    c.post("/api/krav/D4/filer/2/behandling", json={"godkjenn": True})
    # Erstatning av godkjent dokument
    opp("D2", "plantegning_rev2.pdf", pdf_stub("revidert plantegning"))
    d2 = next(x for x in c.get(f"/api/saker/{SAK}").json()["krav"] if x["id"] == "D2")
    k.lik("erstatning: v1 blir erstattet, v2 til kontroll", ([f["status"] for f in d2["filer"]], d2["kontrollstatus"]), (["erstattet", "mottatt"], "til kontroll"))
    k.lik("gammel versjon kan ikke behandles", c.post("/api/krav/D2/filer/1/behandling", json={"godkjenn": True}).status_code, 400)
    c.post("/api/krav/D2/filer/2/behandling", json={"godkjenn": True})
    k.lik("fortsatt blokkert av D6", c.post(f"/api/saker/{SAK}/ferdigstill").status_code, 400)
    samsvar = pdf_stub("samsvarserklæring")
    opp("D6", "samsvar.pdf", samsvar)
    c.post("/api/krav/D6/filer/1/behandling", json={"godkjenn": True})
    k.lik("ferdigstilling lykkes når alle obligatoriske er oppfylt", c.post(f"/api/saker/{SAK}/ferdigstill").status_code, 200)
    k.lik("ferdigstilt sak tar ikke imot nye filer", opp("D5", "brann.pdf", pdf_stub("brann")).status_code, 400)
    z = c.get(f"/api/saker/{SAK}/overlevering.zip").content
    os.makedirs(os.path.join(HER, "resultat"), exist_ok=True)
    open(os.path.join(HER, "resultat", f"overlevering_{SAK}.zip"), "wb").write(z)
    zf = zipfile.ZipFile(io.BytesIO(z))
    man = json.loads(zf.read("manifest.json"))
    k.lik("pakken inneholder fem godkjente dokumenter + manifest + logg", len(zf.namelist()), 7)
    d2m = next(f for f in man["filer"] if f["krav"] == "D2")
    k.lik("pakken bruker siste godkjente versjon (D2 v2)", d2m["versjon"], 2)
    d6m = next(f for f in man["filer"] if f["krav"] == "D6")
    k.lik("sjekksum i manifest stemmer med filen i pakken", hashlib.sha256(zf.read(d6m["fil"])).hexdigest(), hashlib.sha256(samsvar).hexdigest())
    k.sjekk("manifest merker lokal demo uten flerbrukersikkerhet", "Ingen flerbrukersikkerhet" in man["merknad"])
    logg = json.loads(zf.read("versjonslogg.json"))
    open(os.path.join(HER, "resultat", "versjonslogg.json"), "w", encoding="utf-8").write(json.dumps(logg, ensure_ascii=False, indent=1))
    k.sjekk("versjonsloggen viser avvisninger, blokkering og ferdigstilling",
            {"opplasting avvist", "fil avvist", "ferdigstilling blokkert", "sak ferdigstilt"} <= {x["hendelse"] for x in logg}, len(logg))


kjor("008 Kundeoppstart", HER, kontroll)
