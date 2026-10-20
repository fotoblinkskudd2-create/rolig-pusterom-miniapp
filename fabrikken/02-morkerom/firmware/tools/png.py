#!/usr/bin/env python3
"""PBM → PNG med e-blekk-farger (2× skala). Brukes for alle Mørkerom-skjermbilder."""
import sys
from pathlib import Path

from PIL import Image

PAPIR, BLEKK = (231, 229, 222), (30, 30, 28)
inn, ut = Path(sys.argv[1]), Path(sys.argv[2])
ut.mkdir(parents=True, exist_ok=True)
for p in sorted(inn.glob("*.pbm")):
    im = Image.open(p).convert("L")
    rgb = Image.merge("RGB", [im.point(lambda v, i=i: PAPIR[i] if v > 127 else BLEKK[i]) for i in range(3)])
    rgb.resize((im.width * 2, im.height * 2), Image.NEAREST).save(ut / f"skjerm-{p.stem}.png")
    print("skrev", ut / f"skjerm-{p.stem}.png")
