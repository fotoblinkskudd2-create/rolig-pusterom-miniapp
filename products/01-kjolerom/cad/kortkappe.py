"""Kortkappe v0.1 — parametrisk CAD.

Kjør:  python3 products/01-kjolerom/cad/kortkappe.py
Ut:    kortkappe.stl, kort.stl (referanse), rapport.txt, ../bilder/cad-*.png

Krever: numpy trimesh manifold3d shapely mapbox_earcut matplotlib
Akser: X = langside (kortet skyves inn langs -X fra åpen ende ved X=0),
       Y = kortside, Z = tykkelse.
"""
from pathlib import Path

import numpy as np
import trimesh
from shapely.geometry import Point, box
from trimesh.creation import extrude_polygon

HERE = Path(__file__).resolve().parent
IMG = HERE.parent / "bilder"
IMG.mkdir(exist_ok=True)

# ---- parametre (mm) ----
CARD = dict(L=85.60, W=53.98, T=0.76, R=3.18)      # ISO/IEC 7810 ID-1
CLEAR_XY = 0.40                                    # klaring per side
POCKET_T = 1.05                                    # lomme-høyde
WALL = 1.20                                        # sidevegg
FLOOR = ROOF = 0.90                                # bunn/topp-plate
THUMB_R = 9.0                                      # tommelutsparing
RIDGE_H, RIDGE_W = 0.35, 1.2                       # friksjonsrygg, smalner lomma til 0.70 < 0.76
QR = 22.0                                          # QR-felt
QR_DEPTH = 0.40
PETG_DENSITY = 1.27                                # g/cm3

PL = CARD["L"] + CLEAR_XY                          # lomme-lengde (åpen i X=0, én klaring)
PW = CARD["W"] + 2 * CLEAR_XY
OL = PL + WALL                                     # bare lukket ende har vegg
OW = PW + 2 * WALL
OT = FLOOR + POCKET_T + ROOF
OR = CARD["R"] + WALL


def rounded_rect(x0, y0, x1, y1, r):
    return box(x0 + r, y0 + r, x1 - r, y1 - r).buffer(r, resolution=16)


def slab(poly, z0, h):
    m = extrude_polygon(poly, h)
    m.apply_translation([0, 0, z0])
    return m


def build():
    outer = slab(rounded_rect(0, 0, OL, OW, OR), 0, OT)
    # lomma går ut gjennom X=0: start den 1 mm utenfor
    pocket_poly = rounded_rect(-CARD["R"] - 1, WALL, PL, WALL + PW, CARD["R"] + CLEAR_XY)
    pocket = slab(pocket_poly, FLOOR, POCKET_T)
    # tommelutsparing gjennom topp og bunn ved åpen ende
    thumb = slab(Point(0, OW / 2).buffer(THUMB_R, resolution=48), -1, OT + 2)
    # QR-felt forsenket i toppen, nær lukket ende
    qx = OL - WALL - 6 - QR
    qr = slab(box(qx, (OW - QR) / 2, qx + QR, (OW + QR) / 2), OT - QR_DEPTH, QR_DEPTH + 1)
    body = outer.difference(pocket).difference(thumb).difference(qr)
    # to friksjonsrygger under taket, 12 mm inn fra åpningen, utenfor tommelfeltet
    ridges = []
    for yc in (WALL + 7, WALL + PW - 7):
        ridges.append(slab(box(12, yc - 5, 12 + RIDGE_W, yc + 5), FLOOR + POCKET_T - RIDGE_H, RIDGE_H))
    for r in ridges:
        body = body.union(r)
    return body


def card_mesh():
    c = slab(rounded_rect(0, 0, CARD["L"], CARD["W"], CARD["R"]), 0, CARD["T"])
    c.apply_translation([0, WALL + CLEAR_XY, FLOOR])
    return c


def render_iso(meshes, path, elev=28, azim=-58, title=None):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection

    fig = plt.figure(figsize=(9, 6.5), dpi=160)
    ax = fig.add_subplot(111, projection="3d")
    light = np.array([0.3, -0.5, 0.8]); light /= np.linalg.norm(light)
    allv = []
    for m, base in meshes:
        tri = m.vertices[m.faces]
        shade = 0.45 + 0.55 * np.clip(m.face_normals @ light, 0, 1)
        cols = np.clip(np.outer(shade, base), 0, 1)
        pc = Poly3DCollection(tri, facecolors=cols, edgecolors=(0, 0, 0, 0.06), linewidths=0.15)
        ax.add_collection3d(pc)
        allv.append(m.vertices)
    v = np.vstack(allv)
    mn, mx = v.min(0), v.max(0)
    ctr, span = (mn + mx) / 2, (mx - mn).max() / 2
    ax.set_xlim(ctr[0] - span, ctr[0] + span)
    ax.set_ylim(ctr[1] - span, ctr[1] + span)
    ax.set_zlim(ctr[2] - span * 0.6, ctr[2] + span * 0.6)
    ax.set_box_aspect((1, 1, 0.6))
    ax.view_init(elev=elev, azim=azim)
    ax.set_axis_off()
    ax.set_facecolor("#eef4f8")
    if title:
        ax.set_title(title, fontsize=11, color="#23323d")
    fig.tight_layout()
    fig.savefig(path, facecolor="#eef4f8")
    plt.close(fig)


def drawing(path):
    """2D arbeidstegning: toppvisning + snitt, med mål."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.patches import Circle, FancyBboxPatch, Rectangle

    fig, (a1, a2) = plt.subplots(2, 1, figsize=(10, 9), dpi=160, gridspec_kw=dict(height_ratios=[3, 1.1]))
    ink = "#23323d"
    for a in (a1, a2):
        a.set_aspect("equal"); a.axis("off")

    a1.add_patch(FancyBboxPatch((0, 0), OL, OW, boxstyle=f"round,pad=0,rounding_size={OR}", fill=False, lw=1.6, ec=ink))
    a1.add_patch(FancyBboxPatch((0, WALL), PL, PW, boxstyle=f"round,pad=0,rounding_size={CARD['R']}", fill=False, lw=0.9, ec=ink, ls="--"))
    a1.add_patch(Circle((0, OW / 2), THUMB_R, fill=False, lw=1.2, ec="#3d6f8f"))
    qx = OL - WALL - 6 - QR
    a1.add_patch(Rectangle((qx, (OW - QR) / 2), QR, QR, fill=False, lw=1.2, ec="#3d6f8f", hatch="///"))
    for yc in (WALL + 7, WALL + PW - 7):
        a1.add_patch(Rectangle((12, yc - 5), RIDGE_W, 10, color="#c29a7a"))

    def dim(ax, p0, p1, off, txt, vertical=False):
        (x0, y0), (x1, y1) = p0, p1
        if vertical:
            ax.annotate("", (x0 + off, y0), (x0 + off, y1), arrowprops=dict(arrowstyle="<->", lw=0.8, color=ink))
            ax.text(x0 + off + 1.2, (y0 + y1) / 2, txt, va="center", fontsize=8, color=ink, rotation=90)
        else:
            ax.annotate("", (x0, y0 + off), (x1, y0 + off), arrowprops=dict(arrowstyle="<->", lw=0.8, color=ink))
            ax.text((x0 + x1) / 2, y0 + off + 1.0, txt, ha="center", fontsize=8, color=ink)

    dim(a1, (0, OW), (OL, OW), 4, f"{OL:.1f}")
    dim(a1, (OL, 0), (OL, OW), 4, f"{OW:.2f}", vertical=True)
    dim(a1, (0, 0), (PL, 0), -5, f"lomme {PL:.1f}")
    a1.text(THUMB_R + 1, OW / 2 + THUMB_R - 1, f"R{THUMB_R:.0f} tommel\n(gjennom)", fontsize=7, color="#3d6f8f")
    a1.text(qx + 1, (OW + QR) / 2 + 1.2, f"QR {QR:.0f}×{QR:.0f}, −{QR_DEPTH} mm", fontsize=7, color="#3d6f8f")
    a1.text(14, WALL + 7 + 6, f"rygg {RIDGE_H} mm", fontsize=7, color="#c29a7a")
    a1.text(-THUMB_R - 1.5, OW / 2, "ÅPEN\nENDE →", ha="right", va="center", fontsize=8, color=ink)
    a1.set_xlim(-24, OL + 10); a1.set_ylim(-10, OW + 10)
    a1.set_title("KORTKAPPE v0.1 — toppvisning (mm)", fontsize=11, color=ink, loc="left")

    # snitt A-A gjennom midten langs Y
    s = 6.0  # forstørrelse i Z for lesbarhet
    a2.add_patch(Rectangle((0, 0), OW, FLOOR * s, color="#b9d6e8"))
    a2.add_patch(Rectangle((0, (FLOOR + POCKET_T) * s), OW, ROOF * s, color="#b9d6e8"))
    a2.add_patch(Rectangle((0, FLOOR * s), WALL, POCKET_T * s, color="#b9d6e8"))
    a2.add_patch(Rectangle((OW - WALL, FLOOR * s), WALL, POCKET_T * s, color="#b9d6e8"))
    a2.add_patch(Rectangle((WALL + CLEAR_XY, (FLOOR + 0.1) * s), CARD["W"], CARD["T"] * s, color="#c29a7a", alpha=0.8))
    a2.text(OW / 2, (FLOOR + 0.1 + CARD["T"] / 2) * s, "kort 0,76", ha="center", va="center", fontsize=7, color="white")
    for z, lab in ((0, "0"), (FLOOR, f"{FLOOR}"), (FLOOR + POCKET_T, f"{FLOOR + POCKET_T:.2f}"), (OT, f"{OT:.2f}")):
        a2.plot([OW + 1, OW + 3], [z * s, z * s], color=ink, lw=0.6)
        a2.text(OW + 3.5, z * s, lab, va="center", fontsize=7, color=ink)
    a2.set_xlim(-4, OW + 14); a2.set_ylim(-3, OT * s + 4)
    a2.set_title(f"Snitt A–A (Z ×{s:.0f})  ·  vegg {WALL}  ·  klaring {CLEAR_XY}/side  ·  PETG", fontsize=9, color=ink, loc="left")
    fig.tight_layout()
    fig.savefig(path, facecolor="white")
    plt.close(fig)


def main():
    body = build()
    card = card_mesh()
    assert body.is_watertight, "kappe er ikke vanntett"
    body.export(HERE / "kortkappe.stl")
    card.export(HERE / "kort.stl")

    vol_cm3 = body.volume / 1000
    mass = vol_cm3 * PETG_DENSITY
    inter = body.intersection(card)
    clash = inter.volume if not inter.is_empty else 0.0
    # print-estimat: ~ 12 mm3/s effektiv flyt for en hobbyprinter på 0.2 mm lag
    minutes = body.volume / 12 / 60 + 4  # + oppvarming/første lag
    report = f"""KORTKAPPE v0.1 — CAD-rapport
Ytre mål      : {OL:.2f} × {OW:.2f} × {OT:.2f} mm
Lomme         : {PL:.2f} × {PW:.2f} × {POCKET_T:.2f} mm (åpen i X=0)
Kort (ISO)    : {CARD['L']} × {CARD['W']} × {CARD['T']} mm
Vanntett      : {body.is_watertight}
Volum         : {vol_cm3:.2f} cm3
Masse PETG    : {mass:.1f} g
Kollisjon kort: {clash:.3f} mm3 (tilsiktet: kun ved ryggene, kort hviler på bunnplata)
Ryggklaring   : {POCKET_T - RIDGE_H:.2f} mm < kort {CARD['T']} mm → klemmer kortet {(CARD['T'] - (POCKET_T - RIDGE_H)) * 1000:.0f} µm
Print-estimat : ~{minutes:.0f} min @ 0.2 mm, 100 % infill (bare vegger)
Trekanter     : {len(body.faces)}
"""
    (HERE / "rapport.txt").write_text(report)
    print(report)

    render_iso([(body, np.array([0.55, 0.72, 0.84]))], IMG / "cad-kappe-iso.png", title="Kortkappe v0.1 — PETG, 2,85 mm")
    exploded = card.copy(); exploded.apply_translation([-45, 0, 6])
    render_iso([(body, np.array([0.55, 0.72, 0.84])), (exploded, np.array([0.80, 0.62, 0.46]))],
               IMG / "cad-kappe-eksplodert.png", elev=34, azim=-120, title="Eksplodert: kortet skyves inn fra åpen ende")
    render_iso([(body, np.array([0.55, 0.72, 0.84]))], IMG / "cad-kappe-under.png", elev=-30, azim=-40, title="Undersiden: tommelutsparing gjennom")
    drawing(IMG / "cad-kappe-tegning.png")


if __name__ == "__main__":
    main()
