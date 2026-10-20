#!/usr/bin/env python3
"""Mørkerom — økonomimodell. Alle tall er merket. Kjør: python3 okonomi/modell.py

Skriver okonomi/OKONOMI.md (tabeller) og okonomi/*.png (grafer).
"""
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

HER = Path(__file__).resolve().parent
USD = 10.6   # NOK per USD — HYPOTESE (kurs ikke sjekket i dag)
MVA = 0.25

# (del, antall, USD stk ved 1, USD stk ved 500, merking, kilde/kommentar)
BOM = [
    ("ESP32-S3-WROOM-1-N16R8", 1, 4.50, 3.40, "HYPOTESE", "LCSC-nivå; ikke sjekket i dag"),
    ("OV5640 5 MP DVP-modul m/ fast fokus", 1, 9.00, 4.80, "DOKUMENTERT / HYPOTESE", "eBay: modul €8,99 enkeltvis; 500-pris anslått"),
    ("E-blekk 1,54\" 200×200 SSD1681", 1, 6.50, 3.20, "HYPOTESE", "Waveshare-kort med S3 $15,99 — panel alene langt billigere"),
    ("Kretskort 4-lag (DVP + PSRAM)", 1, 4.00, 1.10, "HYPOTESE", ""),
    ("Montering (PCBA) + passive", 1, 10.00, 3.00, "HYPOTESE", ""),
    ("microSD-sokkel + 8 GB kort", 1, 3.50, 1.90, "HYPOTESE", "kortet følger med"),
    ("LiPo 1 000 mAh m/ beskyttelse", 1, 5.00, 2.10, "HYPOTESE", ""),
    ("Lader + LDO + USB-C", 1, 1.40, 0.55, "HYPOTESE", ""),
    ("Hall-bryter DRV5032 + magnet", 1, 0.90, 0.30, "HYPOTESE", "deksel = av/på"),
    ("To knapper + LED", 1, 0.60, 0.20, "HYPOTESE", ""),
    ("Kabinett: front, bak, deksel, knapper (PETG)", 1, 6.00, 3.00, "BEREGNET / HYPOTESE", "57 g PETG fra CAD"),
    ("Søker (rammesøker v0.1) + objektivring", 1, 0.80, 0.35, "HYPOTESE", ""),
    ("Håndleddsreim", 1, 0.80, 0.35, "HYPOTESE", ""),
    ("Emballasje + kort med oppdragsliste", 1, 2.50, 1.10, "HYPOTESE", ""),
]

FAST = [  # engangskostnader, NOK
    ("CE: RED + EMC + LVD + RoHS (lab, modulær vei)", 60000, "HYPOTESE", "som Stafett; samme lab kan ta begge"),
    ("EN 18031 cybersikkerhet (RED art. 3.3)", 40000, "UAVKLART", "kamera + Wi-Fi + lagring av bilder: vurderes strengere"),
    ("Prototyper (6 runder PCB + print + linser)", 22000, "HYPOTESE", "optikk er det vanskelige"),
    ("Fotografering, nettside, tekst", 10000, "HYPOTESE", ""),
    ("Buffer 15 %", 19800, "BEREGNET", ""),
]

PRIS_INKL_MVA = 1190
PRIS_SETT_INKL_MVA = 790      # bygg-selv: kretskort + kamera + skjerm ferdig, du printer kabinettet
FRAKT_KOST = 89               # Posten/Bring småpakke, NOK — HYPOTESE
BETALING = 0.024              # kortgebyr — HYPOTESE
RETUR = 0.05                  # andel som returneres (angrerett) — HYPOTESE
SAMLING_MIN = 15              # minutter manuell montering per stk
TIMEKOST = 450                # NOK/t


def bom_sum(kol):
    return sum(r[1] * r[kol] for r in BOM)


def enhetskost(volum):
    usd = bom_sum(2) if volum < 50 else bom_sum(3)
    frakt_inn = 0.08 if volum >= 50 else 0.25  # andel på toppen: frakt + toll/import
    return usd * USD * (1 + frakt_inn) + SAMLING_MIN / 60 * TIMEKOST


def dekningsbidrag(pris_inkl, kost):
    netto = pris_inkl / (1 + MVA)
    return netto - kost - FRAKT_KOST - pris_inkl * BETALING - netto * RETUR


def main():
    fast = sum(f[1] for f in FAST)
    k1, k500 = enhetskost(1), enhetskost(500)
    db = dekningsbidrag(PRIS_INKL_MVA, k500)
    sett_kost = (bom_sum(3) - 3.00 - 0.35) * USD * 1.08 + 3 / 60 * TIMEKOST  # uten kabinett og søker
    db_sett = dekningsbidrag(PRIS_SETT_INKL_MVA, sett_kost)
    break_even = fast / db

    L = []
    L.append("# MØRKEROM — økonomi v0.1\n")
    L.append("*Generert av `okonomi/modell.py`. Endre tallene der, ikke her.*\n")
    L.append("Merking: **DOKUMENTERT** = sett i en kilde i dag. **BEREGNET** = regnet ut fra andre tall. "
             f"**HYPOTESE** = mitt anslag. **UAVKLART** = vet ikke. Valuta: 1 USD = {USD} NOK (HYPOTESE).\n")
    L.append("## Stykkliste (BOM)\n")
    L.append("| Del | USD @1 | USD @500 | Merking | Kilde / kommentar |")
    L.append("|---|---:|---:|---|---|")
    for d, n, a, b, m, k in BOM:
        L.append(f"| {d} | {a:.2f} | {b:.2f} | {m} | {k} |")
    L.append(f"| **Sum** | **{bom_sum(2):.2f}** | **{bom_sum(3):.2f}** | BEREGNET | |\n")
    L.append("## Enhetskost levert lager (inkl. innfrakt/import + 12 min montering à 450 kr/t)\n")
    L.append("| Volum | NOK per stk |")
    L.append("|---|---:|")
    for v in (1, 50, 500):
        L.append(f"| {v} | {enhetskost(v):,.0f} |".replace(",", " "))
    L.append("")
    L.append("## Pris og dekningsbidrag (500 stk)\n")
    L.append("| | Ferdig | Bygg-selv-sett |")
    L.append("|---|---:|---:|")
    L.append(f"| Pris inkl. mva | {PRIS_INKL_MVA} kr | {PRIS_SETT_INKL_MVA} kr |")
    L.append(f"| Pris eks. mva | {PRIS_INKL_MVA/1.25:,.0f} kr | {PRIS_SETT_INKL_MVA/1.25:,.0f} kr |".replace(",", " "))
    L.append(f"| Varekost | {k500:,.0f} kr | {sett_kost:,.0f} kr |".replace(",", " "))
    L.append(f"| Frakt ut, kortgebyr, retur | {FRAKT_KOST + PRIS_INKL_MVA*BETALING + PRIS_INKL_MVA/1.25*RETUR:,.0f} kr | {FRAKT_KOST + PRIS_SETT_INKL_MVA*BETALING + PRIS_SETT_INKL_MVA/1.25*RETUR:,.0f} kr |".replace(",", " "))
    L.append(f"| **Dekningsbidrag per stk** | **{db:,.0f} kr** | **{db_sett:,.0f} kr** |".replace(",", " "))
    L.append(f"| Bruttomargin | {db/(PRIS_INKL_MVA/1.25)*100:.0f} % | {db_sett/(PRIS_SETT_INKL_MVA/1.25)*100:.0f} % |\n")
    L.append("## Engangskostnader\n")
    L.append("| Post | NOK | Merking | Kommentar |")
    L.append("|---|---:|---|---|")
    for p, nok, m, k in FAST:
        L.append(f"| {p} | {nok:,} | {m} | {k} |".replace(",", " "))
    L.append(f"| **Sum** | **{fast:,}** | BEREGNET | |\n".replace(",", " "))
    L.append(f"**Break-even: {break_even:.0f} ferdige enheter** (BEREGNET). Første batch på 500 gir "
             f"{500*db - fast:,.0f} kr etter engangskostnader, *før* lønn til deg.\n".replace(",", " "))

    L.append("## Tre ting tallene sier rett ut\n")
    L.append(f"1. **Camp Snap koster $69 (~{69*USD:.0f} kr).** Mørkerom koster {PRIS_INKL_MVA} kr. Prisforskjellen er fremkallingen, "
             "e-blekk-ruta, krypteringen og oppdragene. Det er ikke et billigere kamera. Det er et annet kamera. HYPOTESE: noen vil betale for det.")
    L.append("2. **Optikken er risikoen, ikke elektronikken.** En OV5640-modul med fast fokus gir middels bilder. 1-bit-fremkallingen gjør det til en "
             "egenskap på bakskjermen, men originalen er fortsatt middels. Budsjett for minst to linserunder.")
    L.append("3. **Ikke selg den på Klarna her heller.** Samme regel som Stafett. Kort og Vipps. Ingen delbetaling.\n")
    L.append("## Programvaren er gratis\n")
    L.append("Rull + 48 t + oppdrag kan gis bort som app (Gudak gjorde det i 2017 for $0,99). Men en app kan ikke stoppe deg fra å se i kamerarullen. "
             "Det fysiske kameraet uten skjerm er hele poenget, og det er det som selges.\n")
    (HER / "OKONOMI.md").write_text("\n".join(L) + "\n", encoding="utf-8")

    # Graf 1: BOM-fordeling ved 500
    plt.rcParams.update({"font.family": "Inter", "font.size": 9})
    fig, ax = plt.subplots(figsize=(8, 4.2))
    rader = sorted(((r[0], r[3] * USD) for r in BOM), key=lambda t: t[1])
    ax.barh([r[0] for r in rader], [r[1] for r in rader], color="#1e1e1c")
    for i, (_, v) in enumerate(rader):
        ax.text(v + 1.5, i, f"{v:.0f} kr", va="center", fontsize=8)
    ax.set_title(f"Mørkerom: stykkliste ved 500 stk — {bom_sum(3)*USD:.0f} kr totalt (før frakt og montering)", loc="left", fontsize=10, fontweight="bold")
    ax.spines[["top", "right"]].set_visible(False)
    ax.set_xlabel("NOK per enhet")
    fig.tight_layout()
    fig.savefig(HER / "bom.png", dpi=160)

    # Graf 2: kumulativt resultat vs antall solgt
    fig, ax = plt.subplots(figsize=(8, 4))
    n = list(range(0, 801, 10))
    ax.plot(n, [x * db - fast for x in n], color="#1e1e1c", lw=2, label=f"Ferdig, {PRIS_INKL_MVA} kr")
    ax.plot(n, [x * db_sett - fast for x in n], color="#8a8780", lw=2, ls="--", label=f"Bygg-selv, {PRIS_SETT_INKL_MVA} kr")
    ax.axhline(0, color="#cfccc3", lw=1)
    ax.axvline(break_even, color="#1e1e1c", lw=0.6, ls=":")
    ax.text(break_even + 8, -fast * 0.85, f"break-even\n{break_even:.0f} stk", fontsize=8)
    ax.set_title("Resultat etter engangskostnader (NOK)", loc="left", fontsize=10, fontweight="bold")
    ax.set_xlabel("Solgte enheter")
    ax.spines[["top", "right"]].set_visible(False)
    ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{v/1000:.0f}k"))
    ax.legend(frameon=False)
    fig.tight_layout()
    fig.savefig(HER / "breakeven.png", dpi=160)
    print(f"enhetskost @1 {k1:.0f}  @500 {k500:.0f}  DB {db:.0f}  sett-DB {db_sett:.0f}  fast {fast}  BE {break_even:.0f}")


if __name__ == "__main__":
    main()
