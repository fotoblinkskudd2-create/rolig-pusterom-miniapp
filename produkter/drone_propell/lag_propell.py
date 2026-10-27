#!/usr/bin/env python3
"""Tar beste design fra maskinen og lager: robusthetsanalyse, geometritabell,
STL for 3D-print/støpeform (CW og CCW), planform-tegning og ytelseskurve.

Kjør fra repo-roten:
  python3 -m maskin produkter/drone_propell --fokus effektivitet --lagre produkter/drone_propell/beste_effektivitet.json
  python3 produkter/drone_propell/lag_propell.py
"""
import copy
import json
import math
import os
import sys

import numpy as np

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HER)
sys.path.insert(0, os.path.dirname(os.path.dirname(HER)))
import bemt  # noqa: E402
import problem as pb  # noqa: E402

UT = HER
R_REF = pb.R          # referansen er alltid en vanlig 10" propell
NAVN = "P1"


def p_ref(T):
    R, pb.R = pb.R, R_REF
    try:
        return pb.svev(ref(), T)["P"]
    finally:
        pb.R = R
NACA = {"flatbunn": (0.02, 0.4, 0.11), "lavRe_8pst": (0.04, 0.4, 0.08), "tynn_5pst": (0.045, 0.45, 0.05)}
HUB_R, HUB_H, AKSEL_R = 0.009, 0.008, 0.0025   # m


def last_beste():
    with open(os.path.join(UT, "beste_effektivitet.json")) as f:
        return json.load(f)[0]["design"]


def ref():
    return {k: v for k, v in pb.REFERANSE.items() if not k.startswith("_")}


# ---------------- Analyse ----------------
def gevinst(d, T, profiler=None):
    lagret = copy.deepcopy(bemt.PROFILER)
    try:
        if profiler:
            bemt.PROFILER.update(profiler)
        p_ny = pb.svev(d, T)["P"]
        p_ref_ = p_ref(T)
    finally:
        bemt.PROFILER.clear()
        bemt.PROFILER.update(lagret)
    return 100 * (p_ref_ / p_ny - 1), p_ny, p_ref_


def robusthet(d):
    rader = []
    for f in (0.6, 0.8, 1.0, 1.25, 1.5, 2.0):
        g, p_ny, pr = gevinst(d, pb.T_SVEV * f)
        rader.append((f"{f:.2g} × sveving ({pb.T_SVEV * f:.2f} N)", g, p_ny, pr))
    # Hva om profilet er dårligere enn modellen tror?
    sens = []
    for navn, faktor in [("profilmotstand +20 %", 1.2), ("profilmotstand +40 %", 1.4)]:
        prof = copy.deepcopy(bemt.PROFILER[d["profil"]])
        prof["cd0"] *= faktor
        prof["k"] *= faktor
        g, _, _ = gevinst(d, pb.T_SVEV, {d["profil"]: prof})
        sens.append((navn + " på ny propell", g))
    # Samme geometri, men vanlig flatbunnet profil: hvor mye kommer fra formen alene?
    kun_form = dict(d, profil="flatbunn", materiale="nylon_glassfiber")
    sens.append(("bare ny bladform, gammelt flatbunnet profil", gevinst(kun_form, pb.T_SVEV)[0]))
    return rader, sens


# ---------------- Geometri / STL ----------------
def naca(m, p, t, n=36):
    beta = np.linspace(0, math.pi, n)
    x = (1 - np.cos(beta)) / 2
    yt = 5 * t * (0.2969 * np.sqrt(x) - 0.126 * x - 0.3516 * x ** 2 + 0.2843 * x ** 3 - 0.1036 * x ** 4)
    yc = np.where(x < p, m / p ** 2 * (2 * p * x - x ** 2), m / (1 - p) ** 2 * (1 - 2 * p + 2 * p * x - x ** 2))
    dyc = np.where(x < p, 2 * m / p ** 2 * (p - x), 2 * m / (1 - p) ** 2 * (p - x))
    th = np.arctan(dyc)
    xu, yu = x - yt * np.sin(th), yc + yt * np.cos(th)
    xl, yl = x + yt * np.sin(th), yc - yt * np.cos(th)
    # Lukket løkke: bakkant -> overside -> forkant -> underside -> bakkant
    X = np.concatenate([xu[::-1], xl[1:-1]])
    Y = np.concatenate([yu[::-1], yl[1:-1]])
    return X, Y


def blad_snitt(d, n_snitt=40):
    R = pb.R
    geo = pb.geometri(d)
    m, p, t = NACA[d["profil"]]
    rs = np.concatenate([[HUB_R * 0.8], np.linspace(HUB_R + 0.002, R, n_snitt)])
    x = geo["r"] / R
    chord = np.interp(rs / R, x, geo["chord"] / R) * R
    theta = np.interp(rs, geo["r"], geo["theta"])
    # Smal overgang inn mot navet (nav Ø18 mm), full bredde fra 0.2R
    nav_korde = 1.6 * HUB_R
    inn = rs < 0.2 * R
    chord[inn] = nav_korde + (chord[inn] - nav_korde) * ((rs[inn] - rs[0]) / (0.2 * R - rs[0])) ** 0.7
    snitt = []
    for i, (r, c, th) in enumerate(zip(rs, chord, theta)):
        # Tykkere ved roten for styrke (minst 3 mm), runder tippen
        tt = max(t, min(0.25, 0.003 / c)) if r < 0.35 * R else t
        if r > 0.985 * R:
            c *= 0.6
        X, Y = naca(m, p, tt)
        yl = (0.3 - X) * c          # forkant mot +y (rotasjonsretning), dreieakse på 30 % korde
        zl = Y * c
        y = yl * math.cos(th) - zl * math.sin(th)
        z = yl * math.sin(th) + zl * math.cos(th)
        snitt.append(np.stack([np.full_like(y, r), y, z + HUB_H * 0.55], axis=1))
    return snitt, rs, chord, theta


def mesh_mellom(snitt):
    tri = []
    n = len(snitt[0])
    for a, b in zip(snitt[:-1], snitt[1:]):
        for i in range(n):
            j = (i + 1) % n
            tri.append((a[i], a[j], b[i]))
            tri.append((a[j], b[j], b[i]))
    for s, rev in ((snitt[0], True), (snitt[-1], False)):   # lokk
        c = s.mean(axis=0)
        for i in range(n):
            j = (i + 1) % n
            tri.append((c, s[j], s[i]) if rev else (c, s[i], s[j]))
    return tri


def nav():
    tri = []
    n = 48
    a = np.linspace(0, 2 * math.pi, n + 1)
    for i in range(n):
        for (r, inn) in ((HUB_R, False), (AKSEL_R, True)):
            p1 = np.array([r * math.cos(a[i]), r * math.sin(a[i]), 0])
            p2 = np.array([r * math.cos(a[i + 1]), r * math.sin(a[i + 1]), 0])
            q1, q2 = p1 + [0, 0, HUB_H], p2 + [0, 0, HUB_H]
            if inn:
                tri += [(p1, q1, p2), (p2, q1, q2)]
            else:
                tri += [(p1, p2, q1), (p2, q2, q1)]
        for z, opp in ((0, False), (HUB_H, True)):
            o1 = np.array([HUB_R * math.cos(a[i]), HUB_R * math.sin(a[i]), z])
            o2 = np.array([HUB_R * math.cos(a[i + 1]), HUB_R * math.sin(a[i + 1]), z])
            i1 = np.array([AKSEL_R * math.cos(a[i]), AKSEL_R * math.sin(a[i]), z])
            i2 = np.array([AKSEL_R * math.cos(a[i + 1]), AKSEL_R * math.sin(a[i + 1]), z])
            if opp:
                tri += [(i1, o1, o2), (i1, o2, i2)]
            else:
                tri += [(i1, o2, o1), (i1, i2, o2)]
    return tri


def skriv_stl(fil, tri, speil=False):
    with open(fil, "w") as f:
        f.write("solid propell\n")
        for t in tri:
            pts = [np.array(p, float) * 1000 for p in t]       # mm
            if speil:
                pts = [p * [1, -1, 1] for p in pts][::-1]
            nrm = np.cross(pts[1] - pts[0], pts[2] - pts[0])
            ln = np.linalg.norm(nrm) or 1
            f.write(f" facet normal {nrm[0]/ln:.5f} {nrm[1]/ln:.5f} {nrm[2]/ln:.5f}\n  outer loop\n")
            for p in pts:
                f.write(f"   vertex {p[0]:.4f} {p[1]:.4f} {p[2]:.4f}\n")
            f.write("  endloop\n endfacet\n")
        f.write("endsolid propell\n")


def lag_stl(d):
    snitt, rs, chord, theta = blad_snitt(d)
    tri = nav()
    for k in range(d["blader"]):
        v = 2 * math.pi * k / d["blader"]
        rot = np.array([[math.cos(v), -math.sin(v), 0], [math.sin(v), math.cos(v), 0], [0, 0, 1]])
        tri += mesh_mellom([s @ rot.T for s in snitt])
    skriv_stl(os.path.join(UT, f"propell_{NAVN}_CCW.stl"), tri)
    skriv_stl(os.path.join(UT, f"propell_{NAVN}_CW.stl"), tri, speil=True)
    return rs, chord, theta, len(tri)


# ---------------- Tegninger ----------------
def svg_planform(d, rs, chord, theta):
    W, H, S = 1000, 520, 3.2   # px/mm
    ut = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Helvetica, Arial, sans-serif">',
          f'<rect width="{W}" height="{H}" fill="#fbfaf6"/>',
          f'<text x="30" y="36" font-size="17" font-weight="bold">Propell {NAVN} – bladform (ovenfra) og vridning</text>']
    x0, y0 = 150, 190

    def X(r):
        return x0 + r * 1000 * S

    le = [(X(r), y0 - 0.7 * c * 1000 * S) for r, c in zip(rs, chord)]
    te = [(X(r), y0 + 0.3 * c * 1000 * S) for r, c in zip(rs, chord)]
    pts = " ".join(f"{a:.1f},{b:.1f}" for a, b in le + te[::-1])
    ut.append(f'<polygon points="{pts}" fill="#d9e4ee" stroke="#1f3b57" stroke-width="1.6"/>')
    ut.append(f'<circle cx="{x0}" cy="{y0}" r="{HUB_R * 1000 * S}" fill="#ccc" stroke="#222"/>')
    ut.append(f'<circle cx="{x0}" cy="{y0}" r="{AKSEL_R * 1000 * S}" fill="#fbfaf6" stroke="#222"/>')
    ut.append(f'<line x1="{x0}" y1="{y0}" x2="{X(pb.R)}" y2="{y0}" stroke="#888" stroke-dasharray="5 4"/>')
    ut.append(f'<text x="{X(pb.R)}" y="{y0 + 60}" text-anchor="end" font-size="12" fill="#c0392b">R = {pb.R*1000:.0f} mm (Ø {2*pb.R*1000:.0f} mm)</text>')
    ut.append(f'<text x="{x0 + 30}" y="{y0 - 80}" font-size="12" fill="#555">forkant ↑ (rotasjonsretning)</text>')
    # Tabell
    ty = 300
    ut.append(f'<text x="30" y="{ty}" font-size="13" font-weight="bold">r (mm)</text>')
    ut.append(f'<text x="30" y="{ty + 22}" font-size="13" font-weight="bold">korde (mm)</text>')
    ut.append(f'<text x="30" y="{ty + 44}" font-size="13" font-weight="bold">vinkel (°)</text>')
    for i, (r, c, th) in enumerate(zip(rs, chord, theta)):
        if i % 4 and i != len(rs) - 1:
            continue
        xx = X(r)
        ut.append(f'<line x1="{xx:.1f}" y1="{y0 + 45}" x2="{xx:.1f}" y2="{ty - 14}" stroke="#ddd"/>')
        for k, v in enumerate((r * 1000, c * 1000, math.degrees(th))):
            ut.append(f'<text x="{xx:.1f}" y="{ty + 22 * k}" font-size="12" text-anchor="middle">{v:.1f}</text>')
    info = (f'{d["blader"]} blader · profil {d["profil"]} (≈ NACA {"%d%d%02d" % (NACA[d["profil"]][0]*100, NACA[d["profil"]][1]*10, NACA[d["profil"]][2]*100)}) · '
            f'{d["materiale"]} · nav Ø{HUB_R*2000:.0f} × {HUB_H*1000:.0f} mm, aksel Ø{AKSEL_R*2000:.0f} mm')
    ut.append(f'<text x="30" y="{H - 40}" font-size="13">{info}</text>')
    ut.append("</svg>")
    with open(os.path.join(UT, f"propell_{NAVN}_planform.svg"), "w") as f:
        f.write("\n".join(ut))


def svg_ytelse(d):
    W, H = 760, 460
    ml, mb, mt, mr = 70, 60, 50, 30
    Ts = np.linspace(0.5, 2.0, 16) * pb.T_SVEV
    p_ref_ = [p_ref(T) for T in Ts]
    p_ny = [pb.svev(d, T)["P"] for T in Ts]
    pmax = max(p_ref_) * 1.05

    def X(T):
        return ml + (T - Ts[0]) / (Ts[-1] - Ts[0]) * (W - ml - mr)

    def Y(P):
        return H - mb - P / pmax * (H - mb - mt)

    ut = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Helvetica, Arial, sans-serif">',
          f'<rect width="{W}" height="{H}" fill="#fbfaf6"/>',
          f'<text x="{ml}" y="30" font-size="16" font-weight="bold">Effekt som trengs for skyvkraft (modell, sveving)</text>']
    for k in range(0, int(pmax) + 1, 20):
        ut.append(f'<line x1="{ml}" y1="{Y(k):.1f}" x2="{W - mr}" y2="{Y(k):.1f}" stroke="#e5e3dc"/>')
        ut.append(f'<text x="{ml - 8}" y="{Y(k) + 4:.1f}" font-size="11" text-anchor="end" fill="#555">{k} W</text>')
    for T in np.arange(2, Ts[-1] + 0.1, 1):
        ut.append(f'<text x="{X(T):.1f}" y="{H - mb + 18}" font-size="11" text-anchor="middle" fill="#555">{T:.0f} N</text>')
    ut.append(f'<line x1="{X(pb.T_SVEV):.1f}" y1="{mt}" x2="{X(pb.T_SVEV):.1f}" y2="{H - mb}" stroke="#999" stroke-dasharray="4 4"/>')
    ut.append(f'<text x="{X(pb.T_SVEV) + 6:.1f}" y="{mt + 14}" font-size="11" fill="#555">sveving 1,6 kg drone</text>')
    for data, farge, navn, dy in ((p_ref_, "#b0563c", "vanlig 10x4.5", 0), (p_ny, "#1f6fb2", f"{NAVN} (ny)", 18)):
        pts = " ".join(f"{X(T):.1f},{Y(P):.1f}" for T, P in zip(Ts, data))
        ut.append(f'<polyline points="{pts}" fill="none" stroke="{farge}" stroke-width="2.5"/>')
        ut.append(f'<text x="{W - mr - 120}" y="{H - mb - 60 + dy}" font-size="13" fill="{farge}" font-weight="bold">— {navn}</text>')
    g = 100 * (p_ref_[5] / p_ny[5] - 1)
    ut.append(f'<text x="{ml}" y="{H - 14}" font-size="12" fill="#555">Skyvkraft per propell. Lavere kurve = mindre strøm for samme løft.</text>')
    ut.append("</svg>")
    with open(os.path.join(UT, f"propell_{NAVN}_ytelse.svg"), "w") as f:
        f.write("\n".join(ut))
    return g


def main():
    global NAVN
    # Valgfritt argument: diameter i tommer, f.eks. 10.5 (samme bladform skalert).
    if len(sys.argv) > 1:
        tommer = float(sys.argv[1])
        pb.R = tommer * 0.0254 / 2
        NAVN = f"P1-{tommer:g}in".replace(".", "_")
    d = last_beste()
    rader, sens = robusthet(d)
    rs, chord, theta, n_tri = lag_stl(d)
    svg_planform(d, rs, chord, theta)
    svg_ytelse(d)
    with open(os.path.join(UT, f"geometri_{NAVN}.csv"), "w") as f:
        f.write("r_mm,korde_mm,vinkel_grader\n")
        for r, c, th in zip(rs, chord, theta):
            f.write(f"{r*1000:.2f},{c*1000:.2f},{math.degrees(th):.2f}\n")
    print("Design:", json.dumps(d, ensure_ascii=False))
    print("\nGevinst over driftsområdet (mindre effekt for samme skyvkraft):")
    for navn, g, p_ny, p_ref in rader:
        print(f"  {navn:24s} {g:5.1f} %   ({p_ref:.1f} W -> {p_ny:.1f} W)")
    print("\nFølsomhet:")
    for navn, g in sens:
        print(f"  {navn:44s} {g:5.1f} %")
    print(f"\nSTL: {n_tri} trekanter. Skrev filer for {NAVN} (Ø {2 * pb.R * 1000:.0f} mm)")


if __name__ == "__main__":
    main()
