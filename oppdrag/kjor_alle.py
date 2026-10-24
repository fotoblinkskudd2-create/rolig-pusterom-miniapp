#!/usr/bin/env python3
"""Kjører kontrollene i alle oppdragsmapper og skriver KONTROLLRESULTATER.md.

    python3 kjor_alle.py            # alle
    python3 kjor_alle.py 1 7 21     # utvalgte nummer
"""
import glob
import json
import os
import subprocess
import sys
import time

ROT = os.path.dirname(os.path.abspath(__file__))


def main():
    valgt = {int(a) for a in sys.argv[1:]}
    rader = []
    for meta_sti in sorted(glob.glob(os.path.join(ROT, "[0-9][0-9][0-9]_*", "oppdrag.json"))):
        mappe = os.path.dirname(meta_sti)
        meta = json.load(open(meta_sti, encoding="utf-8"))
        if valgt and meta["nr"] not in valgt:
            continue
        resultater = []
        for kmd in meta["kontroll"]:
            t0 = time.time()
            p = subprocess.run(kmd, shell=True, cwd=mappe, capture_output=True, text=True, timeout=1800)
            sammendrag = [l for l in p.stdout.splitlines() if "bestått" in l and "feilet" in l]
            resultater.append((kmd, p.returncode, sammendrag[-1] if sammendrag else "", time.time() - t0))
            print(f"{meta['nr']:3d} {kmd:40s} exit={p.returncode} {sammendrag[-1] if sammendrag else ''}")
            if p.returncode:
                print(p.stdout[-2000:], p.stderr[-2000:])
        rader.append((meta, os.path.basename(mappe), resultater))
    if valgt:
        return
    with open(os.path.join(ROT, "KONTROLLRESULTATER.md"), "w", encoding="utf-8") as f:
        f.write(f"# Kontrollresultater\n\nKjørt {time.strftime('%Y-%m-%d %H:%M')} med `python3 kjor_alle.py`.\n\n")
        f.write("| Nr | Oppdrag | Kontroll | Exit | Resultat |\n|---|---|---|---|---|\n")
        for meta, mappe, res in rader:
            for kmd, kode, s, _ in res:
                f.write(f"| {meta['nr']} | [{meta['tittel']}]({mappe}/README.md) | `{kmd}` | {kode} | {s} |\n")


if __name__ == "__main__":
    main()
