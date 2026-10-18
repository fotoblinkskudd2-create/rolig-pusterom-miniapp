#!/usr/bin/env python3
"""Genererer tekniske SVG-tegninger av LIVA Plattform.

Geometri holdes i synk med cad/liva.scad og 04-produktspesifikasjon.md.
Kjør: python3 tegninger/generer.py  (skriver SVG-filer ved siden av skriptet)
"""
import math
import os

OUT = os.path.dirname(os.path.abspath(__file__))

BASE_L, BASE_H, WHEEL_D = 1400, 110, 150
SEAT_D, PAD_T, SEAT_W = 450, 90, 600
SEAT_X = 820            # setefront
BACK_L, LEG_L, FOOT_D = 750, 580, 300
HOLE_W, HOLE_D, RAIL_W = 260, 220, 900

MODES = {
    # navn: (setehøyde, ryggvinkel, benseksjon ute, fotbrettfall, etikett)
    "seng":         (600,  0, True,    0, "SENG — hvile, undersøkelse, HLR"),
    "halvsittende": (700, 55, True,    0, "HALVSITTENDE — perinealstøtte, norsk standard"),
    "krakk":        (780, 75, False, 350, "KRAKK (løftet) — oppreist, jordmor på sadelstol"),
    "kne":          (700, 85, False,   0, "KNE / FOROVER — lener over ryggtopp, sete delt"),
    "gyn":          (950, 30, False,   0, "GYN — instrumentell forløsning, sutur"),
}

INK = "#2b2a28"
PAD = "#d8c7a4"
FRAME = "#6b6661"
RED = "#c8341f"
DIM = "#1f5f8b"
FONT = "font-family='Helvetica,Arial,sans-serif'"


class Svg:
    def __init__(self, w, h, scale, ox, oy):
        self.w, self.h, self.s, self.ox, self.oy = w, h, scale, ox, oy
        self.parts = []

    def X(self, x):
        return self.ox + x * self.s

    def Y(self, z):
        return self.oy - z * self.s

    def poly(self, pts, fill, stroke=INK, sw=1.2):
        p = " ".join(f"{self.X(x):.1f},{self.Y(z):.1f}" for x, z in pts)
        self.parts.append(f"<polygon points='{p}' fill='{fill}' stroke='{stroke}' stroke-width='{sw}' stroke-linejoin='round'/>")

    def rect(self, x, z, l, h, fill, stroke=INK):
        self.poly([(x, z), (x + l, z), (x + l, z + h), (x, z + h)], fill, stroke)

    def circle(self, x, z, r, fill, stroke=INK):
        self.parts.append(f"<circle cx='{self.X(x):.1f}' cy='{self.Y(z):.1f}' r='{r*self.s:.1f}' fill='{fill}' stroke='{stroke}' stroke-width='1.2'/>")

    def line(self, x1, z1, x2, z2, stroke=INK, sw=1.2, dash=None):
        d = f" stroke-dasharray='{dash}'" if dash else ""
        self.parts.append(f"<line x1='{self.X(x1):.1f}' y1='{self.Y(z1):.1f}' x2='{self.X(x2):.1f}' y2='{self.Y(z2):.1f}' stroke='{stroke}' stroke-width='{sw}' stroke-linecap='round'{d}/>")

    def text(self, x, z, t, size=11, fill=INK, anchor="start", weight="normal", raw=False):
        px, py = (x, z) if raw else (self.X(x), self.Y(z))
        self.parts.append(f"<text x='{px:.1f}' y='{py:.1f}' {FONT} font-size='{size}' fill='{fill}' text-anchor='{anchor}' font-weight='{weight}'>{t}</text>")

    def vdim(self, x, z1, z2, label):
        self.line(x, z1, x, z2, DIM, 0.9)
        for z in (z1, z2):
            self.line(x - 25, z, x + 25, z, DIM, 0.9)
        self.text(self.X(x) + 6, self.Y((z1 + z2) / 2) + 4, label, 10, DIM, raw=True)

    def hdim(self, x1, x2, z, label):
        self.line(x1, z, x2, z, DIM, 0.9)
        for x in (x1, x2):
            self.line(x, z - 25, x, z + 25, DIM, 0.9)
        self.text(self.X((x1 + x2) / 2), self.Y(z) - 5, label, 10, DIM, "middle", raw=True)

    def save(self, name, title):
        body = "\n".join(self.parts)
        svg = (f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {self.w} {self.h}' width='{self.w}' height='{self.h}'>\n"
               f"<title>{title}</title><rect width='100%' height='100%' fill='#fbfaf7'/>\n{body}\n</svg>\n")
        with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
            f.write(svg)


def rot(px, pz, ang_deg, cx, cz):
    a = math.radians(ang_deg)
    dx, dz = px - cx, pz - cz
    return cx + dx * math.cos(a) - dz * math.sin(a), cz + dx * math.sin(a) + dz * math.cos(a)


def draw_side(svg, seat_z, back_ang, leg_out, foot_drop, dims=True):
    # hjul + base
    for x in (90, BASE_L / 2, BASE_L - 90):
        svg.circle(x, WHEEL_D / 2, WHEEL_D / 2 * (0.8 if x == BASE_L / 2 else 1), "#444")
    svg.rect(0, WHEEL_D * 0.6, BASE_L, BASE_H, FRAME)
    # tvillingsøyler
    seat_back = SEAT_X - SEAT_D
    col_top = seat_z - PAD_T - 40
    z0 = WHEEL_D * 0.6 + BASE_H
    for cx in (seat_back + 40, SEAT_X - 120):
        h = col_top - z0
        for i in range(3):
            svg.rect(cx + i * 6, z0 + i * h / 3, 80 - i * 12, h / 3 + 1, "#bfc1c4")
    # seteramme + sete (hesteskoåpning vist stiplet)
    svg.rect(seat_back, seat_z - PAD_T - 40, SEAT_D, 40, FRAME)
    svg.rect(seat_back, seat_z - PAD_T, SEAT_D, PAD_T, PAD)
    svg.line(SEAT_X - HOLE_D, seat_z - PAD_T, SEAT_X - HOLE_D, seat_z, INK, 0.8, "4 3")
    # ryggstøtte pivot i setets bakkant
    cx, cz = seat_back, seat_z - PAD_T
    pts = [(seat_back - BACK_L, cz), (seat_back, cz), (seat_back, cz + PAD_T), (seat_back - BACK_L, cz + PAD_T)]
    svg.poly([rot(x, z, -back_ang, cx, cz) for x, z in pts], PAD)
    rx, rz = rot(seat_back - BACK_L, cz + PAD_T / 2, -back_ang, cx, cz)
    svg.circle(rx, rz, 60, PAD)
    # benseksjon
    if leg_out:
        svg.rect(SEAT_X, seat_z - PAD_T, LEG_L, PAD_T * 0.8, PAD)
    # fotbrett
    if foot_drop:
        for x in (SEAT_X - 20, SEAT_X + FOOT_D - 60):
            svg.line(SEAT_X - 10, seat_z - PAD_T - 40, x, seat_z - foot_drop, FRAME, 3)
        svg.rect(SEAT_X - 20, seat_z - foot_drop - 25, FOOT_D, 25, "#3a3a3d")
        # QBL-trakt
        svg.poly([(SEAT_X - HOLE_D + 20, seat_z - PAD_T - 45), (SEAT_X - 40, seat_z - PAD_T - 45),
                  (SEAT_X - 90, seat_z - PAD_T - 230), (SEAT_X - HOLE_D + 70, seat_z - PAD_T - 230)],
                 "#e9ecef", INK, 0.8)
        svg.text(SEAT_X - HOLE_D / 2 - 15, seat_z - PAD_T - 150, "QBL", 9, INK, "middle")
    # AKUTT-spak
    svg.line(seat_back - 260, seat_z - PAD_T - 60, seat_back - 200, seat_z - PAD_T - 220, RED, 5)
    # LED
    svg.rect(SEAT_X - 6, seat_z - PAD_T - 38, 8, 14, "#ffe9a8", "#b38f00")
    if dims:
        svg.vdim(SEAT_X + (LEG_L if leg_out else FOOT_D) + 80, 0, seat_z, f"{seat_z}")
        if foot_drop:
            svg.vdim(SEAT_X + FOOT_D + 160, seat_z - foot_drop, seat_z, f"fotbrett −{foot_drop}")


def drawing_modes():
    cols, rows = 2, 3
    cw, ch = 660, 360
    W, H = cols * cw, rows * ch + 70
    svg = Svg(W, H, 0.24, 0, 0)
    svg.text(24, 38, "LIVA Plattform — sidebilde, moduser (mål i mm, målestokk ca. 1:20 ved A3)", 18, INK, weight="bold", raw=True)
    for i, (key, (sz, ba, lo, fd, label)) in enumerate(MODES.items()):
        c, r = i % cols, i // cols
        svg.ox = c * cw + 280
        svg.oy = 70 + r * ch + ch - 50
        svg.line(-1050, 0, 1600, 0, "#999", 1)
        draw_side(svg, sz, ba, lo, fd)
        svg.text(svg.ox - 260, svg.oy + 30, label, 12, INK, weight="bold", raw=True)
    # forklaring i siste rute
    svg.ox, svg.oy = cw + 40, 70 + 2 * ch + 80
    for j, t in enumerate(["Rød = AKUTT FLAT-spak (mekanisk, uten strøm)",
                           "Stiplet = hesteskoåpning 260 × 220",
                           "Gul = LED-arbeidslys mot perinealsonen",
                           "Tvillingsøyler 420–1000 setehøyde, ±12° tilt",
                           "QBL = trakt + lastcelle, kvantitativt blodtap"]):
        svg.text(svg.ox, svg.oy + j * 22, t, 12, INK, raw=True)
    svg.save("01-moduser-sidebilde.svg", "LIVA moduser sidebilde")


def drawing_top():
    W, H = 1000, 640
    svg = Svg(W, H, 0.38, 200, 330)
    s = svg

    def R(x, y, l, w, fill):  # toppvisning: z-aksen brukes som y
        s.rect(x, y, l, w, fill)

    s.text(24, 38, "LIVA Plattform — toppvisning, sengemodus (mål i mm)", 18, INK, weight="bold", raw=True)
    seat_back = SEAT_X - SEAT_D
    R(-200, -RAIL_W / 2, SEAT_X + LEG_L + 200, RAIL_W, "#eeeae2")          # skinne-omriss
    R(seat_back - BACK_L, -SEAT_W / 2, BACK_L, SEAT_W, PAD)                 # rygg
    R(seat_back, -SEAT_W / 2, SEAT_D, SEAT_W, PAD)                          # sete
    R(SEAT_X, -SEAT_W / 2, LEG_L, SEAT_W, "#e6d9bd")                        # benseksjon
    # hesteskoåpning
    s.rect(SEAT_X - HOLE_D, -HOLE_W / 2, HOLE_D, HOLE_W, "#fbfaf7")
    s.line(seat_back + SEAT_D / 2 - 120, 0, SEAT_X, 0, INK, 0.8, "6 4")     # delingslinje
    for side in (-1, 1):
        s.rect(seat_back - BACK_L * 0.4 - 20, side * RAIL_W / 2 - 15, 40, 30, RED)
    s.hdim(seat_back - BACK_L, SEAT_X + LEG_L, -RAIL_W / 2 - 160, f"{BACK_L + SEAT_D + LEG_L} liggeflate — 2050 totalt inkl. topprulle og endegavler")
    s.hdim(seat_back, SEAT_X, RAIL_W / 2 + 90, f"sete {SEAT_D}")
    s.hdim(SEAT_X - HOLE_D, SEAT_X, HOLE_W / 2 + 60, f"{HOLE_D}")
    s.vdim(SEAT_X + LEG_L + 380, -RAIL_W / 2, RAIL_W / 2, f"{RAIL_W} over skinner")
    s.vdim(SEAT_X + LEG_L + 60, -SEAT_W / 2, SEAT_W / 2, f"{SEAT_W} (→750 delt)")
    s.vdim(SEAT_X - HOLE_D - 110, -HOLE_W / 2, HOLE_W / 2, f"{HOLE_W}")
    s.text(seat_back - BACK_L / 2, 0, "RYGG 750", 12, INK, "middle")
    s.text(SEAT_X + LEG_L / 2, 0, "BENSEKSJON 580", 12, INK, "middle")
    s.text(24, H - 24, "Rødt = AKUTT FLAT-spak begge sider. Sete deles langs stiplet linje, 0–75 mm per side.", 12, INK, raw=True)
    s.save("02-toppvisning.svg", "LIVA toppvisning")


def figure(svg, hip, knee, foot, shoulder, head, hand, color):
    for a, b in ((hip, knee), (knee, foot), (hip, shoulder), (shoulder, hand)):
        svg.line(*a, *b, color, 7)
    svg.circle(*head, 80, color, color)


def drawing_ergonomics():
    W, H = 1100, 560
    svg = Svg(W, H, 0.3, 0, 500)
    svg.text(24, 38, "Hvorfor løftet krakk: jordmorens arbeidsstilling", 18, INK, weight="bold", raw=True)
    # venstre: klassisk krakk
    svg.ox = 80
    svg.line(-100, 0, 1500, 0, "#999")
    svg.rect(300, 0, 60, 380, "#a0806a")
    svg.rect(220, 380, 360, 50, "#a0806a")
    svg.text(400, 1450, "I dag: fødekrakk 430 mm", 14, INK, "middle", "bold")
    # jordmor knelende, rygg bøyd ~60°
    figure(svg, hip=(950, 480), knee=(900, 40), foot=(1250, 40), shoulder=(517, 730),
           head=(430, 820), hand=(420, 420), color="#7a4b8f")
    svg.text(400, 1350, "jordmor kneler, rygg ~60° fleksjon", 12, RED, "middle")
    svg.text(400, 1270, "perineum ca. 400 mm over gulv", 12, INK, "middle")
    # høyre: LIVA
    svg.ox = 600
    svg.line(-100, 0, 1500, 0, "#999")
    svg.rect(150, 140, 400, 120, FRAME)
    svg.rect(250, 260, 90, 430, "#bfc1c4")
    svg.rect(130, 690, 450, 90, PAD)
    svg.rect(560, 405, 300, 25, "#3a3a3d")
    svg.text(400, 1450, "LIVA: sete 780, fotbrett −350", 14, INK, "middle", "bold")
    # sadelstol
    svg.rect(1150, 0, 40, 560, "#bfc1c4")
    svg.rect(1020, 560, 300, 60, PAD)
    figure(svg, hip=(1170, 640), knee=(980, 520), foot=(980, 20), shoulder=(1035, 1140),
           head=(1010, 1270), hand=(600, 750), color="#2f7d5b")
    svg.text(400, 1350, "jordmor sitter oppreist, rygg &lt; 20°", 12, "#2f7d5b", "middle")
    svg.text(400, 1270, "perineum ca. 720 mm — hender ved albuehøyde", 12, INK, "middle")
    svg.save("03-ergonomi-jordmor.svg", "Jordmorens arbeidsstilling")


if __name__ == "__main__":
    drawing_modes()
    drawing_top()
    drawing_ergonomics()
    print("Skrev SVG-er til", OUT)
