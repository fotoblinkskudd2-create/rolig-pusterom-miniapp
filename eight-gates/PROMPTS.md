# Tool prompts — ready to paste

Script context for every tool lives in [`SCRIPT.md`](SCRIPT.md).

## Gate color key (use everywhere)

| # | Gate | Color | Icon |
|---|------|-------|------|
| 1 | Art | magenta `#ff3fa4` | paintbrush |
| 2 | Images | violet `#9b6bff` | camera lens / iris |
| 3 | Video | red-orange `#ff6a3d` | film reel |
| 4 | Writing | warm white `#fff1d6` | quill |
| 5 | Vibe Coding | green `#3dffa0` | code streams |
| 6 | Idea Hunting | amber `#ffb52e` | lightbulb + magnifier |
| 7 | Prior Art | cyan `#2ee6ff` | stacked archive sheets |
| 8 | Claims | gold `#e8c25a` | seal / signature line |

---

## 3. Key visual — Midjourney

Use `--v 7` if it's available on the account (the original `--v 6` works too). Generate 4 options, upscale the most symmetrical, and keep the center of the hall empty, because the patent seal lands there in the Veo shot.

```
cinematic key visual, a vast futuristic cathedral-scale hall, eight monumental glowing portal gates arranged in a sweeping symmetrical arc, each gate radiating a different colored light with faint holographic iconography: magenta gate with a paintbrush, violet gate with a camera lens iris, red-orange gate with a film reel, warm white gate with a quill pen, green gate with flowing code streams, amber gate with a lightbulb and magnifying glass, and at the two ends of the arc a cyan gate of stacked archive sheets and a gold gate with an embossed seal, polished black reflective floor, empty glowing focal point at the center of the arc, dark atmosphere, dramatic volumetric god rays, haze, neon cyan and gold accents, hyper-detailed sci-fi concept art, futuristic innovation lab meets patent vault, ultra-wide cinematic composition, visionary inventive high-tech mood, 8k render --ar 16:9 --v 7 --style raw --s 250
```

Negative / `--no`: `text, letters, logos, people, robots, brains, binary code rain`

---

## 4. Trailer — Veo

Veo produces clips of about 8s, so the 30s trailer is built as **4 chained shots**. Use the last frame of each shot as the start frame of the next. Start shot A from the Midjourney key visual.

Global suffix on every shot:
```
smooth cinematic slow dolly-in with subtle parallax, 24fps film look, anamorphic lens, volumetric haze, dark hall with neon cyan and gold accents, rising tension, no text, no people
```

**Shot A (0–8s): entry, gates 1–2**
```
Starting from this image, the camera glides slowly forward into the hall of eight glowing gates. As it passes the magenta gate, it pulses brighter and a holographic paintbrush paints a glowing stroke in mid-air. Then the violet gate pulses and a camera iris snaps open, flashing a rapid cascade of images.
```

**Shot B (8–16s): gates 3–4**
```
Continuing forward, the red-orange gate pulses and film frames stream through it like a spinning reel. Then the warm white gate pulses and a holographic quill writes lines of glowing text that settle into place.
```

**Shot C (16–24s): gates 5–6, ends of the arc**
```
Continuing forward, the green gate pulses and luminous code streams pour down like a waterfall, assembling a small glowing prototype. The amber gate pulses, a magnifying glass sweeps across darkness and a lightbulb flickers on. At the far ends of the arc the cyan and gold gates begin to hum with light.
```

**Shot D (24–30s): ignition and seal**
```
The camera stops at the center. All eight gates ignite simultaneously in their colors, and their light streams inward and merges into a single brilliant beam. The beam condenses into a glowing gold embossed patent seal hovering at the center of the frame, with light rippling outward across the reflective floor. Triumphant climax, then stillness.
```

---

## 5. Voiceover — ElevenLabs

**Voice:** confident, warm male, mid-30s to 40s, neutral American or transatlantic English. Shortlist from the Voice Library with "narration / documentary / trailer" filters.

**Settings (v2/v3 multilingual):** Stability 45–55 % · Similarity 75 % · Style 20–30 % · Speaker boost on · Output 48 kHz WAV.

**Direction note:** Slightly futuristic, inspiring, clear enunciation, moderate-fast. Leave a natural half-second pause after each gate line. Land "yours" and "patents" warmly instead of punching them.

**Text (paste exactly, the `...` gives the pauses):**
```
Every great invention already exists. ... It's just hiding.
So we built eight gates to find them.
Art sketches what doesn't exist yet.
Images render a thousand versions before lunch.
Video puts it in motion and finds where it breaks.
Writing turns sparks into exact language.
Vibe Coding builds the prototype at the speed of a hunch.
Idea Hunting tracks the gaps no one has claimed.
Prior Art checks the world's record. ... Claims draws the line that's yours.
Eight gates. One engine. ... Every discipline asking the same question: what hasn't been invented yet?
And when we find it, we make it yours.
Eight Gates. ... Where ideas become patents.
```

Target: 52–56s raw, leaving room for the music tail. If it runs long, generate the montage lines as separate clips and tighten the gaps in the edit; don't speed the voice up.

---

## 6. Score — Suno

Use instrumental mode. Suno sometimes returns 2+ minutes, so ask for the arc below and cut the edit around the 0:48 swell.

**Style field:**
```
cinematic orchestral electronic hybrid, corporate tech, uplifting, visionary, premium, rising synth arpeggios, soft strings, pulsing low synth, triumphant brass and synth swell, instrumental, no vocals
```

**Description / lyrics field (structure cues):**
```
[Intro - 0:00 - near silence, single sustained synth tone, sparse piano, 90 BPM feel]
[Build - 0:06 - soft strings enter, gentle pulse]
[Montage - 0:10 - rising synth arpeggio, a subtle new layer every 4 seconds, tempo pushing forward]
[Lift - 0:40 - percussion and low brass, tension building toward 120 BPM]
[Climax - 0:48 - triumphant brass and synth swell, full orchestra]
[Resolve - 0:55 - swell decays to a warm sustained chord, clean ending at 1:00]
[Instrumental]
```

Mix note for the editor: keep 1–4 kHz clear under the VO (a dynamic EQ dip or sidechain from the VO track).
