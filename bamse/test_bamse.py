import json
import os
import tempfile
import unittest
from datetime import datetime

from bamse import Bamse

CFG = json.load(open(os.path.join(os.path.dirname(__file__), "config.eksempel.json")))


def t(hhmm, dag=12):
    return datetime(2026, 10, dag, *map(int, hhmm.split(":")))


class Test(unittest.TestCase):
    def lag(self, tilstand=None):
        self.sagt, self.varsler = [], []
        return Bamse(CFG, self.sagt.append, lambda tekst, p="default", tags="": self.varsler.append((p, tekst)), tilstand)

    def kjør(self, b, fra, til, klem_kl=()):
        for m in range(fra, til + 1):
            now = t(f"{m // 60}:{m % 60}")
            if now.strftime("%H:%M") in klem_kl:
                b.klem(now)
            b.tick(now)

    def test_medisin_bekreftet_gir_ingen_varsel(self):
        b = self.lag()
        b.klem(t("07:45"))  # livstegn
        self.kjør(b, 7 * 60 + 59, 9 * 60, klem_kl={"08:03"})
        self.assertIn("morgentablettene", self.sagt[1])
        self.assertEqual(b.s["rutiner"]["medisin@08:00"]["status"], "bekreftet")
        self.assertFalse(any("medisin" in v for _, v in self.varsler))

    def test_medisin_ubesvart_purrer_og_varsler_familie(self):
        b = self.lag()
        b.klem(t("07:45"))
        self.kjør(b, 7 * 60 + 59, 9 * 60)
        purr = [s for s in self.sagt if s.startswith("Ingrid, har du tatt")]
        self.assertEqual(len(purr), 2)
        self.assertIn(("high", "Ingrid har ikke bekreftet medisin kl 08:00 (3 påminnelser). Ring og sjekk."), self.varsler)

    def test_sen_oppstart_sier_ikke_ta_medisin(self):
        b = self.lag()
        b.tick(t("09:30"))
        self.assertFalse(any("tablett" in s for s in self.sagt))
        self.assertTrue(any("Bamsen var av kl 08:00" in v for _, v in self.varsler))

    def test_livstegn_alarm_og_avblåsing(self):
        b = self.lag()
        b.tick(t("10:29"))
        self.assertFalse(any(p == "urgent" for p, _ in self.varsler))
        b.tick(t("10:30"))
        self.assertTrue(any(p == "urgent" for p, _ in self.varsler))
        b.tick(t("10:31"))
        self.assertEqual(sum(p == "urgent" for p, _ in self.varsler), 1)
        b.klem(t("10:40"))
        self.assertTrue(any("Livstegn: Ingrid klemte bamsen kl 10:40" in v for _, v in self.varsler))

    def test_hold_poten_ringer_familien(self):
        b = self.lag()
        b.ring(t("15:12"))
        self.assertIn("vil gjerne prate", self.varsler[-1][1])
        self.assertEqual(self.varsler[-1][0], "high")

    def test_melding_leses_opp_og_klem_sendes_tilbake(self):
        b = self.lag()
        b.tick(t("23:00"))
        b.melding("Kari", "Vi kommer på søndag")
        b.tick(t("23:01"))
        self.assertFalse(any("søndag" in s for s in self.sagt))  # stilletid
        b.tick(t("07:31", dag=13))
        self.assertTrue(any("melding fra Kari. Vi kommer på søndag" in s for s in self.sagt))
        b.klem(t("07:32", dag=13))
        self.assertIn("hørte meldingen din", self.varsler[-1][1])

    def test_dagsrapport(self):
        b = self.lag()
        b.klem(t("07:45"))
        self.kjør(b, 7 * 60 + 59, 20 * 60, klem_kl={"08:01", "12:05"})
        rapport = [v for p, v in self.varsler if p == "low"][0]
        self.assertIn("✅ 08:00 medisin", rapport)
        self.assertIn("❌ 10:00 vann", rapport)
        self.assertIn("Ingen sendte Ingrid en melding i dag.", rapport)

    def test_omstart_husker_dagen(self):
        with tempfile.TemporaryDirectory() as d:
            f = os.path.join(d, "s.json")
            b = self.lag(f)
            b.tick(t("08:00"))
            b.klem(t("08:02"))
            b2 = self.lag(f)
            b2.tick(t("08:05"))
            self.assertEqual(self.sagt, [])  # ingen ny medisinpåminnelse etter omstart

    def test_ny_dag_nullstiller(self):
        b = self.lag()
        b.tick(t("08:00"))
        b.klem(t("08:01"))
        b.tick(t("08:00", dag=13))
        self.assertEqual(b.s["rutiner"]["medisin@08:00"]["status"], "aktiv")
        self.assertEqual(b.s["sist_kontakt"], "2026-10-12 08:01")


if __name__ == "__main__":
    unittest.main()
