"""Kaffekopp som holder kaffen varm i 3 timer uten strøm.

Modellen er en tidssimulering (60 s steg, 3 timer) av varmetapet fra kaffen:

  kaffe + innervegg + PCM  (én node, entalpi-formulering, så smelting/størkning er med)
     │
     ├─ stråling over vakuumspalten       σ·A·(T⁴−Ta⁴)/(1/ε1 + 1/ε2 − 1)          [fysikk]
     ├─ ledning i halsen (kant der indre og ytre vegg møtes) + ytre vegg som kjøleribbe [fysikk]
     ├─ lokket: U-verdi × åpningsareal                                            [fysikk + antakelse]
     ├─ ventil i skyvelokk: fordamping fra en del av ventilarealet                  [antakelse]
     └─ åpen overflate når lokket er av (slurk): naturlig konveksjon + stråling + fordamping
        (Lewis-analogi)                                                             [fysikk]

To bruksscenarier (se 00_brief.md):
  «lukket»: 300 ml kaffe på 85 °C i en kopp på 20 °C, lokket på i 3 timer.
  «bruk»:   som over, men 12 slurker à 15 ml (180 ml drukket), lokket av 8 s per slurk.
Kravet: kaffen er ≥ 60 °C i bruksscenariet etter 3 timer (siste slurk).

PCM (faseendringsmateriale, organisk/parafin) i en lukket kappe rundt innerveggen trekker kaffen
raskt ned mot smeltepunktet og gir varmen tilbake senere. Det gjør kaffen drikkeklar raskere og
holder den nærmere 60 °C, men koster vekt og penger.
"""
import math
import os

from maskin import Heltall, Tall, Valg

NAVN = "kaffekopper"

# --- Faste data -----------------------------------------------------------------------------
SIGMA = 5.67e-8
CP_VANN = 4190.0          # J/kgK, kaffe ≈ vann
RHO_STAAL = 7900.0        # kg/m³
CP_STAAL = 500.0
K_STAAL = 16.0            # W/mK, rustfritt 304
LATENT_PCM = 170e3        # J/kg [kilde: Rubitherm RT55–RT60-klassen 144–179 kJ/kg; antakelse 170]
CP_PCM = 2000.0           # J/kgK [antakelse, typisk parafin]
RHO_PCM = 850.0           # kg/m³ [antakelse]
FYLL_ML = 300.0           # kaffe [antakelse, brief]
T_KAFFE = 85.0            # °C ved helling [antakelse, brief]
T_ROM = 20.0              # °C
T_KOPP_START = 20.0       # koppen er ikke forvarmet [antakelse, verste vanlige bruk]
RH_ROM = 0.5
SLURKER = 12
SLURK_ML = 15.0
AAPEN_S = 8.0
TIMER = 3.0
DT = 60.0
EPS_STAAL = 0.10          # polert rustfritt [antakelse, typisk 0.07–0.15]
EPS_KOBBER = 0.04         # kobberbelagt [antakelse, typisk 0.02–0.05]
SPALTE_MM = 3.0           # vakuumspalte
H_UTE = 9.0               # W/m²K, konveksjon + stråling på ytre vegg [antakelse]

# Lokk: U-verdi (W/m²K) inkl. kondens under lokket, og ventilandel (fordamping fra ventil)
LOKK = {
    #                    U     ventil_m2  masse_g kost_kr
    "ingen":            (None, 0.0,       0,      0),
    "skyvelokk":        (7.5,  1.2e-4,    25,     6),    # enkel PP, ventil 1,2 cm² [antakelse]
    "klikklokk_pakning": (3.5, 0.0,       35,     10),   # dobbel PP m/luft, silikonpakning [antakelse]
    "vakuumlokk":       (1.3,  0.0,       60,     28),   # stål vakuumlokk m/pakning [antakelse]
}
# Pessimistisk skalering av alle varmetap (emissivitet, lokk, hals, ventil): 1.0 = nominelt.
# Pessimistisk kjøring: KAFFE_PESSIMISME=1.3 python3 -m maskin produkter/kaffekopp_...
PESSIMISME = float(os.environ.get("KAFFE_PESSIMISME", "1.0"))

ROM = {
    "kapasitet_ml":   Heltall(330, 500),
    "diameter_mm":    Tall(62.0, 95.0),       # indre diameter
    "vegg_mm":        Tall(0.35, 0.8),        # stålplate (< 0,35 mm bulker/kollapser under 1 atm [antakelse])
    "hals_mm":        Tall(4.0, 20.0),        # lengde på brettet kant der indre og ytre vegg møtes
    "belegg":         Valg(["blank_staal", "kobber"]),
    "kantskjort":     Valg([False, True]),    # lokket har et skjørt som dekker øverste 12 mm av ytterveggen
    "lokk":           Valg(list(LOKK)),
    "pcm_g":          Tall(0.0, 120.0),
    "pcm_smelt_c":    Tall(56.0, 68.0),
    "hank":           Valg([False, True]),
    "innside":        Valg(["staal", "keramikkbelegg"]),
}

FOKUS = {
    "varme":     {"varmeholding": 0.5, "drikkevindu": 0.25, "bruk": 0.15, "pris": 0.10},
    "balansert": {"varmeholding": 0.35, "drikkevindu": 0.2, "bruk": 0.25, "pris": 0.20},
}

NOKKEL = ["belegg", "lokk", "hank", "innside"]

# YETI Rambler 14 oz Mug m/ MagSlider-lokk: mest typiske vakuumkopp med hank [kilde: 02_marked.md]
REFERANSE = {
    "_navn": "YETI Rambler 14 oz Mug, MagSlider-lokk",
    "kapasitet_ml": 414, "diameter_mm": 80.0, "vegg_mm": 0.5, "hals_mm": 6.0, "belegg": "blank_staal", "kantskjort": False,
    "lokk": "skyvelokk", "pcm_g": 0.0, "pcm_smelt_c": 62.0, "hank": True, "innside": "staal",
}


MAKS_HOYDE_MM = 125   # må passe under kaffemaskin og se ut som en kopp, ikke en flaske [antakelse, brief]


def rydd(d):
    """Kopp-form: krymp kapasiteten til ytterhøyden er ≤ MAKS_HOYDE_MM (minst 330 ml).
    Uten lokk finnes det ikke noe lokkskjørt."""
    if d["lokk"] == "ingen":
        d["kantskjort"] = False
    while d["kapasitet_ml"] > 330 and geometri(d)[6] * 1000 > MAKS_HOYDE_MM:
        d["kapasitet_ml"] = max(330, d["kapasitet_ml"] - 5)
    return d


def sigmoid(x):
    return 1 / (1 + math.exp(-max(-50.0, min(50.0, x))))


def klokke(x, topp, bredde):
    return math.exp(-((x - topp) / bredde) ** 2)


def p_metning(t_c):
    """Metningstrykk vann, Pa (Magnus/Tetens, god til ~100 °C)."""
    return 610.94 * math.exp(17.625 * t_c / (t_c + 243.04))


def rho_damp(p_pa, t_c):
    return p_pa * 0.018 / (8.314 * (t_c + 273.15))


def fri_overflate(t, ta=T_ROM):
    """W/m² fra en åpen kaffeoverflate: konveksjon + stråling + fordamping (Lewis-analogi)."""
    dt = max(t - ta, 0.0)
    h = 1.52 * dt ** (1 / 3)                         # varm flate opp, turbulent [fysikk]
    q_konv = h * dt
    q_str = 0.95 * SIGMA * ((t + 273.15) ** 4 - (ta + 273.15) ** 4)
    h_m = h / (1.16 * 1007.0) * 0.85 ** (-2 / 3)     # m/s [fysikk, Le ≈ 0,85]
    drho = rho_damp(p_metning(t), t) - rho_damp(RH_ROM * p_metning(ta), ta)
    q_ford = h_m * max(drho, 0.0) * 2.3e6
    return q_konv + q_str + q_ford


def geometri(d):
    D = d["diameter_mm"] / 1000
    a_bunn = math.pi * D ** 2 / 4
    h_inn = d["kapasitet_ml"] * 1e-6 / a_bunn
    h_fyll = FYLL_ML * 1e-6 / a_bunn
    v_pcm = d["pcm_g"] / 1000 / RHO_PCM
    t_pcm = v_pcm / (math.pi * D * h_fyll) if v_pcm else 0.0      # tykkelse PCM-kappe
    D_ut = D + 2 * (t_pcm + SPALTE_MM / 1000 + 2 * d["vegg_mm"] / 1000 + (0.0005 if v_pcm else 0))
    h_ut = h_inn + 0.012 + max(0.0, d["hals_mm"] - 6) / 1000 + (0.004 if d["lokk"] != "ingen" else 0)
    return D, a_bunn, h_inn, h_fyll, t_pcm, D_ut, h_ut


def simuler(d, bruk=True):
    """Returnerer (temperaturkurve per minutt, temperatur ved hver slurk)."""
    P = PESSIMISME
    D, a_bunn, h_inn, h_fyll, t_pcm, D_ut, _ = geometri(d)
    t_m = d["vegg_mm"] / 1000
    U_lokk, a_ventil = LOKK[d["lokk"]][:2]

    # Stråling over vakuum: våt vegg + bunn + halve tørre vegg (oppvarmet av kondens) [antakelse]
    a_vegg = math.pi * D * h_fyll + a_bunn + 0.5 * math.pi * D * (h_inn - h_fyll)
    eps1 = (EPS_KOBBER if d["belegg"] == "kobber" else EPS_STAAL) * P
    f_str = 1 / (1 / eps1 + 1 / EPS_STAAL - 1)
    # Restgass/getter-tap: liten ekstra ledning [antakelse]
    ua_gass = 0.002 * P

    # Halsen: innervegg fra væske til kant (effektiv 30 % av lufthøyden, kondens varmer resten)
    # + brettet hals (hals_mm), i serie med ytre vegg som kjøleribbe [fysikk, effektiv lengde = antakelse]
    l_hals = 0.3 * min(h_inn - h_fyll, 0.025) + d["hals_mm"] / 1000
    g_hals = K_STAAL * math.pi * D * t_m / l_hals
    g_ribbe = math.sqrt(H_UTE * K_STAAL * t_m) * math.pi * D_ut
    if d["kantskjort"] and d["lokk"] != "ingen":
        # øverste 12 mm av ytterveggen er isolert av lokkskjørtet: ren ledning før ribben starter
        g_ribbe = 1 / (1 / g_ribbe + 0.012 / (K_STAAL * math.pi * D_ut * t_m))
    ua_hals = 1 / (1 / g_hals + 1 / g_ribbe) * P

    ua_lokk = (U_lokk * a_bunn * P) if U_lokk else 0.0

    # Varmekapasitet: kaffe + innervegg (+ PCM-kappevegg) + PCM
    m_inn = RHO_STAAL * t_m * (math.pi * D * h_inn + a_bunn)
    if d["pcm_g"] > 0:
        m_inn += RHO_STAAL * 0.0004 * math.pi * (D + 2 * t_pcm) * h_fyll   # ekstra kappe
    m_pcm = d["pcm_g"] / 1000
    m_kaffe = FYLL_ML / 1000
    tm, bredde = d["pcm_smelt_c"], 1.5            # smelteområde ±1,5 K [antakelse]

    def c_fast():
        return m_kaffe * CP_VANN + m_inn * CP_STAAL + m_pcm * CP_PCM

    def entalpi(T):
        # referanse 0 °C, PCM fast under tm-bredde
        smeltet = min(1.0, max(0.0, (T - (tm - bredde)) / (2 * bredde)))
        return c_fast() * T + m_pcm * LATENT_PCM * smeltet

    def temp(H):
        C = c_fast()
        lo, hi = tm - bredde, tm + bredde
        if H <= C * lo:
            return H / C
        if H >= C * hi + m_pcm * LATENT_PCM:
            return (H - m_pcm * LATENT_PCM) / C
        # i smelteområdet: lineær i H
        return lo + (H - C * lo) / (C * 2 * bredde + m_pcm * LATENT_PCM) * 2 * bredde

    # Helling: kaffe 85 °C inn i kopp på romtemperatur -> felles likevekt
    H = m_kaffe * CP_VANN * T_KAFFE + (m_inn * CP_STAAL + m_pcm * CP_PCM) * T_KOPP_START
    T = temp(H)
    steg = int(TIMER * 3600 / DT)
    slurk_steg = {round((i + 1) * steg / SLURKER) for i in range(SLURKER)} if bruk else set()
    kurve, slurker = [T], []
    ta4 = (T_ROM + 273.15) ** 4
    for n in range(1, steg + 1):
        q = (SIGMA * f_str * a_vegg * ((T + 273.15) ** 4 - ta4)
             + (ua_gass + ua_hals + ua_lokk) * (T - T_ROM))
        if U_lokk is None:
            q += fri_overflate(T) * a_bunn
        elif a_ventil:
            q += 0.3 * fri_overflate(T) * a_ventil * P             # 30 % effektiv ventil [antakelse]
        H -= q * DT
        T = temp(H)
        if n in slurk_steg:
            if U_lokk is not None:   # lokket av i AAPEN_S sekunder
                H -= fri_overflate(T) * a_bunn * AAPEN_S * P
                T = temp(H)
            slurker.append(T)
            m_ut = min(SLURK_ML / 1000, m_kaffe - 0.02)
            H -= m_ut * CP_VANN * T
            m_kaffe -= m_ut
            T = temp(H) if m_kaffe > 0 else T
        kurve.append(T)
    return kurve, slurker


def kostnad(d):
    """Produksjonskost NOK/stk ved 10 000 stk, OEM i Asia, inkl. emballasje og frakt [antakelse]."""
    k = 28 + 0.03 * d["kapasitet_ml"] + 12 * (d["vegg_mm"] - 0.5) + 0.4 * max(0.0, d["hals_mm"] - 6)
    k += 3 * (d["belegg"] == "kobber") + 4 * (d["kantskjort"] and d["lokk"] != "ingen")
    k += LOKK[d["lokk"]][3]
    if d["pcm_g"] > 0:
        k += 18 + 0.25 * d["pcm_g"]          # tredje vegg, sveis, fylling, lekkasjetest
    k += 5 * d["hank"] + 8 * (d["innside"] == "keramikkbelegg")
    return k + 15


def vekt_g(d):
    D, a_bunn, h_inn, h_fyll, t_pcm, D_ut, h_ut = geometri(d)
    t_m = d["vegg_mm"] / 1000
    staal = RHO_STAAL * t_m * ((math.pi * D * h_inn + a_bunn) + (math.pi * D_ut * h_ut + math.pi * D_ut ** 2 / 4))
    if d["pcm_g"] > 0:
        staal += RHO_STAAL * 0.0004 * math.pi * (D + 2 * t_pcm) * h_fyll
    return staal * 1000 + d["pcm_g"] + LOKK[d["lokk"]][2] + 30 * d["hank"] + 8 * (d["innside"] == "keramikkbelegg") + 15


def score(d):
    kurve_b, slurker = simuler(d, bruk=True)
    kurve_l, _ = simuler(d, bruk=False)
    t3_bruk, t3_lukket = slurker[-1], kurve_l[-1]

    varme = 0.7 * sigmoid((t3_bruk - 60.0) / 2.0) + 0.3 * sigmoid((t3_lukket - 62.0) / 3.0)

    # Drikkevindu 55–66 °C [kilde: Lee & O'Mahony 2002 ≈ 60 °C; 2022: 58–66 °C; IARC > 65 °C]
    i_vindu = [55.0 <= T <= 66.0 for T in kurve_b]
    vindu = sum(i_vindu) / len(kurve_b)
    min_drikkeklar = next((i for i, T in enumerate(kurve_b) if T <= 66.0), len(kurve_b))
    slurk_ok = sum(55.0 <= T <= 68.0 for T in slurker) / len(slurker)
    drikke = 0.5 * vindu + 0.5 * slurk_ok

    D, _, h_inn, _, _, D_ut, h_ut = geometri(d)
    vekt = vekt_g(d)
    stabil = sigmoid((1.55 - h_ut / D_ut) * 8)                        # høy, smal kopp velter [antakelse]
    grep = 1.0 if d["hank"] else klokke(D_ut * 1000, 78, 12)          # uten hank må den gripes rundt
    munn = {"ingen": 1.0, "skyvelokk": 0.8, "klikklokk_pakning": 0.75, "vakuumlokk": 0.65}[d["lokk"]]
    smak = 1.0 if d["innside"] == "keramikkbelegg" else 0.75
    styrke = sigmoid((d["vegg_mm"] - 0.38) * 25)                      # bulker/vakuumbrudd ved tynn plate
    bruk = (0.2 * sigmoid((480 - vekt) / 60) + 0.15 * stabil + 0.2 * grep + 0.15 * munn
            + 0.15 * smak + 0.15 * styrke)

    kost = kostnad(d)
    pris_kr = round(kost * 4.5 / 10) * 10 - 1                           # utsalgspris inkl. mva [antakelse]
    form = sigmoid((MAKS_HOYDE_MM - h_ut * 1000) / 2.0)                 # hard grense: ikke en flaske
    return {
        "varmeholding": varme * form,
        "drikkevindu": drikke * form,
        "bruk": bruk * form,
        "pris": 1 / (1 + pris_kr / 400),
        "_T_3t_bruk_C": round(t3_bruk, 1),
        "_T_3t_lukket_C": round(t3_lukket, 1),
        "_T_start_C": round(kurve_b[0], 1),
        "_min_til_66C": min_drikkeklar,
        "_vekt_g": round(vekt),
        "_hoyde_mm": round(h_ut * 1000),
        "_ytre_diam_mm": round(D_ut * 1000, 1),
        "_kost_kr": round(kost),
        "_pris_kr": pris_kr,
    }
