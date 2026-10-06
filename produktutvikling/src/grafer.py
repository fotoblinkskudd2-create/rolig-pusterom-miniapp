"""Gantt-diagrammer per produkt + scenariograf for porteføljen."""
import json
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HER = os.path.dirname(__file__)
UT = os.path.join(HER, "..", "grafer")
FARGER = {"K": "#2a78d6", "P": "#eb6834", "I": "#1baf7a"}
NAVN = {"K": "Konsept og design", "P": "Prototype og brukertest", "I": "Industrialisering og sertifisering"}
TEKST, TEKST2, GRID = "#0b0b0b", "#52514e", "#e4e3df"

PLANER = {
    "glod": (15, [("Kravspek, skisser, anatomistudie", 0, 1, "K"), ("CAD + termisk/FEM-simulering", 1, 3, "K"),
                  ("α-prototype (funksjonell MVP)", 2, 4, "P"), ("Brukertest runde 1 (n=12)", 4, 5, "P"),
                  ("β-prototype + DFM", 5, 7, "P"), ("Brukertest runde 2 (n=30)", 7, 8, "P"),
                  ("Verktøy T0-T2", 7, 10, "I"), ("Sertifisering (IEC 60335-2-32, ISO 10993, EMC)", 9, 12, "I"),
                  ("Pilotserie / PVT 500 stk", 11, 13, "I"), ("Serieproduksjon + lager", 13, 14.5, "I")]),
    "avtrykk": (18, [("Kravspek, skisser", 0, 1, "K"), ("CAD + jamming-labtester", 1, 4, "K"),
                     ("α-prototype (funksjonell MVP)", 3, 5, "P"), ("Brukertest runde 1 (n=12)", 5, 6, "P"),
                     ("β-prototype + DFM", 6, 9, "P"), ("Brukertest runde 2 (n=30)", 9, 10, "P"),
                     ("Verktøy T0-T2", 9, 12, "I"), ("Sertifisering (ISO 10993, EMC, batteri)", 11, 14, "I"),
                     ("Pilotserie / PVT 500 stk", 14, 16, "I"), ("Serieproduksjon + lager", 16, 17.5, "I")]),
    "samklang": (17, [("Kravspek, skisser", 0, 1, "K"), ("CAD + mikrotekstur-FoU", 1, 4, "K"),
                      ("Adhesjonstester i lab", 3, 6, "P"), ("α-prototype (funksjonell MVP)", 3, 4.5, "P"),
                      ("Brukertest runde 1 (n=10 par)", 4.5, 6, "P"), ("β-prototype + DFM", 6, 8, "P"),
                      ("Brukertest runde 2 (n=25 par)", 8, 9, "P"), ("Verktøy inkl. lasertekstur", 8, 11, "I"),
                      ("Sertifisering (RED, EMC, ISO 10993)", 10, 13, "I"), ("Pilotserie / PVT", 13, 15, "I"),
                      ("Serieproduksjon + lager", 15, 16.5, "I")]),
    "lene": (12, [("Co-design med brukerorganisasjoner", 0, 1, "K"), ("CAD + skumprøver", 1, 2, "K"),
                  ("α-prototype (funksjonell MVP)", 1.5, 2.5, "P"), ("Brukertest runde 1 (n=10)", 2.5, 3.5, "P"),
                  ("β-prototype + DFM", 3.5, 5, "P"), ("Brukertest runde 2 (n=20)", 5, 6, "P"),
                  ("Verktøy T0-T2 + søm-mønster", 5, 7.5, "I"), ("Sertifisering (RED, EMC, ISO 10993, EN 71/skum)", 7, 9.5, "I"),
                  ("Pilotserie / PVT", 9, 10.5, "I"), ("Serieproduksjon + lager", 10.5, 11.5, "I")]),
    "kjerne": (12, [("Kravspek, skisser", 0, 1, "K"), ("CAD + aktuatorvalg/NRE", 1, 2.5, "K"),
                    ("α-prototype (funksjonell MVP)", 2, 3, "P"), ("Brukertest runde 1 (n=15)", 3, 4, "P"),
                    ("β-prototype + DFM", 4, 5.5, "P"), ("Brukertest runde 2 (n=30)", 5.5, 6.5, "P"),
                    ("Verktøy kjerne + 3 skall", 5.5, 8, "I"), ("Sertifisering (IEC 62133-2, UN38.3, EMC, ISO 10993)", 7.5, 10, "I"),
                    ("Pilotserie / PVT 1000 stk", 9.5, 10.5, "I"), ("Serieproduksjon + lager", 10.5, 11.5, "I")]),
}


def gantt(pid, navn):
    lans, faser = PLANER[pid]
    fig, ax = plt.subplots(figsize=(9.2, 4.2), dpi=180)
    fig.patch.set_facecolor("#fcfcfb")
    ax.set_facecolor("#fcfcfb")
    for i, (txt, a, b, k) in enumerate(faser):
        y = len(faser) - i
        ax.barh(y, b - a, left=a, height=0.62, color=FARGER[k], edgecolor="#fcfcfb", linewidth=2)
        ax.text(-0.25, y, txt, ha="right", va="center", fontsize=7.5, color=TEKST)
    ax.scatter([lans], [0.4], marker="D", s=70, color=TEKST, zorder=5)
    ax.text(lans + 0.25, 0.4, f"Lansering mnd {lans}", va="center", fontsize=7.5, color=TEKST, weight="bold")
    ax.set_xlim(0, max(lans + 3, 15))
    ax.set_ylim(-0.3, len(faser) + 0.7)
    ax.set_yticks([])
    ax.set_xticks(range(0, int(ax.get_xlim()[1]) + 1))
    ax.tick_params(axis="x", labelsize=7, colors=TEKST2, length=0)
    ax.set_xlabel("Måned fra prosjektstart", fontsize=7.5, color=TEKST2)
    ax.grid(axis="x", color=GRID, linewidth=0.6)
    ax.set_axisbelow(True)
    for s in ("top", "right", "left"):
        ax.spines[s].set_visible(False)
    ax.spines["bottom"].set_color(GRID)
    hand = [plt.Rectangle((0, 0), 1, 1, color=FARGER[k]) for k in "KPI"]
    ax.legend(hand, [NAVN[k] for k in "KPI"], loc="upper center", fontsize=7, frameon=False, ncol=3,
              bbox_to_anchor=(0.5, -0.17))
    ax.set_title(f"{navn} – tidslinje til lansering", loc="left", fontsize=10, color=TEKST, weight="bold", pad=8)
    fig.tight_layout()
    fig.savefig(os.path.join(UT, f"gantt_{pid}.png"))
    plt.close(fig)


def scenariograf(modell):
    prod = modell["produkter"]
    sc = ["Konservativ", "Sannsynlig", "Aggressiv"]
    farger = ["#2a78d6", "#eb6834", "#1baf7a"]
    fig, ax = plt.subplots(figsize=(9.2, 4.0), dpi=180)
    fig.patch.set_facecolor("#fcfcfb")
    ax.set_facecolor("#fcfcfb")
    w = 0.26
    for j, s in enumerate(sc):
        vals = [sum(a["omsetning"] for a in p["scen"][s]) / 1e6 for p in prod]
        xs = [i + (j - 1) * w for i in range(len(prod))]
        ax.bar(xs, vals, width=w - 0.03, color=farger[j], label=s)
        if s == "Sannsynlig":
            for x, v in zip(xs, vals):
                ax.text(x, v + 1.5, f"{v:.0f}", ha="center", fontsize=7, color=TEKST)
    ax.set_xticks(range(len(prod)))
    ax.set_xticklabels([p["navn"] for p in prod], fontsize=8, color=TEKST)
    ax.set_ylabel("Netto omsetning år 1-3, MNOK", fontsize=7.5, color=TEKST2)
    ax.tick_params(axis="y", labelsize=7, colors=TEKST2, length=0)
    ax.grid(axis="y", color=GRID, linewidth=0.6)
    ax.set_axisbelow(True)
    for s in ("top", "right", "left"):
        ax.spines[s].set_visible(False)
    ax.spines["bottom"].set_color(GRID)
    ax.legend(fontsize=7.5, frameon=False, loc="upper left")
    ax.set_title("Akkumulert netto omsetning (eks. mva) per scenario, 3 år", loc="left", fontsize=10,
                 weight="bold", color=TEKST)
    fig.tight_layout()
    fig.savefig(os.path.join(UT, "scenarier.png"))
    plt.close(fig)


if __name__ == "__main__":
    os.makedirs(UT, exist_ok=True)
    with open(os.path.join(HER, "modell.json"), encoding="utf-8") as f:
        m = json.load(f)
    for p in m["produkter"]:
        gantt(p["id"], p["navn"])
    scenariograf(m)
    with open(os.path.join(HER, "planer.json"), "w", encoding="utf-8") as f:
        json.dump({k: {"lansering": v[0], "faser": v[1]} for k, v in PLANER.items()}, f, ensure_ascii=False)
    print("ok")
