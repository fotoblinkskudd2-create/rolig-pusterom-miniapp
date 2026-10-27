"""Kjør: python3 -m maskin produkter/<navn> [--fokus X] [--generasjoner N] [--populasjon N] [--seed N] [--topp N] [--lagre fil.json]"""
import argparse
import importlib.util
import json
import os
import sys

from . import Maskin


def last(mappe):
    fil = os.path.join(mappe, "problem.py")
    if not os.path.exists(fil):
        sys.exit(f"Fant ikke {fil}. Kopier produkter/_mal til en ny mappe og fyll inn.")
    spec = importlib.util.spec_from_file_location("problem", fil)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main():
    p = argparse.ArgumentParser(prog="python3 -m maskin", description="Oppfinnelsesmaskinen")
    p.add_argument("produkt", help="mappe med problem.py, f.eks. produkter/tannborste")
    p.add_argument("--fokus")
    p.add_argument("--generasjoner", type=int, default=200)
    p.add_argument("--populasjon", type=int, default=120)
    p.add_argument("--seed", type=int, default=1)
    p.add_argument("--topp", type=int, default=3)
    p.add_argument("--lagre", help="skriv de beste designene til JSON (brukes av tegning/CAD)")
    a = p.parse_args()

    problem = last(a.produkt)
    m = Maskin(problem, a.fokus, a.seed)
    navn = getattr(problem, "NAVN", os.path.basename(os.path.normpath(a.produkt)))
    print(f"Utvikler {navn}" + (f" (fokus: {m.fokus})" if m.fokus else "") + "...")
    pop = m.utvikle(a.generasjoner, a.populasjon)

    ref = getattr(problem, "REFERANSE", None)
    if ref:
        print(f"\nReferanse ({ref.get('_navn', 'kjent produkt')}):")
        print(m.beskriv({k: v for k, v in ref.items() if not k.startswith("_")}))

    beste = m.ulike(pop, a.topp)
    print(f"\nTopp {len(beste)} oppfinnelser:")
    for i, d in enumerate(beste, 1):
        print(f"\n#{i} " + m.beskriv(d))

    if a.lagre:
        with open(a.lagre, "w") as f:
            json.dump([{"poeng": round(m.poeng(d), 4), "design": d, "delpoeng": m.delpoeng(d)}
                       for d in beste], f, ensure_ascii=False, indent=2)
        print(f"\nLagret til {a.lagre}")


if __name__ == "__main__":
    main()
