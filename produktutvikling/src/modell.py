"""Økonomisk modell for VÅR-porteføljen (5 produkter).

Alle BOM-priser er i USD ved 10k-volum (Shenzhen/Dongguan-leverandører, FOB).
Skaleringsfaktorer for 1k og 50k er bransjetypiske antakelser, se ANTAKELSER.
Skriver modell.json som brukes av dokumentbyggeren og grafene.
"""
import json
import math
import os

USD_NOK = 10.5
EUR_NOK = 11.5
MVA = 0.25

ANTAKELSER = {
    "valuta": f"1 USD = {USD_NOK} NOK, 1 EUR = {EUR_NOK} NOK (planleggingskurs)",
    "bom_faktor": {"1k": 1.38, "10k": 1.00, "50k": 0.86},
    "kassasjon": 0.03,
    "cm_paslag": 0.20,
    "qc_sert_per_enhet_usd": 0.40,
    "d2c_betalingsgebyr": 0.025,
    "garantiavsetning": 0.03,
    "grossist_divisor": 2.0,
    "kanalmiks": {"år1": [0.70, 0.30], "år2": [0.60, 0.40], "år3": [0.55, 0.45]},
    "markedsforing_år2_3_andel": 0.18,
}

P = [
    {
        "id": "glod", "navn": "GLØD", "undertittel": "Termo-peristaltisk stimulator",
        "pris": 2990, "segment": "Premium", "logistikk": 0.08,
        "fulfil": 55, "b2b_frakt": 15,
        "montasje": {"1k": 5.20, "10k": 3.40, "50k": 2.70},
        "bom": [
            ("Ytterhud, medisinsk LSR Shore 10A, 42 g", 1.70),
            ("Gelpute 8 ml + 0,8 mm membran (LSR)", 0.65),
            ("Indre chassis PC/ABS, topp + bunn", 0.95),
            ("Girmotor N20 1:150, 3 V", 1.45),
            ("Rullevogn, kamskinne, 2 ruller (POM) + 2 minilager", 0.85),
            ("Polyimid varmefolie 3 W, 60 x 30 mm", 0.95),
            ("2x NTC 10k + bimetall termosikring 45 °C", 0.40),
            ("LRA pulsaktuator 0815", 0.75),
            ("Li-ion polymer 3,7 V 2000 mAh m/ PCM", 3.10),
            ("PCBA: Cortex-M0+, lader 1 A, H-bro, varmedriver, fuel gauge", 3.40),
            ("Magnetisk 2-pins ladekontakt + USB-C-kabel", 1.10),
            ("Knappemembran, lysleder, 2 LED", 0.45),
            ("O-ringer, skruer, lim, smådeler", 0.40),
            ("Emballasje: FSC-eske, bomullspose, manual, materialpass", 2.60),
        ],
        "verktoy_usd": 63000, "sert_usd": 35000, "utvikling_nok": 1_100_000,
        "ip_nok": 250_000, "lansering_nok": 1_200_000,
        "scenario": {"Konservativ": [1500, 3500, 6000], "Sannsynlig": [3000, 8000, 15000],
                     "Aggressiv": [6000, 18000, 35000]},
        "uker_prototype": 16, "mnd_lansering": 15,
    },
    {
        "id": "avtrykk", "navn": "AVTRYKK", "undertittel": "Selvformende stimulator med formlås",
        "pris": 2690, "segment": "Premium", "logistikk": 0.08,
        "fulfil": 55, "b2b_frakt": 15,
        "montasje": {"1k": 6.50, "10k": 4.30, "50k": 3.40},
        "bom": [
            ("Ytterhud, medisinsk LSR Shore 5A, 55 g", 2.10),
            ("Jamming-blære, LSR 0,6 mm vegg", 0.90),
            ("PP-mikroperler 1,5 mm, 18 g (granulat)", 0.12),
            ("Partikkelfilter / nett, rustfritt 100 µm", 0.15),
            ("Mikro membran-vakuumpumpe 3 V (-70 kPa)", 2.40),
            ("Magnetventil 3 V + tilbakeslagsventil", 1.60),
            ("MEMS trykksensor (absolutt)", 0.85),
            ("4 haptiske noder (LRA) på flex-PCB-ryggrad", 3.20),
            ("4-sone kapasitiv kontaktsensor (i flex)", 0.30),
            ("Stivt håndtak/chassis PC", 0.90),
            ("Li-ion polymer 3,7 V 1500 mAh m/ PCM", 2.60),
            ("PCBA: MCU, lader, 4-kan. driver, pumpedriver", 3.60),
            ("Magnetisk ladekontakt + kabel", 1.10),
            ("Knapper, LED, smådeler", 0.60),
            ("Emballasje: FSC-eske, pose, manual, materialpass", 2.60),
        ],
        "verktoy_usd": 72000, "sert_usd": 30000, "utvikling_nok": 1_500_000,
        "ip_nok": 300_000, "lansering_nok": 1_000_000,
        "scenario": {"Konservativ": [1000, 3000, 5000], "Sannsynlig": [2500, 7000, 13000],
                     "Aggressiv": [5000, 15000, 30000]},
        "uker_prototype": 20, "mnd_lansering": 18,
    },
    {
        "id": "samklang", "navn": "SAMKLANG", "undertittel": "Bærbar parpute med mikro-sugefeste",
        "pris": 1890, "segment": "Mellom/premium", "logistikk": 0.07,
        "fulfil": 55, "b2b_frakt": 15,
        "montasje": {"1k": 5.80, "10k": 3.60, "50k": 2.90},
        "bom": [
            ("Putehud LSR m/ mikro-sugekopptekstur, 24 g", 1.60),
            ("Indre fleksramme TPU (overstøpt)", 0.55),
            ("2x flate LRA 10 mm", 1.30),
            ("Trykksensor-array, 4 soner (kapasitiv)", 1.20),
            ("IMU 6-akse", 0.70),
            ("Rigid-flex PCBA m/ BLE-SoC (nRF52805-klasse)", 4.20),
            ("Kurvet LiPo 3,7 V 180 mAh", 1.50),
            ("Magnetiske pogo-pinner (lading)", 0.80),
            ("Fjernkontroll: skall, BLE-PCBA, 100 mAh, knapper", 3.40),
            ("Felles magnetisk ladedokk + kabel", 1.80),
            ("Emballasje + reiseetui", 2.90),
        ],
        "verktoy_usd": 62000, "sert_usd": 38000, "utvikling_nok": 1_350_000,
        "ip_nok": 280_000, "lansering_nok": 900_000,
        "scenario": {"Konservativ": [1200, 3000, 5000], "Sannsynlig": [3000, 7500, 14000],
                     "Aggressiv": [6000, 16000, 32000]},
        "uker_prototype": 18, "mnd_lansering": 17,
    },
    {
        "id": "lene", "navn": "LENE", "undertittel": "Grepsfri støttepute med magnetstyrt modul",
        "pris": 1990, "segment": "Mellom", "logistikk": 0.14,
        "fulfil": 120, "b2b_frakt": 40,
        "montasje": {"1k": 7.50, "10k": 5.00, "50k": 4.00},
        "bom": [
            ("Kilepute HR-kaldskum 38x30x18 cm (CertiPUR)", 6.50),
            ("Vaskbart trekk 60 °C + vanntett TPU-innertrekk", 5.20),
            ("Skinne, glider og magnetbærer (ABS + 4x N52)", 2.10),
            ("Puck: LSR-hud 38 g", 1.50),
            ("Puck: chassis PC + magnetring", 0.90),
            ("Puck: lavfrekvent ERM Ø24 + LRA", 1.90),
            ("Puck: luftpute + barometersensor", 0.95),
            ("Puck: Li-ion 1200 mAh m/ PCM", 2.30),
            ("Puck: PCBA m/ BLE", 3.80),
            ("Fjernkontroll «Stein» Ø90, 3 taktile knapper, BLE", 4.20),
            ("Ladeplate + kabel", 1.40),
            ("Emballasje (vakuumpakket skum, stor eske)", 4.80),
        ],
        "verktoy_usd": 58000, "sert_usd": 38000, "utvikling_nok": 850_000,
        "ip_nok": 150_000, "lansering_nok": 600_000,
        "scenario": {"Konservativ": [600, 1500, 2500], "Sannsynlig": [1500, 3500, 6000],
                     "Aggressiv": [3000, 7000, 12000]},
        "uker_prototype": 10, "mnd_lansering": 12,
    },
    {
        "id": "kjerne", "navn": "KJERNE", "undertittel": "Reparerbar kjerne med utskiftbare skall",
        "pris": 990, "segment": "Lav/mellom (startsett)", "logistikk": 0.07,
        "fulfil": 55, "b2b_frakt": 15,
        "montasje": {"1k": 3.80, "10k": 2.40, "50k": 1.90},
        "bom": [
            ("Kjernehus PC-GF + aluminiumshylse", 1.60),
            ("Bajonettlokk m/ dobbel O-ring", 0.55),
            ("Bredbånds voice-coil aktuator 20-250 Hz", 2.80),
            ("Li-ion 14500 800 mAh, beskyttet, utskiftbar", 1.30),
            ("PCBA: MCU, lader, klasse-D driver, 2x Hall (skall-ID)", 2.60),
            ("Magnetiske pogo-pinner, IP67-forseglet", 0.35),
            ("Skall «Kuppel», LSR 48 g + 2 kodemagneter", 1.70),
            ("Knappemembran + LED", 0.40),
            ("Emballasje: resirkulert papp, minimal", 1.60),
        ],
        "verktoy_usd": 79000, "sert_usd": 32000, "utvikling_nok": 950_000,
        "ip_nok": 220_000, "lansering_nok": 1_000_000,
        "scenario": {"Konservativ": [3000, 7000, 12000], "Sannsynlig": [5000, 12000, 22000],
                     "Aggressiv": [12000, 30000, 60000]},
        "uker_prototype": 12, "mnd_lansering": 12,
        "tilbehor": {"skall_pris": 390, "skall_cogs_usd": 3.30, "skall_per_kjerne": 0.6,
                      "batteri_pris": 149, "batteri_cogs_usd": 1.90, "batteri_per_kjerne": 0.15},
    },
]


def cogs_usd(p, vol):
    bom = sum(c for _, c in p["bom"]) * ANTAKELSER["bom_faktor"][vol]
    exw = ((bom + p["montasje"][vol]) * (1 + ANTAKELSER["kassasjon"]) * (1 + ANTAKELSER["cm_paslag"])
           + ANTAKELSER["qc_sert_per_enhet_usd"])
    return bom, exw * (1 + p["logistikk"])


def bidrag(p, cogs_nok):
    netto = p["pris"] / (1 + MVA)
    d2c = netto * (1 - ANTAKELSER["d2c_betalingsgebyr"] - ANTAKELSER["garantiavsetning"]) - p["fulfil"] - cogs_nok
    engros_pris = netto / ANTAKELSER["grossist_divisor"]
    b2b = engros_pris * (1 - ANTAKELSER["garantiavsetning"]) - p["b2b_frakt"] - cogs_nok
    return netto, engros_pris, d2c, b2b


def kjor():
    ut = {"antakelser": ANTAKELSER, "produkter": []}
    for p in P:
        r = dict(p)
        r["bom_sum_10k"] = round(sum(c for _, c in p["bom"]), 2)
        r["cogs"] = {}
        for vol in ("1k", "10k", "50k"):
            bom, landet = cogs_usd(p, vol)
            r["cogs"][vol] = {"bom_usd": round(bom, 2), "landet_usd": round(landet, 2),
                              "landet_nok": round(landet * USD_NOK)}
        c10 = r["cogs"]["10k"]["landet_nok"]
        netto, engros, d2c, b2b = bidrag(p, c10)
        r["netto_pris"] = round(netto)
        r["engros_pris"] = round(engros)
        r["bm_d2c"] = round((netto - c10) / netto * 100, 1)
        r["bm_engros"] = round((engros - c10) / engros * 100, 1)
        r["db_d2c"] = round(d2c)
        r["db_engros"] = round(b2b)
        fast = (p["verktoy_usd"] + p["sert_usd"]) * USD_NOK + p["utvikling_nok"] + p["ip_nok"] + p["lansering_nok"]
        r["fast_kost_nok"] = round(fast)
        mix = ANTAKELSER["kanalmiks"]["år1"]
        # Break-even regnes på blandet bidrag år 1-mix; startvolum bruker 1k-COGS
        c1 = r["cogs"]["1k"]["landet_nok"]
        _, _, d2c1, b2b1 = bidrag(p, c1)
        bl1 = mix[0] * d2c1 + mix[1] * b2b1
        bl10 = mix[0] * d2c + mix[1] * b2b
        ekstra = 0
        if "tilbehor" in p:
            t = p["tilbehor"]
            ekstra = (t["skall_per_kjerne"] * (t["skall_pris"] / 1.25 * 0.92 - t["skall_cogs_usd"] * USD_NOK)
                      + t["batteri_per_kjerne"] * (t["batteri_pris"] / 1.25 * 0.92 - t["batteri_cogs_usd"] * USD_NOK))
        r["tilbehor_bidrag_per_kjerne"] = round(ekstra)
        r["db_blandet_1k"] = round(bl1 + ekstra)
        r["db_blandet_10k"] = round(bl10 + ekstra)
        r["breakeven_1k"] = math.ceil(fast / (bl1 + ekstra))
        r["breakeven_10k"] = math.ceil(fast / (bl10 + ekstra))
        # Scenarier: 3 år
        r["scen"] = {}
        for navn, vols in p["scenario"].items():
            aar = []
            akk = -((p["verktoy_usd"] + p["sert_usd"]) * USD_NOK + p["utvikling_nok"] + p["ip_nok"])
            for i, v in enumerate(vols):
                vk = "1k" if v < 5000 else ("10k" if v < 30000 else "50k")
                cn = r["cogs"][vk]["landet_nok"]
                _, eng, dd, bb = bidrag(p, cn)
                m = ANTAKELSER["kanalmiks"][f"år{i+1}"]
                omsetning = v * (m[0] * netto + m[1] * eng)
                db = v * (m[0] * dd + m[1] * bb)
                if "tilbehor" in p:
                    t = p["tilbehor"]
                    omsetning += v * (t["skall_per_kjerne"] * t["skall_pris"] + t["batteri_per_kjerne"] * t["batteri_pris"]) / 1.25
                    db += v * ekstra
                mf = p["lansering_nok"] if i == 0 else omsetning * ANTAKELSER["markedsforing_år2_3_andel"]
                res = db - mf
                akk += res
                aar.append({"enheter": v, "omsetning": round(omsetning), "db": round(db),
                            "markedsforing": round(mf), "resultat": round(res), "akkumulert": round(akk)})
            r["scen"][navn] = aar
        ut["produkter"].append(r)
    return ut


if __name__ == "__main__":
    d = kjor()
    sti = os.path.join(os.path.dirname(__file__), "modell.json")
    with open(sti, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=1)
    for r in d["produkter"]:
        print(f'{r["navn"]:9} BOM10k ${r["bom_sum_10k"]:6.2f} | COGS NOK 1k {r["cogs"]["1k"]["landet_nok"]:4} '
              f'10k {r["cogs"]["10k"]["landet_nok"]:4} 50k {r["cogs"]["50k"]["landet_nok"]:4} | netto {r["netto_pris"]} '
              f'BM D2C {r["bm_d2c"]}% eng {r["bm_engros"]}% | DB d2c {r["db_d2c"]} b2b {r["db_engros"]} | '
              f'fast {r["fast_kost_nok"]/1e6:.2f}M | BE {r["breakeven_1k"]}/{r["breakeven_10k"]}')
        for s, a in r["scen"].items():
            print("   ", s, [(x["omsetning"] // 1000, x["akkumulert"] // 1000) for x in a])
