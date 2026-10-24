"""Lager syntetiske ordre- og fakturafiler med kjent fasit (deterministisk, seed 3)."""
import csv
import json
import os
import random

HER = os.path.dirname(os.path.abspath(__file__))
R = random.Random(3)
LEV = [("910000001", "Fiktiv Byggvare AS"), ("910000002", "Testrør Engros AS"), ("910000003", "Demo Elektrogross AS")]

ordre, faktura, fasit = [], [], {}
ordrenr = 1000
for i in range(33):
    orgnr, navn = LEV[i % 3]
    ordrenr += 1
    pris = R.choice([100, 250, 1234.5, 89.9, 499, 1999])
    antall = R.randint(1, 20)
    dag = 1 + i % 25
    ordre.append(dict(ordrenr=f"PO-{ordrenr}", linjenr=1, leverandor_orgnr=orgnr, leverandor=navn, varenr=f"V{i:03d}",
                      antall=antall, enhetspris=f"{pris:.2f}", valuta="NOK", ordredato=f"2026-09-{dag:02d}"))
    # Varierte formater som skal normaliseres
    ref = [f"PO-{ordrenr}", f"po{ordrenr}", f"{ordrenr}"][i % 3]
    dato = [f"2026-09-{dag + 2:02d}", f"{dag + 2:02d}.09.2026"][i % 2]
    belop = f"{pris * antall:,.2f}".replace(",", " ").replace(".", ",") if i % 2 else f"{pris * antall:.2f}"
    faktura.append(dict(fakturanr=f"F{5000 + i}", fakturadato=dato, leverandor_orgnr=orgnr, leverandor=navn,
                        ordreref=ref, linjenr=1, varenr=f"V{i:03d}", antall=antall,
                        enhetspris=f"{pris:.2f}".replace(".", ",") if i % 2 else f"{pris:.2f}", belop=belop, valuta="NOK"))
    fasit[f"F{5000 + i}"] = "ok"

# Samme beløp og dato hos to ulike leverandører: skal IKKE bli duplikat
faktura[3]["belop"], faktura[4]["belop"] = "1000.00", "1000.00"
for idx in (3, 4):
    o = ordre[idx]
    o["antall"], o["enhetspris"] = 4, "250.00"
    faktura[idx].update(antall=4, enhetspris="250.00", fakturadato="2026-09-10")
# Én ren linje uten ordrereferanse, men med entydig kandidat: tilnærmet match uten avvik
faktura[6]["ordreref"] = ""
fasit[faktura[6]["fakturanr"]] = "ok_tilnaermet"


def ny_ordre(ref, orgnr, navn, varenr, antall, pris, dato, valuta="NOK"):
    ordre.append(dict(ordrenr=ref, linjenr=1, leverandor_orgnr=orgnr, leverandor=navn, varenr=varenr,
                      antall=antall, enhetspris=f"{pris:.2f}", valuta=valuta, ordredato=dato))


def ny_faktura(fnr, dato, orgnr, navn, ref, varenr, antall, pris, valuta="NOK", belop=None):
    faktura.append(dict(fakturanr=fnr, fakturadato=dato, leverandor_orgnr=orgnr, leverandor=navn, ordreref=ref,
                        linjenr=1, varenr=varenr, antall=antall, enhetspris=f"{pris:.2f}",
                        belop=f"{belop if belop is not None else antall * pris:.2f}", valuta=valuta))


# D1 prisavvik
ny_ordre("PO-2001", *LEV[0], "VX1", 10, 100, "2026-09-05")
ny_faktura("F6001", "2026-09-08", *LEV[0], "PO-2001", "VX1", 10, 105)
fasit["F6001"] = "bekreftet_avvik"
# D2 antallsavvik
ny_ordre("PO-2002", *LEV[1], "VX2", 10, 50, "2026-09-05")
ny_faktura("F6002", "2026-09-09", *LEV[1], "PO-2002", "VX2", 12, 50)
fasit["F6002"] = "bekreftet_avvik"
# D3 eksakt duplikat (samme leverandør og fakturanr) av en ren linje
dup = dict(faktura[10])
faktura.append(dup)
fasit[dup["fakturanr"] + "#2"] = "bekreftet_avvik"
# D4 samme ordrelinje fakturert på nytt med nytt fakturanr
src = dict(faktura[11]); src["fakturanr"] = "F6004"; src["fakturadato"] = "2026-09-20"
faktura.append(src)
fasit["F6004"] = "mulig_avvik"
# D5 valutaavvik
ny_ordre("PO-2005", *LEV[2], "VX5", 3, 200, "2026-09-06")
ny_faktura("F6005", "2026-09-10", *LEV[2], "PO-2005", "VX5", 3, 200, valuta="EUR")
fasit["F6005"] = "bekreftet_avvik"
# A1 uten ordreref, to like kandidater hos samme leverandør
ny_ordre("PO-3001", *LEV[0], "VY1", 5, 300, "2026-09-12")
ny_ordre("PO-3002", *LEV[0], "VY2", 5, 300, "2026-09-13")
ny_faktura("F7001", "2026-09-15", *LEV[0], "", "", 5, 300)
fasit["F7001"] = "uavklart"
# A2 uten ordreref, beløpet passer, men datoen er utenfor vinduet
ny_ordre("PO-3003", *LEV[1], "VY3", 2, 777, "2026-07-01")
ny_faktura("F7002", "2026-09-25", *LEV[1], "", "", 2, 777)
fasit["F7002"] = "uavklart"

assert len(faktura) == 40, len(faktura)


def skriv(navn, rader):
    with open(os.path.join(HER, "data", navn), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rader[0].keys()))
        w.writeheader()
        w.writerows(rader)


skriv("ordre.csv", ordre)
skriv("faktura.csv", faktura)
# Fasit per radnummer i faktura.csv (header = rad 1)
sett, per_rad = {}, {}
for i, f in enumerate(faktura):
    n = f["fakturanr"]
    sett[n] = sett.get(n, 0) + 1
    nokkel = n if sett[n] == 1 else f"{n}#{sett[n]}"
    per_rad[str(i + 2)] = {"fakturanr": n, "forventet": fasit[nokkel]}
with open(os.path.join(HER, "data", "fasit.json"), "w", encoding="utf-8") as f:
    json.dump(per_rad, f, ensure_ascii=False, indent=1)
print("skrev", len(ordre), "ordrelinjer og", len(faktura), "fakturalinjer")
