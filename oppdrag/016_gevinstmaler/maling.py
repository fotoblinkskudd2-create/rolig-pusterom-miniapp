"""Før–etter-måling av en arbeidsflytendring.

- Grupper = (oppgavetype, målekilde). Ulike oppgavetyper slås ALDRI sammen automatisk; sammenslåing krever eksplisitt valg.
- Per gruppe og periode: n, manglende varighet, median, kvartilavstand (IQR), min/maks, gjennomsnitt, feil per 100.
- Små utvalg (n < MIN_N) og grupper uten begge perioder flagges.
- Volum per uke = antall registrerte oppgaver / antall uker i den definerte perioden (data/perioder.json).
- Rader utenfor periodene telles og vises, men brukes ikke.
- Dekomponering av endring i timer per uke (median-basert):
    tidseffekt  = V_etter × (m_etter − m_før) / 60
    volumeffekt = (V_etter − V_før) × m_før / 60
    total       = V_etter·m_etter/60 − V_før·m_før/60  (= tidseffekt + volumeffekt)
- Økonomi: bare fra eksplisitt valgt timesats og volum. Ingen årsakspåstand – det står i hver rapport.
"""
import csv
import datetime as dt
import sqlite3
import statistics as st

MIN_N = 10
FORBEHOLD = "En enkel før–etter-sammenligning viser endring i målte verdier, ikke dokumentert årsak. Sesong, volum, personell og målemåte kan påvirke."


def koble(sti=":memory:"):
    db = sqlite3.connect(sti, check_same_thread=False)
    db.row_factory = sqlite3.Row
    db.execute("""CREATE TABLE IF NOT EXISTS maling(id INTEGER PRIMARY KEY, dato TEXT, oppgavetype TEXT, periode TEXT CHECK(periode IN ('før','etter')),
        varighet_min REAL, feil INT, malekilde TEXT, kilde_rad INT)""")
    return db


def importer(db, sti):
    with open(sti, encoding="utf-8-sig") as f:
        for i, r in enumerate(csv.DictReader(f), start=2):
            v = r["varighet_min"].strip().replace(",", ".")
            db.execute("INSERT INTO maling(dato,oppgavetype,periode,varighet_min,feil,malekilde,kilde_rad) VALUES(?,?,?,?,?,?,?)",
                       (r["dato"], r["oppgavetype"].strip(), r["periode"].strip(), float(v) if v else None, int(r["feil"] or 0), r["malekilde"].strip(), i))
    db.commit()


def kvartiler(x):
    if len(x) < 2:
        return None, None
    q = st.quantiles(x, n=4, method="inclusive")
    return q[0], q[2]


def uker_i(periode):
    return ((dt.date.fromisoformat(periode["til"]) - dt.date.fromisoformat(periode["fra"])).days + 1) / 7


def stat(rader, periode):
    """periode: {"fra","til"} – volum per uke regnes mot periodens lengde, ikke mot spredningen i dataene."""
    v = sorted(r["varighet_min"] for r in rader if r["varighet_min"] is not None)
    uker = uker_i(periode)
    q1, q3 = kvartiler(v)
    return {"n": len(v), "registrert": len(rader), "manglende_varighet": len(rader) - len(v),
            "median": st.median(v) if v else None, "q1": q1, "q3": q3, "iqr": (q3 - q1) if q1 is not None else None,
            "min": v[0] if v else None, "maks": v[-1] if v else None, "snitt": st.fmean(v) if v else None,
            "feil_per_100": 100 * sum(r["feil"] for r in rader) / len(rader) if rader else None,
            "uker": uker, "volum_per_uke": len(rader) / uker, "lite_utvalg": len(v) < MIN_N}


def grupper(db, perioder, slaa_sammen=None):
    """slaa_sammen: valgfritt eksplisitt kart {oppgavetype: felles_navn}. Uten det holdes typene adskilt."""
    g = {}
    for r in db.execute("SELECT * FROM maling ORDER BY dato"):
        r = dict(r)
        p_ = perioder[r["periode"]]
        if not (p_["fra"] <= r["dato"] <= p_["til"]):
            continue
        navn = (slaa_sammen or {}).get(r["oppgavetype"], r["oppgavetype"])
        g.setdefault((navn, r["malekilde"]), {"før": [], "etter": []})[r["periode"]].append(r)
    ut = []
    for (navn, kilde), p in sorted(g.items()):
        f, e = stat(p["før"], perioder["før"]), stat(p["etter"], perioder["etter"])
        advarsler = []
        if not p["før"] or not p["etter"]:
            advarsler.append("mangler før- eller etterperiode – ikke sammenlignbar")
        if f["lite_utvalg"] or e["lite_utvalg"]:
            advarsler.append(f"lite utvalg (n før {f['n']}, n etter {e['n']}; anbefalt minst {MIN_N} per periode)")
        if f["manglende_varighet"] or e["manglende_varighet"]:
            advarsler.append(f"manglende varighet: {f['manglende_varighet']} før, {e['manglende_varighet']} etter (utelatt fra statistikken)")
        if e["maks"] and e["q3"] and e["maks"] > e["q3"] + 3 * (e["iqr"] or 0):
            advarsler.append(f"ekstremverdi etter: {e['maks']:g} min (median er robust, gjennomsnitt påvirkes)")
        if f["maks"] and f["q3"] and f["maks"] > f["q3"] + 3 * (f["iqr"] or 0):
            advarsler.append(f"ekstremverdi før: {f['maks']:g} min")
        dekomp = None
        if f["median"] is not None and e["median"] is not None:
            tid = e["volum_per_uke"] * (e["median"] - f["median"]) / 60
            vol = (e["volum_per_uke"] - f["volum_per_uke"]) * f["median"] / 60
            dekomp = {"tidseffekt_timer_uke": tid, "volumeffekt_timer_uke": vol, "total_timer_uke": tid + vol,
                      "timer_uke_for": f["volum_per_uke"] * f["median"] / 60, "timer_uke_etter": e["volum_per_uke"] * e["median"] / 60}
        typer = sorted({r["oppgavetype"] for r in p["før"] + p["etter"]})
        ut.append({"gruppe": navn, "malekilde": kilde, "typer": typer, "for": f, "etter": e, "dekomponering": dekomp, "advarsler": advarsler})
    return ut


def okonomi(gruppe, timesats, volum_per_uke, uker_per_aar=46):
    """Scenario: tidsendring per oppgave (median) × eksplisitt volum × eksplisitt timesats."""
    f, e = gruppe["for"]["median"], gruppe["etter"]["median"]
    if f is None or e is None:
        return None
    timer_spart_uke = volum_per_uke * (f - e) / 60
    return {"timesats": timesats, "volum_per_uke": volum_per_uke, "uker_per_aar": uker_per_aar, "endring_min_per_oppgave": e - f,
            "timer_spart_per_uke": timer_spart_uke, "kr_per_aar": timer_spart_uke * timesats * uker_per_aar, "forbehold": FORBEHOLD}
