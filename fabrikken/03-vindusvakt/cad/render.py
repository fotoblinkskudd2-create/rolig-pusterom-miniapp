#!/usr/bin/env python3
"""Vindusvakt CAD-pipeline: STL-eksport, kontroll (tett, volum, masse), renders med ekte bakskjerm.

    cd cad && python3 render.py
"""
import json
import subprocess
import warnings
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

warnings.filterwarnings("ignore")
import trimesh  # noqa: E402

HER = Path(__file__).resolve().parent
OUT, REN = HER / "out", HER / "render"
OUT.mkdir(exist_ok=True)
REN.mkdir(exist_ok=True)
SKJERM = HER.parent / "render" / "skjerm-oslo-1.png"
PETG = 1.27  # g/cm³
STAAL = 7.85


def scad(args, out):
    subprocess.run(["xvfb-run", "-a", "openscad", *args, "-o", str(out), str(HER / "vindusvakt.scad")],
                   check=True, capture_output=True)


def eksporter():
    rapport = {}
    for d in ["front", "bakdeksel", "fot", "linsedeksel", "knapp"]:
        stl = OUT / f"{d}.stl"
        scad(["-D", f'del="{d}"', "--export-format", "binstl"], stl)
        m = trimesh.load(stl)
        ext = m.bounding_box.extents
        rapport[d] = {
            "tett": bool(m.is_watertight),
            "volum_cm3": round(m.volume / 1000, 1),
            "masse_g_petg": round(m.volume / 1000 * PETG, 1),
            "boks_mm": [round(float(x), 1) for x in ext],
            "trekanter": int(len(m.faces)),
        }
        print(d, rapport[d])

    (OUT / "rapport.json").write_text(json.dumps(rapport, indent=2, ensure_ascii=False))
    return rapport


def perspektiv_koeff(dst, src):
    """Koeffisienter for PIL PERSPECTIVE: avbilder output-punkt (dst) til input-punkt (src)."""
    a = []
    for (x, y), (u, v) in zip(dst, src):
        a.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        a.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    b = np.array([c for p in src for c in p], dtype=float)
    return np.linalg.solve(np.array(a, dtype=float), b).tolist()


def legg_inn_skjerm(bilde: Path, maske: Path):
    img = Image.open(bilde).convert("RGB")
    m = np.asarray(Image.open(maske).convert("RGB")).astype(int)
    hit = (m[:, :, 0] - m[:, :, 1] > 70) & (m[:, :, 2] - m[:, :, 1] > 70) & (np.abs(m[:, :, 0] - m[:, :, 2]) < 60)
    if hit.sum() < 500:
        return False
    ys, xs = np.nonzero(hit)
    s, d = xs + ys, xs - ys
    tl = (xs[s.argmin()], ys[s.argmin()])
    br = (xs[s.argmax()], ys[s.argmax()])
    tr = (xs[d.argmax()], ys[d.argmax()])
    bl = (xs[d.argmin()], ys[d.argmin()])
    skjerm = Image.open(SKJERM).convert("RGB")
    w, h = skjerm.size
    koeff = perspektiv_koeff([tl, tr, br, bl], [(0, 0), (w, 0), (w, h), (0, h)])
    lag = skjerm.transform(img.size, Image.PERSPECTIVE, koeff, Image.BICUBIC)
    # lett skygge fra rammen + litt papirmatt
    alfa = Image.fromarray((hit * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    img.paste(lag, (0, 0), alfa)
    img.save(bilde)
    return True


VISNINGER = [
    ("1-helt", "samlet", (78, 0, 22), True),
    ("2-front", "samlet", (90, 0, 0), True),
    ("3-bak", "bak", (80, 0, 215), False),
    ("4-side", "samlet", (90, 0, 90), False),
    ("5-eksplodert", "eksplodert", (70, 0, 30), True),
    ("6-lukket", "bak", (80, 0, 215), False),
]


def renders():
    for navn, d, (rx, ry, rz), skjerm in VISNINGER:
        cam = f"--camera=0,0,0,{rx},{ry},{rz},0"
        felles = ["-D", f'del="{d}"', cam, "--viewall", "--autocenter", "--imgsize=1800,1350", "--colorscheme=Tomorrow"]
        if navn == "6-lukket":
            felles += ["-D", "linse_aapen=false"]
        ut = REN / f"cad-{navn}.png"
        scad(felles, ut)
        if skjerm:
            mk = REN / f"_maske-{navn}.png"
            scad(felles + ["-D", "maske=true"], mk)
            legg_inn_skjerm(ut, mk)
            mk.unlink()
        print("render", ut.name)


if __name__ == "__main__":
    eksporter()
    renders()
