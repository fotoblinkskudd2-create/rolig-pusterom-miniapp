"""«Stille vakt» – japansk-inspirert system for eldreomsorg (teknologi + hjelpemidler + arbeidsmåte).

Modellen regner ett år for 100 beboere (sykehjem) eller 100 brukere (hjemmetjeneste) og sammenligner
med «dagens praksis» (fast nattrunde hver 2. time, ingen sensorer, ingen strukturert smertekartlegging).

Hovedmekanismer:
  1. Varsling er signaldeteksjon [matematikk]: treff = Φ(d' − c), falske alarmer = N_hendelser · Φ(−c).
     Sensorfusjon av to uavhengige kilder: d'_fusjon = √(d1² + d2²)  [standard SDT-resultat].
  2. Et fall ved sengekanten forhindres bare hvis pleieren kommer før beboeren står:
     P(R < L) med R (responstid) og L (tid fra sitte/uro til å stå) lognormale  [matematikk].
     Responstiden øker med alarmbelastning (M/M/1-ventetid, ρ/(1−ρ)) og alarmtretthet.
     Dette forklarer hvorfor rene sengealarmer ikke virket i RCT-er (REFINE 2014): pleieren kommer for sent.
  3. Frigjort pleietid (færre runder som vekker, færre fall, vasketoalett …) kan gå til menneskelig kontakt
     (minutter per beboer per døgn) eller tas ut som kostnadskutt. Kontakt gir QALY med avtagende nytte.
  4. Kostnad for kommunen (annuitet 5 år, 4 %) og for samfunnet (sykehus). ICER = netto kost / QALY.

Alle effektstørrelser er merket [kilde] eller [antakelse] (se 01_research.md). Pessimistisk kjøring:
  ELDRE_PESSIMISME=1.3 python3 -m maskin produkter/hoyteknologisk_eldreomsorg_inspirert
  (alle gunstige effekter / 1.3, alle kostnader og tidsbruk × 1.3)
Hjemmetjeneste:  ELDRE_SETTING=hjemme python3 -m maskin ...
"""
import math
import os

from maskin import Heltall, Tall, Valg

NAVN = "eldreomsorgssystemer (per 100 beboere per år)"

P = float(os.environ.get("ELDRE_PESSIMISME", "1.0"))
SETTING = os.environ.get("ELDRE_SETTING", "sykehjem")

# --- Faste data per setting ---------------------------------------------------------------------
S = {
    "sykehjem": dict(
        fall_per_aar=1.37,       # fall per beboer-år [kilde: tysk langtidsstudie 1367/1000 RY]
        hofte_per_fall=0.021,    # 29 hoftebrudd/1000 RY ÷ 1367 fall [kilde: samme]
        andel_seng=0.35,         # fall knyttet til å reise seg fra seng (natt/hvile) [antakelse 16–45 %]
        andel_toalett=0.15,      # fall på vei til/på toalett [antakelse]
        skadeandel=0.25,         # andre skader enn hoftebrudd per fall [antakelse 10–30 %]
        nattevakter=4.0,         # per 100 beboere [antakelse 1 per 25]
        gangtid_s=45.0,          # gåtid til rommet [antakelse]
        demens=0.80,             # [kilde: ~80 % av sykehjemsbeboere]
        smerte=0.44,             # klinisk signifikant smerte [kilde: COSMOS, Husebø]
        uoppdaget=0.50,          # andel smerte som ikke er oppdaget/behandlet i dag [antakelse]
        samtykke=0.25,           # andel med samtykkekompetanse for kamera [antakelse]
        trykksaar=0.25,          # nye trykksår per beboer-år [antakelse; prevalens 6–22 % kilde Oslo]
        snurisiko=0.25,          # andel som trenger snuing om natten [antakelse]
        tilsyn_min=1.5,          # minutter per fysisk tilsyn [antakelse]
        runder={"fast_2t": 4.0, "fast_3t": 3.0, "behovsstyrt": 0.6},   # fysiske tilsyn per natt
        liggetid_h_uten=1.0,     # snittid på gulvet ved uoppdaget nattfall, fast 2 t-runde [modell: halve intervallet]
        vasketork_brukere=0.10,  # [kilde: København 2018, 10 % av beboere]
        toalettbesok_dag=3.0,
        kost_hofte_kommune=60e3, kost_hofte_sykehus=200e3,     # [antakelse, forankret Hektoen 2017]
    ),
    "hjemme": dict(
        fall_per_aar=0.80, hofte_per_fall=0.020, andel_seng=0.30, andel_toalett=0.15, skadeandel=0.25,
        nattevakter=1.0, gangtid_s=1200.0,   # mobil nattpatrulje, 20 min kjøring [antakelse]
        demens=0.50, smerte=0.40, uoppdaget=0.55, samtykke=0.50, trykksaar=0.10, snurisiko=0.05,
        tilsyn_min=20.0,                     # nattlig hjemmebesøk inkl. reise [antakelse]
        runder={"fast_2t": 2.0, "fast_3t": 1.0, "behovsstyrt": 0.15},
        liggetid_h_uten=4.0,                 # til neste besøk/morgen [antakelse]
        vasketork_brukere=0.25, toalettbesok_dag=1.5,
        kost_hofte_kommune=250e3, kost_hofte_sykehus=250e3,   # hjemmeboende: mye mer pleie etterpå [kilde: Hektoen 2017 ≈ 68 kEUR totalt]
    ),
}[SETTING]

N = 100
NETTER = 365
TIMEKOST = 550.0          # NOK/time pleier inkl. sosiale kostnader og natt-tillegg [antakelse]
LAMBDA = 275e3            # NOK per QALY, laveste alvorlighetsgrad [kilde: Meld. St. 34 (2015–2016)]
ANNUITET = 0.2246         # 5 år, 4 % kalkulasjonsrente [kilde: Finansdepartementet R-109; beregnet]
ANSATTE = 130             # personer (hode) per 100 sykehjemsbeboere som skal læres opp [antakelse]
BUDSJETT_PER_BEBOER = 13000.0   # NOK/år netto for kommunen, ≈ 1 % av kost per plass [antakelse, brief]
OMDISPONERING = 0.75      # andel frigjort nattetid som kan flyttes til kveld/dag via turnus [antakelse]

# Sensorer: d' sitte-opp, d' uro/tidlig, gulvfall-deteksjon, forsinkelse gulv (min), kost, lisens/år
#   matte = «Stille vakt» SV-1: trykk/BCG-strimmel under madrass (Nemuri SCAN-prinsipp) + kantmodul på
#           sengerammen med batteri, radio og rav gulvlys · radar = 60 GHz på vegg (Vitalthings-type)
#   kombi = SV-1R: som matte, men med 60 GHz radar i kantmodulen mot sengekant/gulv, fusjonert
#   kamera_samtykke = 3D/anonymisert kamera, KUN for beboere som selv samtykker
SENSOR = {
    #                 d_sitt d_uro  gulv  gulv_min capex   lisens  personvern
    "ingen":          (0.0,  0.0,   0.0,  0,      0,      0,      1.00),
    "armband":        (0.0,  0.0,   0.45, 2,      3000,   600,    0.90),   # mange med demens tar det av [antakelse]
    "matte":          (2.2,  1.6,   0.80, 10,     7000,   1200,   0.95),   # gulvfall = «ikke tilbake i seng» etter 10 min
    "radar":          (2.0,  1.4,   0.90, 1,      11000,  1800,   0.85),
    "kombi":          (2.97, 2.1,   0.90, 1,      9000,   1800,   0.85),   # √(2.2²+2.0²) [SDT-fusjon]
    "kamera_samtykke": (3.2, 1.8,   0.95, 1,      15000,  2400,   0.50),
}
HENDELSER_NATT = 6.0      # bevegelser per natt som kan ligne sitte-opp (snu seg, drikke) [antakelse]

ROM = {
    # Teknologi
    "sensor":          Valg(list(SENSOR)),
    "dekning":         Tall(0.2, 1.0),       # andel beboere med sensor, de med høyest fallrisiko først
    "terskel":         Tall(-1.0, 2.5),      # beslutningskriterium c (høyere = færre alarmer)
    "data":            Valg(["hendelser_lokalt", "dognaggregat", "radata_sky"]),
    # SV-1-enheten (gjelder radar/kombi; lys gjelder alle sensorer)
    "maaleintervall_s": Tall(0.1, 3.0),
    "batterier":       Heltall(1, 4),        # 18650-celler à 12,2 Wh
    "strom":           Valg(["batteri", "nett"]),
    "lys_lux":         Tall(0.0, 25.0),      # gulvbelysning (rav, ≤ 2200 K) når beboer setter seg opp
    # Arbeidsmåte
    "nattrunde":       Valg(["fast_2t", "fast_3t", "behovsstyrt"]),
    "smerte":          Valg(["ingen", "mobid2_fast", "mobid2_sensorutlost"]),
    "arbeidsmaate":    Valg(["vanlig", "mimamori_team"]),
    "kontaktandel":    Tall(0.0, 1.0),       # andel av frigjort tid som går til 1:1-kontakt
    # Hjelpemidler
    "hoftebeskytter":  Valg([False, True]),
    "lav_seng_matte":  Valg([False, True]),
    "toalett":         Valg(["ingen", "vasketork_utvalgte", "vasketork_alle", "dfree", "vasketork_utvalgte_dfree"]),
    "drikke":          Valg(["ingen", "smartkopp", "drikkerunde"]),
    "selskap":         Valg(["ingen", "paro", "lovot", "kosedyr"]),
    "forflytning":     Valg(["takheis", "resyone", "hug"]),
    "hal":             Valg([False, True]),
}

FOKUS = {
    "livskvalitet_per_krone": {"kostnadseffekt": 0.35, "livskvalitet": 0.25, "pleietid": 0.15,
                               "verdighet": 0.15, "gjennomforbarhet": 0.10},
    "frigjor_tid":            {"pleietid": 0.35, "kostnadseffekt": 0.20, "livskvalitet": 0.20,
                               "verdighet": 0.15, "gjennomforbarhet": 0.10},
    "maks_livskvalitet":      {"livskvalitet": 0.50, "verdighet": 0.20, "kostnadseffekt": 0.15,
                               "gjennomforbarhet": 0.15},
}

NOKKEL = ["sensor", "nattrunde", "smerte", "toalett", "selskap", "arbeidsmaate"]

# Beste lovlige eksisterende løsning i Norge: radar-basert digitalt tilsyn (Vitalthings Guardian-type) med
# behovsstyrt nattrunde, men uten endret arbeidsmåte, og frigjort tid tatt ut som kostnadskutt [kilde: 02_marked.md]
REFERANSE = {
    "_navn": "Radar-basert digitalt nattilsyn (Vitalthings-type), uten endret arbeidsmåte",
    "sensor": "radar", "dekning": 1.0, "terskel": 2.0, "data": "dognaggregat",
    "maaleintervall_s": 1.0, "batterier": 1, "strom": "nett", "lys_lux": 0.0,
    "nattrunde": "behovsstyrt", "smerte": "ingen", "arbeidsmaate": "vanlig", "kontaktandel": 0.0,
    "hoftebeskytter": False, "lav_seng_matte": False, "toalett": "ingen", "drikke": "ingen",
    "selskap": "ingen", "forflytning": "takheis", "hal": False,
}

# «Dagens praksis» – grunnlinjen alle QALY og tidsgevinster måles mot
DAGENS = dict(REFERANSE, sensor="ingen", nattrunde="fast_2t", data="hendelser_lokalt")


def rydd(d):
    if SETTING == "hjemme":
        d["forflytning"] = "takheis"   # Resyone/Hug er laget for institusjon; ikke modellert hjemme
        d["hal"] = False
    if d["sensor"] == "ingen":
        if d["nattrunde"] == "behovsstyrt":
            d["nattrunde"] = "fast_3t"
        if d["smerte"] == "mobid2_sensorutlost":
            d["smerte"] = "mobid2_fast"
        d["data"] = "hendelser_lokalt"
        d["lys_lux"] = 0.0
    if d["sensor"] == "armband":
        d["lys_lux"] = 0.0          # armbåndet ser ikke at beboeren setter seg opp
        if d["nattrunde"] == "behovsstyrt":
            d["nattrunde"] = "fast_3t"   # behovsstyrt tilsyn krever passiv sensor som vet om beboeren er i seng
                                         # (armbånd tas av, særlig ved demens) [antakelse, sikkerhetsregel]
        if d["smerte"] == "mobid2_sensorutlost":
            d["smerte"] = "mobid2_fast"
    if d["data"] == "hendelser_lokalt" and d["smerte"] == "mobid2_sensorutlost":
        d["smerte"] = "mobid2_fast"  # trend i nattlig uro krever døgnaggregat
    return d


def phi(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))


def sigmoid(x):
    return 1 / (1 + math.exp(-max(-50.0, min(50.0, x))))


def p_raskere(median_r, sigma_r, median_l, sigma_l):
    """P(R < L) for uavhengige lognormale R og L."""
    return phi((math.log(median_l) - math.log(median_r)) / math.sqrt(sigma_r ** 2 + sigma_l ** 2))


def enhet_sv1(d):
    """SV-1 kantmodul (batteri, rav gulvlys, radio, madrass-strimmel; radar bare i «kombi»):
    energibudsjett [fysikk + datablad-antakelser]. Returnerer (dager per lading, forsinkelse s)."""
    e_ramme = 0.20 * 0.030                    # J per radar-ramme: 200 mW i 30 ms [antakelse, 60 GHz FMCW-brikke]
    p_radar = e_ramme / d["maaleintervall_s"] if d["sensor"] == "kombi" else 0.0   # W
    p_hvile = 0.0015 + 0.0006 + 0.0030        # MCU-søvn + Thread/BLE-radio + strimmel-forsterker/ADC [antakelse]
    # LED: E [lux] · A [m²] / (lyseffekt 60 lm/W · optisk virkningsgrad 0,5), på ~10 min per natt
    p_led = d["lys_lux"] * 0.5 / (60 * 0.5)
    wh_dag = (p_radar + p_hvile) * 24 + p_led * 10 / 60
    dager = d["batterier"] * 12.2 * 0.8 / wh_dag if d["strom"] == "batteri" else 9999
    if d["sensor"] == "kombi":
        forsinkelse = d["maaleintervall_s"] / 2 + 0.8   # halv rammeperiode + prosessering/radio [antakelse]
    else:
        forsinkelse = 1.5                                # strimmel samples 50 Hz, 1 s vindu + radio [antakelse]
    return dager, forsinkelse


def simuler(d):
    """Alle nøkkeltall for ett år, 100 beboere. Ingen poeng her – bare fysiske/økonomiske størrelser."""
    s = S
    sens = SENSOR[d["sensor"]]
    d_sitt, d_uro, p_gulv, gulv_min, capex_s, lisens_s, _ = sens
    har_sensor = d["sensor"] != "ingen"
    dek = d["dekning"] if har_sensor else 0.0
    if d["sensor"] == "kamera_samtykke":
        dek = min(dek, s["samtykke"])           # hardt krav: ingen kamera uten samtykke
    # Fallrisiko er skjev: de første 40 % dekker ≈ 67 % av fallene [antakelse, Pareto]
    fangst = 1 - (1 - dek) ** 2.2
    sv1 = d["sensor"] in ("matte", "kombi")             # SV-1 kantmodul hører til madrass-strimmelen
    dager_lading, forsinkelse = enhet_sv1(d) if sv1 else (9999, 1.5)
    if d["sensor"] == "radar":
        forsinkelse = d["maaleintervall_s"] / 2 + 0.8

    # --- Alarmer (signaldeteksjon) ---
    c = d["terskel"]
    treff_sitt = phi(d_sitt - c) if d_sitt else 0.0
    treff_uro = phi(d_uro - c) if d_uro else 0.0
    falske_per_natt = HENDELSER_NATT * phi(-c) * (d_sitt > 0)          # per dekket beboer
    n_dekket = N * dek
    seng_fall = N * s["fall_per_aar"] * s["andel_seng"]
    sanne_alarmer = seng_fall * fangst * 3.0 * treff_sitt               # ≈ 3 utganger per fall [antakelse]
    falske_alarmer = n_dekket * NETTER * falske_per_natt
    alarmer_natt = (sanne_alarmer + falske_alarmer) / NETTER
    per_vakt = alarmer_natt / s["nattevakter"]

    # --- Responstid (M/M/1-ventetid + alarmtretthet) ---
    service_min = 4.0
    rho = min(0.95, 0.30 + per_vakt * service_min / 600)                # 30 % opptatt med annet [antakelse]
    vent_s = rho / (1 - rho) * 60.0                                     # snitt ventetid før pleier er ledig
    median_r = forsinkelse + s["gangtid_s"] + vent_s
    falsk_andel_vakt = falske_alarmer / NETTER / s["nattevakter"]
    p_respons = 1 / (1 + falsk_andel_vakt / 15.0)                       # tretthet: 15 falske/vakt/natt halverer [antakelse]
    p_tid_sitt = p_raskere(median_r, 0.6, 30.0, 0.7)                    # sitte → stå median 30 s [antakelse]
    p_tid_uro = p_raskere(median_r, 0.6, 180.0, 0.7)                    # uro → stå median 3 min [antakelse]
    andel_tidlig = 0.4                                                  # utganger med uro i forkant [antakelse]
    p_forhindre = p_respons * 0.7 * (andel_tidlig * max(treff_uro * p_tid_uro, treff_sitt * p_tid_sitt)
                                     + (1 - andel_tidlig) * treff_sitt * p_tid_sitt)   # 0,7: pleier til stede hindrer ikke alt
    p_forhindre /= P

    # --- Fall ---
    lys_rr = 1 - 0.20 / P * (1 - math.exp(-d["lys_lux"] / 3.0)) * (har_sensor and d["sensor"] != "armband")
    kabel_rr = 1.03 if (sv1 and d["strom"] == "nett") else 1.0         # kabel ved sengekant = snublefare [antakelse]
    mimamori_rr = 1 - 0.10 / P if d["arbeidsmaate"] == "mimamori_team" else 1.0   # ukentlig individuell fallplan [antakelse]
    seng_ny = seng_fall * (1 - fangst * p_forhindre) * (1 - fangst * (1 - lys_rr)) * kabel_rr * mimamori_rr
    toal_fall = N * s["fall_per_aar"] * s["andel_toalett"]
    toal_rr = 1.0
    if d["toalett"].startswith("vasketork"):
        toal_rr -= 0.15 / P * (1.0 if d["toalett"] == "vasketork_alle" else 0.6)   # mindre stå/vri [antakelse]
    if "dfree" in d["toalett"]:
        toal_rr -= 0.05 / P                                                         # [antakelse, svak evidens]
    if d["nattrunde"] == "behovsstyrt":
        toal_rr -= 0.10 / P * fangst * treff_uro                                    # hjelp til toalett ved uro [antakelse]
    toal_ny = toal_fall * toal_rr * mimamori_rr
    andre_ny = N * s["fall_per_aar"] * (1 - s["andel_seng"] - s["andel_toalett"]) * mimamori_rr
    fall_ny = seng_ny + toal_ny + andre_ny
    fall_0 = N * s["fall_per_aar"]

    hp_rr = (1 - 0.18 / P) if d["hoftebeskytter"] else 1.0             # RR 0,82 [kilde: Cochrane 2014]
    lav_rr = (1 - 0.25 / P) if d["lav_seng_matte"] else 1.0            # skade ved sengefall [antakelse]
    hofte_0 = fall_0 * s["hofte_per_fall"]
    hofte_ny = (fall_ny - seng_ny * (1 - lav_rr)) * s["hofte_per_fall"] * hp_rr
    skade_0 = fall_0 * s["skadeandel"]
    skade_ny = (fall_ny - seng_ny * (1 - lav_rr)) * s["skadeandel"]

    # Lang liggetid ved uoppdaget nattfall
    def liggetid(runde, gulv, gulv_m):
        intervall_h = {"fast_2t": 2.0, "fast_3t": 3.0, "behovsstyrt": 6.0}[runde]
        uten = s["liggetid_h_uten"] * intervall_h / 2.0
        med = gulv_m / 60 + 0.1
        return fangst * gulv * med + (1 - fangst * gulv) * uten
    lig_0 = liggetid("fast_2t", 0, 0)
    lig_ny = liggetid(d["nattrunde"], p_gulv if har_sensor else 0, gulv_min)

    # --- Pleietid (timer per år) ---
    r = s["runder"]
    runder_ny = r[d["nattrunde"]]
    if d["nattrunde"] == "behovsstyrt":
        # Behovsstyrt gjelder dekkede beboere (lineært i antall, ikke fangst); udekkede får 3 t-runde
        runder_ny = dek * r["behovsstyrt"] + (1 - dek) * r["fast_3t"]
    # Nattetid kan bare delvis flyttes til kveld/dag (minimumsbemanning om natten) [antakelse]
    t_runder = N * NETTER * (r["fast_2t"] - runder_ny) * s["tilsyn_min"] / 60 * OMDISPONERING
    # Snuing: 2t → 3 snu/natt; 3t → 2; behovsstyrt (sensor ser egen bevegelse) → 1,3 [kilde: TURN 2013]
    snu = {"fast_2t": 3.0, "fast_3t": 2.0, "behovsstyrt": 2.0 - 0.7 * (dek if d["sensor"] in ("matte", "kombi", "radar") else 0)}
    t_snu = N * s["snurisiko"] * NETTER * (3.0 - snu[d["nattrunde"]]) * 6 / 60 * OMDISPONERING
    t_fall = (fall_0 - fall_ny) * 1.5                                  # 1,5 t per fall (vurdering, løft, dokumentasjon) [antakelse]
    vt_brukere = {"ingen": 0, "vasketork_utvalgte": s["vasketork_brukere"], "vasketork_alle": s["vasketork_brukere"] * 1.3,
                  "dfree": 0, "vasketork_utvalgte_dfree": s["vasketork_brukere"]}[d["toalett"]] * N
    t_toalett = vt_brukere * s["toalettbesok_dag"] * 4 / 60 * 365      # 4 min spart per besøk [antakelse]
    if SETTING == "hjemme":
        t_toalett = vt_brukere * 0.5 * 25 / 60 * 365                    # ½ besøk/dag spart à 25 min [antakelse]
    df_brukere = N * 0.20 if "dfree" in d["toalett"] else 0
    t_toalett += df_brukere * (1.0 - 1.5) * 365 / 60                    # spart bleieskift 1 min, plassering 1,5 min/dag [antakelse]
    t_forfl = {"takheis": 0, "resyone": N * 0.08 * 2 * 5, "hug": N * 0.10 * 3 * 3}[d["forflytning"]] * 365 / 60
    t_alarm = -(sanne_alarmer + falske_alarmer) * service_min / 60
    n_demens = N * s["demens"]
    t_smerte = -{"ingen": 0, "mobid2_fast": n_demens * 12 * 10, "mobid2_sensorutlost": n_demens * 4 * 10 + n_dekket * 2.0 * 10}[d["smerte"]] / 60
    hp_brukere = N * 0.4 if d["hoftebeskytter"] else 0
    t_hp = -hp_brukere * 1.0 * 365 / 60
    t_lading = -(n_dekket * 365 / dager_lading * 10 / 60) if sv1 and d["strom"] == "batteri" else 0
    t_team = -(N / 25) * 2.5 * 52 if d["arbeidsmaate"] == "mimamori_team" else 0   # 30 min × 5 personer per uke per 25 [antakelse]
    t_drikke = -N * 0.3 * 4 * 3 * 365 / 60 if d["drikke"] == "drikkerunde" else (-N * 0.3 * 0.5 * 365 / 60 if d["drikke"] == "smartkopp" else 0)
    t_hal = -(3 * 250 * 10 / 60) if d["hal"] else 0                     # 10 min på/av, 250 dager, 3 drakter
    t_selskap = {"ingen": 0, "paro": -N * 0.1 * 52 * 0.25, "lovot": -N * 0.1 * 52 * 0.25 - 30, "kosedyr": -N * 0.1 * 52 * 0.1}[d["selskap"]]
    tid_pluss = t_runder + t_snu + t_fall + t_toalett + t_forfl
    tid_minus = t_alarm + t_smerte + t_hp + t_lading + t_team + t_drikke + t_hal + t_selskap
    netto_tid = tid_pluss / P + tid_minus * P
    kontakt_min = max(0.0, netto_tid) * d["kontaktandel"] * 60 / (N * 365)

    # --- QALY (gevinst mot dagens praksis) ---
    q = {}
    q["fall"] = ((hofte_0 - hofte_ny) * 0.25 + (skade_0 - skade_ny) * 0.02 + (fall_0 - fall_ny) * 0.003)  # [antakelse]
    natt_fall_0 = seng_fall
    q["liggetid"] = natt_fall_0 * 0.004 * (lig_0 - lig_ny) * (1 + (SETTING == "hjemme"))           # [antakelse]
    smertefulle = n_demens * s["smerte"] * s["uoppdaget"]
    funn = {"ingen": 0.0, "mobid2_fast": 0.55, "mobid2_sensorutlost": 0.45 + 0.55 * (0.6 if d["data"] == "radata_sky" else 0.5) * fangst * treff_uro}[d["smerte"]]
    if d["arbeidsmaate"] == "mimamori_team" and d["smerte"] != "ingen":
        funn = min(0.95, funn + 0.10)
    nye_behandlet = smertefulle * funn / P
    q["smerte"] = nye_behandlet * 0.08                                 # [antakelse, forankret Husebø 2011]
    vekk_0 = r["fast_2t"] * 0.25
    vekk_ny = runder_ny * 0.25 + alarmer_natt / N * 0.5 + 0.1 * max(0, d["lys_lux"] - 10) / 15 * dek
    q["sovn"] = N * 0.015 / P * (vekk_0 - vekk_ny) / vekk_0               # nytte av uforstyrret søvn [antakelse, usikker]
    ts_rr = 1.0
    if d["nattrunde"] == "behovsstyrt" and d["sensor"] in ("matte", "kombi", "radar", "kamera_samtykke"):
        ts_rr = 1 - 0.10 / P * dek                                       # sensor finner de som ligger helt stille [antakelse]
    elif d["nattrunde"] == "behovsstyrt":
        ts_rr = 1.05
    ts_unngaatt = N * s["trykksaar"] * (1 - ts_rr)
    q["trykksaar"] = ts_unngaatt * 0.03
    kontakt_eff = 1.3 if d["arbeidsmaate"] == "mimamori_team" else 1.0   # livshistorie + kontaktplan [antakelse]
    q["kontakt"] = N * 0.04 / P * kontakt_eff * (1 - math.exp(-kontakt_min / 15.0))   # [antakelse, forankret WHELD]
    selskap_q = {"ingen": 0, "paro": 0.012, "lovot": 0.012, "kosedyr": 0.010}[d["selskap"]]
    q["selskap"] = n_demens * 0.4 * selskap_q / P * (1 - 0.5 * min(1.0, kontakt_min / 15))   # [kilde: Moyle 2017 ≈ likt kosedyr]
    q["toalett"] = (vt_brukere * 0.03 + df_brukere * 0.005) / P         # verdighet, selvhjulpenhet [antakelse]
    drikke_eff = {"ingen": 0, "smartkopp": 0.4, "drikkerunde": 0.6}[d["drikke"]] + 0.3 * min(1.0, kontakt_min / 15)
    q["drikke"] = N * 0.3 * 0.015 * min(1.0, drikke_eff) / P            # [antakelse]
    q["forflytning"] = {"takheis": 0, "resyone": N * 0.08 * 0.03, "hug": N * 0.10 * 0.01}[d["forflytning"]] / P
    qaly = sum(q.values())

    # --- Kostnad (NOK/år) ---
    k = {}
    ekstra_capex = 0.0
    if sv1:
        ekstra_capex += 60 * d["batterier"] if d["strom"] == "batteri" else 1500   # celler / elektriker + kabelkanal
    k["sensor"] = n_dekket * ((capex_s + ekstra_capex) * ANNUITET + lisens_s)
    k["infrastruktur"] = (150e3 * ANNUITET + 40e3) if har_sensor else 0
    opplaering_t = (6 * har_sensor + 4 * (d["nattrunde"] == "behovsstyrt") + 3 * (d["smerte"] != "ingen")
                    + 8 * (d["arbeidsmaate"] == "mimamori_team"))
    k["opplaering"] = ANSATTE * opplaering_t * 450 / 5
    k["hoftebeskytter"] = hp_brukere * 1800
    k["lav_seng"] = N * 0.4 * 15000 * ANNUITET if d["lav_seng_matte"] else 0
    vt_enheter = N if d["toalett"] == "vasketork_alle" else round(vt_brukere * 1.2)   # 20 % ekstra for utskifting av beboere
    k["toalett"] = vt_enheter * 25000 * ANNUITET + df_brukere * 6000      # 25 000 kr montert [antakelse]
    k["selskap"] = {"ingen": 0, "paro": 5 * (65000 * ANNUITET + 3000), "lovot": 5 * (45000 * ANNUITET + 12000),
                    "kosedyr": 30 * 400}[d["selskap"]]
    k["drikke"] = N * 0.3 * (2500 * ANNUITET + 500) if d["drikke"] == "smartkopp" else 0
    k["forflytning"] = {"takheis": 0, "resyone": 8 * 90000 * ANNUITET, "hug": 5 * 100000 * ANNUITET}[d["forflytning"]]
    k["hal"] = 3 * 84000 if d["hal"] else 0
    k["smertebehandling"] = nye_behandlet * 3000
    k = {n: v * P for n, v in k.items()}
    brutto = sum(k.values())

    spart_kommune = ((hofte_0 - hofte_ny) * s["kost_hofte_kommune"] + (skade_0 - skade_ny) * 8000
                     + ts_unngaatt * 15000)
    spart_sykehus = (hofte_0 - hofte_ny) * s["kost_hofte_sykehus"] + (skade_0 - skade_ny) * 15000
    if netto_tid >= 0:
        tid_kr = -netto_tid * (1 - d["kontaktandel"]) * TIMEKOST * 0.7    # 70 % gevinstrealisering [antakelse]
    else:
        tid_kr = -netto_tid * TIMEKOST                                     # må leie inn
    netto_kommune = brutto - spart_kommune + tid_kr
    netto_samfunn = netto_kommune - spart_sykehus
    return dict(
        qaly=qaly, q=q, kost=k, brutto=brutto, netto_kommune=netto_kommune, netto_samfunn=netto_samfunn,
        netto_tid=netto_tid, kontakt_min=kontakt_min, fall_ny=fall_ny, fall_0=fall_0,
        hofte_ny=hofte_ny, hofte_0=hofte_0, falske_per_natt=falske_per_natt, treff_sitt=treff_sitt,
        p_forhindre=p_forhindre, median_r=median_r, dager_lading=dager_lading, alarmer_natt=alarmer_natt,
        lig_ny=lig_ny, dek=dek, runder_ny=runder_ny, nye_behandlet=nye_behandlet, ts_unngaatt=ts_unngaatt,
    )


def score(d):
    r = simuler(d)
    q, kn, ks = r["qaly"], r["netto_kommune"], r["netto_samfunn"]
    livskvalitet = 1 - math.exp(-max(0.0, q) / 4.0)
    if q <= 0.05:
        kostnadseffekt = 0.0
        icer = float("inf")
    else:
        icer = ks / q
        kostnadseffekt = 1.0 if ks <= 0 else 1 / (1 + icer / LAMBDA)
    per_beboer_tid = r["netto_tid"] / N
    pleietid = 0.5 * sigmoid((per_beboer_tid - 10) / 6) + 0.5 * min(1.0, r["kontakt_min"] / 15)

    # Verdighet og personvern
    pv = SENSOR[d["sensor"]][6]
    pv *= {"hendelser_lokalt": 1.0, "dognaggregat": 0.97, "radata_sky": 0.75}[d["data"]]
    if d["sensor"] == "kamera_samtykke":
        pv = min(pv, 0.5)
    inntrenging = r["runder_ny"] / S["runder"]["fast_2t"]               # lommelykt-runder som vekker
    verd = (0.55 + 0.15 * (1 - inntrenging) + 0.12 * (d["toalett"].startswith("vasketork"))
            + 0.08 * min(1.0, r["kontakt_min"] / 15) + 0.05 * (d["smerte"] != "ingen")
            + 0.05 * (d["forflytning"] == "resyone") - 0.03 * d["hoftebeskytter"])
    verdighet = pv * min(1.0, verd)

    # Gjennomførbarhet
    g = 1.0
    g *= sigmoid((0.14 - r["falske_per_natt"]) / 0.05)    # K7: ≤ 1 falsk alarm per beboer per uke
    if d["sensor"] in ("matte", "kombi") and d["strom"] == "batteri":
        g *= sigmoid((r["dager_lading"] - 30) / 6)          # K9: ≥ 30 dager mellom lading
    g *= {"takheis": 1.0, "resyone": 0.9, "hug": 0.9}[d["forflytning"]]
    g *= 0.6 if d["hal"] else 1.0
    g *= {"ingen": 1, "paro": 0.95, "lovot": 0.85, "kosedyr": 1.0}[d["selskap"]]
    g *= 0.8 if "dfree" in d["toalett"] else 1.0
    g *= 0.9 if d["data"] == "radata_sky" else 1.0         # DPIA, databehandleravtale, overføring
    g *= 0.95 if d["arbeidsmaate"] == "mimamori_team" else 1.0
    gjennomforbarhet = g

    budsjett = sigmoid((BUDSJETT_PER_BEBOER - kn / N) / 1500)   # K4 hardt krav
    ut = {
        "livskvalitet": livskvalitet * budsjett,
        "kostnadseffekt": kostnadseffekt * budsjett,
        "pleietid": pleietid * budsjett,
        "verdighet": verdighet * budsjett,
        "gjennomforbarhet": gjennomforbarhet * budsjett,
        "_qaly_per_100": round(q, 2),
        "_icer_kr_per_qaly": round(icer) if icer != float("inf") else -1,
        "_netto_kommune_kr_per_beboer": round(kn / N),
        "_netto_samfunn_kr_per_beboer": round(ks / N),
        "_fall_per_1000_dogn": round(r["fall_ny"] / (N * 365) * 1000, 2),
        "_hoftebrudd_per_100": round(r["hofte_ny"], 2),
        "_frigjort_t_per_beboer": round(per_beboer_tid, 1),
        "_kontakt_min_dogn": round(r["kontakt_min"], 1),
        "_falske_alarmer_beboer_natt": round(r["falske_per_natt"], 3),
        "_respons_median_s": round(r["median_r"]),
        "_p_forhindre_sengefall": round(r["p_forhindre"], 3),
        "_lading_dager": round(r["dager_lading"]) if r["dager_lading"] < 9999 else -1,
    }
    return ut
