"""Grensesnitt for en fremtidig ekstern kunngjøringskilde.

Adapteren skal returnere rader med samme felt som CSV-importen, slik at
radar.importer_* kan gjenbrukes. Den er bevisst ikke implementert.
"""
AKTIVERT = False  # settes først når README-sjekklisten er fylt ut


class EksternKilde:
    navn = "ikke valgt"

    def hent(self, siden_dato):
        if not AKTIVERT:
            raise RuntimeError("Ekstern adapter er deaktivert: kontroller dokumentasjon og tilgangsvilkår først "
                               "(se adaptere/README.md).")
        raise NotImplementedError
