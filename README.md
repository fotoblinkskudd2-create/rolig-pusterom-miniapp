# Oppfinnelsesmaskinen / Designmaskinen

**Idé inn, designpakke ut.** Du skriver en idé. Maskinen gjør research, markedsanalyse,
lager en matematisk modell, finner det beste designet blant tusenvis, tester hvor
robust det er, lager CAD (3D-print-filer), teknisk tegning, testplan og en
beslutningsrapport.

## Bruk

### Nettside (enklest)
```bash
python3 designmaskin.py --web
```
Åpne http://127.0.0.1:8765, skriv idéen og trykk **Start design**. Siden oppdateres
mens maskinen jobber og viser rapport og bilder når den er ferdig.

### Kommandolinje
```bash
python3 designmaskin.py "en kaffekopp som holder kaffen varm i 3 timer uten strøm"
python3 designmaskin.py "..." --tørr          # vis hva som kjøres, uten å kjøre
```

### Inne i Claude Code
```
/design en sykkellås under 500 g som tåler 3 minutter med baufil
```

Alt havner i `produkter/<navn>/`:

| Fil | Innhold |
|---|---|
| `RAPPORT.md` | Beslutning, anbefalinger med konfidens, alternativer, plan, risiko, metrikker |
| `00_brief.md` | Mål, krav og antakelser |
| `01_research.md` | Fag, teknologi, standarder og patenter, med kilder |
| `02_marked.md` | Marked (TAM/SAM/SOM), konkurrenter, pris og enhetsøkonomi |
| `problem.py` · `beste.json` · `robusthet.md` | Modell, beste design og hvor mye vi kan stole på det |
| `*.scad` · `*.stl` · `*.png` · `tegning.svg` | CAD, 3D-print-filer og tegninger |
| `05_testplan.md` | Hvordan kravene skal testes, med krav for bestått i tall |
| `fremdrift.txt` · `logg.jsonl` · `status.json` | Hva maskinen gjorde, steg for steg |

## Oppsett (én gang)

1. Installer [Claude Code](https://code.claude.com) og logg inn (`claude`).
2. Python 3.8+ og numpy (`pip install numpy`).
3. For CAD og tegninger: [OpenSCAD](https://openscad.org), og Node med Playwright
   (`npm i -g playwright && npx playwright install chromium`).

## Hvordan den virker

```
idé ─► designmaskin.py ─► Claude Code (headless) ─► /design-skillen
                                                       │
     research ◄── nettsøk                               ▼
     marked   ◄── nettsøk         problem.py ─► maskin (søk) ─► robusthet
                                                       │
     RAPPORT ◄── testplan ◄── tegning ◄── CAD ◄────────┘
```

- **`.claude/skills/design/SKILL.md`** er arbeidsflyten, de faste stegene og kvalitetskravene.
- **`maskin/`** er generelle verktøy:
  - `python3 -m maskin` søker etter det beste designet
  - `python3 -m maskin.robusthet` sjekker hvor stabilt og følsomt resultatet er
  - `python3 -m maskin.render` lager PNG og STL fra SVG og SCAD
- **`produkter/_mal/`** har malen for modellen (`problem.py`) og for rapporten (`RAPPORT.md`).

**Viktig:** Maskinen blir aldri bedre enn modellen og antakelsene sine. Hver rapport skiller
mellom `[målt]`, `[kilde]`, `[modell]` og `[antakelse]`. Det er først testen på en ekte prototype
som avgjør. Legg målingene inn i `problem.py` og kjør på nytt. Slik blir maskinen bedre for hvert produkt.

**Sikkerhet:** Maskinen får lov til å kjøre `python3` og lage filer i denne mappen uten å spørre.
Kjør den derfor bare på en maskin og i en mappe du stoler på. Nettsiden lytter som standard bare på
`127.0.0.1`, så andre på nettverket når den ikke.

## Kostnad og tid
Én kjøring tar typisk 20–60 minutter og bruker Claude-tokens fra kontoen din.
Hvor mye det blir, står i `status.json` etter hver kjøring (`kost_usd`).

## Tester
```bash
python3 -m unittest discover tester
```

## Produkter

| Mappe | Status |
|---|---|
| `produkter/tannborste` | P1 «Ren»: tegning, OpenSCAD-modell, STL-filer, spesifikasjon. Ikke testet. |
| `produkter/drone_propell` | P1 10″ og 10,5″: fysikkmodell (BEMT), 19–25 % mindre effekt i modellen, STL, tegninger. Krever numpy. |
| `produkter/barnekniv` | K1 «Spikkevenn»: risikomodell, 81 % lavere kuttrisiko i modellen, OpenSCAD, STL, tegning. |
| `produkter/_mal` | Mal for modell og rapport |
