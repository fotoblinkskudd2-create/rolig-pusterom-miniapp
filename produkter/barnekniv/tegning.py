#!/usr/bin/env python3
"""Teknisk tegning (SVG) av barnekniv K1 fra beste_trygghet.json. Kjør: python3 tegning.py"""
import json
import math
import os

HER = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(HER, "beste_trygghet.json")))[0]["design"]

S = 5.0          # px per mm
W, H = 1150, 760
L, Hb, Lh, Hh = d["blad_lengde_mm"], d["blad_hoyde_mm"], d["skaft_lengde_mm"], d["skaft_tykkelse_mm"]
fall, vern, usl = d["blad_fall_grader"], d["fingervern_mm"], d["usleipet_mm"]
v, rygg = d["eggvinkel_grader"], d["rygg_mm"]
slip_h = (rygg / 2) / math.tan(math.radians(v / 2))
r_tipp = 8 if d["spiss"] == "rund_r8" else 4 if d["spiss"] == "avrundet_r4" else 0.5

ut = []


def el(s):
    ut.append(s)


def tekst(x, y, t, size=13, anchor="middle", vekt="normal", k="#222"):
    el(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" font-weight="{vekt}" fill="{k}">{t}</text>')


def maal(x1, y1, x2, y2, t, off=(0, -6)):
    el(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#c0392b" stroke-width="1" '
       'marker-start="url(#pil)" marker-end="url(#pil)"/>')
    tekst((x1 + x2) / 2 + off[0], (y1 + y2) / 2 + off[1], t, 12, k="#c0392b")


el(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Helvetica, Arial, sans-serif">')
el('<defs><marker id="pil" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
   '<path d="M0,1 L9,5 L0,9 z" fill="#c0392b"/></marker></defs>')
el(f'<rect width="{W}" height="{H}" fill="#fbfaf6"/><rect x="10" y="10" width="{W-20}" height="{H-20}" fill="none" stroke="#222" stroke-width="2"/>')
tekst(30, 44, "A  SIDEVISNING  (skala 5 px/mm)", 15, "start", "bold")

x0, yc = 80 + Lh * S, 220     # vernet (overgang skaft/blad)
# Skaft
el(f'<rect x="{x0 - Lh * S:.1f}" y="{yc - Hh / 2 * S:.1f}" width="{Lh * S:.1f}" height="{Hh * S:.1f}" rx="{Hh / 2 * S * 0.9:.1f}" '
   'fill="#f39c12" stroke="#222" stroke-width="1.6"/>')
el(f'<circle cx="{x0 - (Lh - 7) * S:.1f}" cy="{yc:.1f}" r="{2 * S:.1f}" fill="#fbfaf6" stroke="#222"/>')
# Fingervern
el(f'<rect x="{x0 - 6 * S:.1f}" y="{yc - (Hh / 2 + 4) * S:.1f}" width="{5 * S:.1f}" height="{(Hh + 4 + vern) * S:.1f}" rx="{3 * S:.1f}" '
   'fill="#e67e22" stroke="#222" stroke-width="1.6"/>')


# Blad (rotert ned med fall rundt (x0, yc))
def rot(x, y):
    a = math.radians(fall)
    return x0 + (x * math.cos(a) - y * math.sin(a)) * S, yc + (x * math.sin(a) + y * math.cos(a)) * S


# Bladkoordinater: x langs blad, y nedover (egg på y = +Hb/2)
pts = [(-1, -Hb / 2), (L - 14, -Hb / 2)]
for k in range(-100, 91, 10):
    a = math.radians(k)
    pts.append((L - r_tipp + r_tipp * math.cos(a), Hb / 2 - r_tipp + r_tipp * math.sin(a)))
pts.append((-1, Hb / 2))
el('<polygon points="' + " ".join("%.1f,%.1f" % rot(*p) for p in pts) + '" fill="#d5d8dc" stroke="#222" stroke-width="1.6"/>')
# Slipelinje (scandi) og usleipet sone
a1, b1 = rot(usl, Hb / 2 - slip_h)
a2, b2 = rot(L - r_tipp, Hb / 2 - slip_h)
el(f'<line x1="{a1:.1f}" y1="{b1:.1f}" x2="{a2:.1f}" y2="{b2:.1f}" stroke="#555" stroke-width="1"/>')
c1, e1 = rot(0, Hb / 2)
c2, e2 = rot(usl, Hb / 2)
el(f'<line x1="{c1:.1f}" y1="{e1:.1f}" x2="{c2:.1f}" y2="{e2:.1f}" stroke="#2e86c1" stroke-width="5"/>')
for i in range(6):   # tommelrampe
    p, q = rot(3 + i * 2.2, -Hb / 2)
    el(f'<line x1="{p:.1f}" y1="{q:.1f}" x2="{p:.1f}" y2="{q - 4:.1f}" stroke="#222" stroke-width="2"/>')

# Mål
yb = yc + (Hh / 2 + vern) * S + 60
maal(x0 - Lh * S, yb, x0, yb, f"skaft {Lh} mm")
tx, ty = rot(L, 0)
maal(x0, yb, tx, yb, f"blad {L} mm")
maal(x0 - Lh * S, yb + 45, tx, yb + 45, f"totalt ≈ {Lh + L} mm")
maal(x0 - Lh * S - 25, yc - Hh / 2 * S, x0 - Lh * S - 25, yc + Hh / 2 * S, "", (0, 0))
tekst(x0 - Lh * S - 30, yc - Hh / 2 * S - 10, f"{Hh:.0f} mm", 12, k="#c0392b")
p1, q1 = rot(L * 0.55, -Hb / 2)
p2, q2 = rot(L * 0.55, Hb / 2)
maal(p1 + 10, q1, p2 + 10, q2, "", (0, 0))
tekst(p1 + 18, (q1 + q2) / 2, f"{Hb:.0f} mm", 12, "start", k="#c0392b")
el(f'<line x1="{x0:.1f}" y1="{yc:.1f}" x2="{x0 + (L + 15) * S:.1f}" y2="{yc:.1f}" stroke="#888" stroke-dasharray="5 4"/>')
tekst(x0 + (L + 5) * S, yc - 8, f"{fall:.0f}° ned", 13, "start", "bold", "#c0392b")
tekst(x0 - 3 * S, yc + (Hh / 2 + vern) * S + 22, f"fingervern {vern:.1f} mm", 12, k="#c0392b")
tekst(c1 + 20, e1 + 32, f"usleipet {usl:.0f} mm", 12, "start", k="#2e86c1")
tekst(x0 + L * 0.5 * S, yc - Hb / 2 * S - 40, "tommelrampe (riller)", 11)
tekst(tx - 10, ty + Hb / 2 * S + 30, f"rund spiss R{r_tipp:.0f}", 12, "end", k="#c0392b")

# B: Snitt av eggen
bx, by = 120, 680
tekst(30, 480, "B  SNITT GJENNOM BLADET  (skala 15 px/mm)", 15, "start", "bold")
k = 15
el(f'<polygon points="{bx},{by} {bx - rygg / 2 * k:.1f},{by - slip_h * k:.1f} {bx - rygg / 2 * k:.1f},{by - Hb * k * 0.55:.1f} '
   f'{bx + rygg / 2 * k:.1f},{by - Hb * k * 0.55:.1f} {bx + rygg / 2 * k:.1f},{by - slip_h * k:.1f}" fill="#d5d8dc" stroke="#222" stroke-width="1.4"/>')
el(f'<line x1="{bx}" y1="{by}" x2="{bx}" y2="{by - slip_h * k - 30:.1f}" stroke="#888" stroke-dasharray="3 3"/>')
tekst(bx + 30, by - 10, f"eggvinkel {v:.0f}° (inkludert)", 13, "start", "bold", "#c0392b")
tekst(bx + 30, by - slip_h * k / 2, f"scandi-fasett {slip_h:.1f} mm høy", 12, "start")
tekst(bx + 30, by - Hb * k * 0.5, f"rygg {rygg:.1f} mm", 12, "start")

# Tittelfelt
fx, fy = 560, 455
rader = [("Produkt", "Barnekniv K1 «Spikkevenn», 6–12 år"),
         ("Stål", "Sandvik 12C27 rustfritt, 56–57 HRC"),
         ("Egg", f"Scandi {v:.0f}° – skarp, IKKE sløvet"),
         ("Spiss", f"Rund R{r_tipp:.0f} – kan ikke stikke"),
         ("Skaft", f"TPE-gummi, oransje, {Lh}×{Hh:.0f} mm"),
         ("Vern", f"{vern:.1f} mm under skaftet"),
         ("Slire", "Klikklås + utløserknapp, beltehempe"),
         ("Vekt mål", "≈ 70 g"),
         ("Status", "Prototype, ikke testet")]
el(f'<rect x="{fx}" y="{fy}" width="560" height="{28 * len(rader) + 20}" fill="#fff" stroke="#222" stroke-width="1.5"/>')
for i, (a, b) in enumerate(rader):
    y = fy + 28 + i * 28
    tekst(fx + 12, y, a, 12, "start", "bold")
    tekst(fx + 120, y, b, 12, "start")
el("</svg>")
open(os.path.join(HER, "kniv_K1_tegning.svg"), "w").write("\n".join(ut))
print("Skrev kniv_K1_tegning.svg")
