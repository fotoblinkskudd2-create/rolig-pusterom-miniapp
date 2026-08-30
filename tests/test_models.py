import unittest

from pusterom_cli.models import (
    ActionDone,
    CheckIn,
    State,
    ValidationError,
    validate_action_name,
    validate_mood,
    validate_note,
)


class TestValidation(unittest.TestCase):
    def test_mood_in_range_ok(self):
        for m in range(1, 6):
            self.assertEqual(validate_mood(m), m)

    def test_mood_out_of_range_raises(self):
        with self.assertRaises(ValidationError):
            validate_mood(0)
        with self.assertRaises(ValidationError):
            validate_mood(6)

    def test_mood_non_numeric_raises(self):
        with self.assertRaises(ValidationError):
            validate_mood("bra")

    def test_note_too_long_raises(self):
        with self.assertRaises(ValidationError):
            validate_note("x" * 501)

    def test_note_is_trimmed(self):
        self.assertEqual(validate_note("  hei  "), "hei")

    def test_action_name_empty_raises(self):
        with self.assertRaises(ValidationError):
            validate_action_name("   ")

    def test_action_name_too_long_raises(self):
        with self.assertRaises(ValidationError):
            validate_action_name("x" * 81)


class TestCheckIn(unittest.TestCase):
    def test_new_rejects_bad_mood(self):
        with self.assertRaises(ValidationError):
            CheckIn.new(9)

    def test_roundtrip_dict(self):
        c = CheckIn.new(4, "god dag")
        d = c.to_dict()
        c2 = CheckIn.from_dict(d)
        self.assertEqual(c.timestamp, c2.timestamp)
        self.assertEqual(c.mood, c2.mood)
        self.assertEqual(c.note, c2.note)


class TestState(unittest.TestCase):
    def test_all_actions_merges_custom(self):
        state = State(custom_actions={"kaffe": "Ta en kaffepause"})
        actions = state.all_actions()
        self.assertIn("vann", actions)
        self.assertIn("kaffe", actions)

    def test_roundtrip_dict(self):
        state = State()
        state.checkins.append(CheckIn.new(3, "middels"))
        state.action_log.append(ActionDone.new("vann"))
        state.custom_actions["kaffe"] = "Ta en kaffepause"

        restored = State.from_dict(state.to_dict())
        self.assertEqual(len(restored.checkins), 1)
        self.assertEqual(restored.checkins[0].mood, 3)
        self.assertEqual(len(restored.action_log), 1)
        self.assertEqual(restored.custom_actions["kaffe"], "Ta en kaffepause")


if __name__ == "__main__":
    unittest.main()
