export type Priority = "P0" | "P1" | "P2" | "P3";
export type Audience = "fagperson" | "sluttbruker";
export type SuggestionStatus = "foreslatt" | "bekreftet" | "avvist";

export interface Action {
  audience: Audience;
  type: string;
  text: string;
}

export interface VibeCode {
  id: string;
  slug: string;
  name: string;
  definition: string;
  category: string;
  priority: Priority;
  version: number;
  status: "draft" | "active" | "deprecated";
  counter_examples: string[];
  recommended_actions: Action[];
  related_codes: string[];
  composition: { amplified_by: string[]; note: string };
  safeguards?: string[];
}

export interface CodeSuggestion {
  code_id: string;
  code_version: number;
  score: number;
  matched_signals: string[];
  negated_signals: string[];
  escalate: boolean;
  status: SuggestionStatus;
}
