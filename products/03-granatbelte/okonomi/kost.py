"""Granatbelte — økonomi. Leser cad/rapport.txt. Kjør: python3 products/03-granatbelte/okonomi/kost.py"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
rap = (ROOT / "cad" / "rapport.txt").read_text()
grams = float(re.search(r"≈ (\d+) g PLA", rap).group(1))
minutes = float(re.search(r"Print-estimat : ~(\d+)", rap).group(1))


def kr(x):
    return f"{x:,.0f} kr".replace(",", " ")


bom = [
    (f"PLA {grams:.0f} g à 200 kr/kg (est.)", grams * 0.20),
    (f"Strøm {minutes:.0f} min à 120 W, 1,50 kr/kWh (est.)", 0.120 * minutes / 60 * 1.50),
    ("Printer-slitasje (est.)", 4.0),
    ("4 filtføtter Ø10 (est.)", 3.0),
    ("10 kort: 300 g-kartong + laminering (est.)", 12.0),
    ("Eske (est.)", 10.0),
    ("Porto pakke i postkassen ≤ 350 g (est.)", 79.0),
]
cogs = sum(c for _, c in bom)
PRICE, MVA = 299.0, 0.25
net = PRICE / (1 + MVA)
db = net - cogs
SCHOOL, SCHOOL_N = 3490.0, 15   # klassesett: 15 stativ + 150 blanke kort, sendt samlet
school_cogs = SCHOOL_N * (cogs - 79 - 10) + 250
school_db = SCHOOL / (1 + MVA) - school_cogs

L = ["# 03 — GRANATBELTE · Økonomi\n",
     "Generert av `okonomi/kost.py`. Programvaren er gratis og åpen. Det som selges er det fysiske beltet. (est.) = antakelse.\n",
     "## 1. Stativ + 10 kort, sendt\n", "| Post | Kost |\n|---|---:|"]
L += [f"| {n} | {c:.2f} kr |" for n, c in bom]
L += [f"| **Sum** | **{cogs:.2f} kr** |\n",
      f"Pris **{kr(PRICE)}** → netto {net:.2f} → **dekningsbidrag {db:.2f} kr** ({db / net * 100:.0f} %).",
      f"Printtid {minutes:.0f} min per stativ → ~8 per printer per døgn. Porto er {79 / cogs * 100:.0f} % av kostnaden. Tredje gang. Mønsteret er reelt.\n",
      "## 2. Klassesett — kildekritikk i skolen\n",
      f"{SCHOOL_N} stativ + 150 blanke kort, én forsendelse (250 kr frakt est.), {kr(SCHOOL)} inkl. mva → vareforbruk {school_cogs:.0f} kr → "
      f"**dekningsbidrag {kr(school_db)} per klassesett**.",
      "Kildekritikk står i læreplanen. Et fysisk kort med tall-på-forsiden, kilde-på-baksiden er kildekritikk du kan holde i hånda. "
      "Elevene skriver gonzo om noe de bryr seg om — og hvert tall må ha et kort.\n",
      "## 3. År 1\n",
      "| Scenario | Belter | Klassesett | Dekningsbidrag |\n|---|---:|---:|---:|"]
for n, a, b in [("Stille", 40, 0), ("Basis", 200, 3), ("Treffer", 800, 15)]:
    L.append(f"| {n} | {a} | {b} | {kr(a * db + b * school_db)} |")
L += ["\nÆrlig: den viktigste leveransen er gratis — en skrivemaskin som nekter å la deg kaste en granat uten sikring. "
      "Stativet er en påminnelse du kan ta på."]
(ROOT / "OKONOMI.md").write_text("\n".join(L) + "\n")
print("\n".join(L))
