import io
import unittest
from datetime import datetime, timedelta

from pusterom_cli import breathing
from pusterom_cli.models import CheckIn


def _checkin_days_ago(now: datetime, days_ago: float, mood: int) -> CheckIn:
    ts = now - timedelta(days=days_ago)
    return CheckIn(timestamp=ts.isoformat(timespec="seconds"), mood=mood, note="")


class TestEwmaMood(unittest.TestCase):
    def test_no_history_is_none(self):
        self.assertIsNone(breathing.ewma_mood([]))

    def test_single_recent_checkin_dominates(self):
        now = datetime(2026, 8, 30, 12, 0, 0)
        checkins = [_checkin_days_ago(now, 0, 5)]
        score = breathing.ewma_mood(checkins, now=now)
        self.assertAlmostEqual(score, 5.0)

    def test_older_entries_fade_relative_to_recent(self):
        now = datetime(2026, 8, 30, 12, 0, 0)
        # one bad day long ago, then several good recent days
        checkins = [_checkin_days_ago(now, 30, 1)] + [
            _checkin_days_ago(now, d, 5) for d in range(3)
        ]
        score = breathing.ewma_mood(checkins, now=now)
        self.assertGreater(score, 4.0)

    def test_recent_downward_drift_is_caught(self):
        now = datetime(2026, 8, 30, 12, 0, 0)
        # a slow slide: 4, 3, 3, 2 over the last few days, nothing extreme alone
        checkins = [
            _checkin_days_ago(now, 3, 4),
            _checkin_days_ago(now, 2, 3),
            _checkin_days_ago(now, 1, 3),
            _checkin_days_ago(now, 0, 2),
        ]
        score = breathing.ewma_mood(checkins, now=now)
        self.assertLess(score, 3.0)


class TestChoosePattern(unittest.TestCase):
    def test_no_history_defaults_to_calming_pattern(self):
        pattern = breathing.choose_pattern([])
        self.assertEqual(pattern.key, "478")

    def test_high_mood_gives_maintenance_pattern(self):
        now = datetime(2026, 8, 30, 12, 0, 0)
        checkins = [_checkin_days_ago(now, 0, 5)]
        pattern = breathing.choose_pattern(checkins, now=now)
        self.assertEqual(pattern.key, "coherent")

    def test_low_mood_gives_calming_pattern(self):
        now = datetime(2026, 8, 30, 12, 0, 0)
        checkins = [_checkin_days_ago(now, 0, 1)]
        pattern = breathing.choose_pattern(checkins, now=now)
        self.assertEqual(pattern.key, "478")


class TestRunSession(unittest.TestCase):
    def test_runs_full_cycles_without_real_sleep(self):
        out = io.StringIO()
        ticks = []
        cycles = breathing.run_session(
            breathing.PATTERNS["box"],
            minutes=16 / 60,  # exactly one box cycle (4+4+4+4=16s)
            seconds_per_tick=0,
            sleep_fn=ticks.append,
            out=out,
        )
        self.assertEqual(cycles, 1)
        self.assertEqual(len(ticks), 16)
        self.assertIn("Ferdig", out.getvalue())

    def test_keyboard_interrupt_is_handled_gracefully(self):
        out = io.StringIO()

        def raising_sleep(_seconds):
            raise KeyboardInterrupt

        cycles = breathing.run_session(
            breathing.PATTERNS["coherent"],
            minutes=1,
            seconds_per_tick=0,
            sleep_fn=raising_sleep,
            out=out,
        )
        self.assertEqual(cycles, 0)
        self.assertIn("Avbrutt", out.getvalue())


if __name__ == "__main__":
    unittest.main()
