import { useState } from "react";
import type { Audience, CodeSuggestion, Priority, SuggestionStatus, VibeCode } from "../types";

export interface VibeCodeCardProps {
  code: VibeCode;
  /** Forslaget fra klassifikatoren. Utelates når kortet vises i kunnskapsbasen. */
  suggestion?: CodeSuggestion;
  /** Hvem som ser kortet. Sluttbrukere ser aldri score eller fagpersonens tiltak. */
  viewer: Audience;
  onReview?: (codeId: string, decision: Exclude<SuggestionStatus, "foreslatt">) => Promise<void> | void;
}

// Ord, ikke farger alene, bærer betydningen (WCAG 1.4.1). Ordlyden er beskrivende, ikke dømmende.
const PRIORITY_LABEL: Record<Priority, string> = {
  P0: "Trenger oppfølging i dag",
  P1: "Følg opp snart",
  P2: "Verdt å utforske",
  P3: "Til orientering",
};

const PRIORITY_STYLE: Record<Priority, React.CSSProperties> = {
  P0: { background: "#fdecea", borderColor: "#b3261e", color: "#5f1410" },
  P1: { background: "#fff4e5", borderColor: "#a15c00", color: "#4d2c00" },
  P2: { background: "#eef4fb", borderColor: "#2f5d8a", color: "#173149" },
  P3: { background: "#f3f5f4", borderColor: "#5b6b63", color: "#27302b" },
};

function confidenceWord(score: number): string {
  if (score >= 0.8) return "tydelige signaler";
  if (score >= 0.6) return "flere signaler";
  return "svake signaler";
}

export function VibeCodeCard({ code, suggestion, viewer, onReview }: VibeCodeCardProps) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<SuggestionStatus | undefined>(suggestion?.status);
  const actions = code.recommended_actions.filter((a) => a.audience === viewer || (code.priority === "P0" && a.type === "krise"));
  const isFag = viewer === "fagperson";
  const headingId = `vc-${code.id}-title`;

  async function review(decision: "bekreftet" | "avvist") {
    if (!onReview) return;
    setBusy(true);
    try {
      await onReview(code.id, decision);
      setStatus(decision);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      aria-labelledby={headingId}
      style={{ border: "2px solid", borderRadius: 12, padding: 16, maxWidth: 560, fontFamily: "system-ui, sans-serif", lineHeight: 1.5, ...PRIORITY_STYLE[code.priority] }}
    >
      {code.priority === "P0" && (
        <div role="alert" style={{ fontWeight: 600, marginBottom: 8 }}>
          {isFag ? "Mulig sikkerhetsrisiko. Vurder personen i dag etter prosedyre." : "Du trenger ikke stå i dette alene."}
        </div>
      )}

      <header style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
        <h3 id={headingId} style={{ margin: 0, fontSize: "1.1rem" }}>
          {code.name}
        </h3>
        {isFag && (
          <span style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
            {code.id} · v{code.version} · {PRIORITY_LABEL[code.priority]}
          </span>
        )}
      </header>

      <p style={{ margin: "8px 0" }}>{code.definition}</p>

      {isFag && suggestion && (
        <section aria-label="Hvorfor dette forslaget">
          <p style={{ margin: "4px 0", fontSize: "0.9rem" }}>
            Forslag basert på {confidenceWord(suggestion.score)}
            {suggestion.matched_signals.length > 0 && (
              <>
                {": "}
                {suggestion.matched_signals.map((s) => (
                  <mark key={s} style={{ background: "rgba(0,0,0,0.08)", padding: "0 4px", borderRadius: 4, marginRight: 4 }}>
                    «{s}»
                  </mark>
                ))}
              </>
            )}
          </p>
          {suggestion.negated_signals.length > 0 && (
            <p style={{ margin: "4px 0", fontSize: "0.85rem" }}>Tolket som nektet: {suggestion.negated_signals.join(", ")}</p>
          )}
          <p style={{ margin: "4px 0", fontSize: "0.8rem", fontStyle: "italic" }}>
            Dette er en hypotese, ikke en vurdering. Din faglige vurdering avgjør.
          </p>
        </section>
      )}

      {actions.length > 0 && (
        <section aria-label={isFag ? "Forslag til tiltak" : "Noe du kan prøve"}>
          <h4 style={{ margin: "12px 0 4px", fontSize: "0.95rem" }}>{isFag ? "Forslag til tiltak" : "Noe du kan prøve"}</h4>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {actions.map((a, i) => (
              <li key={i}>{a.text}</li>
            ))}
          </ul>
        </section>
      )}

      {isFag && code.composition.note && (
        <p style={{ fontSize: "0.85rem", marginTop: 8 }}>
          Sammenheng: {code.composition.note}
        </p>
      )}

      {isFag && suggestion && onReview && (
        <footer style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
          {status === "foreslatt" ? (
            <>
              <button type="button" disabled={busy} onClick={() => review("bekreftet")}>
                Stemmer
              </button>
              <button type="button" disabled={busy} onClick={() => review("avvist")}>
                Stemmer ikke
              </button>
            </>
          ) : (
            <span role="status">{status === "bekreftet" ? "Bekreftet av deg" : "Avvist av deg"}</span>
          )}
        </footer>
      )}
    </article>
  );
}

// ---------- Eksempeldata (Storybook / sandkasse) ----------

export const exampleCode: VibeCode = {
  id: "VC-008",
  slug: "okonomisk-stress",
  name: "Økonomisk stress",
  definition: "Gjeld, inkasso, regninger eller inntektstap som kilde til vedvarende belastning.",
  category: "livssituasjon",
  priority: "P2",
  version: 1,
  status: "active",
  counter_examples: ["Betalte ned siste del av lånet i dag"],
  recommended_actions: [
    { audience: "fagperson", type: "henvisning", text: "Informer om gratis gjeldsrådgivning hos NAV og NAVs økonomitelefon 55 55 33 39." },
    { audience: "sluttbruker", type: "selvhjelp", text: "Åpne ett brev. Bare ett. Skriv ned beløp og frist." },
  ],
  related_codes: ["VC-001", "VC-010", "VC-006"],
  composition: { amplified_by: ["VC-006"], note: "Økonomisk stress med skam fører ofte til at brev forblir uåpnet." },
};

export const exampleSuggestion: CodeSuggestion = {
  code_id: "VC-008",
  code_version: 1,
  score: 0.88,
  matched_signals: ["gjelden", "Inkassobrevet"],
  negated_signals: [],
  escalate: false,
  status: "foreslatt",
};

export function VibeCodeCardDemo() {
  return (
    <VibeCodeCard
      code={exampleCode}
      suggestion={exampleSuggestion}
      viewer="fagperson"
      onReview={async (id, decision) => {
        await fetch(`/v1/observations/OBS_ID/suggestions/${id}?decision=${decision}`, { method: "PATCH", credentials: "include" });
      }}
    />
  );
}
