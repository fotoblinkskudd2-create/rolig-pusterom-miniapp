"""VIBE-LÅS: holder systemet nivået, eller glir det når ingen ser på?

Sammenligner siste 7 dager mot 30-dagers grunnlinje på fire akser:
  - inngrep per leveranse  (opp = verre)
  - snittscore             (ned = verre)
  - kostnad per leveranse  (opp = verre)
  - feilrate på kall       (opp = verre)
Glir én akse mer enn TERSKEL → GLIR. Ellers LÅST. For få leveranser → FOR LITE DATA.
"""
from __future__ import annotations

from datetime import datetime

from ..data import Datasett
from ..metrikk import Sum, per_dag_motor, summer

TERSKEL = 0.20          # 20 % forverring før vi roper
MIN_LEVERANSER = 3      # under dette er alt støy


def _endring(ny: float | None, gammel: float | None) -> float | None:
    if ny is None or gammel is None:
        return None
    if gammel == 0:
        return 0.0 if ny == 0 else 1.0
    return (ny - gammel) / abs(gammel)


class VibeLaas:
    navn = "VIBE-LÅS"

    def vurder(self, d: Datasett, nå: datetime):
        from . import Benkresultat

        uke: Sum = summer(per_dag_motor(d, nå, 7), 7)
        mnd: Sum = summer(per_dag_motor(d, nå, 30), 30)

        if uke.leveranser < MIN_LEVERANSER:
            return Benkresultat(self.navn, "FOR LITE DATA",
                                f"{uke.leveranser} leveranser siste 7d — trenger {MIN_LEVERANSER} før benken tør si noe.",
                                {"leveranser_7d": uke.leveranser})

        akser = {
            # navn: (endring der positiv = verre)
            "inngrep/leveranse": _endring(uke.inngrep_per_leveranse, mnd.inngrep_per_leveranse),
            "snittscore": (lambda e: None if e is None else -e)(_endring(uke.snittscore, mnd.snittscore)),
            "kostnad/leveranse": _endring(uke.kostnad_per_leveranse, mnd.kostnad_per_leveranse),
            "feilrate": _endring(uke.feilrate, mnd.feilrate),
        }
        glir = {k: v for k, v in akser.items() if v is not None and v > TERSKEL}
        if glir:
            verst = max(glir, key=glir.__getitem__)
            linje = f"{verst} {glir[verst]:+.0%} verre enn 30d-grunnlinjen"
            if len(glir) > 1:
                linje += f" (+{len(glir) - 1} akse{'r' if len(glir) > 2 else ''} til)"
            return Benkresultat(self.navn, "GLIR", linje, {"akser": akser, "glir": list(glir)})
        return Benkresultat(self.navn, "LÅST", "ingen akse har glidd mer enn "
                            f"{TERSKEL:.0%} mot 30d-grunnlinjen", {"akser": akser, "glir": []})
