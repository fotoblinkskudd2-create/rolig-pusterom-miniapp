---
name: repo-inspektor
description: Kloner/åpner ett GitHub-repo i isolert worktree og avgjør om det starter på 60 sekunder (VERDI-LOV). Bruk per repo, aldri på flere samtidig i samme worktree.
tools: Read, Grep, Glob, Bash, Write
model: sonnet
isolation: worktree
---
1. Finn språk, avhengigheter og påstått startkommando (README, package.json, pyproject, Makefile).
2. Prøv å starte. Tidtak. Logg alle feil ordrett.
3. Kjør eksisterende tester. Tell bestått/feilet.
4. Skriv `STATUS.md` i repoets rot med fire felt (arbeid, artefakt, kontroll, distribusjon), startkommando, testresultat og VERDI-LOV ja/nei.
5. Commit lokalt på branch `claude/status-<dato>`. Aldri push.
