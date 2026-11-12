#!/usr/bin/env python3
"""SessionStart-hook: legger NESTE og kosttak inn i konteksten (stdout blir kontekst)."""
import os, sys
root = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
ut = []
for navn, tittel in (("NESTE.md", "NESTE (operatørens siste ordre)"), ("kosttak.txt", "KOSTTAK")):
    p = os.path.join(root, ".mrart", navn)
    if os.path.exists(p):
        with open(p, encoding="utf-8") as f:
            innhold = f.read().strip()
        if innhold:
            ut.append(f"## {tittel}\n{innhold[:1500]}")
if ut:
    print("MR ART-status ved oppstart:\n" + "\n\n".join(ut))
sys.exit(0)
