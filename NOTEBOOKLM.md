# NotebookLM i terminalen (Claude Code)

Verktøy: [`notebooklm-py`](https://github.com/teng-lin/notebooklm-py), et uoffisielt CLI som lar Claude Code lese og styre NotebookLM.

## På egen maskin (anbefalt)

```bash
uv tool install "notebooklm-py[browser]"   # eller: pipx install "notebooklm-py[browser]"
notebooklm login                           # åpner Chromium → logg inn med Google
notebooklm auth check --test --json        # krever "status": "ok" og "token_fetch": true
notebooklm skill install                   # legger skillen i ~/.claude/skills/notebooklm
```

Deretter kan du be Claude Code om ting som:

- «List notatbøkene mine i NotebookLM»
- «Oppsummer notatboka X»
- `notebooklm generate infographic --orientation portrait`, og så laste den ned lokalt

## I en Claude Code-skysesjon (ingen nettleser)

Skycontaineren kan ikke åpne et Google-innloggingsvindu. Gjør innloggingen lokalt først, og gi så sesjonen innholdet i
`~/.notebooklm/profiles/default/storage_state.json` som miljøvariabelen `NOTEBOOKLM_AUTH_JSON`
(som secret i miljøinnstillingene).

> ⚠️ `storage_state.json` er Google-sesjonscookiene dine, altså full tilgang til kontoen.
> **Den skal aldri committes i dette repoet.** Bruk den bare som secret, og logg ut / slett profilen hvis den lekker.
