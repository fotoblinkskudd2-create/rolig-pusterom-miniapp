# SmarteMind – AI-Drevet Wellness Coach

En intelligent, minimal-input wellness-app som bruker AI-analyse for å generere personaliserte psykologisk-funderte interventjoner.

## 🧠 Hva er det?

SmarteMind er en omarbeidet versjon av Rolig som fokuserer på **intelligens før volum**. I stedet for mange statiske oppgaver, tar den **ett ord eller en kort frase** fra deg og bruker AI til å:

- 🎯 **Identifisere emosjonell tilstand** – Gjenkjenner 10+ følelser og tilstander
- 💡 **Generere kontekst-spesifikke innsikter** – Hvert møte får 3 skreddersydd interventjoner
- 📈 **Lære dine mønstre** – Bygger en AI-profil av deg basert på historikk
- 🔄 **Tilpasse seg** – Fremtidige møter blir smartere basert på tidligere data

## 📱 Fire Siden

### 🧠 Smart (Hjem)
- Skriv ett ord/tanke: "stresset", "glad", "ukonsentrert", osv.
- AI analyserer det
- 3 personaliserte interventjoner + anbefaling
- Lagre møtet

### 👤 Profil
- Mønstre dine: Hva har du følt og hvor ofte
- Streak: Hvor mange dager på rad du har brukt SmarteMind
- Læringsmodell: AI-profil som blir smartere med tid

### 📊 Historikk
- Alle møter dine (dato/tid + innspill)
- Ukentlig statistikk
- Gjennomsnittsmood
- Trender

## 🧬 AI-Analysen

Systemet gjenkjenner:
- **Stress** → Pusting, grunnfesting, mikro-handlinger
- **Angst** → Fragmentering, kategoriøvelser, bekymringsavtaler
- **Tristhet** → Selv-medfølelse, kontekst, tilkobling
- **Usikkerhet** → Evidens, akseptering, handling
- **Trøtthet** → Prioritering, basics, permisjon
- **Glede** → Markering, energi-capture, deling
- **Fokus** → Flow-vern, momentum, notater
- **Energi** → Kanalisering, aksjonerlister, kommunikasjon
- **Ro** → Preservering, lyd, stedsminne
- **Spredt tanker** → Notering, mono-fokus, ankring

Hver tilstand får **3 skreddersydd tips** — ikke generisk rådgivning, men psykologisk-basert microinterventions som virker umiddelbart.

## 🎯 Design-filosofi

**Input, mindre.** Brukeren sier ett ord. Systemet gjør resten.

**Smart før skala.** Bedre å ha 3 geniale tips enn 100 generiske.

**Læring over tid.** Jo mer du bruker det, jo bedre blir det.

**Open Claw/Herodes ready.** Arkitekturen er designet for AI-agent-integrasjon:
- `analyzeInput()` kan kalle Claude API for avansert NLU
- `generateInsights()` kan kalle Herodes for reasoning
- `renderProfile()` kan integrere med Open Claw for agent-drevet personalisering

## 💾 Lokalt Lagret

Alt lagres i localStorage. Ingen server, ingen cloud-avhengighet. Full kontroll over dine data.

## 🚀 Neste

- Claude API-integrasjon for dypere analyse
- Herodes AI-agent for kontekst-aware reasoning
- Codex-integrasjon for kode-baserte interventjoner (for utviklere)
- Export for Open Claw-agenter
