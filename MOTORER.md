# Motorene — grokkjerne + MR ART

Ved siden av Rolig-appen (som fortsatt bare er `index.html`, ingen server) bor nå fundamentet for motorene.
To pakker. Resten bygger på disse.

| Pakke | Hva | Status |
|---|---|---|
| `grokkjerne/` | Felles Grok-klient: chat, JSON-validering, retry, logging, `Merke` | Ferdig, testet |
| `mrart/` | Målebenk som leser loggen og forteller hvor ofte du må rette opp | Ferdig, testet |

## Oppsett

```bash
pip install -e ".[test]"
cp .env.example .env      # fyll inn XAI_API_KEY og XAI_MODEL
pytest                    # 22 tester, mocket API, null nettverk
```

`XAI_MODEL` hentes **kun** fra miljøet. Sjekk gjeldende modellnavn på <https://docs.x.ai/docs/models>.
Koden kjenner ikke noe modellnavn, og det er med vilje.

`.env` er i `.gitignore`. `logs/` og `runs/` også — kjøredata er din, ikke repoets.

## grokkjerne

```python
from pydantic import BaseModel
from grokkjerne import Kjerne, Merke, chat, chat_json

svar = chat("Hva er 2+2?", motor="gransk", rolle="påstandsjeger", run_id="2026-10-07-ab12")

class Delpåstand(BaseModel):
    tekst: str
    merke: Merke

d = chat_json("Bryt ned: ...", Delpåstand, system="Du er påstandsjeger.", motor="gransk", rolle="påstandsjeger")

# Parallelle agenter
import asyncio
from grokkjerne import async_chat
graver, motstemme = await asyncio.gather(
    async_chat(p, rolle="kildegraver", motor="gransk"),
    async_chat(p, rolle="motstemme", motor="gransk"),
)
```

- **Retry:** 429, 5xx, timeout og nettverksbrudd → eksponentiell backoff (~1s, ~2s), maks 3 forsøk totalt.
  400-feil prøves ikke på nytt — de blir ikke riktigere av å bli gjentatt.
  SDK-ens innebygde retry er skrudd av, så loggen viser faktisk antall forsøk.
- **chat_json:** skjemaet sendes i systemprompten, `response_format=json_object`, pydantic validerer.
  Ugyldig svar → modellen får feilmeldingen og ett nytt forsøk, maks 3. Så `UgyldigJSON`.
- **Logg:** hvert kall blir én linje i `logs/kall.jsonl`:
  `ts, motor, rolle, run_id, modell, tokens_inn, tokens_ut, latens_ms, kostnad_usd, prompt_hash, forsok, ok, feil`.
  Selve prompten logges ikke, bare hashen.
- **Kostnad** er et estimat fra `XAI_PRIS_INN_PER_M` / `XAI_PRIS_UT_PER_M` (USD per million tokens).
  Står de tomme, blir kostnaden 0 — da er det et tall du ikke har gitt, ikke et tall som er sant.
- **`Merke`:** `DOKUMENTERT`, `BEREGNET`, `HYPOTESE`, `MOTBEVIST`, `UAVKLART`. Alle motorer bruker denne. Ingen lager sin egen.

**Send med `run_id`.** Én leveranse = én `run_id`. Uten den kan MR ART ikke telle leveranser, og
inngrep per leveranse blir et tomt tall.

## mrart

```bash
mrart status                         # 3 linjer status, så tabell (7 dager)
mrart status --dager 30
mrart inngrep "Kildegraver fant på en URL" --run 2026-10-07-ab12
mrart score 2026-10-07-ab12 3        # din kvalitetsdom, 1–5. Siste score vinner.
mrart rapport                        # → mrart-rapport.html, én fil, inline SVG, null eksterne avhengigheter
```

Uten installasjon: `python -m mrart status`.

Inngrep og score knyttet til en `run_id` havner på kjøringens dag og motor, ikke dagen du rettet.

### Benker (adapter-mappe)

`mrart/benker/` — én fil per benk, registrert i `BENKER` i `mrart/benker/__init__.py`.
En benk er en klasse med `navn` og `vurder(datasett, nå) -> Benkresultat`.

**VIBE-LÅS** (første benk): holder systemet nivået, eller glir det?
Siste 7 dager mot 30-dagers grunnlinje på fire akser — inngrep/leveranse, snittscore,
kostnad/leveranse, feilrate. Én akse mer enn 20 % verre → `GLIR`. Ellers `LÅST`.
Under 3 leveranser siste uke → `FOR LITE DATA` (benken gjetter ikke).

> Merk: "VIBE-LÅS" var bare et navn i bestillingen. Definisjonen over er min tolkning.
> Er den feil, endre aksene i `vibelaas.py` — testene viser hva som må holde.
