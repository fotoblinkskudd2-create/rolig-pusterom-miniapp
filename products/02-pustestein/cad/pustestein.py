"""Pustestein v0.1 — parametrisk CAD.

Kjør:  python3 products/02-pustestein/cad/pustestein.py [parametre.json]
Ut:    pustestein.stl, ramme.stl, rapport.txt, ../bilder/cad-*.png

parametre.json kommer fra pustestein.html (tommel-kalibrering). Uten fil brukes standard.
Akser: X = langakse, Y = tverrakse, Z = opp. Bunnen (fotovinduet) ligger i Z=0.
"""
import json
import math
import sys
from pathlib import Path

import numpy as np
import trimesh
from manifold3d import Manifold, OpType

import os

HERE = Path(__file__).resolve().parent
OUT = Path(os.environ.get("PUSTESTEIN_OUT", HERE))          # tester skriver til tmp
NO_IMAGES = os.environ.get("PUSTESTEIN_NO_IMAGES") == "1"
IMG = HERE.parent / "bilder"
sys.path.insert(0, str(HERE.parents[2] / "tools"))
IMG.mkdir(exist_ok=True)

DEFAULTS = dict(
    speed_mm_s=10.0,   # tommelfart langs rillen — måles i appen
    inhale=4.0, hold=2.0, exhale=6.0,   # samme rytme som Pusterom (index.html)
    groove_r=7.0,      # kuleradius for rillen ≈ tommelpute
    fill="stal",       # "stal" (stålhagl) | "sand" | "tom"
)

# ---- kropp (mm) ----
A, B, C = 40.0, 30.0, 22.0     # ellipsoide-halvakser
Z0 = 3.0                       # sentrum over bunn → bunnkant under ekvator, myk kant
SHELL_TOP, FLOOR_OVER_PHOTO = 4.0, 1.2
DEPTH_LO, DEPTH_HI = 0.9, 2.2  # rilledybde: grunn ved hold, dyp ved start
BUMP_R, RIB_R = 1.3, 0.5
# fotovindu (passbilde 35 × 45 mm, langside langs X)
PHOTO = (45.0, 35.0)
PHOTO_CLR, PHOTO_T = 0.2, 0.5
FRAME = (49.0, 39.0)
FRAME_T, FRAME_CLR = 1.6, 0.2
WINDOW = (41.0, 31.0)
DENS = dict(pla=1.24, sand=1.6, stal=4.7, tom=0.0)   # stål: 7,85 × ~0,6 pakningsgrad

SEG = 96
MIN_WALL = 1.2                       # 3 perimetre à 0,4
PAUSE_Z = Z0 + C - SHELL_TOP - 1.0   # fyll flush hit, så brokobles taket over


def load_params(argv):
    p = dict(DEFAULTS)
    path = Path(argv[1]) if len(argv) > 1 else HERE / "parametre.json"
    if path.exists():
        p.update({k: v for k, v in json.loads(path.read_text()).items() if k in DEFAULTS})
    return p


def ellipse_perimeter(a, b):
    return math.pi * (3 * (a + b) - math.sqrt((3 * a + b) * (a + 3 * b)))


def surface(x, y):
    """Punkt og normal på ellipsoiden over (x, y)."""
    q = 1 - (x / A) ** 2 - (y / B) ** 2
    z = Z0 + C * math.sqrt(max(q, 0.0))
    n = np.array([x / A**2, y / B**2, (z - Z0) / C**2])
    return np.array([x, y, z]), n / np.linalg.norm(n)


def path_points(L, step=0.6):
    """Lukket ellipse-sti med buelengde L; returnerer (s, punkt, normal, tangent)."""
    k = L / ellipse_perimeter(A, B)
    ts = np.linspace(0, 2 * math.pi, 4000)
    xy = np.stack([k * A * np.cos(ts), k * B * np.sin(ts)], 1)
    seg = np.r_[0, np.cumsum(np.linalg.norm(np.diff(xy, axis=0), axis=1))]
    out = []
    for s in np.arange(0, seg[-1], step):
        t = np.interp(s, seg, ts)
        p, n = surface(k * A * math.cos(t), k * B * math.sin(t))
        tan = np.array([-k * A * math.sin(t), k * B * math.cos(t), 0.0])
        tan -= n * tan.dot(n)
        out.append((s / seg[-1], p, n, tan / np.linalg.norm(tan)))
    return k, out


def depth(u, f_in, f_hold):
    if u < f_in:
        return DEPTH_HI + (DEPTH_LO - DEPTH_HI) * u / f_in
    if u < f_in + f_hold:
        return DEPTH_LO
    return DEPTH_LO + (DEPTH_HI - DEPTH_LO) * (u - f_in - f_hold) / (1 - f_in - f_hold)


def frame_matrix(z_axis, origin):
    w = z_axis / np.linalg.norm(z_axis)
    a = np.array([0, 0, 1.0]) if abs(w[2]) < 0.9 else np.array([1.0, 0, 0])
    u = np.cross(a, w); u /= np.linalg.norm(u)
    v = np.cross(w, u)
    return np.column_stack([u, v, w, origin]).tolist()


def box(sx, sy, sz, z0=0.0):
    return Manifold.cube((sx, sy, sz), True).translate((0, 0, z0 + sz / 2))


def build(p):
    T = p["inhale"] + p["hold"] + p["exhale"]
    L = p["speed_mm_s"] * T
    f_in, f_hold = p["inhale"] / T, p["hold"] / T
    R = p["groove_r"]

    body = Manifold.sphere(1.0, SEG).scale((A, B, C)).translate((0, 0, Z0))
    body = body ^ box(200, 200, 100, 0)
    solid = body

    k, pts = path_points(L)
    if not 0.30 <= k <= 0.80:
        raise SystemExit(f"Rillelengde {L:.0f} mm gir k={k:.2f}; må være 0,30–0,80. Juster fart eller rytme.")
    # kule-fres: senter R over rillebunnen (bunn = overflate − n·d)
    balls = [Manifold.sphere(R, 40).translate(tuple(pt + n * (R - depth(u, f_in, f_hold)))) for u, pt, n, _ in pts]
    capsules = [Manifold.batch_hull([balls[i], balls[(i + 1) % len(balls)]]) for i in range(len(balls))]
    groove = Manifold.batch_boolean(capsules, OpType.Add)
    body = body - groove

    def floor_at(u_target):
        u, pt, n, tan = min(pts, key=lambda q: abs(q[0] - u_target))
        return pt - n * depth(u, f_in, f_hold), n, tan

    adds = []
    # hold: én knott per sekund + 1 (start og slutt på hvilen kjennes)
    nb = int(round(p["hold"])) + 1
    for i in range(nb):
        f, n, _ = floor_at(f_in + f_hold * (i + 0.5) / nb)
        adds.append(Manifold.sphere(BUMP_R, 24).translate(tuple(f)))
    # pust ut: én tverr-ribbe per sekund — tell dem
    nr = int(round(p["exhale"]))
    for i in range(nr):
        f, n, tan = floor_at(f_in + f_hold + (1 - f_in - f_hold) * (i + 0.5) / nr)
        b = np.cross(tan, n)
        rib = Manifold.cylinder(2 * R * 0.55, RIB_R, RIB_R, 16, True)
        adds.append(rib.transform(frame_matrix(b, f)))
    # knotter og ribber klippes mot uskåret stein: ingenting stikker over overflaten
    body = body + (Manifold.batch_boolean(adds, OpType.Add) ^ solid)

    # fotolomme (bilde) + rammelomme, fra bunnen
    fx, fy = FRAME[0] + 2 * FRAME_CLR, FRAME[1] + 2 * FRAME_CLR
    px, py = PHOTO[0] + 2 * PHOTO_CLR, PHOTO[1] + 2 * PHOTO_CLR
    notch = Manifold.cylinder(FRAME_T + 1, 4.0, 4.0, 32, False).translate((fx / 2, 0, -0.5))
    body = body - box(fx, fy, FRAME_T + 0.5, -0.5) - box(px, py, PHOTO_T, FRAME_T) - notch

    # vekthulrom (lukket — fylles ved pause-at-height)
    cav_floor = FRAME_T + PHOTO_T + FLOOR_OVER_PHOTO
    cavity = (Manifold.sphere(1.0, SEG).scale((A - SHELL_TOP, B - SHELL_TOP, C - SHELL_TOP)).translate((0, 0, Z0))
              ^ box(200, 200, 100, cav_floor))
    # hold rillens underside fri: trekk hulrommet ned under rilla
    cavity = cavity - groove.translate((0, 0, -1.8)) - groove.translate((0, 0, -0.9))
    shell = body - cavity
    rattle = (cavity ^ box(200, 200, 100, PAUSE_Z)).volume()
    wall = cavity.min_gap(groove, 10.0)          # tynneste vegg mellom rille og hulrom
    assert wall >= MIN_WALL, f"vegg under rille {wall:.2f} mm < {MIN_WALL}"

    frame = box(FRAME[0], FRAME[1], FRAME_T) - box(WINDOW[0], WINDOW[1], FRAME_T + 2, -1)
    return dict(shell=shell, cavity=cavity, frame=frame, L=L, k=k, T=T,
                ribs=nr, bumps=nb, cav_floor=cav_floor, rattle=rattle, wall=wall, pts=pts, f_in=f_in, f_hold=f_hold)


def to_trimesh(m):
    mm = m.to_mesh()
    return trimesh.Trimesh(np.asarray(mm.vert_properties)[:, :3], np.asarray(mm.tri_verts), process=True)


def render_iso(meshes, path, elev=32, azim=-55, title=None, zlim=None):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection

    fig = plt.figure(figsize=(8, 6.5), dpi=160)
    ax = fig.add_subplot(111, projection="3d")
    ax.set_facecolor("white")
    light = np.array([0.35, -0.45, 0.82]); light /= np.linalg.norm(light)
    allv = []
    for m, base in meshes:
        tri = m.vertices[m.faces]
        shade = 0.38 + 0.62 * np.clip(m.face_normals @ light, 0, 1) ** 0.8
        ax.add_collection3d(Poly3DCollection(tri, facecolors=np.clip(np.outer(shade, base), 0, 1), linewidths=0))
        allv.append(m.vertices)
    v = np.vstack(allv); mn, mx = v.min(0), v.max(0)
    ctr, span = (mn + mx) / 2, (mx - mn)[:2].max() / 2
    ax.set_xlim(ctr[0] - span, ctr[0] + span); ax.set_ylim(ctr[1] - span, ctr[1] + span)
    ax.set_zlim(*(zlim or (ctr[2] - span * 0.5, ctr[2] + span * 0.5)))
    ax.set_box_aspect((1, 1, 0.5)); ax.view_init(elev=elev, azim=azim); ax.set_axis_off()
    if title:
        ax.set_title(title, fontsize=11, color="#3a4a3f")
    fig.tight_layout(); fig.savefig(path, facecolor="white"); plt.close(fig)


def drawing(res, shell_tm, path):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.patches import Ellipse, Rectangle

    ink, green, blue, warm = "#3a4a3f", "#1baf7a", "#2a78d6", "#eb6834"
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(13, 5.6), dpi=160, gridspec_kw=dict(width_ratios=[1.25, 1]))
    for a in (a1, a2):
        a.set_aspect("equal"); a.axis("off")
    base_a, base_b = A * math.sqrt(1 - (Z0 / C) ** 2), B * math.sqrt(1 - (Z0 / C) ** 2)
    a1.add_patch(Ellipse((0, 0), 2 * A, 2 * B, fill=False, lw=1.6, ec=ink))
    pts, f_in, f_hold = res["pts"], res["f_in"], res["f_hold"]
    xy = np.array([q[1][:2] for q in pts]); u = np.array([q[0] for q in pts])
    for lo, hi, col, lab in ((0, f_in, blue, "pust inn — grunnes"), (f_in, f_in + f_hold, warm, "hold — knotter"),
                             (f_in + f_hold, 1.0001, green, "pust ut — tell ribbene")):
        sel = (u >= lo) & (u < hi)
        a1.plot(xy[sel, 0], xy[sel, 1], color=col, lw=5, solid_capstyle="round", label=lab)
    a1.plot(*xy[0], "o", ms=9, color=ink); a1.annotate("start (dypest)", xy[0], (xy[0][0] + 6, xy[0][1] - 9), fontsize=8, color=ink,
                                                       arrowprops=dict(arrowstyle="-", color=ink, lw=0.6))
    a1.annotate("", (A, B + 5), (-A, B + 5), arrowprops=dict(arrowstyle="<->", lw=0.8, color=ink))
    a1.text(0, B + 6.5, f"{2 * A:.0f}", ha="center", fontsize=8, color=ink)
    a1.annotate("", (A + 5, B), (A + 5, -B), arrowprops=dict(arrowstyle="<->", lw=0.8, color=ink))
    a1.text(A + 6.5, 0, f"{2 * B:.0f}", va="center", rotation=90, fontsize=8, color=ink)
    a1.legend(loc="lower center", bbox_to_anchor=(0.5, -0.16), ncol=3, frameon=False, fontsize=8, labelcolor=ink)
    a1.set_xlim(-A - 6, A + 12); a1.set_ylim(-B - 12, B + 10)
    a1.set_title(f"Toppvisning · rille {res['L']:.0f} mm = {res['T']:.0f} s · R{DEFAULTS['groove_r']:.0f}", loc="left", fontsize=10, color=ink)

    # snitt Y=0 via manifold: rotér Y→Z og skjær ved 0. 2D-koordinater blir (x, -z).
    from matplotlib.path import Path as MPath
    from matplotlib.patches import PathPatch

    def compound(m):
        verts, codes = [], []
        for poly in m.rotate((90, 0, 0)).slice(0.0).to_polygons():
            q = np.asarray(poly) * [1, -1]
            verts += list(q) + [q[0]]
            codes += [MPath.MOVETO] + [MPath.LINETO] * (len(q) - 1) + [MPath.CLOSEPOLY]
        return MPath(verts, codes)
    a2.add_patch(PathPatch(compound(res["shell"]), fc="#cfe0d4", ec=ink, lw=0.8))
    a2.axhline(PAUSE_Z, color=warm, lw=0.8, ls="--")
    a2.text(A, PAUSE_Z + 0.6, f"pause Z={PAUSE_Z:.0f}", ha="right", fontsize=7, color=warm)
    a2.text(0, 12, "vekt-hulrom\n(stål / sand)", ha="center", fontsize=8, color=ink)
    a2.add_patch(Rectangle((-FRAME[0] / 2, 0), FRAME[0], FRAME_T, color=warm, alpha=0.6))
    a2.text(0, -3.2, "ramme + passbilde 35×45", ha="center", fontsize=8, color=ink)
    a2.set_xlim(-A - 3, A + 3); a2.set_ylim(-6, Z0 + C + 4)
    a2.set_title("Snitt Y=0 (mål i mm, 1:1)", loc="left", fontsize=10, color=ink)
    fig.tight_layout(); fig.savefig(path, facecolor="white"); plt.close(fig)


def main():
    p = load_params(sys.argv)
    res = build(p)
    shell, frame, cavity = to_trimesh(res["shell"]), to_trimesh(res["frame"]), to_trimesh(res["cavity"])
    assert shell.is_watertight and frame.is_watertight
    shell.export(OUT / "pustestein.stl"); frame.export(OUT / "ramme.stl")
    v_shell = res["shell"].volume() / 1000
    v_cav = res["cavity"].volume() / 1000
    m_pla = v_shell * DENS["pla"]
    rows = "\n".join(f"  {k:<5}: {m_pla + v_cav * DENS[k]:6.0f} g" for k in ("tom", "sand", "stal"))
    report = f"""PUSTESTEIN v0.1 — CAD-rapport
Parametre     : {json.dumps(p, ensure_ascii=False)}
Ytre mål      : {2 * A:.0f} × {2 * B:.0f} × {Z0 + C:.0f} mm (ellipsoide, flat bunn)
Rille         : {res['L']:.0f} mm lukket sløyfe = {res['T']:.0f} s ved {p['speed_mm_s']:.1f} mm/s · k={res['k']:.2f} · dybde {DEPTH_LO}–{DEPTH_HI} mm
Taktil kode   : pust inn {p['inhale']:.0f} s (grunnes) · hold {p['hold']:.0f} s ({res['bumps']} knotter) · pust ut {p['exhale']:.0f} s ({res['ribs']} ribber)
Rytme         : {60 / res['T']:.1f} pust/min
Fotovindu     : passbilde {PHOTO[0]:.0f}×{PHOTO[1]:.0f}, synlig {WINDOW[0]:.0f}×{WINDOW[1]:.0f}, ramme {FRAME[0]:.0f}×{FRAME[1]:.0f}×{FRAME_T}
Min. vegg     : {res['wall']:.2f} mm under rillen (krav ≥ {MIN_WALL})
Vanntett      : stein {shell.is_watertight}, ramme {frame.is_watertight}
Volum PLA     : {v_shell:.1f} cm3   ·  hulrom {v_cav:.1f} cm3 (Z={res['cav_floor']:.1f}–{Z0 + C - SHELL_TOP:.0f})
Pause-at-height: Z={PAUSE_Z:.1f} → fyll flush → rest-luft {res['rattle'] / 1000:.2f} cm3 ({res['rattle'] / res['cavity'].volume() * 100:.1f} % — rangling)
Masse         :
{rows}
Ramme         : {res['frame'].volume() / 1000 * DENS['pla']:.1f} g
Print-estimat : ~{v_shell * 1000 / 9 / 60 + 6:.0f} min stein (0.2 mm, 100 % vegger, uten støtte; bunn flat)
Trekanter     : {len(shell.faces)}
"""
    (OUT / "rapport.txt").write_text(report)
    print(report)
    if NO_IMAGES:
        return
    from render import render
    stone = (0.62, 0.74, 0.66)
    render([(shell, stone)], IMG / "cad-stein-iso.png", elev=34, azim=-58, title="Pustestein v0.1 — rillen er ett andedrag")
    render([(shell, stone)], IMG / "cad-stein-side.png", elev=6, azim=-90, title="Fra siden — 25 mm")
    flip = shell.copy(); flip.apply_transform(trimesh.transformations.rotation_matrix(math.pi, [1, 0, 0]))
    fr = frame.copy(); fr.apply_transform(trimesh.transformations.rotation_matrix(math.pi, [1, 0, 0])); fr.apply_translation([0, 0, 14])
    render([(flip, stone), (fr, (0.92, 0.62, 0.48))], IMG / "cad-stein-under.png", elev=40, azim=-60, margin=0.14,
           title="Undersiden: fotolomme + ramme (eksplodert)")
    drawing(res, shell, IMG / "cad-stein-tegning.png")


if __name__ == "__main__":
    main()
