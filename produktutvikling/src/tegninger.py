"""Genererer konsepttegningene (A3, ISO-stil) for de fem produktene.

Utdata: ../tegninger/*.png og ../tegninger/VAR_Tegningssett_A3.pdf
"""
import os
import numpy as np
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib.patches import Circle, Rectangle, Polygon, Arc
from tegnelib import (ark, linje, kontur, superellipse, avrundet_rekt, senterlinje, mal, radius, ledetekst,
                      ballong, visningstittel, snittpil, stykkliste, notater, skravur, lagre,
                      TYKK, TYNN, SKJULT, PHANTOM, BLEKK, SNITT, FONT, MM)

UT = os.path.join(os.path.dirname(__file__), "..", "tegninger")


def T(pts, cx, cy, s=1.0, rot=0.0):
    pts = np.asarray(pts, float)
    if rot:
        a = np.radians(rot)
        R = np.array([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
        pts = pts @ R.T
    return pts * s + np.array([cx, cy])


def P(x, y, cx, cy, s=1.0):
    return (cx + x * s, cy + y * s)


# --------------------------------------------------------------------------- GLØD
def glod_profil(n=200, skall=0.0):
    x = np.linspace(-64 + skall, 64 - skall, n)
    a = 64 - skall
    s_bunn = (1 - np.abs(x / a) ** 2.4) ** (1 / 2.4)
    s_topp = (1 - np.abs(x / a) ** 3.4) ** (1 / 3.4)
    dip = 2.6 * np.clip(1 - (x / 46) ** 2, 0, None) ** 2
    topp = (19 - skall) * s_topp - dip
    bunn = -(19 - skall) * s_bunn
    return x, topp, bunn


def ark_glod(pdf):
    fig, ax = ark("GLØD – termo-peristaltisk stimulator", "VÅR-GL-001", "1:1 (snitt 1,5:1)",
                  "LSR Shore 10A · PC/ABS · POM")
    # Kontaktflate (plan)
    cx, cy = 100, 228
    kontur(ax, superellipse(cx, cy, 64, 34, 2.6))
    kontur(ax, avrundet_rekt(cx - 4, cy, 76, 36, 10), lw=TYNN, ls=SKJULT)
    linje(ax, [cx - 38, cx + 30], [cy + 9, cy + 9], lw=TYNN, ls=SKJULT)
    linje(ax, [cx - 38, cx + 30], [cy - 9, cy - 9], lw=TYNN, ls=SKJULT)
    for xr in (-30, 22):
        ax.add_patch(Circle((cx + xr, cy), 4, fc="none", ec=BLEKK, lw=TYNN, ls=SKJULT))
    senterlinje(ax, cx - 72, cy, cx + 72, cy)
    senterlinje(ax, cx, cy - 40, cx, cy + 40)
    mal(ax, (cx - 64, cy), (cx + 64, cy), 42, "128", retning="h")
    mal(ax, (cx, cy - 34), (cx, cy + 34), 74, "68", retning="v")
    mal(ax, (cx - 42, cy - 18), (cx + 34, cy - 18), -22, "76 (aktiv sone)", retning="h")
    ledetekst(ax, (cx + 22, cy + 3), (cx + 50, cy + 44), "Rullebane, slag 52 mm (skjult)")
    snittpil(ax, cx - 76, cy, cx + 76, cy, "A")
    visningstittel(ax, cx, cy - 46, "KONTAKTFLATE (SETT FRA KROPP)", "1:1")

    # Sidevisning
    sx, sy = 100, 140
    x, t, b = glod_profil()
    kontur(ax, T(np.column_stack([np.r_[x, x[::-1]], np.r_[t, b[::-1]]]), sx, sy))
    senterlinje(ax, sx - 72, sy, sx + 72, sy)
    for xb, w in ((-14, 9), (0, 9), (14, 9)):
        yb = -19 * (1 - abs(xb / 64) ** 2.4) ** (1 / 2.4)
        ax.add_patch(Rectangle((sx + xb - w / 2, sy + yb - 1.2), w, 1.6, fc="white", ec=BLEKK, lw=TYNN, zorder=4))
    mal(ax, (sx - 64, sy), (sx + 64, sy), -30, "128", retning="h")
    mal(ax, (sx + 40, sy - 19), (sx + 40, sy + 17.5), 30, "38", retning="v")
    ledetekst(ax, (sx - 20, sy + 15.6), (sx - 60, sy + 30), "Konkav sadel, dybde 2,6")
    ledetekst(ax, (sx + 14, sy - 19.5), (sx + 40, sy - 40), "3 taktile knapper (Ø-, Δ-, —-form)")
    ledetekst(ax, (sx + 52, sy - 10), (sx + 58, sy - 30), "Magnetisk ladekontakt")
    visningstittel(ax, sx, sy - 42, "SIDEVISNING", "1:1")

    # Endevisning
    ex, ey = 214, 140
    th = np.linspace(0, 2 * np.pi, 200)
    xs = 34 * np.sign(np.cos(th)) * np.abs(np.cos(th)) ** (2 / 2.2)
    ys = np.where(np.sin(th) > 0, 17.5, 19) * np.sign(np.sin(th)) * np.abs(np.sin(th)) ** (2 / 2.2)
    ys = ys - np.where(np.sin(th) > 0, 2.6 * np.clip(1 - (xs / 26) ** 2, 0, None), 0)
    kontur(ax, T(np.column_stack([xs, ys]), ex, ey))
    senterlinje(ax, ex, ey - 26, ex, ey + 26)
    mal(ax, (ex - 34, ey), (ex + 34, ey), -27, "68", retning="h")
    visningstittel(ax, ex, ey - 42, "ENDEVISNING", "1:1")

    # Snitt A-A (1,5:1)
    s = 1.5
    ox, oy = 312, 222
    x, t, b = glod_profil()
    ytre = np.column_stack([np.r_[x, x[::-1]], np.r_[t, b[::-1]]])
    xi, ti, bi = glod_profil(skall=2.5)
    indre = np.column_stack([np.r_[xi, xi[::-1]], np.r_[ti, bi[::-1]]])
    skravur(ax, T(ytre, ox, oy, s), hatch="////", z=2)
    kontur(ax, T(indre, ox, oy, s), lw=TYNN, fc="white", z=2.5)
    kontur(ax, T(ytre, ox, oy, s), z=3)
    # gelpute under kontaktflaten
    gx = np.linspace(-38, 38, 80)
    gt = np.interp(gx, xi, ti)
    gel = np.column_stack([np.r_[gx, gx[::-1]], np.r_[gt, gt[::-1] - 4.5]])
    skravur(ax, T(gel, ox, oy, s), hatch="....", z=3)
    gm = np.column_stack([gx, gt - 4.5])
    linje(ax, *T(gm, ox, oy, s).T, lw=TYKK * 1.1, c="#d95926")          # varmefolie
    # rullevogn og kamskinne
    ax.add_patch(Circle(P(-8, gt[40] - 9, ox, oy, s), 4 * s, fc="white", ec=BLEKK, lw=TYKK, zorder=4))
    ax.add_patch(Circle(P(-8, gt[40] - 9, ox, oy, s), 1.2 * s, fc=BLEKK, ec="none", zorder=5))
    ax.add_patch(Rectangle(P(-40, 1.0, ox, oy, s), 74 * s, 2.2 * s, fc="#dddddd", ec=BLEKK, lw=TYNN, zorder=3.5))
    ax.add_patch(Rectangle(P(-16, 3.2, ox, oy, s), 16 * s, 2.6 * s, fc="white", ec=BLEKK, lw=TYNN, zorder=3.5))
    # motor, batteri, pcb
    ax.add_patch(Rectangle(P(36, -7, ox, oy, s), 22 * s, 12 * s, fc="white", ec=BLEKK, lw=TYKK, zorder=4))
    ax.add_patch(Rectangle(P(-44, -12.5, ox, oy, s), 70 * s, 8 * s, fc="white", ec=BLEKK, lw=TYKK, zorder=4, hatch="xx"))
    ax.add_patch(Rectangle(P(-48, -3.2, ox, oy, s), 80 * s, 1.6 * s, fc="#1baf7a", ec=BLEKK, lw=TYNN, zorder=4))
    ax.add_patch(Rectangle(P(48, -17.5, ox, oy, s), 8 * s, 3 * s, fc=BLEKK, ec=BLEKK, lw=TYNN, zorder=4))
    ax.add_patch(Rectangle(P(-58, -2, ox, oy, s), 8 * s, 5 * s, fc="white", ec=BLEKK, lw=TYNN, zorder=4))
    for xn in (-28, 26):
        ax.add_patch(Circle(P(xn, gt[0] - 3.3 if False else np.interp(xn, gx, gt) - 4.9, ox, oy, s), 0.9 * s,
                            fc=SNITT, ec="none", zorder=6))
    ballonger = [
        (1, P(-62, 0, ox, oy, s), (ox - 112, oy + 14)),
        (2, P(-30, np.interp(-30, gx, gt) - 2, ox, oy, s), (ox - 70, oy + 40)),
        (3, P(-12, np.interp(-12, gx, gt) - 4.5, ox, oy, s), (ox - 40, oy + 44)),
        (4, P(-8, gt[40] - 9, ox, oy, s), (ox - 10, oy + 44)),
        (5, P(20, 2, ox, oy, s), (ox + 20, oy + 44)),
        (6, P(47, 0, ox, oy, s), (ox + 70, oy + 34)),
        (7, P(10, np.interp(10, gx, gt) - 4.5, ox, oy, s), (ox + 48, oy + 44)),
        (8, P(26, np.interp(26, gx, gt) - 4.9, ox, oy, s), (ox + 92, oy + 20)),
        (11, P(-10, -8.5, ox, oy, s), (ox - 30, oy - 44)),
        (12, P(-30, -2.4, ox, oy, s), (ox - 70, oy - 40)),
        (10, P(-54, 0.5, ox, oy, s), (ox - 112, oy - 10)),
        (15, P(52, -16, ox, oy, s), (ox + 70, oy - 40)),
        (9, P(-38, np.interp(-38, gx, gt) - 5.5, ox, oy, s), (ox - 100, oy + 32)),
        (13, P(20, -15.5, ox, oy, s), (ox + 30, oy - 44)),
    ]
    ax.add_patch(Rectangle(P(-40, np.interp(-38, gx, gt) - 7.5, ox, oy, s), 4 * s, 2 * s, fc=BLEKK, ec=BLEKK, zorder=5))
    for nr, m, p in ballonger:
        ballong(ax, nr, m, p)
    visningstittel(ax, ox, oy - 52, "SNITT A-A", "1,5:1")

    rader = [(1, "Ytterhud", "Medisinsk LSR Shore 10A, ISO 10993", 1),
             (2, "Gelpute 8 ml", "Silikongel, forseglet", 1),
             (3, "Membran 0,8 mm", "LSR Shore 20A", 1),
             (4, "Rullevogn m/ 2 ruller Ø8", "POM + rustfrie minilager", 1),
             (5, "Kamskinne / føring", "POM, slag 52 mm", 1),
             (6, "Girmotor N20 1:150", "3 V, 0,3-1,5 Hz bølge", 1),
             (7, "Varmefolie 3 W", "Polyimid, 60 x 30 mm", 1),
             (8, "NTC 10k (x2)", "Redundant temp.-måling", 2),
             (9, "Termosikring 45 °C", "Bimetall, ikke-tilbakestillbar", 1),
             (10, "LRA pulsaktuator", "0815, 40-80 Hz «hjerteslag»", 1),
             (11, "Batteri 2000 mAh", "Li-ion polymer + PCM, IEC 62133-2", 1),
             (12, "PCBA", "Cortex-M0+, lader, H-bro", 1),
             (13, "Chassis topp/bunn", "PC/ABS, ultralydsveiset", 2),
             (15, "Ladekontakt", "Magnetisk 2-pin, forgylt", 1)]
    stykkliste(ax, 262, 158, rader)
    notater(ax, 26, 80, [
        "Overflatetemperatur: regulert 38-41 °C (programvare), maks 43 °C (maskinvarekutt), termosikring 45 °C.",
        "Bølgekraft mot hud 0,5-3,0 N, frekvens 0,3-1,5 Hz. Ingen vibrasjon i grunnmodus (anti-nummenhet).",
        "Kontaktflate polert SPI A2, Ra ≤ 0,4 µm. Ingen skjøter / sømmer mot kropp.",
        "Tetthet IP67 (IEC 60529), 30 min / 1 m. Ingen åpne porter.",
        "Vekt mål: 185 g ± 10 g. Støy mål: ≤ 30 dB(A) @ 30 cm.",
        "Alle mål er konseptmål; DFM-gjennomgang med silikonleverandør før verktøyfrys.",
    ])
    lagre(fig, os.path.join(UT, "GL-001_Glod"), pdf)


# --------------------------------------------------------------------------- AVTRYKK
def avtrykk_halvbredde(x):
    x = np.asarray(x, float)
    w = np.empty_like(x)
    for i, v in enumerate(x):
        if v < 10:
            w[i] = 19 * np.sqrt(max(0.0, 1 - ((10 - v) / 10) ** 2))
        elif v < 48:
            w[i] = 19
        elif v < 70:
            u = (v - 48) / 22
            w[i] = 19 + 16 * (3 * u * u - 2 * u ** 3)
        elif v < 108:
            w[i] = 35
        else:
            u = min(1.0, (v - 108) / 42)
            w[i] = 35 * (1 - u ** 2.2) ** (1 / 2.2)
    return w


def avtrykk_tykkelse(x):
    x = np.asarray(x, float)
    th = np.where(x < 48, 32, np.where(x < 70, 32 - 10 * (x - 48) / 22, 22 - 10 * np.clip((x - 70) / 80, 0, 1)))
    end = np.where(x < 6, np.sqrt(np.clip(1 - ((6 - x) / 6) ** 2, 0, 1)), 1)
    tip = np.where(x > 144, np.sqrt(np.clip(1 - ((x - 144) / 6) ** 2, 0, 1)), 1)
    return th * end * tip


def ark_avtrykk(pdf):
    fig, ax = ark("AVTRYKK – selvformende stimulator", "VÅR-AV-001", "1:1 (snitt 2:1)",
                  "LSR Shore 5A · PP-granulat · PC")
    x = np.linspace(0, 150, 300)
    w = avtrykk_halvbredde(x)
    cx, cy = 30, 230
    kontur(ax, T(np.column_stack([np.r_[x, x[::-1]], np.r_[w, -w[::-1]]]), cx, cy))
    kontur(ax, T(np.column_stack([np.r_[x[30:290], x[30:290][::-1]],
                                   np.r_[np.clip(w[30:290] - 3, 0, None), -np.clip(w[30:290][::-1] - 3, 0, None)]]),
                 cx, cy), lw=TYNN, ls=SKJULT)
    for (nx, ny) in [(84, 16), (84, -16), (114, 0), (138, 0)]:
        ax.add_patch(Circle((cx + nx, cy + ny), 7, fc="none", ec=BLEKK, lw=TYNN, ls=SKJULT))
        ax.add_patch(Circle((cx + nx, cy + ny), 1, fc=BLEKK, ec="none"))
    ax.add_patch(Rectangle((cx + 8, cy - 9), 18, 18, fc="none", ec=BLEKK, lw=TYNN, ls=SKJULT))
    ax.add_patch(Rectangle((cx + 28, cy - 13), 18, 26, fc="none", ec=BLEKK, lw=TYNN, ls=SKJULT))
    senterlinje(ax, cx - 6, cy, cx + 156, cy)
    linje(ax, [cx + 60, cx + 60], [cy - 38, cy + 38], lw=TYNN, ls=PHANTOM, c="#555")
    ax.text(cx + 61, cy + 39, "formbar sone →", fontsize=5.8, family=FONT, color="#555")
    mal(ax, (cx, cy), (cx + 150, cy), 42, "150", retning="h")
    mal(ax, (cx + 95, cy - 35), (cx + 95, cy + 35), 62, "70", retning="v")
    mal(ax, (cx + 20, cy - 19), (cx + 20, cy + 19), -28, "38", retning="v")
    mal(ax, (cx, cy - 19), (cx + 48, cy - 19), -22, "48 (stivt håndtak)", retning="h")
    ledetekst(ax, (cx + 138, cy), (cx + 152, cy - 30), "4 haptiske noder Ø14", ha="left")
    ledetekst(ax, (cx + 17, cy), (cx + 6, cy + 46), "Pumpe + ventil")
    snittpil(ax, cx + 100, cy - 44, cx + 100, cy + 44, "B")
    visningstittel(ax, cx + 75, cy - 50, "PLANVISNING", "1:1")

    # Sidevisning med fantomlinjer for formet tilstand
    sx, sy = 30, 138
    th = avtrykk_tykkelse(x)
    top = th * 0.5
    bot = -th * 0.5
    side = np.column_stack([np.r_[x, x[::-1]], np.r_[top, bot[::-1]]])
    kontur(ax, T(side, sx, sy))
    senterlinje(ax, sx - 6, sy, sx + 156, sy)
    for vinkel in (28, -18):
        mask = x >= 60
        xb = x[mask] - 60
        pts = np.column_stack([np.r_[xb, xb[::-1]], np.r_[top[mask], bot[mask][::-1]]])
        a = np.radians(vinkel)
        # bøy progressivt: vinkel fordelt langs lengden
        bx, by = [], []
        for (px, py) in pts:
            frac = px / 90
            aa = a * frac
            r = 90 / a if a else 1e9
            bx.append(r * np.sin(aa) - py * np.sin(aa))
            by.append(r * (1 - np.cos(aa)) + py * np.cos(aa))
        kontur(ax, T(np.column_stack([bx, by]), sx + 60, sy), lw=TYNN, ls=PHANTOM, ec="#555")
    mal(ax, (sx + 10, sy - 16), (sx + 10, sy + 16), -20, "32", retning="v")
    mal(ax, (sx + 100, sy - avtrykk_tykkelse([100])[0] / 2), (sx + 100, sy + avtrykk_tykkelse([100])[0] / 2),
        64, "18,3", retning="v")
    ledetekst(ax, (sx + 128, sy + 31), (sx + 152, sy + 36), "Formet + låst (fantom)")
    ledetekst(ax, (sx + 128, sy - 24), (sx + 152, sy - 30), "Bøyeområde ±30°, R ≥ 40")
    visningstittel(ax, sx + 75, sy - 40, "SIDEVISNING", "1:1")

    # Snitt B-B 2:1
    s = 2.0
    ox, oy = 318, 226
    hw = 33.5
    tt = avtrykk_tykkelse([100])[0] / 2
    yy = np.linspace(-hw, hw, 120)
    prof = tt * (1 - np.abs(yy / hw) ** 3) ** (1 / 3)
    ytre = np.column_stack([np.r_[yy, yy[::-1]], np.r_[prof, -prof[::-1]]])
    hw2 = hw - 2
    yy2 = np.linspace(-hw2, hw2, 120)
    prof2 = (tt - 2) * (1 - np.abs(yy2 / hw2) ** 3) ** (1 / 3)
    indre = np.column_stack([np.r_[yy2, yy2[::-1]], np.r_[prof2, -prof2[::-1]]])
    skravur(ax, T(ytre, ox, oy, s), hatch="////", z=2)
    kontur(ax, T(indre, ox, oy, s), lw=TYNN, fc="white", z=2.5)
    kontur(ax, T(ytre, ox, oy, s))
    rng = np.random.default_rng(3)
    for _ in range(520):
        py = rng.uniform(-hw2 + 1, hw2 - 1)
        lim = (tt - 2) * (1 - abs(py / hw2) ** 3) ** (1 / 3) - 0.9
        pz = rng.uniform(-lim, lim - 2.5)
        if lim > 0.5:
            ax.add_patch(Circle(P(py, pz, ox, oy, s), 0.75 * s * 0.5, fc="none", ec="#555", lw=0.25, zorder=3))
    linje(ax, *T(np.column_stack([yy2[10:110], prof2[10:110] - 0.6]), ox, oy, s).T, lw=TYKK, c=SNITT)
    ax.add_patch(Rectangle(P(-12, prof2.max() - 5.4, ox, oy, s), 24 * s, 3.2 * s, fc="#dddddd", ec=BLEKK,
                           lw=TYNN, zorder=4))
    ax.add_patch(Rectangle(P(-5, prof2.max() - 5.4 + 3.2, ox, oy, s), 10 * s, 1.6 * s, fc="white", ec=BLEKK,
                           lw=TYNN, zorder=4))
    ballong(ax, 1, P(-hw + 0.8, 0, ox, oy, s), (ox - 86, oy + 10))
    ballong(ax, 2, P(-hw2 + 0.4, -2, ox, oy, s), (ox - 86, oy - 14))
    ballong(ax, 3, P(-14, -2, ox, oy, s), (ox - 46, oy - 34))
    ballong(ax, 4, P(-20, prof2[30] - 0.6, ox, oy, s), (ox - 46, oy + 34))
    ballong(ax, 5, P(8, prof2.max() - 4, ox, oy, s), (ox + 30, oy + 36))
    ballong(ax, 6, P(0, prof2.max() - 1.4, ox, oy, s), (ox + 4, oy + 38))
    mal(ax, P(-hw, 0, ox, oy, s), P(hw, 0, ox, oy, s), -26, "67", retning="h")
    visningstittel(ax, ox, oy - 34, "SNITT B-B", "2:1")

    rader = [(1, "Ytterhud", "Medisinsk LSR Shore 5A, 2,0 mm", 1),
             (2, "Jamming-blære", "LSR 0,6 mm, lufttett", 1),
             (3, "Granulat", "PP-mikroperler Ø1,5 mm, 18 g", 1),
             (4, "Kapasitive kontaktsoner", "Kobber på flex-PCB, 4 soner", 1),
             (5, "Flex-ryggrad", "PI flex-PCB, 0,2 mm", 1),
             (6, "Haptisk node", "LRA Ø10, 150-230 Hz", 4),
             (7, "Vakuumpumpe", "Membran 3 V, -70 kPa", 1),
             (8, "Magnetventil + tilbakeslag", "3 V, normalt lukket", 1),
             (9, "Partikkelfilter", "Rustfritt nett 100 µm", 1),
             (10, "Trykksensor", "MEMS absolutt, ±0,1 kPa", 1),
             (11, "Batteri 1500 mAh", "Li-ion polymer + PCM", 1),
             (12, "Håndtak/chassis", "PC, overstøpt", 1)]
    stykkliste(ax, 230, 176, rader)
    notater(ax, 26, 80, [
        "Formlås: brukeren former myk tilstand mot kroppen → «Lås» → pumpe til -55…-70 kPa → stiv form på < 4 s.",
        "Formminne: undertrykk + kontaktsoner lagres lokalt (3 profiler). Ingen app, ingen sky.",
        "Frigjøring: ventil åpner → myk på < 1 s. Overtrykkssikring: maks -75 kPa, mekanisk avlastning.",
        "Kun noder i kontakt (kapasitiv deteksjon) aktiveres → lavere støy og strøm, presis stimulering.",
        "IP67. Vekt mål 210 g. Støy pumpe ≤ 38 dB(A) i 2 s ved låsing; drift ≤ 32 dB(A) @ 30 cm.",
        "Kun utvendig bruk. Granulat er innkapslet i dobbel barriere (blære + ytterhud).",
    ])
    lagre(fig, os.path.join(UT, "AV-001_Avtrykk"), pdf)


# --------------------------------------------------------------------------- SAMKLANG
def samklang_plan():
    p = superellipse(0, 0, 39, 23, 2.3, 300)
    taper = 1 - 0.42 * (p[:, 0] + 39) / 78
    p[:, 1] *= taper
    return p


def ark_samklang(pdf):
    fig, ax = ark("SAMKLANG – bærbar parpute", "VÅR-SK-001", "1,5:1 (detalj 10:1)",
                  "LSR m/ mikrotekstur · TPU · PC")
    s = 1.5
    cx, cy = 105, 228
    pl = samklang_plan()
    kontur(ax, T(pl, cx, cy, s))
    inn = pl * 0.82
    kontur(ax, T(inn, cx, cy, s), lw=TYNN, ls=SKJULT)
    # stipling av mikro-sugesone
    for xx in np.arange(-34, 34, 3.2):
        for yy in np.arange(-20, 20, 3.2):
            taper = 1 - 0.42 * (xx + 39) / 78
            if (abs(xx) / 32) ** 2.3 + (abs(yy) / (19 * taper)) ** 2.3 < 0.82:
                ax.add_patch(Circle(P(xx, yy, cx, cy, s), 0.35, fc="#555", ec="none", zorder=2))
    for (lx, ly) in [(-16, 0), (14, 0)]:
        ax.add_patch(Circle(P(lx, ly, cx, cy, s), 5 * s, fc="none", ec=BLEKK, lw=TYNN, ls=SKJULT))
    senterlinje(ax, cx - 45 * s, cy, cx + 45 * s, cy)
    mal(ax, P(-39, 0, cx, cy, s), P(39, 0, cx, cy, s), 30, "78", retning="h")
    mal(ax, P(-26, -21.3, cx, cy, s), P(-26, 21.3, cx, cy, s), -18, "46", retning="v")
    mal(ax, P(36, -6.5, cx, cy, s), P(36, 6.5, cx, cy, s), 18, "18", retning="v")
    ledetekst(ax, P(0, 12, cx, cy, s), (cx + 20, cy + 46), "Mikro-sugesone (se detalj C)")
    ledetekst(ax, P(14, 0, cx, cy, s), (cx + 66, cy - 30), "2x LRA Ø10 (skjult)")
    snittpil(ax, cx - 66, cy, cx + 66, cy, "D")
    visningstittel(ax, cx, cy - 44, "KONTAKTSIDE", "1,5:1")

    # Sidevisning: bue R60, tykkelse 9 → 4
    sx, sy = 105, 150
    R = 60.0
    L = 78.0
    u = np.linspace(-L / 2, L / 2, 120)
    a = u / R
    cxl = R * np.sin(a)
    cyl = -R * (1 - np.cos(a))
    th = 9 - 5 * (u + L / 2) / L
    nx, ny = -np.sin(a), np.cos(a)
    topp = np.column_stack([cxl + nx * th / 2, cyl + ny * th / 2])
    bunn = np.column_stack([cxl - nx * th / 2, cyl - ny * th / 2])
    kontur(ax, T(np.vstack([topp, bunn[::-1]]), sx, sy + 8, s))
    ax.add_patch(Arc(P(0, R, sx, sy + 8, s), 2 * R * s, 2 * R * s, theta1=-90 - 42, theta2=-90 + 42,
                     lw=TYNN, ls=PHANTOM, color="#555"))
    radius(ax, P(0, R, sx, sy + 8, s), R * s, -64, "R60 (kroppskontakt)", lengde=-30)
    mal(ax, P(-39, 0, sx, sy + 8 - 4.5 * s, 1), P(-39, 9, sx, sy + 8 - 4.5 * s, 1), 0, "", retning="v") if False else None
    ledetekst(ax, P(-36, -8, sx, sy + 8, s), (sx - 66, sy - 18), "9,0 (rot)")
    ledetekst(ax, P(36, -12, sx, sy + 8, s), (sx + 52, sy - 22), "4,0 (spiss)")
    visningstittel(ax, sx, sy - 30, "SIDEVISNING", "1,5:1")

    # Detalj C, 10:1 — mikro-sugekopper
    ox, oy = 300, 238
    k = 10
    linje(ax, [ox - 62, ox + 62], [oy - 14, oy - 14], lw=TYNN)
    pts = [(-62, 0)]
    for i in range(-2, 3):
        c = i * 1.2 * k * 2
        pts += [(c - 4, 0)]
        t = np.linspace(np.pi, 2 * np.pi, 30)
        for tt in t:
            pts.append((c + 4 * np.cos(tt), 4 * np.sin(tt) * 1.0))
        pts += [(c + 4, 0)]
    pts += [(62, 0), (62, -14), (-62, -14)]
    skravur(ax, T(np.array(pts), ox, oy), hatch="////", z=2)
    kontur(ax, T(np.array(pts), ox, oy))
    for i in range(-2, 3):
        c = i * 1.2 * k * 2
        ax.add_patch(Circle((ox + c, oy - 4), 1.5, fc="white", ec=BLEKK, lw=TYNN, zorder=4, hatch="////"))
    mal(ax, (ox - 4, oy), (ox + 4, oy), 8, "Ø0,8", retning="h")
    mal(ax, (ox, oy), (ox + 24, oy), 18, "2,4 (pitch)", retning="h")
    mal(ax, (ox + 52, oy), (ox + 52, oy - 4), 8, "0,4", retning="v")
    ledetekst(ax, (ox - 24, oy - 4), (ox - 60, oy + 18), "Innvendig kuppel Ø0,3 (blekksprut-prinsipp)")
    visningstittel(ax, ox, oy - 20, "DETALJ C – MIKRO-SUGEKOPPER", "10:1 (stilisert, 5 av ca. 380)")

    # Fjernkontroll
    rx, ry = 300, 176
    kontur(ax, superellipse(rx, ry, 24, 19, 2.2))
    ax.add_patch(Circle((rx, ry + 5), 6, fc="none", ec=BLEKK, lw=TYKK))
    kontur(ax, [[rx - 14, ry - 6], [rx - 8, ry - 6], [rx - 11, ry - 1]], lw=TYNN)
    linje(ax, [rx + 8, rx + 14], [ry - 4, ry - 4], lw=TYKK)
    mal(ax, (rx - 24, ry), (rx + 24, ry), -24, "48", retning="h")
    mal(ax, (rx, ry - 19), (rx, ry + 19), 30, "38", retning="v")
    ledetekst(ax, (rx + 6, ry + 9), (rx + 32, ry + 24), "Klemsensor: hardere grep = mer")
    visningstittel(ax, rx, ry - 30, "FJERNKONTROLL (VALGFRI)", "1:1 · tykkelse 14")

    rader = [(1, "Putehud", "LSR Shore 15A, mikrotekstur laseretset form", 1),
             (2, "Fleksramme", "TPU 85A, overstøpt", 1),
             (3, "LRA flat Ø10", "150-230 Hz", 2),
             (4, "Trykksensor-array", "Kapasitiv, 4 soner", 1),
             (5, "IMU 6-akse", "Bevegelses-/rytmegjenkjenning", 1),
             (6, "Rigid-flex PCBA", "BLE 5.x SoC", 1),
             (7, "Batteri 180 mAh", "Kurvet LiPo + PCM", 1),
             (8, "Ladepinner", "Magnetisk pogo, forseglet", 2),
             (9, "Fjernkontroll", "PC + LSR, BLE, 100 mAh", 1),
             (10, "Ladedokk", "Felles, magnetisk", 1)]
    stykkliste(ax, 230, 132, rader)
    notater(ax, 26, 92, [
        "Feste uten stropp/innvendig anker: mikro-sugetekstur gir 0,3-0,8 N/cm² skjærfeste på fuktig hud.",
        "Avtagning ved avskrelling fra spiss (lav kraft). Ingen vakuumskader: kopp Ø0,8 mm, Δp < 5 kPa.",
        "Partnerrespons: trykk mot puten (4 soner) + bevegelsesrytme (IMU) styrer intensitet/tempo automatisk.",
        "Tykkelse 4-9 mm → kan brukes mellom kropper i de fleste stillinger. Vekt mål 22 g.",
        "IP67. Lokal BLE-kobling kun mot medfølgende fjernkontroll; ingen app nødvendig.",
        "Brukes med vannbasert glidemiddel; silikonbasert ødelegger mikroteksturen.",
    ])
    lagre(fig, os.path.join(UT, "SK-001_Samklang"), pdf)


# --------------------------------------------------------------------------- LENE
def ark_lene(pdf):
    fig, ax = ark("LENE – grepsfri støttepute m/ modul", "VÅR-LE-001", "1:3 (detalj 1,5:1, fjernk. 1:2)",
                  "HR-skum · PES/Tencel · LSR · PC")
    s = 1 / 3
    # Sidevisning (front)
    ox, oy = 40, 222
    kile = np.array([[0, 0], [380, 0], [380, 40], [0, 180]])
    def avrund(pts, r=12, k=8):
        ut = []
        n = len(pts)
        for i in range(n):
            p0, p1, p2 = pts[i - 1], pts[i], pts[(i + 1) % n]
            v1 = (p0 - p1) / np.linalg.norm(p0 - p1)
            v2 = (p2 - p1) / np.linalg.norm(p2 - p1)
            a = p1 + v1 * r
            b = p1 + v2 * r
            for t in np.linspace(0, 1, k):
                ut.append((1 - t) ** 2 * a + 2 * (1 - t) * t * p1 + t * t * b)
        return np.array(ut)
    kontur(ax, T(avrund(kile, 18), ox, oy, s))
    vinkel = np.degrees(np.arctan2(140, 380))
    # skinne langs overflaten, x 170..310
    def topp_y(xx):
        return 180 - 140 * xx / 380
    sk = []
    for xx in (165, 305):
        sk.append((xx, topp_y(xx) - 3))
    for xx in (305, 165):
        sk.append((xx, topp_y(xx) - 15))
    kontur(ax, T(np.array(sk), ox, oy, s), lw=TYNN, ls=SKJULT)
    pk = avrundet_rekt(0, 14, 62, 28, 10)
    pk = T(pk, 0, 0, 1, rot=-vinkel)
    kontur(ax, T(pk + np.array([235, topp_y(235) - 2]), ox, oy, s), fc="white", z=4)
    mal(ax, P(0, 0, ox, oy, s), P(380, 0, ox, oy, s), -10, "380", retning="h")
    mal(ax, P(0, 0, ox, oy, s), P(0, 180, ox, oy, s), -8, "180", retning="v")
    mal(ax, P(380, 0, ox, oy, s), P(380, 40, ox, oy, s), 8, "40", retning="v")
    ax.text(*P(110, 120, ox, oy, s), f"{vinkel:.0f}°", fontsize=6.5, family=FONT)
    ledetekst(ax, P(235, topp_y(235) + 22, ox, oy, s), (ox + 70, oy + 58), "Modul «Puck», magnetisk posisjonert")
    ledetekst(ax, P(300, topp_y(300) - 9, ox, oy, s), (ox + 128, oy + 34), "Skinne 140 mm (skjult under trekk)")
    visningstittel(ax, ox + 63, oy - 14, "SIDEVISNING", "1:3")

    # Planvisning
    px, py = 40, 86
    kontur(ax, T(avrundet_rekt(190, 150, 380, 300, 30), px, py, s))
    kontur(ax, T(avrundet_rekt(235, 150, 140, 24, 12), px, py, s), lw=TYNN, ls=SKJULT)
    ax.add_patch(Circle(P(235, 150, px, py, s), 31 * s, fc="white", ec=BLEKK, lw=TYKK, zorder=4))
    kontur(ax, T(avrundet_rekt(16, 150, 18, 90, 6), px, py, s), lw=TYNN)
    for yy in (40, 260):
        kontur(ax, T(avrundet_rekt(190, yy - (8 if yy < 150 else -8), 120, 10, 5), px, py, s), lw=TYNN)
    senterlinje(ax, px - 4, py + 50, px + 130, py + 50)
    mal(ax, P(0, 0, px, py, s), P(0, 300, px, py, s), -8, "300", retning="v")
    mal(ax, P(165, 150, px, py, s), P(305, 150, px, py, s), -30, "140 (justering)", retning="h")
    ledetekst(ax, P(16, 190, px, py, s), (px + 134, py + 80), "Trekkløkke (plassering uten grep)")
    ledetekst(ax, P(250, 262, px, py, s), (px + 134, py + 94), "Sidelomme: fjernkontroll")
    visningstittel(ax, px + 63, py - 6, "PLANVISNING", "1:3")

    # Detalj D – puck snitt 1,5:1
    k = 1.5
    dx, dy = 252, 230
    hud = np.array([[x, 10 + 14 * (1 - (abs(x) / 31) ** 2.6) ** (1 / 2.6)] for x in np.linspace(-31, 31, 80)])
    ytre = np.vstack([[[31, 0]], hud[::-1], [[-31, 0]]])
    skravur(ax, T(ytre, dx, dy, k), hatch="////", z=2)
    inner = np.array([[x, 10 + 11.5 * (1 - (abs(x) / 28.5) ** 2.6) ** (1 / 2.6)] for x in np.linspace(-28.5, 28.5, 80)])
    kontur(ax, T(np.vstack([[[28.5, 2]], inner[::-1], [[-28.5, 2]]]), dx, dy, k), lw=TYNN, fc="white", z=2.5)
    kontur(ax, T(ytre, dx, dy, k))
    ax.add_patch(Rectangle(P(-22, 17, dx, dy, k), 44 * k, 3 * k, fc="#eef3fb", ec=BLEKK, lw=TYNN, zorder=4))
    ax.add_patch(Circle(P(0, 12, dx, dy, k), 12 * k * 0.5, fc="white", ec=BLEKK, lw=TYKK, zorder=4))
    ax.add_patch(Rectangle(P(-26, 5, dx, dy, k), 18 * k, 7 * k, fc="white", ec=BLEKK, lw=TYKK, zorder=4, hatch="xx"))
    ax.add_patch(Rectangle(P(10, 7.5, dx, dy, k), 16 * k, 1.6 * k, fc="#1baf7a", ec=BLEKK, lw=TYNN, zorder=4))
    for xm in (-24, 18):
        ax.add_patch(Rectangle(P(xm, 2, dx, dy, k), 6 * k, 2.5 * k, fc=BLEKK, ec=BLEKK, zorder=4))
    skravur(ax, T(np.array([[-40, -2], [40, -2], [40, 0], [-40, 0]]), dx, dy, k), hatch="....", z=3)
    ax.add_patch(Rectangle(P(-34, -9, dx, dy, k), 68 * k, 6 * k, fc="white", ec=BLEKK, lw=TYKK, zorder=3))
    for xm in (-24, 18):
        ax.add_patch(Rectangle(P(xm, -5.5, dx, dy, k), 6 * k, 2.5 * k, fc=BLEKK, ec=BLEKK, zorder=4))
    ballong(ax, 4, P(-20, 22, dx, dy, k), (dx - 64, dy + 34))
    ballong(ax, 5, P(-5, 18.5, dx, dy, k), (dx - 30, dy + 46))
    ballong(ax, 6, P(0, 12, dx, dy, k), (dx + 12, dy + 46))
    ballong(ax, 7, P(-17, 8, dx, dy, k), (dx - 64, dy + 12))
    ballong(ax, 8, P(18, 8.3, dx, dy, k), (dx + 60, dy + 30))
    ballong(ax, 9, P(21, 3, dx, dy, k), (dx + 64, dy + 8))
    ballong(ax, 2, P(-36, -1, dx, dy, k), (dx - 64, dy - 4))
    ballong(ax, 3, P(0, -6, dx, dy, k), (dx + 2, dy - 22))
    mal(ax, P(-31, 0, dx, dy, k), P(31, 0, dx, dy, k), -20, "Ø62", retning="h")
    mal(ax, P(31, 0, dx, dy, k), P(31, 24, dx, dy, k), 14, "28 inkl. luftpute", retning="v") if False else None
    visningstittel(ax, dx, dy - 30, "DETALJ D – PUCK GJENNOM TREKK", "1,5:1")

    # Fjernkontroll «Stein» 1:2
    rx, ry = 372, 240
    ax.add_patch(Circle((rx, ry), 22.5, fc="none", ec=BLEKK, lw=TYKK))
    ax.add_patch(Circle((rx, ry + 9), 5.5, fc="none", ec=BLEKK, lw=TYKK))
    kontur(ax, [[rx - 13, ry - 11], [rx - 4, ry - 11], [rx - 8.5, ry - 3]], lw=TYKK)
    linje(ax, [rx + 4, rx + 13], [ry - 7, ry - 7], lw=TYKK * 1.6)
    mal(ax, (rx - 22.5, ry), (rx + 22.5, ry), -28, "Ø90", retning="h")
    ax.text(rx, ry + 27, "○ start/pause  △ mer  — mindre", fontsize=5.5, ha="center", family=FONT)
    visningstittel(ax, rx, ry - 34, "FJERNKONTROLL «STEIN»", "1:2 · høyde 30")

    rader = [(1, "Kilepute", "HR-kaldskum 45 kg/m³, CertiPUR", 1),
             (2, "Trekk", "PES/Tencel, 60 °C vask, glidelås", 1),
             (3, "Skinne + magnetbærer", "ABS + 2x N52 Ø12", 1),
             (4, "Puck-hud", "LSR Shore 10A, 38 g", 1),
             (5, "Luftpute + barometer", "Trykk → intensitet", 1),
             (6, "Rumble-aktuator", "ERM Ø24, 40-90 Hz", 1),
             (7, "Batteri 1200 mAh", "Li-ion + PCM", 1),
             (8, "PCBA", "MCU + BLE", 1),
             (9, "Magnetring", "N52, 2 segmenter", 1),
             (10, "Fjernkontroll «Stein»", "Ø90, 3 taktile knapper, BLE", 1),
             (11, "Ladeplate", "Induktiv / magnetisk", 1)]
    stykkliste(ax, 230, 184, rader)
    notater(ax, 26, 66, [
        "Betjening uten fingerferdighet: lene mer → sterkere (luftpute/barometer), lene mindre → svakere.",
        "Puck flyttes gjennom trekket med hofte/hånd/pute; magnetfeste 12 N holder posisjon.",
        "Fjernkontroll: 3 knapper med ulik form, 6 N aktiveringskraft, kan brukes med knyttneve/albue.",
        "Pute uten elektronikk → trekk vaskes 60 °C, skum er vanntett innkapslet. Puck IP67.",
        "Magnetadvarsel for pacemaker/ICD (avstand ≥ 15 cm). Vekt pute 1,4 kg, puck 120 g.",
    ])
    lagre(fig, os.path.join(UT, "LE-001_Lene"), pdf)


# --------------------------------------------------------------------------- KJERNE
def ark_kjerne(pdf):
    fig, ax = ark("KJERNE – reparerbar drivkjerne", "VÅR-KJ-001", "2:1",
                  "PC-GF30 · Al 6063 · FKM/VMQ O-ring", ark_nr="1/2")
    s = 2.0
    ox, oy = 40, 236
    L, R = 82, 12
    # Utsidevisning
    kropp = avrundet_rekt(14 + (L - 14) / 2, 0, L - 14, 24, 4)
    kontur(ax, T(kropp, ox, oy, s))
    lokk = avrundet_rekt(7, 0, 14, 23, 2.5)
    kontur(ax, T(lokk, ox, oy, s))
    for xx in (3, 5, 7, 9, 11):
        linje(ax, *T(np.array([[xx, -11.5], [xx, 11.5]]), ox, oy, s).T, lw=TYNN, c="#666")
    kontur(ax, T(avrundet_rekt(46, -11.4, 10, 1.2, 0.5), ox, oy, s), lw=TYNN)
    ax.add_patch(Circle(P(40, -11.2, ox, oy, s), 1.0 * s, fc="none", ec=BLEKK, lw=TYNN))
    ax.add_patch(Circle(P(52, -11.2, ox, oy, s), 1.0 * s, fc="none", ec=BLEKK, lw=TYNN))
    senterlinje(ax, ox - 6, oy, ox + (L + 4) * s, oy)
    mal(ax, P(0, 12, ox, oy, s), P(82, 12, ox, oy, s), 10, "82", retning="h")
    mal(ax, P(82, -12, ox, oy, s), P(82, 12, ox, oy, s), 10, "Ø24", retning="v")
    mal(ax, P(0, -12, ox, oy, s), P(14, -12, ox, oy, s), -12, "14", retning="h")
    ledetekst(ax, P(46, -12, ox, oy, s), (ox + 150, oy - 34), "Ladepinner + skall-ID (Hall)")
    ledetekst(ax, P(5, 11, ox, oy, s), (ox + 24, oy + 40), "Bajonettlokk (¼ omdreining, vingegrep)")
    snittpil(ax, ox - 8, oy, ox + (L + 6) * s, oy, "C")
    visningstittel(ax, ox + 82, oy - 38, "UTSIDE", "2:1")

    # Snitt C-C
    sy = 148
    ytre = avrundet_rekt(41, 0, 82, 24, 4)
    skravur(ax, T(ytre, ox, sy, s), hatch="////")
    kontur(ax, T(avrundet_rekt(42, 0, 78, 20, 2.5), ox, sy, s), lw=TYNN, fc="white", z=2.5)
    kontur(ax, T(ytre, ox, sy, s))
    linje(ax, *T(np.array([[14, 10], [80, 10]]), ox, sy, s).T, lw=TYKK, c="#888")
    linje(ax, *T(np.array([[14, -10], [80, -10]]), ox, sy, s).T, lw=TYKK, c="#888")
    ax.add_patch(Rectangle(P(4, -7, ox, sy, s), 50 * s, 14 * s, fc="white", ec=BLEKK, lw=TYKK, zorder=4, hatch="xx"))
    ax.add_patch(Rectangle(P(56, -8, ox, sy, s), 10 * s, 16 * s, fc="#1baf7a", ec=BLEKK, lw=TYNN, zorder=4))
    ax.add_patch(Rectangle(P(67, -9, ox, sy, s), 12 * s, 18 * s, fc="white", ec=BLEKK, lw=TYKK, zorder=4))
    ax.add_patch(Rectangle(P(69, -6, ox, sy, s), 8 * s, 12 * s, fc="#dddddd", ec=BLEKK, lw=TYNN, zorder=5))
    ax.add_patch(Rectangle(P(78.5, -8, ox, sy, s), 1.5 * s, 16 * s, fc=BLEKK, ec=BLEKK, zorder=5))
    for xx in (12.5, 14.5):
        ax.add_patch(Rectangle(P(xx, -11.5, ox, sy, s), 1.0 * s, 23 * s, fc="#e87ba4", ec=BLEKK, lw=TYNN, zorder=5))
    ax.add_patch(Rectangle(P(1.5, -3, ox, sy, s), 2.5 * s, 6 * s, fc="white", ec=BLEKK, lw=TYNN, zorder=5))
    for nr, m, p in [(1, P(30, 10.8, ox, sy, s), (ox + 40, sy + 34)),
                     (2, P(30, 10, ox, sy, s), (ox + 70, sy + 34)),
                     (3, P(6, 9, ox, sy, s), (ox + 4, sy + 34)),
                     (4, P(13, 11, ox, sy, s), (ox + 22, sy + 34)),
                     (5, P(30, 0, ox, sy, s), (ox + 60, sy - 40)),
                     (6, P(2.5, 0, ox, sy, s), (ox - 10, sy - 40)),
                     (7, P(61, 0, ox, sy, s), (ox + 110, sy - 40)),
                     (8, P(73, 0, ox, sy, s), (ox + 140, sy - 40)),
                     (9, P(79, 6, ox, sy, s), (ox + 168, sy + 30)),
                     (10, P(61, -9.6, ox, sy, s), (ox + 168, sy - 24))]:
        ballong(ax, nr, m, p)
    visningstittel(ax, ox + 82, sy - 46, "SNITT C-C", "2:1")

    # Endevisning (lokk)
    ex, ey = 252, 236
    ax.add_patch(Circle((ex, ey), 11.5 * s, fc="none", ec=BLEKK, lw=TYKK))
    ax.add_patch(Circle((ex, ey), 9 * s, fc="none", ec=BLEKK, lw=TYNN))
    kontur(ax, T(avrundet_rekt(0, 0, 18, 4.5, 2), ex, ey, s))
    for a in (0, 180):
        t = np.radians(a)
        ax.add_patch(Rectangle((ex + np.cos(t) * 11.5 * s - (2 if a == 0 else 4), ey - 4), 4, 8, fc="none",
                               ec=BLEKK, lw=TYNN, ls=SKJULT))
    senterlinje(ax, ex - 30, ey, ex + 30, ey)
    senterlinje(ax, ex, ey - 30, ex, ey + 30)
    ledetekst(ax, (ex + 10, ey + 3), (ex + 36, ey + 30), "Vingegrep 18 x 4,5 – åpnes uten verktøy")
    visningstittel(ax, ex, ey - 32, "ENDE (LOKK)", "2:1")

    rader = [(1, "Hylse", "Al 6063 anodisert, 0,8 mm (varme/masse)", 1),
             (2, "Kjernehus", "PC-GF30, ultralydsveiset", 1),
             (3, "Bajonettlokk", "PC-GF30, vingegrep", 1),
             (4, "O-ring (dobbel)", "VMQ 70 Shore A, 19 x 1,0", 2),
             (5, "Celle 14500", "Li-ion 800 mAh, beskyttet, utskiftbar", 1),
             (6, "Fjærkontakt", "Forgylt fosforbronse", 1),
             (7, "PCBA", "MCU, lader, klasse-D, 2x Hall", 1),
             (8, "Voice-coil aktuator", "Bredbånd 20-250 Hz, 1,2 N", 1),
             (9, "Koblingsplate", "Rustfritt, overfører slag til skall", 1),
             (10, "Ladepinner", "Magnetiske pogo, IP67", 2)]
    stykkliste(ax, 230, 186, rader)
    notater(ax, 26, 80, [
        "Kjernen er IP67 alene. Batteri byttes av bruker uten verktøy (EU 2023/1542 art. 11-klar).",
        "Skall-ID: 2 kodemagneter i skallet leses av 2 Hall-sensorer → kjernen bytter profil automatisk.",
        "Voice-coil gir dyp «dunk»-stimulering (20-60 Hz) i tillegg til klassisk vibrasjon (120-250 Hz).",
        "Kjernevekt mål 62 g inkl. celle. Driftstid 2,5 t middels nivå. Lading 75 min (5 V / 0,5 A).",
        "Celle selges også som reservedel (UN3480/PI965: egen fraktavtale, se risiko).",
        "10 års garanti på kjernehus; skall har 2 års garanti og kan kjøpes separat.",
    ])
    lagre(fig, os.path.join(UT, "KJ-001_Kjerne_drivkjerne"), pdf)

    # Ark 2 – skall
    fig, ax = ark("KJERNE – skallfamilie", "VÅR-KJ-002", "1:1", "Medisinsk LSR Shore 10-30A", ark_nr="2/2")
    # Kuppel
    kx, ky = 40, 212
    xs = np.linspace(0, 105, 160)
    top = 48 * (np.clip(1 - ((xs - 48) / 57) ** 2, 0, 1)) ** 0.55
    top = np.where(xs > 80, top + 6 * np.sin(np.pi * np.clip((xs - 80) / 25, 0, 1)) * 0.6, top)
    side = np.column_stack([np.r_[xs, xs[::-1]], np.r_[top, np.zeros_like(xs)]])
    kontur(ax, T(side, kx, ky))
    kontur(ax, T(avrundet_rekt(8 + 41, 15, 82, 24, 4), kx, ky), lw=TYNN, ls=PHANTOM, ec="#555")
    mal(ax, (kx, ky), (kx + 105, ky), -10, "105", retning="h")
    mal(ax, (kx + 105, ky), (kx + 105, ky + 48), 10, "48", retning="v")
    ledetekst(ax, (kx + 98, ky + 18), (kx + 118, ky + 50), "Kontaktnese Shore 10A, R14")
    ledetekst(ax, (kx + 30, ky + 15), (kx + 4, ky + 60), "Kjerne (fantom)")
    visningstittel(ax, kx + 52, ky - 22, "SKALL «KUPPEL» – utvendig, håndholdt", "1:1 · bredde 52 · ID 01")
    # Bue
    bx, by = 205, 212
    t = np.linspace(0, 1, 160)
    cxl = 190 * t
    cyl = 32 * np.clip((t - 0.45) / 0.55, 0, 1) ** 2.2
    d = np.where(t < 0.43, 30, np.where(t < 0.55, 30 - 8 * (t - 0.43) / 0.12, 22 + 10 * np.clip((t - 0.78) / 0.22, 0, 1) ** 0.6))
    d = d * np.where(t > 0.97, np.sqrt(np.clip(1 - ((t - 0.97) / 0.03) ** 2, 0, 1)), 1)
    d = d * np.where(t < 0.02, np.sqrt(np.clip(1 - ((0.02 - t) / 0.02) ** 2, 0.3, 1)), 1)
    dx_ = np.gradient(cxl)
    dy_ = np.gradient(cyl)
    nrm = np.hypot(dx_, dy_)
    nx, ny = -dy_ / nrm, dx_ / nrm
    up = np.column_stack([cxl + nx * d / 2, cyl + ny * d / 2])
    dn = np.column_stack([cxl - nx * d / 2, cyl - ny * d / 2])
    kontur(ax, T(np.vstack([up, dn[::-1]]), bx - 10, by))
    kontur(ax, T(avrundet_rekt(4 + 41, 0, 82, 24, 4), bx - 10, by), lw=TYNN, ls=PHANTOM, ec="#555")
    mal(ax, (bx - 10, by - 16), (bx + 180, by - 16), -12, "190", retning="h")
    mal(ax, (bx + 180 - 120, by - 16), (bx + 180, by - 16), -24, "120 innførbar lengde", retning="h")
    ledetekst(ax, (bx + 168, by + 32), (bx + 150, by + 60), "Ø32 maks, G-bue R55", ha="right")
    ledetekst(ax, (bx + 80, by + 13), (bx + 40, by + 44), "Overgang håndtak Ø30 → innføringsdel", ha="right")
    visningstittel(ax, bx + 85, by - 42, "SKALL «BUE» – innvendig", "1:1 · ID 10")
    # Stav
    stx, sty = 40, 120
    xs = np.linspace(0, 175, 200)
    r = np.where(xs < 115, 16, np.where(xs < 128, 16 - 5 * (xs - 115) / 13, 0))
    hode = np.where(xs >= 128, 26 * np.sqrt(np.clip(1 - ((xs - 151) / 24) ** 2, 0, 1)), 0)
    r = np.maximum(r, hode)
    r = r * np.where(xs < 4, np.sqrt(np.clip(1 - ((4 - xs) / 4) ** 2, 0.4, 1)), 1)
    kontur(ax, T(np.column_stack([np.r_[xs, xs[::-1]], np.r_[r, -r[::-1]]]), stx, sty))
    kontur(ax, T(avrundet_rekt(10 + 41, 0, 82, 24, 4), stx, sty), lw=TYNN, ls=PHANTOM, ec="#555")
    senterlinje(ax, stx - 5, sty, stx + 182, sty)
    mal(ax, (stx, sty + 16), (stx + 175, sty + 16), 22, "175", retning="h")
    mal(ax, (stx + 151, sty - 26), (stx + 151, sty + 26), 18, "Ø52", retning="v")
    mal(ax, (stx + 60, sty - 16), (stx + 60, sty + 16), -26, "Ø32", retning="v")
    ledetekst(ax, (stx + 122, sty + 12), (stx + 112, sty + 40), "Fleksibel hals, LSR 30A")
    visningstittel(ax, stx + 88, sty - 34, "SKALL «STAV» – massasje/utvendig", "1:1 · ID 11")

    stykkliste(ax, 230, 140, [
        ("ID", "Skall", "Kodemagneter (Hall A / B)", "Profil"),
        ("00", "Ingen skall", "– / –", "Lås"),
        ("01", "Kuppel", "– / N", "Dunk+puls"),
        ("10", "Bue", "N / –", "Bølge"),
        ("11", "Stav", "N / N", "Dyp rumble"),
    ], bredder=(9, 30, 70, 34), tittel="SKALL-ID OG AUTOPROFIL")
    notater(ax, 26, 76, [
        "Alle skall: medisinsk LSR, ett materiale per skall (enkel resirkulering), ingen sømmer mot kropp.",
        "Kjerne monteres med fingre: skyv inn → klikk (2 silikonlepper tetter mot hylsen).",
        "Bue: kun vaginal bruk (merkes). Håndtak Ø30 med kjerne gir sikkert grep og kontroll.",
        "Nye skall kan lanseres uten ny elektronikk/sertifisering av radio/batteri (kun materiale + mekanikk).",
    ])
    lagre(fig, os.path.join(UT, "KJ-002_Kjerne_skall"), pdf)


if __name__ == "__main__":
    os.makedirs(UT, exist_ok=True)
    with PdfPages(os.path.join(UT, "VAR_Tegningssett_A3.pdf")) as pdf:
        ark_glod(pdf)
        ark_avtrykk(pdf)
        ark_samklang(pdf)
        ark_lene(pdf)
        ark_kjerne(pdf)
    print("ok")
