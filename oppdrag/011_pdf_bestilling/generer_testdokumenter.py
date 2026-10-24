"""Lager tre tekst-PDF-er og én skannet side med kjent fasit (data/fasit.json)."""
import json
import os

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

HER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(HER, exist_ok=True)
KOL = {"produkt": 50, "antall": 300, "enhet": 370, "pris": 440}


def kr(v):
    return f"{v:,.2f}".replace(",", " ").replace(".", ",")


def tekst_pdf(navn, tittel, linjer, sum_tekst=None, rekkefolge=None, sider=1):
    c = canvas.Canvas(os.path.join(HER, navn), pagesize=A4)
    c.setTitle(tittel)
    per_side = -(-len(linjer) // sider)
    for s in range(sider):
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, 790, f"{tittel} (side {s + 1}/{sider})")
        c.setFont("Helvetica-Bold", 10)
        for k, x in KOL.items():
            c.drawString(x, 750, {"produkt": "Produkt", "antall": "Antall", "enhet": "Enhet", "pris": "Enhetspris"}[k])
        c.setFont("Helvetica", 10)
        del_ = linjer[s * per_side:(s + 1) * per_side]
        # Skriv cellene i valgt rekkefølge i innholdsstrømmen (for å teste at parseren bruker posisjon, ikke rekkefølge)
        celler = [(k, i, l) for i, l in enumerate(del_) for k in (rekkefolge or KOL)]
        for k, i, l in celler:
            y = 730 - i * 18
            verdi = {"produkt": l[0], "antall": str(l[1]).replace(".", ","), "enhet": l[2], "pris": kr(l[3])}[k]
            c.drawString(KOL[k], y, verdi)
        if s == sider - 1 and sum_tekst:
            c.setFont("Helvetica-Bold", 10)
            c.drawString(KOL["produkt"], 730 - len(del_) * 18 - 10, "Sum eks. mva")
            c.drawString(KOL["pris"], 730 - len(del_) * 18 - 10, sum_tekst)
        c.showPage()
    c.save()


L1 = [("Kabel PFSP 3G2,5", 100, "m", 18.9), ("Koblingsboks IP55", 12, "stk", 49.0), ("Stikkontakt dobbel jordet", 8, "stk", 129.5), ("Rørklammer 20 mm", 200, "stk", 2.45)]
tekst_pdf("B1_enkel.pdf", "Bestilling 1001 (syntetisk)", L1, kr(sum(a * p for _, a, _, p in L1)))
L2 = [("Takbelysning LED panel 60x60 hvit 4000K", 6, "stk", 899.0), ("Bevegelsessensor", 6, "stk", 345.0), ("Installasjonsrør 16 mm", 150, "m", 6.9),
      ("Skjøteboks", 20, "stk", 15.5), ("Kabel EKLK 3G1,5", 250, "m", 11.2), ("Strips 200 mm", 3, "pk", 79.0)]
tekst_pdf("B2_kolonneblanding.pdf", "Bestilling 1002 (syntetisk)", L2, "12 999,00", rekkefolge=["pris", "enhet", "antall", "produkt"], sider=2)
L3 = [("Sikringsautomat C16", 10, "stk", 89.0), ("Jordfeilbryter 40A", 2, "stk", 1249.0), ("DIN-skinne 1 m", 4, "stk", 39.5)]
tekst_pdf("B3_uten_sum.pdf", "Bestilling 1003 (syntetisk)", L3, None)

# Skannet side: bilde av tekst, ingen tekstlag
L4 = [("Downlight LED", 15, "stk", 249.0), ("Dimmer 400W", 4, "stk", 549.0), ("Kabel PN 2x1,5", 50, "m", 7.5)]
im = Image.new("L", (1654, 2339), 255)  # A4 @ 200 dpi
d = ImageDraw.Draw(im)
try:
    f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 34)
    fb = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 34)
except OSError:
    f = fb = ImageFont.load_default()
px = lambda x: int(x / 72 * 200)
d.text((px(50), px(50)), "Bestilling 1004 (skannet, syntetisk)", font=fb, fill=0)
for k, x in KOL.items():
    d.text((px(x), px(92)), {"produkt": "Produkt", "antall": "Antall", "enhet": "Enhet", "pris": "Enhetspris"}[k], font=fb, fill=0)
for i, l in enumerate(L4):
    y = px(112 + i * 18)
    for k, x in KOL.items():
        d.text((px(x), y), {"produkt": l[0], "antall": str(l[1]), "enhet": l[2], "pris": kr(l[3])}[k], font=f, fill=0)
im = im.rotate(0.4, fillcolor=255)  # liten skjevhet som i en skanner
im.save(os.path.join(HER, "S4_skannet.pdf"), "PDF", resolution=200)

fasit = {n: [{"produkt": p, "antall": a, "enhet": e, "pris": pr} for p, a, e, pr in L] for n, L in
         [("B1_enkel.pdf", L1), ("B2_kolonneblanding.pdf", L2), ("B3_uten_sum.pdf", L3), ("S4_skannet.pdf", L4)]}
json.dump(fasit, open(os.path.join(HER, "fasit.json"), "w"), ensure_ascii=False, indent=1)
print("skrev", sorted(f for f in os.listdir(HER) if f.endswith(".pdf")))
