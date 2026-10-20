#!/usr/bin/env python3
"""Vindusvakt — strømbudsjett. Strømmer er HYPOTESE (ikke målt); resultatet er BEREGNET."""
KAP = 2000 * 0.8
DYP_UA = 15                        # ESP32-S3 dypsøvn + RTC + hall
OPPV_MA, OPPV_S = 150, 3.0         # våkne, kamera på, 7 rammer for eksponering, dithering, lagre
EPD_MA, EPD_S = 30, 4.5            # full oppfrisking 7,5"
KNAPP_PER_DOGN = 6                 # sidebytter: hver = oppvåkning + oppfrisking uten kamera
WIFI_MA, WIFI_MIN = 100, 0         # telefon kobles sjelden; 0 i normal drift

def dogn(knapper=KNAPP_PER_DOGN, wifi_min=WIFI_MIN):
    sovn = DYP_UA / 1000 * 24
    timer = 24 * (OPPV_MA * OPPV_S + EPD_MA * EPD_S) / 3600
    knapp = knapper * (40 * 1.0 + EPD_MA * EPD_S) / 3600
    wifi = WIFI_MA * wifi_min / 60
    return sovn + timer + knapp + wifi

for navn, k, w in [("normal (6 sidebytter)", 6, 0), ("mye bruk (20 bytter)", 20, 0), ("med 10 min telefon", 6, 10)]:
    t = dogn(k, w)
    print(f"{navn:24s} {t:5.2f} mAh/døgn → {KAP / t:5.0f} døgn på 2 000 mAh")
