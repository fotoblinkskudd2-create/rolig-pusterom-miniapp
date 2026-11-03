"""Revisjonsbiblioteket: konkrete endringer som agentene kan foreslå.

Hver endring er en hypotese om hva som ville gjøre idéen bedre.
Den må testes i virkeligheten før den tas for gitt.
"""
from __future__ import annotations

from .model import Idea

NON_ESSENTIAL = ("skjerm", "sensor")


def apply_fix(idea: Idea, fix: str) -> tuple[Idea, bool]:
    """Returnerer (ny idé, endret?). Originalen røres ikke."""
    new = idea.clone()
    note: str | None = None

    if fix == "differensier":
        candidates = ["lokal-først", "fysisk objekt", "ingen konto", "ingen persondata"]
        add = next((c for c in candidates if c not in new.differentiators), None)
        if add:
            new.differentiators.append(add)
            note = f"Lagt til særtrekk «{add}» (må testes i intervju)."

    elif fix == "forenkle":
        # Bare komponenter som ikke bærer kjernefunksjonen kan fjernes.
        # Knapper, LED og batteri er kjernen, så de røres aldri.
        removable = [c for c in new.components if c.name.split()[0] in NON_ESSENTIAL]
        if removable and len(new.components) > 4:
            target = removable[0]
            new.components.remove(target)
            note = f"Fjernet komponent «{target.name}» for enklere form."

    elif fix == "bytt_komponent":
        for c in new.components:
            if c.availability == "lav":
                c.availability = "middels"
                note = f"Byttet «{c.name}» til standardalternativ (antagelse: finnes hos leverandør)."
                break

    # Avveininger: hver endring har en pris. Uten pris ville loopen bare
    # kutte og snevre inn uten konsekvens, og det er ikke realistisk.
    elif fix == "kutt_scope":
        if new.dev_months > 6:
            new.dev_months = max(4, new.dev_months - 3)
            new.segment_score = max(0, new.segment_score - 0.5)
            note = "Kuttet MVP-scope (pris: ett tilbud færre, segmentet verdsetter det litt mindre)."

    elif fix == "nisjeskifte":
        if new.competitors >= 8:
            new.competitors = max(1, new.competitors - 2)
            new.segment_score = max(0, new.segment_score - 1)
            note = "Snevret inn til nisje (antagelse: 2 færre konkurrenter, men mindre adresserbart segment)."

    elif fix == "prisjustering":
        new.price = round(new.price * 1.15)
        note = f"Prisen hevet 15 % til {new.price} NOK (må testes med betalingsvilje-intervju)."

    elif fix == "fjern_helseløfte":
        if new.reg_risk >= 2:
            new.reg_risk = max(0, new.reg_risk - 2)
            note = "Fjernet helsespråk: rammes som velvære og ro, ikke behandling."

    else:
        raise ValueError(f"ukjent fix: {fix!r}")

    if note is None:
        return idea, False
    new.history.append(note)
    return new, True
