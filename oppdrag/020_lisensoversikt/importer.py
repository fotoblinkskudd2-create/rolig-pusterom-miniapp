#!/usr/bin/env python3
"""Importskript: python3 importer.py DB LEVERANSE REVISJON FIL [FIL ...] [--las]
Støtter package-lock.json og requirements.txt. Låst oversikt kan ikke endres."""
import argparse
import os

import lisens as L

if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("db"); a.add_argument("leveranse"); a.add_argument("revisjon"); a.add_argument("filer", nargs="+")
    a.add_argument("--las", action="store_true")
    arg = a.parse_args()
    db = L.koble(arg.db)
    oid = L.ny_oversikt(db, arg.leveranse, arg.revisjon)
    for f in arg.filer:
        n = L.importer_package_lock(db, oid, f) if os.path.basename(f) == "package-lock.json" else L.importer_requirements(db, oid, f)
        print(f"{f}: {n} komponenter")
    if arg.las:
        L.las(db, oid)
    print(f"oversikt {oid}: {len(L.arbeidsko(db, oid))} i arbeidskø")
