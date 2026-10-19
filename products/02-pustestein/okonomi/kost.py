"""Pustestein — økonomi. Leser masse/volum fra cad/rapport.txt så tallene følger geometrien.

Kjør:  python3 products/02-pustestein/okonomi/kost.py
Ut:    ../OKONOMI.md
(est.) = antakelse, ikke målt.
"""
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
rap = (ROOT / "cad" / "rapport.txt").read_text()
v_pla = float(re.search(r"Volum PLA\s+: ([\d.]+)", rap).group(1))
v_cav = float(re.search(r"hulrom ([\d.]+) cm3", rap).group(1))
minutes = float(re.search(r"Print-estimat : ~(\d+)", rap).group(1))
m_frame = float(re.search(r"Ramme\s+: ([\d.]+) g", rap).group(1))
mass = {k: float(v) for k, v in re.findall(r"  (tom|sand|stal)\s*:\s+(\d+) g", rap)}

PLA_KR_G = 0.20          # 200 kr/kg (est.)
STEEL_KR_G = 0.10        # stålhagl 100 kr/kg (est.)
STEEL_G = v_cav * 4.7
KWH = 0.120 * minutes / 60 * 1.50

def kr(x):
    return f"{x:,.0f} kr".replace(",", " ")

b2c = [
    (f"PLA {v_pla * 1.24 + m_frame:.0f} g (stein + ramme) à 200 kr/kg (est.)", (v_pla * 1.24 + m_frame) * PLA_KR_G),
    (f"Stålhagl {STEEL_G:.0f} g à 100 kr/kg (est.)", STEEL_G * STEEL_KR_G),
    (f"Strøm {minutes:.0f} min à 120 W, 1,50 kr/kWh (est.)", KWH),
    ("Printer-slitasje (est.)", 3.0),
    ("Utskrift av passbilde (fotopapir, 1/6 ark) (est.)", 2.0),
    ("Eske + silkepapir (est.)", 9.0),
    ("Porto pakke i postkassen ≤ 350 g (est. — sjekk posten.no)", 79.0),
]
cogs = sum(c for _, c in b2c)
PRICE, MVA = 349.0, 0.25
net = PRICE / (1 + MVA)
db = net - cogs
labour_min = 12          # pause, helle hagl, etterarbeid, pakking (est.)
db_per_hour = db / (labour_min / 60)

B2B_PRICE = 199.0        # sorggrupper / DPS / hospice, 25 stk, standard 10 mm/s, uten bilde
b2b_cogs = cogs - 79 - 9 - 2 + 150 / 25 + 3
b2b_db = B2B_PRICE / (1 + MVA) - b2b_cogs

PRINTER = 3000
scen = [("Stille", 60, 0), ("Basis", 300, 4), ("Treffer", 1200, 15)]

L = ["# 02 — PUSTESTEIN · Økonomi\n",
     "Generert av `okonomi/kost.py` fra `cad/rapport.txt`. (est.) = antakelse.\n",
     "## 1. Hva steinen veier og koster å lage\n",
     f"Fra CAD: {v_pla:.1f} cm³ PLA, {v_cav:.1f} cm³ hulrom, ~{minutes:.0f} min print. "
     f"Masse: tom {mass['tom']:.0f} g · sand {mass['sand']:.0f} g · **stål {mass['stal']:.0f} g**.\n",
     "| Post (B2C, personlig, sendt) | Kost |\n|---|---:|"]
L += [f"| {n} | {c:.2f} kr |" for n, c in b2c]
L += [f"| **Sum** | **{cogs:.2f} kr** |\n",
      f"Pris **{kr(PRICE)}** inkl. mva og frakt → netto {net:.2f} → **dekningsbidrag {db:.2f} kr** ({db / net * 100:.0f} %).",
      f"Med ~{labour_min} min håndarbeid per stein (pause, hagl, pakking) er det **{kr(db_per_hour)} per arbeidstime** før skatt.",
      f"Porto er {79 / cogs * 100:.0f} % av kostnaden. Igjen: frakten er produktet. Plast + stål er {(b2c[0][1] + b2c[1][1]) / cogs * 100:.0f} %.\n",
      "Hvorfor 349 kr når silikon-worry-stones selges for ~15 USD for seks? Fordi denne er *din*: rillen er bygd etter din tommel, "
      "bildet er ditt, og den veier like mye som en ekte stein fra fjæra. Sammenlign med håndlagde «grounding stones» "
      "til ~12 USD — de har ingen rytme, ingen vekt-design og ingen bilde.\n",
      "## 2. B2B — sorggrupper, DPS, hospice, Kirkens SOS\n",
      f"25-pakning à {kr(B2B_PRICE)}, standard rille (10 mm/s, 4–2–6), blank ramme — brukeren legger inn eget bilde. "
      f"Vareforbruk {b2b_cogs:.2f} kr/stk → **{b2b_db:.2f} kr/stk**, {kr(b2b_db * 25)} per pakke.\n",
      "## 3. År 1\n",
      "| Scenario | B2C | B2B-pakker (25) | Dekningsbidrag | Minus printer |\n|---|---:|---:|---:|---:|"]
for n, a, b in scen:
    tot = a * db + b * 25 * b2b_db
    L.append(f"| {n} | {a} | {b} | {kr(tot)} | {kr(tot - PRINTER)} |")
L += ["\nKapasitet: ~56 min per stein + pause → realistisk 12–15 stk per printer per døgn. "
      "Treffer-scenariet (1 575 stein) krever ~4 måneders printertid på én maskin, eller to printere.\n",
      "STL og CAD-skript er åpne. Den som har printer lager sin egen gratis. Den som ikke har, kjøper en — "
      "eller får en av noen som bryr seg."]
(ROOT / "OKONOMI.md").write_text("\n".join(L) + "\n")
print("\n".join(L))
