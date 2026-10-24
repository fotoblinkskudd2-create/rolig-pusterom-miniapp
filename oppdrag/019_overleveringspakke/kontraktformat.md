# Kontraktformat (`leveranse.json`)

| Felt | Type | Betydning |
|---|---|---|
| `navn`, `versjon` | tekst | Brukes i pakkenavnet `<navn>_<versjon>.zip` |
| `pakrevde_filer[]` | `{monster, beskrivelse, obligatorisk=true}` | Glob-mønster relativt til prosjektroten. Mangler et obligatorisk mønster, blokkeres godkjenningen |
| `oppstart[]` | tekst | Oppstartskommandoer. Dokumenteres i rapport og manifest, men kjøres ikke |
| `kontroller[]` | `{navn, kommando, forventet_exit=0, timeout_sek=60}` | Kjøres bare med `--kjor-kontroller`. Godkjenning krever at alle er kjørt og bestått |
| `kjente_mangler[]` | tekst | Tas med i manifestet |
| `neste_vedlikehold` | tekst | Neste vedlikeholdshandling |
| `utelat[]` | glob | Filer som holdes utenfor pakken. `.git`, `.env`, `*.pyc` og `*.zip` utelates alltid |
