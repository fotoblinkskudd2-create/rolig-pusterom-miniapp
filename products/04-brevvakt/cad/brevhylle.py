"""Brevhylle v0.1 — to spor (Uåpnet foran/lavt, Håndtert bak/høyt) + brevåpner med fanget 9 mm brekkblad.

Kjør:  python3 products/04-brevvakt/cad/brevhylle.py
Ut:    brevhylle.stl, rapport.txt, ../bilder/cad-*.png

Akser: X = bredde (brevets langside), Y = dybde (front → bak), Z = opp.
Brevåpner: et 2,4 mm spor langs toppen av frontleppa. Legg brevkanten (folden) ned i sporet og dra brevet mot høyre (+X).
Et brekkbladsegment ligger vannrett, fanget i leppa, med eggen (13 mm) på tvers av sporet og vendt mot −X.
Papiret møter eggen 3 mm over folden og skjæres av. Sporet er 2,4 mm: en finger får ikke plass.
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

W = 120.0                 # brev (C5 229 mm / C65 229 mm) henger 55 mm ut på hver side — stabilt, passer 180 mm-plate
BASE_T = 4.0
LIP_T, LIP_H = 14.0, 30.0   # bladets 13 mm egg ligger på tvers av leppa
FRONT_SLOT = 14.0         # Uåpnet: ~10 konvolutter
DIV_T, DIV_H = 4.0, 55.0
BACK_SLOT = 20.0          # Håndtert
BACK_T, BACK_H = 6.0, 80.0
GROOVE_W, GROOVE_D = 2.4, 8.0
BLADE = dict(w=9.0, t=0.5, l=13.0)        # standard 9 mm brekkblad, ett segment
POCKET_CLR = 0.15
BLADE_Z_BELOW_TOP = 5.0
FINGER_MIN = 8.0                          # minste fingerbredde (barn) vi designer mot
DENS_PLA = 1.24

D = LIP_T + FRONT_SLOT + DIV_T + BACK_SLOT + BACK_T


def box(x0, y0, z0, x1, y1, z1):
    return Manifold.cube((x1 - x0, y1 - y0, z1 - z0)).translate((x0, y0, z0))


def blade_pocket():
    """Lomme for bladet: åpner i frontflaten (Y=0) for innsetting, stopper 0,6 mm før innsiden av leppa."""
    pw = BLADE["w"] + 2 * POCKET_CLR      # langs X (bladets 9 mm)
    pd = LIP_T - 0.6                      # langs Y (eggen 13 mm + klaring)
    pt = BLADE["t"] + 2 * POCKET_CLR      # tykkelse, Z
    p = Manifold.cube((pw, pd, pt), True)
    return p.translate((W / 2, pd / 2 - 0.01, LIP_H - BLADE_Z_BELOW_TOP)), pd


def blade():
    b = Manifold.cube((BLADE["w"], BLADE["l"], BLADE["t"]), True)
    return b.translate((W / 2, BLADE["l"] / 2 + 0.3, LIP_H - BLADE_Z_BELOW_TOP))


def build():
    y = 0.0
    body = box(0, 0, 0, W, D, BASE_T)
    body += box(0, y, 0, W, y + LIP_T, LIP_H); y += LIP_T + FRONT_SLOT
    body += box(0, y, 0, W, y + DIV_T, DIV_H); y += DIV_T + BACK_SLOT
    body += box(0, y, 0, W, y + BACK_T, BACK_H)
    gy0 = (LIP_T - GROOVE_W) / 2
    groove = box(-1, gy0, LIP_H - GROOVE_D, W + 1, gy0 + GROOVE_W, LIP_H + 1)
    body -= groove
    pocket, pd = blade_pocket()
    body -= pocket
    return body, groove, pocket, pd


def to_tm(m):
    mm = m.to_mesh()
    return trimesh.Trimesh(np.asarray(mm.vert_properties)[:, :3], np.asarray(mm.tri_verts), process=True)


def main():
    body, groove, pocket, pd = build()
    tm = to_tm(body)
    assert tm.is_watertight
    tm.export(HERE / "brevhylle.stl")
    bl = blade()
    # 1) bladet krysser sporet (ellers skjærer det ikke)
    crosses = (bl ^ groove).volume()
    # 2) bladet kolliderer ikke med plasten (lomma er stor nok)
    clash = (bl ^ body).volume()
    # 3) bladet er fanget: ingen del av det utenfor leppas Y-område eller over toppen
    bb = bl.bounding_box()
    captured = bb[1] >= 0 and bb[4] <= LIP_T - 0.5 and bb[5] < LIP_H
    # 4) ingen finger: sporet og lomme-åpningen er smalere enn en finger
    finger_safe = GROOVE_W < FINGER_MIN / 2 and BLADE["t"] + 2 * POCKET_CLR < 1.0
    # 5) inner leppevegg intakt bak lomma
    inner_wall = LIP_T - pd
    vol = body.volume() / 1000
    shell = body.surface_area() * 1.2 / 1000
    grams = (shell + max(vol - shell, 0) * 0.15) * DENS_PLA
    minutes = (shell + max(vol - shell, 0) * 0.15) * 1000 / 9 / 60 + 6
    rep = f"""BREVHYLLE v0.1 — CAD-rapport
Ytre mål      : {W:.0f} × {D:.0f} × {BACK_H:.0f} mm  (passer 180 mm-plate)
Spor          : Uåpnet {FRONT_SLOT:.0f} mm (front, leppe {LIP_H:.0f} mm) · Håndtert {BACK_SLOT:.0f} mm (bak, vegg {BACK_H:.0f} mm)
Brevåpner     : spor {GROOVE_W} × {GROOVE_D} mm langs X · blad {BLADE['w']:.0f}×{BLADE['l']:.0f}×{BLADE['t']} mm vannrett, egg på tvers mot −X, {BLADE_Z_BELOW_TOP} mm under topp ({GROOVE_D - BLADE_Z_BELOW_TOP:.0f} mm over folden)
Blad krysser spor: {crosses:.2f} mm3 (> 0 kreves)
Blad-kollisjon: {clash:.3f} mm3 (0 kreves)
Blad fanget   : {captured}  ·  innervegg bak lomme {inner_wall:.1f} mm
Fingersikker  : {finger_safe}  (spor {GROOVE_W} mm, lomme-slisse {BLADE['t'] + 2 * POCKET_CLR:.1f} mm)
Vanntett      : {tm.is_watertight}
Volum massiv  : {vol:.1f} cm3 · 15 % infill ≈ {grams:.0f} g PLA · ~{minutes:.0f} min
"""
    (HERE / "rapport.txt").write_text(rep)
    print(rep)
    assert crosses > 0.5 and clash < 1e-3 and captured and finger_safe and inner_wall >= 0.5

    from render import render
    slate = (0.55, 0.66, 0.74)
    steel = (0.82, 0.84, 0.86)
    paper = (0.97, 0.95, 0.90)
    env1 = Manifold.cube((229, 1.2, 162)).translate((W / 2 - 114.5, LIP_T + 4, BASE_T))
    env2 = Manifold.cube((229, 1.2, 162)).translate((W / 2 - 114.5, LIP_T + FRONT_SLOT + DIV_T + 6, BASE_T))
    render([(tm, slate), (to_tm(bl), steel)], IMG / "cad-hylle-iso.png", elev=26, azim=-62, title="Brevhylle — Uåpnet foran, Håndtert bak")
    render([(tm, slate), (to_tm(bl), steel), (to_tm(env1), paper), (to_tm(env2), (0.9, 0.93, 0.97))], IMG / "cad-hylle-brev.png",
           elev=18, azim=-70, title="Med C5-konvolutter — uåpnede brev kan ikke gjemmes")
    # nærbilde av brevåpneren: klipp ut frontleppa rundt bladet
    crop = box(W / 2 - 16, -1, LIP_H - 14, W / 2 + 16, LIP_T + 1, LIP_H + 1)
    render([(to_tm(body ^ crop), slate), (to_tm(bl), steel)], IMG / "cad-hylle-aapner.png", elev=35, azim=-50, margin=0.12,
           title="Brevåpner: 2,4 mm spor, fanget blad — ingen finger når det")


if __name__ == "__main__":
    main()
