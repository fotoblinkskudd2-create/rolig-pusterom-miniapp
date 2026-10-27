#!/usr/bin/env python3
"""Storyboard (SVG) for 30 s video av kaffekopp «Tretimer», se 07_lansering.md. Kjør: python3 storyboard.py"""
import os

HER = os.path.dirname(os.path.abspath(__file__))

ESPRESSO, HAVRE, KOBBER, FJORD, STAAL = "#3B2A20", "#F4EDE3", "#D9822B", "#2F7F86", "#8A9198"
KOL, RAD = 4, 2
RW, RH = 300, 169              # 16:9-rute
MX, MY, TOPP = 30, 105, 80     # marg, radavstand, plass til tittel
W, H = MX + KOL * (RW + MX), TOPP + RAD * (RH + MY) + 10
ut = []


def el(s):
    ut.append(s)


def tekst(x, y, t, size=13, anchor="middle", vekt="normal", k=ESPRESSO):
    el(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" font-weight="{vekt}" fill="{k}">{t}</text>')


def kopp(x, y, s=1.0, lokk=True, farge=STAAL):
    """Tretimer sett fra siden: kropp, hank, lokk med skjørt. (x, y) = bunn midt."""
    w, h = 60 * s, 72 * s
    el(f'<rect x="{x - w / 2:.1f}" y="{y - h:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{4 * s:.1f}" fill="{farge}" stroke="{ESPRESSO}" stroke-width="1.5"/>')
    el(f'<path d="M{x + w / 2:.1f},{y - h * 0.75:.1f} h{14 * s:.1f} a{6 * s:.1f},{6 * s:.1f} 0 0 1 {6 * s:.1f},{6 * s:.1f} '
       f'v{h * 0.35:.1f} a{6 * s:.1f},{6 * s:.1f} 0 0 1 -{6 * s:.1f},{6 * s:.1f} h-{14 * s:.1f}" fill="none" stroke="{ESPRESSO}" stroke-width="{4 * s:.1f}"/>')
    if lokk:
        el(f'<rect x="{x - w / 2 - 2 * s:.1f}" y="{y - h - 10 * s:.1f}" width="{w + 4 * s:.1f}" height="{14 * s:.1f}" rx="{3 * s:.1f}" fill="{ESPRESSO}"/>')
        el(f'<rect x="{x + w / 4 - 5 * s:.1f}" y="{y - h - 12 * s:.1f}" width="{12 * s:.1f}" height="{3 * s:.1f}" fill="{KOBBER}"/>')


def keramikkopp(x, y, farge=FJORD):
    el(f'<path d="M{x - 28},{y - 60} L{x - 24},{y} L{x + 24},{y} L{x + 28},{y - 60} Z" fill="{farge}" stroke="{ESPRESSO}" stroke-width="1.5"/>')
    el(f'<path d="M{x + 27},{y - 48} q18,4 14,22 q-4,12 -16,10" fill="none" stroke="{ESPRESSO}" stroke-width="4"/>')


def damp(x, y, n=3, k="#ffffff"):
    for i in range(n):
        dx = (i - (n - 1) / 2) * 12
        el(f'<path d="M{x + dx:.1f},{y} q-8,-12 0,-24 q8,-12 0,-24" fill="none" stroke="{k}" stroke-width="3" stroke-linecap="round" opacity="0.85"/>')


def pc(x, y):
    el(f'<rect x="{x - 55}" y="{y - 70}" width="110" height="66" rx="4" fill="{ESPRESSO}"/>')
    el(f'<rect x="{x - 50}" y="{y - 65}" width="100" height="56" fill="#cfd8dc"/>')
    el(f'<rect x="{x - 8}" y="{y - 4}" width="16" height="10" fill="{ESPRESSO}"/>')


def person(x, y, k=ESPRESSO):
    el(f'<circle cx="{x}" cy="{y - 70}" r="13" fill="{k}"/>')
    el(f'<path d="M{x - 22},{y} q0,-50 22,-52 q22,2 22,52 Z" fill="{k}"/>')


def ramme(i, tid, utsnitt, beveg, skjerm, lyd, bg):
    kol, rad = i % KOL, i // KOL
    x0, y0 = MX + kol * (RW + MX), TOPP + rad * (RH + MY)
    el(f'<rect x="{x0}" y="{y0}" width="{RW}" height="{RH}" fill="{bg}" stroke="{ESPRESSO}" stroke-width="2"/>')
    el(f'<rect x="{x0}" y="{y0}" width="74" height="22" fill="{ESPRESSO}"/>')
    tekst(x0 + 37, y0 + 16, f"{i + 1} · {tid}", 12, vekt="bold", k=HAVRE)
    # 9:16-utsnitt (midtre 56 %)
    b = RH * 9 / 16
    el(f'<rect x="{x0 + (RW - b) / 2:.1f}" y="{y0}" width="{b:.1f}" height="{RH}" fill="none" stroke="{KOBBER}" stroke-width="1" stroke-dasharray="4 3" opacity="0.7"/>')
    # skjermtekst i ruten
    el(f'<rect x="{x0 + 8}" y="{y0 + RH - 30}" width="{RW - 16}" height="22" fill="{ESPRESSO}" opacity="0.8"/>')
    tekst(x0 + RW / 2, y0 + RH - 14, skjerm, 12, vekt="bold", k=HAVRE)
    # beskrivelse under ruten
    tekst(x0, y0 + RH + 20, f"{utsnitt} · {beveg}", 12, "start", "bold")
    for j, linje in enumerate(lyd):
        tekst(x0, y0 + RH + 38 + j * 16, linje, 11, "start")
    return x0, y0


el(f'<rect width="{W}" height="{H}" fill="{HAVRE}"/>')
tekst(W / 2, 36, "Tretimer – storyboard, video 30 s (16:9, stiplet = 9:16-utsnitt)", 22, vekt="bold")
tekst(W / 2, 60, "Bare påstander som er lov nå (06_pitch.md). Scene 6: ⏳ temperaturtekst først etter bestått T1.", 13, k=FJORD)

# 1 – problemet
x, y = ramme(0, "0–3 s", "Detalj", "statisk", "Kald igjen?", ["Lunken kaffe, hinne på overflaten.", "Lyd: klokke tikker, Teams-pling."], "#d6e6e8")
keramikkopp(x + 150, y + 120)
el(f'<ellipse cx="{x + 150}" cy="{y + 62}" rx="27" ry="5" fill="#8d7766"/>')
tekst(x + 230, y + 70, "❄", 30, k=FJORD)

# 2 – mikro
x, y = ramme(1, "3–6 s", "Halvnær", "rask push-in", "Tredje runde i mikroen i dag.", ["Montasje 3 klipp på taktslag.", "Lyd: mikropip ×3."], "#d6e6e8")
person(x + 90, y + 132, FJORD)
el(f'<rect x="{x + 160}" y="{y + 40}" width="100" height="70" rx="6" fill="{STAAL}" stroke="{ESPRESSO}" stroke-width="1.5"/>')
el(f'<rect x="{x + 168}" y="{y + 50}" width="62" height="50" fill="#2b2b2b"/>')
tekst(x + 248, y + 70, "3×", 14, vekt="bold", k=ESPRESSO)

# 3 – helling
x, y = ramme(2, "6–10 s", "Nær", "tilt ned, 60 fps", "Møt Tretimer.", ["Skifte: blå → varm grading.", "Lyd: musikken starter på første dråpe."], "#f1d9bd")
kopp(x + 150, y + 132, 1.0, lokk=False)
el(f'<path d="M{x + 120},{y + 30} L{x + 175},{y + 30} L{x + 180},{y + 45} L{x + 148},{y + 45} Z" fill="{STAAL}" stroke="{ESPRESSO}"/>')
el(f'<path d="M{x + 150},{y + 45} q2,10 0,18" stroke="{ESPRESSO}" stroke-width="5" fill="none"/>')
damp(x + 195, y + 80, 2, KOBBER)

# 4 – snitt
x, y = ramme(3, "10–14 s", "Detalj / 3D", "langsom rotasjon", "Tar opp overskuddsvarmen – gir den tilbake.", ["Animert snitt: PCM-lag lyser kobber.", "Lyd: lavt, varmt sus."], "#f1d9bd")
cx, by = x + 150, y + 132
el(f'<rect x="{cx - 52}" y="{by - 100}" width="104" height="100" fill="{STAAL}" stroke="{ESPRESSO}" stroke-width="1.5"/>')
el(f'<rect x="{cx - 46}" y="{by - 96}" width="92" height="90" fill="{HAVRE}" stroke="{ESPRESSO}" stroke-dasharray="3 2"/>')
el(f'<rect x="{cx - 40}" y="{by - 92}" width="80" height="84" fill="{KOBBER}"/>')
el(f'<rect x="{cx - 33}" y="{by - 88}" width="66" height="78" fill="#6b4a33"/>')
for dx, dy, navn, k in [(49, 70, "vakuum", ESPRESSO), (37, 50, "PCM", KOBBER), (20, 30, "kaffe", ESPRESSO)]:
    el(f'<line x1="{cx + dx}" y1="{by - dy}" x2="{cx + 76}" y2="{by - dy}" stroke="{ESPRESSO}" stroke-width="1"/>')
    tekst(cx + 80, by - dy + 4, navn, 10, "start", "bold" if navn == "PCM" else "normal", k)

# 5 – lokk
x, y = ramme(4, "14–18 s", "Nær", "rack focus", "Tett vakuumlokk. Drikk uten å ta det av.", ["Lokk på, skjørt over kanten, tommel skyver åpning.", "Lyd: mykt klikk på taktslag."], "#f1d9bd")
kopp(x + 150, y + 138, 1.25)
el(f'<path d="M{x + 175},{y + 30} l12,-14" stroke="{ESPRESSO}" stroke-width="2" marker-end="url(#pil)"/>')
tekst(x + 210, y + 18, "skjørt", 11, "start", "bold")

# 6 – timelapse
x, y = ramme(5, "18–23 s", "Total", "timelapse + slider", "Laget for den som drikker sakte.", ["Lyset vandrer morgen → ettermiddag.", "⏳ etter T1: «Over 55 °C ved siste slurk etter 3 t*»"], "#efe3cf")
pc(x + 110, y + 125)
kopp(x + 210, y + 125, 0.7)
damp(x + 210, y + 60, 2, KOBBER)
for k, (dx, kl) in enumerate([(30, "09"), (150, "10:30"), (270, "12")]):
    tekst(x + dx, y + 40, kl, 12, vekt="bold", k=KOBBER if k == 2 else ESPRESSO)
el(f'<line x1="{x + 45}" y1="{y + 46}" x2="{x + 270}" y2="{y + 46}" stroke="{ESPRESSO}" stroke-dasharray="3 3"/>')

# 7 – siste slurk
x, y = ramme(6, "23–27 s", "Halvnær", "håndholdt", "Ingen batteri. Ingen lading.", ["Siste slurk, fornøyd. Tomt bordhjørne – ingen lader.", "Lyd: musikk, fornøyd «mm»."], "#f1d9bd")
person(x + 110, y + 132, KOBBER)
kopp(x + 150, y + 80, 0.55)
el(f'<rect x="{x + 200}" y="{y + 112}" width="44" height="10" fill="none" stroke="{STAAL}" stroke-dasharray="3 2"/>')
el(f'<line x1="{x + 196}" y1="{y + 126}" x2="{x + 248}" y2="{y + 108}" stroke="{FJORD}" stroke-width="2"/>')

# 8 – packshot
x, y = ramme(7, "27–30 s", "Total (packshot)", "statisk", "Tretimer – drikkeklar kaffe uten batteri.", ["Hero på havremelk, logo, «Forhåndsbestill».", "Lyd: siste akkord på taktslag."], HAVRE)
kopp(x + 150, y + 125, 1.1)
tekst(x + 250, y + 60, "Tretimer", 15, vekt="bold")
el(f'<rect x="{x + 204}" y="{y + 74}" width="92" height="20" rx="10" fill="{KOBBER}"/>')
tekst(x + 250, y + 88, "Forhåndsbestill", 9, vekt="bold", k=HAVRE)

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
       'font-family="Inter, DejaVu Sans, Arial, sans-serif">'
       f'<defs><marker id="pil" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">'
       f'<path d="M0,0 L8,4 L0,8 Z" fill="{ESPRESSO}"/></marker></defs>' + "\n".join(ut) + "</svg>\n")
with open(os.path.join(HER, "storyboard.svg"), "w") as f:
    f.write(svg)
print("skrev storyboard.svg")
