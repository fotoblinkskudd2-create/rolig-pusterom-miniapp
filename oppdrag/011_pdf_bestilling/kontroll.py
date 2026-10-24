import csv
import io
import json
import os
import shutil
import sys
import tempfile

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HER)
sys.path.insert(0, os.path.join(HER, ".."))
import pypdf  # noqa: E402

import uttrekk as U  # noqa: E402
from app import lag_app  # noqa: E402
from felles.kontroll import kjor  # noqa: E402

D = os.path.join(HER, "data")


def verdier(dok):
    return [{k: l["felter"][k]["verdi"] for k in ("produkt", "antall", "enhet", "pris")} for l in dok["linjer"]]


def kontroll(k):
    fasit = json.load(open(os.path.join(D, "fasit.json"), encoding="utf-8"))
    for fil in ("B1_enkel.pdf", "B2_kolonneblanding.pdf", "B3_uten_sum.pdf"):
        dok = U.trekk_ut(os.path.join(D, fil))
        k.lik(f"{fil}: alle felt samsvarer med fasit", verdier(dok), [{**x, "antall": float(x["antall"])} for x in fasit[fil]])
        k.sjekk(f"{fil}: alle linjer starter som «uttrukket», ikke bekreftet", all(l["status"] == "uttrukket" for l in dok["linjer"]))
    naiv = pypdf.PdfReader(os.path.join(D, "B2_kolonneblanding.pdf")).pages[0].extract_text().splitlines()
    i_pris, i_prod = naiv.index("899,00"), naiv.index("Takbelysning LED panel 60x60 hvit 4000K")
    k.sjekk("B2: naiv tekstrekkefølge er blandet (pris før produkt) – parseren bruker posisjon", i_pris < i_prod, naiv[5:9])
    b2 = U.trekk_ut(os.path.join(D, "B2_kolonneblanding.pdf"))
    k.lik("B2: linjer fra to sider", sorted({l["felter"]["produkt"]["side"] for l in b2["linjer"]}), [1, 2])
    k.lik("B2: oppgitt sum som avviker flagges", b2["kontroller"][0]["type"], "sum avviker")
    k.lik("B3: manglende sum flagges, ikke oppdiktet", U.trekk_ut(os.path.join(D, "B3_uten_sum.pdf"))["kontroller"][0]["type"], "sum mangler")
    b1 = U.trekk_ut(os.path.join(D, "B1_enkel.pdf"))
    k.lik("B1: sum stemmer", b1["kontroller"][0]["type"], "sum stemmer")
    f = b1["linjer"][0]["felter"]["produkt"]
    k.sjekk("hvert felt har side og tekstområde", f["side"] == 1 and len(f["bbox"]) == 4 and f["bbox"][0] < f["bbox"][2], f["bbox"])
    s4 = U.trekk_ut(os.path.join(D, "S4_skannet.pdf"), kjor_ocr=False)
    k.lik("skannet side uten OCR: egen status og ingen linjer", (s4["sider"][0]["ocr_status"], len(s4["linjer"])), ("krever OCR (ikke kjørt)", 0))
    if shutil.which("tesseract"):
        s4 = U.trekk_ut(os.path.join(D, "S4_skannet.pdf"))
        k.lik("OCR-uttrekk av skannet side mot fasit", verdier(s4), [{**x, "antall": float(x["antall"])} for x in fasit["S4_skannet.pdf"]])
        k.sjekk("OCR-felt er merket usikre", all(l["usikker"] and l["kilde"] == "ocr" for l in s4["linjer"]))
    else:
        k.notat("tesseract ikke installert – OCR-kontroll hoppet over")
    # Rettelser og eksport
    U.rett(b1, "L2", "antall", "14")
    k.lik("rettelse lagres med fra/til", b1["linjer"][1]["felter"]["antall"]["rettelser"], [{"fra": 12.0, "til": "14"}])
    U.sett_status(b1, "L1", "bekreftet")
    U.sett_status(b1, "L2", "bekreftet")
    U.sett_status(b1, "L4", "avvist")
    e = U.eksport(b1)
    rader = list(csv.DictReader(io.StringIO(e["csv"])))
    k.lik("bare bekreftede linjer eksporteres", [r["linje"] for r in rader], ["L1", "L2"])
    k.lik("rettelsen følger eksporten", (rader[1]["antall"], rader[1]["rettet_av_bruker"]), ("14.0", "antall"))
    k.lik("ubekreftet og avvist listes som ikke eksportert", e["json"]["ikke_eksportert"], ["L3", "L4"])
    k.lik("rettelse endrer sumkontroll til avvik", b1["kontroller"][0]["type"], "sum avviker")
    U.rett(b1, "L1", "pris", "19,90")
    k.lik("rettelse etter bekreftelse krever ny bekreftelse", b1["linjer"][0]["status"], "uttrukket")
    k.kaster("ugyldig tall i rettelse avvises", lambda: U.rett(b1, "L3", "pris", "tolv"), ValueError)
    os.makedirs(os.path.join(HER, "resultat"), exist_ok=True)
    open(os.path.join(HER, "resultat", "eksport_B1.csv"), "w", encoding="utf-8").write(e["csv"])
    json.dump(e["json"], open(os.path.join(HER, "resultat", "eksport_B1.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    # API
    app = lag_app(D, tempfile.mkdtemp())
    k.lik("API: sidebilde rendres som PNG", app.behandle("GET", "/api/side/B1_enkel.pdf/1").kropp[:4], b"\x89PNG")
    k.lik("API: bekreftelse av linje med tomt felt avvises", app.behandle("POST", "/api/dok/B1_enkel.pdf/rett", json.dumps({"linje": "L1", "felt": "produkt", "verdi": ""}).encode()).status, 200)
    k.lik("…og bekreft gir 400", app.behandle("POST", "/api/dok/B1_enkel.pdf/status", json.dumps({"linje": "L1", "status": "bekreftet"}).encode()).status, 400)
    k.lik("API: sti-traversering avvises", app.behandle("GET", "/api/dok/..%2Fapp.py").status, 404)


kjor("011 Bestillingsgrunnlag fra PDF", HER, kontroll)
