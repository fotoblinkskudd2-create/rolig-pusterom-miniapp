# 03 — Topp 15: briefs
Utvalg: effekt × byggbarhet. Minst 2 per kategori (Aldersomsorg 3, Bipolar 2, Ensomhet 3, Smerte & sorg 4, Økonomi 3).

---

## #1 Varsellys — Bipolar (idé 51)

*Dine egne varselsignaler, din egen kriseplan, som slår inn automatisk.*

**Problem.** Mennesker med bipolar lidelse kjenner ofte sine egne varselsignaler (sover 5 t, kjøper ting, snakker fort), men i en episode mister de innsikt akkurat når signalet trengs. Eksisterende apper (eMoods, Daylio) logger, men ingen handler når mønsteret slår ut.

**Løsning.** 30-sekunders daglig innsjekk (søvn, humør −3..+3, energi, medisin tatt). Brukeren definerer egne varselregler i stabil fase. Når en regel slår ut, viser appen den forhåndsavtalte planen og kan varsle en tillitsperson med kun grønn/gul/rød.

**MVP-funksjoner**
- Daglig innsjekk på 30 sek
- Personlig søvnbaseline (14 dager) + regelmotor
- Kriseplan skrevet av deg selv i stabil fase
- Tillitsperson-lenke som kun viser farge
- 90-dagers eksport til behandler

**Stack.** Node (ingen avhengigheter) + PWA + JSON-fil/SQLite

**Suksessmål.** ≥60 % 30-dagers retensjon; andel varsler brukeren merker som «riktig»; tid fra første signal til kontakt med behandler.

**Etikk og sikkerhet.** Ikke en diagnose eller behandling. Krisenummer (113, Legevakt 116 117, Mental Helse 116 123) alltid synlig. Tillitspersonen ser aldri rådata. Data eies av brukeren og kan slettes med ett klikk. Varsel til andre krever eksplisitt forhåndssamtykke, som kan trekkes.

---

## #2 Brevåpneren — Økonomi (idé 201)

*Ta bilde av inkassobrevet. Få klarspråk, frist og neste steg.*

**Problem.** Unnvikelse driver gebyrer: folk lar brev ligge av frykt, og purring blir inkasso, så betalingsanmerkning. 7,1 % hadde betalingsproblem i 2025 (SSB).

**Løsning.** Foto → OCR → LLM forklarer i klarspråk: hvem, hvor mye, hvilket stadium, frist, hva det koster å vente, og et ferdig svarbrev (betalingsutsettelse/innsigelse).

**MVP-funksjoner**
- Foto → strukturert sammendrag
- Stadium i inkassoprosessen
- Frist i kalender
- Ferdig svarbrev
- Lenke til NAV økonomirådgivning

**Stack.** Next.js + vision-LLM + Supabase (valgfri lagring)

**Suksessmål.** Andel brev med handling innen 7 dager; reduksjon i rapporterte gebyrer.

**Etikk og sikkerhet.** Ikke juridisk rådgivning – tydelig merket. Bilder lagres ikke som standard. Ingen kobling til långivere/reklame for lån.

---

## #3 Ringerunden — Aldersomsorg (idé 3)

*En vennlig stemme ringer hver morgen og forteller familien hvordan det går.*

**Problem.** Eldre alene går dager uten samtale; pårørende får ikke vite om gradvis forfall før noe skjer. Ingen skjerm å lære.

**Løsning.** Vanlig telefonsamtale hver morgen: AI-stemme spør om søvn, mat, smerter, planer. Familien får en kort sammendragslinje + avviksflagg.

**MVP-funksjoner**
- Planlagt daglig oppringing
- Samtale m/ fast spørsmålssett + småprat
- Sammendrag til familie via SMS
- Avviksflagg (ikke svart 2 dager, ny smerte)
- Eskalering til menneske

**Stack.** Twilio Voice + LLM + Node + SQLite

**Suksessmål.** Svarrate; pårørendes opplevde trygghet; tidlige oppdagelser.

**Etikk og sikkerhet.** Tydelig at det er en maskin. Samtykke fra den eldre selv. Aldri erstatning for besøk; designet for å utløse menneskelig kontakt. Samtaler slettes etter 30 dager.

---

## #4 Faste Fire — Ensomhet (idé 101)

*Fire mennesker. Samme kafé. Samme tid. Åtte uker.*

**Problem.** Engangsmøter (Meetup) bygger ikke vennskap; gjentatt eksponering gjør. 17–21 % av 13–29-åringer er ensomme (WHO 2025).

**Løsning.** Matcher fire personer på bydel + tidspunkt + én felles interesse. Fast ukentlig møte i 8 uker med samtalekort.

**MVP-funksjoner**
- Matching på sted/tid/interesse
- Fast kalenderinvitasjon
- Ukens samtalekort
- Erstatter ved frafall
- Avsluttende «fortsette?»-valg

**Stack.** PWA + Supabase + enkel matching-cron

**Suksessmål.** Andel grupper som fullfører 8 uker; andel som fortsetter frivillig.

**Etikk og sikkerhet.** Offentlige møteplasser. Verifisert telefon. Enkel rapportering/blokkering. Ordet «ensom» brukes ikke i markedsføring.

---

## #5 Pacing-pilot — Smerte & sorg (idé 151)

*Et energitak for i dag, regnet ut fra i går – slutt på boom-bust.*

**Problem.** Kroniske smertepasienter gjør for mye på gode dager og kollapser etterpå. Pacing virker, men er vanskelig å beregne selv.

**Løsning.** Logg smerte og aktivitet. Appen setter dagens aktivitetstak (minutter/poeng) og varsler når du nærmer deg.

**MVP-funksjoner**
- 3-trykk logg
- Dynamisk dagstak
- Varsel ved 80 % av tak
- Ukegraf
- Eksport til fysio

**Stack.** PWA + localStorage + enkel statistikk

**Suksessmål.** Redusert variasjon i smerte; færre kollaps-dager.

**Etikk og sikkerhet.** Ikke medisinsk råd; erstatter ikke behandler. Varselsignaler (ny smerte, nevrologiske symptomer) → kontakt lege.

---

## #6 Gjeldskartet — Økonomi (idé 202)

*All gjeld i ett bilde, og én dato når du er fri.*

**Problem.** Gjelden er spredt på kort, avbetaling og lån; folk vet ikke totalen eller rekkefølgen.

**Løsning.** Importer fra Gjeldsregisteret (fil) + manuelt. Viser snøball vs skred, og gjeldfri-dato.

**MVP-funksjoner**
- Import + manuell
- Snøball/skred-sammenligning
- Gjeldfri-dato
- Ekstra-krone-simulator
- Rådgiver-eksport

**Stack.** PWA + IndexedDB

**Suksessmål.** Reduksjon i total gjeld etter 6 mnd; retensjon.

**Etikk og sikkerhet.** Ingen lånereklame. All data lokalt.

---

## #7 Felles Mor — Aldersomsorg (idé 2)

*Én delt tidslinje for søsken, hjemmetjeneste og fastlege.*

**Problem.** Omsorgen for en forelder koordineres på SMS mellom søsken; ingen oversikt, skjev byrde, utbrenthet (>75 %).

**Løsning.** Felles logg, ukeplan («hvem gjør hva»), spørsmålsliste til lege.

**MVP-funksjoner**
- Delt logg
- Ukeplan
- Rettferdighetsmåler
- Legeliste
- Varsler

**Stack.** PWA + Supabase

**Suksessmål.** Opplevd byrdefordeling; antall aktive familiemedlemmer.

**Etikk og sikkerhet.** Den eldres samtykke og verdighet; helsedata kryptert; tilgangsnivåer.

---

## #8 Merkedagen — Smerte & sorg (idé 153)

*Merkedager kommer ikke uforberedt lenger.*

**Problem.** Dødsdager, bursdager og høytider treffer etterlatte hardt, og nettverket har glemt det.

**Løsning.** Registrer datoer. 7 dager før: plan for dagen. Venner du velger får påminnelse om å ta kontakt.

**MVP-funksjoner**
- Merkedagsregister
- Forberedelsesplan
- Venne-påminnelse
- Ritualforslag
- Etter-dagen-sjekk

**Stack.** PWA + e-post/SMS-cron

**Suksessmål.** Andel merkedager med kontakt fra nettverk.

**Etikk og sikkerhet.** Ved tegn på komplisert sorg eller selvmordstanker → kriselinje og lege.

---

## #9 Søvnvakt — Bipolar (idé 52)

*Klokka ser søvnfallet før du gjør det.*

**Problem.** Søvnreduksjon er et tidlig maniesignal, men oppleves ikke som et problem av personen selv.

**Løsning.** Leser søvndata fra wearables, varsler ved avvik fra personlig baseline.

**MVP-funksjoner**
- HealthKit/Fit-import
- Baseline
- Avviksvarsel
- Kobling til Varsellys

**Stack.** React Native + HealthKit

**Suksessmål.** Andel avvik som går foran episode.

**Etikk og sikkerhet.** Samme som Varsellys; ingen data ut av enheten uten samtykke.

---

## #10 Kjølebag — Økonomi (idé 203)

*48 timers ventetid på alt over 500 kr.*

**Problem.** Impulskjøp og avbetaling (Klarna) driver forbruksgjeld til 176 mrd.

**Løsning.** Nettleserutvidelse som legger inn en pause på kassen og en påminnelse om 48 t.

**MVP-funksjoner**
- Kassedeteksjon
- Ventetid
- Påminnelse
- Sparelogg

**Stack.** Browser extension + PWA

**Suksessmål.** Andel avbrutte kjøp; spart beløp.

**Etikk og sikkerhet.** Brukerstyrt; lett å slå av; ingen salg av handledata.

---

## #11 Smertebrevet — Smerte & sorg (idé 152)

*30 dagers logg blir til dokumentasjonen legen og NAV trenger.*

**Problem.** Smertepasienter bruker timer på å forklare seg, og dokumentasjonen mangler struktur.

**Løsning.** Daglig logg → LLM lager strukturert sammendrag med funksjonsnivå.

**MVP-funksjoner**
- Daglig logg
- Funksjonsskala
- Generert legebrev
- PDF

**Stack.** PWA + LLM + PDF

**Suksessmål.** Opplevd nytte hos lege; tidsbesparelse.

**Etikk og sikkerhet.** Brukeren redigerer før deling; ingen overdrivelse genereres.

---

## #12 Stuelys — Aldersomsorg (idé 1)

*Strømmåleren forteller når døgnrytmen endrer seg.*

**Problem.** Forfall skjer gradvis; kameraer er invaderende.

**Løsning.** Timesverdier fra strømmåler → læring av normal rytme → varsel ved avvik (ingen kaffetrakter kl 8).

**MVP-funksjoner**
- Elhub/Tibber-kobling
- Baseline
- Avviksvarsel
- Ukeoversikt

**Stack.** Node + Tibber API + SMS

**Suksessmål.** Treffsikkerhet; falske alarmer per måned.

**Etikk og sikkerhet.** Samtykke fra den eldre; ingen kamera; minimal data.

---

## #13 Kaffemaskinen — Ensomhet (idé 102)

*Ti minutter med en kollega du aldri hadde møtt.*

**Problem.** Hjemmekontor tar bort de svake båndene.

**Løsning.** Slack-bot parer tilfeldig på tvers av team ukentlig med et samtaletema.

**MVP-funksjoner**
- Ukentlig paring
- Tema
- Kalenderforslag
- Opt-out

**Stack.** Slack bolt + Node

**Suksessmål.** Gjennomførte samtaler; trivselsmåling.

**Etikk og sikkerhet.** Frivillig; ingen rapport til leder.

---

## #14 Etterlattlista — Smerte & sorg (idé 154)

*Alt det praktiske etter et dødsfall, i riktig rekkefølge.*

**Problem.** Skifte, kontoer og abonnementer kommer midt i sorgen.

**Løsning.** Interaktiv sjekkliste med frister og ferdige brev.

**MVP-funksjoner**
- Sjekkliste
- Frister
- Brevmaler
- Del med familie

**Stack.** Web + LLM

**Suksessmål.** Fullførte oppgaver; opplevd belastning.

**Etikk og sikkerhet.** Ikke juridisk råd; henvis til tingrett/advokat.

---

## #15 Øvingsprat — Ensomhet (idé 104)

*Øv på samtalen med AI, ta den med et menneske.*

**Problem.** Sosial angst stopper første kontakt.

**Løsning.** Stemme-rollespill av konkrete situasjoner, deretter et ekte mikrooppdrag.

**MVP-funksjoner**
- Scenarier
- Stemme-øving
- Tilbakemelding
- Ekte oppdrag

**Stack.** LLM voice + PWA

**Suksessmål.** Andel øvinger fulgt av ekte kontakt.

**Etikk og sikkerhet.** AI er bro, ikke erstatning; tidsbegrensning per dag; henvisning ved alvorlig angst.
