"""CLI: slusen <kommando>

  slusen idag                              maks 3 handlinger, høyest svarsjanse først
  slusen status                            alle prosjekter, LOI/betalt mot kravet
  slusen rapport [--dager 7] [--mappe DIR] [--lagre]
  slusen kontakt ny PROSJEKT "Navn" [--org --epost --handling --dato --varm]
  slusen kontakt flytt ID STATUS [--handling "..." --dato YYYY-MM-DD]
  slusen kontakt liste [PROSJEKT]
  slusen prosjekt status PROSJEKT STATUS   (tooling blokkeres under 3 LOI/betalt)
  slusen prosjekt beskriv PROSJEKT "én setning"
  slusen prosjekt malkunde PROSJEKT "segment"
  slusen hypoteser PROSJEKT                Grok → slusen/utkast/, sendes aldri
  slusen utkast KONTAKT_ID                 Grok → slusen/utkast/, sendes aldri
"""
from __future__ import annotations

import argparse
import sys

from kontroll import KontrollRett, KontrollStopp

from . import (KONTAKTSTATUS, KRAV_FORPLIKTELSER, PROSJEKTER, PROSJEKTSTATUS, SannhetsBrudd,
               Slusen, i_dag)


def _idag(s: Slusen, _a) -> int:
    handlinger = s.idag()
    print(f"SLUSEN · {i_dag().isoformat()} · maks 3. Ingenting annet teller i dag.\n")
    if not handlinger:
        print("Ingen forfalte handlinger. Legg inn kontakter: slusen kontakt ny ...")
        return 0
    for i, h in enumerate(handlinger, 1):
        forfalt = f" · {h['forfalt_dager']} d forfalt" if h["forfalt_dager"] > 0 else ""
        print(f"{i}. [{h['prosjekt']}] {h['handling']}")
        print(f"   {h['hvem']} · svarsjanse ~{h['sjanse']:.0%} (heuristikk){forfalt}")
    return 0


def _status(s: Slusen, _a) -> int:
    print(f"{'PROSJEKT':<12} {'STATUS':<11} {'LOI+BET':<8} " + " ".join(f"{k:>6}" for k in KONTAKTSTATUS))
    for p in PROSJEKTER:
        info = s.data["prosjekter"][p]
        teller = {k: 0 for k in KONTAKTSTATUS}
        for k in s.data["kontakter"]:
            if k["prosjekt"] == p:
                teller[k["status"]] += 1
        f = s.forpliktelser(p)
        print(f"{p:<12} {info['status']:<11} {f'{f}/{KRAV_FORPLIKTELSER}':<8} "
              + " ".join(f"{teller[k]:>6}" for k in KONTAKTSTATUS))
    return 0


def _rapport(s: Slusen, a) -> int:
    r = s.rapport(a.dager, a.mappe)
    p, sendt, svar = r["produsert"], r["sendt"], r["svar"]
    if sendt == 0:
        vondt = f"0 SENDT. {p} produsert. Null mennesker utenfor hodet ditt har sett noe av det."
    else:
        vondt = f"{p} PRODUSERT PER {sendt} SENDT. {svar} svar."
    if r["dager_siden_sendt"] is not None:
        vondt += f" Siste sendte: {r['dager_siden_sendt']} dager siden."
    linjer = [
        f"# Slusen-rapport {r['fra']} → {r['til']}", "",
        f"## {vondt}", "",
        "| produsert | sendt | svar |", "|---:|---:|---:|",
        f"| {p} | {sendt} | {svar} |", "",
        f"Produsert = {r['utkast']} utkast fra slusen" + (f" + {r['filer']} filer endret i {a.mappe}" if a.mappe else ""),
        "", "## LOI/betalt mot kravet (3 før tooling)", "",
    ]
    for prosjekt, n in sorted(r["forpliktelser"].items(), key=lambda x: -x[1]):
        linjer.append(f"- {prosjekt}: {n}/{KRAV_FORPLIKTELSER} " + ("✅ tooling tillatt" if n >= KRAV_FORPLIKTELSER else ""))
    tekst = "\n".join(linjer) + "\n"
    print(tekst)
    if a.lagre:
        sti = s.utkastmappe.parent / "rapporter" / f"{r['til']}.md"
        sti.parent.mkdir(parents=True, exist_ok=True)
        sti.write_text(tekst, encoding="utf-8")
        print(f"Lagret: {sti}")
    return 0


def _kontakt(s: Slusen, a) -> int:
    if a.handling_k == "ny":
        k = s.ny_kontakt(a.prosjekt, a.navn, org=a.org, epost=a.epost, handling=a.handling,
                         dato=a.dato, varm=a.varm)
        s.lagre()
        print(f"#{k['id']} {k['navn']} → {k['prosjekt']} (kald). Neste: {k['neste_handling']} {k['neste_dato']}")
    elif a.handling_k == "flytt":
        k = s.flytt(a.id, a.status, handling=a.handling, dato=a.dato)
        s.lagre()
        print(f"#{k['id']} {k['navn']} → {k['status']}. Neste: {k['neste_handling']} {k['neste_dato']}")
        if s.forpliktelser(k["prosjekt"]) >= KRAV_FORPLIKTELSER:
            print(f"{k['prosjekt']} har {KRAV_FORPLIKTELSER} forpliktelser. Tooling er låst opp.")
    else:
        for k in s.data["kontakter"]:
            if a.prosjekt and k["prosjekt"].lower() != a.prosjekt.lower():
                continue
            print(f"#{k['id']:<3} {k['prosjekt']:<11} {k['status']:<7} {k['navn']:<24} "
                  f"{k['neste_dato']}  {k['neste_handling']}")
    return 0


def _prosjekt(s: Slusen, a) -> int:
    if a.handling_p == "status":
        s.sett_prosjektstatus(a.prosjekt, a.status)
        print(f"{a.prosjekt} → {a.status}")
    elif a.handling_p == "beskriv":
        s.beskriv(a.prosjekt, a.tekst)
    else:
        s.legg_til_malkunde(a.prosjekt, a.tekst)
    s.lagre()
    return 0


def _hypoteser(s: Slusen, a) -> int:
    sti = s.hypoteser(a.prosjekt)
    s.lagre()
    print(f"Utkast (ikke sendt): {sti}")
    return 0


def _utkast(s: Slusen, a) -> int:
    sti = s.utkast(a.id)
    s.lagre()
    print(f"Utkast (ikke sendt): {sti}")
    print(f"Når du har sendt det selv: slusen kontakt flytt {a.id} sendt")
    return 0


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="slusen", description="B2B-presse mot REVISJONEN.")
    sub = p.add_subparsers(dest="kommando", required=True)

    sub.add_parser("idag").set_defaults(fn=_idag)
    sub.add_parser("status").set_defaults(fn=_status)

    r = sub.add_parser("rapport")
    r.add_argument("--dager", type=int, default=7)
    r.add_argument("--mappe", help="tell også filer endret i denne mappa (produsert)")
    r.add_argument("--lagre", action="store_true")
    r.set_defaults(fn=_rapport)

    k = sub.add_parser("kontakt").add_subparsers(dest="handling_k", required=True)
    ny = k.add_parser("ny")
    ny.add_argument("prosjekt")
    ny.add_argument("navn")
    ny.add_argument("--org", default="")
    ny.add_argument("--epost", default="")
    ny.add_argument("--handling", default="")
    ny.add_argument("--dato")
    ny.add_argument("--varm", action="store_true", help="kjent relasjon, høyere svarsjanse")
    fl = k.add_parser("flytt")
    fl.add_argument("id", type=int)
    fl.add_argument("status", help="/".join(KONTAKTSTATUS))
    fl.add_argument("--handling")
    fl.add_argument("--dato")
    li = k.add_parser("liste")
    li.add_argument("prosjekt", nargs="?")
    for sp in (ny, fl, li):
        sp.set_defaults(fn=_kontakt)

    pr = sub.add_parser("prosjekt").add_subparsers(dest="handling_p", required=True)
    st = pr.add_parser("status")
    st.add_argument("prosjekt")
    st.add_argument("status", help="/".join(PROSJEKTSTATUS))
    be = pr.add_parser("beskriv")
    be.add_argument("prosjekt")
    be.add_argument("tekst")
    mk = pr.add_parser("malkunde")
    mk.add_argument("prosjekt")
    mk.add_argument("tekst")
    for sp in (st, be, mk):
        sp.set_defaults(fn=_prosjekt)

    hy = sub.add_parser("hypoteser")
    hy.add_argument("prosjekt")
    hy.set_defaults(fn=_hypoteser)

    ut = sub.add_parser("utkast")
    ut.add_argument("id", type=int)
    ut.set_defaults(fn=_utkast)

    a = p.parse_args(argv)
    try:
        return a.fn(Slusen(), a)
    except SannhetsBrudd as e:
        print(f"BLOKKERT: {e}", file=sys.stderr)
        return 4
    except KontrollStopp as e:
        print(f"KONTROLL STOPP: {e} (logget i kontroll/avvist.jsonl)", file=sys.stderr)
        return 2
    except KontrollRett as e:
        print(f"KONTROLL RETT: {e}", file=sys.stderr)
        return 3
    except ValueError as e:
        print(f"FEIL: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
