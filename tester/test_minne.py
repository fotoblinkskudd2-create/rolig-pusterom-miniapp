import base64
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import designmaskin as dm  # noqa: E402
from maskin import minne  # noqa: E402


class MidlertidigMinne(unittest.TestCase):
    """Peker minnet til en tom mappe, så testene ikke rører eierens ekte minne."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.gammelt = (minne.MINNE, minne.INNSPILL, minne.INDEKS)
        minne.MINNE = self.tmp.name
        minne.INNSPILL = os.path.join(self.tmp.name, "innspill.jsonl")
        minne.INDEKS = os.path.join(self.tmp.name, "produkter.json")

    def tearDown(self):
        minne.MINNE, minne.INNSPILL, minne.INDEKS = self.gammelt
        self.tmp.cleanup()


class TestMinne(MidlertidigMinne):
    def test_husk_og_les(self):
        minne.husk("Kniven ble for dyr, mål under 300 kr", "tilbakemelding", "barnekniv")
        minne.husk("Ingen app for den eldre", "preferanse")
        rader = minne.innspill()
        self.assertEqual([r["type"] for r in rader], ["tilbakemelding", "preferanse"])
        self.assertEqual(rader[0]["produkt"], "barnekniv")
        with self.assertRaises(ValueError):
            minne.husk("x", "tull")

    def test_sok_finner_relevant(self):
        minne.husk("Barnekniven bør koste under 300 kr", "tilbakemelding")
        minne.husk("Dronepropellen må tåle regn", "tilbakemelding")
        inn, _ = minne.sok("ny kniv for barn")
        self.assertTrue(inn and "Barnekniven" in inn[0]["tekst"])

    def test_indeks_og_kontekst(self):
        rader = minne.oppdater_indeks()   # leser ekte produkter/, skriver til midlertidig minne
        mapper = {r["mappe"] for r in rader}
        self.assertIn("produkter/barnekniv", mapper)
        minne.husk("Bruk aldri kamera på beboere", "preferanse")
        k = minne.kontekst("kniv for barn")
        self.assertIn("Bruk aldri kamera", k)
        self.assertIn("produkter/barnekniv", k)

    def test_importer_fra_nettsiden(self):
        rader = [{"tekst": "Lag en sykkellås", "type": "ide", "tid": "2026-10-28T10:15:00Z"},
                 {"tekst": "  ", "type": "ide"}, {"tekst": "Ukjent type", "type": "tull"}]
        self.assertEqual(minne.importer(rader), 2)
        self.assertEqual(minne.importer(rader), 0)          # ingen dubletter
        self.assertEqual(minne.innspill()[-1]["type"], "notat")
        sti = os.path.join(minne.MINNE, "innspill.md")
        minne.eksporter_md(sti)
        self.assertIn("Lag en sykkellås", open(sti).read())

    def test_kommando_tar_med_minne(self):
        minne.husk("Svar alltid på norsk", "preferanse")
        prompt = dm.kommando("en kopp", "kopp")[2]
        self.assertIn("## Fra minnet", prompt)
        self.assertIn("Svar alltid på norsk", prompt)


class TestFilOgSide(MidlertidigMinne):
    def test_lagre_fil_er_trygg(self):
        navn = dm.lagre_fil("../../hack.py", base64.b64encode(b"print(1)").decode(), "skisse")
        self.assertNotIn("/", navn)
        self.assertTrue(os.path.exists(os.path.join(minne.MINNE, "filer", navn)))
        self.assertFalse(os.path.exists(os.path.join(minne.MINNE, "..", "hack.py")))
        self.assertEqual(minne.innspill()[-1]["type"], "fil")
        with self.assertRaises(ValueError):
            dm.lagre_fil("x.png", "ikke base64!!")

    def test_minneside(self):
        minne.husk("<script>alert(1)</script>", "notat")
        s = dm.minneside()
        self.assertIn("Lagre i minnet", s)
        self.assertNotIn("<script>alert(1)</script>", s)
        self.assertIn("&lt;script&gt;", s)


if __name__ == "__main__":
    unittest.main()
