"""12 syntetiske varer, startbeholdning og 90 dagers bevegelser (seed 12).
Inneholder interne flyttinger, én forsinket levering (V07) og én registreringsfeil som gir negativ beholdning (V11)."""
import csv
import datetime as dt
import os
import random

HER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
R = random.Random(12)
START = dt.date(2026, 7, 1)
varer = []
for i in range(1, 13):
    varer.append({"varenr": f"V{i:02d}", "navn": f"Testvare {i:02d}", "kostpris": [12.5, 49, 89, 230, 15, 7.9, 350, 64, 120, 19.9, 540, 33][i - 1],
                  "ledetid_dager": [5, 7, 10, 14, 5, 3, 21, 7, 10, 5, 28, 7][i - 1], "sikkerhetslager": [20, 10, 8, 3, 30, 50, 2, 10, 5, 25, 1, 12][i - 1],
                  "startbeholdning": [120, 60, 40, 12, 150, 300, 30, 50, 25, 140, 3, 70][i - 1], "snitt": [6, 3, 2, 0.5, 8, 15, 1.2, 2.5, 1.2, 7, 0.1, 3][i - 1]})
bev = []
for d in range(90):
    dato = (START + dt.timedelta(days=d)).isoformat()
    for v in varer:
        n = sum(1 for _ in range(int(v["snitt"] * 3) + 1) if R.random() < v["snitt"] / (int(v["snitt"] * 3) + 1))
        if n:
            bev.append({"dato": dato, "varenr": v["varenr"], "type": "salg", "antall": -n, "fra_lokasjon": "LAGER", "til_lokasjon": "", "ref": ""})
    if d % 10 == 3:
        v = varer[d % 12]
        bev.append({"dato": dato, "varenr": v["varenr"], "type": "intern_flytting", "antall": 0, "fra_lokasjon": "LAGER", "til_lokasjon": "BIL1", "ref": f"FL-{d}", "flytt_antall": 4})
# Faktiske historiske mottak
for v in varer:
    for d in (15, 45, 75):
        bev.append({"dato": (START + dt.timedelta(days=d)).isoformat(), "varenr": v["varenr"], "type": "mottak", "antall": int(v["snitt"] * 40) + 5, "fra_lokasjon": "", "til_lokasjon": "LAGER", "ref": f"INN-{v['varenr']}-{d}"})
# Forsinket levering V07: bestilt dag 10 med 21 d ledetid (forventet dag 31), mottatt dag 41
bev.append({"dato": (START + dt.timedelta(days=41)).isoformat(), "varenr": "V07", "type": "mottak", "antall": 15, "fra_lokasjon": "", "til_lokasjon": "LAGER", "ref": "INN-V07-FORSINKET", "forventet": (START + dt.timedelta(days=31)).isoformat()})
# Registreringsfeil: V11 selges 6 stk dag 5 med bare 3 på lager
bev.append({"dato": (START + dt.timedelta(days=5)).isoformat(), "varenr": "V11", "type": "salg", "antall": -6, "fra_lokasjon": "LAGER", "til_lokasjon": "", "ref": "FEIL-REG"})
bev.sort(key=lambda b: (b["dato"], b["varenr"], b["type"]))
# Interne flyttinger lagres som to rader (ut av LAGER, inn i BIL1) med netto null
ut = []
for b in bev:
    if b["type"] == "intern_flytting":
        n = b.pop("flytt_antall")
        ut.append({**b, "antall": -n, "til_lokasjon": "BIL1"})
        ut.append({**b, "antall": n, "fra_lokasjon": "LAGER"})
    else:
        ut.append(b)
felt = ["dato", "varenr", "type", "antall", "fra_lokasjon", "til_lokasjon", "ref", "forventet"]
with open(os.path.join(HER, "bevegelser.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=felt); w.writeheader(); w.writerows(ut)
with open(os.path.join(HER, "varer.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["varenr", "navn", "kostpris", "ledetid_dager", "sikkerhetslager", "startbeholdning"], extrasaction="ignore"); w.writeheader(); w.writerows(varer)
print(len(varer), "varer,", len(ut), "bevegelser")
