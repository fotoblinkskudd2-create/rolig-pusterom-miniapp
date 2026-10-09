# The Eight Gates — AI patent-discovery commercial

Production package for a 60-second spot (plus a 30-second visual trailer) for an AI company built around eight innovation "gates".

| Step | Tool | File | Status |
|------|------|------|--------|
| 1. Creative research | Perplexity Deep Research | [`BRIEF.md`](BRIEF.md) | Written from desk knowledge. **Run the Perplexity prompt to verify the competitor claims before the client sees them.** |
| 2. Script | ChatGPT | [`SCRIPT.md`](SCRIPT.md) | Final 60s script, locked VO |
| 3. Key visual | Midjourney | [`PROMPTS.md#3`](PROMPTS.md#3-key-visual--midjourney) | Prompt ready to paste |
| 4. Trailer animation | Veo | [`PROMPTS.md#4`](PROMPTS.md#4-trailer--veo) | Split into 4 chained 8s shots |
| 5. Voiceover | ElevenLabs | [`PROMPTS.md#5`](PROMPTS.md#5-voiceover--elevenlabs) | Exact VO lines + voice settings |
| 6. Score | Suno | [`PROMPTS.md#6`](PROMPTS.md#6-score--suno) | Prompt with timing cues |
| Animatic | Browser | [`animatic.html`](animatic.html) | 60s timed storyboard with VO captions and a browser temp VO |

## The eight gates

The original brief names six gates but sells "eight". An ad that promises eight and shows six reads as a mistake, so gates 7 and 8 have been given real jobs:

1. **Art**: sketches what doesn't exist yet
2. **Images**: renders the variations
3. **Video**: puts the idea in motion and finds where it breaks
4. **Writing**: turns sparks into precise language
5. **Vibe Coding**: builds working prototypes
6. **Idea Hunting**: finds the gaps nobody has claimed
7. **Prior Art**: checks the idea against the world's patent record *(new)*
8. **Claims**: drafts the claim language that defines ownership *(new)*

Gates 7 and 8 sit at the two ends of the arc, as the "abstract energy gates" in the key visual. Together they close the loop from *idea* to *patentable invention*. If the client wants them kept abstract, swap lines 0:34–0:40 of the script for the alternate given in `SCRIPT.md`.

## Final assembly (in your NLE / Descript)

1. Lay the Suno score on A1 and the ElevenLabs VO on A2. Duck the music by 6–8 dB under the VO.
2. The Veo trailer is 30s. It covers 0:10–0:40 of the spot (the gate montage). Fill 0:00–0:10 with the Midjourney still on a slow push-in from black, and 0:40–1:00 with the climax shot extended plus the end card.
3. Line the brass swell (≈0:48–0:50) up with the frame where the eight beams merge.
4. Burn in the on-screen text from `SCRIPT.md`.
