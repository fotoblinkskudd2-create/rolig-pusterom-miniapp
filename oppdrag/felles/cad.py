"""Felles CadQuery-hjelpere: eksport, legemekontroll, STEP-rundtur, kollisjon og målrapport.
Enheter: millimeter."""
import json
import os

import cadquery as cq
from OCP.BRepCheck import BRepCheck_Analyzer


def form(x):
    return x.val() if isinstance(x, cq.Workplane) else x


def eksporter(navn, objekt, mappe):
    os.makedirs(mappe, exist_ok=True)
    s = form(objekt)
    step, stl = os.path.join(mappe, navn + ".step"), os.path.join(mappe, navn + ".stl")
    cq.exporters.export(cq.Workplane().add(s), step)
    cq.exporters.export(cq.Workplane().add(s), stl, tolerance=0.02, angularTolerance=0.1)
    return step, stl


def kontroller_legeme(objekt):
    """Gyldig BRep, minst ett legeme, alle skall lukket, positivt volum."""
    s = form(objekt)
    solids = s.Solids()
    lukket = all(sh.Closed() for so in solids for sh in so.Shells())
    return {"gyldig": bool(BRepCheck_Analyzer(s.wrapped).IsValid()), "legemer": len(solids), "lukket": lukket and bool(solids),
            "volum": s.Volume(), "ok": bool(BRepCheck_Analyzer(s.wrapped).IsValid()) and lukket and bool(solids) and s.Volume() > 0}


def stl_tett(sti):
    import trimesh
    m = trimesh.load(sti, force="mesh")
    return {"vanntett": bool(m.is_watertight), "volum": float(abs(m.volume)), "trekanter": int(len(m.faces))}


def step_rundtur(sti, forventet_volum, rel_tol=1e-3):
    """Åpner eksportert STEP igjen og sammenligner volum."""
    s = cq.importers.importStep(sti).val()
    v = s.Volume()
    return {"apnet": True, "volum": v, "avvik_rel": abs(v - forventet_volum) / forventet_volum, "ok": abs(v - forventet_volum) / forventet_volum < rel_tol}


def kollisjon(a, b):
    """Volum av overlapp mellom to legemer (0 = ingen kollisjon). Berøring (felles flate) gir 0."""
    try:
        return form(a).intersect(form(b)).Volume()
    except Exception:
        return 0.0


def bbox(objekt):
    bb = form(objekt).BoundingBox()
    return {"x": round(bb.xlen, 4), "y": round(bb.ylen, 4), "z": round(bb.zlen, 4), "min": [round(bb.xmin, 4), round(bb.ymin, 4), round(bb.zmin, 4)]}


def render(spec, spec_sti):
    """Skriver render-spesifikasjon og kjører felles/render.py i egen prosess (bpy og OCC i hver sin prosess)."""
    import subprocess
    import sys
    with open(spec_sti, "w", encoding="utf-8") as f:
        json.dump(spec, f, indent=1)
    p = subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), "render.py"), spec_sti], capture_output=True, text=True, timeout=900)
    if p.returncode or not os.path.exists(spec["utfil"]):
        raise RuntimeError("render feilet: " + p.stdout[-800:] + p.stderr[-800:])
    return spec["utfil"]
