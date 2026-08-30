"""Streaks, mood trends and completion stats for Pusterom CLI."""
from __future__ import annotations

from datetime import date, timedelta

SPARK_BLOCKS = "▁▂▃▄▅▆▇█"


def _active_days(checkins, actions) -> set:
    days = {c.when.date() for c in checkins}
    days |= {a.when.date() for a in actions}
    return days


def current_streak(checkins, actions, today=None) -> int:
    """Consecutive active days, counted backward from today.

    A day with no activity yet does not zero the streak: if yesterday
    was active, the streak stays "on grace" through today so a late
    check-in still counts and the number doesn't lie to you at 8am.
    """
    today = today or date.today()
    days = _active_days(checkins, actions)
    if not days:
        return 0
    start = today if today in days else today - timedelta(days=1)
    if start not in days:
        return 0
    streak = 0
    cursor = start
    while cursor in days:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def mood_by_day(checkins, days: int, today=None):
    """Average mood per day for the last `days` days, oldest first. None = no data."""
    today = today or date.today()
    buckets = {}
    for c in checkins:
        buckets.setdefault(c.when.date(), []).append(c.mood)
    out = []
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        moods = buckets.get(d)
        out.append((d, sum(moods) / len(moods) if moods else None))
    return out


def sparkline(values) -> str:
    chars = []
    for v in values:
        if v is None:
            chars.append(" ")
            continue
        idx = min(len(SPARK_BLOCKS) - 1, max(0, round((v - 1) / 4 * (len(SPARK_BLOCKS) - 1))))
        chars.append(SPARK_BLOCKS[idx])
    return "".join(chars)


def completion_counts(actions, days: int, today=None) -> dict:
    today = today or date.today()
    cutoff = today - timedelta(days=days - 1)
    counts = {}
    for a in actions:
        d = a.when.date()
        if cutoff <= d <= today:
            counts[a.action_id] = counts.get(a.action_id, 0) + 1
    return counts
