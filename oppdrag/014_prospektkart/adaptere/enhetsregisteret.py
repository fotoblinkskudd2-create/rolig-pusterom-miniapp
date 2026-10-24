"""Adapter for Enhetsregisterets åpne API-format (Brønnøysundregistrene).

Dokumentert kilde: https://data.brreg.no/enhetsregisteret/api/docs/index.html
Endepunkt (offentlig, uten innlogging): GET https://data.brreg.no/enhetsregisteret/api/enheter?naeringskode=43.21&kommunenummer=5501&size=100
Relevante felt i hver enhet:
  organisasjonsnummer, navn, naeringskode1.kode, naeringskode1.beskrivelse, antallAnsatte (kan mangle),
  forretningsadresse.kommune, forretningsadresse.postnummer, hjemmeside, registreringsdatoEnhetsregisteret.
Lisens: data fra Enhetsregisteret er åpne data (NLOD). Kontroller gjeldende vilkår før bruk.

Denne adapteren LESER en lagret JSON-respons (samme format som API-et) og gjør ingen nettverkskall.
`hent_fra_api` er bevisst deaktivert; aktiver den bare etter at vilkår og rate-grenser er kontrollert.
Personopplysninger (f.eks. e-post til personer) hentes ikke og gjettes ikke.
"""
import json

import register


def map_enhet(e):
    adr = e.get("forretningsadresse") or {}
    nk = e.get("naeringskode1") or {}
    return {"orgnr": e.get("organisasjonsnummer"), "navn": e.get("navn"), "nace": nk.get("kode"), "nace_tekst": nk.get("beskrivelse"),
            "kommune": adr.get("kommune"), "postnr": adr.get("postnummer"),
            "ansatte": e.get("antallAnsatte") if e.get("harRegistrertAntallAnsatte", "antallAnsatte" in e) else None,
            "nettside": e.get("hjemmeside")}


def importer_json(db, sti, oppdatert):
    data = json.load(open(sti, encoding="utf-8"))
    enheter = data.get("_embedded", {}).get("enheter", [])
    n = 0
    for e in enheter:
        n += register.lagre(db, "enhetsregisteret", oppdatert, map_enhet(e), e) is not None
    db.commit()
    return n


def hent_fra_api(*_, **__):
    raise RuntimeError("Nettverkshenting er deaktivert i demoen. Les dokumentasjonen øverst i filen før aktivering.")
