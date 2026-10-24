"""Kontrollert uttrekk av bestillingslinjer fra PDF.

Tekst-PDF: pdfplumber gir ord med posisjon. Kolonner bestemmes av posisjonen til overskriftsordene
(Produkt/Antall/Enhet/Enhetspris), ikke av rekkefølgen i innholdsstrømmen. Ord grupperes i rader på y-posisjon.
Skannet side (ingen tekstlag): status «krever OCR». Med tesseract installert kjøres OCR, og ALLE OCR-felt
merkes kilde=ocr og status=usikker til brukeren har kontrollert dem.
Hvert felt har side og tekstområde (bbox i PDF-punkter, origo øverst til venstre).
"""
import csv
import io
import json
import os
import re
import shutil
import subprocess
import tempfile

import pdfplumber

KOLONNER = [("produkt", "produkt"), ("antall", "antall"), ("enhet", "enhet"), ("pris", "enhetspris")]
SUM_ORD = ("sum", "total")


def tall(t):
    s = t.replace(" ", " ").strip()
    s = re.sub(r"(?<=\d) (?=\d{3}\b)", "", s)  # tusenskille med mellomrom
    if "," in s and "." in s:
        return None
    s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def union(bokser):
    return [min(b[0] for b in bokser), min(b[1] for b in bokser), max(b[2] for b in bokser), max(b[3] for b in bokser)]


def rader_fra_ord(ord_, toleranse=3.0):
    rader = []
    for w in sorted(ord_, key=lambda w: (w["top"], w["x0"])):
        if rader and abs(rader[-1][0]["top"] - w["top"]) <= toleranse:
            rader[-1].append(w)
        else:
            rader.append([w])
    return rader


def tolk_side(ord_, sidenr, kilde):
    """Felles logikk for tekst og OCR. ord_: dict med text, x0, x1, top, bottom (punkter) og evt. conf."""
    rader = rader_fra_ord(ord_)
    hode = None
    for i, r in enumerate(rader):
        tekst = [w["text"].lower() for w in r]
        if "produkt" in tekst and "antall" in tekst:
            hode = i
            break
    if hode is None:
        return [], None, ["fant ikke kolonneoverskrift"]
    start = {}
    for nokkel, ord_navn in KOLONNER:
        w = next((w for w in rader[hode] if w["text"].lower() == ord_navn), None)
        if w is None:
            return [], None, [f"fant ikke kolonnen «{ord_navn}»"]
        start[nokkel] = w["x0"]
    grenser = sorted(start.items(), key=lambda kv: kv[1])

    def kolonne(w):
        midt = w["x0"] + 1
        valgt = grenser[0][0]
        for k, x in grenser:
            if midt >= x - 4:
                valgt = k
        return valgt

    linjer, oppgitt_sum = [], None
    for r in rader[hode + 1:]:
        celler = {}
        for w in sorted(r, key=lambda w: w["x0"]):
            celler.setdefault(kolonne(w), []).append(w)
        forste = " ".join(w["text"] for w in celler.get("produkt", [])).lower()
        if any(forste.startswith(s) for s in SUM_ORD):
            pr = celler.get("pris")
            oppgitt_sum = {"raa": " ".join(w["text"] for w in pr), "verdi": tall(" ".join(w["text"] for w in pr)),
                           "side": sidenr, "bbox": union([(w["x0"], w["top"], w["x1"], w["bottom"]) for w in pr])} if pr else None
            break
        felter, merknader = {}, []
        for k, _ in KOLONNER:
            ws = celler.get(k, [])
            raa = " ".join(w["text"] for w in ws)
            verdi = raa if k in ("produkt", "enhet") else (tall(raa) if raa else None)
            if ws and k in ("antall", "pris") and verdi is None:
                merknader.append(f"{k}: «{raa}» kunne ikke tolkes som tall")
            if not ws:
                merknader.append(f"{k} mangler")
            konf = min((w.get("conf", 100) for w in ws), default=None)
            felter[k] = {"raa": raa, "verdi": verdi, "side": sidenr,
                         "bbox": union([(w["x0"], w["top"], w["x1"], w["bottom"]) for w in ws]) if ws else None,
                         "konfidens": konf}
        if not any(f["raa"] for f in felter.values()):
            continue
        linjer.append({"felter": felter, "kilde": kilde, "merknader": merknader})
    return linjer, oppgitt_sum, []


def ocr_ord(sti, sidenr, dpi=200):
    if not shutil.which("tesseract") or not shutil.which("pdftoppm"):
        return None
    with tempfile.TemporaryDirectory() as t:
        subprocess.run(["pdftoppm", "-r", str(dpi), "-f", str(sidenr), "-l", str(sidenr), "-png", sti, os.path.join(t, "s")], check=True)
        png = next(os.path.join(t, f) for f in os.listdir(t) if f.endswith(".png"))
        tsv = subprocess.run(["tesseract", png, "-", "--psm", "6", "tsv"], capture_output=True, text=True, check=True).stdout
    ut = []
    for rad in csv.DictReader(io.StringIO(tsv), delimiter="\t", quoting=csv.QUOTE_NONE):
        if rad.get("text", "").strip() and float(rad["conf"]) >= 0:
            f = 72 / dpi
            x, y, b, h = (int(rad[k]) for k in ("left", "top", "width", "height"))
            ut.append({"text": rad["text"], "x0": x * f, "x1": (x + b) * f, "top": y * f, "bottom": (y + h) * f, "conf": float(rad["conf"])})
    return ut


def trekk_ut(sti, kjor_ocr=True):
    dok = {"fil": os.path.basename(sti), "sider": [], "linjer": [], "oppgitt_sum": None, "kontroller": []}
    with pdfplumber.open(sti) as pdf:
        for i, side in enumerate(pdf.pages, start=1):
            info = {"side": i, "bredde": float(side.width), "hoyde": float(side.height)}
            ord_ = side.extract_words(keep_blank_chars=False, use_text_flow=False)
            if ord_:
                info["type"], info["ocr_status"] = "tekst", "ikke nødvendig"
                linjer, s, feil = tolk_side(ord_, i, "tekst")
            else:
                info["type"] = "skannet"
                o = ocr_ord(sti, i) if kjor_ocr else None
                if o is None:
                    info["ocr_status"] = "krever OCR (tesseract ikke tilgjengelig)" if kjor_ocr else "krever OCR (ikke kjørt)"
                    linjer, s, feil = [], None, []
                else:
                    info["ocr_status"] = f"OCR kjørt ({len(o)} ord) – alle felt usikre til kontroll"
                    linjer, s, feil = tolk_side(o, i, "ocr")
            info["feil"] = feil
            dok["sider"].append(info)
            dok["linjer"] += linjer
            dok["oppgitt_sum"] = s or dok["oppgitt_sum"]
    for n, l in enumerate(dok["linjer"], start=1):
        l["id"] = f"L{n}"
        l["status"] = "uttrukket"  # aldri bekreftet automatisk
        l["usikker"] = l["kilde"] == "ocr" or bool(l["merknader"])
    dok["kontroller"] = sumkontroll(dok)
    return dok


def linjesum(linjer):
    s = 0.0
    for l in linjer:
        a, p = l["felter"]["antall"]["verdi"], l["felter"]["pris"]["verdi"]
        if a is None or p is None:
            return None
        s += a * p
    return round(s, 2)


def sumkontroll(dok):
    beregnet = linjesum(dok["linjer"])
    s = dok["oppgitt_sum"]
    if s is None:
        return [{"type": "sum mangler", "tekst": f"dokumentet har ingen sumlinje; beregnet sum {beregnet} kan ikke kontrolleres mot kilden"}]
    if beregnet is None:
        return [{"type": "sum ukjent", "tekst": "minst én linje mangler tall; sum kan ikke beregnes"}]
    if abs(beregnet - (s["verdi"] or 0)) > 0.005:
        return [{"type": "sum avviker", "tekst": f"oppgitt sum {s['raa']} ≠ beregnet {beregnet:.2f}"}]
    return [{"type": "sum stemmer", "tekst": f"oppgitt sum {s['raa']} = beregnet"}]


def rett(dok, linje_id, felt, ny_verdi):
    l = next(x for x in dok["linjer"] if x["id"] == linje_id)
    f = l["felter"][felt]
    f.setdefault("rettelser", []).append({"fra": f["verdi"], "til": ny_verdi})
    f["verdi"] = ny_verdi if felt in ("produkt", "enhet") else tall(str(ny_verdi))
    f["rettet"] = True
    if f["verdi"] is None and felt not in ("produkt", "enhet"):
        raise ValueError(f"«{ny_verdi}» er ikke et tall")
    l["status"] = "uttrukket"  # rettelse krever ny bekreftelse
    dok["kontroller"] = sumkontroll(dok)


def sett_status(dok, linje_id, status):
    assert status in ("bekreftet", "avvist", "uttrukket")
    l = next(x for x in dok["linjer"] if x["id"] == linje_id)
    if status == "bekreftet":
        mangler = [k for k, f in l["felter"].items() if f["verdi"] in (None, "")]
        if mangler:
            raise ValueError("kan ikke bekrefte linje med tomme felt: " + ", ".join(mangler))
    l["status"] = status


def eksport(dok):
    """Bare bekreftede linjer eksporteres – med brukerens rettelser. Uttrukne/avviste tas ikke med."""
    rader = []
    for l in dok["linjer"]:
        if l["status"] != "bekreftet":
            continue
        rader.append({"fil": dok["fil"], "linje": l["id"], **{k: l["felter"][k]["verdi"] for k, _ in KOLONNER},
                      "side": l["felter"]["produkt"]["side"], "kilde": l["kilde"],
                      "rettet_av_bruker": ",".join(k for k, f in l["felter"].items() if f.get("rettet"))})
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=["fil", "linje", "produkt", "antall", "enhet", "pris", "side", "kilde", "rettet_av_bruker"])
    w.writeheader()
    w.writerows(rader)
    ikke = [l["id"] for l in dok["linjer"] if l["status"] != "bekreftet"]
    return {"json": {"fil": dok["fil"], "linjer": rader, "ikke_eksportert": ikke, "kontroller": dok["kontroller"]}, "csv": buf.getvalue()}


if __name__ == "__main__":
    import sys
    print(json.dumps(trekk_ut(sys.argv[1]), ensure_ascii=False, indent=1)[:3000])
