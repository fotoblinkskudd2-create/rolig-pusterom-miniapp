"""Kjølerom — økonomi. Speiler formlene i kjolerom.html (annuity / trueCost).

Kjør:  python3 products/01-kjolerom/okonomi/kost.py
Ut:    ../OKONOMI.md, ../bilder/okonomi-lego.png
Alle priser i NOK. Tall merket (est.) er antakelser, ikke målt.
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent


def annuity(p, apr, n):
    r = apr / 100 / 12
    if n <= 0:
        return p
    if r == 0:
        return p / n
    return p * r / (1 - (1 + r) ** -n)


def true_cost(price, pay, months=12, apr=0.0, fee=0.0, card_apr=22.0):
    if pay == "delbetaling":
        m = annuity(price, apr, months)
        return m * months + fee * months, m + fee
    if pay == "kort":
        m = annuity(price, card_apr, 12)
        return m * 12, m
    return price, 0.0


# ---------- 1. Eksempelet: Lego 2 499 kr ----------
LEGO = 2499
cases = [
    ("Debet", *true_cost(LEGO, "debet")),
    ("Kredittkort 22 %, 12 mnd", *true_cost(LEGO, "kort")),
    ("Delbetaling 24,9 % + 39 kr/mnd, 12 mnd", *true_cost(LEGO, "delbetaling", 12, 24.9, 39)),
]

# ---------- 2. Gjeldsrenten som bakgrunnsstøy ----------
DEBT, DEBT_APR = 250_000, 18.0          # brukerens størrelsesorden; rente (est.)
daily = DEBT * DEBT_APR / 100 / 365

# ---------- 3. Kortkappe enhetsøkonomi ----------
MASS_G = 11.2                            # fra cad/rapport.txt
bom = [
    ("PETG 11,2 g à 0,25 kr/g (est. 250 kr/kg)", MASS_G * 0.25),
    ("Strøm 120 W × 16 min à 1,50 kr/kWh (est.)", 0.120 * 16 / 60 * 1.50),
    ("Printer-slitasje (dyse/plate) (est.)", 1.00),
    ("QR-klistremerke + etikett (est.)", 1.50),
    ("Boblekonvolutt C6 (est.)", 6.00),
    ("Porto brev ≤ 50 g innland (est. — sjekk posten.no)", 30.00),
]
cogs = sum(c for _, c in bom)
PRICE = 149.0                            # inkl. frakt og mva
MVA = 0.25
net = PRICE / (1 + MVA)
margin = net - cogs
PRINTER = 3_000                          # hobby-printer, f.eks. A1 mini-klasse (est.)
breakeven = PRINTER / margin
PER_PLATE, PLATE_MIN = 6, 80             # 6 stk på 180×180, ~80 min (est.)
per_day = PER_PLATE * (16 * 60 / PLATE_MIN)  # 16 driftstimer

# B2B: gjeldsrådgivning / NAV-kontor / Kirkens Bymisjon kjøper i bulk
B2B_PRICE, B2B_SHIP_PER_100 = 49.0, 150.0
b2b_cogs = cogs - 30 - 6 + 0.5 + B2B_SHIP_PER_100 / 100   # ingen enkeltporto/konvolutt
b2b_margin = B2B_PRICE / (1 + MVA) - b2b_cogs

# ---------- 4. Scenario år 1 ----------
scenarios = [
    ("Stille", 150, 0),
    ("Basis", 600, 2),
    ("Treffer", 2500, 8),
]  # (B2C-kapper, B2B-ordre à 100 stk)


def kr(x):
    return f"{x:,.0f} kr".replace(",", " ")


def chart(path):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    ink, muted, grid = "#23323d", "#5d7080", "#d6e2ea"
    s1, s2 = "#2a78d6", "#eb6834"         # dataviz-palett slot 1 og 2 (validert)
    months = list(range(0, 13))
    debet = [LEGO] * 13
    tc, m = true_cost(LEGO, "delbetaling", 12, 24.9, 39)
    klarna = [m * i for i in months]
    fig, ax = plt.subplots(figsize=(8, 4.5), dpi=160)
    ax.plot(months, debet, color=s1, lw=2)
    ax.plot(months, klarna, color=s2, lw=2)
    ax.scatter([12], [klarna[-1]], color=s2, s=40, zorder=3, edgecolor="white", linewidth=2)
    ax.text(12.2, debet[-1], f"Debet: {kr(LEGO)}", va="center", color=ink, fontsize=9)
    ax.text(12.2, klarna[-1], f"Delbetaling: {kr(tc)}", va="center", color=ink, fontsize=9)
    ax.fill_between(months, debet, klarna, where=[k > d for k, d in zip(klarna, debet)], color=s2, alpha=0.12, lw=0, interpolate=True)
    ax.set_xlim(0, 16.5)
    ax.set_ylim(0, 3700)
    ax.set_xticks(range(0, 13, 3))
    ax.set_xlabel("Måneder etter kjøp", color=muted, fontsize=9)
    ax.set_ylabel("Betalt totalt (kr)", color=muted, fontsize=9)
    for sp in ("top", "right"):
        ax.spines[sp].set_visible(False)
    for sp in ("left", "bottom"):
        ax.spines[sp].set_color(grid)
    ax.tick_params(colors=muted, labelsize=8)
    ax.grid(axis="y", color=grid, lw=0.6)
    ax.set_title(f"Samme Lego-sett, {kr(tc - LEGO)} dyrere på delbetaling", loc="left", color=ink, fontsize=11)
    ax.legend(["Debet", "Delbetaling 24,9 % + 39 kr/mnd"], frameon=False, fontsize=8, loc="upper left", labelcolor=ink)
    fig.tight_layout()
    fig.savefig(path, facecolor="white")
    plt.close(fig)


def main():
    (ROOT / "bilder").mkdir(exist_ok=True)
    chart(ROOT / "bilder" / "okonomi-lego.png")
    L = []
    L.append("# 01 — KJØLEROM · Økonomi\n")
    L.append("Generert av `okonomi/kost.py`. Endre tall der, ikke her. (est.) = antakelse.\n")
    L.append("## 1. Hva et Lego-sett til 2 499 kr faktisk koster\n")
    L.append("| Betaling | Totalt | Per mnd | Ekstra |\n|---|---:|---:|---:|")
    for name, total, mo in cases:
        L.append(f"| {name} | {kr(total)} | {kr(mo) if mo else '—'} | {kr(total - LEGO)} |")
    L.append("\n![Lego](bilder/okonomi-lego.png)\n")
    L.append("## 2. Rentedager\n")
    L.append(f"Med {kr(DEBT)} gjeld à {DEBT_APR:.0f} % (est.) brenner det **{kr(daily)} per dag**, "
             f"**{kr(daily * 30)} per måned**, før en eneste krone er avdrag.")
    L.append(f"Lego-settet på delbetaling = **{cases[2][1] / daily:.1f} rentedager**. "
             "Det er tallet appen viser. Ikke for å skremme. For å gjøre en abstrakt rente til en kalender.\n")
    L.append("## 3. Kortkappe — enhetsøkonomi (B2C, sendt i posten)\n")
    L.append("| Post | Kost |\n|---|---:|")
    for n, c in bom:
        L.append(f"| {n} | {c:.2f} kr |")
    L.append(f"| **Sum vareforbruk + frakt** | **{cogs:.2f} kr** |")
    L.append(f"\nPris **{kr(PRICE)}** inkl. mva og frakt → netto {net:.2f} kr → **dekningsbidrag {margin:.2f} kr/stk** "
             f"({margin / net * 100:.0f} %).")
    L.append(f"Printer {kr(PRINTER)} (est.) er tjent inn etter **{breakeven:.0f} kapper**. "
             f"Kapasitet én printer: ~{per_day:.0f} stk/døgn (6 per plate, ~80 min).")
    L.append(f"\nPorto er {30 / cogs * 100:.0f} % av kostnaden. Plast er {MASS_G * 0.25 / cogs * 100:.0f} %. "
             "Produktet er i praksis gratis å lage; det er *frakten* som koster. Derfor: STL-fila er gratis, alltid.\n")
    L.append("## 4. B2B — gjeldsrådgivere kjøper i bulk\n")
    L.append(f"Bulk à {kr(B2B_PRICE)} inkl. mva, 100 stk per pakke: vareforbruk {b2b_cogs:.2f} kr/stk → "
             f"**dekningsbidrag {b2b_margin:.2f} kr/stk**, {kr(b2b_margin * 100)} per ordre.")
    L.append("Kjøper: NAV økonomirådgivning, kommunal gjeldsrådgivning, Kirkens Bymisjon, Frelsesarmeen, DPS-poliklinikker. "
             "De gir den bort i første samtale. Ett fysisk objekt som tar med seg samtalen hjem.\n")
    L.append("## 5. År 1 — tre scenarioer\n")
    L.append("| Scenario | B2C-kapper | B2B-ordre (100 stk) | Dekningsbidrag | Minus printer |\n|---|---:|---:|---:|---:|")
    for name, b2c, b2b in scenarios:
        db = b2c * margin + b2b * 100 * b2b_margin
        L.append(f"| {name} | {b2c} | {b2b} | {kr(db)} | {kr(db - PRINTER)} |")
    L.append("\nÆrlig konklusjon: dette er ikke en enhjørning. Det er et verktøy som kan betale for seg selv, "
             "en printer og noen kvelder — og som kan holde **tusenvis av kroner i rente** ute av ett menneskes liv per år. "
             "Verdien sitter hos brukeren, ikke hos selgeren. Det er riktig vei rundt.\n")
    (ROOT / "OKONOMI.md").write_text("\n".join(L))
    print("\n".join(L))


if __name__ == "__main__":
    main()
