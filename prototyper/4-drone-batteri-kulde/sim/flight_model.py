#!/usr/bin/env python3
"""Enkel flytidsmodell: batteri i kulde, med og uten isolert hylse (prototype).

ALLE parametre er PLACEHOLDERE. Fyll inn fra datablad og målinger.
Forvarming skjer på bakken med nettstrøm, og teller ikke mot flytid.
Under flukt varmer batteriet ikke seg selv (konservativt antatt).
"""
import math

# --- Placeholder-parametre (verifiser) ---
E_NOM_WH   = 111.0    # nominell energi: 6S x 5 Ah x 3.7 V ~ 111 Wh [verifiser]
USABLE     = 0.85     # andel av nominell energi som brukes før lav spenning [verifiser]
P_HOVER_W  = 350.0    # hovereffekt for dronen, med last [verifiser]
T_REF_C    = 25.0     # referansetemperatur for kapasitet
K_LOSS     = 0.008    # kapasitetstap per grad under referanse [verifiser: fra kjølekammertest]
F_MIN      = 0.40     # kapasitet skal ikke synke under 40 % av nominell
DT_MIN     = 0.05     # tidssteg i minutter
TAU_BARE   = 0.0      # minutter: uten hylse følger batteriet lufttemperatur umiddelbart
TAU_SLEEVE = 30.0     # minutter: tidskonstant med isolasjon + PCM [verifiser]
T_PRE_C    = 10.0     # temperatur etter forvarming, med hylse


def capacity_factor(t_c):
    """Andel av nominell kapasitet tilgjengelig ved temperatur t_c."""
    if t_c >= T_REF_C:
        return 1.0
    return max(F_MIN, 1.0 - K_LOSS * (T_REF_C - t_c))


def battery_temp(t_min, t_start, t_amb, tau):
    """Batteritemperatur etter t_min minutter. tau=0 betyr umiddelbar lik lufttemperatur."""
    if tau <= 0:
        return t_amb
    return t_amb + (t_start - t_amb) * math.exp(-t_min / tau)


def flight_time(t_amb, t_start, tau):
    """Minutter til kapasiteten er brukt opp. Returnerer minutter."""
    used = 0.0  # andel brukt av tilgjengelig kapasitet ved gjeldende temperatur
    t = 0.0
    while True:
        temp = battery_temp(t, t_start, t_amb, tau)
        avail_wh = E_NOM_WH * USABLE * capacity_factor(temp)
        used += (P_HOVER_W * DT_MIN / 60.0) / avail_wh
        if used >= 1.0:
            return t
        t += DT_MIN
        if t > 120:  # sikkerhetsstopp
            return t


def main():
    print(f"{'Ute (°C)':>9} | {'Uten hylse (min)':>17} | {'Med hylse, 10 °C (min)':>23}")
    print("-" * 56)
    for t_amb in (10.0, 0.0, -10.0, -20.0):
        bare = flight_time(t_amb, t_amb, TAU_BARE)
        sleeve = flight_time(t_amb, T_PRE_C, TAU_SLEEVE)
        print(f"{t_amb:>9.0f} | {bare:>17.1f} | {sleeve:>23.1f}")
    print()
    print("Placeholder-parametre. Ikke målte verdier.")


if __name__ == "__main__":
    main()
