#!/usr/bin/env python3
"""Lager teknisk tegning (SVG) av prototype P1 med mål. Kjør: python3 tegning.py"""

S = 3.2    # px per mm, oversiktsvisning
D = 11     # px per mm, detalj av hodet
W, H = 1100, 820

ut = []


def el(s):
    ut.append(s)


def linje(x1, y1, x2, y2, k="#222", w=1.4, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    el(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{k}" stroke-width="{w}"{d}/>')


def tekst(x, y, t, size=13, anchor="middle", vekt="normal", k="#222"):
    el(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" '
       f'font-weight="{vekt}" fill="{k}">{t}</text>')


def maal_h(x1, x2, y, t, ref_y=None):
    """Horisontalt mål med piler, valgfrie hjelpelinjer ned/opp til ref_y."""
    if ref_y is not None:
        linje(x1, ref_y, x1, y, "#888", 0.8)
        linje(x2, ref_y, x2, y, "#888", 0.8)
    el(f'<line x1="{x1:.1f}" y1="{y:.1f}" x2="{x2:.1f}" y2="{y:.1f}" stroke="#c0392b" '
       f'stroke-width="1" marker-start="url(#pil)" marker-end="url(#pil)"/>')
    tekst((x1 + x2) / 2, y - 5, t, 12, k="#c0392b")


def maal_v(x, y1, y2, t, ref_x=None):
    if ref_x is not None:
        linje(ref_x, y1, x, y1, "#888", 0.8)
        linje(ref_x, y2, x, y2, "#888", 0.8)
    el(f'<line x1="{x:.1f}" y1="{y1:.1f}" x2="{x:.1f}" y2="{y2:.1f}" stroke="#c0392b" '
       f'stroke-width="1" marker-start="url(#pil)" marker-end="url(#pil)"/>')
    el(f'<text x="{x + 6:.1f}" y="{(y1 + y2) / 2 + 4:.1f}" font-size="12" fill="#c0392b">{t}</text>')


el(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
   'font-family="Helvetica, Arial, sans-serif">')
el('<defs><marker id="pil" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" '
   'orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="#c0392b"/></marker>'
   '<pattern id="bambus" width="8" height="8" patternUnits="userSpaceOnUse">'
   '<rect width="8" height="8" fill="#e8d3a8"/><line x1="0" y1="0" x2="8" y2="0" stroke="#c9ad78"/></pattern></defs>')
el(f'<rect width="{W}" height="{H}" fill="#fbfaf6"/>')
el(f'<rect x="10" y="10" width="{W - 20}" height="{H - 20}" fill="none" stroke="#222" stroke-width="2"/>')

# ---------------- Sidevisning, hele børsten ----------------
x0, yc = 70, 190
tekst(x0, 60, "A  SIDEVISNING  (skala 3,2 px/mm)", 15, "start", "bold")
skaft = 130 * S
# Skaft: 26 mm, midje 23 mm ved 60 mm
r1, rm = 13 * S, 11.5 * S
xm = x0 + 60 * S
el(f'<path d="M{x0},{yc - r1 + 8} Q{x0},{yc - r1} {x0 + 12},{yc - r1} '
   f'Q{xm - 60},{yc - r1} {xm},{yc - rm} Q{xm + 70},{yc - r1 + 2} {x0 + skaft - 20},{yc - r1 + 3} '
   f'L{x0 + skaft},{yc - 6 * S} L{x0 + skaft},{yc + 6 * S} L{x0 + skaft - 20},{yc + r1 - 3} '
   f'Q{xm + 70},{yc + r1 - 2} {xm},{yc + rm} Q{xm - 60},{yc + r1} {x0 + 12},{yc + r1} '
   f'Q{x0},{yc + r1} {x0},{yc + r1 - 8} Z" fill="url(#bambus)" stroke="#222" stroke-width="1.6"/>')
# Knapp + LED-ring
kx = x0 + 85 * S
el(f'<ellipse cx="{kx}" cy="{yc - r1 + 1}" rx="{6.5 * S}" ry="5" fill="none" stroke="#c0392b" stroke-width="2.5"/>')
el(f'<ellipse cx="{kx}" cy="{yc - r1 + 1}" rx="{4.5 * S}" ry="4" fill="#555"/>')
tekst(kx, yc - r1 - 22, "Av/på + LED-ring (trykk/timer)", 11)
linje(kx, yc - r1 - 18, kx, yc - r1 - 4, "#888", 0.8)
# Ladespole
linje(x0 + 6 * S, yc - 8 * S, x0 + 6 * S, yc + 8 * S, "#888", 1, "4 3")
tekst(x0 + 6 * S, yc + r1 + 72, "Induktiv ladespole", 11)
linje(x0 + 6 * S, yc + r1 + 60, x0 + 6 * S, yc + 8 * S, "#888", 0.8)
# Indre komponenter stiplet
el(f'<rect x="{x0 + 14 * S}" y="{yc - 8 * S}" width="{50 * S}" height="{16 * S}" fill="none" '
   f'stroke="#888" stroke-dasharray="4 3"/>')
tekst(x0 + 39 * S, yc + 4, "Li-ion 18350, 1000 mAh", 11, k="#666")
el(f'<rect x="{x0 + 70 * S}" y="{yc - 7 * S}" width="{45 * S}" height="{14 * S}" fill="none" '
   f'stroke="#888" stroke-dasharray="4 3"/>')
tekst(x0 + 92 * S, yc + 4, "Oscillerende motor + PCB", 11, k="#666")

# Nakke med 12° knekk
nx0 = x0 + skaft + 4 * S
n1 = 45 * S
import math
k = math.radians(12)
nx1 = nx0 + n1
n2 = 15 * S
nx2, ny2 = nx1 + n2 * math.cos(k), yc - n2 * math.sin(k)
el(f'<path d="M{nx0},{yc - 4.5 * S} L{nx1},{yc - 3.5 * S} L{nx2},{ny2 - 3.2 * S} '
   f'L{nx2},{ny2 + 3.2 * S} L{nx1},{yc + 3.5 * S} L{nx0},{yc + 4.5 * S} Z" fill="#f4f1e8" stroke="#222" stroke-width="1.6"/>')
# Hode
hx0, hx1 = nx2, nx2 + 20 * S * math.cos(k)
hy0, hy1 = ny2, ny2 - 20 * S * math.sin(k)
dx, dy = math.sin(k) * 2.5 * S, math.cos(k) * 2.5 * S
el(f'<polygon points="{hx0 - dx},{hy0 - dy} {hx1 - dx},{hy1 - dy} {hx1 + dx},{hy1 + dy} {hx0 + dx},{hy0 + dy}" '
   f'fill="#f4f1e8" stroke="#222" stroke-width="1.6"/>')
# Buster opp fra hodet
for i in range(11):
    t = (i + 0.5) / 11
    bx, by = hx0 + (hx1 - hx0) * t - dx, hy0 + (hy1 - hy0) * t - dy
    L = 10 * S if i < 10 else 12 * S
    vx, vy = -math.sin(k), -math.cos(k)
    linje(bx, by, bx + vx * L, by + vy * L, "#7fa7c9", 2.2)
# Mål sidevisning
tot = (hx1 - x0)
maal_h(x0, hx1, yc + r1 + 105, "≈ 214 mm totalt", yc + r1)
maal_h(x0, x0 + skaft, yc + r1 + 45, "130 mm skaft", yc + r1)
maal_h(nx0, nx2, yc + 45, "60 mm nakke", yc + 15)
maal_v(x0 - 25, yc - r1, yc + r1, "", x0)
tekst(x0 - 22, yc - r1 - 8, "Ø26", 12, k="#c0392b")
maal_v(xm, yc + rm, yc + rm + 22, "")
tekst(xm + 8, yc + rm + 18, "midje Ø23", 12, "start", k="#c0392b")
tekst(nx1 + 8, yc - 22, "12°", 13, "start", "bold", "#c0392b")
linje(nx1, yc, nx1 + 50, yc, "#888", 0.8, "3 3")

# ---------------- Detalj B: hodet sett ovenfra ----------------
bx0, by0 = 90, 470
tekst(70, 400, "B  HODE OVENFRA  (skala 11 px/mm)", 15, "start", "bold")
L, B = 20 * D, 9.5 * D
el(f'<path d="M{bx0 + 4.75 * D},{by0} L{bx0 + L - 4.75 * D},{by0 - 0} '
   f'A{4.75 * D},{4.75 * D} 0 0 1 {bx0 + L - 4.75 * D},{by0 + B} L{bx0 + 4.75 * D},{by0 + B} '
   f'A{4.4 * D},{4.75 * D} 0 0 1 {bx0 + 4.75 * D},{by0} Z" fill="#f4f1e8" stroke="#222" stroke-width="1.6"/>')
# nakke inn fra venstre
el(f'<rect x="{bx0 - 40}" y="{by0 + B / 2 - 3.2 * D}" width="44" height="{6.4 * D}" fill="#f4f1e8" stroke="#222" stroke-width="1.6"/>')
el(f'<rect x="{bx0}" y="{by0 + 1}" width="6" height="{B - 2}" fill="#f4f1e8"/>')
# Roterende skive
sx, sy = bx0 + L - 5 * D, by0 + B / 2
el(f'<circle cx="{sx}" cy="{sy}" r="{4.5 * D}" fill="#dce9f5" stroke="#2c6e9f" stroke-width="1.4"/>')
def tust_c(x, y, r=0.8 * D, f="#7fa7c9"):
    el(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{f}" stroke="#2c6e9f" stroke-width="0.6"/>')
tust_c(sx, sy)
for i in range(8):
    a = math.radians(i * 45)
    tust_c(sx + 2.3 * D * math.cos(a), sy + 2.3 * D * math.sin(a))
for i in range(15):
    a = math.radians(i * 24)
    tust_c(sx + 3.8 * D * math.cos(a), sy + 3.8 * D * math.sin(a), 0.6 * D)
# Rotasjonspil
el(f'<path d="M{sx - 2 * D},{sy - 5.6 * D} A{5.6 * D},{5.6 * D} 0 0 1 {sx + 2 * D},{sy - 5.6 * D}" '
   f'fill="none" stroke="#2c6e9f" stroke-width="1.5" marker-start="url(#pil)" marker-end="url(#pil)"/>')
tekst(sx, sy - 6.4 * D, "± 20° oscillering", 11, k="#2c6e9f")
# Tanntråd-tuster i tverrgående rad foran de faste tustene
for j in range(4):
    tust_c(bx0 + 10 * D, by0 + B / 2 + (j - 1.5) * 1.2 * D, 0.55 * D, "#e67e22")
# Faste X-tuster bak
for r in range(7):
    for s in (-1, 1):
        tust_c(bx0 + 1.6 * D + r * 1.2 * D, by0 + B / 2 + s * 2.2 * D, 0.55 * D, "#9bc29b")
maal_h(bx0, bx0 + L, by0 + B + 35, "20 mm", by0 + B)
maal_v(bx0 + L + 40, by0, by0 + B, "9,5 mm", bx0 + L)
maal_h(sx - 4.5 * D, sx + 4.5 * D, by0 + B + 75, "Ø9 skive", sy + 4.5 * D)

# Forklaring
lx, ly = 90, 700
for f, t in [("#7fa7c9", "24 tuster på roterende skive, bust Ø0,144 mm, 10 mm høye"),
             ("#9bc29b", "14 faste tuster, X-mønster, vinklet mot tannkjøttkanten"),
             ("#e67e22", "4 tanntråd-tuster, 12 mm, tverrgående rad, avrundede tupper")]:
    tust_c(lx, ly, 6, f)
    tekst(lx + 14, ly + 4, t, 12, "start")
    ly += 24
tekst(lx + 14, ly + 4, "Bakside: riflet TPE-tungerenser, 6 ribber", 12, "start")

# ---------------- Tittelfelt ----------------
tx, ty = 640, 430
el(f'<rect x="{tx}" y="{ty}" width="430" height="360" fill="#fff" stroke="#222" stroke-width="1.5"/>')
rader = [
    ("Prosjekt", "Tannbørste P1 «Ren»"),
    ("Mål", "Maks plakkfjerning, skånsom mot tannkjøtt"),
    ("Drift", "Roterende-oscillerende, 8 000 osc/min"),
    ("Trykksensor", "LED rød over 2,0 N"),
    ("Timer", "2:00, puls hvert 30. sek"),
    ("Skaft", "Bambus-kompositt over IPX7-hus"),
    ("Hode", "Utskiftbart, PBT-buster, PP-kropp"),
    ("Vekt mål", "≈ 115 g"),
    ("Batteri", "≈ 3 uker (2×2 min/dag)"),
    ("Toleranser", "±0,2 mm hode, ±0,5 mm skaft"),
    ("Status", "Prototype for test, ikke godkjent"),
    ("Tegning", "Generert av tegning.py, rev A"),
]
for i, (a, b) in enumerate(rader):
    y = ty + 28 + i * 27
    tekst(tx + 12, y, a, 12, "start", "bold")
    tekst(tx + 130, y, b, 12, "start")
    if i:
        linje(tx, y - 18, tx + 430, y - 18, "#ddd", 0.8)
linje(tx + 120, ty, tx + 120, ty + 360, "#ddd", 0.8)

el("</svg>")
open("prototype_tegning.svg", "w").write("\n".join(ut))
print("Skrev prototype_tegning.svg")
