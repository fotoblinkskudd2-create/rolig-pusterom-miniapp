"""Tannbørste. Poengene er heuristikker fra tannhelseråd, ikke målinger.
Bytt ut funksjonene i score() med målinger fra prototyper når dere har dem."""
import math

from maskin import Heltall, Tall, Valg

NAVN = "tannbørster"

ROM = {
    "hode_lengde_mm":      Tall(14.0, 32.0),
    "hode_bredde_mm":      Tall(7.0, 14.0),
    "bust_diameter_mm":    Tall(0.10, 0.25),   # <0.18 regnes som myk
    "bust_tetthet":        Heltall(20, 60),    # tuster per hode
    "bust_vinkel_grader":  Tall(0, 60),        # 45 = Bass-teknikk
    "nakke_vinkel_grader": Tall(0, 25),
    "skaft_tykkelse_mm":   Tall(8.0, 30.0),
    "drift":               Valg(["manuell", "roterende", "sonisk", "ultralyd"]),
    "frekvens_tusen_spm":  Tall(0, 45),        # tusen strøk per minutt, kun motor
    "trykksensor":         Valg([False, True]),
    "timer":               Valg([False, True]),
    "tungerenser":         Valg([False, True]),
    "utskiftbart_hode":    Valg([False, True]),
    "materiale":           Valg(["plast", "bambus", "resirkulert", "aluminium"]),
    "tanntrad_tuster":     Valg([False, True]),
}

FOKUS = {
    "balansert":  {"rengjøring": 0.3, "skånsomhet": 0.2, "rekkevidde": 0.15,
                   "bruk": 0.1, "miljø": 0.15, "pris": 0.1},
    # Rekkevidde teller fordi plakk du ikke når ikke fjernes; skånsomhet er sikkerhetsgulv.
    "rengjøring": {"rengjøring": 0.75, "skånsomhet": 0.05, "rekkevidde": 0.2},
}

NOKKEL = ["drift", "materiale", "utskiftbart_hode", "tanntrad_tuster", "tungerenser"]

REFERANSE = {
    "_navn": "vanlig billig plastbørste",
    "hode_lengde_mm": 28, "hode_bredde_mm": 12, "bust_diameter_mm": 0.20, "bust_tetthet": 30,
    "bust_vinkel_grader": 0, "nakke_vinkel_grader": 0, "skaft_tykkelse_mm": 10,
    "drift": "manuell", "frekvens_tusen_spm": 0, "trykksensor": False, "timer": False,
    "tungerenser": False, "utskiftbart_hode": False, "materiale": "plast", "tanntrad_tuster": False,
}

MILJO = {"plast": 0.2, "bambus": 0.8, "resirkulert": 0.7, "aluminium": 0.6}
MATERIALPRIS = {"plast": 5, "bambus": 15, "resirkulert": 10, "aluminium": 40}
DRIFTPRIS = {"manuell": 0, "roterende": 250, "sonisk": 400, "ultralyd": 900}


def rydd(d):
    if d["drift"] == "manuell":
        d["frekvens_tusen_spm"] = 0
        d["trykksensor"] = False
        d["timer"] = False
    return d


def klokke(x, topp, bredde):
    """1.0 ved topp, faller mykt av på begge sider."""
    return math.exp(-((x - topp) / bredde) ** 2)


def score(d):
    motor = d["drift"] != "manuell"
    myk = 1 / (1 + math.exp((d["bust_diameter_mm"] - 0.17) / 0.015))
    f = d["frekvens_tusen_spm"]

    # Cochrane-oversikt (Yaacob m.fl. 2014): roterende-oscillerende fjerner
    # litt mer plakk enn soniske i direkte sammenligninger.
    motor_effekt = {
        "manuell": 0.0,
        "roterende": 0.25 * klokke(f, 8, 6),
        "sonisk": 0.22 * klokke(f, 31, 10),
        "ultralyd": 0.2 * klokke(f, 40, 8),
    }[d["drift"]]
    rengjoring = min(1, (
        0.35 * klokke(d["bust_tetthet"], 42, 15)
        + 0.25 * klokke(d["bust_vinkel_grader"], 45, 15)
        + motor_effekt
        + 0.1 * d["tanntrad_tuster"]
        + 0.05 * (1 - abs(d["bust_diameter_mm"] - 0.15) / 0.15)
    ))
    skansomhet = 0.6 * myk + 0.25 * d["trykksensor"] + 0.15 * (1 - f / 45)
    rekkevidde = (0.45 * klokke(d["hode_lengde_mm"], 20, 5)
                  + 0.3 * klokke(d["hode_bredde_mm"], 9.5, 2)
                  + 0.25 * klokke(d["nakke_vinkel_grader"], 12, 7))
    # Motor og batteri krever et tykkere skaft (~26 mm); manuelle grep best rundt 14 mm.
    grep_topp = 25 if motor else 14
    bruk = (0.5 * klokke(d["skaft_tykkelse_mm"], grep_topp, 4)
            + 0.3 * d["timer"] + 0.2 * d["tungerenser"])
    miljo = 0.5 * MILJO[d["materiale"]] + 0.35 * d["utskiftbart_hode"] + 0.15 * (not motor)
    pris_kr = (MATERIALPRIS[d["materiale"]] + DRIFTPRIS[d["drift"]] + 60 * d["trykksensor"]
               + 20 * d["timer"] + 15 * d["utskiftbart_hode"] + 0.5 * d["bust_tetthet"])
    return {
        "rengjøring": rengjoring,
        "skånsomhet": skansomhet,
        "rekkevidde": rekkevidde,
        "bruk": bruk,
        "miljø": miljo,
        "pris": 1 / (1 + pris_kr / 300),
        "_pris_kr": pris_kr,
    }
