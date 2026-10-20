#!/usr/bin/env python3
"""Målsatt arbeidstegning for Mørkerom (front, topp, bak) fra parameterne i morkerom.scad."""
import re
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import Circle, FancyBboxPatch, Rectangle  # noqa: E402

HER = Path(__file__).resolve().parent
src = (HER / "morkerom.scad").read_text()


def tall(navn):
    return float(re.search(rf"(?<![\w])({navn})\s*=\s*([\d.]+);", src).group(2))


def liste(navn):
    return [float(v) for v in re.search(rf"^{navn}\s*=\s*\[([^\]]+)\];", src, re.M).group(1).split(",")]


B, D, H, R = tall("B"), tall("D"), tall("H"), tall("R")
OBJ, OBJ_D, GLASS_D = liste("OBJ"), tall("OBJ_D"), tall("GLASS_D")
SF, SB, UTL, EPD, EPDP, BLA, DEK = liste("SOKER_F"), liste("SOKER_B"), liste("UTL"), liste("EPD"), liste("EPD_POS"), liste("BLA"), liste("DEKSEL")
INK = "#1e1e1c"
plt.rcParams.update({"font.family": "Inter", "font.size": 8})
fig, ax = plt.subplots(figsize=(11.69, 8.27))
ax.set_aspect("equal")
ax.axis("off")


def kropp(x0, y0, w, h):
    ax.add_patch(FancyBboxPatch((x0 + R, y0 + R), w - 2 * R, h - 2 * R, boxstyle=f"round,pad={R}", fill=False, lw=1.0, ec=INK))


def maal(x1, y1, x2, y2, t, off, vert=False):
    if vert:
        xa = x1 + off
        ax.annotate("", (xa, y1), (xa, y2), arrowprops=dict(arrowstyle="<->", lw=0.6, color=INK))
        for y in (y1, y2):
            ax.plot([x1, xa + (1.5 if off > 0 else -1.5)], [y, y], lw=0.3, color=INK)
        ax.text(xa + (2 if off > 0 else -2), (y1 + y2) / 2, t, rotation=90, va="center", ha="left" if off > 0 else "right")
    else:
        ya = y1 + off
        ax.annotate("", (x1, ya), (x2, ya), arrowprops=dict(arrowstyle="<->", lw=0.6, color=INK))
        for x in (x1, x2):
            ax.plot([x, x], [y1, ya + (1.5 if off > 0 else -1.5)], lw=0.3, color=INK)
        ax.text((x1 + x2) / 2, ya + (1.5 if off > 0 else -1.5), t, ha="center", va="bottom" if off > 0 else "top")


# FRONT
kropp(0, 0, B, H)
cx, cz = B / 2 + OBJ[0], OBJ[1]
ax.add_patch(Circle((cx, cz), OBJ_D / 2, fill=False, lw=0.8, ec=INK))
ax.add_patch(Circle((cx, cz), GLASS_D / 2, fill=True, fc="#2b2a28", ec=INK, lw=0.6))
ax.add_patch(Rectangle((cx + DEK[0] / 2 + 1 - DEK[0] / 2 + DEK[0] / 2, cz - DEK[1] / 2), DEK[0], DEK[1], fill=True, fc="#d6d3cb", ec=INK, lw=0.6, ls="--"))
ax.text(cx + DEK[0] + 1, cz, "deksel\n(åpent)", ha="center", va="center", fontsize=6.5)
ax.add_patch(Rectangle((B / 2 + SF[0] - SF[2] / 2, SF[1] - SF[3] / 2), SF[2], SF[3], fill=False, lw=0.8, ec=INK))
ax.add_patch(Rectangle((B / 2 + UTL[0] - 5, H), 10, 3.8, fc="#c8402f", ec=INK, lw=0.6))
maal(0, 0, B, 0, f"{B:.0f}", -8)
maal(0, 0, 0, H, f"{H:.0f}", -8, True)
maal(cx, cz, cx, 0, f"{cz:.0f}", 0, True)
ax.text(cx - OBJ_D / 2, cz - OBJ_D / 2 - 5, f"Ø{OBJ_D:.0f} / glass Ø{GLASS_D:.0f}", fontsize=6.5)
ax.text(B / 2 + SF[0] - SF[2] / 2, SF[1] + SF[3] / 2 + 2, f"søker {SF[2]:.0f}×{SF[3]:.0f}", fontsize=6.5)
ax.text(0, H + 14, "FRONT", fontweight="bold", fontsize=10)

# BAK (speilvendt: sett bakfra)
bx = B + 40
kropp(bx, 0, B, H)
ex = bx + B / 2 - EPDP[0]
ax.add_patch(Rectangle((ex - EPD[0] / 2, EPDP[1] - EPD[1] / 2), EPD[0], EPD[1], fc="#e7e5de", ec=INK, lw=0.8))
ax.text(ex, EPDP[1], "1,54\" e-blekk\n200×200", ha="center", va="center", fontsize=6.5)
ax.add_patch(Circle((bx + B / 2 - BLA[0], BLA[1]), 4.5, fc="#e7e5de", ec=INK, lw=0.6))
ax.text(bx + B / 2 - BLA[0], BLA[1] - 8, "bla", ha="center", fontsize=6.5)
ax.add_patch(Rectangle((bx + B / 2 - SB[0] - SB[2] / 2, SB[1] - SB[3] / 2), SB[2], SB[3], fill=False, ec=INK, lw=0.8))
ax.add_patch(Circle((bx + B / 2 - SB[0] - 9, SB[1]), 1.1, fc="#f5b25a", ec=INK, lw=0.4))
maal(ex - EPD[0] / 2, 0, ex + EPD[0] / 2, 0, f"{EPD[0]}", -8)
maal(bx + B, EPDP[1] - EPD[1] / 2, bx + B, EPDP[1] + EPD[1] / 2, f"{EPD[1]}", 8, True)
ax.text(bx, H + 14, "BAK", fontweight="bold", fontsize=10)

# TOPP
ty = -D - 40
kropp(0, ty, B, D)
ax.add_patch(Circle((B / 2 + UTL[0], ty + D / 2), 5.1, fc="#c8402f", ec=INK, lw=0.6))
ax.text(B / 2 - 6, ty + D / 2 - 1.5, "MØRKEROM", ha="center", fontsize=7, fontweight="bold")
ax.add_patch(Rectangle((B / 2 + OBJ[0] - OBJ_D / 2, ty - 5), OBJ_D, 5, fill=False, ec=INK, lw=0.6))
maal(B, ty, B, ty + D, f"{D:.0f}", 8, True)
ax.text(0, ty - 18, "TOPP", fontweight="bold", fontsize=10)

# tittelfelt
tx, tyy = bx, ty - 10
ax.add_patch(Rectangle((tx, tyy), 120, 44, fill=False, lw=1.0, ec=INK))
for i, (t, s, w) in enumerate([
    ("MØRKEROM — kamerahus v0.1", 10, "bold"),
    ("Mål i mm · ikke målestokk, bruk målene", 7, "normal"),
    (f"PETG (prototyp) · vegg 2,0 · hjørneradius {R:.0f}", 7, "normal"),
    ("Delt i front/bak ved y = 20 · deksel i skinne = av/på", 7, "normal"),
    ("Kilde: cad/morkerom.scad · tegnet 20.10.2026", 7, "normal"),
]):
    ax.text(tx + 4, tyy + 36 - i * 7.6, t, fontsize=s, fontweight=w)

ax.set_xlim(-25, bx + B + 25)
ax.set_ylim(ty - 30, H + 25)
for ext in ("png", "svg"):
    fig.savefig(HER / "render" / f"tegning.{ext}", dpi=180, bbox_inches="tight", facecolor="white")
print("skrev render/tegning.png|svg")
