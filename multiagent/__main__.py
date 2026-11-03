"""Kjør: python -m multiagent  [--out fil.md]"""
from __future__ import annotations

import argparse

from .agents import default_agents
from .orchestrator import DIM_WEIGHTS, tournament
from .seeds import seed_ideas


def report(outcomes) -> str:
    lines = ["# Stille Verksted: turnering av startidéer", ""]
    lines.append("Skåre 0–10. Vekter: " + ", ".join(f"{d} {w:.0%}" for d, w in DIM_WEIGHTS.items()) + ".")
    lines.append("Alle tall er hypoteser. Se docs/multiagent-plan.md for forutsetningene.")
    lines.append("")
    lines.append("| # | Idé | Start | Slutt | Kreativ | Gjennomf. | Marked | Kommersiell | Risiko |")
    lines.append("|---|---|---|---|---|---|---|---|---|")
    for i, o in enumerate(outcomes, 1):
        d = o.final.dims
        lines.append(
            f"| {i} | {o.idea.name} | {o.start.total:.2f} | **{o.final.total:.2f}** | "
            f"{d['kreativitet']:.1f} | {d['gjennomforbarhet']:.1f} | {d['marked']:.1f} | "
            f"{d['kommersiell']:.1f} | {d['risiko']:.1f} |"
        )
    for o in outcomes:
        lines += ["", f"## {o.idea.name}", "", f"_{o.idea.pitch}_", ""]
        lines.append("**Gjenstående innvendinger:**")
        objs = o.final.objections()
        lines += [f"- {agent}: {text}" for agent, text in objs] or ["- ingen"]
        lines += ["", "**Forbedringslogg:**"]
        lines += [f"- {entry}" for entry in o.log] or ["- ingen endringer"]
        if o.idea.history:
            lines += ["", "**Endringer som ble beholdt:**"]
            lines += [f"- {h}" for h in o.idea.history]
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", help="skriv rapporten til denne filen")
    args = parser.parse_args()

    outcomes = tournament(seed_ideas(), default_agents())
    text = report(outcomes)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(text)
        print(f"Rapport skrevet til {args.out}")
    else:
        print(text)


if __name__ == "__main__":
    main()
