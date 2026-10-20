#!/usr/bin/env python3
"""Målsatt arbeidstegning (front, side, topp) fra parameterne i stafett.scad. Skriver render/tegning.png og .svg."""
import math
import re
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import Circle, Polygon, Rectangle  # noqa: E402

HER = Path(__file__).resolve().parent
src = (HER / "stafett.scad").read_text()


def p(navn):
    return float(re.search(rf"^{navn}\s*=\s*([\d.]+);", src, re.M).group(1))


B, D, H, LEPPE, VINKEL, VEGG = p("B"), p("D"), p("H"), p("LEPPE"), p("VINKEL"), p("VEGG")
TOPP_D = D - (H - LEPPE) / math.tan(math.radians(VINKEL))
SKRAA = (H - LEPPE) / math.sin(math.radians(VINKEL))
PANEL = (103.0, 78.5)
AKTIV = (84.8, 63.6)
HJUL_D = 32
HJUL_X, HJUL_Y = B - 30, D - TOPP_D / 2

plt.rcParams.update({"font.family": "Inter", "font.size": 8})
BLEKK = "#1e1e1c"
fig, ax = plt.subplots(figsize=(11.69, 8.27))  # A4 liggende
ax.set_aspect("equal")
ax.axis("off")


def maal(x1, y1, x2, y2, tekst, off=8, vertikal=False):
    if vertikal:
        xa = x1 + off
        ax.annotate("", (xa, y1), (xa, y2), arrowprops=dict(arrowstyle="<->", lw=0.6, color=BLEKK))
        ax.plot([x1, xa + 1.5 * (1 if off > 0 else -1)], [y1, y1], lw=0.3, color=BLEKK)
        ax.plot([x2, xa + 1.5 * (1 if off > 0 else -1)], [y2, y2], lw=0.3, color=BLEKK)
        ax.text(xa + (2 if off > 0 else -2), (y1 + y2) / 2, tekst, rotation=90, va="center", ha="left" if off > 0 else "right")
    else:
        ya = y1 + off
        ax.annotate("", (x1, ya), (x2, ya), arrowprops=dict(arrowstyle="<->", lw=0.6, color=BLEKK))
        ax.plot([x1, x1], [y1, ya + 1.5 * (1 if off > 0 else -1)], lw=0.3, color=BLEKK)
        ax.plot([x2, x2], [y2, ya + 1.5 * (1 if off > 0 else -1)], lw=0.3, color=BLEKK)
        ax.text((x1 + x2) / 2, ya + (1.5 if off > 0 else -1.5), tekst, ha="center", va="bottom" if off > 0 else "top")


# ---------- FRONT (sett vinkelrett på bordkanten) ----------
ox, oy = 0, 0
ax.add_patch(Rectangle((ox, oy), B, H, fill=False, lw=1.0, ec=BLEKK))
ax.plot([ox, ox + B], [oy + LEPPE, oy + LEPPE], lw=0.5, color=BLEKK, ls="--")
proj = math.sin(math.radians(VINKEL))  # skjermflaten forkortes i frontvisning
py0 = oy + LEPPE + (SKRAA - PANEL[1]) / 2 * proj
ax.add_patch(Rectangle((ox + B / 2 - AKTIV[0] / 2, py0 + (PANEL[1] - AKTIV[1] - 3) * proj), AKTIV[0], AKTIV[1] * proj, fill=True, fc="#e7e5de", ec=BLEKK, lw=0.6))
ax.add_patch(Rectangle((ox + HJUL_X - HJUL_D / 2, oy + H), HJUL_D, 16, fill=True, fc="#cfccc3", ec=BLEKK, lw=0.6))
maal(ox, oy, ox + B, oy, f"{B:.0f}", off=-10)
maal(ox, oy, ox, oy + H, f"{H:.0f}", off=-10, vertikal=True)
maal(ox + B / 2 - AKTIV[0] / 2, oy + H, ox + B / 2 + AKTIV[0] / 2, oy + H, f"aktivt felt {AKTIV[0]}", off=24)
ax.text(ox, oy + H + 44, "FRONT", fontweight="bold", fontsize=10)

# ---------- SIDE (profil) ----------
sx = B + 60
prof = [(0, 0), (D, 0), (D, H), (D - TOPP_D, H), (0, LEPPE)]
ax.add_patch(Polygon([(sx + y, z) for y, z in prof], closed=True, fill=False, lw=1.0, ec=BLEKK))
# innvendig vegg
ax.add_patch(Polygon([(sx + y, z) for y, z in [(VEGG, VEGG), (D - VEGG, VEGG), (D - VEGG, H - VEGG), (D - TOPP_D + 1, H - VEGG), (VEGG, LEPPE + 1.5)]], closed=True, fill=False, lw=0.4, ec=BLEKK, ls=":"))
ax.add_patch(Rectangle((sx + HJUL_Y - HJUL_D / 2, H), HJUL_D, 16, fill=True, fc="#cfccc3", ec=BLEKK, lw=0.6))
ax.add_patch(Rectangle((sx + (D - 80) / 2 + 4, 3), 60, 4, fc="#7d8085", ec=BLEKK, lw=0.4))
ax.text(sx + D / 2 + 4, 10, "stål 80×60×4", ha="center", fontsize=6.5)
maal(sx, 0, sx + D, 0, f"{D:.0f}", off=-10)
maal(sx + D, 0, sx + D, H, f"{H:.0f}", off=10, vertikal=True)
maal(sx + D - TOPP_D, H, sx + D, H, f"{TOPP_D:.1f}", off=24)
maal(sx, 0, sx, LEPPE, f"{LEPPE:.0f}", off=-6, vertikal=True)
ax.text(sx + 10, LEPPE + 6, f"{VINKEL:.0f}°", fontsize=9)
ax.text(sx + (D - TOPP_D) / 2 - 16, (H + LEPPE) / 2 + 2, f"skjermflate {SKRAA:.1f}", rotation=VINKEL, fontsize=7)
ax.text(sx, H + 44, "SIDE", fontweight="bold", fontsize=10)

# ---------- TOPP ----------
ty = -D - 50
ax.add_patch(Rectangle((0, ty), B, D, fill=False, lw=1.0, ec=BLEKK))
ax.plot([0, B], [ty + D - TOPP_D, ty + D - TOPP_D], lw=0.5, color=BLEKK, ls="--")
ax.add_patch(Circle((HJUL_X, ty + HJUL_Y), HJUL_D / 2, fill=True, fc="#cfccc3", ec=BLEKK, lw=0.6))
ax.text(14, ty + HJUL_Y - 3, "STAFETT  (NFC under)", fontsize=7, fontweight="bold")
ax.annotate("USB-C", (B / 2, ty + D), (B / 2, ty + D + 10), ha="center", arrowprops=dict(arrowstyle="->", lw=0.6))
maal(HJUL_X, ty, B, ty, f"{B - HJUL_X:.0f}", off=-8)
maal(B, ty + D - TOPP_D, B, ty + D, f"{TOPP_D:.1f}", off=8, vertikal=True)
ax.text(HJUL_X, ty + HJUL_Y + HJUL_D / 2 + 3, f"Ø{HJUL_D} hjul (EC11)", ha="center", fontsize=7)
ax.text(0, ty - 22, "TOPP", fontweight="bold", fontsize=10)

# ---------- tittelfelt ----------
tx, tyy = sx - 10, ty - 30
ax.add_patch(Rectangle((tx, tyy), 150, 40, fill=False, lw=1.0, ec=BLEKK))
linjer = [
    ("STAFETT — kabinett v0.1", 10, "bold"),
    ("Mål i mm · ikke målestokk, bruk målene", 7, "normal"),
    ("Materiale: PETG (prototyp) · vegg 2,4 · kantradius 4", 7, "normal"),
    ("Panel: 4,2\" e-blekk 103 × 78,5 × 1,2 · vindu 85,8 × 64,6", 7, "normal"),
    ("Kilde: cad/stafett.scad (parametrisk) · tegnet 20.10.2026", 7, "normal"),
]
for i, (t, s, w) in enumerate(linjer):
    ax.text(tx + 4, tyy + 33 - i * 7.2, t, fontsize=s, fontweight=w)

ax.set_xlim(-25, sx + D + 50)
ax.set_ylim(ty - 40, H + 55)
for ext in ("png", "svg"):
    fig.savefig(HER / "render" / f"tegning.{ext}", dpi=180, bbox_inches="tight", facecolor="white")
print("skrev render/tegning.png|svg")
