---
name: demorunde
description: Kjør en 40-minutters tverrfaglig demorunde med koordinator, teknologi, psykologi og mediekunnskap (med subagenter) for å løse et samfunnsproblem. Bruk når brukeren sier «demorunde», «kjør agentene» eller vil løse et problem med teknologi + psykologi + medier.
---

# Demorunde

Argument: problemet (standard: konspirasjonsteorier).

1. Les `.claude/agents/koordinator.md`. Følg tidslinjen der.
2. Start `teknologi`, `psykologi` og `mediekunnskap` **parallelt** med samme brief:
   problem, målgruppe, rammer (lokal-first, telefon, ingen konto, ingen sensur), og «maks 5 tiltak i tabellformat».
3. Når alle tre har svart: koordinator dreper minst 3 tiltak og velger ett bygg.
4. Skriv `demorunde/DEMORUNDE-<neste nr>.md` (mal: `demorunde/DEMORUNDE-01.md`).
5. Bygg det valgte tiltaket hvis det passer i repoet. Ellers: skriv byggeordre.

Skills fagagentene skal bruke: `prebunk`, `sift`, `samtale`.
