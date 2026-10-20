#!/usr/bin/env python3
"""Mørkerom — strømbudsjett. Alle strømmer er HYPOTESE (ikke målt); resultatet er BEREGNET."""
KAP = 1000 * 0.8                 # mAh brukbart
DYP_UA = 15                      # deksel lukket: ESP32-S3 dypsøvn + RTC + hall-bryter (DRV5032 ~1 µA)
OPPV_MA, OPPV_S = 40, 2.0        # timesoppvåkning: sjekk fremkalling, oppfrisk e-blekk
AAPEN_MA = 45                    # deksel åpent: sensor i standby, MCU våken
BILDE_MA, BILDE_S = 260, 1.2     # eksponering + JPEG + AES + SD


def dogn(aapen_min, bilder):
    lukket = DYP_UA / 1000 * 24 + OPPV_MA * OPPV_S * 24 / 3600
    aapen = AAPEN_MA * aapen_min / 60
    foto = BILDE_MA * BILDE_S * bilder / 3600
    return lukket, aapen, foto


for navn, m, n in [("lukket hele døgnet", 0, 0), ("10 min åpent, 3 bilder", 10, 3), ("30 min åpent, 8 bilder", 30, 8), ("2 t åpent, 24 bilder", 120, 24)]:
    l, a, f = dogn(m, n)
    tot = l + a + f
    print(f"{navn:26s} lukket {l:5.2f}  åpent {a:6.1f}  bilder {f:5.2f}  = {tot:6.2f} mAh/døgn → {KAP / tot:6.0f} døgn")
