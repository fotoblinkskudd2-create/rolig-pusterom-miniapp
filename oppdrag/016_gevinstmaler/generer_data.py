"""Syntetiske målinger (seed 16): to oppgavetyper, før og etter, ett ekstremt avvik, noen manglende varigheter."""
import csv
import datetime as dt
import os
import random

R = random.Random(16)
rader = []
def legg(type_, periode, start, uker, per_uke, median, spredning, feilrate, kilde):
    for u in range(uker):
        for _ in range(per_uke):
            d = start + dt.timedelta(days=u * 7 + R.randint(0, 4))
            v = max(1, round(R.gauss(median, spredning)))
            rader.append({"dato": d.isoformat(), "oppgavetype": type_, "periode": periode, "varighet_min": v,
                          "feil": int(R.random() < feilrate), "malekilde": kilde})
F, E = dt.date(2026, 8, 3), dt.date(2026, 9, 7)
legg("Fakturakontroll", "før", F, 4, 8, 12, 3, 0.12, "tidsstempel i fakturasystem")
legg("Fakturakontroll", "etter", E, 4, 10, 8, 2, 0.05, "tidsstempel i fakturasystem")
legg("Tilbudsskriving", "før", F, 4, 2, 50, 12, 0.10, "egenrapportert skjema")
legg("Tilbudsskriving", "etter", E, 4, 1, 40, 10, 0.10, "egenrapportert skjema")
rader.append({"dato": "2026-09-16", "oppgavetype": "Fakturakontroll", "periode": "etter", "varighet_min": 240, "feil": 1, "malekilde": "tidsstempel i fakturasystem"})
for i in (3, 17, 45):
    rader[i]["varighet_min"] = ""
rader.sort(key=lambda r: r["dato"])
os.makedirs("data", exist_ok=True)
with open("data/malinger.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rader[0])); w.writeheader(); w.writerows(rader)
print(len(rader), "rader")
