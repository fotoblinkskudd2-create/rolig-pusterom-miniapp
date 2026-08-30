import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from pusterom_cli import storage
from pusterom_cli.models import CheckIn, State


class TestStorage(unittest.TestCase):
    def setUp(self):
        self._tmp = TemporaryDirectory()
        self.addCleanup(self._tmp.cleanup)
        self.path = Path(self._tmp.name) / "data.json"

    def test_load_missing_file_returns_empty_state(self):
        state = storage.load(self.path)
        self.assertEqual(state.checkins, [])
        self.assertFalse(self.path.exists())

    def test_save_then_load_roundtrip(self):
        state = State()
        state.checkins.append(CheckIn.new(5, "toppdag"))
        storage.save(state, self.path)

        loaded = storage.load(self.path)
        self.assertEqual(len(loaded.checkins), 1)
        self.assertEqual(loaded.checkins[0].mood, 5)
        self.assertEqual(loaded.checkins[0].note, "toppdag")

    def test_corrupt_file_is_quarantined_and_recovered(self):
        self.path.write_text("{ dette er ikke gyldig json", encoding="utf-8")
        state = storage.load(self.path)
        self.assertEqual(state.checkins, [])
        # original path no longer holds the corrupt data
        backups = list(self.path.parent.glob("data.json.corrupt-*"))
        self.assertEqual(len(backups), 1)

    def test_save_creates_parent_directories(self):
        nested = Path(self._tmp.name) / "sub" / "dir" / "data.json"
        storage.save(State(), nested)
        self.assertTrue(nested.exists())


if __name__ == "__main__":
    unittest.main()
