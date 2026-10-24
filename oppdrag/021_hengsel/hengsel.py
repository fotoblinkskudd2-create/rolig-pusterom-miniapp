"""Parametrisk hengsel: blad A (fast), blad B (roterer om X-aksen), utskiftbar aksling med hode, mekanisk stopp på blad A.

Vinkelkonvensjon: θ = vinkel mellom bladene. θ = 0 lukket (B ligger over A), θ = 180 flatt.
B roteres om +X med φ = 180 − θ fra flat stilling. Gyldig bevegelsesområde: 0 ≤ θ ≤ stoppvinkel.
Stoppet er et utspring på A sine ytterste knoker som B sitt blad treffer når θ når stoppvinkelen.
Alle mål i mm. Geometrien er ikke styrkeberegnet.
"""
import json
import math
import os

import cadquery as cq

HER = os.path.dirname(os.path.abspath(__file__))


def les(sti=os.path.join(HER, "parametre.json"), **overstyr):
    p = {k: v for k, v in json.load(open(sti, encoding="utf-8")).items() if not k.startswith("_")}
    p.update(overstyr)
    p["R"] = p["akseldiameter"] / 2 + p["klaring"] + p["veggtykkelse_knoke"]  # knokens ytre radius
    return p


def segmenter(p):
    n, L, g = p["antall_knoker"], p["bladlengde"], p["knokegap"]
    s = (L - g * (n - 1)) / n
    return [(i * (s + g), i * (s + g) + s) for i in range(n)]


def sylinder_x(r, x0, x1):
    return cq.Workplane("YZ").workplane(offset=x0).circle(r).extrude(x1 - x0)


def blad_flat(p, eier):
    """Blad i flat stilling. eier 'A' peker mot −Y, 'B' mot +Y. Bladet tangerer knokens underside."""
    L, W, t, R = p["bladlengde"], p["bladbredde"], p["bladtykkelse"], p["R"]
    seg = segmenter(p)
    mine = [s for i, s in enumerate(seg) if (i % 2 == 0) == (eier == "A")]
    andre = [s for i, s in enumerate(seg) if (i % 2 == 0) != (eier == "A")]
    y0 = -W if eier == "A" else 0
    plate = cq.Workplane("XY").box(L, W, t, centered=False).translate((0, y0, -R))
    for a, b in mine:
        plate = plate.union(sylinder_x(R, a, b))
    hull = p["akseldiameter"] / 2 + p["klaring"]
    plate = plate.cut(sylinder_x(hull, -1, L + 1))
    for a, b in andre:  # frirom rundt motpartens knoker
        plate = plate.cut(sylinder_x(R + p["klaring"], a - p["knokegap"] / 2, b + p["knokegap"] / 2))
    return plate


def roter_b(b_flat, theta):
    return b_flat.rotate((0, 0, 0), (1, 0, 0), 180 - theta)


def stopp(p):
    """Utspring på A sine ytterste knoker. Konstruksjon: ring (r fra R−0,3 til R+3) ∩ halvrommet bak B-bladets
    underside i stoppstilling (lokal z' < −R i B-rammen ved θ = stoppvinkel) ∩ over A-bladets underside (z ≥ −R).
    B når dette volumet først når θ passerer stoppvinkelen; for θ ≤ stoppvinkel er det fritt (kontrolleres numerisk)."""
    R, phi = p["R"], 180 - p["stoppvinkel"]
    ut = None
    for a, b in (segmenter(p)[0], segmenter(p)[-1]):
        ring = sylinder_x(R + 3, a, b).cut(sylinder_x(R - 0.3, a - 1, b + 1))
        halvrom = cq.Workplane("XY").box(b - a + 2, 40, 20, centered=False).translate((a - 1, -10, -R - 20)).rotate((0, 0, 0), (1, 0, 0), phi)
        over_a = cq.Workplane("XY").box(b - a + 2, 40, 20, centered=False).translate((a - 1, -20, -R))
        bit = ring.intersect(halvrom).intersect(over_a)
        # Krage som binder klossen til knoken; ligger innenfor B sitt frirom (r < R + klaring), så B når den aldri
        krage = sylinder_x(R + p["klaring"] - 0.05, a, b).cut(sylinder_x(R - 0.3, a - 1, b + 1))
        halvrom2 = cq.Workplane("XY").box(b - a + 2, 40, 20, centered=False).translate((a - 1, -10, -R - 18.5)).rotate((0, 0, 0), (1, 0, 0), phi)
        bit = bit.union(krage.intersect(halvrom2).intersect(over_a))
        ut = bit if ut is None else ut.union(bit)
    return ut


def aksling(p):
    L, d = p["bladlengde"], p["akseldiameter"]
    stamme = sylinder_x(d / 2, -p["akselhode_lengde"], L + 0.8)
    hode = sylinder_x(p["akselhode_diameter"] / 2, -p["akselhode_lengde"], 0 - 0.15)
    return stamme.union(hode)


def lag(p):
    a = blad_flat(p, "A")
    b = blad_flat(p, "B")
    a = a.union(stopp(p)).cut(sylinder_x(p["akseldiameter"] / 2 + p["klaring"], -1, p["bladlengde"] + 1))
    return {"blad_a": a, "blad_b_flat": b, "aksling": aksling(p)}
