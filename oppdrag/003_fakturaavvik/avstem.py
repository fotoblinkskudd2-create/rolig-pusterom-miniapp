"""Fakturaavstemming mot ordregrunnlag.

    python3 avstem.py data/ordre.csv data/faktura.csv --ut resultat/

Steg:
 1. Normalisering: datoer (ISO, dd.mm.åååå), beløp (komma/punktum, mellomrom som tusenskille),
    ordreref (PO-1001 / po1001 / 1001 → 1001), valuta (store bokstaver).
 2. Sikker match: leverandor_orgnr + normalisert ordreref + linjenr.
 3. Tilnærmet match (bare for linjer uten sikker match, mot ordrelinjer som ikke er sikkert matchet):
    samme leverandor_orgnr, beløp innenfor BELOP_TOLERANSE og fakturadato 0–DATOVINDU_DAGER etter ordredato.
    Nøyaktig én kandidat kreves; ellers uavklart.
 4. Klassifisering per fakturalinje: ok, ok_tilnaermet, bekreftet_avvik, mulig_avvik, uavklart.
Duplikater vurderes bare innen samme leverandør. Like beløp hos ulike leverandører er aldri duplikater.
Verktøyet endrer ingen kildefiler eller regnskapsdata.
"""
import argparse
import json
import os
import re
import sys

import pandas as pd

BELOP_TOLERANSE = 0.01   # 1 %
DATOVINDU_DAGER = 30
PRIS_TOLERANSE_ORE = 1   # avrundingsrest som ikke regnes som avvik


def tall(x):
    s = str(x).strip().replace(" ", "").replace(" ", "")
    if s == "" or s.lower() == "nan":
        return None
    if "," in s and "." in s:
        s = s.replace(".", "").replace(",", ".") if s.rfind(",") > s.rfind(".") else s.replace(",", "")
    else:
        s = s.replace(",", ".")
    return float(s)


def dato(x):
    s = str(x).strip()
    for fmt in ("%Y-%m-%d", "%d.%m.%Y"):
        try:
            return pd.to_datetime(s, format=fmt)
        except (ValueError, TypeError):
            pass
    return pd.NaT


def ref(x):
    s = str(x).strip()
    if s == "" or s.lower() == "nan":
        return None
    m = re.search(r"(\d+)", s)
    return m.group(1).lstrip("0") if m else s.upper()


def les(sti, kilde):
    df = pd.read_csv(sti, dtype=str, keep_default_na=False)
    df.insert(0, "kilde_fil", os.path.basename(sti))
    df.insert(1, "kilde_rad", range(2, len(df) + 2))
    return df


def normaliser_ordre(df):
    df = df.copy()
    df["ref_n"] = df["ordrenr"].map(ref)
    df["antall_n"] = df["antall"].map(tall)
    df["pris_n"] = df["enhetspris"].map(tall)
    df["belop_n"] = (df["antall_n"] * df["pris_n"]).round(2)
    df["dato_n"] = df["ordredato"].map(dato)
    df["valuta_n"] = df["valuta"].str.strip().str.upper()
    df["linje_n"] = df["linjenr"].map(lambda v: int(tall(v) or 1))
    return df


def normaliser_faktura(df):
    df = df.copy()
    df["ref_n"] = df["ordreref"].map(ref)
    df["antall_n"] = df["antall"].map(tall)
    df["pris_n"] = df["enhetspris"].map(tall)
    df["belop_n"] = df["belop"].map(tall)
    df["dato_n"] = df["fakturadato"].map(dato)
    df["valuta_n"] = df["valuta"].str.strip().str.upper()
    df["linje_n"] = df["linjenr"].map(lambda v: int(tall(v) or 1))
    return df


def avstem(ordre, faktura):
    o = normaliser_ordre(ordre)
    f = normaliser_faktura(faktura)
    o_idx = {(r.leverandor_orgnr, r.ref_n, r.linje_n): i for i, r in o.iterrows()}
    funn = []
    brukt_sikkert = {}
    sett_fakturanr = {}
    for i, r in f.iterrows():
        res = dict(kilde_fil=r.kilde_fil, kilde_rad=int(r.kilde_rad), fakturanr=r.fakturanr,
                   leverandor=r.leverandor, leverandor_orgnr=r.leverandor_orgnr, belop=r.belop_n,
                   matchtype=None, ordre_rad=None, ordrenr=None, status="ok", grunner=[])
        # Duplikat: samme leverandør + samme fakturanr + samme linje sett før
        dk = (r.leverandor_orgnr, r.fakturanr.strip().upper(), r.linje_n)
        if dk in sett_fakturanr:
            res.update(status="bekreftet_avvik", matchtype="duplikat")
            res["grunner"].append(f"samme leverandør, fakturanr og linje som rad {sett_fakturanr[dk]} (eksakt duplikat)")
            funn.append(res)
            continue
        sett_fakturanr[dk] = int(r.kilde_rad)
        nokkel = (r.leverandor_orgnr, r.ref_n, r.linje_n)
        har_ref = isinstance(r.ref_n, str)  # pandas gjør manglende verdi til NaN
        if har_ref and nokkel in o_idx:
            oi = o_idx[nokkel]
            res.update(matchtype="sikker", ordre_rad=int(o.at[oi, "kilde_rad"]), ordrenr=o.at[oi, "ordrenr"])
            if oi in brukt_sikkert:
                res["status"] = "mulig_avvik"
                res["grunner"].append(f"ordrelinjen er allerede fakturert på rad {brukt_sikkert[oi]} (mulig dobbel fakturering)")
            else:
                brukt_sikkert[oi] = int(r.kilde_rad)
            sammenlign(res, r, o.loc[oi])
        elif har_ref:
            res.update(status="uavklart", matchtype="ingen")
            res["grunner"].append(f"ordreref {r.ordreref!r} finnes ikke hos leverandøren")
        funn.append(res)
    # Tilnærmet match for linjer uten ordreref
    ledige = o[~o.index.isin(brukt_sikkert.keys())]
    for res in funn:
        if res["matchtype"] is not None:
            continue
        r = f[f.kilde_rad == res["kilde_rad"]].iloc[0]
        kand = ledige[(ledige.leverandor_orgnr == r.leverandor_orgnr)
                      & ((ledige.belop_n - r.belop_n).abs() <= ledige.belop_n * BELOP_TOLERANSE)
                      & ((r.dato_n - ledige.dato_n).dt.days.between(0, DATOVINDU_DAGER))]
        if len(kand) == 1:
            oi = kand.index[0]
            res.update(matchtype="tilnærmet", ordre_rad=int(o.at[oi, "kilde_rad"]), ordrenr=o.at[oi, "ordrenr"], status="ok_tilnaermet")
            res["grunner"].append(f"ingen ordreref; eneste kandidat med samme leverandør, beløp ±{BELOP_TOLERANSE:.0%} og dato innen {DATOVINDU_DAGER} dager")
            sammenlign(res, r, o.loc[oi], tilnaermet=True)
        else:
            res.update(matchtype="ingen", status="uavklart")
            if len(kand) > 1:
                res["grunner"].append("flere like kandidater: " + ", ".join(f"{k.ordrenr} (rad {k.kilde_rad})" for _, k in kand.iterrows()))
            else:
                res["grunner"].append("ingen kandidat innen leverandør, beløpstoleranse og datovindu")
    return funn


def sammenlign(res, r, o, tilnaermet=False):
    avvik = []
    if r.valuta_n != o.valuta_n:
        avvik.append(f"valuta {r.valuta_n} ≠ ordre {o.valuta_n}")
    if r.antall_n != o.antall_n:
        avvik.append(f"antall {r.antall_n:g} ≠ ordre {o.antall_n:g}")
    if r.pris_n is not None and abs(round(r.pris_n * 100) - round(o.pris_n * 100)) > PRIS_TOLERANSE_ORE:
        avvik.append(f"enhetspris {r.pris_n:.2f} ≠ ordre {o.pris_n:.2f}")
    if r.antall_n is not None and r.pris_n is not None and abs(r.antall_n * r.pris_n - r.belop_n) > 0.01:
        avvik.append(f"linjebeløp {r.belop_n:.2f} ≠ antall × pris {r.antall_n * r.pris_n:.2f}")
    if avvik:
        res["grunner"] += avvik
        # Tilnærmet match er aldri grunnlag for bekreftet avvik
        if res["status"] in ("ok", "ok_tilnaermet"):
            res["status"] = "mulig_avvik" if tilnaermet else "bekreftet_avvik"


def skriv_rapport(funn, ut):
    os.makedirs(ut, exist_ok=True)
    df = pd.DataFrame(funn)
    df["grunner"] = df["grunner"].map("; ".join)
    df.to_csv(os.path.join(ut, "avviksrapport.csv"), index=False)
    mal = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "rapport_mal.html"), encoding="utf-8").read()
    with open(os.path.join(ut, "avviksrapport.html"), "w", encoding="utf-8") as f:
        f.write(mal.replace("/*DATA*/null", json.dumps(funn, ensure_ascii=False, default=str)))
    return df


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("ordre")
    a.add_argument("faktura")
    a.add_argument("--ut", default="resultat")
    arg = a.parse_args()
    funn = avstem(les(arg.ordre, "ordre"), les(arg.faktura, "faktura"))
    df = skriv_rapport(funn, arg.ut)
    print(df.status.value_counts().to_string())
    print(f"Rapport: {arg.ut}/avviksrapport.html og .csv")
    sys.exit(0)
