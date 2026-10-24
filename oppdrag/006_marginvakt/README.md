# 6 · Marginvakt for små leveranser

FastAPI + SQLite + nettleser-UI. Én soloprenør, lokal demo.

## Start

```bash
pip install fastapi uvicorn httpx          # hvis de mangler
python3 app.py --demo                      # tømmer og laster data/demo.json → http://127.0.0.1:8006/
python3 kontroll.py                        # 20 kontroller (FastAPI TestClient)
node e2e.mjs                               # 5 nettlesersjekker
```

## Nøyaktig hva nøkkeltallene inkluderer (eks. mva)

| Nøkkeltall | Definisjon |
|---|---|
| Inntekt | Prosjektpris i gjeldende versjon (eller `?versjon=N`) |
| Direkte kostnader | Underleverandører + andre kostnader |
| Refusjoner | Viderefakturerte utlegg. Vises separat og inngår **verken** i inntekt eller kostnad, så de kan ikke dobbelttelles |
| Dekningsbidrag | Inntekt − direkte kostnader |
| Effektiv timeinntekt | Dekningsbidrag / faktiske timer. `ukjent` når det ikke er ført timer |
| Internkost egen tid | Σ timer × timesats *gyldig på timens dato* (satshistorikk) |
| Resultat etter egen tid | Dekningsbidrag − internkost |
| Avvik per aktivitet | Faktiske − estimerte timer, og prosent av estimat |

**Intern varsling:** brukeren setter `min_effektiv_timeinntekt`, `maks_timeavvik_prosent` og `min_dekningsgrad_prosent`. Varsler vises bare i appen.

**Historikk:** satser og prosjektpriser lagres som versjoner. Rapporter lagres som frosne JSON-øyeblikksbilder, så en senere satsendring endrer løpende tall, men ikke tidligere rapporter (kontrollert).

## Importformat

`POST /api/import` eller `motor.importer()` med JSON som i `data/demo.json`: `satser[]`, `prosjekter[]` (med `estimat`), `timer[]` og `kostnader[]` (type `underleverandør|annen|refusjon`).

## Avstemte referanser (demo)

- P1: 40 000 − 1 200 = 38 800 DB; 50 t → **776 kr/t**; internkost 50 × 450 = 22 500; refusjon 2 500 separat.
- P4: internkost 45 × 450 + 25 × 520 = **33 250** (satsskifte 1.10.); 62 000 / 70 t = 885,71 kr/t.
- P3: dobling av timene gir 1 388,89 → 694,44 kr/t.

Resultater: `resultat/kontroll.txt`, `resultat/e2e.txt`, `resultat/nokkeltall.csv`.

## Avvik

UI-et er ren JavaScript uten React. Ingen innlogging; lokal enbrukerdemo.
