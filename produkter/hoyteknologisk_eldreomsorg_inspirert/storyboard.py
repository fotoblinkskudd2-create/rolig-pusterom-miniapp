#!/usr/bin/env python3
"""Storyboard (SVG) for 30 s video av «Stille vakt», se 07_lansering.md. Kjør: python3 storyboard.py"""
import os

HER = os.path.dirname(os.path.abspath(__file__))

NATT, RAV, HVIT, SALVIE, GRAFITT = "#1F2A44", "#F2A33A", "#F5F1E8", "#7FA38A", "#3A3A3A"
KOL, RAD = 4, 2
RW, RH = 300, 169              # 16:9-rute
MX, MY, TOPP = 30, 105, 80     # marg, radavstand, plass til tittel
W, H = MX + KOL * (RW + MX), TOPP + RAD * (RH + MY) + 10
ut = []


def el(s):
    ut.append(s)


def tekst(x, y, t, size=13, anchor="middle", vekt="normal", k=GRAFITT):
    el(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" font-weight="{vekt}" fill="{k}">{t}</text>')


def seng(x, y, b=170, k="#5a6680"):
    """Seng fra siden. (x, y) = venstre hjørne på gulvet."""
    el(f'<rect x="{x}" y="{y - 52}" width="{b}" height="14" rx="3" fill="{k}"/>')                 # ramme
    el(f'<rect x="{x}" y="{y - 70}" width="{b}" height="18" rx="6" fill="#c9cfdb"/>')            # madrass
    el(f'<rect x="{x + 10}" y="{y - 54}" width="{b - 20}" height="3" fill="#4a78b8"/>')           # strimmel
    for dx in (6, b - 12):
        el(f'<rect x="{x + dx}" y="{y - 40}" width="6" height="40" fill="{k}"/>')
    el(f'<rect x="{x - 6}" y="{y - 100}" width="8" height="100" rx="2" fill="{k}"/>')             # hodegavl


def modul(x, y, s=1.0, lys=False):
    """Kantmodul SV-1 sett forfra. (x, y) = øvre venstre hjørne."""
    if lys:
        el(f'<path d="M{x + 30 * s},{y + 22 * s} L{x - 30 * s},{y + 70 * s} L{x + 120 * s},{y + 70 * s} L{x + 50 * s},{y + 22 * s} Z" '
           f'fill="{RAV}" opacity="0.45"/>')
    el(f'<rect x="{x}" y="{y}" width="{70 * s}" height="{22 * s}" rx="{4 * s}" fill="{HVIT}" stroke="{GRAFITT}" stroke-width="1.2"/>')
    el(f'<rect x="{x + 30 * s}" y="{y + 20 * s}" width="{20 * s}" height="{3 * s}" fill="{RAV}"/>')
    el(f'<circle cx="{x + 62 * s}" cy="{y + 5 * s}" r="{1.6 * s}" fill="{SALVIE}"/>')


def person_ligger(x, y, k="#e8d9c5"):
    el(f'<circle cx="{x}" cy="{y}" r="11" fill="{k}" stroke="{GRAFITT}" stroke-width="1"/>')
    el(f'<rect x="{x + 10}" y="{y - 8}" width="110" height="16" rx="8" fill="#9fb3d1"/>')        # dyne


def person(x, y, k=GRAFITT, s=1.0):
    el(f'<circle cx="{x}" cy="{y - 70 * s}" r="{13 * s}" fill="{k}"/>')
    el(f'<path d="M{x - 22 * s},{y} q0,-50 {22 * s},-{52 * s} q{22 * s},2 {22 * s},{52 * s} Z" fill="{k}"/>')


def telefon(x, y, linje1, linje2):
    el(f'<rect x="{x}" y="{y}" width="66" height="112" rx="9" fill="{GRAFITT}"/>')
    el(f'<rect x="{x + 5}" y="{y + 10}" width="56" height="88" rx="3" fill="{HVIT}"/>')
    el(f'<rect x="{x + 8}" y="{y + 30}" width="50" height="36" rx="3" fill="{RAV}"/>')
    tekst(x + 33, y + 45, linje1, 9, vekt="bold", k=NATT)
    tekst(x + 33, y + 58, linje2, 9, k=NATT)


def ramme(i, tid, utsnitt, beveg, skjerm, lyd, bg):
    kol, rad = i % KOL, i // KOL
    x0, y0 = MX + kol * (RW + MX), TOPP + rad * (RH + MY)
    el(f'<rect x="{x0}" y="{y0}" width="{RW}" height="{RH}" fill="{bg}" stroke="{GRAFITT}" stroke-width="2"/>')
    el(f'<rect x="{x0}" y="{y0}" width="80" height="22" fill="{GRAFITT}"/>')
    tekst(x0 + 40, y0 + 16, f"{i + 1} · {tid}", 12, vekt="bold", k=HVIT)
    b = RH * 9 / 16                                            # 9:16-utsnitt (midtre del)
    el(f'<rect x="{x0 + (RW - b) / 2:.1f}" y="{y0}" width="{b:.1f}" height="{RH}" fill="none" stroke="{RAV}" '
       f'stroke-width="1" stroke-dasharray="4 3" opacity="0.6"/>')
    tekst(x0, y0 + RH + 20, f"{utsnitt} · {beveg}", 12, "start", "bold")
    for j, linje in enumerate(lyd):
        tekst(x0, y0 + RH + 38 + j * 16, linje, 11, "start")
    return x0, y0


def skjermtekst(x0, y0, t, bg=NATT, k=HVIT):
    el(f'<rect x="{x0 + 8}" y="{y0 + RH - 30}" width="{RW - 16}" height="22" fill="{bg}" opacity="0.85"/>')
    tekst(x0 + RW / 2, y0 + RH - 14, t, 12, vekt="bold", k=k)


el(f'<rect width="{W}" height="{H}" fill="{HVIT}"/>')
tekst(W / 2, 36, "Stille vakt – storyboard, video 30 s (16:9, stiplet = 9:16-utsnitt)", 22, vekt="bold", k=NATT)
tekst(W / 2, 60, "Bare påstander som er lov nå (06_pitch.md). Ingen effekttall i filmen før piloten er ferdig.", 13, k=GRAFITT)

# 1 – problemet: lommelykt i døren vekker beboeren
x, y = ramme(0, "0–3 s", "Halvnær", "statisk, mørkt", "", ["Lommelykt i døråpningen, hun myser.", "Lyd: dør knirker, stillhet."], NATT)
seng(x + 110, y + 150)
person_ligger(x + 120, y + 78)
el(f'<path d="M{x + 20},{y + 40} L{x + 125},{y + 65} L{x + 125},{y + 95} Z" fill="#fff6c8" opacity="0.7"/>')
el(f'<rect x="{x + 10}" y="{y + 35}" width="14" height="10" rx="2" fill="#bbbbbb"/>')
skjermtekst(x, y, "Kl. 02.00. Igjen.", bg="#000000")

# 2 – nattevakt med liste
x, y = ramme(1, "3–7 s", "Nær", "langsom tilfart", "", ["Sliten nattevakt, papirliste med kryss.", "Lyd: klokke tikker, skritt i gang."], "#2b3654")
person(x + 110, y + 150, k="#8796b4")
el(f'<rect x="{x + 150}" y="{y + 50}" width="60" height="80" fill="{HVIT}"/>')
for j in range(6):
    el(f'<line x1="{x + 158}" y1="{y + 62 + j * 11}" x2="{x + 200}" y2="{y + 62 + j * 11}" stroke="{GRAFITT}" stroke-width="1"/>')
    tekst(x + 154, y + 66 + j * 11, "✓", 9, k=GRAFITT)
skjermtekst(x, y, "Hver annen time. Hele natten.")

# 3 – montering av modulen
x, y = ramme(2, "7–11 s", "Detalj", "statisk, dagslys", "", ["Hånd skrur kantmodulen fast på rammen.", "Lyd: ett klikk. Musikk starter (piano)."], "#e6e9ef")
el(f'<rect x="{x + 30}" y="{y + 40}" width="240" height="22" fill="#5a6680"/>')
modul(x + 100, y + 70, 1.4)
el(f'<path d="M{x + 225},{y + 120} q-20,-25 -15,-45 l18,-6 q10,20 12,51 Z" fill="#e8d9c5" stroke="{GRAFITT}"/>')
skjermtekst(x, y, "Ingen kamera. Ingen mikrofon.")

# 4 – hun setter seg opp, rav lys på gulvet
x, y = ramme(3, "11–15 s", "Total", "statisk, mørkt", "", ["Hun setter seg opp. Rav lys på gulvet.", "Lyd: dyne rasler, varm tone."], NATT)
seng(x + 60, y + 140)
el(f'<circle cx="{x + 100}" cy="{y + 50}" r="11" fill="#e8d9c5"/>')
el(f'<rect x="{x + 88}" y="{y + 60}" width="24" height="30" rx="8" fill="#9fb3d1"/>')
modul(x + 120, y + 92, 0.8, lys=True)
el(f'<line x1="{x + 10}" y1="{y + 145}" x2="{x + 290}" y2="{y + 145}" stroke="#5a6680" stroke-width="2"/>')
skjermtekst(x, y, "Lyset kommer når hun setter seg opp.", bg=RAV, k=NATT)

# 5 – varsel på telefonen
x, y = ramme(4, "15–19 s", "Nær → halvnær", "panorering", "", ["Pleiers telefon vibrerer. Hun går rolig inn.", "Lyd: én myk tone, ingen sirene."], "#2b3654")
telefon(x + 40, y + 25, "Rom 4", "sitter opp")
person(x + 200, y + 150, k="#8796b4")
skjermtekst(x, y, "Besøk når det trengs.")

# 6 – dag: kontakt og smertekartlegging
x, y = ramme(5, "19–24 s", "Halvnær", "håndholdt, rolig", "", ["Pleier sitter med beboer, holder hånden.", "Lyd: latter, kaffe skjenkes."], "#f3e6cf")
person(x + 100, y + 150, k="#c7a77f")
person(x + 190, y + 150, k=SALVIE)
el(f'<circle cx="{x + 145}" cy="{y + 115}" r="9" fill="#e8d9c5" stroke="{GRAFITT}"/>')
skjermtekst(x, y, "Tid til det som betyr noe.", bg=SALVIE, k=NATT)

# 7 – mimamori-team
x, y = ramme(6, "24–27 s", "Total", "langsom kjøring", "", ["Teamet ved et bord: logg og MOBID-2-skjema.", "Lyd: musikk bygger seg opp."], "#e6e9ef")
el(f'<rect x="{x + 60}" y="{y + 100}" width="180" height="10" fill="#8a6b4a"/>')
for i, k in enumerate(["#8796b4", SALVIE, "#c7a77f", "#8796b4"]):
    person(x + 75 + i * 50, y + 100, k=k, s=0.7)
skjermtekst(x, y, "Inspirert av Japan. Bygget på norsk forskning.")

# 8 – produkt + løfte
x, y = ramme(7, "27–30 s", "Detalj / pakkeskudd", "statisk", "", ["Kantmodul på hvit, logo, «Pilot 2027».", "Lyd: siste pianotone, stillhet."], HVIT)
modul(x + 80, y + 50, 2.0)
tekst(x + RW / 2, y + 125, "Stille vakt", 22, vekt="bold", k=NATT)
skjermtekst(x, y, "La dem sove. Vær der når de våkner.")

svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Helvetica, Arial, sans-serif">' + "".join(ut) + "</svg>"
open(os.path.join(HER, "storyboard.svg"), "w").write(svg)
print("skrev storyboard.svg")
