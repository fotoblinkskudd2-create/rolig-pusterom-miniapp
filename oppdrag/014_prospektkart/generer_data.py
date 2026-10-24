"""20 syntetiske bedrifter. Organisasjonsnumrene starter på 1 (gyldig mod11, men utenfor Brønnøysunds nummerserie 8/9),
så de kan ikke kollidere med virkelige enheter."""
import csv
import json
import os

import register

HER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(HER, exist_ok=True)
nr, n = [], 10000000
while len(nr) < 20:
    n += 7
    for k in range(10):
        if register.gyldig_orgnr(f"{n}{k}"):
            nr.append(f"{n}{k}")
            break
NACE = [("43.210", "Elektrisk installasjonsarbeid"), ("43.220", "VVS-arbeid"), ("62.010", "Programmeringstjenester"), ("69.201", "Regnskap og bokføring"), ("56.101", "Drift av restauranter og kafeer")]
KOM = [("Tromsø", "9008"), ("Bodø", "8006"), ("Alta", "9510"), ("Harstad", "9405")]
B = []
for i, o in enumerate(nr):
    nk, kom = NACE[i % 5], KOM[i % 4]
    B.append({"orgnr": o, "navn": f"Syntetisk Bedrift {i + 1:02d} AS", "nace": nk[0], "nace_tekst": nk[1], "kommune": kom[0], "postnr": kom[1],
              "ansatte": None if i % 6 == 2 else [3, 8, 15, 40, 120][i % 5], "nettside": None})
# CSV: bedrift 1–14, med formatert orgnr for noen og én ugyldig rad
with open(os.path.join(HER, "manuell_liste.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["orgnr", "navn", "nace", "nace_tekst", "kommune", "postnr", "ansatte", "nettside"])
    w.writeheader()
    for i, b in enumerate(B[:14]):
        r = dict(b)
        if i % 3 == 0:
            r["orgnr"] = f"{b['orgnr'][:3]} {b['orgnr'][3:6]} {b['orgnr'][6:]}"
        r["ansatte"] = "" if b["ansatte"] is None else b["ansatte"]
        if i == 10:
            r["ansatte"] = ""  # CSV mangler størrelse, men registeret har den
        r["nettside"] = r["nettside"] or ""
        w.writerow(r)
    w.writerow({"orgnr": "123456789", "navn": "Feil Orgnr AS", "nace": "43.210", "nace_tekst": "", "kommune": "Tromsø", "postnr": "9008", "ansatte": "5", "nettside": ""})
# Enhetsregister-format: bedrift 11–20 (overlapp 11–14), én med annet navn (navnebytte)
enheter = []
for i, b in enumerate(B[10:], start=10):
    e = {"organisasjonsnummer": b["orgnr"], "navn": b["navn"].upper() if i != 12 else "Syntetisk Bedrift 13 Nytt Navn AS",
         "naeringskode1": {"kode": b["nace"], "beskrivelse": b["nace_tekst"]},
         "forretningsadresse": {"kommune": b["kommune"].upper(), "postnummer": b["postnr"]}}
    if b["ansatte"] is not None:
        e["antallAnsatte"] = b["ansatte"]; e["harRegistrertAntallAnsatte"] = True
    else:
        e["harRegistrertAntallAnsatte"] = False
    enheter.append(e)
json.dump({"_embedded": {"enheter": enheter}, "page": {"size": 20, "totalElements": len(enheter)}}, open(os.path.join(HER, "enhetsregisteret_utdrag.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(B, open(os.path.join(HER, "fasit.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(B), "bedrifter")
