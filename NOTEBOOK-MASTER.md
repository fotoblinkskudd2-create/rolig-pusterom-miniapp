# MASTER RESEARCH — Rolig / Pusterom / Isolation Mirror

*Kildedokument til Google NotebookLM. Generert 06.10.2026 fra alt som finnes i repoet `rolig-pusterom-miniapp` (5 commits, 26.07–29.08.2026) og innspillsloggen (Xff-notater).*

> Last opp denne fila som kilde i NotebookLM. Den er skrevet for at notatboka skal kunne svare presist: hva som finnes, hva som er påstått, hva som faktisk er bygget, og hva som må researches videre.

---

## 0. Kortversjonen (les dette først)

Klokka er 02:43 en natt i oktober og jeg snakker inn i telefonen: «Lag en liste som heter Bule og motstand.» Det er det eneste nye innspillet på to måneder. Resten av sannheten ligger i et repo med to HTML-filer og tre markdown-filer som lyver litt.

Sånn står det:

1. **Pusterom (`index.html`)** — en fungerende stress-/nedstemthets-app i én HTML-fil. Fire sider: Innsjekk, Pusterom, Små grep, Historikk. Alt i `localStorage`. Ingen server, ingen konto.
2. **Isolation Mirror (`isolation-mirror.html`)** — en prototype: skriv om isolasjonen, legg ved et bilde (blir på enheten), få en 3-stegs privat protokoll + en ferdig prompt til «Labben» / Grok-bot.
3. **Dokumentasjonen (`README.md`, `RUN.md`, `HULL.md`)** — beskriver versjon 1.1 med nav-fix, «alt blir på denne enheten»-linje, export av historikk og lenke til Isolation Mirror.

**Det store funnet:** 1.1-commiten (`3cc07de`) endret *bare dokumentasjon*. `index.html` ble aldri rørt etter 26.07.2026. Fire av fem hull som `HULL.md` sier er tettet, står fortsatt åpne i koden. Dokumentene beskriver en app som ikke finnes ennå.

---

## 1. Visjonen — hva dette er

- **Hvem:** én person. Lokal. Ingen sky. Ikke en plattform, ikke et marked, ikke «app + sky».
- **Hva:** et rolig rom i lomma for stress, nedstemthet og isolasjon. Små, konkrete handlinger i stedet for terapi-språk.
- **Tone i appen:** myk, trygg, ikke-dømmende. («Hei. Du er trygg her.», «Ingen sjekk-ins ennå. Det er greit.», «Du er ikke alene i dette. Kampen teller.»)
- **Prinsipp:** lokal-first er ikke en feature, det er et tillitsløfte. Fra `HULL.md`: *«Ingen setning om at data blir på enheten. For en stress-app er det tillitsbrudd.»*
- **DNA for neste trinn (fra Labben-prompten):** fototerapi + passiv mekanikk + 48-timers rammer.
- **Arbeidsnavn:** «Rolig», «Rolig 2.0» (commit `02b1a25`), «Pusterom», «Isolation Mirror», «Labben».

---

## 2. Tidslinje

| Dato | Commit | Hva skjedde |
|---|---|---|
| 26.07.2026 | `a583d16` | Initial commit. To-linjers README. |
| 26.07.2026 | `5b19732` | Hele Pusterom-appen: 4 sider, localStorage, pusteanimasjon, rolig design (397 linjer). |
| 14.08.2026 | `02b1a25` | Isolation Mirror-prototype + notater for «Rolig 2.0». |
| 29.08.2026 | `3cc07de` | «1.1: nav-fix, lokal-first, historikk-export, Isolation Mirror bundet til Labben» — **endret kun README/RUN/HULL, ikke koden.** |
| 29.08.2026 | `0c66603` | Isolation Mirror 1.1: bildeforhåndsvisning, Labben-prompt, fjernet «slop» Midjourney-prompt. |
| 04.10.2026 | Xff-notat | Talenotat fra iPhone 02:43: «Lag en liste som heter Bule og motstand.» (Liste opprettet. Tittel er transkribert — kan være feilhørt.) |

---

## 3. Pusterom — hva koden faktisk gjør

### Sider
| Side | Innhold |
|---|---|
| **Hjem / Innsjekk** | Humør 1–5 som emoji (😔 😕 😐 🙂 😌), valgfri note, «Lagre sjekk-inn», knapp «Pust med meg». |
| **Pusterom** | Pustesirkel. Syklus: **inn 4 s → hold 2 s → ut 6 s** (12 s per runde, ca. 5 pust/min). Start/stopp. |
| **Små grep** | 7 faste handlinger, kan krysses av per dag: frisk luft 5 min, glass vann sakte, kjenn føttene i gulvet, skriv én takknemlighet, tre dype pust, telefonen bort 10 min, strekk armene. |
| **Historikk** | Siste 20 innsjekker med dato + emoji + note. Teller: «Du har tatt vare på deg selv N ganger denne uken.» |

### Lagring (localStorage)
| Nøkkel | Innhold |
|---|---|
| `checkins` | liste av `{date (ISO), mood "1"–"5", note}`, nyeste først |
| `doneActions` | `{ "<dato>": [indekser for gjorte grep] }` |

### Design
Lys, grønn-grå palett (`#f5f7f4` bakgrunn, `#a8c5b0` aksent, myk blå/beige/grønn), system-font, maks 440 px bredde, fast bunnmeny, avrundede kort (16 px).

---

## 4. Isolation Mirror — hva prototypen gjør

- Mørk palett (`#1a1f1c`), lenke tilbake til Pusterom.
- Input: kort tekst om isolasjonen + valgfritt bilde. Bildet vises via `URL.createObjectURL` — **lastes aldri opp**.
- «Generer» gir:
  1. **Privat protokoll (3 steg):** føttene i gulvet + 3 dype pust → skriv én sann setning → se på bildet i 20 sek (eller: ta ett bilde av noe ekte, for deg, ikke for andre).
  2. **Labben-prompt** (kopierbar), mal:

```
Grok-bot runtime. /lab. Klasse M.
PROBLEM: Isolasjon. <notat, maks 180 tegn>
BRUKER: én person, lokal, ingen sky
RAMMER: 48t, lokal-first, ingen marketplace, ingen app+sky
DNA: fototerapi + passiv mekanikk + 48t
LEVERANSE: ideer
Seed 7. Drepe minst 3. IRP på overlevende #1.
Skriv IDE ≤3 setninger på nynorsk. Stopp.
Ikke nytt OS.
```

Metoden «Labben» = idé-generator med harde rammer: generer 7, drep minst 3, gjør dypdykk (IRP) på den som overlever, svar kort, ikke bygg et nytt operativsystem.

---

## 5. Gapet mellom papir og kode (revisjon 06.10.2026)

| # | `HULL.md` sier | Status i `index.html` nå |
|---|---|---|
| 1 | `switchPage` brukte `event.currentTarget` → nav ble stående feil. Fikset. | **Ikke fikset.** Linje 303 bruker fortsatt `event.currentTarget`. «Pust med meg» bytter side, men bunnmenyen lyser fortsatt på Hjem. |
| 2 | La til «Alt blir på denne enheten». | **Finnes ikke** i appen. |
| 3 | Fjernet `alert()` når humør mangler. | **Ikke fikset.** Linje 279: `alert('Velg hvordan du har det først.')`. |
| 4 | Export: Historikk → «Ta historikken med deg» → `pusterom-historikk.txt`. | **Finnes ikke.** Ingen export-knapp. |
| 5 | Isolation Mirror åpnes fra bunnen av Pusterom. | **Ingen lenke** fra `index.html`. (Mirror lenker tilbake, men ikke omvendt.) Selve Mirror-filen *er* oppdatert. |

Andre funn:
- **Noten vises via `innerHTML`** i historikken — tekst med `<` eller HTML-kode tolkes som HTML. Lokalt og egen-skrevet, så lav risiko, men det er en bug.
- `doneActions` vokser for alltid (én nøkkel per dag, ryddes aldri).
- `user-scalable=no` blokkerer zoom — dårlig for tilgjengelighet.
- Historikk viser bare 20, men ukestelleren teller alle.
- Kopier-knappen i Mirror gir ingen bekreftelse og har ingen fallback om clipboard nektes.

**Fortsatt mangler (fra `HULL.md`, uendret):** PWA/ikon, iOS-hjemskjerm, dark mode, test på ekte iPhone.

---

## 6. Innspill og åpne tråder

- **«Bule og motstand»** (talenotat 04.10.2026, 02:43). Liste opprettet, innhold ukjent. Mulig feiltranskribering (f.eks. «Bølle», «Bule» som noe annet). Avklares: hva skal på lista, og hører den til Rolig-prosjektet eller noe annet?
- **«Rolig 2.0»** — nevnt i commit 14.08, aldri definert. Isolation Mirror er første byggestein.
- **Grok-bot / Labben** — eksternt verktøy, ikke i repoet. Det er her ideene til neste trinn skal genereres.

---

## 7. Research-spørsmål (for NotebookLM og videre graving)

**Pust**
1. Hva sier forskningen om langsom pust (~5–6 pust/min) og lengre utpust enn innpust for akutt stress? Er 4-2-6 et godt valg, eller bør vi tilby 4-7-8 / boks-pust / «fysiologisk sukk»?
2. Hvor lenge må en økt vare før den hjelper — bør appen ha en timer (f.eks. 1, 3, 5 min)?

**Humørsporing**
3. Hjelper selvregistrering av humør folk med nedstemthet, eller kan det forsterke grubling? Hva sier studier om «ecological momentary assessment»?
4. Er 1–5 emoji-skala god nok, eller trengs «energi» som egen akse?

**Isolasjon og fototerapi**
5. Hva er terapeutisk fotografi / fototerapi i praksis, og hva er evidensen for ensomhet?
6. Hva betyr «passiv mekanikk» for en ensom bruker — påminnelser uten krav? Hvor går grensen mot mas?

**Personvern og tillit**
7. Hvordan kommunisere lokal-first så det faktisk skaper trygghet? Hva gjør andre mental-helse-apper feil (datadeling, sporing)?
8. Hva er risikoen når localStorage slettes (Safari sletter data for sider som ikke brukes på 7 dager) — og er export nok?

**Sikkerhet**
9. Hva skal appen gjøre hvis noen skriver om selvskading i en note? Minimum: synlig lenke til Mental Helse hjelpetelefon (116 123) og 113.

**Produkt**
10. PWA på iPhone: hva kreves for hjemskjerm-ikon, offline og varig lagring?

---

## 8. Neste konkrete steg (prioritert)

1. **Gjør koden lik dokumentasjonen:** fiks `switchPage`, fjern `alert()`, legg inn «Alt blir på denne enheten», lag export-knapp, lenk til Isolation Mirror.
2. Escape noten i historikken (bruk `textContent`).
3. Legg inn hjelpelinje-lenke (116 123 / 113).
4. PWA-manifest + ikon → test på ekte iPhone.
5. Fyll «Bule og motstand»-lista eller dropp den.
6. Kjør Labben-prompten for Rolig 2.0 og ta inn overlevende idé #1 her.

---

## 9. Forslag til spørsmål å stille notatboka

- «Hva er forskjellen mellom det dokumentasjonen sier og det koden gjør?»
- «Lag en 2-minutters lydoppsummering av Rolig-prosjektet.»
- «Hvilke tre ting bør fikses før en fremmed får appen?»
- «Hva vet vi om Isolation Mirror, og hva er bare idé?»
- «Lag en studieplan for research-spørsmålene i seksjon 7.»

---

*Kilder brukt: `index.html`, `isolation-mirror.html`, `README.md`, `RUN.md`, `HULL.md`, git-historikk (5 commits), Xff-talenotater (1 notat). Ingenting fra Google Drive, e-post eller andre repoer — det var ikke tilgjengelig.*
