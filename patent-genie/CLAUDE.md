# CLAUDE.md — patent-genie

Regler for alt arbeid i dette prosjektet. Les denne før du endrer noe.

1. **Domene:** AI-tech. Primær CPC-klasse G06N (beregningsmodeller, nevrale nett, ML). Sekundær G06F, G10L (tale), G06V (bildegjenkjenning).
2. **Påstander merkes** `DOKUMENTERT` / `BEREGNET` / `HYPOTESE` / `UAVKLART`.
   - `DOKUMENTERT` krever kilde i teksten.
   - Priser og tall som ikke er hentet fra kilde er `BEREGNET` eller `HYPOTESE`.
3. **Patentstatus skilles alltid:** `utløpt` / `bortfalt` / `oppgitt` / `avslått` / `aktiv` / `UAVKLART`.
   - Aldri anta fri bruk uten kilde.
   - Mangler kilde = `UAVKLART`.
4. **Les `log/leveranselogg.md` før hver kjøring.** Aldri gjenta en idé som står der. `invent.py` håndhever dette i kode.
5. **Ingen våpen, jamming eller skjult sporing.** Ingen udokumenterte helsepåstander.
6. **Ikke send, kjøp eller publiser noe eksternt uten at Alex sier ja.** Dette gjelder også søknader, fakturaer, e-post og innlegg.
7. **Skriv på norsk.** Korte setninger. Tall foran adjektiver.

## Ikke juridisk råd

Alt i `inventions/` og `data/` er analyse, ikke juridisk vurdering. Patentstatus må verifiseres i Patentstyret, EPO eller USPTO før noen handler på den.

## Kjente begrensninger (UAVKLART til verifisert)

- **PatentSearch-feltnavn** i `src/fetch.py` og `src/redteam.py` er skrevet fra hukommelse og er **ikke verifisert** mot dokumentasjonen. Sjekk mot https://search.patentsview.org før første ekte kjøring.
- **Google Patents** brukes for juridisk status. Den svarte 503 under oppsett. Status er `UAVKLART` når siden ikke kan nås.
- **EPO og Patentstyret** er ikke koblet på. Familiesjekk er ikke gjort.
- **Proxy-policy:** `search.patentsview.org` ga 502 på CONNECT under oppsett. Den må legges på nettverks-allowlisten i miljøet før steg 1 kan kjøre.

## Struktur

```
src/common.py      felles: nøkler, Claude-kall, logg, JSON
src/fetch.py       steg 1: hent G06N-patenter (PatentsView)
src/dissect.py     steg 2: KLAVEN / LOKKET / MEKANISMEN / SANNHETEN
src/status.py      steg 3: juridisk status (GULLGRAD ≥ 7)
src/gaps.py        steg 4: hull mellom utløpt gull og fronten
src/invent.py      steg 5: oppfinnelsesbriefer
src/redteam.py     steg 6: prior art (arXiv, GitHub, patent)
src/teach.py       steg 7: læremoduler i AI-tech
run.py             løkka 1→7 + dagsrapport
```
