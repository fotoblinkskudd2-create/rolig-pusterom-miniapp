"""Granatbelte-stativ v0.1 — trappestativ for N granatkort (ID-1) så tallbåndet på hvert kort synes.

Kjør:  python3 products/03-granatbelte/cad/granatbelte.py [N]
Ut:    granatbelte.stl, rapport.txt, ../bilder/cad-*.png

Akser: X = kortbredde, Y = dybde (front → bak), Z = opp. Kortene står i spor, lent bakover.
"""
import math
import sys
from pathlib import Path

import numpy as np
import trimesh
from manifold3d import Manifold

HERE = Path(__file__).resolve().parent
IMG = HERE.parent / "bilder"
IMG.mkdir(exist_ok=True)
sys.path.insert(0, str(HERE.parents[2] / "tools"))

N = int(sys.argv[1]) if len(sys.argv) > 1 else 8
CARD_W, CARD_H, CARD_T = 85.60, 53.98, 0.76   # ID-1; papirkort på 300 g/m² ≈ 0,35 mm, laminert ≈ 0,7 mm
BAND = 7.0              # tallbåndet øverst på kortet (granatbelte.html @media print)
TILT = 12.0             # grader bakover
SLOT_W = 1.3            # spor: tar laminerte kort og ekte plastkort
SLOT_D = 9.0            # sporingsdybde målt langs kortet
WALL = 3.0              # sidevange
FLOOR = 1.6             # minste gulv under sporbunnen (4 lag + litt)
LIP = 2.0               # materiale foran hvert spor
PITCH = 8.0             # dybde per trinn
CLEAR_BAND = 1.0        # ekstra synlig luft over båndet
DENS_PLA = 1.24

# Hvert kort må stå så mye høyere enn kortet foran at båndet synes: steg = BAND + luft, korrigert for helling.
STEP = (BAND + CLEAR_BAND) * math.cos(math.radians(TILT))
BASE = SLOT_D * math.cos(math.radians(TILT)) + SLOT_W / 2 * math.sin(math.radians(TILT)) + FLOOR  # første trinn: sporet skal ikke gå gjennom bunnen
W = CARD_W + 2 * WALL + 2 * 0.6               # 0,6 mm klaring hver side av kortet
D = N * PITCH + 4.0


def box(x0, y0, z0, x1, y1, z1):
    return Manifold.cube((x1 - x0, y1 - y0, z1 - z0)).translate((x0, y0, z0))


def slot(y_front, z_top):
    """Skrått spor: rektangel SLOT_W tykt, går SLOT_D ned langs kortets helling."""
    s = Manifold.cube((CARD_W + 1.2, SLOT_W, SLOT_D + 6), True)
    s = s.translate((0, 0, (SLOT_D + 6) / 2 - SLOT_D))       # topp 6 mm over flaten, bunn SLOT_D under
    s = s.rotate((-TILT, 0, 0))                               # lener bakover (+Y) mot toppen
    return s.translate((W / 2, y_front + LIP + SLOT_W / 2, z_top))


def build():
    body = Manifold()
    tops = []
    for i in range(N):
        z = BASE + i * STEP
        body = body + box(0, i * PITCH, 0, W, D, z)
        tops.append(z)
    # sidevanger som holder kortene sideveis, skrå ned mot front
    for x0 in (0, W - WALL):
        prof = []
        for i in range(N):
            prof.append(box(x0, i * PITCH, 0, x0 + WALL, i * PITCH + PITCH, tops[i] + 6))
        body = body + Manifold.batch_boolean(prof, __import__("manifold3d").OpType.Add)
    for i in range(N):
        body = body - slot(i * PITCH, tops[i])
    # filt-/gummifot-lommer under, Ø10 × 1
    for x in (10, W - 10):
        for y in (8, D - 8):
            body = body - Manifold.cylinder(1.0, 5.0, 5.0, 48).translate((x, y, -0.01))
    return body, tops


def to_tm(m):
    mm = m.to_mesh()
    return trimesh.Trimesh(np.asarray(mm.vert_properties)[:, :3], np.asarray(mm.tri_verts), process=True)


def cards(tops):
    out = []
    for i, z in enumerate(tops):
        c = Manifold.cube((CARD_W, CARD_T, CARD_H), True).translate((0, 0, CARD_H / 2 - SLOT_D + 0.5))
        c = c.rotate((-TILT, 0, 0)).translate((W / 2, i * PITCH + LIP + SLOT_W / 2, z))
        out.append(c)
    return out


def visible_band(tops):
    """Hvor mye av hvert korts toppbånd som ikke skjules av kortet foran (geometrisk, sett horisontalt forfra)."""
    tilt = math.radians(TILT)
    top_z = [z - SLOT_D * math.cos(tilt) + (CARD_H - 0.5) * math.cos(tilt) for z in tops]
    return [top_z[i] - top_z[i - 1] for i in range(1, len(tops))], top_z


def main():
    body, tops = build()
    tm = to_tm(body)
    assert tm.is_watertight
    tm.export(HERE / "granatbelte.stl")
    clash = sum((body ^ c).volume() for c in cards(tops))
    vis, top_z = visible_band(tops)
    cms = cards(tops)
    card_zmin = min(c.bounding_box()[2] for c in cms)
    # gulv: laveste punkt på hvert spor over Z=0 (sporbunnens nedre hjørne)
    floor_min = min(slot(i * PITCH, z).bounding_box()[2] for i, z in enumerate(tops))
    vol = body.volume() / 1000
    shell = body.surface_area() * 1.2 / 1000          # ~3 perimetre/topplag
    mass15 = (shell + max(vol - shell, 0) * 0.15) * DENS_PLA
    minutes = (shell + max(vol - shell, 0) * 0.15) * 1000 / 9 / 60 + 6
    rep = f"""GRANATBELTE-STATIV v0.1 — CAD-rapport
Kort          : {N} × ID-1 ({CARD_W} × {CARD_H}), spor {SLOT_W} mm, {SLOT_D} mm dypt, helling {TILT}°
Ytre mål      : {W:.1f} × {D:.1f} × {max(tops) + 6:.1f} mm
Trinn         : {STEP:.2f} mm høyde, {PITCH} mm dybde
Synlig bånd   : {min(vis):.2f} mm per kort bak (krav ≥ {BAND} mm tallbånd)  ·  øverste korttopp Z={top_z[-1]:.1f}
Kort-kollisjon: {clash:.3f} mm3 (skal være 0)  ·  laveste kortpunkt Z={card_zmin:.2f}
Gulv under spor: {floor_min:.2f} mm (krav ≥ {FLOOR})
Vanntett      : {tm.is_watertight}
Volum massiv  : {vol:.1f} cm3  ·  med 15 % infill ≈ {mass15:.0f} g PLA
Print-estimat : ~{minutes:.0f} min (0.2 mm, 15 % infill, uten støtte — trinn og 12° spor er selvbærende)
"""
    (HERE / "rapport.txt").write_text(rep)
    print(rep)
    assert clash < 1e-3, "kort kolliderer med stativ"
    assert floor_min >= FLOOR - 0.05, f"gulv under spor {floor_min:.2f} mm < {FLOOR}"
    assert card_zmin > 0.5, f"kort stikker ut under stativet (Z={card_zmin:.2f})"
    assert min(vis) >= BAND, "tallbåndet skjules"

    from render import render
    wood = (0.86, 0.55, 0.42)
    paper = (0.97, 0.95, 0.90)
    cs = [to_tm(c) for c in cms]
    render([(tm, wood)], IMG / "cad-stativ-iso.png", elev=28, azim=-60, title=f"Granatbelte-stativ — {N} kort, tallbåndet synlig")
    render([(tm, wood)] + [(c, paper) for c in cs], IMG / "cad-stativ-kort.png", elev=14, azim=-75,
           title="Med kort: hvert tall synes over kortet foran")
    render([(tm, wood)] + [(c, paper) for c in cs], IMG / "cad-stativ-side.png", elev=0, azim=0, title=f"Fra siden — {TILT:.0f}° helling, trinn {STEP:.1f} mm")


if __name__ == "__main__":
    main()
