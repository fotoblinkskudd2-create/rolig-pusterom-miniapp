"""Rolig-ikonet: tre pustesirkler (4–2–6) på salvie-grønt. Kjør: python3 products/05-sekken/ikon.py
Ut: ikoner/ikon-180.png (Apple), ikon-192.png, ikon-512.png, ikon-maskable-512.png (sikker sone 80 %)."""
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Circle

OUT = Path(__file__).resolve().parents[2] / "ikoner"
OUT.mkdir(exist_ok=True)
BG, RINGS = "#a8c5b0", ["#e0ebe3", "#d4e4f0", "#f5f7f4"]   # samme palett som index.html


def icon(px, path, safe=1.0, rounded=False):
    fig = plt.figure(figsize=(1, 1), dpi=px)
    ax = fig.add_axes([0, 0, 1, 1]); ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.axis("off")
    fig.patch.set_alpha(0)
    if rounded:
        from matplotlib.patches import FancyBboxPatch
        ax.add_patch(FancyBboxPatch((0, 0), 1, 1, boxstyle="round,pad=0,rounding_size=0.22", color=BG))
    else:
        ax.add_patch(plt.Rectangle((0, 0), 1, 1, color=BG))
    # tre sirkler: inn (stor), hold (middels), ut (liten) — tegnet utenfra og inn
    for r, c in zip((0.36, 0.25, 0.14), RINGS):
        ax.add_patch(Circle((0.5, 0.5), r * safe, color=c))
    ax.add_patch(Circle((0.5, 0.5), 0.045 * safe, color="#3a4a3f"))
    fig.savefig(path, dpi=px, transparent=rounded)
    plt.close(fig)


icon(180, OUT / "ikon-180.png")
icon(192, OUT / "ikon-192.png", rounded=True)
icon(512, OUT / "ikon-512.png", rounded=True)
icon(512, OUT / "ikon-maskable-512.png", safe=0.8)
print("\n".join(sorted(p.name for p in OUT.glob("*.png"))))
