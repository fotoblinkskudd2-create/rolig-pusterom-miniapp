"""Oppgave 1: Anti-slop Bergen / gonzo-stencil-serie.

Flyt:
  Fase 1  nyhet + base-prompt  ->  én /imagine-prompt (Midjourney gir 4 bilder)
  Fase 2  mappe med 4 bilder   ->  scoring, valg av beste, 6 varianter med låst --sref + --seed,
                                    ferdig postpakke (bilde, rå caption, én Suno-linje)

6 varianter × 4 bilder = 24 bilder i samme stil fra én nyhet.
"""
from __future__ import annotations

import json
import random
import shutil
from datetime import date
from pathlib import Path

from . import antislop, llm, mj
from .tekstverktoy import nokkelord, overskrift, slug

PLASSHOLDER_SREF = "[LIM_INN_URL_TIL_VALGT_BILDE]"

SYSTEM = f"""Du er en gatekunstner og gonzo-skribent i Bergen. Du lager satiriske stencil-motiver om norske nyheter.
Stil: svart/hvit sprayet stencil med én aksentfarge, regnvåt betong, Bergen-detaljer (bussholdeplass, Bryggen-panel,
trapper, fjell i tåke). Satiren ligger i motivet. Ingen kopier av kjente verk, og ingen etterligning av en navngitt kunstners signatur.

{antislop.REGLER_PROMPT}

{antislop.REGLER_TEKST}

Caption: førsteperson, rå, nåtid, 2–5 korte setninger, som om du står ved veggen akkurat nå. Ingen oppfordringer, ingen hashtags.
Suno-linje: én linje med stil-tagger i hakeparentes (sjanger, tempo, vokal, uten artistnavn) etterfulgt av én tekstlinje på norsk."""

OPPGAVE = """Nyhet:
\"\"\"{nyhet}\"\"\"

Base-prompt (skal bevares som stilgrunnlag):
\"\"\"{base}\"\"\"

Lag JSON med disse nøklene:
- "motiv": én engelsk Midjourney-motivbeskrivelse (uten parametre) som kombinerer base-prompten med nyhetens kjernekonflikt.
- "varianter": liste med nøyaktig 6 engelske motivbeskrivelser (uten parametre). Samme figur/stil, nye scener som driver historien videre (ulike vinkler, steder i Bergen, tider på døgnet, tilstand på veggen).
- "caption": rå norsk caption.
- "suno": én Suno-linje."""

# Malmodus (uten API-nøkkel): faste scener som holder serien sammen.
VARIANT_MALER = [
    "same stencil figure, tight close-up, spray paint drips running down through the word '{K1}'",
    "wide shot, the stencil on a rain-soaked bus shelter in Bergen, a torn poster about {k2} beside it",
    "the same motif stamped three times in a row on concrete, each print fainter, like a rubber stamp running dry",
    "the figure turned away from the viewer, holding a hand-painted cardboard sign that reads '{K1}'",
    "night, one sodium streetlight, the stencil half covered by grey municipal paint, {k2} still readable underneath",
    "the motif sprayed on a steep Bergen staircase, viewed from below, fog on the mountain, {k1} in small stencil letters",
]
CAPTION_MALER = [
    "Jeg leste om {k1} og hadde sprayboksen i hånda før kaffen ble kald. {C2}. Det står på veggen nå. Regnet får ta resten.",
    "{C1}. {C2}. Ingen forklaring. Bare maling, betong og en by som har sett verre og fortsatt ikke gidder å late som.",
    "Klokka er sen, veggen er våt, og {k1} er fortsatt ikke noens ansvar. Jeg tar ansvaret for malingen. Det er mer enn de fleste.",
]
SUNO_MALER = [
    "[norsk punk spoken word, skitten gitar, 92 bpm, hes vokal] {k1} på veggen og {k2} i regnet, ingen tar telefonen",
    "[lo-fi industrial, tung bass, 78 bpm, hvisket norsk vokal] de malte over {k1} men {k2} siver gjennom",
]


def motiv_offline(nyhet: str, base: str, seed: int) -> dict:
    ord_ = nokkelord(nyhet, 4) or ["systemet", "stillhet"]
    k1 = ord_[0]
    k2 = ord_[1] if len(ord_) > 1 else ord_[0]
    rng = random.Random(seed)
    fyll = {"k1": k1, "k2": k2, "K1": k1.upper(), "K2": k2.upper(), "C1": k1.capitalize(), "C2": k2.capitalize()}
    return {
        "motiv": f"{base}, satirical street stencil about {k1} and {k2}",
        "varianter": [m.format(**fyll) for m in VARIANT_MALER],
        "caption": rng.choice(CAPTION_MALER).format(**fyll),
        "suno": rng.choice(SUNO_MALER).format(**fyll),
        "modus": "offline-maler",
    }


def lag_innhold(nyhet: str, base: str, seed: int, offline: bool) -> dict:
    if offline or not llm.tilgjengelig():
        return motiv_offline(nyhet, base, seed)
    data = llm.json_svar(SYSTEM, OPPGAVE.format(nyhet=nyhet.strip(), base=base.strip()))
    varianter = [str(v) for v in data.get("varianter", [])][:6]
    if len(varianter) < 6 or not data.get("motiv"):
        raise llm.LLMFeil("Modellen leverte ikke motiv + 6 varianter.")
    caption = antislop.rens_tekst(str(data.get("caption", "")))
    return {
        "motiv": str(data["motiv"]),
        "varianter": varianter,
        "caption": caption,
        "suno": str(data.get("suno", "")).strip(),
        "modus": f"claude:{llm.MODELL}",
        "slop_treff_caption": antislop.treff(caption),
    }


def kjor(
    nyhet: str,
    base: str,
    ut: Path,
    bilder: Path | None = None,
    simuler: bool = False,
    velg: int | None = None,
    sref: str | None = None,
    seed: int | None = None,
    sw: int = 300,
    offline: bool = False,
) -> dict:
    seed = seed if seed is not None else mj.seed_fra(nyhet + base)
    tittel = overskrift(nyhet, 8) or "nyhet"
    pakke_dir = ut / f"{date.today().isoformat()}-{slug(tittel)}"
    pakke_dir.mkdir(parents=True, exist_ok=True)

    innhold_fil = pakke_dir / "innhold.json"
    if innhold_fil.exists():  # Gjenbruk fase 1-innhold, så fase 2 gir samme serie.
        innhold = json.loads(innhold_fil.read_text(encoding="utf-8"))
    else:
        innhold = lag_innhold(nyhet, base, seed, offline)
        innhold_fil.write_text(json.dumps(innhold, ensure_ascii=False, indent=2), encoding="utf-8")

    start_prompt = mj.full_prompt(innhold["motiv"], mj.MJParametre(seed=seed))

    if simuler:
        bilder = bilder or (pakke_dir / "bilder")
        mj.simuler_bilder(bilder, 4, seed)

    if bilder is None:
        fase1 = pakke_dir / "fase1_imagine.txt"
        fase1.write_text(
            "FASE 1 – kjør denne i Midjourney (/imagine):\n\n"
            f"{start_prompt}\n\n"
            "Lagre de 4 bildene i en mappe og kjør:\n"
            f"  python -m kunstfabrikk serie --nyhet <samme fil> --base <samme base> --bilder <mappe> [--sref <URL til beste>]\n",
            encoding="utf-8",
        )
        return {"fase": 1, "pakke": str(pakke_dir), "imagine": start_prompt, "fil": str(fase1)}

    kandidater = mj.finn_bilder(bilder)
    if not kandidater:
        raise SystemExit(f"Fant ingen bilder i {bilder}")
    scorer = [{"fil": p.name, **mj.score_bilde(p)} for p in kandidater]
    if velg is not None:
        if not 1 <= velg <= len(kandidater):
            raise SystemExit(f"--velg må være mellom 1 og {len(kandidater)}")
        valgt_idx, valgt_grunn = velg - 1, "manuelt valgt (--velg)"
    else:
        valgt_idx = max(range(len(scorer)), key=lambda i: scorer[i]["score"])
        valgt_grunn = "høyest automatisk score (kontrast/kanter/negativ plass)"
    valgt = kandidater[valgt_idx]
    valgt_kopi = pakke_dir / f"valgt{valgt.suffix.lower()}"
    shutil.copyfile(valgt, valgt_kopi)

    laast = mj.MJParametre(seed=seed, sref=sref or PLASSHOLDER_SREF, sw=sw)
    varianter = [mj.full_prompt(v, laast) for v in innhold["varianter"]]

    pakke = {
        "nyhet": tittel,
        "modus": innhold.get("modus"),
        "seed": seed,
        "sref": laast.sref,
        "imagine_start": start_prompt,
        "valgt_bilde": valgt_kopi.name,
        "valg_grunn": valgt_grunn,
        "scorer": scorer,
        "varianter": varianter,
        "caption": innhold["caption"],
        "suno": innhold["suno"],
        "slop_treff": {
            "caption": antislop.treff(innhold["caption"]),
            "varianter": sorted({t for v in varianter for t in antislop.treff(v, prompt=True)}),
        },
    }
    (pakke_dir / "pakke.json").write_text(json.dumps(pakke, ensure_ascii=False, indent=2), encoding="utf-8")
    (pakke_dir / "pakke.md").write_text(_markdown(pakke), encoding="utf-8")
    return {"fase": 2, "pakke": str(pakke_dir), **pakke}


def _markdown(p: dict) -> str:
    linjer = [
        f"# Postpakke: {p['nyhet']}",
        "",
        f"Valgt bilde: `{p['valgt_bilde']}` ({p['valg_grunn']})  ",
        f"Seed: `{p['seed']}` · Sref: `{p['sref']}` · Modus: {p['modus']}",
        "",
    ]
    if p["sref"] == PLASSHOLDER_SREF:
        linjer += ["> Bytt `" + PLASSHOLDER_SREF + "` med URL-en til valgt bilde fra Midjourney (eller kjør på nytt med --sref).", ""]
    linjer += ["## Caption", "", p["caption"], "", "## Suno", "", p["suno"], "", "## 6 varianter (låst stil)", ""]
    linjer += [f"{i}. `{v}`" for i, v in enumerate(p["varianter"], 1)]
    linjer += ["", "## Scorer", ""]
    linjer += [f"- {s['fil']}: {s['score']}" for s in p["scorer"]]
    return "\n".join(linjer) + "\n"
