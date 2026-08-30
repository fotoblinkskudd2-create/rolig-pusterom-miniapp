import unittest
from datetime import date, timedelta

from pusterom_cli import stats
from pusterom_cli.models import ActionDone, CheckIn


def _checkin_on(d: date, mood: int) -> CheckIn:
    return CheckIn(timestamp=f"{d.isoformat()}T09:00:00", mood=mood, note="")


def _action_on(d: date, action_id: str) -> ActionDone:
    return ActionDone(timestamp=f"{d.isoformat()}T09:00:00", action_id=action_id)


class TestStreak(unittest.TestCase):
    def test_no_activity_is_zero(self):
        self.assertEqual(stats.current_streak([], []), 0)

    def test_three_consecutive_days_including_today(self):
        today = date(2026, 8, 30)
        checkins = [
            _checkin_on(today, 4),
            _checkin_on(today - timedelta(days=1), 3),
            _checkin_on(today - timedelta(days=2), 5),
        ]
        self.assertEqual(stats.current_streak(checkins, [], today=today), 3)

    def test_gap_breaks_streak(self):
        today = date(2026, 8, 30)
        checkins = [_checkin_on(today - timedelta(days=3), 4)]
        self.assertEqual(stats.current_streak(checkins, [], today=today), 0)

    def test_grace_when_yesterday_active_but_not_today_yet(self):
        today = date(2026, 8, 30)
        checkins = [_checkin_on(today - timedelta(days=1), 4)]
        self.assertEqual(stats.current_streak(checkins, [], today=today), 1)

    def test_action_alone_counts_as_active_day(self):
        today = date(2026, 8, 30)
        actions = [_action_on(today, "vann")]
        self.assertEqual(stats.current_streak([], actions, today=today), 1)


class TestMoodByDay(unittest.TestCase):
    def test_averages_multiple_checkins_same_day(self):
        today = date(2026, 8, 30)
        checkins = [_checkin_on(today, 2), _checkin_on(today, 4)]
        series = stats.mood_by_day(checkins, days=1, today=today)
        self.assertEqual(series, [(today, 3.0)])

    def test_missing_days_are_none(self):
        today = date(2026, 8, 30)
        series = stats.mood_by_day([], days=3, today=today)
        self.assertEqual([v for _, v in series], [None, None, None])


class TestSparkline(unittest.TestCase):
    def test_length_matches_input(self):
        line = stats.sparkline([1, None, 3, 5])
        self.assertEqual(len(line), 4)

    def test_none_renders_as_space(self):
        line = stats.sparkline([None])
        self.assertEqual(line, " ")

    def test_min_and_max_map_to_extreme_blocks(self):
        line = stats.sparkline([1, 5])
        self.assertEqual(line[0], stats.SPARK_BLOCKS[0])
        self.assertEqual(line[1], stats.SPARK_BLOCKS[-1])


class TestCompletionCounts(unittest.TestCase):
    def test_counts_within_window_only(self):
        today = date(2026, 8, 30)
        actions = [
            _action_on(today, "vann"),
            _action_on(today - timedelta(days=1), "vann"),
            _action_on(today - timedelta(days=10), "vann"),
        ]
        counts = stats.completion_counts(actions, days=7, today=today)
        self.assertEqual(counts["vann"], 2)


if __name__ == "__main__":
    unittest.main()
