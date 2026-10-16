# 5. FEM LIVREDDENDE OPPFINNELSER MED PATENTPOTENSIAL
### Offentlig versjon — teknisk kjerne holdt tilbake

> Jeg sto på en islagt innsjø i Østerdalen en gang, fjorten år og dum, og hørte isen synge. *Piuu-piuu*, som laservåpen i en billig sci-fi-film. Morfar sa: «Hører du den? Det betyr at den lever. Det betyr ikke at den holder.»
> Han hadde rett. Og han hadde feil.

---

## ⚠️ Hvorfor denne filen er sensurert

Dette repoet er **offentlig**. I europeisk patentrett gjelder et **absolutt nyhetskrav [F]**: Alt som er gjort tilgjengelig for allmennheten før søknaden leveres — også en Markdown-fil på GitHub — kan gjøre en oppfinnelse upatenterbar.

Derfor står bare **problem, verdi, marked og testprinsipper** her. Selve løsningsmetodene, de fysiske innretningene og patentkravsutkastene ligger i en **fortrolig fullversjon** som ikke er publisert. Den skal ikke legges i et offentlig repo før du har:
1. gjort et nyhetssøk (Espacenet, Google Patents, Patentstyret),
2. snakket med en patentrådgiver (under taushetsplikt), og
3. eventuelt levert en norsk søknad, som gir prioritetsdato. Internasjonal PCT-søknad må da leveres innen 12 måneder **[F]**.

*Vurder å gjøre repoet privat hvis du vil samle alt på ett sted.*

---

| # | Oppfinnelse | Redder fra | Det brukeren har fra før | Prototype-kost |
|---|---|---|---|---|
| 5.1 | **Isrøsten** | Drukning gjennom is | En mobiltelefon | ~0–500 kr |
| 5.2 | **Kapillær** | Oversett sepsis og alvorlig sykdom hos barn | En mobiltelefon | ~1 000–3 000 kr |
| 5.3 | **Skredlyd** | Snøskred | En skredsøkerstang | ~1 000–2 000 kr |
| 5.4 | **Dosevakt** | Feildosering av flytende medisin til barn | En mobil og en medisinsprøyte | ~500 kr |
| 5.5 | **Livstegn** | Eldre som blir liggende alene | Strømmålerens HAN-port | ~300–600 kr |

---

## 5.1 ISRØSTEN — istykkelse fra lyd

**Problemet [F]:** WHO anslo rundt 300 000 drukningsdødsfall globalt i 2021 (Global status report on drowning prevention, 2024). I Norden, Canada, Russland og USA går mennesker gjennom isen hvert år. Dagens alternativer er isbor (krever stopp og innsats), erfaringsbasert lytting med isstav eller dyr georadar. De fleste gjør ingenting.

**Kjent fysikk [F]:** Bøyningsbølger i flytende is er dispersive. Det er derfor isen «synger» med fallende tone, og hvordan tonen faller avhenger blant annet av tykkelsen.

**Konseptet:** En mobilapp, eventuelt med et billig tilbehør, som estimerer istykkelse fra lyden av et slag mot isen. Den viser alltid et usikkerhetsintervall og sier **aldri** «trygt». *Metode: fortrolig.*

**Hvor AI brukes:** Signalseparasjon (is, luft, vind), inversjon med usikkerhet, klassifisering av istype (klarbis/kvitis), og kalibrering fra brukerinnsamlede borehullsmålinger.

**Hovedrisiko [A]:** Isens elastisitet varierer, og det gir stor usikkerhet i tykkelsesestimatet. Det må løses eller kommuniseres ærlig.

**Forsvarlig testing:** Først på analoge modeller i kontrollert miljø, deretter bare på is som er kjent tykk nok, med redningsutstyr, ispigger, line og følge. Brukerforståelse av usikkerhet testes like grundig som selve målingen.

**Marked:** Friluftsliv i hele den nordlige halvkule, isfiske, skøyteklubber, kommuner og redningstjenester.

---

## 5.2 KAPILLÆR — objektiv vurdering av sykt barn

**Problemet [F]:** Sepsis anslås å ha forårsaket rundt 11 millioner dødsfall globalt i 2017 (Rudd mfl., *The Lancet*, 2020). Kapillærfylningstid (CRT) inngår i kliniske vurderingsverktøy som NICEs «traffic light»-system, men er upålitelig når den gjøres manuelt. Foreldre vet ikke når de skal reise til legevakten.

**Konseptet:** Mobilbasert, standardisert måling av CRT og pustefrekvens, kombinert med et strukturert spørreskjema basert på etablerte faresignaler. Resultatet er et råd: ring 113, ring legevakt 116 117, eller følg med. *Innretning og metode: fortrolig.*

**Regulatorisk [F]:** Dette er medisinsk utstyr etter EUs MDR, sannsynligvis klasse IIa eller høyere. Det krever klinisk partner og klinisk evaluering.

**Testing:** Først på friske voksne frivillige, sammenlignet med erfarne sykepleiere, før kliniske studier.

---

## 5.3 SKREDLYD — svake lag i snøpakken

**Problemet [F]:** Flakskred løsner ofte på dype, svake lag. Det tar 30–60 minutter og krever kompetanse å finne dem med en manuell snøprofil. Elektroniske penetrometre har vært dyre eller er tatt av markedet.

**Konseptet:** Et rimelig tilbehør til utstyr toppturfolk allerede bærer, som gir rask informasjon om lagdeling — med usikkerhet — og som kan dele anonymiserte observasjoner med regObs. *Teknisk løsning: fortrolig.*

**Forsvarlig bruk:** Gir informasjon, aldri «grønt lys». Skredulykker skyldes ofte menneskelige faktorer (McCammon 2004, «heuristic traps» **[F]**).

**Testing:** Sammenlignes med manuelle snøprofiler gravd av erfarne observatører.

---

## 5.4 DOSEVAKT — riktig dose, også klokka tre om natta

**Problemet [F]:** I en randomisert studie (Yin mfl., *Pediatrics*, 2016) gjorde over 80 % av foreldrene minst én målefeil da de skulle dosere flytende medisin, og en betydelig andel gjorde store feil.

**Konseptet:** Mobilkameraet verifiserer at sprøyta er fylt med det volumet pakningsvedlegget angir for barnets vekt, og fører en doseringslogg slik at to voksne ikke gir samme dose. *Innretning og metode: fortrolig.*

**Regulatorisk [F]:** Sannsynligvis medisinsk utstyr under MDR. En mulig vei inn er partnerskap med en legemiddelprodusent.

**Testing:** Med vann og fargestoff mot vekt, og brukbarhetstest i simulert nattsituasjon. Aldri med ekte medisin.

---

## 5.5 LIVSTEGN — strømmåleren som trygghetsalarm

*Den svakeste patentkandidaten. Verdien ligger i norsk utrulling og tillit, så den er beskrevet mer åpent.*

**Problemet [F]:** Mange eldre bor alene, og lang liggetid etter fall gir alvorlige komplikasjoner. Trygghetsalarmer krever at man bærer dem og klarer å trykke.

**Konseptet:** Alle norske AMS-målere har HAN-port med sanntids strømdata **[F]**. En liten leser lærer døgnrytmen lokalt (vannkoker, dusj, komfyr) og varsler pårørende når *forventet* aktivitet uteblir: «Mamma har ikke laget kaffe i dag. Normalt skjer det mellom 07:00 og 08:30.» Den varsler også ved uvanlig aktivitet, for eksempel komfyr på klokka 03. All modellering skjer lokalt, og bare varsler sendes ut.

**Prior art [A]:** Det finnes beslektede løsninger (for eksempel britiske Howz; verifiser) og akademisk litteratur om NILM i eldreomsorg.

**Testing:** Pilot med frivillige familier og en kommune, *parallelt* med eksisterende trygghetsalarm.

---

## Finansiering (felles)
Innovasjon Norge (oppstartsmidler), Forskningsrådet (innovasjonsprosjekter) og SkatteFUNN (skattefradrag for FoU) **[F]**.
