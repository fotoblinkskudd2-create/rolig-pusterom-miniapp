#!/usr/bin/env python3
"""KIMI-100.md -> kimi-100.html. Ingen avhengigheter. Kjør: python3 build.py"""
import json, re, sys
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "KIMI-100.md"
OUT = HERE / "kimi-100.html"

GROUPS = [
    (1, "Verk og fokus"), (11, "Agentfabrikk"), (21, "CAD og mekanikk"),
    (31, "Superkalkulatorer"), (41, "NaturFlyr"), (51, "Omsorg"),
    (61, "Helse og familie"), (71, "Forretning"), (81, "Oppfinner"),
    (91, "Kreativt"),
]

def group_of(n):
    name = GROUPS[0][1]
    for start, g in GROUPS:
        if n >= start:
            name = g
    return name

md = SRC.read_text(encoding="utf-8")
pat = re.compile(r"^## (\d{2,3}) · (.+?)\n\n```\n(.*?)\n```", re.M | re.S)
items = [{"n": int(n), "id": n, "title": t.strip(), "body": b, "group": group_of(int(n))}
         for n, t, b in pat.findall(md)]

ns = [i["n"] for i in items]
if ns != list(range(1, 101)):
    sys.exit(f"FEIL: forventet 01–100 i rekkefølge, fant {len(ns)} oppdrag")

data = json.dumps(items, ensure_ascii=False).replace("</", "<\\/")
html = (HERE / "template.html").read_text(encoding="utf-8").replace("/*__DATA__*/[]", data)
OUT.write_text(html, encoding="utf-8")
print(f"OK: {len(items)} oppdrag -> {OUT.name}")
