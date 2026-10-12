# asymmetri/

Data og verktøy om bruddpunktene i dronekrigen i Ukraina 2024–2026. Hver mappe er laget for å kunne løftes ut i et eget repo.

| Mappe | Hva | Kjør |
|---|---|---|
| [`BRUDDPUNKTER.md`](BRUDDPUNKTER.md) | Research: 11 bruddpunkter, strukturell vs. midlertidig, tillit per tall, korreksjoner til premisset | Les |
| [`fiber-supply-tracker/`](fiber-supply-tracker/) | Kuratert datasett + FastAPI + frontend: fiberpriser, luftvern-gap, kalkulator for kost per FPV-sortie | `pip install fastapi uvicorn && cd fiber-supply-tracker && uvicorn api:app` → http://127.0.0.1:8000 |
| [`ew-spectrum-sim/`](ew-spectrum-sim/) | Nettleser-sim: analog / FHSS / mesh / fiber mot jammere, og kabelkutt-barriere | Åpne `index.html` |
| [`peaceful-fiber-management/`](peaceful-fiber-management/) | Satire | Les |

## API

```
GET /api/dataset
GET /api/prices?min_confidence=low|medium|high
GET /api/air-defense
GET /api/sortie-cost?spool_km=20&price_old=5.5&price_new=33&drone_base_usd=450&winding_overhead=0.35&sorties_per_month=100000&ai_share_of_increase=0.3
```

`ai_share_of_increase` er en antagelse du setter selv. Ingen åpen kilde tallfester hvor stor del av fiberprisen som skyldes AI-datasentre.

## Sim-resultater (4000 steg, standardscenarier)

| Scenario | Nådde mål |
|---|---|
| Analog mot bred jammer | 0 % |
| FHSS mot smal jammer | 100 % |
| FHSS mot bred jammer | 0 % |
| FHSS + mesh-repeater mot bred jammer | ~69 % |
| Fiber | 100 % |
| Fiber + kabelkutt-barriere (60 %) | ~38 % |

Dette er en leketøysmodell. Tallene viser retningen på asymmetrien, ikke virkelige rater.

## Bevisst utelatt

- **Čaharnik_Generator** (parametrisk kabelkutter-design): konstruksjonsunderlag for utstyr til bruk i en pågående krig. Bare satiren er med.
- **AutonomousFallback** (visuell navigasjon som gjør dronen immun mot GPS-spoofing): en prototype for våpenstyring, ikke analyse av asymmetri.
