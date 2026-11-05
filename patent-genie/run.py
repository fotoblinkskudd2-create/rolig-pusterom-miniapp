#!/usr/bin/env python3
"""Løkka. Kjører steg 1–7 i rekkefølge og skriver dagsrapport til log/YYYY-MM-DD.md.

Kjør:  .venv/bin/python run.py
Daglig kl 06:00: se crontab.txt (kommentert ut).

Et steg som feiler stopper bare seg selv. Feilen står i rapporten.
"""
from __future__ import annotations

import os
import sys
import traceback
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "src"))

import common  # noqa: E402
import dissect, fetch, gaps, invent, redteam, status, teach  # noqa: E402


def write_report(results: dict, errors: list[str], before: int) -> Path:
    r = lambda k: results.get(k) or {}  # noqa: E731
    fetched, dis, st, gp = r("1 hent"), r("2 dissekering"), r("3 status"), r("4 hull")
    inv, red, tch = r("5 oppfinnelser"), r("6 red team"), r("7 læring")

    doms = redteam_doms = red.get("doms", {})
    counts = {d: sum(1 for v in doms.values() if v == d) for d in ("GRØNN", "GUL", "RØD")}
    lines = [
        f"# Dagsrapport {common.today()}",
        "",
        f"Idéer i leveranselogg før kjøring: {before}",
        "",
        f"- Hentet: gullgruva {fetched.get('gullgruva', 0)}, fronten {fetched.get('fronten', 0)}",
        f"- Dissekert: {dis.get('dissekert', 0)} (feil {dis.get('feil', 0)})",
        f"- Juridisk status sjekket (GULLGRAD ≥ 7): {st.get('sjekket', 0)} — "
        f"verifisert utløpt {st.get('utløpt', 0)}, bortfalt {st.get('bortfalt', 0)}, "
        f"UAVKLART {st.get('UAVKLART', 0)}",
        f"- Hull: {gp.get('hull', 0)}",
        f"- Nye oppfinnelser: {', '.join(inv.get('nye', [])) or 'ingen'}",
    ]
    if inv.get("hoppet"):
        lines.append("  - hoppet over: " + "; ".join(f"{n} ({why})" for n, why in inv["hoppet"]))
    lines += [
        f"- Red team: GRØNN {counts['GRØNN']} · GUL {counts['GUL']} · RØD {counts['RØD']}",
        f"- Læringsmoduler: {tch.get('laerer', 0)}",
        "",
        "## Hva som feilet",
    ]
    if tch.get("feil"):
        errors = errors + [f"læring: {x}" for x in tch["feil"]]
    lines += [f"- {e}" for e in errors] or ["- ingen"]
    lines += ["", "Dette er ikke juridisk råd. Patentstatus er UAVKLART med mindre kilde står i filen."]

    path = common.LOG.parent / f"{common.today()}.md"
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path


def main() -> int:
    before = len(common.read_log_names())
    print(f"Leser leveranselogg: {before} idéer fra før.")

    steps = [
        ("1 hent", fetch.main),
        ("2 dissekering", dissect.main),
        ("3 status", status.main),
        ("4 hull", gaps.main),
        ("5 oppfinnelser", invent.main),
        ("6 red team", redteam.main),
        ("7 læring", teach.main),
    ]
    results: dict = {}
    errors: list[str] = []
    for name, fn in steps:
        print(f"\n== {name} ==")
        try:
            results[name] = fn() or {}
            print(results[name])
        except Exception as exc:
            results[name] = {}
            errors.append(f"{name}: {type(exc).__name__}: {exc}")
            print(f"FEIL i {name}: {exc}", file=sys.stderr)
            if os.getenv("DEBUG"):
                traceback.print_exc()

    report = write_report(results, errors, before)
    print(f"\nDagsrapport: {report}")
    print(report.read_text(encoding="utf-8"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
