# prompts/

To styringsprompter for multiagent-runtime (OpenClaw, Hermes, Telegram-bot). Ikke del av Rolig-appen. Appen trenger dem ikke.

| Fil | Bruk når | Leverer |
|-----|----------|---------|
| `oppfinner-os.md` | Råproblem, oppfinnelse, patent-spor | 15 artefakter, 24t-loop |
| `vibe-code-factory.md` | App-idé, vil ha kode | 9 artefakter, 12t-sprint |

## Integrering

1. Lim prompten inn som systemprompt.
2. Koble verktøy: `search_web`, `memory_search`, `notion_mcp`, `telegram_bot_api`.
3. Opprett `STATE.md` i prosjektrot.
4. Kjør én loop. Les output. Stram inn.

## Endret fra originalen

- Fjernet løse kildehenvisninger `[18]` `[20]` inne i prompt #2. De pekte ingen steder og modellen vil prøve å sitere dem.
- «inspisere» → «inspiserer».
- La til én regel i #1: patentnumre skal ha kilde, ellers «ikke verifisert». Ellers dikter modellen opp patenter.
- La til én regel i #2: hemmeligheter aldri i frontend eller git.

## Det promptene ikke gjør

- **Parallell kjøring og timeplan er ønsketenkning.** En prompt starter ingen agenter. «12 agenter, parallell» og «08:00–14:00» skjer bare hvis runtimen din faktisk spawner én agent per rolle og har en scheduler. Ellers spiller én modell 12 roller i én samtale, på minutter, ikke timer.
- **Patent-notat er ikke frihet-til-å-operere.** Utløpt patent kan ha nyere søsterpatenter. Sjekk Espacenet / Patentstyret før du bygger.
- **#1 forbyr AI-forretningsidéer. #2 sitt eksempel er en AI-app.** Bevisst? Bestem deg.
- **«Kopier kodebase rett til Vercel»** forutsetter at testene faktisk kjøres. Modellen kan påstå grønn suite uten å ha kjørt noe. Krev logg.
