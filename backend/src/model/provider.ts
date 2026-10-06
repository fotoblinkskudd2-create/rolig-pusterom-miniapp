import { z } from "zod";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  /** Stabil del av systeminstruksen (cachebar). */
  systemStable: string;
  /** Variabel del: tone, sammendrag, minner, instruks for dette svaret. */
  systemDynamic: string;
  messages: ChatTurn[];
  signal: AbortSignal;
}

export type StopKind = "end_turn" | "max_tokens" | "refusal" | "other";

export interface ChatResult {
  stop: StopKind;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export type Usage = { model: string; inputTokens: number; outputTokens: number };

// ---- Strukturerte hjelpekall -------------------------------------------------

export const SafetyLevel = z.enum(["none", "uncertain", "concern", "acute"]);
export type SafetyLevel = z.infer<typeof SafetyLevel>;

export const SafetyCategory = z.enum([
  "self_harm",
  "self_harm_other_person",
  "violence_victim",
  "violence_to_others",
  "coercion",
  "acute_medical",
  "minor_at_risk",
]);
export type SafetyCategory = z.infer<typeof SafetyCategory>;

export const SafetyClassification = z.object({
  level: SafetyLevel,
  categories: z.array(SafetyCategory),
  // Kort begrunnelse uten sitater fra brukeren. Logges ikke.
  rationale: z.string(),
});
export type SafetyClassification = z.infer<typeof SafetyClassification>;

export const SummaryData = z.object({
  userFacts: z.array(z.string()),
  goals: z.array(z.string()),
  agreedActions: z.array(z.string()),
  corrections: z.array(z.string()),
  openQuestions: z.array(z.string()),
  hypotheses: z.array(z.string()),
});
export type SummaryData = z.infer<typeof SummaryData>;

export const ActionCardDraft = z.object({
  what: z.string(),
  when: z.string(),
  doneWhen: z.string(),
  ifStuck: z.string(),
});
export type ActionCardDraft = z.infer<typeof ActionCardDraft>;

export const MemorySuggestions = z.object({
  suggestions: z.array(z.string()),
});

export interface StructuredRequest {
  system: string;
  user: string;
  signal: AbortSignal;
}

export interface ModelProvider {
  readonly name: "anthropic" | "mock";
  readonly chatModel: string;
  readonly fastModel: string;
  /** Strømmer tekst via onText. Kaster ved feil; avbrudd via signal kaster AbortError-lignende feil. */
  streamChat(req: ChatRequest, onText: (text: string) => void): Promise<ChatResult>;
  classifySafety(req: StructuredRequest): Promise<{ data: SafetyClassification; usage: Usage }>;
  summarize(req: StructuredRequest): Promise<{ data: SummaryData; usage: Usage }>;
  draftActionCard(req: StructuredRequest): Promise<{ data: ActionCardDraft; usage: Usage }>;
  suggestMemories(req: StructuredRequest): Promise<{ data: { suggestions: string[] }; usage: Usage }>;
}

/** Feil fra modell-laget, med kategori som generation.ts kan oversette. */
export class ProviderError extends Error {
  constructor(
    public readonly kind: "aborted" | "timeout" | "rate_limited" | "overloaded" | "bad_request" | "auth" | "network" | "unknown",
    message: string,
  ) {
    super(message);
  }
}
