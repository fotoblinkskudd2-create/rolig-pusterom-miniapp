import os
import sqlite3
import sys

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HER)
sys.path.insert(0, os.path.join(HER, ".."))
import lisens as L  # noqa: E402
from demo import last_demo  # noqa: E402
from felles.kontroll import kjor  # noqa: E402


def kontroll(k):
    db = L.koble()
    o1, o2 = last_demo(db)
    t1 = [x for x in L.komponenter(db, o1) if x["type"] == "tredjepart"]
    k.lik("revisjon 1: fire tredjepartsavhengigheter", sorted((x["navn"], x["versjon"]) for x in t1),
          [("datoverktoy", "2.1.0"), ("hjelpefunk", "1.0.4"), ("rapportgen", "3.2.1"), ("tabellmotor", "0.9.3")])
    ko1 = L.arbeidsko(db, o1)
    k.lik("én ukjent lisens i arbeidskøen (hjelpefunk)", [(x["navn"], x["problem"]) for x in ko1 if x["problem"] == "ukjent lisens"], [("hjelpefunk", "ukjent lisens")])
    k.lik("manglende attribusjon for Apache-2.0-pakken", [(x["navn"], x["problem"]) for x in ko1 if x["problem"] == "manglende attribusjon"], [("tabellmotor", "manglende attribusjon")])
    dk = next(x for x in t1 if x["navn"] == "datoverktoy")
    k.lik("manuell attribusjon beholder lisens fra låsefil", (dk["lisens"], dk["lisens_kilde"], dk["attribusjon"][:9]), ("MIT", "package-lock.json", "Copyright"))
    k.lik("lisens fra requirements.txt er ukjent til den registreres manuelt med kilde", next(x for x in t1 if x["navn"] == "rapportgen")["lisens_kilde"], "PKG-INFO i pakken (lest manuelt)")
    t2 = [x for x in L.komponenter(db, o2) if x["type"] == "tredjepart"]
    k.lik("revisjon 2: datoverktoy finnes i to versjoner som separate rader", sorted(x["versjon"] for x in t2 if x["navn"] == "datoverktoy"), ["2.1.0", "3.0.0"])
    k.kaster("låst oversikt (rev 1) kan ikke endres", lambda: L.legg_til(db, o1, "tredjepart", "ny", "1.0", "MIT"), PermissionError)
    k.lik("historisk oversikt er uendret etter at rev 2 ble lagt inn", len(L.komponenter(db, o1)), 5)
    k.kaster("samme leveranse og revisjon kan ikke registreres to ganger", lambda: L.ny_oversikt(db, "kundeportal", "v1.0.0 (commit a1b2c3d)"), sqlite3.IntegrityError)
    diff = L.sammenlign(db, o1, o2)
    k.sjekk("sammenligning viser versjonsendring og fjernet pakke", any(d["endring"] == "fjernet" and d["navn"] == "rapportgen" for d in diff) and any(d["navn"] == "datoverktoy" for d in diff), diff)
    att = L.attribusjonsfil(db, o1)
    os.makedirs(os.path.join(HER, "resultat"), exist_ok=True)
    open(os.path.join(HER, "resultat", "TREDJEPART_v1.0.0.txt"), "w", encoding="utf-8").write(att)
    open(os.path.join(HER, "resultat", "TREDJEPART_v1.1.0.txt"), "w", encoding="utf-8").write(L.attribusjonsfil(db, o2))
    k.sjekk("attribusjonsfilen markerer ukjent lisens og manglende attribusjon", "UKJENT – må avklares" in att and "ATTRIBUSJON MANGLER" in att)
    k.sjekk("attribusjonsfilen er knyttet til revisjonen og har forbehold", "a1b2c3d" in att and "ingen juridisk vurdering" in att)
    k.sjekk("egne moduler står ikke i tredjepartsfilen", "kundeportal-ui" not in att)


kjor("020 Lisensoversikt", HER, kontroll)
