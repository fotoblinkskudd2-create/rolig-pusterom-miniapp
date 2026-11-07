# Kunstfabrikk

Fem verktøy som skal bryte stillstand i kunst- og agentarbeidet. Ett kommandolinjeverktøy, fem kommandoer.

| Kommando | Oppgave | Hva du får |
|---|---|---|
| `serie` | 1. Anti-slop Bergen / gonzo-stencil-serie | 1 `/imagine` → beste av 4 → **6 varianter med låst `--sref` + `--seed`** → postpakke (bilde, caption, Suno-linje) |
| `satire` | 2. Daglig nyhets-satire | 3–5 nyheter (fil eller RSS) → **2 MJ-prompts + 3 captions per sak**, JSON + Markdown |
| `skill` | 3. Skill-fabrikken | 5 kjørbare prompt-kjeder, eller eksport som copy-paste til Claude eller Grok |
| `fokus` | 4. Fokusplan | Prosjektliste (+ nyheter) → **4 blokker à 50 min** med prompt og ferdig-kriterium |
| `tekst` | 5. Familie/justis-tekst | Rå tekst → **kapitler, de 10 hardeste setningene, synopsis**. Lokalt som standard |

## Installasjon

```bash
cd kunstfabrikk
pip install -e ".[claude,dev]"     # eller bare: pip install pillow anthropic
python -m pytest -q                # 26 tester
```

**Uten API-nøkkel** kjører alt i malmodus (offline), bortsett fra `skill` (som da kan eksporteres).
**Med nøkkel** brukes Claude (`claude-opus-5-5`, effort `medium`, server-side fallback ved avslag):

```bash
export ANTHROPIC_API_KEY=...            # eller: ant auth login
export KUNSTFABRIKK_MODELL=claude-opus-5-5   # valgfritt
export KUNSTFABRIKK_EFFORT=medium            # low | medium | high
```

`--offline` tvinger malmodus. `--ut <mappe>` styrer hvor filene havner (standard `./ut`). `--json` skriver alt til stdout.

## 1. Serie: én nyhet → 24 sammenhengende bilder

Midjourney har ikke et offisielt API. Flyten går derfor via filer, i to faser:

```bash
# Fase 1: lag /imagine-prompten
python -m kunstfabrikk serie --nyhet eksempler/nyhet.txt \
  --base "black and white spray stencil on wet Bergen concrete, one red accent"
# -> ut/<dato>-<slug>/fase1_imagine.txt  (kjør den i Midjourney, lagre de 4 bildene i en mappe)

# Fase 2: velg beste og lås stilen
python -m kunstfabrikk serie --nyhet eksempler/nyhet.txt --base "..." \
  --bilder ~/Nedlastinger/mj-runde1 --sref https://cdn.midjourney.com/<id>/0_2.png
# -> pakke.md: valgt bilde, 6 varianter (samme --sref, --seed, --sw 300), caption, Suno-linje
```

- **Valg:** automatisk scoring (kontrast, kanttetthet, negativ plass, tilpasset stencil), eller `--velg 1-4`.
- **Seed:** avledes fra nyhet + base, slik at samme input gir samme seed. Kan overstyres med `--seed`.
- **Uten `--sref`:** variantene får plassholderen `[LIM_INN_URL_TIL_VALGT_BILDE]`.
- **Test uten Midjourney:** `--simuler` lager 4 plassholderbilder og kjører hele flyten.
- Fase 2 gjenbruker innholdet fra fase 1 (`innhold.json`), så serien henger sammen.

6 varianter × 4 bilder per `/imagine` = 24 bilder i samme stil.

## 2. Satire

```bash
python -m kunstfabrikk satire --nyhet eksempler/nyheter.txt     # flere saker i én fil, skilt med linjen ---
python -m kunstfabrikk satire --rss                             # NRK toppsaker (standard)
python -m kunstfabrikk satire --rss https://www.vg.no/rss/feed --antall 3
```

Output: `ut/satire-<dato>.json` og `.md` med 2 MJ-prompts (stencil, 40–80 ord, ferdige parametre) og 3 captions per sak.

## 3. Skill-fabrikken

```bash
python -m kunstfabrikk skill --liste
python -m kunstfabrikk skill raa-kunst-bombe --inn nyhet=@eksempler/nyhet.txt --inn overflate="NAV-vegg i Bergen"
python -m kunstfabrikk skill innholds-produsent --eksporter > innholds-produsent.md   # copy-paste til Claude/Grok
```

| Skill | Steg | Input |
|---|---|---|
| `innholds-produsent` | 5 vinkler → velg skarpeste → utkast → slop-kutt + 3 åpninger | tema, kanal, lengde |
| `multi-media-bygger` | konsept → 2 MJ-prompts → Suno + caption → shotliste (6 klipp) | ide, visuell_stil, format |
| `prompt-kjede-ekspert` | dekomponer → skriv ny kjede (samme format) → tester + feilmodi | maal, eksempel_input, modell |
| `raa-kunst-bombe` | finn hykleriet → 3 metaforer → verk (MJ-prompt, veggtekst, caption) | nyhet, overflate |
| `forsknings-assistent` | delspørsmål → ordrette utdrag → syntese med kildemerker / UKILDET | sporsmal, kilder |

`@fil` leser verdien fra fil. Nye skills legges som JSON i `kunstfabrikk/skills/` (formatet står øverst i `kjeder.py`).
`prompt-kjede-ekspert` produserer kjeder i nøyaktig dette formatet, så fabrikken kan lage sine egne skills.

## 4. Fokus

```bash
python -m kunstfabrikk fokus --prosjekter eksempler/prosjekter.txt --nyheter eksempler/nyhet.txt --start 18:00
```

Prosjektfil, én per linje: `Navn | prio=1 | frist=2026-11-10 | sist=2026-11-01 | type=kunst | neste=...`

Prioriteringen gir poeng for prioritet, frist og **stillstand** (dager siden sist). Stillstand vektes høyt med vilje. Kunst og satire får bonus når det finnes ferske nyheter.

## 5. Tekst

```bash
python -m kunstfabrikk tekst --fil min-raatekst.txt              # lokalt, ingenting sendes ut
python -m kunstfabrikk tekst --fil min-raatekst.txt --llm        # Claude lager titler og synopsis
```

- **Kapitler:** bruker overskrifter (`# ...`, `KAPITTEL ...`, linjer med versaler) hvis de finnes. Ellers deles teksten i omtrent like lange biter etter avsnitt.
- **Hardeste setninger:** scoret på tunge ord (svik, løgn, rettssak, barnevern, inkasso …), korthet, førsteperson, absolutter og konkrete tall. Ordlisten `TUNGE_ORD` i `tekst.py` kan utvides fritt.
- **Output:** hvert kapittel skrives også til egen fil i `struktur-<tid>-kapitler/`.

## Selvstendige script (kun standardbibliotek)

`standalone/` har tre enkeltfiler du kan kopiere hvor som helst, og som ikke trenger installasjon:

```bash
python standalone/anti_slop_pipeline.py "black and white spray stencil on wet Bergen concrete" @eksempler/nyhet.txt
#   -> output.json {base, variants[6], captions[3], suno_line, bilder[4], valgt} + captions.txt
python standalone/news_satire_agent.py eksempler/nyhet.txt        # bare JSON: {prompts[2], captions[3]}
python standalone/fokusplan.py prosjekter.txt --start 18:00       # markdown-tabell, kunst og agent først
```

- **Ingen API-kall:** "bildegenereringen" i `anti_slop_pipeline.py` er simulert. Scoring er promptlengde pluss en tilfeldig faktor, slik prompten ba om. Velg selv i Midjourney og lim inn URL-en i `[SREF_URL]`.
- **Midjourney-parametre:** `MJ_VERSJON` (standard `8.2`) og `MJ_PARAMS` står øverst i hver fil. Endre dem hvis versjonen din er en annen.

## Anti-slop

`antislop.py` gjør to ting:

1. Sender faste regler til modellen: konkret, ingen innledning eller moral, ingen emojis eller hashtags, ingen oppdiktede fakta.
2. Sjekker og renser all output.

Fra bildeprompts fjernes kvalitetsord som gir plastisk estetikk: `8k`, `masterpiece`, `trending on artstation`, `hyperrealistic`, `epic` og lignende. Treff rapporteres i `slop_treff` i output.

Satiren er rettet mot institusjoner, makt og systemer. Promptene navngir aldri identifiserbare privatpersoner, og skal ikke kopiere kjente gatekunstverk.
