#!/usr/bin/env python3
"""fokusplan.py – uferdige prosjekter (én per linje) -> prioritert 4-timers plan som markdown-tabell.

Kunst og agent-arbeid prioriteres først. Kun standardbibliotek.

Bruk:
  python fokusplan.py prosjekter.txt --start 18:00
  printf "Bergen-serie\\nSatire-agent\\nBok kapittel 2\\n" | python fokusplan.py -
"""
from __future__ import annotations

import argparse
import sys
from datetime import datetime, timedelta
from pathlib import Path

BLOKKER, ARBEID, PAUSE = 4, 50, 10

KATEGORIER = [  # (type, nøkkelord) – første treff vinner, rekkefølgen er prioriteten
    ("kunst", ("midjourney", "serie", "satire", "stencil", "kunst", "bilde", "sref", "banksy", "gonzo", "suno", "maleri")),
    ("agent", ("agent", "script", "kode", "skill", "pipeline", "codex", "claude", "bot", "app", "automat")),
    ("skriving", ("bok", "kapittel", "tekst", "manifest", "skriv", "essay")),
]
PRIORITET = {"kunst": 0, "agent": 1, "skriving": 2, "annet": 3}

MALER = {
    "kunst": ("Lag 6 Midjourney-varianter for «{p}» med låst --sref og --seed, rå stencil-stil, ingen kvalitetsord (8k, masterpiece). "
              "Gi meg dem som nummerert liste klar til /imagine.",
              "6 prompts kjørt i Midjourney, minst ett bilde valgt for posting."),
    "agent": ("Prosjekt: «{p}». Skriv koden for det minste neste steget som gjør prosjektet kjørbart, med én test som beviser det. "
              "Ingen refaktorering utenfor steget.",
              "Steget kjører lokalt, testen er grønn, endringen er committet."),
    "skriving": ("Prosjekt: «{p}». Les siste kapittel jeg limer inn under og gi meg 5 rå setninger å fortsette fra. Ingen pynt, ingen moral.",
                 "Minst 500 nye ord skrevet."),
    "annet": ("Prosjekt: «{p}». Bryt neste steg ned i maks 3 handlinger jeg kan fullføre på 50 minutter, med ferdig-kriterium for hver.",
              "Minst én handling ferdig og synlig (fil, commit, post eller melding)."),
}


def kategori(prosjekt: str) -> str:
    lav = prosjekt.lower()
    for navn, ord_ in KATEGORIER:
        if any(o in lav for o in ord_):
            return navn
    return "annet"


def les_prosjekter(tekst: str) -> list[str]:
    return [l.strip().lstrip("-*•0123456789.) ").strip() for l in tekst.splitlines()
            if l.strip() and not l.strip().startswith("#")]


def plan(prosjekter: list[str], start: datetime) -> list[dict]:
    if not prosjekter:
        raise ValueError("ingen prosjekter")
    rangert = sorted(enumerate(prosjekter), key=lambda ip: (PRIORITET[kategori(ip[1])], ip[0]))
    valgt = [p for _, p in rangert][:BLOKKER]
    while len(valgt) < BLOKKER:
        valgt.append(valgt[0])
    rader, t = [], start
    for p in valgt:
        mal, kriterium = MALER[kategori(p)]
        slutt = t + timedelta(minutes=ARBEID)
        rader.append({"tid": f"{t:%H:%M}–{slutt:%H:%M}", "oppgave": p, "prompt": mal.format(p=p), "suksess": kriterium})
        t = slutt + timedelta(minutes=PAUSE)
    return rader


def markdown(rader: list[dict]) -> str:
    def celle(s: str) -> str:
        return s.replace("|", "\\|").replace("\n", " ")
    linjer = ["| Tid | Oppgave | Prompt (copy-paste) | Suksesskriterium |", "|---|---|---|---|"]
    linjer += [f"| {r['tid']} | {celle(r['oppgave'])} | {celle(r['prompt'])} | {celle(r['suksess'])} |" for r in rader]
    return "\n".join(linjer) + f"\n\n10 min pause etter hver blokk.\n"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("fil", help="fil med ett prosjekt per linje ('-' = stdin)")
    ap.add_argument("--start", help="starttid HH:MM (standard: nå)")
    a = ap.parse_args(argv)
    tekst = sys.stdin.read() if a.fil == "-" else Path(a.fil).read_text(encoding="utf-8")
    start = datetime.now().replace(second=0, microsecond=0)
    if a.start:
        start = datetime.combine(start.date(), datetime.strptime(a.start, "%H:%M").time())
    print(markdown(plan(les_prosjekter(tekst), start)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
