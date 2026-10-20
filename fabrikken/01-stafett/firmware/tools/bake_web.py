#!/usr/bin/env python3
"""Bak telefon-UI inn i firmware som C++-streng (raw literal)."""
import sys
from pathlib import Path

src, dst = Path(sys.argv[1]), Path(sys.argv[2])
html = src.read_text(encoding="utf-8")
DELIM = "STAFETTWEB"
assert f'){DELIM}"' not in html
dst.write_text(f'// GENERERT fra {src.name} av tools/bake_web.py\n#pragma once\nstatic const char WEB_INDEX[] = R"{DELIM}({html}){DELIM}";\n', encoding="utf-8")
print(f"bakt {src} → {dst} ({len(html.encode())} byte)")
