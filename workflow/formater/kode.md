# Løype: Kode

Alt som skal vedlikeholdes: flere filer, avhengigheter, tester.

## LAG
1. **Branch per brief.** `claude/<slug>` eller `<navn>/<slug>`.
2. **Test før funksjon** der det er billig. Minst én røyktest som kjører i CI.
3. **Avhengigheter:** begrunn hver ny pakke i commit-meldingen.
4. **Hemmeligheter** aldri i repo. `.env.example` med tomme verdier.

## HULL (kode)
- Klon fersk → følg README → kjører det på 60 sekunder?
- Lint, typer, tester grønt lokalt før push.
- Les din egen diff som en fiendtlig reviewer.
- Personvern: hva sendes ut av maskinen? Skriv det i RUN.md.

## LEVER
- PR med hva/hvorfor/hvordan testet.
- Tag: `vX.Y` + linje i README og `LOGG.md`.

## SPRE
GitHub release · demo-video (→ `video.md`) · kort tekst om hvorfor (→ `tekst.md`).
