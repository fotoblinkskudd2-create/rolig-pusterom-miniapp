"""Robusthetsanalyse: hvor mye kan vi stole på det beste designet?

Kjør: python3 -m maskin.robusthet produkter/<navn> [--fokus X] [--design beste.json] [--frø 5]

1. Frø-stabilitet: kjører søket med flere startpunkt. Ender alle på samme konsept?
2. Følsomhet: endrer hver parameter litt. Hvilke parametre avgjør resultatet?
3. Alternativer: prøver hvert valg for Valg-parametre. Hvor mye taper vi på nest beste?
Skriver robusthet.md i produktmappen.
"""
import argparse
import json
import os

from . import Maskin, Tall, Valg
from .__main__ import last


def frø_stabilitet(problem, fokus, n, generasjoner, storrelse):
    rader = []
    for seed in range(1, n + 1):
        m = Maskin(problem, fokus, seed)
        beste = m.utvikle(generasjoner, storrelse, logg=None)[0]
        felter = getattr(problem, "NOKKEL", None) or []
        rader.append((seed, m.poeng(beste), {f: beste[f] for f in felter}))
    return rader


def følsomhet(problem, fokus, design):
    m = Maskin(problem, fokus)
    basis = m.poeng(design)
    tall, valg = [], []
    for navn, rom in problem.ROM.items():
        if isinstance(rom, Valg):
            res = []
            for v in rom.valg:
                d = dict(design, **{navn: v})
                rydd = getattr(problem, "rydd", None)
                d = rydd(d) if rydd else d
                res.append((v, m.poeng(d) - basis))
            valg.append((navn, design[navn], res))
        elif isinstance(rom, Tall):
            steg = (rom.hi - rom.lo) * 0.1
            utslag = []
            for retning in (-1, 1):
                v = min(rom.hi, max(rom.lo, design[navn] + retning * steg))
                if isinstance(design[navn], int):
                    v = int(round(v))
                utslag.append(m.poeng(dict(design, **{navn: v})) - basis)
            tall.append((navn, design[navn], utslag[0], utslag[1]))
    tall.sort(key=lambda r: -max(abs(r[2]), abs(r[3])))
    return basis, tall, valg


def main():
    p = argparse.ArgumentParser(prog="python3 -m maskin.robusthet")
    p.add_argument("produkt")
    p.add_argument("--fokus")
    p.add_argument("--design", help="JSON fra --lagre (standard: <produkt>/beste.json)")
    p.add_argument("--frø", type=int, default=5)
    p.add_argument("--generasjoner", type=int, default=80)
    p.add_argument("--populasjon", type=int, default=80)
    a = p.parse_args()

    problem = last(a.produkt)
    fil = a.design or os.path.join(a.produkt, "beste.json")
    if not os.path.exists(fil):
        raise SystemExit(f"Fant ikke {fil}. Kjør først: python3 -m maskin {a.produkt} --lagre {fil}")
    design = json.load(open(fil))[0]["design"]
    fokus = Maskin(problem, a.fokus).fokus

    ut = [f"# Robusthetsanalyse – {getattr(problem, 'NAVN', a.produkt)}", ""]
    if fokus:
        ut.append(f"Fokus: **{fokus}**\n")

    rader = frø_stabilitet(problem, fokus, a.frø, a.generasjoner, a.populasjon)
    poeng = [r[1] for r in rader]
    konsepter = {json.dumps(r[2], sort_keys=True, default=str) for r in rader}
    ut += ["## 1. Frø-stabilitet", "",
           f"{a.frø} søk med ulike startpunkt: poeng {min(poeng):.3f}–{max(poeng):.3f} "
           f"(spredning {max(poeng) - min(poeng):.3f}). {len(konsepter)} ulike konsept.", ""]
    ut += ["| Frø | Poeng | Konsept |", "|---|---|---|"]
    for seed, sc, k in rader:
        ut.append(f"| {seed} | {sc:.3f} | {', '.join(f'{a}={b}' for a, b in k.items()) or '–'} |")
    dom = "stabilt" if max(poeng) - min(poeng) < 0.02 and len(konsepter) == 1 else \
          "middels stabilt" if max(poeng) - min(poeng) < 0.05 else "USTABILT – søk lenger eller forenkle modellen"
    ut += ["", f"**Vurdering:** {dom}.", ""]

    basis, tall, valg = følsomhet(problem, fokus, design)
    ut += ["## 2. Følsomhet (±10 % av spennet)", "",
           f"Grunnpoeng: {basis:.3f}. Største utslag først – disse parametrene må måles og styres nøyest i produksjon.", "",
           "| Parameter | Verdi | −10 % | +10 % |", "|---|---|---|---|"]
    for navn, v, ned, opp in tall:
        vv = f"{v:.3g}" if isinstance(v, float) else v
        ut.append(f"| {navn} | {vv} | {ned:+.3f} | {opp:+.3f} |")
    ut += ["", "## 3. Alternativer for valg", "", "| Parameter | Valgt | Alternativer (endring i poeng) |", "|---|---|---|"]
    for navn, v, res in valg:
        alt = ", ".join(f"{a}: {d:+.3f}" for a, d in res if a != v)
        ut.append(f"| {navn} | {v} | {alt} |")

    tekst = "\n".join(ut) + "\n"
    with open(os.path.join(a.produkt, "robusthet.md"), "w") as f:
        f.write(tekst)
    print(tekst)


if __name__ == "__main__":
    main()
