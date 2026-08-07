#!/usr/bin/env python3
"""Acceptance check for Subtask 2: one full drone design cycle -> patentable
concept + simulation report, timed and printed. Run from backend/:
    python scripts/run_design_cycle.py [svalbard|ukraine]
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db import init_db  # noqa: E402
from app.services import run_drone_design_cycle  # noqa: E402


def main() -> None:
    theater = sys.argv[1] if len(sys.argv) > 1 else "svalbard"
    init_db()
    result = run_drone_design_cycle({"theater": theater, "min_temp_c": -30})
    print(json.dumps(result, indent=2, default=str))
    print(f"\n--- elapsed: {result['elapsed_seconds']}s | under 15 min: {result['acceptance_under_15min']} ---")
    assert result["acceptance_under_15min"], "design cycle exceeded 15-minute acceptance budget"


if __name__ == "__main__":
    main()
