"""Oppgave 4: Fokusplan for dagen.

Leser uferdige prosjekter (én per linje) + valgfritt dagens nyheter, og lager en prioritert
4-timers plan: fire blokker à 50 min arbeid + 10 min pause, hver med copy-paste-prompt og suksesskriterium.

Prosjektlinje-format (alt etter navnet er valgfritt):
  Navn | prio=1 | frist=2026-11-10 | sist=2026-11-01 | type=kunst | neste=lag 6 sref-varianter
Et felt uten '=' tolkes som neste steg.
prio: 1 (høyest) – 3. type: kunst, agent, skriving, satire, annet.
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import date, datetime, timedelta
from pathlib import Path

from . import antislop, llm
from .tekstverktoy import overskrift

BLOKKER = 4
ARBEID_MIN = 50
PAUSE_MIN = 10

PROMPT_MALER = {
    "kunst": ("# {navn}: {neste}\n"
              "python -m kunstfabrikk serie --nyhet nyhet.txt --base \"<din base-prompt>\"\n"
              "# kjør /imagine i Midjourney, lagre 4 bilder, så: ... --bilder <mappe> --sref <URL til beste>",
              "Minst 6 varianter med låst --sref og --seed ferdig i pakke.md, og ett bilde postet eller lagt i kø."),
    "satire": ("python -m kunstfabrikk satire --nyhet dagens.txt  (eller --rss)",
               "2 prompts og 3 captions per sak i satire-<dato>.md; minst én kjørt i Midjourney."),
    "agent": ("Du er senior Python-utvikler. Prosjekt: {navn}. Neste konkrete steg: {neste}. Skriv koden for dette steget, "
              "med én test som beviser at det virker. Ingen refaktorering utenfor steget.",
              "Steget kjører lokalt og testen er grønn. Commit med beskrivende melding."),
    "skriving": ("python -m kunstfabrikk tekst --fil <råtekst.txt>  # deretter: skriv videre på kapittelet med flest harde setninger",
                 "Kapittelplan generert og minst 500 nye ord skrevet i det valgte kapittelet."),
    "annet": ("Prosjekt: {navn}. Neste steg: {neste}. Bryt steget ned i maks 3 handlinger jeg kan fullføre på 50 minutter, "
              "og si hva som er ferdig-kriteriet for hver.",
              "Minst én av de tre handlingene er ferdig og synlig (fil, commit, post eller melding sendt)."),
}


@dataclass
class Prosjekt:
    navn: str
    prio: int = 2
    frist: date | None = None
    sist: date | None = None
    type: str = "annet"
    neste: str = ""
    poeng: float = 0.0
    grunn: str = ""


def les_prosjekter(tekst: str) -> list[Prosjekt]:
    ut = []
    for linje in tekst.splitlines():
        linje = linje.strip().lstrip("-*• ").strip()
        if not linje or linje.startswith("#"):
            continue
        deler = [d.strip() for d in linje.split("|")]
        p = Prosjekt(navn=deler[0])
        for d in deler[1:]:
            if "=" not in d:
                if d:  # fritt felt uten nøkkel tolkes som neste steg
                    p.neste = d
                continue
            k, v = (x.strip() for x in d.split("=", 1))
            if k == "prio" and v.isdigit():
                p.prio = max(1, min(3, int(v)))
            elif k in ("frist", "sist"):
                try:
                    setattr(p, k, datetime.strptime(v, "%Y-%m-%d").date())
                except ValueError:
                    pass
            elif k == "type":
                p.type = v.lower() if v.lower() in PROMPT_MALER else "annet"
            elif k == "neste":
                p.neste = v
        ut.append(p)
    return ut


def prioriter(prosjekter: list[Prosjekt], idag: date, nyheter: str = "") -> list[Prosjekt]:
    """Poeng: prioritet + fristpress + standstill-straff (lenge siden sist) + bonus for kunst/satire når det finnes nyheter.

    Standstill vektes høyt med vilje: målet er å få døde serier i gang igjen.
    """
    for p in prosjekter:
        grunner = []
        poeng = {1: 30, 2: 18, 3: 8}[p.prio]
        grunner.append(f"prio {p.prio}")
        if p.frist:
            dager = (p.frist - idag).days
            if dager < 0:
                poeng += 30
                grunner.append(f"frist passert ({-dager} d)")
            elif dager <= 3:
                poeng += 25 - dager * 5
                grunner.append(f"frist om {dager} d")
        if p.sist:
            stille = (idag - p.sist).days
            if stille >= 3:
                poeng += min(stille, 21)
                grunner.append(f"standstill {stille} d")
        if nyheter.strip() and p.type in ("kunst", "satire"):
            poeng += 10
            grunner.append("ferske nyheter å bruke")
        if p.neste:
            poeng += 5
            grunner.append("neste steg er definert")
        p.poeng, p.grunn = float(poeng), ", ".join(grunner)
    return sorted(prosjekter, key=lambda p: (-p.poeng, p.prio, p.navn))


def lag_plan(prosjekter: list[Prosjekt], start: datetime, nyheter: str = "") -> list[dict]:
    valgt = prosjekter[:BLOKKER]
    if not valgt:
        return []
    # Færre enn 4 prosjekter: toppprosjektet får de ledige blokkene.
    while len(valgt) < BLOKKER:
        valgt.append(prosjekter[0])
    plan, t = [], start
    for i, p in enumerate(valgt, 1):
        mal, kriterium = PROMPT_MALER.get(p.type, PROMPT_MALER["annet"])
        neste = p.neste or "definer neste konkrete steg"
        prompt = mal.format(navn=p.navn, neste=neste)
        if nyheter.strip() and p.type in ("kunst", "satire"):
            prompt += f"\n# Dagens nyhet å bruke: {overskrift(nyheter, 14)}"
        slutt = t + timedelta(minutes=ARBEID_MIN)
        plan.append({
            "blokk": i, "fra": t.strftime("%H:%M"), "til": slutt.strftime("%H:%M"),
            "prosjekt": p.navn, "type": p.type, "hvorfor": p.grunn, "maal": neste,
            "prompt": prompt, "suksesskriterium": kriterium,
            "pause": f"{slutt:%H:%M}–{slutt + timedelta(minutes=PAUSE_MIN):%H:%M}",
        })
        t = slutt + timedelta(minutes=PAUSE_MIN)
    return plan


SYSTEM = f"""Du lager fokusplaner for en kunstner/utvikler som har mange uferdige prosjekter og lett havner i stillstand.
Du får en ferdig prioritert plan. Din jobb er å skrive om promptene slik at de er helt konkrete for prosjektet og målet,
klare til å limes inn i Claude Code eller Codex, og å skjerpe suksesskriteriet så det kan sjekkes på 10 sekunder.
{antislop.REGLER_TEKST}"""


def kjor(prosjekt_tekst: str, ut: Path, nyheter: str = "", start: str | None = None,
         idag: date | None = None, offline: bool = False) -> dict:
    idag = idag or date.today()
    prosjekter = les_prosjekter(prosjekt_tekst)
    if not prosjekter:
        raise SystemExit("Fant ingen prosjekter. Én per linje, f.eks. 'Bergen-serie | prio=1 | type=kunst'.")
    rangert = prioriter(prosjekter, idag, nyheter)
    startpunkt = datetime.combine(idag, datetime.strptime(start, "%H:%M").time()) if start else datetime.now().replace(second=0, microsecond=0)
    plan = lag_plan(rangert, startpunkt, nyheter)
    modus = "offline-maler"

    if not offline and llm.tilgjengelig():
        svar = llm.json_svar(SYSTEM, "Plan:\n" + json.dumps(plan, ensure_ascii=False, indent=2) +
                             "\n\nReturner JSON {\"blokker\": [{\"blokk\": n, \"prompt\": ..., \"suksesskriterium\": ...}]} "
                             "med samme antall blokker. Ikke endre rekkefølge eller tider.")
        for ny in svar.get("blokker", []):
            for b in plan:
                if b["blokk"] == ny.get("blokk"):
                    b["prompt"] = str(ny.get("prompt") or b["prompt"])
                    b["suksesskriterium"] = str(ny.get("suksesskriterium") or b["suksesskriterium"])
        modus = f"claude:{llm.MODELL}"

    data = {"dato": idag.isoformat(), "modus": modus, "plan": plan,
            "rangering": [{k: v for k, v in asdict(p).items() if k in ("navn", "poeng", "grunn")} for p in rangert]}
    ut.mkdir(parents=True, exist_ok=True)
    stamme = ut / f"fokus-{idag.isoformat()}"
    stamme.with_suffix(".json").write_text(json.dumps(data, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    stamme.with_suffix(".md").write_text(_markdown(data), encoding="utf-8")
    return {"md": str(stamme.with_suffix(".md")), **data}


def _markdown(data: dict) -> str:
    linjer = [f"# Fokusplan {data['dato']} (4 timer)", ""]
    for b in data["plan"]:
        linjer += [f"## {b['fra']}–{b['til']} · {b['prosjekt']}", "",
                   f"Mål: {b['maal']}  ", f"Hvorfor nå: {b['hvorfor']}", "",
                   "```", b["prompt"], "```", "",
                   f"**Ferdig når:** {b['suksesskriterium']}", "", f"Pause {b['pause']}", ""]
    return "\n".join(linjer)
