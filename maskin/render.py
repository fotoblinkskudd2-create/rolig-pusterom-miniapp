"""Gjør tegninger og 3D-modeller om til bilder og printbare filer.

  python3 -m maskin.render tegning.svg            -> tegning.png  (krever node + playwright)
  python3 -m maskin.render modell.scad            -> modell.stl + modell.png  (krever openscad)
  python3 -m maskin.render modell.scad -D 'DEL="hode"' --navn hode
"""
import argparse
import os
import re
import shutil
import subprocess

JS = """
const {chromium} = require('playwright');
(async () => {
  const [svg, png] = process.argv.slice(-2);
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + svg);
  const box = await p.evaluate(() => {
    const s = document.querySelector('svg');
    return {w: Math.ceil(s.width.baseVal.value || 1000), h: Math.ceil(s.height.baseVal.value || 700)};
  });
  await p.setViewportSize({width: box.w, height: box.h});
  await p.screenshot({path: png});
  await b.close();
})();
"""


def svg_til_png(svg):
    svg = os.path.abspath(svg)
    png = svg[:-4] + ".png"
    subprocess.run(["node", "-e", JS, svg, png], check=True)
    return png


def scad(fil, defs=(), navn=None):
    if not shutil.which("openscad"):
        raise SystemExit("openscad mangler. Installer: apt-get install -y openscad (eller openscad.org)")
    base = os.path.splitext(fil)[0] + (f"_{navn}" if navn else "")
    d = []
    for x in defs:
        d += ["-D", x]
    subprocess.run(["openscad", "-q", *d, "-o", base + ".stl", fil], check=True)
    vis = ["xvfb-run", "-a"] if shutil.which("xvfb-run") and not os.environ.get("DISPLAY") else []
    subprocess.run([*vis, "openscad", "-q", *d, "--imgsize=1400,800", "--viewall", "--autocenter",
                    "--camera=0,0,0,55,0,25,0", "--colorscheme=Tomorrow", "-o", base + ".png", fil], check=True)
    return base + ".stl", base + ".png"


def main():
    p = argparse.ArgumentParser(prog="python3 -m maskin.render")
    p.add_argument("fil")
    p.add_argument("-D", action="append", default=[], help="OpenSCAD-variabel, f.eks. 'DEL=\"hode\"'")
    p.add_argument("--navn", help="suffiks på filnavn")
    a = p.parse_args()
    if a.fil.endswith(".svg"):
        print("Skrev", svg_til_png(a.fil))
    elif a.fil.endswith(".scad"):
        print("Skrev", *scad(a.fil, a.D, a.navn and re.sub(r"\W", "_", a.navn)))
    else:
        raise SystemExit("Støtter .svg og .scad")


if __name__ == "__main__":
    main()
