import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
from importer import summer  # noqa: E402


class T(unittest.TestCase):
    def test_summer(self):
        self.assertEqual(summer(["a;1,50", "b;2.25", ""]), 3.75)
