"""Domain models for Pusterom CLI: check-ins, small actions, and persisted state."""
from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Optional

MOOD_MIN, MOOD_MAX = 1, 5
NOTE_MAX_LEN = 500
ACTION_NAME_MAX_LEN = 80


class ValidationError(ValueError):
    """Raised when user-supplied data fails validation."""


def _now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def validate_mood(mood) -> int:
    try:
        mood = int(mood)
    except (TypeError, ValueError):
        raise ValidationError(f"Humør må være et heltall mellom {MOOD_MIN} og {MOOD_MAX}.")
    if not (MOOD_MIN <= mood <= MOOD_MAX):
        raise ValidationError(f"Humør må være mellom {MOOD_MIN} og {MOOD_MAX}, fikk {mood}.")
    return mood


def validate_note(note: Optional[str]) -> str:
    note = (note or "").strip()
    if len(note) > NOTE_MAX_LEN:
        raise ValidationError(f"Notat er for langt ({len(note)} tegn, maks {NOTE_MAX_LEN}).")
    return note


def validate_action_name(name: Optional[str]) -> str:
    name = (name or "").strip()
    if not name:
        raise ValidationError("Navn på grep kan ikke være tomt.")
    if len(name) > ACTION_NAME_MAX_LEN:
        raise ValidationError(f"Navn er for langt ({len(name)} tegn, maks {ACTION_NAME_MAX_LEN}).")
    return name


@dataclass
class CheckIn:
    timestamp: str
    mood: int
    note: str = ""

    @staticmethod
    def new(mood, note: str = "") -> "CheckIn":
        return CheckIn(timestamp=_now_iso(), mood=validate_mood(mood), note=validate_note(note))

    def to_dict(self) -> dict:
        return asdict(self)

    @staticmethod
    def from_dict(d: dict) -> "CheckIn":
        return CheckIn(timestamp=d["timestamp"], mood=int(d["mood"]), note=d.get("note", ""))

    @property
    def when(self) -> datetime:
        return datetime.fromisoformat(self.timestamp)


@dataclass
class ActionDone:
    timestamp: str
    action_id: str

    @staticmethod
    def new(action_id: str) -> "ActionDone":
        return ActionDone(timestamp=_now_iso(), action_id=action_id)

    def to_dict(self) -> dict:
        return asdict(self)

    @staticmethod
    def from_dict(d: dict) -> "ActionDone":
        return ActionDone(timestamp=d["timestamp"], action_id=d["action_id"])

    @property
    def when(self) -> datetime:
        return datetime.fromisoformat(self.timestamp)


DEFAULT_ACTIONS = {
    "vann": "Drikk et glass vann",
    "gange": "Gå 5 minutter, gjerne ute",
    "strekk": "Strekk på deg i 60 sekunder",
    "pust3": "Ta tre dype, bevisste pust",
    "himmel": "Gå ut og se på himmelen et minutt",
    "skriv": "Skriv ned én ting som plager deg",
}


@dataclass
class State:
    version: int = 1
    checkins: list = field(default_factory=list)
    action_log: list = field(default_factory=list)
    custom_actions: dict = field(default_factory=dict)

    def all_actions(self) -> dict:
        merged = dict(DEFAULT_ACTIONS)
        merged.update(self.custom_actions)
        return merged

    def to_dict(self) -> dict:
        return {
            "version": self.version,
            "checkins": [c.to_dict() for c in self.checkins],
            "action_log": [a.to_dict() for a in self.action_log],
            "custom_actions": dict(self.custom_actions),
        }

    @staticmethod
    def from_dict(d: dict) -> "State":
        return State(
            version=int(d.get("version", 1)),
            checkins=[CheckIn.from_dict(c) for c in d.get("checkins", [])],
            action_log=[ActionDone.from_dict(a) for a in d.get("action_log", [])],
            custom_actions=dict(d.get("custom_actions", {})),
        )
