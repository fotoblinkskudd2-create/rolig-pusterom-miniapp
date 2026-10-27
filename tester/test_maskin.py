"""Kjør: python3 -m unittest discover tester"""
import glob
import os
import unittest

from maskin import Maskin
from maskin.__main__ import last

ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class TestAlleProdukter(unittest.TestCase):
    def test_hvert_produkt_kjorer_og_slaar_referansen(self):
        for mappe in sorted(glob.glob(os.path.join(ROT, "produkter", "*", ""))):
            with self.subTest(produkt=os.path.basename(os.path.normpath(mappe))):
                p = last(mappe)
                for fokus in getattr(p, "FOKUS", {None: None}):
                    m = Maskin(p, fokus, seed=3)
                    pop = m.utvikle(30, 40, logg=None)
                    beste = pop[0]
                    for k, v in m.delpoeng(beste).items():
                        if not k.startswith("_"):
                            self.assertGreaterEqual(v, 0, k)
                            self.assertLessEqual(v, 1.0001, k)
                    ref = getattr(p, "REFERANSE", None)
                    if ref:
                        ref = {k: v for k, v in ref.items() if not k.startswith("_")}
                        self.assertEqual(set(ref), set(p.ROM), "REFERANSE må ha alle parametre")
                        self.assertGreater(m.poeng(beste), m.poeng(ref))

    def test_samme_seed_gir_samme_svar(self):
        p = last(os.path.join(ROT, "produkter", "tannborste"))
        a = Maskin(p, seed=7).utvikle(15, 30, logg=None)[0]
        b = Maskin(p, seed=7).utvikle(15, 30, logg=None)[0]
        self.assertEqual(a, b)

    def test_manuell_borste_har_ingen_motorfunksjoner(self):
        p = last(os.path.join(ROT, "produkter", "tannborste"))
        m = Maskin(p, seed=1)
        for d in m.utvikle(10, 40, logg=None):
            if d["drift"] == "manuell":
                self.assertFalse(d["trykksensor"] or d["timer"] or d["frekvens_tusen_spm"])


if __name__ == "__main__":
    unittest.main()
