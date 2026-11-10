import os
import subprocess
import sys
import unittest

from main import judge

MAIN = os.path.join(os.path.dirname(os.path.abspath(__file__)), "main.py")


def run_cli(*args, stdin=""):
    return subprocess.run(
        [sys.executable, MAIN, *args],
        input=stdin, capture_output=True, text=True,
    )


class JudgeTests(unittest.TestCase):
    def test_true_fact(self):
        self.assertTrue(judge("Is the sky blue?")[0])
        self.assertTrue(judge("Water boils at 100°C")[0])

    def test_true_moral(self):
        self.assertTrue(judge("Stealing is wrong")[0])

    def test_false_claim(self):
        self.assertFalse(judge("The earth is flat")[0])

    def test_negation_flips(self):
        self.assertFalse(judge("Stealing is not wrong")[0])
        self.assertTrue(judge("The earth is not flat")[0])

    def test_norwegian(self):
        self.assertTrue(judge("Himmelen er blå")[0])
        self.assertTrue(judge("Å stjele er galt")[0])

    def test_unknown_is_galt(self):
        verdict, reason = judge("Pineapple belongs on pizza")
        self.assertFalse(verdict)
        self.assertIn("Cannot be verified", reason)

    def test_empty(self):
        self.assertEqual(judge(""), (False, "Input is empty."))
        self.assertFalse(judge("   \n")[0])

    def test_malformed(self):
        self.assertIn("malformed", judge("12345")[1])
        self.assertIn("malformed", judge("!!! ###")[1])

    def test_non_text(self):
        for value in (None, 42, ["sky", "blue"], b"sky is blue"):
            verdict, reason = judge(value)
            self.assertFalse(verdict)
            self.assertIn("not text", reason)


class CliTests(unittest.TestCase):
    def test_rett_exit_zero(self):
        result = run_cli("Is the sky blue?")
        self.assertEqual(result.returncode, 0)
        self.assertTrue(result.stdout.startswith("RETT"))

    def test_galt_exit_one(self):
        result = run_cli("")
        self.assertEqual(result.returncode, 1)
        self.assertTrue(result.stdout.startswith("GALT"))

    def test_stdin(self):
        result = run_cli(stdin="the earth is flat\n")
        self.assertEqual(result.returncode, 1)
        self.assertTrue(result.stdout.startswith("GALT"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
