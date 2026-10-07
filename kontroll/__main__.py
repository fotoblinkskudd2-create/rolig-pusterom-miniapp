"""CLI: python -m kontroll {sjekk,eval,avvist}

  sjekk [FIL|-] --spor S [--autorisert] [--json] [--uten-dommer]
        exit 0 SLIPP · 2 STOPP · 3 RETT
  eval  [--min 0.95] [--med-dommer]       kjører testsettet, exit 1 under terskel
  avvist [--siste N]                      siste avviste
"""
from __future__ import annotations

import argparse
import json
import sys

from . import avvist_sti, vurder
from .eval import kjør as kjør_eval

KODER = {"SLIPP": 0, "STOPP": 2, "RETT": 3}


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="kontroll", description="Portvakt foran alle motorer.")
    sub = p.add_subparsers(dest="kommando", required=True)

    s = sub.add_parser("sjekk", help="vurder én output")
    s.add_argument("fil", nargs="?", default="-")
    s.add_argument("--spor", default="generell")
    s.add_argument("--autorisert", action="store_true")
    s.add_argument("--json", action="store_true", help="les input som JSON / skriv dom som JSON")
    s.add_argument("--uten-dommer", action="store_true")

    e = sub.add_parser("eval", help="kjør testsettet")
    e.add_argument("--min", type=float, default=0.95)
    e.add_argument("--med-dommer", action="store_true")

    a = sub.add_parser("avvist", help="vis avviste")
    a.add_argument("--siste", type=int, default=10)

    args = p.parse_args(argv)

    if args.kommando == "sjekk":
        rå = sys.stdin.read() if args.fil == "-" else open(args.fil, encoding="utf-8").read()
        output = json.loads(rå) if args.json else rå
        dom = vurder(output, args.spor, autorisert=args.autorisert,
                     bruk_dommer=not args.uten_dommer, kilde=f"cli:{args.fil}")
        if args.json:
            print(json.dumps(dom.til_dict(), ensure_ascii=False, indent=2))
        else:
            hvor = f" (linje {dom.linje})" if dom.linje else ""
            print(f"{dom.status}{hvor} [{dom.regel or dom.lag}] {dom.grunn}")
            if dom.status == "RETT" and dom.fiks is not None:
                print("\n── FORESLÅTT FIKS ──")
                print(dom.fiks if isinstance(dom.fiks, str) else json.dumps(dom.fiks, ensure_ascii=False, indent=2))
        return KODER[dom.status]

    if args.kommando == "eval":
        return kjør_eval(terskel=args.min, med_dommer=args.med_dommer)

    sti = avvist_sti()
    if not sti.exists():
        print("Ingen avviste ennå.")
        return 0
    for rad in sti.read_text(encoding="utf-8").splitlines()[-args.siste:]:
        r = json.loads(rad)
        print(f"{r['tid']}  {r['spor']:<10} [{r['regel']}] linje {r['linje']}: {r['grunn']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
