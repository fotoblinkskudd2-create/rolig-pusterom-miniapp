import json, os, subprocess, sys, unittest
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOOK = os.path.join(ROOT, ".claude", "hooks", "hemmelighetsvakt.py")
def kjør(inp):
    return subprocess.run([sys.executable, HOOK], input=json.dumps({"tool_input": inp}),
                          capture_output=True, text=True).returncode
class Hemmelighet(unittest.TestCase):
    def test_blokkerer(self):
        for s in ["sk-ant-" + "A" * 30, "ghp_" + "b" * 36, "AKIA" + "ABCDEFGHIJKLMNOP",
                  "-----BEGIN OPENSSH PRIVATE KEY-----", "fnr 01019912345"]:
            self.assertEqual(kjør({"file_path": "/p/a.md", "content": s}), 2, s)
    def test_edit(self):
        self.assertEqual(kjør({"file_path": "/p/a.py", "new_string": "k='ghp_" + "x" * 36 + "'"}), 2)
    def test_rent(self):
        self.assertEqual(kjør({"file_path": "/p/a.md", "content": "Hei, pris 249 kr (HYPOTESE)"}), 0)
    def test_testfiler_unntatt(self):
        self.assertEqual(kjør({"file_path": "/p/tests/x.py", "content": "sk-ant-" + "A" * 30}), 0)
if __name__ == "__main__": unittest.main()
