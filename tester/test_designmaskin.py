import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import designmaskin as dm  # noqa: E402


class TestDesignmaskin(unittest.TestCase):
    def test_slug(self):
        self.assertEqual(dm.slug("En ny tannbørste som gjør rent"), "ny_tannborste_gjor_rent")
        self.assertEqual(dm.slug("Kniv for barn – vanskelig å kutte seg!"), "kniv_barn_vanskelig_kutte_seg")
        self.assertTrue(dm.slug("!!!").startswith("produkt_"))
        self.assertLessEqual(len(dm.slug("ord " * 50)), 40)

    def test_kommando(self):
        k = dm.kommando("en kopp", "kopp", "en-modell")
        self.assertEqual(k[:2], ["claude", "-p"])
        self.assertTrue(k[2].startswith("/design en kopp"))
        verktoy = k[k.index("--allowedTools") + 1]
        for v in ("WebSearch", "Bash(python3:*)", "Write"):
            self.assertIn(v, verktoy)
        self.assertNotIn("Bash(rm", verktoy)
        self.assertEqual(k[-2:], ["--model", "en-modell"])

    def test_hendelser(self):
        linjer = dm.beskriv_hendelse({"type": "assistant", "message": {"content": [
            {"type": "text", "text": "Starter research"},
            {"type": "tool_use", "name": "WebSearch", "input": {"query": "kaffekopp isolasjon"}}]}})
        self.assertEqual(linjer, ["💬 Starter research", "🔧 WebSearch kaffekopp isolasjon"])
        r = dm.beskriv_hendelse({"type": "result", "is_error": False, "duration_ms": 120000,
                                 "total_cost_usd": 1.5, "result": "OK"})
        self.assertEqual(r[0], "✅ Ferdig")
        self.assertEqual(dm.beskriv_hendelse({"type": "system"}), [])

    def test_trygg_sti(self):
        self.assertIsNotNone(dm.trygg_sti("barnekniv", "SPESIFIKASJON.md"))
        self.assertIsNone(dm.trygg_sti("barnekniv", "../../designmaskin.py"))
        self.assertIsNone(dm.trygg_sti("..", "README.md"))
        self.assertIsNone(dm.trygg_sti("barnekniv", "finnes_ikke.md"))

    def test_sider(self):
        self.assertIn("Start design", dm.forside())
        self.assertIn("barnekniv", dm.produktside("barnekniv"))
        self.assertIsNone(dm.produktside("finnes_ikke"))


if __name__ == "__main__":
    unittest.main()
