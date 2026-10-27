#!/usr/bin/env python3
"""Teknisk tegning (SVG) av «Stille vakt» SV-1 kantmodul + sensorstrimmel. Kjør: python3 tegning.py"""
import json
import math
import os

HER = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(HER, "beste.json")))[0]["design"]

# Mål (samme som .scad)
L, B, H, R, V = 176, 46, 58, 6, 2.5
SK_D, SK_H, SK_Z = 30, 40, 64
CELLE_D, CELLE_L = 18.6, 65.5
BATT = d["batterier"]
LUX = round(d["lys_lux"])
N_LED = max(2, math.ceil(LUX * 0.5 / 0.5 / 6))
RADOME = 299.792458 / 60.5 / (2 * math.sqrt(2.75))
WH_DAG = (0.0015 + 0.0006 + 0.003) * 24 + LUX * 0.5 / 30 * 10 / 60
DAGER = BATT * 12.2 * 0.8 / WH_DAG

W, Hs = 1400, 900
ut = []


def el(s):
    ut.append(s)


def tekst(x, y, t, size=13, anchor="middle", vekt="normal", k="#222"):
    el(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" font-weight="{vekt}" fill="{k}">{t}</text>')


def maal(x1, y1, x2, y2, t, off=(0, -6), anchor="middle"):
    el(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#c0392b" stroke-width="1" '
       'marker-start="url(#pil)" marker-end="url(#pil)"/>')
    if t:
        tekst((x1 + x2) / 2 + off[0], (y1 + y2) / 2 + off[1], t, 12, anchor, k="#c0392b")


def rrect(x, y, w, h, r, fill, stroke="#222", sw=1.6, extra=""):
    el(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{r:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')


el(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{Hs}" viewBox="0 0 {W} {Hs}" font-family="Helvetica, Arial, sans-serif">')
el('<defs><marker id="pil" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
   '<path d="M0,1 L9,5 L0,9 z" fill="#c0392b"/></marker>'
   '<pattern id="skr" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
   '<line x1="0" y1="0" x2="0" y2="6" stroke="#888" stroke-width="1"/></pattern>'
   '<linearGradient id="lys" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5a623" stop-opacity="0.55"/>'
   '<stop offset="1" stop-color="#f5a623" stop-opacity="0.05"/></linearGradient></defs>')
el(f'<rect width="{W}" height="{Hs}" fill="#fbfaf6"/><rect x="10" y="10" width="{W-20}" height="{Hs-20}" fill="none" stroke="#222" stroke-width="2"/>')

# ---------- A: Front (sett fra rommet), skala 2 px/mm ----------
s = 2.0
ax, ay = 60, 210
tekst(30, 50, "A  FRONT – sett fra rommet (skala 2:1 px/mm)", 15, "start", "bold")
# brakett bak (stiplet)
el(f'<rect x="{ax + 20 * s:.1f}" y="{ay - (SK_Z + SK_H + 4 - H) * s:.1f}" width="{(L - 40) * s:.1f}" height="{(SK_Z + SK_H + 4 - 18) * s:.1f}" '
   'fill="none" stroke="#555" stroke-dasharray="6 4"/>')
el(f'<rect x="{ax - 40:.1f}" y="{ay - (SK_Z + SK_H - H) * s:.1f}" width="{L * s + 80:.1f}" height="{SK_H * s:.1f}" fill="#ddd" fill-opacity="0.5" stroke="#999" stroke-dasharray="3 3"/>')
tekst(ax - 36, ay - (SK_Z + SK_H / 2 - H) * s + 4, "sengeramme", 11, "start", k="#777")
rrect(ax, ay, L * s, H * s, R * s, "#e9e4da")
el(f'<circle cx="{ax + 20 * s:.1f}" cy="{ay + 6:.1f}" r="3" fill="#2ecc71" stroke="#222"/>')
tekst(ax + 20 * s + 8, ay + 22, "statuslys", 10, "start")
for i in range(4):
    el(f'<rect x="{ax + (L - 96 - i * 8 - 4) * s:.1f}" y="{ay + (H - 50) * s:.1f}" width="{4 * s:.1f}" height="{10 * s:.1f}" fill="#bbb" stroke="#444"/>')
LYS_X0 = CELLE_L + 22
lx0 = ax + LYS_X0 * s
el(f'<rect x="{lx0:.1f}" y="{ay + H * s - 2:.1f}" width="{N_LED * 25 * s:.1f}" height="8" fill="#f5a623" stroke="#222"/>')
maal(ax, ay + H * s + 70, ax + L * s, ay + H * s + 70, f"{L} mm")
maal(ax + L * s + 30, ay, ax + L * s + 30, ay + H * s, "", (0, 0))
tekst(ax + L * s + 38, ay + H * s / 2 + 4, f"{H} mm", 12, "start", k="#c0392b")
maal(lx0, ay + H * s + 18, lx0 + N_LED * 25 * s, ay + H * s + 18, f"lysleder {N_LED * 25} mm, {N_LED} rav-LED", (0, 14))

# ---------- B: Snitt (sett fra enden), skala 2 ----------
bx, by = 720, 270   # by = toppen av huset
tekst(470, 50, "B  SNITT B–B – montert på sengerammen (skala 2:1)", 15, "start", "bold")
gulv_y = by + H * s + 150
# sengeramme (snitt)
rx = bx - (4 + SK_D + 2) * s
el(f'<rect x="{rx:.1f}" y="{by - (SK_Z + SK_H - H) * s + 0:.1f}" width="{SK_D * s:.1f}" height="{SK_H * s:.1f}" fill="url(#skr)" stroke="#555"/>')
# brakett: frontplate, topp, bakleppe
t = 4
el(f'<path d="M{bx:.1f},{by + (H - 18) * s:.1f} L{bx - t * s:.1f},{by + (H - 18) * s:.1f} '
   f'L{bx - t * s:.1f},{by - (SK_Z + SK_H - H) * s - 0:.1f} '
   f'L{bx - (t + SK_D + 2 + t) * s:.1f},{by - (SK_Z + SK_H - H) * s:.1f} '
   f'L{bx - (t + SK_D + 2 + t) * s:.1f},{by - (SK_Z + 8 - H) * s:.1f} '
   f'L{bx - (t + SK_D + 2) * s:.1f},{by - (SK_Z + 8 - H) * s:.1f} '
   f'L{bx - (t + SK_D + 2) * s:.1f},{by - (SK_Z + SK_H - H) * s + t * s:.1f} '
   f'L{bx:.1f},{by - (SK_Z + SK_H - H) * s + t * s:.1f} Z" fill="#666" stroke="#222"/>')
# tommelskrue
sy = by - (SK_Z + 22 - H) * s
el(f'<rect x="{bx - (t + SK_D + 2 + t + 12) * s:.1f}" y="{sy - 7 * s:.1f}" width="{10 * s:.1f}" height="{14 * s:.1f}" rx="4" fill="#444"/>')
el(f'<rect x="{bx - (t + SK_D + 2 + t) * s:.1f}" y="{sy - 3 * s:.1f}" width="{8 * s:.1f}" height="{6 * s:.1f}" fill="#444"/>')
tekst(bx - (t + SK_D + 2 + t + 14) * s, sy - 18, "tommelskrue M6", 11, "end")
tekst(bx - (t + SK_D + 2 + t + 14) * s, sy - 4, "+ TPE-pute", 11, "end")
# hus (snitt)
rrect(bx, by, B * s, H * s, R * s, "#e9e4da")
rrect(bx + V * s, by + V * s, (B - 2 * V) * s, (H - 2 * V) * s, (R - V) * s, "#fbfaf6", sw=1)
# celler (2x2)
for k in range(2):
    for r in range(2 if BATT > 2 else 1):
        if k * 2 + r < BATT:
            cx = bx + (V + 1.5 + k * (CELLE_D + 1) + CELLE_D / 2) * s
            cy = by + H * s - (V + 1 + r * (CELLE_D + 1) + CELLE_D / 2) * s
            el(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{CELLE_D / 2 * s:.1f}" fill="#9fd5a6" stroke="#222"/>')
tekst(bx + B * s + 12, by + H * s - 30, f"{BATT} × 18650 Li-ion", 12, "start")
tekst(bx + B * s + 12, by + H * s - 15, f"(IEC 62133-2), {BATT * 12.2:.0f} Wh", 12, "start")
# lysleder og lyskjegle
gx = bx + (B - 14) * s
el(f'<polygon points="{gx:.1f},{by + H * s:.1f} {gx + 9 * s:.1f},{by + H * s:.1f} {gx + 9 * s:.1f},{by + H * s + 6:.1f} {gx:.1f},{by + H * s + 12:.1f}" fill="#f5a623" stroke="#222"/>')
gulv_h_mm = (gulv_y - (by + H * s)) / s
el(f'<polygon points="{gx + 4 * s:.1f},{by + H * s + 8:.1f} {gx - 20:.1f},{gulv_y:.1f} {gx + 300:.1f},{gulv_y:.1f}" fill="url(#lys)"/>')
el(f'<line x1="{bx - 200:.1f}" y1="{gulv_y:.1f}" x2="{bx + 420:.1f}" y2="{gulv_y:.1f}" stroke="#222" stroke-width="2"/>')
tekst(bx + 300, gulv_y + 18, f"gulv: ≈ {LUX} lux rav (≤ 2200 K) på ≈ 0,5 m² utenfor sengekanten", 12, "middle", "bold", "#b9770e")
tekst(bx + 300, gulv_y - 10, "lyser bare når beboeren setter seg opp", 11, "middle", k="#b9770e")
maal(bx, by + H * s + 30, bx + B * s, by + H * s + 30, f"{B} mm", (0, 14))
maal(bx - (t + SK_D + 2 + t) * s, by - (SK_Z + SK_H - H) * s - 20, bx - t * s, by - (SK_Z + SK_H - H) * s - 20,
     f"klemspenn 15–{SK_D} mm", (0, -6))
tekst(rx + SK_D * s / 2, by - (SK_Z + SK_H / 2 - H) * s + 4, "ramme", 11, k="#444")
tekst(bx + B * s / 2, by - 8, "SENG ←  → ROM", 11, "middle", "bold", "#555")
# madrass (skjematisk) over rammen
my = by - (SK_Z + SK_H - H) * s - 40
el(f'<rect x="{bx - 240:.1f}" y="{my - 40:.1f}" width="{240 - t * s:.1f}" height="40" fill="#eef" stroke="#99a"/>')
el(f'<rect x="{bx - 230:.1f}" y="{my - 2:.1f}" width="{200:.1f}" height="4" fill="#5b7db1"/>')
tekst(bx - 130, my - 22, "madrass", 11, k="#557")
tekst(bx - 130, my - 8, "sensorstrimmel 4 mm under madrassen", 11, k="#2e4d80")

# ---------- C: Underside, skala 1,5 ----------
s2 = 1.5
cx0, cy0 = 60, 470
tekst(30, 438, "C  UNDERSIDE (skala 1,5:1)", 15, "start", "bold")
rrect(cx0, cy0, L * s2, B * s2, R * s2, "#e9e4da")
el(f'<rect x="{cx0 + 8 * s2:.1f}" y="{cy0 + 6 * s2:.1f}" width="{(CELLE_L + 10) * s2:.1f}" height="{(B - 12) * s2:.1f}" fill="#ddd" stroke="#222"/>')
for x in (12, CELLE_L + 14):
    el(f'<circle cx="{cx0 + x * s2:.1f}" cy="{cy0 + B / 2 * s2:.1f}" r="3" fill="#fff" stroke="#222"/>')
tekst(cx0 + (8 + CELLE_L / 2) * s2, cy0 - 8, "batteriluke, 2 × Torx-pin", 11)
tekst(cx0 + (LYS_X0 + N_LED * 12.5) * s2, cy0 - 8, "lysleder", 11)
el(f'<rect x="{cx0 + LYS_X0 * s2:.1f}" y="{cy0 + (B - 14) * s2:.1f}" width="{N_LED * 25 * s2:.1f}" height="{9 * s2:.1f}" fill="#f5a623" stroke="#222"/>')
maal(cx0, cy0 + B * s2 + 22, cx0 + (CELLE_L + 18) * s2, cy0 + B * s2 + 22, f"luke {CELLE_L + 10:.0f} × {B - 12} mm", (0, 14))

# ---------- D: Strimmel, skala 0,5 ----------
s3 = 0.5
dx0, dy0 = 60, 640
tekst(30, 620, "D  SENSORSTRIMMEL – ovenfra (skala 0,5:1)", 15, "start", "bold")
rrect(dx0, dy0, 700 * s3, 60 * s3, 30 * s3, "#cdd9ea")
for i in range(4):
    el(f'<circle cx="{dx0 + (110 + i * 160) * s3:.1f}" cy="{dy0 + 30 * s3:.1f}" r="{18 * s3:.1f}" fill="#4a78b5"/>')
el(f'<path d="M{dx0 + 700 * s3:.1f},{dy0 + 15:.1f} C{dx0 + 760 * s3:.1f},{dy0 + 15:.1f} {dx0 + 760 * s3:.1f},{dy0 + 70:.1f} {dx0 + 820 * s3:.1f},{dy0 + 70:.1f}" fill="none" stroke="#333" stroke-width="2"/>')
tekst(dx0 + 830 * s3, dy0 + 74, "kabel 1,5 m langs rammen til kantmodul", 11, "start")
maal(dx0, dy0 + 60 * s3 + 22, dx0 + 700 * s3, dy0 + 60 * s3 + 22, "700 mm", (0, 14))
tekst(dx0, dy0 + 92, "4 soner (piezo/FSR), 60 × 4 mm, PU-trekk, IP67, tåler desinfeksjon", 11, "start")

# ---------- Tittelfelt ----------
fx, fy = 860, 600
rader = [("Produkt", "«Stille vakt» SV-1 kantmodul + strimmel"),
         ("Funksjon", "Sitte-opp/uro → varsel på pleiers telefon + rav gulvlys"),
         ("Personvern", "Ingen kamera/mikrofon. Kun hendelser lagres lokalt"),
         ("Energi", f"{BATT} × 18650, ≈ {DAGER:.0f} døgn per lading [modell]"),
         ("Lys", f"{N_LED} rav-LED ≤ 2200 K, ≈ {LUX} lux på gulv [modell]"),
         ("Hus", "PC/ABS UL94 V-0, R6, IPX4, hvit/varm grå"),
         ("Variant SV-1R", f"+ 60 GHz radar, radarvindu PC {RADOME:.2f} mm (λ/2)"),
         ("Regelverk", "RED, EMC, LVD/GPSR, RoHS, batteri-forordn. – ikke MDR"),
         ("Status", "Modellert, ikke testet · 2026-10-27")]
el(f'<rect x="{fx}" y="{fy}" width="510" height="{26 * len(rader) + 16}" fill="#fff" stroke="#222" stroke-width="1.5"/>')
for i, (a, b) in enumerate(rader):
    y = fy + 26 + i * 26
    tekst(fx + 10, y, a, 12, "start", "bold")
    tekst(fx + 120, y, b, 12, "start")
el("</svg>")
open(os.path.join(HER, "tegning.svg"), "w").write("\n".join(ut))
print("Skrev tegning.svg", f"(LED {N_LED}, {DAGER:.0f} døgn, radarvindu {RADOME:.2f} mm)")
