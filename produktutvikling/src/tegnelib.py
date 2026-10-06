"""Små hjelpefunksjoner for tekniske tegninger i ISO-stil (A3, mm-koordinater)."""
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Circle, Rectangle, FancyBboxPatch
from matplotlib.lines import Line2D

MM = 72 / 25.4          # punkt per mm
TYKK = 0.5 * MM         # synlig kontur
TYNN = 0.25 * MM        # mål, hjelpelinjer, skravur
FONT = "DejaVu Sans"
BLEKK = "#111111"
SNITT = "#2a78d6"       # markering av snittplan
PHANTOM = (0, (10, 2, 1.5, 2, 1.5, 2))
SENTER = (0, (12, 2.5, 2, 2.5))
SKJULT = (0, (3, 1.5))


def ark(tittel, tegnnr, malestokk, materiale, rev="A", ark_nr="1/1", dato="2026-10-06"):
    fig = plt.figure(figsize=(420 / 25.4, 297 / 25.4))
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 420)
    ax.set_ylim(0, 297)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.add_patch(Rectangle((0, 0), 420, 297, fc="white", ec="none"))
    ax.add_patch(Rectangle((20, 10), 390, 277, fc="none", ec=BLEKK, lw=0.7 * MM))
    # rutereferanser
    for i in range(8):
        x = 20 + i * 390 / 8
        ax.plot([x, x], [287, 292], color=BLEKK, lw=TYNN)
        ax.text(x + 390 / 16, 289.5, str(i + 1), ha="center", va="center", fontsize=6, family=FONT)
    for j, b in enumerate("ABCDEF"):
        y = 287 - j * 277 / 6
        ax.plot([15, 20], [y, y], color=BLEKK, lw=TYNN)
        ax.text(17.5, y - 277 / 12, b, ha="center", va="center", fontsize=6, family=FONT)
    # tittelfelt nede til høyre (180 x 40)
    x0, y0, w, h = 230, 10, 180, 44
    ax.add_patch(Rectangle((x0, y0), w, h, fc="white", ec=BLEKK, lw=0.6 * MM))
    rader = [y0 + 32, y0 + 22, y0 + 12]
    for y in rader:
        ax.plot([x0, x0 + w], [y, y], color=BLEKK, lw=TYNN)
    for x in (x0 + 60, x0 + 120):
        ax.plot([x, x], [y0, y0 + 22], color=BLEKK, lw=TYNN)
    ax.plot([x0 + 140, x0 + 140], [y0 + 22, y0 + 44], color=BLEKK, lw=TYNN)

    def felt(x, y, lbl, val, fs=8, bold=False):
        ax.text(x + 1.5, y + 7.3, lbl, fontsize=4.8, color="#555", family=FONT, va="center")
        ax.text(x + 1.5, y + 3.2, val, fontsize=fs, family=FONT, va="center", weight="bold" if bold else "normal")

    felt(x0, y0 + 32, "TITTEL", tittel, fs=10, bold=True)
    felt(x0 + 140, y0 + 32, "TEGN. NR.", tegnnr, fs=7.5, bold=True)
    felt(x0, y0 + 22, "PROSJEKT", "VÅR produktportefølje – konseptfase", fs=7)
    felt(x0 + 140, y0 + 22, "REV.", rev, fs=8)
    felt(x0, y0 + 12, "MATERIALE", materiale, fs=6.3)
    felt(x0 + 60, y0 + 12, "MÅLESTOKK", malestokk, fs=8)
    felt(x0 + 120, y0 + 12, "ARK", ark_nr, fs=8)
    felt(x0, y0, "TOLERANSER", "ISO 2768-m · silikon ±0,3", fs=6.3)
    felt(x0 + 60, y0, "DATO / TEGNET", f"{dato} / VÅR-team", fs=6.3)
    felt(x0 + 120, y0, "ENHET", "mm", fs=8)
    projeksjonssymbol(ax, x0 + 176 - 12, y0 + 3.5)
    ax.text(x0 + w, y0 - 3, "Konsepttegning – ikke for produksjon. Endelig CAD (STEP/IGES) utarbeides i fase 2.",
            ha="right", fontsize=5.5, color="#555", family=FONT)
    return fig, ax


def projeksjonssymbol(ax, x, y):
    """ISO E (første vinkel) symbol."""
    ax.add_patch(Polygon([[x, y + 1], [x + 6, y + 0], [x + 6, y + 6], [x, y + 5]], closed=True,
                         fc="none", ec=BLEKK, lw=TYNN))
    ax.add_patch(Circle((x + 11, y + 3), 3, fc="none", ec=BLEKK, lw=TYNN))
    ax.add_patch(Circle((x + 11, y + 3), 1.5, fc="none", ec=BLEKK, lw=TYNN))


def linje(ax, xs, ys, lw=TYKK, ls="-", c=BLEKK, z=3):
    ax.add_line(Line2D(xs, ys, lw=lw, ls=ls, color=c, zorder=z, solid_capstyle="round"))


def kontur(ax, pts, lw=TYKK, ls="-", fc="none", hatch=None, z=3, ec=BLEKK, alpha=1.0):
    p = Polygon(pts, closed=True, fc=fc, ec=ec, lw=lw, ls=ls, hatch=hatch, zorder=z, alpha=alpha)
    ax.add_patch(p)
    return p


def superellipse(cx, cy, a, b, n=2.5, k=240):
    t = np.linspace(0, 2 * np.pi, k)
    c, s = np.cos(t), np.sin(t)
    x = cx + a * np.sign(c) * np.abs(c) ** (2 / n)
    y = cy + b * np.sign(s) * np.abs(s) ** (2 / n)
    return np.column_stack([x, y])


def avrundet_rekt(cx, cy, w, h, r, k=12):
    pts = []
    for (ox, oy, a0) in [(w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90),
                         (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)]:
        for t in np.linspace(np.radians(a0), np.radians(a0 + 90), k):
            pts.append([cx + ox + r * np.cos(t), cy + oy + r * np.sin(t)])
    return np.array(pts)


def senterlinje(ax, x1, y1, x2, y2):
    linje(ax, [x1, x2], [y1, y2], lw=TYNN, ls=SENTER, c="#333")


def _pil(ax, x, y, dx, dy):
    ax.annotate("", xy=(x, y), xytext=(x - dx * 3, y - dy * 3),
                arrowprops=dict(arrowstyle="-|>,head_length=0.55,head_width=0.18", lw=TYNN, color=BLEKK,
                                shrinkA=0, shrinkB=0), zorder=5)


def mal(ax, p1, p2, avstand, tekst, fs=6.5, retning=None):
    """Lineært mål mellom p1 og p2, forskjøvet 'avstand' vinkelrett."""
    p1, p2 = np.array(p1, float), np.array(p2, float)
    d = p2 - p1
    if retning == "h":
        d = np.array([d[0], 0.0])
        p2 = np.array([p2[0], p1[1]]) if False else p2
    L = np.linalg.norm(d)
    u = d / L
    n = np.array([-u[1], u[0]])
    if retning == "h":
        a = np.array([p1[0], 0]) + n * 0
        y = max(p1[1], p2[1]) + avstand if avstand > 0 else min(p1[1], p2[1]) + avstand
        q1, q2 = np.array([p1[0], y]), np.array([p2[0], y])
        linje(ax, [p1[0], p1[0]], [p1[1], y + np.sign(avstand) * 1.5], lw=TYNN)
        linje(ax, [p2[0], p2[0]], [p2[1], y + np.sign(avstand) * 1.5], lw=TYNN)
    elif retning == "v":
        x = max(p1[0], p2[0]) + avstand if avstand > 0 else min(p1[0], p2[0]) + avstand
        q1, q2 = np.array([x, p1[1]]), np.array([x, p2[1]])
        linje(ax, [p1[0], x + np.sign(avstand) * 1.5], [p1[1], p1[1]], lw=TYNN)
        linje(ax, [p2[0], x + np.sign(avstand) * 1.5], [p2[1], p2[1]], lw=TYNN)
    else:
        q1, q2 = p1 + n * avstand, p2 + n * avstand
        e = n * np.sign(avstand) * 1.5
        linje(ax, [p1[0], q1[0] + e[0]], [p1[1], q1[1] + e[1]], lw=TYNN)
        linje(ax, [p2[0], q2[0] + e[0]], [p2[1], q2[1] + e[1]], lw=TYNN)
    linje(ax, [q1[0], q2[0]], [q1[1], q2[1]], lw=TYNN)
    dd = q2 - q1
    uu = dd / np.linalg.norm(dd)
    _pil(ax, q2[0], q2[1], uu[0], uu[1])
    _pil(ax, q1[0], q1[1], -uu[0], -uu[1])
    m = (q1 + q2) / 2
    ang = np.degrees(np.arctan2(uu[1], uu[0]))
    if ang > 90 or ang < -90:
        ang += 180
    nn = np.array([-np.sin(np.radians(ang)), np.cos(np.radians(ang))])
    t = m + nn * 1.8
    ax.text(t[0], t[1], tekst, ha="center", va="bottom", rotation=ang, fontsize=fs, family=FONT,
            rotation_mode="anchor", zorder=6, bbox=dict(fc="white", ec="none", pad=0.3))


def radius(ax, senter, r, vinkel, tekst, lengde=14, fs=6.5):
    a = np.radians(vinkel)
    p = np.array(senter) + r * np.array([np.cos(a), np.sin(a)])
    q = p + lengde * np.array([np.cos(a), np.sin(a)])
    linje(ax, [q[0], p[0]], [q[1], p[1]], lw=TYNN)
    _pil(ax, p[0], p[1], -np.cos(a), -np.sin(a))
    ax.text(q[0] + (1 if np.cos(a) >= 0 else -1), q[1], tekst, fontsize=fs, family=FONT,
            ha="left" if np.cos(a) >= 0 else "right", va="center")


def ledetekst(ax, mal_pt, tekst_pt, tekst, fs=6.3, ha="left"):
    linje(ax, [mal_pt[0], tekst_pt[0]], [mal_pt[1], tekst_pt[1]], lw=TYNN)
    ax.add_patch(Circle(mal_pt, 0.6, fc=BLEKK, ec="none", zorder=6))
    ax.text(tekst_pt[0] + (1 if ha == "left" else -1), tekst_pt[1], tekst, fontsize=fs, family=FONT,
            ha=ha, va="center", zorder=6)


def ballong(ax, nr, mal_pt, pos):
    linje(ax, [mal_pt[0], pos[0]], [mal_pt[1], pos[1]], lw=TYNN)
    ax.add_patch(Circle(mal_pt, 0.55, fc=BLEKK, ec="none", zorder=7))
    ax.add_patch(Circle(pos, 3.1, fc="white", ec=BLEKK, lw=TYNN, zorder=7))
    ax.text(pos[0], pos[1], str(nr), ha="center", va="center", fontsize=6, family=FONT, zorder=8, weight="bold")


def visningstittel(ax, x, y, tekst, mstokk=None):
    ax.text(x, y, tekst, ha="center", va="top", fontsize=8, family=FONT, weight="bold")
    if mstokk:
        ax.text(x, y - 4.2, mstokk, ha="center", va="top", fontsize=6, family=FONT, color="#444")


def snittpil(ax, x1, y1, x2, y2, bokstav):
    """Snittlinje med piler og bokstav i hver ende (synsretning vinkelrett)."""
    linje(ax, [x1, x2], [y1, y2], lw=TYNN, ls=SENTER, c=SNITT, z=4)
    d = np.array([x2 - x1, y2 - y1], float)
    d /= np.linalg.norm(d)
    n = np.array([d[1], -d[0]])
    for (x, y, s) in [(x1, y1, -1), (x2, y2, 1)]:
        p = np.array([x, y]) + d * s * 0
        linje(ax, [p[0] - d[0] * 0 , p[0] + d[0] * s * 5], [p[1], p[1] + d[1] * s * 5], lw=0.7 * MM, c=SNITT, z=4)
        tip = p + d * s * 5
        ax.annotate("", xy=tip + n * 7, xytext=tip,
                    arrowprops=dict(arrowstyle="-|>,head_length=0.6,head_width=0.25", lw=TYNN * 1.4, color=SNITT))
        ax.text(*(tip + n * 7 + d * s * 3), bokstav, fontsize=9, weight="bold", family=FONT, color=SNITT,
                ha="center", va="center")


def stykkliste(ax, x, y, rader, bredder=(9, 66, 58, 10), radh=4.6, tittel="STYKKLISTE"):
    """Tegner stykkliste med topp i (x, y). rader = [(pos, benevnelse, materiale, ant), ...]."""
    w = sum(bredder)
    hode = ["POS", "BENEVNELSE", "MATERIALE / SPESIFIKASJON", "ANT"]
    alle = [hode] + [list(map(str, r)) for r in rader]
    ax.text(x, y + 2, tittel, fontsize=7, weight="bold", family=FONT)
    for i, r in enumerate(alle):
        yy = y - (i + 1) * radh
        ax.add_patch(Rectangle((x, yy), w, radh, fc="#eef3fb" if i == 0 else "white", ec=BLEKK, lw=TYNN))
        cx = x
        for j, (bw, txt) in enumerate(zip(bredder, r)):
            if j:
                linje(ax, [cx, cx], [yy, yy + radh], lw=TYNN)
            ax.text(cx + 1.2, yy + radh / 2, txt, fontsize=5.0 if i else 5.2, family=FONT, va="center",
                    weight="bold" if i == 0 else "normal")
            cx += bw
    return y - (len(alle)) * radh


def notater(ax, x, y, linjer, tittel="MERKNADER", fs=5.8, sprang=3.6):
    ax.text(x, y, tittel, fontsize=7, weight="bold", family=FONT)
    for i, l in enumerate(linjer):
        ax.text(x, y - 4.5 - i * sprang, f"{i + 1}. {l}", fontsize=fs, family=FONT)


def skravur(ax, pts, hatch="////", fc="white", lw=TYNN, z=2, ec=BLEKK):
    p = Polygon(pts, closed=True, fc=fc, ec=ec, lw=lw, hatch=hatch, zorder=z)
    ax.add_patch(p)
    return p


def lagre(fig, sti_uten_ending, pdf=None):
    fig.savefig(sti_uten_ending + ".png", dpi=170)
    if pdf is not None:
        pdf.savefig(fig)
    plt.close(fig)
