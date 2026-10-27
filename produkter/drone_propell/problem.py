"""Dronepropell, 10 tommer (254 mm), for en 1,6 kg quadcopter (3,92 N per propell i sveving).

Mål: minst 17 % mindre effekt for samme skyvkraft enn en vanlig 10x4.5 nylonpropell,
med samme diameter, så den passer samme ramme og motor.
Fysikken ligger i bemt.py. Krever numpy.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bemt  # noqa: E402

from maskin import Tall, Valg  # noqa: E402

# Robust design: anta at nye profiler har mer motstand enn modellen sier
# (f.eks. PROPELL_PESSIMISME=1.25). Referansens flatbunnede profil endres ikke.
PESSIMISME = float(os.environ.get("PROPELL_PESSIMISME", "1"))
for _navn, _p in bemt.PROFILER.items():
    if _navn != "flatbunn":
        _p["cd0"] *= PESSIMISME
        _p["k"] *= PESSIMISME

NAVN = "dronepropeller"
R = 0.127                       # 10" diameter
T_SVEV = 1.6 * 9.81 / 4         # N per propell
RPM_START = 5500

ROM = {
    "blader": Valg([2, 3]),
    "profil": Valg(list(bemt.PROFILER)),
    "materiale": Valg(["nylon_glassfiber", "karbonfiber"]),
    # Korde (bredde) / R ved r/R = 0.2, 0.45, 0.7, 0.95
    "korde_020": Tall(0.05, 0.25),
    "korde_045": Tall(0.05, 0.25),
    "korde_070": Tall(0.04, 0.22),
    "korde_095": Tall(0.02, 0.15),
    # Geometrisk pitch / D ved r/R = 0.25, 0.6, 0.95 (vridning langs bladet)
    "pitch_025": Tall(0.2, 0.9),
    "pitch_060": Tall(0.2, 0.9),
    "pitch_095": Tall(0.2, 0.9),
}

FOKUS = {
    "effektivitet": {"effektivitet": 0.6, "stallmargin": 0.15, "styrke": 0.1, "respons": 0.15},
    "balansert":    {"effektivitet": 0.4, "stallmargin": 0.15, "styrke": 0.1, "respons": 0.15, "støy": 0.2},
}

NOKKEL = ["blader", "profil", "materiale"]

REFERANSE = {
    "_navn": "vanlig 10x4.5 nylonpropell (flatbunnet profil, konstant pitch)",
    "blader": 2, "profil": "flatbunn", "materiale": "nylon_glassfiber",
    "korde_020": 0.12, "korde_045": 0.17, "korde_070": 0.145, "korde_095": 0.083,
    "pitch_025": 0.45, "pitch_060": 0.45, "pitch_095": 0.45,
}


def geometri(d):
    chord = [(0.15, d["korde_020"]), (0.2, d["korde_020"]), (0.45, d["korde_045"]),
             (0.7, d["korde_070"]), (0.95, d["korde_095"]), (1.0, d["korde_095"] * 0.8)]
    pitch = [(0.0, d["pitch_025"]), (0.25, d["pitch_025"]), (0.6, d["pitch_060"]),
             (0.95, d["pitch_095"]), (1.0, d["pitch_095"])]
    return bemt.lag_geo(R, d["blader"], d["profil"], chord, pitch)


def svev(d, T=T_SVEV):
    return bemt.ved_skyvkraft(geometri(d), T, RPM_START * 2 * math.pi / 60)


def _ref_effekt():
    return svev({k: v for k, v in REFERANSE.items() if not k.startswith("_")})["P"]


P_REF = _ref_effekt()


def bladareal(d):
    g = geometri(d)
    return d["blader"] * float((g["chord"] * g["dr"]).sum())


A_REF = bladareal(REFERANSE)


def clip(x):
    return max(0.0, min(1.0, x))


def score(d):
    y = svev(d)
    if y is None:
        return {"effektivitet": 0, "stallmargin": 0, "styrke": 0, "respons": 0, "støy": 0}
    gevinst = P_REF / y["P"] - 1
    geo = geometri(d)
    midt = (geo["r"] > 0.3 * R) & (geo["r"] < 0.97 * R)
    a_maks = math.degrees(float(y["alpha"][midt].max()))
    tykk = bemt.PROFILER[d["profil"]]["tykk"]
    rot_mm = d["korde_020"] * R * 1000 * tykk           # profiltykkelse ved roten
    styrke = 0.6 * clip(rot_mm / 2.8) + 0.4 * clip(d["korde_095"] / 0.05)
    if d["materiale"] == "nylon_glassfiber" and tykk < 0.07:
        styrke *= 0.4                                    # for tynn for nylon: flagrer og bøyer
    v_tipp = y["omega"] * R
    # Mer bladareal = tyngre propell = tregere turtallsendring = dårligere styring av dronen.
    areal = bladareal(d) / A_REF
    return {
        "effektivitet": clip(gevinst / 0.30),
        "stallmargin": clip((y["alpha_stall_grader"] - a_maks) / 4),
        "styrke": styrke,
        "respons": clip(2.0 - areal),
        "støy": clip((210 - v_tipp) / 80),
        "_bladareal_x": areal,
        "_gevinst_pst": 100 * gevinst,
        "_effekt_W": y["P"],
        "_rpm": y["rpm"],
        "_FM": bemt.ideell_effekt(T_SVEV, R) / y["P"],
        "_tipp_m_s": v_tipp,
    }
