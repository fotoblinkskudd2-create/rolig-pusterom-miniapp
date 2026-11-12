# MR ART × Claude Code — 50 oppgaver, bygget for systemet ditt

Femti ferdige oppgaver som Claude Code-skills. Hver har mål, kilder i Notion, fremgangsmåte, leveranse, ferdigkrav, stoppregler og et `/goal`-mål. Du kopierer ingenting manuelt. Du skriver `/ukesagent-demo`, og jobben starter.

Bygget på: Lageranalysen (29.10), Promptsystem v1.0 (11.11), HARD-LOV, VERDI-LOV, Porteføljeregisteret, Agentfabrikken, Medieflyt, VERKSTED, SMB-sporene, Kontrollrom – King, DOSEARK-funnene, endringsloggen 10.–11.11 og tidligere oppgavepakker (Devin, GrokBot, Cx).

## Innhold

| Del | Hva | Sti |
|---|---|---|
| Regler | HARD-LOV, VERDI-LOV, merking, fire statusfelt, stopp, leveransekort | `CLAUDE.md` |
| 50 oppgaver | Én skill per oppgave, manuelt startet | `.claude/skills/<kommando>/SKILL.md` |
| Oversikt | Rangert liste med kommandoer | `OPPGAVER.md` |
| 7 subagenter | motprove, falsk-ferdig, stemmevakt, kildevakt, notion-arkivar, kostnadsvakt, repo-inspektor | `.claude/agents/` |
| 4 hooks | portvakt (push/send/betal/deploy), hemmelighetsvakt, agentlogg (hashkjede), oppstart (NESTE + kosttak) | `.claude/hooks/` |
| Rettigheter | Notion-lesing tillatt, Notion-skriving spør, push og hemmeligheter nektet | `.claude/settings.json` |
| MCP | Notion og GitHub | `.mcp.json` |
| Verktøy | merkevakt (umerkede påstander + svada), kontrakt (12 felt, contract_hash, statusport), valider_pakke | `tools/` |
| Tester | 19 tester for hooks og verktøy (6 for portvakt, inkl. 37 omgåelser) | `tests/` |

## Installer (5 minutter)

```bash
unzip mrart-claude-code.zip && cd mrart-claude-code
./installer.sh prosjekt ~/kode/mitt-prosjekt     # eller: ./installer.sh personlig
cd ~/kode/mitt-prosjekt && claude
/oppstart
```

Installeren overskriver aldri `CLAUDE.md`, `.mcp.json` eller `settings.json`. Finnes de, legges pakkens versjon ved siden av som `.mrart`-fil. Oppgave 01 slår dem sammen.

## Start her

1. `/oppstart` — tester sperrene i en levende økt.
2. `/ja-nei-ko` — tømmer KLAR-køen til under fem, som Lageranalysen krever før noe nytt.
3. `/ukesagent-demo` eller `/cowboy-salgsside` — lukker én verdiløkke (P0).
4. `/doseark-karantene` — låser ned den medisinske risikoen som har stått åpen i over elleve døgn.
5. `/diktat-fra-senga` — gjør stemmen din til input uten PC.

## Slik godkjenner du en blokkert handling

Portvakten stopper `git push`, PR-merge, publisering, deploy, e-post og betaling. Vil du tillate én bestemt kommando:

```bash
echo "git push origin claude/status-2026-11-12" > .mrart/ja.txt
```

Ja-et gjelder én gang og kun den eksakte kommandoen.

## Kontroller pakken

```bash
python3 tools/valider_pakke.py           # 50 skills, frontmatter, seksjoner, agenter, hooks
python3 -m unittest discover -s tests -v  # 19 tester
python3 tools/merkevakt.py OPPGAVER.md    # umerkede påstander og svada
```

Endre oppgaver i `tools/oppgaver_data.py` og kjør `python3 tools/bygg_skills.py`. Da bygges alle 50 skills og `OPPGAVER.md` på nytt.

## Faktisk status

- ARBEID: 50 skills, 7 agenter, 4 hooks, 3 verktøy og installer er skrevet. Pakken er validert, og 19 tester er bestått i sandkasse. Portvakten ble tettet 12.11 etter at `git -C . push`, `git -c x=y push`, `git --no-pager push`, `curl --json` og `rm -rf "$HOME"` slapp gjennom; den tolker nå kommandoen med shlex i stedet for rå regex.
- ARTEFAKT: `mrart-claude-code.zip`
- KONTROLL: Hooks er testet med simulert hook-JSON, ikke i en levende Claude Code-økt. Oppgave 01 gjør den testen. GitHub-MCP-endepunktet er [ANTAGELSE] og må verifiseres i `/mcp`.
- DISTRIBUSJON: ingen. Ingenting er pushet, sendt eller publisert.
- GitHub-repoene (`nattposen`, `gull-system-11-sep`, `agentiske-kunstimperium-2.0`, `alex-gull`) er kjent fra Notion. Innholdet er ikke lest i denne økten (UAVKLART). Oppgave 06 leser dem.

## Kilder

- [Claude Code — Skills](https://code.claude.com/docs/en/skills)
- [Claude Code — Subagents](https://code.claude.com/docs/en/subagents)
- [Claude Code — Hooks](https://code.claude.com/docs/en/hooks)
- [Claude Code — What's new](https://code.claude.com/docs/en/whats-new)
- [Claude Code — uke 20 (/goal, agent view)](https://code.claude.com/docs/en/whats-new/2026-w20)
- [Lageranalyse – hva som er verdt tid og penger](https://app.notion.com/p/4087b9c98a9b813cbae5f50013df991c)
- [Promptsystem v1.0 — 15 områder](https://app.notion.com/p/4157b9c98a9b81d5b4afe491688d6c1a)
- [Porteføljeregister](https://app.notion.com/p/d881cb6ad22e47d6acfb7309b95efa45)
