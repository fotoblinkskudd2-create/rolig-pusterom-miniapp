"""MAL – kopier denne mappen til produkter/<ditt-produkt>/ og fyll inn.

Eksemplet under er en drikkeflaske, bare for å vise formen. Bytt ut alt.
Kjør:  python3 -m maskin produkter/<ditt-produkt>
"""
import math

from maskin import Heltall, Tall, Valg

NAVN = "drikkeflasker"

# 1. Hva kan du endre? Ett navn per egenskap, med lovlige verdier.
ROM = {
    "volum_ml":      Heltall(300, 1500),
    "veggtykkelse":  Tall(0.5, 3.0),          # mm
    "materiale":     Valg(["plast", "stål", "glass"]),
    "isolert":       Valg([False, True]),
}

# 2. Hvor mye teller hvert delmål? Lag flere profiler for ulike kunder/mål.
FOKUS = {
    "balansert": {"nytte": 0.4, "holdbarhet": 0.3, "pris": 0.3},
    "tur":       {"nytte": 0.5, "holdbarhet": 0.5},
}

# Parametre som skiller ulike konsepter i resultatlista (valgfritt).
NOKKEL = ["materiale", "isolert"]

# Et kjent produkt å sammenligne med (valgfritt).
REFERANSE = {"_navn": "vanlig plastflaske", "volum_ml": 500, "veggtykkelse": 0.6,
             "materiale": "plast", "isolert": False}


def rydd(d):
    """Gjør designet fysisk mulig (valgfritt)."""
    if d["materiale"] == "glass":
        d["isolert"] = False
    return d


# 3. Hvor bra er et design? Returner delpoeng mellom 0 og 1.
#    Start med fornuftige regler. Bytt dem ut med målinger så snart du har prototyper.
def score(d):
    pris_kr = {"plast": 40, "stål": 150, "glass": 120}[d["materiale"]] + 120 * d["isolert"]
    return {
        "nytte": math.exp(-((d["volum_ml"] - 750) / 400) ** 2) * (0.7 + 0.3 * d["isolert"]),
        "holdbarhet": min(1, d["veggtykkelse"] / 2) * {"plast": 0.6, "stål": 1, "glass": 0.4}[d["materiale"]],
        "pris": 1 / (1 + pris_kr / 150),
        "_pris_kr": pris_kr,      # starter med _ = vises, men teller ikke
    }
