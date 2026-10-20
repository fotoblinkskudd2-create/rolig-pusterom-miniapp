#!/usr/bin/env python3
"""Lager demo-logg (JSON Lines) og renderer alle skjermbilder som PNG med e-blekk-farger.

    python3 tools/demo.py   (fra firmware/, etter make render)
"""
import json
import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT.parent / "render"
OUT.mkdir(exist_ok=True)
H = 3600_000
NAA = 1792503660000  # tir 20.10.2026 15:41 Oslo

ev = []
nid = [1]


def e(t, ts, **kw):
    if "dl" in kw:
        kw["del"] = kw.pop("dl")
    d = {"t": t, "ts": ts, **kw}
    if t in ("ho", "kj", "ff"):
        d["id"] = nid[0]
        nid[0] += 1
    ev.append(d)
    return d.get("id")


# En uke med spor
for dager in range(7, 1, -1):
    for t in (8, 12, 17, 21):
        e("her", NAA - dager * 24 * H - (15 - t) * H, dl="")
e("ff", NAA - 9 * 24 * H, navn="Klarna", ore=141200, dato=20261028, mnd=True)
e("ff", NAA - 9 * 24 * H, navn="Strøm", ore=98000, dato=20261105, mnd=False)
for i, (ting, ore) in enumerate([("Kaffemaskin", 249000), ("Lego 21348", 189900), ("Hodetelefoner", 100000)]):
    kid = e("kj", NAA - (20 - i * 3) * 24 * H, ting=ting, ore=ore, butikk="", dl="ukjent del")
    e("kv", NAA - (17 - i * 3) * 24 * H, id=kid, valg="dropp")
e("ho", NAA - 30 * H, dl="Vakta", tekst="Spist. Gått tur til butikken. Ingen kjøp i dag. Sov tidlig.")
e("her", NAA - 26 * H, dl="Vakta")
lego = e("kj", NAA - 50 * H, ting="Lego 10316 Rivendell", ore=189900, butikk="Komplett", dl="ukjent del")
e("her", NAA - (21 * H + 31 * 60_000), dl="")  # i går 18:10
e("her", NAA - (6 * H + 11 * 60_000), dl="")   # i dag 09:30
e("kj", NAA - 6 * H, ting="Robotstøvsuger", ore=349000, butikk="Elkjøp", dl="ukjent del")
e("ho", NAA - (1 * H + 39 * 60_000), dl="ukjent del",
  tekst="Kjøpte Lego på Klarna. Beklager. Den kommer torsdag. Ikke åpne før du har spist.")
e("kj", NAA - 5 * H, ting="Objektiv 35 mm f/1.8", ore=649000, butikk="Japan Photo", dl="Lille")
e("her", NAA - 2 * 60_000, dl="")
ev.sort(key=lambda d: d["ts"])

logg = ROOT / "build" / "demo.jsonl"
logg.write_text("\n".join(json.dumps(d, ensure_ascii=False) for d in ev) + "\n", encoding="utf-8")

PAPIR = (231, 229, 222)
BLEKK = (30, 30, 28)


def png(pbm: Path, dest: Path, skala=2):
    img = Image.open(pbm).convert("L")
    rgb = Image.new("RGB", img.size)
    px, out = img.load(), rgb.load()
    for y in range(img.size[1]):
        for x in range(img.size[0]):
            out[x, y] = PAPIR if px[x, y] > 127 else BLEKK
    rgb.resize((img.size[0] * skala, img.size[1] * skala), Image.NEAREST).save(dest)


sider = [("0", "1-oversikt"), ("1", "2-noter"), ("2", "3-kjolerom"), ("3", "4-tidslinje"),
         ("velkommen", "5-velkommen"), ("qr", "6-koble-til"), ("reset", "7-reset")]
for side, navn in sider:
    pbm = ROOT / "build" / f"{navn}.pbm"
    subprocess.run([str(ROOT / "build" / "render"), str(logg), str(NAA), side, str(pbm), str(15 * H + 20 * 60_000)], check=True)
    png(pbm, OUT / f"skjerm-{navn}.png")
    print("skrev", OUT / f"skjerm-{navn}.png")
