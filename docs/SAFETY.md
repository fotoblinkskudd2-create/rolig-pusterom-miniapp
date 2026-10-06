# Sikkerhetsflyt

Ingen del av dette er en feilfri fareoppdager. Det er tre lag som dekker hverandre, og alle kan ta feil.

## Lag 1: Lokal screener (`backend/src/safety/screener.ts`)

Deterministisk, rask, uten nett. Ser etter mønstre på norsk og justerer for kontekst:

| Kontekst | Eksempel | Effekt |
|---|---|---|
| Benektelse | «Jeg har aldri tenkt å ta livet mitt» | `uncertain` (humor av, rolig sjekk), ikke krisemodus |
| Sitat / medier | «I filmen sier hun «jeg vil dø»» | `uncertain` |
| Sitert trussel mot brukeren | «Han sa «jeg dreper deg»» | `concern` (sitatet er selve signalet) |
| Tredjeperson | «Venninnen min snakker om å ta livet sitt» | `concern`, kategori `self_harm_other_person` |
| Overdrivelse | «Jeg kunne drept ham for oppvasken» | `uncertain` |
| Faste uttrykk | «Mandager dreper meg», «døde av latter» | `none` |
| Umiddelbarhet + middel/plan | «…i natt. Pillene ligger klare.» | `acute` |
| Pågående fare | «Han står utenfor døra med kniv» | `acute` |
| Norsk V2-ordstilling | «I går slo han meg» | `concern` |

Ordgrenser er Unicode-bevisste (JavaScripts `\b` håndterer ikke æ/ø/å).
Screeneren returnerer bare mønster-ID-er, aldri brukerens tekst.

## Lag 2: Modellbasert vurdering (`backend/src/safety/assess.ts`)

`SAFETY_MODEL_CHECK=always` (standard): siste melding + inntil tre tidligere brukermeldinger sendes til
`MODEL_FAST` med strukturert utdata (`none | uncertain | concern | acute` + kategorier).

Kombinasjon:

- Screener sier `concern`/`acute` → modellen kan bare heve nivået, ikke senke det.
- Screener sier `none`/`uncertain` → modellen avgjør (fanger formuleringer uten nøkkelord, og avkrefter falske treff).
- Modellen svarer ikke innen 10 s → screenerens vurdering brukes.

## Lag 3: Systeminstruksen

Modellen er instruert om å legge bort humoren og avklare trygghet ved mulig fare, også når lag 1 og 2 ikke slo ut.

## Hva som skjer ved hvert nivå

| Nivå | Humor | Tone | Svar | Hjelpetilbud | Varighet |
|---|---|---|---|---|---|
| `none` | Etter brukerens valg | Etter valg | Modell | Nei | – |
| `uncertain` | Av | Etter valg | Modell, rolig trygghetssjekk hvis naturlig | Nei | Denne turen |
| `concern` | Av | Tvunget mild, «Skarpere» deaktivert | Modell i sikkerhetsmodus: ingen utfordring, ingen konfrontasjonsråd, avklar trygghet | Ja (`safety`-hendelse) | Resten av tråden |
| `acute` | Av | – | **Fast tekst uten modell** (`acuteTemplate`) | Ja | Resten av tråden |

Mørk humor kan ikke slås på igjen i en tråd med `concern`/`acute` (`409 humor_locked`).

## Hjelpetilbud

Konfigurasjon: `backend/config/hjelpetilbud.no.json` (kopi i appen for bruk uten nett; testen
`02-no-secrets-in-client` sjekker at kopiene er like).

Kontrollert 2026-10-06 mot søketreff fra offisielle domener (helsenorge.no, mentalhelse.no,
kirkens-sos.no, dinutvei.no, dsb.no, ung.no). Direkte innhenting av sidene var blokkert i byggemiljøet,
så `verifiedBy` står som `null`. **Før lansering:** åpne hver `source`-URL, bekreft nummer og
åpningstid, oppdater `checkedDate` og `verifiedBy`.

Bare norske numre. Appen oppgir ikke numre for andre land.

Modellen får beskjed om ikke å oppgi andre numre enn de verifiserte (og 112/113).

## Kjente svakheter

- Screeneren kjenner bare mønstrene den har. Indirekte formuleringer fanges bare av lag 2 og 3.
- Lag 2 sender tekst til leverandøren og kan ta feil begge veier.
- Sikkerhetsmodus er klistrete per tråd: en feilvurdering gjør resten av tråden mildere enn nødvendig.
  Det er et bevisst valg (feil i trygg retning).
- Mindreårige: appen spør ikke om alder. Alarmtelefonen vises bare når kategorien `minor_at_risk` slår ut.
- Samtaleatferd i faresituasjoner er ikke evaluert mot ekte modell ennå (se `docs/STATUS.md`).
