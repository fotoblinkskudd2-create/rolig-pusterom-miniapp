# Årsplan: 365 agentoppdrag

Ett produksjonsår, ÅR-001 til ÅR-365. Startdato er et forslag (man 2. nov 2026) og kan flyttes.
Filene starter ingen kjøring, bot, publisering eller kjøp.

| Fil | Innhold |
|---|---|
| `masterprompt.md` | Styringsinstruks for orkestratoren: delegering, kontroll, godkjenningsporter, konfidensialitet, kostnadstak, tilstand. |
| `aarsplan-365.json` | Alle 365 oppdrag som data, med full kopierbar arbeidsordre i feltet `agentarbeidsordre`. |
| `aarsplan-365.xlsx` | Oppgaveregister (status, kostnad, artefakter), arket **Dag** (skriv oppgavenummer i B2), **Oversikt**, **Roller**, **Skills**. |
| `aarsplan-365.docx` | Hele planen som dokument (~190 sider). |
| `plan_data.py` / `generate.py` | Kildedata og generator. Endre `plan_data.py`, kjør `python3 arsplan/generate.py`. |

Roller: 14. Skills: 30. Maks 2 reparasjonsrunder før «Blokkert». 57 oppdrag er konfidensielle (oppfinnelsessporet), 17 har godkjenningsport.

Start: les `masterprompt.md`, kjør ÅR-001.
