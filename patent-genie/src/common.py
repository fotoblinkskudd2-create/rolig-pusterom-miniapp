"""Felles hjelpere for patent-genie. Ingen hemmeligheter i kode."""
from __future__ import annotations

import datetime as dt
import json
import os
import pathlib
import re
import time

import requests
from dotenv import load_dotenv

ROOT = pathlib.Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

RAW = ROOT / "data" / "raw"
DISSECTED = ROOT / "data" / "dissected"
GAPS_MD = ROOT / "data" / "gaps.md"
INVENTIONS = ROOT / "inventions"
DEAD = INVENTIONS / "dode"
LOG = ROOT / "log" / "leveranselogg.md"

LOG_HEADER = (
    "# Leveranselogg\n\n"
    "| dato | navn | type | kilde | status |\n"
    "|---|---|---|---|---|\n"
)
STATUS_WORDS = ("utløpt", "bortfalt", "oppgitt", "avslått", "aktiv", "UAVKLART")


class ConfigError(RuntimeError):
    """Mangler nøkkel eller input. Stopper ett steg, ikke hele løkka."""


def require_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise ConfigError(f"Mangler {name}. Legg den i .env (se .env.example).")
    return value


def today() -> str:
    return dt.date.today().isoformat()


def claude(prompt: str, *, max_tokens: int = 2000, system: str | None = None) -> str:
    """Kall mot Anthropic Messages API. Retry ved 429 og 5xx."""
    key = require_env("ANTHROPIC_API_KEY")
    model = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5-5")
    body: dict = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": prompt}],
    }
    if system:
        body["system"] = system
    headers = {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    for attempt in range(4):
        r = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers=headers,
            json=body,
            timeout=180,
        )
        if r.status_code == 200:
            return "".join(
                b.get("text", "") for b in r.json()["content"] if b.get("type") == "text"
            )
        if r.status_code in (429, 500, 502, 503, 529) and attempt < 3:
            time.sleep(2 ** (attempt + 1))
            continue
        raise RuntimeError(f"Claude API svarte {r.status_code}: {r.text[:300]}")
    raise RuntimeError("Claude API: ga opp etter retry")


def parse_json(text: str, opener: str = "[") -> object:
    """Plukker første JSON-struktur ut av et modellsvar."""
    closer = "]" if opener == "[" else "}"
    start, end = text.find(opener), text.rfind(closer)
    if start == -1 or end == -1 or end < start:
        raise ValueError("Fant ingen JSON i modellsvaret")
    return json.loads(text[start : end + 1])


def load_json(path: pathlib.Path):
    if not path.exists():
        raise ConfigError(f"Mangler {path.relative_to(ROOT)}. Kjør steget før dette.")
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: pathlib.Path, obj) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")


def gullgrad(text: str) -> int | None:
    """Leser tallet fra linjen 'GULLGRAD 1–10: N ...'."""
    for line in text.splitlines():
        if "GULLGRAD" in line.upper():
            clean = re.sub(r"1\s*[–-]\s*10", "", line)
            m = re.search(r"\b(10|[1-9])\b", clean)
            if m:
                return int(m.group(1))
    return None


def read_status(nr: str) -> str:
    """Juridisk status fra dissekeringsfil. Mangler den: UAVKLART."""
    path = DISSECTED / f"{nr}.md"
    if not path.exists():
        return "UAVKLART"
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("**Juridisk status:**"):
            m = re.search(r"\*\*Juridisk status:\*\*\s*(\S+)", line)
            if m and m.group(1).rstrip("—") in STATUS_WORDS:
                return m.group(1).rstrip("—")
    return "UAVKLART"


def read_log_names() -> set[str]:
    """Idénavn som allerede står i leveranselogg. Leses før hver kjøring."""
    if not LOG.exists():
        return set()
    names: set[str] = set()
    for line in LOG.read_text(encoding="utf-8").splitlines():
        if not line.startswith("|") or line.startswith(("| dato", "|---")):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) >= 2 and cells[1]:
            names.add(cells[1].upper())
    return names


def append_log(navn: str, typ: str, kilde: str, status: str) -> None:
    """Legger til én rad. Loggen er append-only."""
    LOG.parent.mkdir(parents=True, exist_ok=True)
    if not LOG.exists():
        LOG.write_text(LOG_HEADER, encoding="utf-8")
    with LOG.open("a", encoding="utf-8") as f:
        f.write(f"| {today()} | {navn} | {typ} | {kilde} | {status} |\n")
