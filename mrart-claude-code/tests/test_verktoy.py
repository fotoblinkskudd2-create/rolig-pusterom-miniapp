import os, sys, unittest
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import merkevakt, kontrakt

class Merkevakt(unittest.TestCase):
    def test_umerket(self):
        self.assertTrue(merkevakt.sjekk("Vi får 40 kunder i måneden."))
    def test_merket(self):
        self.assertFalse(merkevakt.sjekk("Vi får 40 kunder i måneden (HYPOTESE)."))
    def test_svada(self):
        self.assertTrue(merkevakt.sjekk("En revolusjonerende app."))
    def test_kodeblokk_ignoreres(self):
        self.assertFalse(merkevakt.sjekk("```\npris = 249 kr\n```"))

class Kontrakt(unittest.TestCase):
    def k(self):
        k = kontrakt.ny("T1", "test")
        k["akseptkriterier"] = [{"krav": "a", "bevis": None, "bestatt": False}]
        return k
    def test_ny_valid(self):
        self.assertEqual(kontrakt.valider(self.k()), [])
    def test_ulovlig_overgang(self):
        with self.assertRaises(ValueError): kontrakt.bytt_status(self.k(), "LEVERT")
    def test_falsk_ferdig(self):
        k = self.k(); kontrakt.bytt_status(k, "BYGG"); kontrakt.bytt_status(k, "KONTROLL")
        with self.assertRaises(ValueError): kontrakt.bytt_status(k, "KLAR FOR GODKJENNING")
    def test_klar_med_bevis_og_hash(self):
        k = self.k(); kontrakt.bytt_status(k, "BYGG"); kontrakt.bytt_status(k, "KONTROLL")
        k["akseptkriterier"][0].update(bevis="logg.txt", bestatt=True)
        kontrakt.bytt_status(k, "KLAR FOR GODKJENNING")
        self.assertEqual(kontrakt.valider(k), [])
        k["mal"] = "endret"
        self.assertIn("contract_hash stemmer ikke — SPEC er endret etter låsing", kontrakt.valider(k))
    def test_levert_krever_menneske(self):
        k = self.k(); kontrakt.bytt_status(k, "BYGG"); kontrakt.bytt_status(k, "KONTROLL")
        k["akseptkriterier"][0].update(bevis="x", bestatt=True)
        kontrakt.bytt_status(k, "KLAR FOR GODKJENNING")
        with self.assertRaises(ValueError): kontrakt.bytt_status(k, "LEVERT")
        k["godkjent_av"] = "operatør"; k["status"]["distribusjon"] = "kunde A"
        kontrakt.bytt_status(k, "LEVERT"); self.assertEqual(k["status"]["verdi"], "LEVERT")

if __name__ == "__main__": unittest.main()
