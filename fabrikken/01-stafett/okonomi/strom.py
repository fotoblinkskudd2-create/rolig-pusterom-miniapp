#!/usr/bin/env python3
"""Strømbudsjett for Stafett på batteri alene (USB er normaldrift). Alle tall BEREGNET fra antatte strømmer (HYPOTESE)."""
KAP_MAH = 1200 * 0.8          # 80 % brukbart
SOVN_UA = 130                 # lett søvn (GPIO9/hjulet kan ikke vekke fra dyp søvn på C3) — HYPOTESE, datablad ~130 µA
LDO_UA = 40                   # ME6211 hvilestrøm
OPPDATER_MA, OPPDATER_S = 25, 1.2      # våkn + delvis oppfrisking
OPPDATERINGER = 24 * 60       # hvert minutt (klokka)
WIFI_MA, WIFI_MIN = 90, 10    # telefon koblet per døgn


def mah_per_dogn(oppdateringer=OPPDATERINGER, wifi_min=WIFI_MIN):
    sovn = (SOVN_UA + LDO_UA) / 1000 * 24
    oppd = OPPDATER_MA * OPPDATER_S * oppdateringer / 3600
    wifi = WIFI_MA * wifi_min / 60
    return sovn, oppd, wifi


for navn, n in [("hvert minutt", 24 * 60), ("hvert 5. minutt", 24 * 12), ("bare ved endring (~40/døgn)", 40)]:
    s, o, w = mah_per_dogn(n)
    tot = s + o + w
    print(f"{navn:28s}  søvn {s:5.1f}  skjerm {o:5.1f}  wifi {w:5.1f}  = {tot:5.1f} mAh/døgn → {KAP_MAH / tot:4.1f} døgn")
