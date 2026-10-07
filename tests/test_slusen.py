import os
import tempfile
import unittest
from pathlib import Path

os.environ["KONTROLL_DOMMER"] = "av"
os.environ.pop("XAI_API_KEY", None)

from slusen import KRAV_FORPLIKTELSER, SannhetsBrudd, Slusen  # noqa: E402
from slusen.__main__ import main  # noqa: E402


class TestSlusen(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        d = Path(self.tmp.name)
        os.environ.update(SLUSEN_DATA=str(d / "s.json"), SLUSEN_UTKAST=str(d / "utkast"),
                          KONTROLL_AVVIST=str(d / "avvist.jsonl"), SLUSEN_IDAG="2026-10-07")
        self.s = Slusen()

    def tearDown(self):
        for k in ("SLUSEN_DATA", "SLUSEN_UTKAST", "KONTROLL_AVVIST", "SLUSEN_IDAG"):
            os.environ.pop(k, None)
        self.tmp.cleanup()

    def test_alle_ni_prosjekter_finnes(self):
        self.assertEqual(len(self.s.data["prosjekter"]), 9)
        self.assertIn("Svart Boks", self.s.data["prosjekter"])

    def test_tooling_blokkert_til_tre_forpliktelser(self):
        ider = [self.s.ny_kontakt("ZIP", f"K{i}")["id"] for i in range(3)]
        with self.assertRaises(SannhetsBrudd):
            self.s.sett_prosjektstatus("ZIP", "tooling")
        self.s.flytt(ider[0], "LOI")
        self.s.flytt(ider[1], "betalt")
        self.s.flytt(ider[2], "møte")
        with self.assertRaises(SannhetsBrudd):
            self.s.sett_prosjektstatus("zip", "tooling")
        self.s.flytt(ider[2], "loi")
        self.s.sett_prosjektstatus("ZIP", "tooling")
        self.assertEqual(self.s.prosjekt("ZIP")["status"], "tooling")
        self.assertEqual(KRAV_FORPLIKTELSER, 3)

    def test_cli_tooling_gir_exit_4(self):
        self.assertEqual(main(["prosjekt", "status", "VARDE", "tooling"]), 4)

    def test_idag_maks_tre_og_sortert(self):
        self.s.ny_kontakt("VARDE", "Kald")
        varm = self.s.ny_kontakt("VARDE", "Møte")
        self.s.flytt(varm["id"], "møte", dato="2026-10-07")
        self.s.ny_kontakt("ISHUD", "Varm", varm=True)
        self.s.ny_kontakt("ZIP", "Fremtid", dato="2026-12-01")
        liste = self.s.idag()
        self.assertEqual(len(liste), 3)
        self.assertEqual(liste[0]["kontakt"]["navn"], "Møte")
        self.assertEqual(liste[1]["kontakt"]["navn"], "Varm")
        self.assertTrue(all(h["sjanse"] >= liste[-1]["sjanse"] for h in liste))
        self.assertNotIn("Fremtid", [h["kontakt"] and h["kontakt"]["navn"] for h in liste])

    def test_utkast_skrives_merket_og_sendes_ikke(self):
        k = self.s.ny_kontakt("ISHUD", "Kari Nordmann", org="Tromsø Havn")
        sti = self.s.utkast(k["id"])
        self.assertTrue(sti.read_text().startswith("Merke: UTKAST"))
        self.assertEqual(sti.parent, self.s.utkastmappe)
        self.assertEqual(self.s.kontakt(k["id"])["status"], "kald")

    def test_rapport_teller_produsert_sendt_svar(self):
        a = self.s.ny_kontakt("VARDE", "A")
        b = self.s.ny_kontakt("VARDE", "B")
        self.s.utkast(a["id"])
        self.s.utkast(b["id"])
        self.s.hypoteser("VARDE")
        self.s.flytt(a["id"], "sendt")
        self.s.flytt(a["id"], "svar")
        r = self.s.rapport()
        self.assertEqual((r["produsert"], r["sendt"], r["svar"]), (3, 1, 1))

    def test_lagre_og_last(self):
        self.s.ny_kontakt("Hornat", "X")
        self.s.lagre()
        self.assertEqual(Slusen().data["kontakter"][0]["prosjekt"], "Hornat")


if __name__ == "__main__":
    unittest.main()
