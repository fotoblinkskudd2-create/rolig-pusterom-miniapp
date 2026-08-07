"""LLM abstraction: local Ollama first, deterministic offline templates as guaranteed fallback.

REGNViking OS must never hard-depend on a network call. If Ollama isn't reachable
(no model pulled, offline machine, container without the sidecar), every agent still
produces structured, usable output via the template engine below -- just less prose.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any

from app.config import OLLAMA_HOST, OLLAMA_MODEL


def ollama_available() -> bool:
    try:
        req = urllib.request.Request(f"{OLLAMA_HOST}/api/tags")
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            return resp.status == 200
    except Exception:
        return False


def generate(prompt: str, system: str = "", *, json_mode: bool = False) -> str:
    """Best-effort local generation. Falls back to an empty string on any failure
    so callers must always have a deterministic template fallback (never block on this)."""
    try:
        body: dict[str, Any] = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "system": system,
            "stream": False,
        }
        if json_mode:
            body["format"] = "json"
        req = urllib.request.Request(
            f"{OLLAMA_HOST}/api/generate",
            data=json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("response", "")
    except (urllib.error.URLError, TimeoutError, OSError, ValueError):
        return ""
