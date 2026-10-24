"""Fiktiv leveranse «kundeportal» i to revisjoner."""
import os

import lisens as L

HER = os.path.dirname(os.path.abspath(__file__))


def last_demo(db):
    o1 = L.ny_oversikt(db, "kundeportal", "v1.0.0 (commit a1b2c3d)", "2026-09-01T10:00:00")
    L.legg_til(db, o1, "egen", "kundeportal-ui", "1.0.0", "Proprietær (kundeavtale)", "kontrakt §7", "eget repo")
    L.importer_package_lock(db, o1, os.path.join(HER, "eksempel", "rev1", "package-lock.json"))
    L.importer_requirements(db, o1, os.path.join(HER, "eksempel", "rev1", "requirements.txt"))
    L.legg_til(db, o1, "tredjepart", "rapportgen", "3.2.1", "BSD-3-Clause", "PKG-INFO i pakken (lest manuelt)", "PyPI (requirements.txt)",
               "Copyright (c) 2019 Fiktiv Rapport-forfatter")
    L.legg_til(db, o1, "tredjepart", "datoverktoy", "2.1.0", None, None, "npm", "Copyright (c) 2020 Fiktiv Dato-forfatter")
    L.las(db, o1, "2026-09-01T12:00:00")
    o2 = L.ny_oversikt(db, "kundeportal", "v1.1.0 (commit d4e5f6a)", "2026-10-15T10:00:00")
    L.legg_til(db, o2, "egen", "kundeportal-ui", "1.1.0", "Proprietær (kundeavtale)", "kontrakt §7", "eget repo")
    L.importer_package_lock(db, o2, os.path.join(HER, "eksempel", "rev2", "package-lock.json"))
    return o1, o2
