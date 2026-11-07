"""CLI: python -m kunstfabrikk <kommando> [valg]

Kommandoer:
  serie    Oppgave 1: nyhet + base-prompt -> 4 bilder -> beste -> 6 låste varianter + postpakke
  satire   Oppgave 2: 3–5 nyheter -> 2 Midjourney-prompts + 3 captions per sak (JSON + MD)
  skill    Oppgave 3: kjør eller eksporter prompt-kjeder (innholds-produsent, raa-kunst-bombe, ...)
  fokus    Oppgave 4: uferdige prosjekter (+ nyheter) -> 4-timers plan med prompts og ferdig-kriterier
  tekst    Oppgave 5: rå tekst -> kapitler, 10 hardeste setninger, synopsis (lokalt som standard)

Uten API-nøkkel brukes maler (offline). Med ANTHROPIC_API_KEY brukes Claude.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from . import fokus, kjeder, llm, satire, serie, tekst

UT = Path("ut")


def _les(sti: str | None) -> str:
    if sti in (None, "-"):
        return sys.stdin.read()
    return Path(sti).read_text(encoding="utf-8")


def _skriv(resultat: dict, som_json: bool, kort: str) -> None:
    if som_json:
        print(json.dumps(resultat, ensure_ascii=False, indent=2, default=str))
    else:
        print(kort)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="kunstfabrikk", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--ut", type=Path, default=UT, help="utmappe (standard: ./ut)")
    ap.add_argument("--offline", action="store_true", help="bruk maler, ikke Claude")
    ap.add_argument("--json", action="store_true", help="skriv hele resultatet som JSON til stdout")
    sub = ap.add_subparsers(dest="kommando", required=True)

    s = sub.add_parser("serie", help="oppgave 1: gonzo-stencil-serie med låst stil")
    s.add_argument("--nyhet", required=True, help="fil med nyhetstekst (eller - for stdin)")
    s.add_argument("--base", required=True, help="base-prompt (tekst) eller sti til fil")
    s.add_argument("--bilder", type=Path, help="mappe med de 4 Midjourney-bildene (fase 2)")
    s.add_argument("--simuler", action="store_true", help="lag 4 plassholderbilder og kjør hele flyten")
    s.add_argument("--velg", type=int, help="velg bilde manuelt (1–4) i stedet for automatisk scoring")
    s.add_argument("--sref", help="URL eller sref-kode for valgt bilde")
    s.add_argument("--seed", type=int, help="seed (standard: avledet fra nyhet + base)")
    s.add_argument("--sw", type=int, default=300, help="style weight for --sref (0–1000, standard 300)")

    t = sub.add_parser("satire", help="oppgave 2: nyhets-satire")
    kilde = t.add_mutually_exclusive_group(required=True)
    kilde.add_argument("--nyhet", nargs="+", help="én eller flere filer (flere saker i én fil skilles med linjen ---)")
    kilde.add_argument("--rss", nargs="?", const=satire.STANDARD_RSS, help="hent toppsaker fra RSS (standard NRK)")
    t.add_argument("--antall", type=int, default=5, help="maks antall saker (3–5 anbefalt)")

    k = sub.add_parser("skill", help="oppgave 3: kjør/eksporter skill-kjeder")
    k.add_argument("navn", nargs="?", help="skill-navn eller sti til kjede-JSON")
    k.add_argument("--liste", action="store_true", help="vis tilgjengelige skills")
    k.add_argument("--inn", action="append", default=[], metavar="FELT=VERDI",
                   help="input-felt (gjentas). VERDI som starter med @ leses fra fil")
    k.add_argument("--eksporter", action="store_true", help="skriv copy-paste-kjede (Markdown) for Claude/Grok")

    f = sub.add_parser("fokus", help="oppgave 4: 4-timers fokusplan")
    f.add_argument("--prosjekter", required=True, help="fil med ett prosjekt per linje")
    f.add_argument("--nyheter", help="fil med dagens nyheter (valgfritt)")
    f.add_argument("--start", help="starttid HH:MM (standard: nå)")

    x = sub.add_parser("tekst", help="oppgave 5: kapitler + hardeste setninger + synopsis")
    x.add_argument("--fil", required=True, help="fil med rå tekst (eller - for stdin)")
    x.add_argument("--kapitler", type=int, default=0, help="ønsket antall kapitler (0 = automatisk)")
    x.add_argument("--antall", type=int, default=10, help="antall harde setninger")
    x.add_argument("--llm", action="store_true", help="send teksten til Claude for titler og synopsis (standard: lokalt)")

    a = ap.parse_args(argv)
    try:
        if a.kommando == "serie":
            base = Path(a.base).read_text(encoding="utf-8") if Path(a.base).is_file() else a.base
            r = serie.kjor(_les(a.nyhet), base, a.ut, bilder=a.bilder, simuler=a.simuler, velg=a.velg,
                           sref=a.sref, seed=a.seed, sw=a.sw, offline=a.offline)
            kort = (f"Fase 1 klar: {r['fil']}\n\n{r['imagine']}" if r["fase"] == 1
                    else f"Postpakke: {r['pakke']}/pakke.md  (valgt: {r['valgt_bilde']}, {len(r['varianter'])} varianter)")
            _skriv(r, a.json, kort)

        elif a.kommando == "satire":
            nyheter = satire.hent_rss(a.rss, a.antall) if a.rss else [
                n for fil in a.nyhet for n in satire.del_nyheter(_les(fil))]
            r = satire.kjor(nyheter[: a.antall], a.ut, offline=a.offline)
            _skriv(r, a.json, f"{r['antall']} saker -> {r['md']}")

        elif a.kommando == "skill":
            if a.liste or not a.navn:
                for d in kjeder.liste():
                    print(f"{d['navn']:22} {d['beskrivelse']}\n{'':22} input: {', '.join(d['input'])}")
                return 0
            inn = {}
            for par in a.inn:
                if "=" not in par:
                    ap.error(f"--inn må være FELT=VERDI, fikk '{par}'")
                felt, verdi = par.split("=", 1)
                inn[felt] = Path(verdi[1:]).read_text(encoding="utf-8") if verdi.startswith("@") else verdi
            if a.eksporter:
                print(kjeder.eksporter(a.navn, inn))
            else:
                r = kjeder.kjor(a.navn, inn, a.ut, offline=a.offline)
                _skriv(r, a.json, f"Ferdig -> {r['fil']}\n\n" + json.dumps(r["sluttresultat"], ensure_ascii=False, indent=2))

        elif a.kommando == "fokus":
            r = fokus.kjor(_les(a.prosjekter), a.ut, nyheter=_les(a.nyheter) if a.nyheter else "",
                           start=a.start, offline=a.offline)
            _skriv(r, a.json, Path(r["md"]).read_text(encoding="utf-8"))

        elif a.kommando == "tekst":
            r = tekst.kjor(_les(a.fil), a.ut, bruk_llm=a.llm, kapitler_antall=a.kapitler, antall=a.antall)
            _skriv(r, a.json, Path(r["md"]).read_text(encoding="utf-8"))
    except llm.LLMFeil as e:
        print(f"Feil fra Claude: {e}\nTips: kjør med --offline for malmodus.", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
