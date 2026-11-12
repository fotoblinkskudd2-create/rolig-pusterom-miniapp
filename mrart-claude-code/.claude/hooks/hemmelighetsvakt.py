#!/usr/bin/env python3
"""PreToolUse-hook for Write/Edit/MultiEdit: stopper hemmeligheter før de havner i filer."""
import json, re, sys

MONSTRE = [
    (r"sk-(ant-|proj-)?[A-Za-z0-9_\-]{20,}", "API-nøkkel (sk-...)"),
    (r"gh[pousr]_[A-Za-z0-9]{30,}", "GitHub-token"),
    (r"github_pat_[A-Za-z0-9_]{40,}", "GitHub fine-grained token"),
    (r"AKIA[0-9A-Z]{16}", "AWS-nøkkel"),
    (r"xox[baprs]-[A-Za-z0-9\-]{10,}", "Slack-token"),
    (r"ntn_[A-Za-z0-9]{30,}|secret_[A-Za-z0-9]{40,}", "Notion-token"),
    (r"-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----", "privat nøkkel"),
    (r"\b\d{6}\s?\d{5}\b", "mulig fødselsnummer (11 sifre)"),
]

def tekst(inp: dict) -> str:
    deler = [inp.get("content", ""), inp.get("new_string", "")]
    for e in inp.get("edits", []) or []:
        deler.append(e.get("new_string", ""))
    return "\n".join(d for d in deler if isinstance(d, str))

def main() -> int:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0
    inp = data.get("tool_input") or {}
    sti = inp.get("file_path", "")
    if sti.endswith((".test.py", "_test.py")) or "/tests/" in sti or "/fixtures/" in sti:
        return 0  # testfiler kan inneholde syntetiske mønstre
    t = tekst(inp)
    for monster, navn in MONSTRE:
        if re.search(monster, t):
            sys.stderr.write(f"HEMMELIGHETSVAKT: {navn} funnet i skriving til {sti}. STOPP. "
                             "Fjern verdien, bruk miljøvariabel, og meld fra til operatøren.\n")
            return 2
    return 0

if __name__ == "__main__":
    sys.exit(main())
