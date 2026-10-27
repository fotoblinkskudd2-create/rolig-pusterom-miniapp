"""Bladelement-momentteori (BEMT) for propell i sveving.

Hver radiell stasjon løses for indusert hastighet v_i slik at moment-teori
(dT = 4*pi*rho*r*F*v_i^2 dr) og bladelement-teori (løft og motstand fra profilet)
gir samme skyvkraft. Prandtl tipptap (F) er med. Virvel (swirl) er neglisjert,
som er vanlig og gir < 2 % feil i sveving for slike propeller.

Profildata er en forenklet lav-Reynolds-modell (se PROFILER). Den er grov, men
lik for alle design, så sammenligninger mellom design er mer pålitelige enn
absolutte tall. Verifiser alltid på testbenk.
"""
import math

import numpy as np

RHO = 1.225      # kg/m^3
NU = 1.48e-5     # m^2/s, kinematisk viskositet luft 15 °C
N_ST = 24        # radielle stasjoner

# Forenklede polarer. cl = cl0 + a0*alpha (rad) til clmax; cd = cd0*(Re/1e5)^re_eks + k*(cl-cl_min)^2.
# Tallene er tilpasset publiserte lav-Re-data (Selig/UIUC) i størrelsesorden, ikke eksakt.
PROFILER = {
    # Flatbunnet, ~11 % tykk (Clark-Y-type). Typisk billig slow-fly-propell.
    "flatbunn":     dict(cl0=0.40, a0=5.6, clmax=1.15, cd0=0.020, re_eks=-0.5, k=0.020, cl_min=0.40, tykk=0.11),
    # Tynn, krummet lav-Re-profil, ~8 % tykk (SD7037/E387-type).
    "lavRe_8pst":   dict(cl0=0.50, a0=5.8, clmax=1.20, cd0=0.013, re_eks=-0.4, k=0.014, cl_min=0.55, tykk=0.08),
    # Svært tynn krummet plate-profil, ~5 % tykk. Best aerodynamisk, krever karbonfiber.
    "tynn_5pst":    dict(cl0=0.55, a0=5.9, clmax=1.15, cd0=0.011, re_eks=-0.35, k=0.016, cl_min=0.65, tykk=0.05),
}


def polar(profil, alpha, re):
    p = PROFILER[profil]
    alpha_stall = (p["clmax"] - p["cl0"]) / p["a0"]
    cl_lin = p["cl0"] + p["a0"] * alpha
    over = np.maximum(alpha - alpha_stall, 0)
    cl = np.where(alpha > alpha_stall, p["clmax"] - 2.0 * over, cl_lin)
    cl = np.maximum(cl, -0.8)
    cd = p["cd0"] * (np.maximum(re, 2e4) / 1e5) ** p["re_eks"] + p["k"] * (cl_lin.clip(-0.5, p["clmax"]) - p["cl_min"]) ** 2
    cd = cd + 2.4 * np.sin(np.minimum(over, 0.6)) ** 2
    return cl, cd, alpha_stall


def stasjoner(R, rot=0.15):
    # Cosinus-fordeling: tettere ved tippen der lasten endres raskt.
    t = np.linspace(0, math.pi, N_ST + 1)
    kanter = rot * R + (R - rot * R) * (1 - np.cos(t)) / 2
    r = (kanter[1:] + kanter[:-1]) / 2
    dr = np.diff(kanter)
    return r, dr


def ytelse(geo, omega):
    """geo: dict med R, B, profil, chord(r) [m], theta(r) [rad] som arrays på stasjonene."""
    R, B, r, dr, c, th = geo["R"], geo["B"], geo["r"], geo["dr"], geo["chord"], geo["theta"]
    U = omega * r
    lo = np.full_like(r, 1e-4)
    hi = np.full_like(r, 0.5) * U

    def rest(vi):
        phi = np.arctan2(vi, U)
        f = B / 2 * (R - r) / (r * np.maximum(np.sin(phi), 1e-6))
        F = 2 / math.pi * np.arccos(np.clip(np.exp(-f), 0, 1))
        F = np.maximum(F, 1e-3)
        W2 = vi ** 2 + U ** 2
        re = np.sqrt(W2) * c / NU
        cl, cd, a_st = polar(geo["profil"], th - phi, re)
        dT_be = B * 0.5 * RHO * W2 * c * (cl * np.cos(phi) - cd * np.sin(phi))
        dT_mo = 4 * math.pi * RHO * r * F * vi ** 2
        return dT_mo - dT_be, (phi, W2, cl, cd, re, a_st)

    for _ in range(26):  # bisection, vektorisert over alle stasjoner
        mid = (lo + hi) / 2
        res, _ = rest(mid)
        neg = res < 0
        lo = np.where(neg, mid, lo)
        hi = np.where(neg, hi, mid)
    vi = (lo + hi) / 2
    _, (phi, W2, cl, cd, re, a_st) = rest(vi)
    dT = B * 0.5 * RHO * W2 * c * (cl * np.cos(phi) - cd * np.sin(phi)) * dr
    dQ = B * 0.5 * RHO * W2 * c * (cl * np.sin(phi) + cd * np.cos(phi)) * r * dr
    T, Q = float(dT.sum()), float(dQ.sum())
    alpha = th - phi
    return {
        "T": T, "P": Q * omega, "omega": omega,
        "alpha_maks_grader": float(np.degrees(alpha[r < 0.97 * R].max())),
        "alpha_stall_grader": float(np.degrees(a_st)),
        "re_75": float(np.interp(0.75 * R, r, re)),
        "dT": dT / dr, "alpha": alpha,
    }


def ved_skyvkraft(geo, T_maal, omega0=600.0):
    """Finn turtall som gir ønsket skyvkraft. T ~ omega^2, så to-tre korreksjoner holder."""
    omega = omega0
    for _ in range(4):
        y = ytelse(geo, omega)
        if y["T"] <= 0:
            return None
        omega *= math.sqrt(T_maal / y["T"])
    y = ytelse(geo, omega)
    if abs(y["T"] - T_maal) / T_maal > 0.01:
        return None
    y["rpm"] = omega * 60 / (2 * math.pi)
    return y


def ideell_effekt(T, R):
    return T ** 1.5 / math.sqrt(2 * RHO * math.pi * R ** 2)


def lag_geo(R, B, profil, chord_kp, pitch_kp, rot=0.15):
    """chord_kp: (r/R, c/R) kontrollpunkter. pitch_kp: (r/R, geometrisk pitch / D)."""
    r, dr = stasjoner(R, rot)
    x = r / R
    cx, cy = zip(*chord_kp)
    px, py = zip(*pitch_kp)
    chord = np.interp(x, cx, cy) * R
    pitch = np.interp(x, px, py) * 2 * R
    theta = np.arctan(pitch / (2 * math.pi * r))
    return {"R": R, "B": B, "profil": profil, "r": r, "dr": dr, "chord": chord, "theta": theta,
            "pitch": pitch}
