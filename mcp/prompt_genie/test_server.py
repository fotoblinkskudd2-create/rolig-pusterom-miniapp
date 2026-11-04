import json
import os
import subprocess
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import server  # noqa: E402


class BuildPromptTests(unittest.TestCase):
    def test_contains_problem_and_context(self):
        p = server.build_prompt("Isolasjon om kvelden", "bor alene i ny by")
        self.assertIn("PROBLEM: Isolasjon om kvelden", p)
        self.assertIn("KONTEKST: bor alene i ny by", p)
        self.assertIn("Skriv IDE ≤3 setninger på nynorsk. Stopp.", p)

    def test_empty_input_uses_defaults(self):
        p = server.build_prompt("")
        self.assertIn("PROBLEM: uavklart problem", p)
        self.assertIn("KONTEKST: ingen ekstra kontekst", p)

    def test_truncates_to_max_chars(self):
        p = server.build_prompt("x" * 500)
        line = [l for l in p.split("\n") if l.startswith("PROBLEM: ")][0]
        self.assertEqual(len("PROBLEM: ") + server.DEFAULT_MAX_CHARS, len(line))

    def test_strips_control_chars_and_whitespace(self):
        p = server.build_prompt("a\x00b\n\n   c")
        self.assertIn("PROBLEM: ab c", p)

    def test_max_chars_is_clamped(self):
        p = server.build_prompt("y" * 5000, max_chars=10**6)
        line = [l for l in p.split("\n") if l.startswith("PROBLEM: ")][0]
        self.assertEqual(len("PROBLEM: ") + server.HARD_MAX_CHARS, len(line))


class ProtocolTests(unittest.TestCase):
    def test_initialize(self):
        r = server.handle({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}})
        self.assertEqual(r["result"]["serverInfo"]["name"], "prompt-genie")
        self.assertIn("tools", r["result"]["capabilities"])

    def test_notification_gets_no_reply(self):
        self.assertIsNone(server.handle({"jsonrpc": "2.0", "method": "notifications/initialized"}))

    def test_tools_list(self):
        r = server.handle({"jsonrpc": "2.0", "id": 2, "method": "tools/list"})
        self.assertEqual(r["result"]["tools"][0]["name"], "build_prompt")

    def test_tools_call(self):
        r = server.handle({"jsonrpc": "2.0", "id": 3, "method": "tools/call",
                           "params": {"name": "build_prompt", "arguments": {"problem": "stress"}}})
        text = r["result"]["content"][0]["text"]
        self.assertIn("PROBLEM: stress", text)
        self.assertFalse(r["result"]["isError"])

    def test_unknown_tool_and_method(self):
        r = server.handle({"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "nope"}})
        self.assertEqual(r["error"]["code"], -32602)
        r = server.handle({"jsonrpc": "2.0", "id": 5, "method": "foo"})
        self.assertEqual(r["error"]["code"], -32601)

    def test_stdio_roundtrip(self):
        msgs = "\n".join(json.dumps(m) for m in [
            {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}},
            {"jsonrpc": "2.0", "method": "notifications/initialized"},
            {"jsonrpc": "2.0", "id": 2, "method": "tools/list"},
        ]) + "\n"
        out = subprocess.run([sys.executable, os.path.join(HERE, "server.py")],
                             input=msgs, capture_output=True, text=True, timeout=10).stdout
        lines = [json.loads(l) for l in out.strip().split("\n")]
        self.assertEqual([l["id"] for l in lines], [1, 2])


if __name__ == "__main__":
    unittest.main()
