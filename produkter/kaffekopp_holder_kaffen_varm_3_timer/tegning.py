#!/usr/bin/env python3
"""Teknisk tegning (SVG) av kaffekopp «Tretimer» P1 fra beste.json. Kjør: python3 tegning.py"""
import importlib.util
import json
import os
import sys

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HER, "..", ".."))
spec = importlib.util.spec_from_file_location("problem", os.path.join(HER, "problem.py"))
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)

rad = json.load(open(os.path.join(HER, "beste.json")))[0]
d, dp = rad["design"], rad["delpoeng"]
D, a_bunn, h_inn, h_fyll, t_pcm, D_ut, h_ut = [x * 1000 for x in p.geometri(d)]
kurve, slurker = p.simuler(d)
ref = {k: v for k, v in p.REFERANSE.items() if not k.startswith("_")}
kurve_ref, _ = p.simuler(ref)

W, H = 1200, 980
ut = []


def el(s):
    ut.append(s)


def tekst(x, y, t, size=13, anchor="middle", vekt="normal", k="#222"):
    el(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" font-weight="{vekt}" fill="{k}">{t}</text>')


def maal(x1, y1, x2, y2, t, off=(0, -6), anchor="middle"):
    el(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#c0392b" stroke-width="1" '
       'marker-start="url(#pil)" marker-end="url(#pil)"/>')
    tekst((x1 + x2) / 2 + off[0], (y1 + y2) / 2 + off[1], t, 12, anchor, k="#c0392b")


def rekt(x, y, w, h, fyll, strek="#222", sw=1.2, ekstra=""):
    el(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fyll}" stroke="{strek}" stroke-width="{sw}" {ekstra}/>')


el(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Helvetica, Arial, sans-serif">')
el('<defs><marker id="pil" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
   '<path d="M0,1 L9,5 L0,9 z" fill="#c0392b"/></marker>'
   '<pattern id="skr" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
   '<line x1="0" y1="0" x2="0" y2="6" stroke="#999" stroke-width="1"/></pattern></defs>')
rekt(0, 0, W, H, "#fbfaf6", "none", 0)
rekt(10, 10, W - 20, H - 20, "none", "#222", 2)

# ---------------- A: Halvt snitt ----------------
S = 4.2                       # px per mm
tekst(30, 44, "A  SNITT A–A  (skala 4,2 px/mm, veggtykkelser overdrevet)", 15, "start", "bold")
cx, yb = 330, 600             # akse og underkant
R_I, R_U = D / 2, D_ut / 2
v_vis = 1.2                   # vist veggtykkelse (mm)
z_b = 12.0
plugg = d["hals_mm"] - 6
z_kant = z_b + h_inn + plugg
gap = p.SPALTE_MM


def X(r):
    return cx + r * S


def Y(z):
    return yb - z * S


# Senterlinje
el(f'<line x1="{cx}" y1="{Y(h_ut + 8):.1f}" x2="{cx}" y2="{Y(-8):.1f}" stroke="#888" stroke-dasharray="10 4 2 4"/>')
for side in (-1, 1):
    def XX(r):
        return cx + side * r * S
    x0, x1 = sorted([XX(R_I), XX(R_I + v_vis)])
    # Kaffe (bare venstre side fylles for lesbarhet)
    if side == -1:
        rekt(XX(R_I), Y(z_b + h_fyll), R_I * S, h_fyll * S, "#6f4e37", "none", 0, 'opacity="0.35"')
    # Innervegg
    rekt(x0, Y(z_kant), x1 - x0, (z_kant - z_b) * S, "#b0b5ba")
    # PCM
    a, b = sorted([XX(R_I + v_vis), XX(R_I + v_vis + t_pcm)])
    rekt(a, Y(z_b + h_fyll), b - a, (h_fyll - 2) * S, "#f1c40f")
    # PCM-kappe
    a, b = sorted([XX(R_I + v_vis + t_pcm), XX(R_I + v_vis + t_pcm + 0.8)])
    rekt(a, Y(z_b + h_fyll), b - a, (h_fyll - 2) * S, "#e67e22")
    # Yttervegg
    a, b = sorted([XX(R_U - v_vis), XX(R_U)])
    rekt(a, Y(z_kant - 6), b - a, (z_kant - 6) * S, "#7f8c8d")
    # Rullet kant (hals)
    el(f'<path d="M{XX(R_I + v_vis / 2):.1f},{Y(z_kant):.1f} Q{XX(R_I + 2.5):.1f},{Y(z_kant + 5):.1f} {XX(R_I + 5):.1f},{Y(z_kant):.1f} '
       f'L{XX(R_U - v_vis / 2):.1f},{Y(z_kant - 1):.1f} L{XX(R_U - v_vis / 2):.1f},{Y(z_kant - 6):.1f}" fill="none" stroke="#222" stroke-width="2"/>')
    # Lokk: plate, skjørt, plugg
    a, b = sorted([XX(0), XX(R_U + 1.5)])
    rekt(a, Y(h_ut), b - a, (h_ut - z_kant) * S, "#5d8aa8")
    a, b = sorted([XX(R_U + 0.2), XX(R_U + 1.8)])
    rekt(a, Y(z_kant), b - a, 12 * S, "#5d8aa8")
    a, b = sorted([XX(0), XX(R_I - 0.4)])
    rekt(a, Y(z_kant), b - a, plugg * S, "url(#skr)", "#5d8aa8", 1.2)
    a, b = sorted([XX(R_I - 1.2), XX(R_I)])
    rekt(a, Y(z_kant - 2), b - a, 2.5 * S, "#111")
# Bunn: innerbunn, vakuum, ytterbunn
rekt(X(-R_I), Y(z_b), D * S, v_vis * S, "#b0b5ba")
rekt(X(-R_U), Y(v_vis + 0.6), D_ut * S, (v_vis + 0.6) * S, "#7f8c8d")
# Hank (høyre)
el(f'<path d="M{X(R_U):.1f},{Y(95):.1f} h{24 * S:.1f} q{6 * S:.1f},0 {6 * S:.1f},{6 * S:.1f} v{44 * S:.1f} '
   f'q0,{6 * S:.1f} {-6 * S:.1f},{6 * S:.1f} h{-24 * S:.1f}" fill="none" stroke="#7f8c8d" stroke-width="{8 * S / 2:.1f}" stroke-linejoin="round"/>')

# Mål
maal(X(-R_I), Y(-6), X(R_I), Y(-6), f"Ø{D:.1f} innvendig", (0, 16))
maal(X(-R_U), Y(-22), X(R_U), Y(-22), f"Ø{D_ut:.1f} utvendig", (0, 16))
maal(X(-R_U) - 40, Y(0), X(-R_U) - 40, Y(h_ut), "", (0, 0))
tekst(X(-R_U) - 46, Y(h_ut / 2), f"{h_ut:.0f}", 13, "end", "bold", "#c0392b")
maal(X(-R_U) - 18, Y(z_b), X(-R_U) - 18, Y(z_b + h_fyll), "", (0, 0))
tekst(X(-R_U) - 22, Y(z_b + h_fyll / 2) + 18, f"{h_fyll:.0f}", 12, "end", k="#c0392b")
el(f'<line x1="{X(-R_I):.1f}" y1="{Y(z_b + h_fyll):.1f}" x2="{X(R_I):.1f}" y2="{Y(z_b + h_fyll):.1f}" stroke="#6f4e37" stroke-dasharray="6 3"/>')
tekst(cx - 10, Y(z_b + h_fyll) - 6, "300 ml kaffe", 12, "end", "bold", "#6f4e37")

# Forklaringer (høyre for snittet)
lx = 680
tekst(lx, 44, "MATERIALER OG LAG", 14, "start", "bold")
for i, (farge, t) in enumerate([
        ("#b0b5ba", f"Innervegg rustfritt 304, {d['vegg_mm']:.2f} mm, keramikkbelagt innside"),
        ("#f1c40f", f"PCM {d['pcm_g']:.0f} g, smelter {d['pcm_smelt_c']:.0f} °C, lag {t_pcm:.1f} mm"),
        ("#e67e22", "PCM-kappe 304, 0,5 mm, sveiset tett"),
        ("#ffffff", f"Vakuumspalte {gap:.0f} mm, kobberbelegg på kappen, getter"),
        ("#7f8c8d", f"Yttervegg 304, {d['vegg_mm']:.2f} mm (P1: test 0,45)"),
        ("#5d8aa8", "Vakuumlokk m/ plugg, pakning og 12 mm kantskjørt"),
        ("#111111", "Silikonpakning (LFGB/BfR XV)")]):
    rekt(lx, 62 + i * 24, 16, 14, farge)
    tekst(lx + 24, 74 + i * 24, t, 12, "start")

# ---------------- B: Detalj hals ----------------
tekst(lx, 530, "C  DETALJ HALS (ikke i skala)", 14, "start", "bold")
bx, by = lx + 90, 610
el(f'<path d="M{bx},{by + 100} V{by} Q{bx + 18},{by - 40} {bx + 36},{by} V{by + 30} L{bx + 70},{by + 30} V{by + 120}" '
   'fill="none" stroke="#222" stroke-width="3"/>')
rekt(bx + 34, by - 52, 60, 12, "#5d8aa8")
rekt(bx + 82, by - 52, 10, 70, "#5d8aa8")
el(f'<circle cx="{bx + 70}" cy="{by + 30}" r="5" fill="#c0392b"/>')
tekst(bx + 80, by + 34, "sveis (TIG/laser)", 12, "start", k="#c0392b")
tekst(bx - 10, by + 60, "innervegg", 12, "end")
tekst(bx + 100, by + 100, "yttervegg", 12, "start")
tekst(bx + 100, by - 40, "kantskjørt i lokket", 12, "start")
el(f'<path d="M{bx - 4},{by + 40} V{by} Q{bx + 18},{by - 46} {bx + 40},{by} V{by + 26} L{bx + 66},{by + 26}" '
   'fill="none" stroke="#c0392b" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#pil)"/>')
tekst(bx + 10, by + 150, f"Ledningsvei i halsen ≈ {d['hals_mm']:.0f} mm (rullet kant + nedtrekk).", 12, "start")
tekst(bx + 10, by + 168, "Halsen står for ≈ 2/3 av varmetapet i modellen.", 12, "start", "bold")

# ---------------- C: Temperaturkurve ----------------
gx, gy, gw, gh = 710, 270, 460, 180
tekst(lx, 254,"B  KAFFETEMPERATUR 0–3 t  [modell, ikke målt]", 14, "start", "bold")
rekt(gx, gy, gw, gh, "#fff")


def GX(minutt):
    return gx + minutt / 180 * gw


def GY(T):
    return gy + gh - (T - 30) / (90 - 30) * gh


rekt(gx, GY(66), gw, GY(55) - GY(66), "#2ecc71", "none", 0, 'opacity="0.18"')
tekst(gx + 6, GY(55) - 4, "drikkevindu 55–66 °C", 10, "start", k="#1e8449")
el(f'<line x1="{gx}" y1="{GY(60):.1f}" x2="{gx + gw}" y2="{GY(60):.1f}" stroke="#c0392b" stroke-dasharray="5 3"/>')
tekst(gx - 4, GY(60) + 4, "60", 10, "end", k="#c0392b")
for T in (30, 45, 75, 90):
    tekst(gx - 4, GY(T) + 4, str(T), 10, "end")
for t in range(0, 181, 30):
    tekst(GX(t), gy + gh + 14, f"{t // 60}:{t % 60:02d}", 10)
el('<polyline fill="none" stroke="#6f4e37" stroke-width="2.5" points="' +
   " ".join(f"{GX(i):.1f},{GY(T):.1f}" for i, T in enumerate(kurve)) + '"/>')
el('<polyline fill="none" stroke="#7f8c8d" stroke-width="2" stroke-dasharray="6 3" points="' +
   " ".join(f"{GX(i):.1f},{GY(T):.1f}" for i, T in enumerate(kurve_ref)) + '"/>')
tekst(GX(100), GY(kurve[100]) - 8, f"P1 «Tretimer»: {slurker[-1]:.1f} °C ved siste slurk", 11, "start", "bold", "#6f4e37")
tekst(GX(95), GY(kurve_ref[95]) + 18, f"YETI 14 oz m/ skyvelokk: {kurve_ref[-1]:.1f} °C", 11, "start", k="#555")
tekst(lx, gy + gh + 34, "Bruk: 300 ml, 85 °C, kopp og rom 20 °C, 12 slurker à 15 ml, lokk av 8 s.", 11, "start")
tekst(lx, gy + gh + 50, "Med +30 % varmetap: 57,4 °C ved siste slurk. Forvarmet kopp + 30 %: 62,9 °C.", 11, "start", "bold")

# ---------------- Tittelfelt ----------------
fx, fy = 680, 805
rader = [("Produkt", "Kaffekopp «Tretimer» P1 – varm i 3 t uten strøm"),
         ("Volum", f"{d['kapasitet_ml']} ml brutto, 300 ml kaffe"),
         ("Mål", f"Ø{D_ut:.0f} × {h_ut:.0f} mm, ≈ {dp['_vekt_g']} g [modell]"),
         ("Materialer", "AISI 304, PCM (organisk, innkapslet), PP/silikon"),
         ("Krav", "≥ 55 °C etter 3 t i bruk; ≥ 60 °C forvarmet"),
         ("Status", "Modellert, IKKE testet  ·  2026-10-27")]
rekt(fx, fy, 490, 22 * len(rader) + 16, "#fff", "#222", 1.5)
for i, (a, b) in enumerate(rader):
    y = fy + 24 + i * 22
    tekst(fx + 10, y, a, 12, "start", "bold")
    tekst(fx + 100, y, b, 12, "start")
el("</svg>")
open(os.path.join(HER, "tegning.svg"), "w").write("\n".join(ut))
print("Skrev tegning.svg")
