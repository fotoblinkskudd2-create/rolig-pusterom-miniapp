"""Command-line interface for Pusterom CLI: en rolig pause i terminalen."""
from __future__ import annotations

import argparse
import logging
import sys
from datetime import date
from pathlib import Path

from . import breathing, stats, storage
from .logging_setup import configure
from .models import ActionDone, CheckIn, State, ValidationError, validate_action_name

logger = logging.getLogger("pusterom.cli")

MOOD_FACES = {1: "😞", 2: "🙁", 3: "😐", 4: "🙂", 5: "😄"}


def _load(args) -> State:
    return storage.load(Path(args.data_file))


def _save(state: State, args) -> None:
    storage.save(state, Path(args.data_file))


def cmd_sjekk_inn(args, state: State) -> int:
    checkin = CheckIn.new(args.humor, args.notat or "")
    state.checkins.append(checkin)
    _save(state, args)
    face = MOOD_FACES.get(checkin.mood, "")
    note_part = f' — "{checkin.note}"' if checkin.note else ""
    print(f"Sjekket inn: humør {checkin.mood} {face}{note_part}")
    streak = stats.current_streak(state.checkins, state.action_log)
    print(f"Streak: {streak} dag(er) i strekk.")
    return 0


def cmd_pust(args, state: State) -> int:
    if args.monster == "auto":
        pattern = breathing.choose_pattern(state.checkins)
    else:
        pattern = breathing.PATTERNS[args.monster]
    seconds_per_tick = 0.1 if args.tempo == "rask" else 1.0
    cycles = breathing.run_session(pattern, args.minutter, seconds_per_tick=seconds_per_tick)
    print(f"{cycles} pustesyklus(er) fullført med {pattern.label}.")
    return 0


def cmd_grep_liste(args, state: State) -> int:
    today_ids = {a.action_id for a in state.action_log if a.when.date() == date.today()}
    print("Små grep:")
    for action_id, name in state.all_actions().items():
        mark = "x" if action_id in today_ids else " "
        print(f"  [{mark}] {action_id:<8} {name}")
    return 0


def cmd_grep_gjort(args, state: State) -> int:
    actions = state.all_actions()
    if args.id not in actions:
        print(f"Ukjent grep-id '{args.id}'. Se 'grep liste'.", file=sys.stderr)
        return 1
    state.action_log.append(ActionDone.new(args.id))
    _save(state, args)
    print(f"Notert: {actions[args.id]}")
    return 0


def cmd_grep_ny(args, state: State) -> int:
    name = validate_action_name(args.navn)
    action_id = (args.id or name.lower().replace(" ", "-"))[:20]
    state.custom_actions[action_id] = name
    _save(state, args)
    print(f"Lagt til grep '{action_id}': {name}")
    return 0


def cmd_status(args, state: State) -> int:
    streak = stats.current_streak(state.checkins, state.action_log)
    last = max(state.checkins, key=lambda c: c.when, default=None)
    pattern = breathing.choose_pattern(state.checkins)
    today_actions = sum(1 for a in state.action_log if a.when.date() == date.today())
    print("== Pusterom status ==")
    print(f"Streak:           {streak} dag(er)")
    if last:
        print(f"Siste innsjekk:   {last.when.strftime('%d.%m %H:%M')} - humør {last.mood} {MOOD_FACES.get(last.mood, '')}")
    else:
        print("Siste innsjekk:   ingen ennå")
    print(f"Grep gjort i dag: {today_actions}")
    print(f"Foreslått pust:   {pattern.label} (kjør 'pust' for å starte)")
    return 0


def cmd_historikk(args, state: State) -> int:
    days = args.dager
    series = stats.mood_by_day(state.checkins, days)
    values = [v for _, v in series]
    print(f"Humør siste {days} dager:")
    print(" " + stats.sparkline(values))
    counted = [v for v in values if v is not None]
    if counted:
        print(f"Snitt: {sum(counted) / len(counted):.1f}/5 over {len(counted)} dag(er) med innsjekk")
    else:
        print("Ingen innsjekk i perioden ennå.")
    counts = stats.completion_counts(state.action_log, days)
    if counts:
        print("\nGrep fullført:")
        actions = state.all_actions()
        for action_id, n in sorted(counts.items(), key=lambda kv: -kv[1]):
            print(f"  {actions.get(action_id, action_id):<30} x{n}")
    if args.eksporter:
        _export(state, Path(args.eksporter))
        print(f"\nEksportert til {args.eksporter}")
    return 0


def _export(state: State, path: Path) -> None:
    lines = ["Pusterom historikk", "=" * 20, "", "Innsjekk:"]
    for c in sorted(state.checkins, key=lambda c: c.when):
        note = f"  {c.note}" if c.note else ""
        lines.append(f"{c.when.strftime('%d.%m.%Y %H:%M')}  humør {c.mood}{note}")
    lines.append("")
    lines.append("Små grep gjort:")
    actions = state.all_actions()
    for a in sorted(state.action_log, key=lambda a: a.when):
        lines.append(f"{a.when.strftime('%d.%m.%Y %H:%M')}  {actions.get(a.action_id, a.action_id)}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="pusterom", description="Pusterom CLI - en rolig pause i terminalen.")
    p.add_argument("--data-file", default=str(storage.DEFAULT_DATA_FILE), help="Sti til datafil (JSON).")
    p.add_argument("--verbose", action="store_true", help="Vis debug-logg i terminalen.")
    sub = p.add_subparsers(dest="kommando", required=True)

    si = sub.add_parser("sjekk-inn", help="Registrer humør (1-5) og valgfritt notat.")
    si.add_argument("--humor", type=int, required=True, help="Humør fra 1 (dårlig) til 5 (bra).")
    si.add_argument("--notat", default="", help="Valgfritt notat.")
    si.set_defaults(func=cmd_sjekk_inn)

    pu = sub.add_parser("pust", help="Kjør en guidet pusteøkt.")
    pu.add_argument("--minutter", type=float, default=3.0, help="Lengde på økten i minutter.")
    pu.add_argument("--monster", choices=["auto", *breathing.PATTERNS.keys()], default="auto",
                     help="'auto' velger mønster ut fra nylig humør.")
    pu.add_argument("--tempo", choices=["normal", "rask"], default="normal",
                     help="'rask' for en rask demo uten å vente i sanntid.")
    pu.set_defaults(func=cmd_pust)

    gr = sub.add_parser("grep", help="Små grep du kan gjøre nå.")
    gr_sub = gr.add_subparsers(dest="grep_kommando", required=True)
    gr_liste = gr_sub.add_parser("liste", help="List alle grep og dagens status.")
    gr_liste.set_defaults(func=cmd_grep_liste)
    gr_gjort = gr_sub.add_parser("gjort", help="Merk et grep som gjort i dag.")
    gr_gjort.add_argument("id")
    gr_gjort.set_defaults(func=cmd_grep_gjort)
    gr_ny = gr_sub.add_parser("ny", help="Legg til et eget grep.")
    gr_ny.add_argument("--navn", required=True)
    gr_ny.add_argument("--id", default=None)
    gr_ny.set_defaults(func=cmd_grep_ny)

    st = sub.add_parser("status", help="Rask oversikt: streak, siste innsjekk, forslag.")
    st.set_defaults(func=cmd_status)

    hi = sub.add_parser("historikk", help="Vis humørtrend og statistikk, evt. eksporter.")
    hi.add_argument("--dager", type=int, default=14)
    hi.add_argument("--eksporter", default=None, help="Fil å eksportere historikk til (.txt).")
    hi.set_defaults(func=cmd_historikk)

    return p


def main(argv=None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    configure(verbose=args.verbose)
    try:
        state = _load(args)
        return args.func(args, state)
    except ValidationError as exc:
        print(f"Ugyldig input: {exc}", file=sys.stderr)
        logger.warning("Valideringsfeil: %s", exc)
        return 2
    except Exception:
        logger.exception("Uventet feil")
        print("Noe gikk galt. Se pusterom.log for detaljer.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
