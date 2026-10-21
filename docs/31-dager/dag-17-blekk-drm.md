# Dag 17 — Skriverblekk med DRM-chip: skriveren som jobber for noen andre

> Jeg trenger å skrive ut én side. Ett skjema til NAV. Skriveren sier «Patron ikke gjenkjent». Det er blekk i den. Det er *blekk i den*. Men det er fra feil fabrikk, og en fastvareoppdatering jeg aldri ba om har bestemt at min skriver ikke skal tjene meg lenger. Jeg eier maskinen. Maskinen eier ikke meg. Eller?

## Hva det er
Blekkpatroner med mikrobrikke som skriveren autentiserer. Fastvareoppdateringer kan blokkere tredjeparts- eller påfylte patroner.

## Sporet
| Felt | Verdi |
|---|---|
| Hendelse | HP «Dynamic Security», september 2016 – fastvare som blokkerte tredjepartspatroner |
| Bot | Italias konkurransemyndighet (AGCM) bøtela HP 10 mill. EUR (2020) for urimelig handelspraksis knyttet til dette |
| Søksmål | Flere gruppesøksmål i USA (bl.a. forlik og nye søksmål 2020–2024) *(verifiser enkeltsaker)* |
| Patentspor | CPC `B41J 2/175` (blekkforsyning) + «cartridge authentication chip» – tusenvis av patenter |
| Rett til å reparere | EUs direktiv om rett til reparasjon (2024) – sjekk om skrivere er omfattet |

## Hvorfor det er dårlig
1. **Du eier maskinen, men ikke funksjonen.**
2. **Kunstig høy blekkpris** – modellen er billig skriver, dyrt blekk.
3. **Patroner kastes med blekk igjen** («tom» etter sidetelling, ikke faktisk nivå).
4. **E-avfall** – skrivere byttes ut fordi patroner koster mer enn ny skriver.

## Rotårsaken
Forretningsmodellen «barberhøvel og blad». Teknologi brukes til å håndheve den mot brukeren.

## Tre nye løsninger
1. **Blekktank-skriver** med åpen påfylling (finnes – EcoTank-type) – gjør den reparerbar og standardisert.
2. **Åpen patronstandard** på tvers av merker.
3. **Kjøp utskriftstjeneste uten maskin** – bibliotek/print-butikk for de som skriver lite.

## Konsept: **ÅPEN** – reparerbar skriver med standard tanker
| Spesifikasjon | Verdi |
|---|---|
| Blekk | 4 tanker à 70 ml, påfylling fra hvilken som helst flaske med standard nippel |
| Skrivehode | Utskiftbart av bruker, 4 skruer, standard dimensjon |
| Fastvare | Åpen kildekode; ingen oppdatering kan blokkere forbruksmateriell |
| Nivåmåling | Optisk, faktisk blekknivå (ikke sideteller) |
| Reservedeler | Publisert deleliste + 3D-filer for plastdeler |
| Levetid | Designet for 10 år / 50 000 sider |

## Konseptbilde-prompt
```
Printer industrial design concept, repairable inkjet printer with four transparent refillable ink tanks on the front, visible screws, swappable print head shown half removed, exploded technical view with labeled spare parts, open-source badge, utilitarian light grey and signal yellow, honest engineering aesthetic
```

## Dagens oppgave
- [ ] Finn AGCMs pressemelding om HP-boten. Skriv ned hva de konkluderte med.
- [ ] Regn ut literprisen på blekk i en vanlig patron.
- [ ] Les EU-direktivet om rett til reparasjon – står skrivere på listen?

**Grav videre:** Søk «printer cartridge authentication» på Google Patents, sorter etter HP/Canon/Epson.
