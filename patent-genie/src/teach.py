"""Steg 7: læremoduler i AI-tech for GRØNN og GUL oppfinnelser.

Eksempelkoden må kjøre i en egen prosess før den godtas. Maks 40 linjer.
"""
from __future__ import annotations

import re
import subprocess
import sys
import tempfile
from pathlib import Path

from common import INVENTIONS, claude

SYSTEM = (
    "Du er lærer i AI-tech. Skriv på norsk, korte setninger, tall foran adjektiver. "
    "Målet er at eleven lærer teknologien, ikke bare får flere filer."
)

PROMPT = """Lag en læremodul for oppfinnelsen under. Bruk nøyaktig disse seksjonene:

## 1. Kjernekonsept
Hvilket AI-tech-konsept oppfinnelsen bygger på (f.eks. backpropagation, Kalman-filter, kvantisering, embeddings).

## 2. Tre nivåer
### 12-åring
### Ingeniør
### Patentgransker

## 3. Minimalt eksempel
Ett Python-eksempel under 40 linjer, i ```python-blokk. Det må kjøre uten argumenter og uten nettverk.

## 4. Tre spørsmål
Tre spørsmål Alex skal kunne svare på før han pitcher ideen.

## 5. Neste steg
Neste ting å lære, og hvorfor.

OPPFINNELSE:
{brief}
"""


def extract_code(text: str) -> str | None:
    m = re.search(r"```python\n(.*?)```", text, re.S)
    return m.group(1) if m else None


def run_example(code: str) -> tuple[bool, str]:
    if len(code.splitlines()) >= 40:
        return False, "eksempelet er 40 linjer eller mer"
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "example.py"
        path.write_text(code, encoding="utf-8")
        res = subprocess.run([sys.executable, "-I", str(path)], cwd=tmp,
                             capture_output=True, text=True, timeout=20)
    if res.returncode != 0:
        return False, res.stderr.strip().splitlines()[-1] if res.stderr.strip() else "feil"
    return True, "kjørte OK"


def current_dom(text: str) -> str | None:
    doms = re.findall(r"\*\*Dom:\*\*\s*(\S+)", text)
    return doms[-1].upper() if doms else None


def main() -> dict:
    done, failed = 0, []
    for path in sorted(INVENTIONS.glob("*.md")):
        if path.name.endswith("-laer.md"):
            continue
        text = path.read_text(encoding="utf-8")
        if current_dom(text) not in ("GRØNN", "GUL"):
            continue
        navn = path.stem
        body = claude(PROMPT.format(brief=text[:5000]), max_tokens=2500, system=SYSTEM)
        code = extract_code(body)
        ok, note = (False, "fant ingen python-blokk") if code is None else run_example(code)
        if not ok:
            body = claude(
                PROMPT.format(brief=text[:5000])
                + f"\n\nForrige eksempel feilet: {note}. Skriv et nytt som kjører.",
                max_tokens=2500, system=SYSTEM)
            code = extract_code(body)
            ok, note = (False, "fant ingen python-blokk") if code is None else run_example(code)
        if not ok:
            failed.append(f"{navn}: {note}")
            body = body + f"\n\n> Eksempel kjørte IKKE: {note}. Status UAVKLART.\n"
        (INVENTIONS / f"{navn}-laer.md").write_text(body.strip() + "\n", encoding="utf-8")
        done += 1
    return {"laerer": done, "feil": failed}


if __name__ == "__main__":
    print(main())
