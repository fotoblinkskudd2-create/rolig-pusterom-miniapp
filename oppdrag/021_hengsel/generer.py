"""Genererer deler, sammenstilling, kontroller og bilder.
    python3 generer.py [--diametre 3 4 5] [--uten-render]"""
import argparse
import json
import os
import sys

import cadquery as cq

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HER, ".."))
import hengsel as H  # noqa: E402
from felles import cad  # noqa: E402


def generer(d, ut, render=True):
    p = H.les(akseldiameter=d)
    deler = H.lag(p)
    mappe = os.path.join(ut, f"aksel_{d:g}mm")
    rapport = {"akseldiameter": d, "knokeradius": p["R"], "deler": {}, "bevegelse": []}
    for navn, o in deler.items():
        step, stl = cad.eksporter(navn, o, mappe)
        rapport["deler"][navn] = {"legeme": cad.kontroller_legeme(o), "stl": cad.stl_tett(stl), "step": cad.step_rundtur(step, cad.form(o).Volume()), "mal": cad.bbox(o)}
    # Sammenstilling ved θ = 90°
    asm = cq.Assembly(name=f"hengsel_{d:g}mm")
    asm.add(deler["blad_a"], name="blad_a", color=cq.Color(0.55, 0.6, 0.65))
    asm.add(H.roter_b(deler["blad_b_flat"], 90), name="blad_b", color=cq.Color(0.8, 0.5, 0.25))
    asm.add(deler["aksling"], name="aksling", color=cq.Color(0.3, 0.3, 0.3))
    asm.save(os.path.join(mappe, "sammenstilling_90grader.step"))
    vinkler = list(range(0, int(p["stoppvinkel"]) + 1, 5))
    for th in vinkler + [p["stoppvinkel"] + 1, p["stoppvinkel"] + 5]:
        b = H.roter_b(deler["blad_b_flat"], th)
        rapport["bevegelse"].append({"theta": th, "a_b": round(cad.kollisjon(deler["blad_a"], b), 4), "aksling_b": round(cad.kollisjon(deler["aksling"], b), 4)})
    rapport["aksling_a"] = round(cad.kollisjon(deler["aksling"], deler["blad_a"]), 6)
    rapport["parametre"] = p
    json.dump(rapport, open(os.path.join(mappe, "rapport.json"), "w"), indent=1, default=float)
    if render:
        bilder(deler, p, mappe)
    return rapport


def bilder(deler, p, mappe):
    farger = {"blad_a": [0.55, 0.6, 0.66], "blad_b": [0.85, 0.5, 0.2], "aksling": [0.25, 0.25, 0.28]}
    rammer = []
    for th in (0, 40, 80, 120):
        stl = os.path.join(mappe, f"blad_b_{th}.stl")
        cq.exporters.export(H.roter_b(deler["blad_b_flat"], th), stl, tolerance=0.02)
        ut = os.path.join(mappe, f"bevegelse_{th:03d}.png")
        cad.render({"utfil": ut, "bredde": 800, "hoyde": 600, "samples": 24, "kamera": {"retning": [0.9, -1.0, 0.9]},
                    "objekter": [{"fil": os.path.join(mappe, "blad_a.stl"), "farge": farger["blad_a"], "metall": 0.6},
                                 {"fil": stl, "farge": farger["blad_b"], "metall": 0.6},
                                 {"fil": os.path.join(mappe, "aksling.stl"), "farge": farger["aksling"], "metall": 0.9}]}, ut + ".json")
        rammer.append(ut)
        os.remove(stl)
        os.remove(ut + ".json")
    from PIL import Image, ImageDraw
    bilder = []
    for f, th in zip(rammer, (0, 40, 80, 120)):
        im = Image.open(f).convert("RGB")
        ImageDraw.Draw(im).text((20, 20), f"theta = {th} grader" + (" (stopp)" if th == 120 else ""), fill=(0, 0, 0))
        bilder.append(im)
    bilder[0].save(os.path.join(mappe, "bevegelse.gif"), save_all=True, append_images=bilder[1:] + bilder[-2:0:-1], duration=600, loop=0)
    # Eksplodert visning: delene trukket fra hverandre langs aksen og på tvers
    ut = os.path.join(mappe, "eksplodert.png")
    stl_b = os.path.join(mappe, "blad_b_eksp.stl")
    cq.exporters.export(H.roter_b(deler["blad_b_flat"], 150), stl_b, tolerance=0.02)
    cad.render({"utfil": ut, "bredde": 1200, "hoyde": 800, "samples": 32, "kamera": {"retning": [0.6, -1.0, 0.8]},
                "objekter": [{"fil": os.path.join(mappe, "blad_a.stl"), "farge": farger["blad_a"], "posisjon": [0, -18, 0], "metall": 0.6},
                             {"fil": stl_b, "farge": farger["blad_b"], "posisjon": [0, 18, 0], "metall": 0.6},
                             {"fil": os.path.join(mappe, "aksling.stl"), "farge": farger["aksling"], "posisjon": [-55, 0, 0], "metall": 0.9}]}, ut + ".json")
    os.remove(stl_b)
    os.remove(ut + ".json")


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("--diametre", nargs="+", type=float, default=[3, 4, 5])
    a.add_argument("--uten-render", action="store_true")
    a.add_argument("--ut", default=os.path.join(HER, "resultat"))
    arg = a.parse_args()
    for d in arg.diametre:
        r = generer(d, arg.ut, render=(not arg.uten_render and d == 4))
        print(d, "mm:", {n: v["legeme"]["ok"] for n, v in r["deler"].items()})
