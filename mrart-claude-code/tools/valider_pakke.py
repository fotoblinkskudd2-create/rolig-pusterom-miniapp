#!/usr/bin/env python3
"""Kontrollerer pakken: 50 skills med gyldig frontmatter og påkrevde seksjoner, agenter, hooks og JSON."""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KREV = ["## Hvorfor høy verdi", "## Fremgangsmåte", "## Leveranse", "## Ferdigkrav", "## Stopp", "/goal "]
feil = []
sk = os.path.join(ROOT, ".claude", "skills")
navn, nr = set(), set()
for d in sorted(os.listdir(sk)):
    p = os.path.join(sk, d, "SKILL.md")
    if not os.path.isfile(p):
        feil.append(f"mangler SKILL.md i {d}"); continue
    t = open(p, encoding="utf-8").read()
    if not t.startswith("---\n"):
        feil.append(f"{d}: frontmatter må starte på linje 1")
    m = re.search(r"^name: (.+)$", t, re.M)
    if not m or m.group(1).strip() != d:
        feil.append(f"{d}: name matcher ikke mappe")
    navn.add(d)
    n = re.search(r"^  nr: (\d+)$", t, re.M)
    if n: nr.add(int(n.group(1)))
    for k in KREV:
        if k not in t:
            feil.append(f"{d}: mangler '{k}'")
    for lenke in re.findall(r"\]\((https?://[^)]+)\)", t):
        if " " in lenke:
            feil.append(f"{d}: ugyldig lenke {lenke}")
if len(navn) != 50: feil.append(f"forventet 50 skills, fant {len(navn)}")
if nr != set(range(1, 51)): feil.append("nummerering 1–50 er ikke komplett")
ag = os.path.join(ROOT, ".claude", "agents")
for f in os.listdir(ag):
    t = open(os.path.join(ag, f), encoding="utf-8").read()
    if not re.search(r"^name: ", t, re.M) or not re.search(r"^description: ", t, re.M):
        feil.append(f"agent {f}: mangler name/description")
for j in (".claude/settings.json", ".mcp.json"):
    try: json.load(open(os.path.join(ROOT, j)))
    except Exception as e: feil.append(f"{j}: {e}")
for h in ("portvakt.py", "hemmelighetsvakt.py", "agentlogg.py", "oppstart.py"):
    if not os.path.isfile(os.path.join(ROOT, ".claude", "hooks", h)): feil.append(f"mangler hook {h}")
print("\n".join(feil) if feil else f"PAKKE OK: {len(navn)} skills, {len(os.listdir(ag))} agenter, 4 hooks")
sys.exit(1 if feil else 0)
