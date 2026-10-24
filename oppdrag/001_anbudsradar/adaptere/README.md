# Ekstern datakilde – ikke koblet til

`ekstern_kilde.py` definerer grensesnittet en ekstern adapter må oppfylle.
Den er **deaktivert** til følgende er kontrollert og dokumentert her:

- [ ] Kildens API-dokumentasjon (endepunkt, format, paginering)
- [ ] Tilgangsvilkår / lisens for gjenbruk av kunngjøringsdata
- [ ] Rate-grenser og krav til identifikasjon
- [ ] Felt-mapping til `kunngjoring_id, kilde, tittel, …` (se `../data/import_1.csv`)

Inntil da importeres bare CSV. Ingen nettverkskall gjøres av appen.
