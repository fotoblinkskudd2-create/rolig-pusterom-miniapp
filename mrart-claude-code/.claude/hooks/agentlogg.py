#!/usr/bin/env python3
"""Stop/SubagentStop-hook: én linje per avsluttet tur i .mrart/agentlop.jsonl (lokal beviskjede)."""
import json, os, sys, datetime, hashlib

def main() -> int:
    try:
        data = json.load(sys.stdin)
    except Exception:
        data = {}
    root = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
    os.makedirs(os.path.join(root, ".mrart"), exist_ok=True)
    post = {
        "tid": datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
        "hendelse": data.get("hook_event_name", "Stop"),
        "sesjon": data.get("session_id", ""),
        "agent": data.get("agent_type", "hoved"),
        "cwd": data.get("cwd", root),
    }
    sti = os.path.join(root, ".mrart", "agentlop.jsonl")
    forrige = ""
    if os.path.exists(sti):
        with open(sti, "rb") as f:
            linjer = f.read().splitlines()
            forrige = hashlib.sha256(linjer[-1]).hexdigest()[:12] if linjer else ""
    post["forrige"] = forrige  # enkel hashkjede: endring i historikk blir synlig
    with open(sti, "a", encoding="utf-8") as f:
        f.write(json.dumps(post, ensure_ascii=False) + "\n")
    return 0

if __name__ == "__main__":
    sys.exit(main())
