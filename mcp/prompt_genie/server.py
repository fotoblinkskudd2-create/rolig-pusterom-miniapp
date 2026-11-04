#!/usr/bin/env python3
"""Prompt Genie – en minimal MCP-server (stdio, JSON-RPC 2.0) uten eksterne avhengigheter.

Verktøy:
  build_prompt(problem, context?, max_chars?)  -> str
      Bygger en Labben / Grok-bot-prompt fra et konkret problem. Samme format som
      isolation-mirror.html, men med problemet, kontekst og lengde som parametere
      i stedet for en hardkodet mal.

Kjør: python3 mcp/prompt_genie/server.py
"""
import json
import re
import sys

PROTOCOL_VERSION = "2024-11-05"
SERVER_INFO = {"name": "prompt-genie", "version": "0.1.0"}
DEFAULT_MAX_CHARS = 180  # samme grense som isolation-mirror.html
HARD_MAX_CHARS = 2000


def _clean(text: str, limit: int) -> str:
    """Fjern kontrolltegn, slå sammen whitespace og kapp til limit."""
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", str(text or ""))
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]


def build_prompt(problem: str, context: str = "", max_chars: int = DEFAULT_MAX_CHARS) -> str:
    """Bygg prompten. Tom input gir en trygg standardverdi, ikke en feil."""
    max_chars = max(20, min(int(max_chars or DEFAULT_MAX_CHARS), HARD_MAX_CHARS))
    problem_c = _clean(problem, max_chars) or "uavklart problem"
    context_c = _clean(context, max_chars) or "ingen ekstra kontekst"
    lines = [
        "Grok-bot runtime. /lab. Klasse M.",
        f"PROBLEM: {problem_c}",
        f"KONTEKST: {context_c}",
        "BRUKER: én person, lokal, ingen sky",
        "RAMMER: 48t, lokal-first, ingen marketplace, ingen app+sky",
        "DNA: fototerapi + passiv mekanikk + 48t",
        "LEVERANSE: ideer",
        "Seed 7. Drepe minst 3. IRP på overlevende #1.",
        "Skriv IDE ≤3 setninger på nynorsk. Stopp.",
        "Ikke nytt OS.",
    ]
    return "\n".join(lines)


TOOLS = [
    {
        "name": "build_prompt",
        "description": "Bygg en Labben/Grok-bot-prompt fra et konkret problem.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "problem": {"type": "string", "description": "Kort beskrivelse av problemet."},
                "context": {"type": "string", "description": "Valgfri ekstra kontekst."},
                "max_chars": {
                    "type": "integer",
                    "description": f"Maks lengde per felt (standard {DEFAULT_MAX_CHARS}, maks {HARD_MAX_CHARS}).",
                },
            },
            "required": ["problem"],
        },
    }
]


def _result(msg_id, result):
    return {"jsonrpc": "2.0", "id": msg_id, "result": result}


def _error(msg_id, code, message):
    return {"jsonrpc": "2.0", "id": msg_id, "error": {"code": code, "message": message}}


def handle(message: dict):
    """Håndter én JSON-RPC-melding. Returnerer svar-dict eller None for notifikasjoner."""
    method = message.get("method")
    msg_id = message.get("id")
    params = message.get("params") or {}

    if msg_id is None:  # notifikasjoner (f.eks. notifications/initialized) får ikke svar
        return None

    if method == "initialize":
        return _result(msg_id, {
            "protocolVersion": PROTOCOL_VERSION,
            "capabilities": {"tools": {}},
            "serverInfo": SERVER_INFO,
        })
    if method == "ping":
        return _result(msg_id, {})
    if method == "tools/list":
        return _result(msg_id, {"tools": TOOLS})
    if method == "tools/call":
        name = params.get("name")
        args = params.get("arguments") or {}
        if name != "build_prompt":
            return _error(msg_id, -32602, f"Ukjent verktøy: {name}")
        if not isinstance(args.get("problem", ""), str):
            return _error(msg_id, -32602, "problem må være tekst")
        text = build_prompt(args.get("problem", ""), args.get("context", ""), args.get("max_chars"))
        return _result(msg_id, {"content": [{"type": "text", "text": text}], "isError": False})
    return _error(msg_id, -32601, f"Metode ikke støttet: {method}")


def main():
    for raw in sys.stdin:
        raw = raw.strip()
        if not raw:
            continue
        try:
            message = json.loads(raw)
        except json.JSONDecodeError:
            resp = _error(None, -32700, "Parse error")
        else:
            resp = handle(message)
        if resp is not None:
            sys.stdout.write(json.dumps(resp, ensure_ascii=False) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
