"""Brevvakt — økonomi. Leser cad/rapport.txt. Kjør: python3 products/04-brevvakt/okonomi/kost.py"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
rap = (ROOT / "cad" / "rapport.txt").read_text()
grams = float(re.search(r"≈ (\d+) g PLA", rap).group(1))
minutes = float(re.search(r"~(\d+) min", rap).group(1))


def kr(x):
    return f"{x:,.0f} kr".replace(",", " ")


bom = [(f"PLA {grams:.0f} g à 200 kr/kg (est.)", grams * 0.2), (f"Strøm {minutes:.0f} min (est.)", 0.12 * minutes / 60 * 1.5),
       ("Printer-slitasje (est.)", 4.0), ("9 mm brekkblad, 1 segment (est.)", 0.5), ("Eske (est.)", 10.0),
       ("Porto pakke i postkassen (est.)", 79.0)]
cogs = sum(c for _, c in bom)
PRICE = 249.0
net = PRICE / 1.25
db = net - cogs
CASES = 9_156_870      # Finanstilsynet, nye inkassosaker mot forbrukere 2025
L = ["# 04 — BREVVAKT · Økonomi\n",
     "Generert av `okonomi/kost.py`. (est.) = antakelse.\n",
     "## 1. Hvor mye penger ligger i takene?\n",
     f"Finanstilsynet: **{CASES:,} nye inkassosaker mot forbrukere i 2025**".replace(",", " ") + ", 61,2 mrd kr misligholdt forbruksgjeld hos inkassoselskapene.",
     "Vi vet ikke hvor mange av dem som har overkrav — jeg har ikke funnet et offentlig tall. Så her er et *følsomhetsregnestykke*, ikke en påstand:\n",
     "| Andel saker med overkrav | Snitt overkrav | Penger tatt for mye per år |\n|---:|---:|---:|"]
for share in (0.001, 0.005, 0.01):
    for avg in (100, 300):
        L.append(f"| {share * 100:.1f} % | {kr(avg)} | {kr(CASES * share * avg)} |")
L += ["\nSelv i det laveste hjørnet er det nesten en million kroner i året. Brevvakt er gratis fordi verdien er hos den som får brevet.\n",
      "## 2. Brevhylle, sendt\n", "| Post | Kost |\n|---|---:|"]
L += [f"| {n} | {c:.2f} kr |" for n, c in bom]
L += [f"| **Sum** | **{cogs:.2f} kr** |\n",
      f"Pris **{kr(PRICE)}** → netto {net:.2f} → **dekningsbidrag {db:.2f} kr**. Bladet sendes separat i lomma med tape, eller leveres uten (kjøp selv i en jernvarehandel).\n",
      "## 3. Kanal\n",
      "NAV-kontorer, kommunale gjeldsrådgivere, Kirkens Bymisjon, studentsamskipnader. Appen er gratis og offline; hylla er et *møteobjekt* — "
      "rådgiveren gir den bort i første samtale, og brevene blir stående synlig hjemme etterpå.\n",
      "| Scenario | Hyller B2C | Hyller via rådgivere (à 149 kr, bulk) | Dekningsbidrag |\n|---|---:|---:|---:|"]
bulk_db = 149 / 1.25 - (cogs - 79 - 10 + 3)
for n, a, b in [("Stille", 50, 0), ("Basis", 250, 200), ("Treffer", 1000, 2000)]:
    L.append(f"| {n} | {a} | {b} | {kr(a * db + b * bulk_db)} |")
(ROOT / "OKONOMI.md").write_text("\n".join(L) + "\n")
print("\n".join(L))
