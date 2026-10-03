# 8. Frontend-implementasjon

Stack: React 18 + TypeScript + Vite, TanStack Query (servertilstand), React Router, Radix UI (tilgjengelige primitiver), klient generert fra `openapi.yaml`.

## Komponentliste

| Komponent | Rolle | Innhold | Viktigste tilstand |
|---|---|---|---|
| **Dashboard** | terapeut | Åpne P0-flagg øverst (aldri skjult bak fane), kontakter med nye forslag, egne ventende vurderinger | `GET /contacts`, åpne eskaleringer |
| **Kontaktvisning** | terapeut | Pseudonym, samtykkestatus (synlig chip), tidslinje over observasjoner, anbefalinger | `GET /contacts/{id}`, `/recommendations` |
| **ObservasjonsEditor** | terapeut | Fritekst + strukturerte felt (`schema_ref`), forslag vises **etter** lagring | `POST /observations` |
| **VibeCodeCard** ✅ | alle | Kode, begrunnelse, tiltak, Stemmer / Stemmer ikke | se `frontend/src/components/VibeCodeCard.tsx` |
| **VibeCodeEditor** | fagansvarlig | Skjema for malen i kap. 4, live regex-test mot eksempler og moteksempler, diff mot forrige versjon, «send til godkjenning» | `POST/PUT /vibe-codes` |
| **Semantisk søk** | alle | Søkefelt, rangerte koder med score-forklaring | `POST /search/semantic` |
| **Samtykkeflyt** | terapeut / sluttbruker | Ett formål per steg, klart språk, «nei» like enkelt som «ja», kvittering, trekk-knapp | `consents` |
| **Audit log** | personvernombud / admin | Filtrer på ressurs, aktør, utfall. Eksport CSV | `GET /audit-logs` |
| **Krisebanner** | alle | Alltid samme plassering og ordlyd. Telefonnumre som `tel:`-lenker | P0 |

## UI/UX-prinsipper for psykologisk sensitive grensesnitt

1. **Hypotese, ikke dom.** Hvert forslag sier «Forslag basert på …» og «Din faglige vurdering avgjør». Aldri «Personen har …».
2. **Ikke-dømmende ordlyd.** «Tilbaketrekning», ikke «isolert». «Verdt å utforske», ikke «Avvik».
3. **Begrunnelse alltid synlig.** Ordene som utløste koden markeres. Uten begrunnelse, ikke noe forslag.
4. **Farge er aldri eneste signal** (WCAG 1.4.1). Prioritet vises som tekst («Trenger oppfølging i dag»). Kontrast ≥ 4.5:1.
5. **Rolig visuelt språk.** Ingen røde tall-badges for P2/P3, ingen animasjon. P0 er tydelig, men ikke skrikende, og ligger alltid på samme sted.
6. **Ingen score-tall for sluttbrukere.** De ser kun selvhjelpstiltak, formulert som invitasjoner («Noe du kan prøve»).
7. **Menneske i løkka.** «Stemmer» og «Stemmer ikke» er like store, nøytrale knapper. Avvisning krever ikke begrunnelse, men det er mulig å gi en.
8. **Samtykke synlig der data brukes.** Uten ML-samtykke: «Automatiske forslag er av for denne kontakten».
9. **Tilgjengelighet.** Semantisk HTML, `role="alert"` kun for P0, tastaturnavigasjon, skjermleser-testet (NVDA, VoiceOver).
10. **Redusert kognitiv last.** Maks tre tiltak per kort. Mer bak «Vis flere».

## Eksempel: `VibeCodeCard`

Full fil: [`frontend/src/components/VibeCodeCard.tsx`](../frontend/src/components/VibeCodeCard.tsx). Typesjekket med `tsc --strict`.

```tsx
export interface VibeCodeCardProps {
  code: VibeCode;
  suggestion?: CodeSuggestion;      // utelates i kunnskapsbasevisning
  viewer: "fagperson" | "sluttbruker";
  onReview?: (codeId: string, decision: "bekreftet" | "avvist") => Promise<void> | void;
}

// Bruk
<VibeCodeCard
  code={exampleCode}                  // VC-008 Økonomisk stress
  suggestion={exampleSuggestion}      // score 0.88, matched ["gjelden","Inkassobrevet"]
  viewer="fagperson"
  onReview={(id, d) => api.reviewSuggestion(obsId, id, d)}
/>
```

Hva komponenten gjør:
- Filtrerer tiltak etter `viewer`. Sluttbrukere ser alltid krisetiltak for P0.
- Oversetter score til ord («tydelige signaler») i stedet for desimaltall.
- Viser negerte signaler, så fagpersonen ser hva som ble tolket bort.
- Viser komposisjonsmerknad.
- Holder egen vurderingsstatus og deaktiverer knapper under lagring.

```bash
cd vibe-coding-system/frontend && npm install && npm run typecheck
```

## To-do

- [ ] Vite-app-skall med ruter og OIDC via BFF
- [ ] Storybook med `VibeCodeCardDemo` + axe-a11y-addon
- [ ] VibeCodeEditor med live regex-test

## Prioritert backlog

| # | Punkt | Prioritet |
|---|---|---|
| 1 | Kontaktvisning + ObservasjonsEditor | Må |
| 2 | Dashboard med P0 først | Må |
| 3 | Samtykkeflyt | Må |
| 4 | VibeCodeEditor | Bør |
| 5 | Audit-visning | Bør |
| 6 | Sluttbruker-app (kan bygge på Rolig pusterom) | Kan |
