import datetime as dt
import json
import os
import sys

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HER)
sys.path.insert(0, os.path.join(HER, ".."))
import avtaler as A  # noqa: E402
from app import lag_app, last_demo  # noqa: E402
from felles.kontroll import kjor  # noqa: E402

IDAG = dt.date(2026, 10, 24)


def kontroll(k):
    s = A.siste_oppsigelsesdag
    k.lik("månedsslutt: 31.03.2027 − 1 mnd = 28.02.2027", s("2027-03-31", 1, "måneder").isoformat(), "2027-02-28")
    k.lik("skuddår: 31.03.2028 − 1 mnd = 29.02.2028", s("2028-03-31", 1, "måneder").isoformat(), "2028-02-29")
    k.lik("29.02.2028 − 12 mnd = 28.02.2027", s("2028-02-29", 12, "måneder").isoformat(), "2027-02-28")
    k.lik("31.05.2027 − 3 mnd = 28.02.2027", s("2027-05-31", 3, "måneder").isoformat(), "2027-02-28")
    k.lik("over årsskifte: 31.01.2027 − 1 mnd = 31.12.2026", s("2027-01-31", 1, "måneder").isoformat(), "2026-12-31")
    k.lik("dager: 15.11.2026 − 14 d = 01.11.2026", s("2026-11-15", 14, "dager").isoformat(), "2026-11-01")
    k.lik("over skuddag i dager: 01.03.2028 − 1 d = 29.02.2028", s("2028-03-01", 1, "dager").isoformat(), "2028-02-29")
    k.lik("manglende frist gir None", s("2026-12-31", None, None), None)

    db = A.koble()
    last_demo(db)
    o = {a["id"]: a for a in A.oversikt(db, IDAG)}
    k.lik("ti avtaler", len(o), 10)
    forventet = {"SA-01": "ok", "SA-02": "ok", "SA-03": "frist passert", "SA-04": "frist ukjent", "SA-05": "avsluttet",
                 "SA-06": "ok", "SA-07": "handling nå", "SA-08": "frist passert", "SA-09": "utløpt", "SA-10": "planlegg"}
    k.lik("køstatus for alle ti", {i: a["ko_status"] for i, a in o.items()}, forventet)
    ko = [a["id"] for a in A.arbeidsko(db, IDAG)]
    k.sjekk("avsluttet avtale er ikke i arbeidskøen", "SA-05" not in ko, ko)
    k.lik("ukjent frist står øverst i køen", ko[0], "SA-04")
    # Historikk og bekreftelse
    A.bekreft(db, "SA-10", "Kari (økonomi)", "2026-10-24T10:00:00")
    k.sjekk("bekreftelse lagres", A.oversikt(db, IDAG)[9]["vilkaar_bekreftet"])
    A.endre(db, "SA-10", {"pris_per_aar": 33000, "slutt": "2027-02-28"}, "2026-10-24T11:00:00", "Kari")
    h = A.historikk(db, "SA-10")
    k.lik("historikk bevarer gammel og ny pris og dato", [(x["felt"], x["gammel"], x["ny"]) for x in h if x["felt"] in ("pris_per_aar", "slutt")],
          [("pris_per_aar", "30000.0", "33000"), ("slutt", "2027-01-31", "2027-02-28")])
    k.sjekk("endrede vilkår krever ny bekreftelse", not A.oversikt(db, IDAG)[9]["vilkaar_bekreftet"])
    k.lik("ny frist beregnes fra ny sluttdato (28.02 − 1 mnd = 28.01)", A.oversikt(db, IDAG)[9]["siste_oppsigelsesdag"], "2027-01-28")
    k.sjekk("opprinnelig registrering finnes i historikk", h[0]["felt"] == "opprettet" and "2027-01-31" in h[0]["ny"])
    # ICS
    app = lag_app(db, IDAG, lambda: "2026-10-24T12:00:00")
    svar = app.behandle("GET", "/api/kalender.ics?ider=SA-01,SA-02,SA-04")
    t = svar.kropp.decode()
    os.makedirs(os.path.join(HER, "resultat"), exist_ok=True)
    open(os.path.join(HER, "resultat", "avtalefrister.ics"), "w", encoding="utf-8", newline="").write(t)
    alle = app.behandle("GET", "/api/kalender.ics").kropp.decode()
    open(os.path.join(HER, "resultat", "alle_aktive.ics"), "w", encoding="utf-8", newline="").write(alle)
    k.sjekk("ICS bruker CRLF og har VCALENDAR-ramme", t.startswith("BEGIN:VCALENDAR\r\n") and t.endswith("END:VCALENDAR\r\n"))
    k.lik("valgte avtaler gir 5 hendelser (SA-04 mangler frist → bare sluttdato)", t.count("BEGIN:VEVENT"), 5)
    k.sjekk("skuddårsdato i ICS", "DTSTART;VALUE=DATE:20280229" in t)
    k.sjekk("ubekreftede vilkår merkes i kalenderen", "VILKÅR IKKE BEKREFTET" in t)
    k.sjekk("avsluttet avtale eksporteres ikke", "Renhold" not in alle)
    try:
        import icalendar  # noqa: F401
        k.notat("icalendar installert – ikke brukt")
    except ImportError:
        # Enkel strukturkontroll uten ekstra bibliotek
        k.sjekk("hver VEVENT har UID, DTSTAMP, DTSTART og SUMMARY",
                all(all(f in blokk for f in ("UID:", "DTSTAMP:", "DTSTART;VALUE=DATE:", "SUMMARY:")) for blokk in t.split("BEGIN:VEVENT")[1:]))


kjor("009 Serviceavtaler", HER, kontroll)
