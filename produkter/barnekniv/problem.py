"""Spikkekniv for barn (ca. 6–12 år).

Mål: mye vanskeligere å kutte seg, men fortsatt en ekte kniv som spikker godt,
så barnet lærer riktig teknikk og blir trygg i skogen.

Viktig innsikt i modellen: en sløv kniv er IKKE tryggere. Høy eggvinkel krever
mer kraft, eggen sklir av treet og farten går inn i hånd eller lår. De fleste
spikkeskader på barn skjer når kniven sklir, hånden glir fram på eggen eller
spissen treffer. Modellen straffer derfor de tre mekanismene hver for seg.

Poengene er heuristikker fra spikke- og friluftspedagogikk, ikke målinger.
Bytt dem ut med testdata (se SPESIFIKASJON.md, testplan).
"""
import math

from maskin import Heltall, Tall, Valg

NAVN = "barnekniver"

ROM = {
    "blad_lengde_mm":    Heltall(45, 100),
    "blad_hoyde_mm":     Tall(14.0, 26.0),
    "rygg_mm":           Tall(1.8, 3.5),
    "spiss":             Valg(["spiss", "avrundet_r4", "rund_r8", "but"]),
    "eggvinkel_grader":  Tall(16.0, 45.0),     # inkludert vinkel (begge sider)
    "slip":              Valg(["scandi", "flat", "hul", "konveks"]),
    "usleipet_mm":       Tall(0.0, 25.0),      # usleipet sone nærmest skaftet
    "fingervern_mm":     Tall(0.0, 8.0),       # hvor mye vernet stikker ut under skaftet
    "skaft_lengde_mm":   Heltall(75, 125),
    "skaft_tykkelse_mm": Tall(17.0, 30.0),
    "blad_fall_grader":  Tall(-8.0, 15.0),     # bladets vinkel ned i forhold til skaftet
    "tommelrampe":       Valg([False, True]),
    "skaft_materiale":   Valg(["tre", "tpe_gummi", "plast"]),
    "slire":             Valg(["friksjon", "klikk", "klikk_med_knapp"]),
    "signalfarge":       Valg([False, True]),
}

FOKUS = {
    "trygghet":  {"sikkerhet": 0.55, "spikkeevne": 0.25, "mestring": 0.15, "pris": 0.05},
    "balansert": {"sikkerhet": 0.4, "spikkeevne": 0.3, "mestring": 0.2, "pris": 0.1},
}

NOKKEL = ["spiss", "slip", "skaft_materiale", "slire"]

REFERANSE = {
    "_navn": "vanlig tollekniv for voksne",
    "blad_lengde_mm": 100, "blad_hoyde_mm": 20, "rygg_mm": 2.5, "spiss": "spiss",
    "eggvinkel_grader": 23, "slip": "scandi", "usleipet_mm": 0, "fingervern_mm": 0,
    "skaft_lengde_mm": 110, "skaft_tykkelse_mm": 26, "blad_fall_grader": 0,
    "tommelrampe": False, "skaft_materiale": "tre", "slire": "friksjon", "signalfarge": False,
}


def klokke(x, topp, bredde):
    return math.exp(-((x - topp) / bredde) ** 2)


def sigmoid(x):
    return 1 / (1 + math.exp(-x))


def clip(x):
    return max(0.0, min(1.0, x))


def score(d):
    v = d["eggvinkel_grader"]
    slip_bitt = {"scandi": 1.0, "flat": 0.9, "konveks": 0.8, "hul": 0.85}[d["slip"]]

    # --- Skademekanisme 1: kniven sklir av treet ---
    # Kraft som trengs øker med eggvinkelen; barn har lite kraft -> mer skliing.
    kraft = (0.4 + v / 30) / slip_bitt
    grep = {"tre": 0.75, "tpe_gummi": 1.0, "plast": 0.6}[d["skaft_materiale"]]
    grep *= klokke(d["skaft_tykkelse_mm"], 22, 4)            # barnehånd: ~22 mm
    kontroll = (0.5 * klokke(d["blad_fall_grader"], 7, 6)   # rett håndledd ved spikking
                + 0.3 * d["tommelrampe"] + 0.2 * grep)
    p_skli = sigmoid((kraft - 1.3) * 4) * (1.3 - 0.6 * kontroll)

    # --- Skademekanisme 2: hånden glir fram på eggen ---
    vern = clip(d["fingervern_mm"] / 5)
    p_glid = (1 - 0.75 * vern) * (1 - 0.6 * clip(d["usleipet_mm"] / 12)) * (1.2 - 0.4 * grep)

    # --- Skademekanisme 3: stikk med spissen ---
    p_stikk = {"spiss": 1.0, "avrundet_r4": 0.35, "rund_r8": 0.12, "but": 0.05}[d["spiss"]]

    # Hvor ille blir et kutt? Lengre blad og tynnere egg -> dypere.
    alvor = (0.6 + 0.4 * d["blad_lengde_mm"] / 100) * (1.15 - 0.3 * clip((v - 18) / 20))
    slire = {"friksjon": 0.6, "klikk": 0.9, "klikk_med_knapp": 1.0}[d["slire"]]
    risiko = alvor * (0.45 * p_skli + 0.35 * p_glid + 0.2 * p_stikk)
    sikkerhet = clip(1.15 - 1.4 * risiko) * (0.85 + 0.15 * slire)

    # --- Spikkeevne ---
    aktiv_egg = max(0.0, d["blad_lengde_mm"] - d["usleipet_mm"])
    detalj = {"spiss": 1.0, "avrundet_r4": 0.85, "rund_r8": 0.6, "but": 0.3}[d["spiss"]]
    styrke = clip((d["rygg_mm"] - 1.6) / 1.0) * clip((v - 15) / 6)   # tynn rygg/egg knekker
    spikke = (0.35 * klokke(v, 24, 6) * slip_bitt
              + 0.25 * clip(aktiv_egg / 55)
              + 0.15 * detalj
              + 0.15 * styrke
              + 0.10 * klokke(d["blad_hoyde_mm"], 18, 5))

    # --- Mestring: lett å lære riktig, lett å vedlikeholde ---
    slipbar = {"scandi": 1.0, "flat": 0.8, "konveks": 0.5, "hul": 0.6}[d["slip"]]
    mestring = (0.3 * slipbar + 0.25 * klokke(d["skaft_lengde_mm"], 95, 12)
                + 0.2 * d["tommelrampe"] + 0.15 * d["signalfarge"]
                + 0.1 * klokke(d["blad_fall_grader"], 7, 6))

    pris_kr = (60 + 0.5 * d["blad_lengde_mm"] + 15 * (d["fingervern_mm"] > 0)
               + {"tre": 20, "tpe_gummi": 25, "plast": 10}[d["skaft_materiale"]]
               + {"friksjon": 10, "klikk": 25, "klikk_med_knapp": 40}[d["slire"]]
               + 10 * d["tommelrampe"])
    return {
        "sikkerhet": sikkerhet,
        "spikkeevne": spikke,
        "mestring": mestring,
        "pris": 1 / (1 + pris_kr / 200),
        "_risiko": risiko,
        "_p_skli": p_skli,
        "_p_glid": p_glid,
        "_pris_kr": pris_kr,
    }
