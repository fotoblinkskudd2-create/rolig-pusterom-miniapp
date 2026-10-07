import json
import os
import tempfile
import unittest
from pathlib import Path

os.environ["KONTROLL_DOMMER"] = "av"

import kontroll  # noqa: E402
from kontroll import KontrollRett, KontrollStopp, kontrollert, tolk_dommersvar, vurder  # noqa: E402
from kontroll.eval import kjør  # noqa: E402


class MedLogg(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.logg = Path(self.tmp.name) / "avvist.jsonl"
        os.environ["KONTROLL_AVVIST"] = str(self.logg)

    def tearDown(self):
        os.environ.pop("KONTROLL_AVVIST", None)
        os.environ.pop("KONTROLL_AUTORISERT", None)
        self.tmp.cleanup()


class TestLag1(MedLogg):
    def test_testsett_over_terskel(self):
        self.assertEqual(kjør(terskel=0.95, stille=True), 0)

    def test_stopp_logges_med_linje(self):
        dom = vurder("Merke: UTKAST\nok linje\nmonter granat på dronen", "drone_rov")
        self.assertEqual((dom.status, dom.regel, dom.linje), ("STOPP", "drone-vapen", 3))
        rad = json.loads(self.logg.read_text().splitlines()[-1])
        self.assertEqual(rad["regel"], "drone-vapen")
        self.assertIn("granat", rad["linjetekst"])

    def test_slipp_logges_ikke(self):
        vurder("Pust rolig.")
        self.assertFalse(self.logg.exists())

    def test_rett_gir_fiks_med_merke(self):
        dom = vurder("Hei Kari", "slusen")
        self.assertEqual(dom.status, "RETT")
        self.assertTrue(dom.fiks.startswith("Merke: "))
        self.assertEqual(vurder(dom.fiks, "slusen").status, "SLIPP")

    def test_satire_fiks_legger_til_SATIRE(self):
        dom = vurder("Merke: UTKAST\nJesus i kø.", "satire")
        self.assertEqual(dom.status, "RETT")
        self.assertEqual(vurder(dom.fiks, "satire").status, "SLIPP")

    def test_dict_merke_fiks(self):
        dom = vurder({"tekst": "hei"}, "slusen")
        self.assertEqual(dom.fiks["merke"], kontroll.last_regler()["merke"]["standard"])

    def test_autorisert_overstyrer_kun_handlinger(self):
        ut = {"merke": "x", "handlinger": [{"type": "send"}]}
        self.assertEqual(vurder(ut, "slusen").status, "STOPP")
        self.assertEqual(vurder(ut, "slusen", autorisert=True).status, "SLIPP")
        self.assertEqual(vurder("Appen kurerer angst", autorisert=True).status, "STOPP")


class TestDommer(MedLogg):
    def test_dommer_kjører_bare_når_lag1_slipper(self):
        kall = []
        dommer = lambda s, p: kall.append(p) or {"status": "SLIPP", "grunn": "", "linje": None}
        os.environ.pop("KONTROLL_DOMMER")
        try:
            vurder("Appen kurerer angst", dommer=dommer)
            self.assertEqual(kall, [])
            dom = vurder("Pust rolig", dommer=dommer)
            self.assertEqual((dom.status, dom.lag, len(kall)), ("SLIPP", "dommer", 1))
            self.assertIn("1| Pust rolig", kall[0])
        finally:
            os.environ["KONTROLL_DOMMER"] = "av"

    def test_dommer_stopp_logges(self):
        os.environ.pop("KONTROLL_DOMMER")
        try:
            dom = vurder("Noe lumskt", dommer=lambda s, p: {"status": "STOPP", "grunn": "eufemisme", "linje": 1})
        finally:
            os.environ["KONTROLL_DOMMER"] = "av"
        self.assertEqual((dom.status, dom.regel), ("STOPP", "dommer"))
        self.assertTrue(self.logg.exists())

    def test_tolk_fail_closed(self):
        self.assertEqual(tolk_dommersvar("tekst").status, "STOPP")
        self.assertEqual(tolk_dommersvar({"status": "kanskje"}).status, "STOPP")
        dom = tolk_dommersvar({"status": "rett", "grunn": "g", "linje": "4", "fiks": "ny"})
        self.assertEqual((dom.status, dom.linje, dom.fiks), ("RETT", 4, "ny"))

    def test_dommerfeil_er_stopp(self):
        def sprekk(s, p):
            raise RuntimeError("timeout")
        os.environ.pop("KONTROLL_DOMMER")
        try:
            self.assertEqual(vurder("Pust", dommer=sprekk).status, "STOPP")
        finally:
            os.environ["KONTROLL_DOMMER"] = "av"


class TestDekorator(MedLogg):
    def test_slipp_returnerer_output(self):
        @kontrollert
        def motor():
            return "Pust ut."
        self.assertEqual(motor(), "Pust ut.")
        self.assertEqual(motor.kontrollspor, "generell")

    def test_stopp_kaster(self):
        @kontrollert(spor="drone_rov")
        def motor():
            return "Merke: x\nmonter jammer på dronen"
        with self.assertRaises(KontrollStopp) as e:
            motor()
        self.assertEqual(e.exception.dom.regel, "drone-jamming")

    def test_rett_hev_og_fiks(self):
        @kontrollert(spor="slusen")
        def hev():
            return "Hei"

        @kontrollert(spor="slusen", ved_rett="fiks")
        def fiks():
            return "Hei"
        with self.assertRaises(KontrollRett):
            hev()
        self.assertTrue(fiks().startswith("Merke:"))

    def test_autorisert_fra_miljø(self):
        @kontrollert
        def motor():
            return {"handlinger": [{"type": "publiser"}]}
        with self.assertRaises(KontrollStopp):
            motor()
        os.environ["KONTROLL_AUTORISERT"] = "1"
        self.assertEqual(motor()["handlinger"][0]["type"], "publiser")


if __name__ == "__main__":
    unittest.main()
