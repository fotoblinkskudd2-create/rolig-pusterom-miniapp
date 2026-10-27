# Arbeidsplan – tirsdag 27. oktober 2026

> Klokka er 10:03 og jeg sitter med 200 Facebook-poster jeg ikke har skrevet ennå, en algoritme som spiser oppmerksomhet som en sulten måke, og en AI som ikke blir trøtt. Den skal gjøre jobben. Jeg skal styre den. Ingen poster skrevet for hånd i dag. Hver eneste setning går gjennom en prompt først. Det er planen. Den er brutal. Den holder.

**Leveranser i dag**
1. Denne planen (ferdig).
2. 100 filosofiske dilemmaer på Mensa-nivå → `02-filosofi-100-dilemmaer.md`
3. 100 Mensa/IQ-oppgaver med fasit → `03-mensa-iq-100-oppgaver.md`
4. Publiseringskalender for 100 dager × 2 poster.

---

## 0. Arkitekturen: fire typer prompt

| Type | Hva den gjør | Når |
|---|---|---|
| **Systemprompt** | Låser stemme, nivå, regler. Settes én gang. | Øverst i hver økt |
| **Oppgaveprompt** | Én konkret bestilling. | Hver blokk |
| **Loopprompt** | Kjører samme oppgave N ganger, med selvkritikk og forbedring hver runde. | Generering i bulk |
| **Graphprompt** | Kjede av prompter der output fra én node er input til neste (DAG). | Hele produksjonslinja |

---

## 1. Tidsplan

| Tid | Blokk | AI-modus | Output |
|---|---|---|---|
| 10:00–10:30 | **Oppstart.** Systemprompter lastes, mål låses. | Systemprompt S1–S3 | Tre lagrede systemprompter |
| 10:30–11:30 | **Research filosofi.** Kartlegg 10 felt, finn spenningene. | Graph G1 node 1–2 | Temakart, 10 × 10 råideer |
| 11:30–12:30 | **Generer 100 dilemmaer.** | Loop L1 | 100 dilemmaer v1 |
| 12:30–13:00 | Lunsj. Skjermen av. Pust (ja, i egen app). | – | – |
| 13:00–13:45 | **Kritikkrunde dilemmaer.** Kast de svake, skjerp de gode. | Loop L2 (rødt lag) | 100 dilemmaer v2 |
| 13:45–14:45 | **Research Mensa/IQ.** Klubber, terskler, oppgavetyper. | Graph G2 node 1–2 | Faktaark + oppgavetaksonomi |
| 14:45–15:45 | **Generer 100 oppgaver + fasit.** | Loop L3 | 100 oppgaver v1 |
| 15:45–16:30 | **Verifiser fasit.** AI løser hver oppgave blindt, uten å se fasit. Avvik = sjekk manuelt. | Loop L4 (blindløser) | 100 verifiserte oppgaver |
| 16:30–17:15 | **Formatér for Facebook.** Krok, oppgave, CTA. | Oppgaveprompt P5 | Ferdige poster |
| 17:15–17:45 | **Kalender.** 200 poster fordelt på 100 dager. | Oppgaveprompt P6 | Kalender |
| 17:45–18:00 | **Commit, push, logg.** Hva fungerte, hva ikke. | Oppgaveprompt P7 | Logg + neste dags plan |

---

## 2. Systemprompter

### S1 – Filosofi-redaktøren
```
Du er redaktør for en norsk Facebook-side for folk som liker å tenke hardt.
Målgruppe: Mensa-nivå, men ikke akademikere. De vil bli utfordret, ikke forelest.

Regler:
- Maks 280 tegn per dilemma. Helst under 200.
- Ett dilemma = én skarp spenning mellom to verdier som begge er gode.
- Ingen "riktig" svar. Hvis ett svar er åpenbart, er dilemmaet dødt – kast det.
- Bruk konkrete scenarioer, ikke abstrakte begreper.
- Avslutt med et spørsmål som tvinger leseren til å velge side.
- Ingen navnedropping av filosofer i selve posten (de kan ligge i notat).
- Norsk bokmål. Ingen anglisismer der et norsk ord finnes.
```

### S2 – Gåtemakeren
```
Du lager IQ-oppgaver for Facebook i Mensa-stil.
Hver oppgave skal:
- Kunne løses uten bilder (ren tekst).
- Ha ett entydig svar, ELLER være eksplisitt merket [ÅPEN] hvis den er laget for debatt.
- Ha en "aha" – svaret skal føles åpenbart i ettertid.
- Fange de som svarer for fort (System 1-feller er gull).
- Være under 300 tegn.
Lever alltid: OPPGAVE | FASIT | FORKLARING (1–2 setninger) | KATEGORI | VANSKELIGHET 1–5.
```

### S3 – Det røde laget (kritiker)
```
Du er en nådeløs kritiker. Du får en liste med innhold.
For hvert element: gi poeng 1–10 på (a) skarphet, (b) originalitet, (c) engasjement i kommentarfelt.
Alt under 7 i snitt: skriv om eller foreslå erstatning.
For oppgaver: løs den selv FØRST, uten å se fasit. Rapporter hvis ditt svar avviker.
Vær kort. Ingen ros. Kun funn.
```

---

## 3. Loopprompter

### L1 – Generer dilemmaer i runder
```
[System: S1]

Runde {n} av 10. Tema: {tema}.
Tidligere godkjente dilemmaer (ikke gjenta vinkel): {liste}.

1. Skriv 15 dilemmaer innen temaet.
2. Ranger dem selv 1–10 på skarphet.
3. Behold de 10 beste. Skriv om de 3 svakeste av disse én gang til.
4. Lever kun de 10 endelige, nummerert.
```
Kjøres 10 ganger, én per tema: etikk · sinn/bevissthet · fri vilje · identitet · kunnskap · samfunn/politikk · AI/teknologi · død/mening · kunst/skjønnhet · logikk/paradokser.

### L2 – Rødt lag, iterer til terskel
```
[System: S3]

Her er 100 dilemmaer. Kjør kritikk.
Returner kun de som scorer under 7, med ny versjon.
Jeg sender tilbake de nye versjonene. Gjenta til alle er ≥ 7 eller vi har kjørt 3 runder.
```

### L3 – Generer oppgaver per kategori
```
[System: S2]

Kategori: {tallrekker | logikk | sannsynlighet | lateral | språk | uendelighet | paradokser}.
Lag 20 oppgaver. Behold de 15 beste. Merk vanskelighetsgrad.
Sjekk at ingen to oppgaver har samme løsningsmekanisme.
```

### L4 – Blindløseren (fasitkontroll)
```
Du får én oppgave om gangen, UTEN fasit.
Løs den. Vis regnestykket kort. Gi ett svar.
Hvis oppgaven har flere gyldige svar, list dem alle og si at den bør merkes [ÅPEN].
```
Sammenlign blindløserens svar med fasit. Avvik → manuell sjekk. Det er her feil dør.

---

## 4. Graphprompter (produksjonslinja som DAG)

### G1 – Filosofi
```
[N1 Temakart] ──► [N2 Spenningsfinner] ──► [N3 Generator L1] ──► [N4 Rødt lag L2] ──► [N5 FB-formatør] ──► [N6 Kalender]
                                                     ▲                        │
                                                     └──── under terskel ─────┘
```
- **N1 Temakart:** «List de 10 mest omstridte problemene innen {felt}. For hvert: de to posisjonene som står hardest mot hverandre.»
- **N2 Spenningsfinner:** «For hver motsetning: finn et hverdagslig scenario der en vanlig person må velge.»
- **N3 → N4:** loop til kvalitet ≥ 7.
- **N5 FB-formatør:** se P5.
- **N6 Kalender:** se P6.

### G2 – Mensa/IQ
```
[N1 Faktaark Mensa/IQ-klubber] ──► [N2 Oppgavetaksonomi] ──► [N3 Generator L3] ──► [N4 Blindløser L4] ──┬─► [N5 FB-formatør]
                                                                                                         └─► avvik → [Manuell sjekk] ──► N3
```

---

## 5. Oppgaveprompter for resten av dagen

**P5 – Facebook-format**
```
Gjør dette om til en Facebook-post:
Linje 1: krok (maks 8 ord, skal stoppe tommelen).
Linje 2–4: selve dilemmaet/oppgaven.
Siste linje: én konkret handling (“Svar A eller B” / “Skriv svaret ditt – fasit i morgen kl 09”).
Ingen emojis utover maks én. Ingen hashtags i teksten; legg 3 i første kommentar.
```

**P6 – Kalender**
```
Fordel 100 dilemmaer og 100 oppgaver over 100 dager.
Dilemma kl 09:00, oppgave kl 19:30. Fasit på oppgaven postes som kommentar neste morgen 08:30.
Varier tema – aldri samme tema to dager på rad. Lever som tabell: dag | dato | 09:00 | 19:30.
Startdato: 28.10.2026.
```

**P7 – Dagslogg**
```
Oppsummer dagens arbeid i 5 punkter: hva ble levert, hva tok lengst tid, hvilken prompt ga best output,
hvilken prompt bør skrives om, hva er første oppgave i morgen.
```

---

## 6. Publiseringsrytme (kortversjon)

- **09:00** – Dilemma. Folk har kaffe og meninger.
- **19:30** – IQ-oppgave. Folk har sofa og ego.
- **08:30 neste dag** – Fasit i kommentarfeltet på gårsdagens oppgave. Dette gir et nytt varsel til alle som kommenterte. Gratis rekkevidde.
- **Hver søndag** – Ukas mest omstridte dilemma postes på nytt med de beste svarene fra kommentarfeltet.

---

## 7. Sjekkliste før publisering

- [ ] Hver oppgave er løst blindt av AI og stemmer med fasit
- [ ] Alle tvetydige oppgaver er merket [ÅPEN]
- [ ] Ingen dilemma har et åpenbart riktig svar
- [ ] Ingen post over 300 tegn (eksklusiv krok og CTA)
- [ ] Kalender har ingen temagjentakelse to dager på rad

---

> 18:00. Det er mørkt over fjorden. 200 poster. Null skrevet for hånd. Hver eneste av dem gikk gjennom en maskin som ikke vet hva en kaffekopp er – og likevel spør den bedre spørsmål enn halve kommentarfeltet kommer til å svare på. Er det jeg som har skrevet dem? Eller er jeg bare den som trykket enter?
