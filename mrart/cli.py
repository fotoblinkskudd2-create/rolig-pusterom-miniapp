"""mrart — målebenk for multi-agentarbeid.

  mrart status [--dager 7]
  mrart inngrep "<hva jeg rettet>" [--motor gransk] [--run <run-id>]
  mrart score <run-id> <1-5>
  mrart rapport [--ut mrart-rapport.html]
"""
from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path

from .benker import kjør_alle
from .data import Datasett, registrer_inngrep, registrer_score
from .metrikk import per_dag_motor, summer
from .rapport import lag_html
from .tekst import kort_status, tabell


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="mrart", description="MR ART målebenk")
    p.add_argument("--logger", type=Path, default=Path("logs"), help="mappe med kall.jsonl (standard: logs/)")
    sub = p.add_subparsers(dest="kommando", required=True)

    s = sub.add_parser("status", help="kort status, så tabell")
    s.add_argument("--dager", type=int, default=7, choices=[7, 30])

    i = sub.add_parser("inngrep", help="registrer et manuelt inngrep")
    i.add_argument("tekst")
    i.add_argument("--motor")
    i.add_argument("--run", dest="run_id")

    sc = sub.add_parser("score", help="sett kvalitetsscore 1–5 på en kjøring")
    sc.add_argument("run_id")
    sc.add_argument("score", type=int)

    r = sub.add_parser("rapport", help="statisk HTML-rapport")
    r.add_argument("--ut", type=Path, default=Path("mrart-rapport.html"))

    a = p.parse_args(argv)
    nå = datetime.now(timezone.utc)

    try:
        if a.kommando == "inngrep":
            registrer_inngrep(a.tekst, motor=a.motor, run_id=a.run_id, mappe=a.logger)
            print("Inngrep registrert. Benken har sett deg rette.")
        elif a.kommando == "score":
            registrer_score(a.run_id, a.score, mappe=a.logger)
            print(f"{a.run_id} = {a.score}/5.")
        elif a.kommando == "status":
            d = Datasett.les(a.logger)
            rader = per_dag_motor(d, nå, a.dager)
            print("\n".join(kort_status(summer(rader, a.dager), kjør_alle(d, nå))))
            print()
            print(tabell(rader))
        elif a.kommando == "rapport":
            a.ut.write_text(lag_html(Datasett.les(a.logger), nå), encoding="utf-8")
            print(f"Skrev {a.ut}")
    except ValueError as e:
        print(f"mrart: {e}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
