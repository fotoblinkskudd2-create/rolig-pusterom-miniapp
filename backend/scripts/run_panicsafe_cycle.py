#!/usr/bin/env python3
"""Acceptance check for Subtask 3: full patient simulation -> sellable device
concept + test protocol. Run from backend/:
    python scripts/run_panicsafe_cycle.py [sudden_noise|crowd_enclosure|conflict_reminder]
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db import init_db  # noqa: E402
from app.services import run_panicsafe_cycle  # noqa: E402


def main() -> None:
    scenario_id = sys.argv[1] if len(sys.argv) > 1 else "sudden_noise"
    init_db()
    result = run_panicsafe_cycle({"scenario_id": scenario_id})
    print(result["simulation"]["protocol_md"])
    print("--- patent draft ---")
    print(json.dumps(result["patent"], indent=2, default=str))
    print("--- gonzo critique ---")
    print(json.dumps(result["gonzo_critique"], indent=2, default=str))


if __name__ == "__main__":
    main()
