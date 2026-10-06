import {
  ProviderError,
  type ActionCardDraft,
  type ChatRequest,
  type ChatResult,
  type ModelProvider,
  type SafetyClassification,
  type StructuredRequest,
  type SummaryData,
  type Usage,
} from "./provider.js";

export const MOCK_PREFIX = "[Testmodus – ikke et modellsvar]";

export interface MockOptions {
  /** Tekstbiter som strømmes. Standard: et tydelig merket testsvar. */
  reply?: (req: ChatRequest) => string[];
  delayMs?: number;
  /** Forsinkelse før første tekstbit. */
  firstDelayMs?: number;
  stop?: ChatResult["stop"];
  failWith?: ProviderError;
  safety?: (req: StructuredRequest) => SafetyClassification | Promise<SafetyClassification>;
  summary?: (req: StructuredRequest) => SummaryData;
  actionCard?: (req: StructuredRequest) => ActionCardDraft;
}

/**
 * Deterministisk erstatning for modellen. Brukes i automatiske tester og,
 * eksplisitt, i lokal utvikling uten nøkkel. Alle svar er merket som testmodus,
 * og backend rapporterer provider=mock i /v1/meta. Ikke tillatt i produksjon.
 */
export class MockProvider implements ModelProvider {
  readonly name = "mock" as const;
  readonly chatModel = "mock-chat";
  readonly fastModel = "mock-fast";
  readonly chatRequests: ChatRequest[] = [];
  readonly structuredRequests: { kind: string; req: StructuredRequest }[] = [];

  constructor(public opts: MockOptions = {}) {}

  async streamChat(req: ChatRequest, onText: (t: string) => void): Promise<ChatResult> {
    this.chatRequests.push(req);
    if (this.opts.failWith) throw this.opts.failWith;
    const chunks = this.opts.reply
      ? this.opts.reply(req)
      : [`${MOCK_PREFIX} `, "Du har forklart det. ", "Hva gjør du nå?"];
    let first = true;
    for (const chunk of chunks) {
      const wait = first ? (this.opts.firstDelayMs ?? this.opts.delayMs ?? 0) : (this.opts.delayMs ?? 0);
      first = false;
      if (wait > 0) await sleep(wait, req.signal);
      if (req.signal.aborted) throw new ProviderError("aborted", "aborted");
      onText(chunk);
    }
    return {
      stop: this.opts.stop ?? "end_turn",
      model: this.chatModel,
      inputTokens: Math.ceil(JSON.stringify(req.messages).length / 4),
      outputTokens: Math.ceil(chunks.join("").length / 4),
    };
  }

  async classifySafety(req: StructuredRequest) {
    this.structuredRequests.push({ kind: "safety", req });
    const data = this.opts.safety
      ? await this.opts.safety(req)
      : { level: "none" as const, categories: [], rationale: "mock" };
    return { data, usage: this.usage() };
  }

  async summarize(req: StructuredRequest) {
    this.structuredRequests.push({ kind: "summary", req });
    const data = this.opts.summary
      ? this.opts.summary(req)
      : { userFacts: [], goals: [], agreedActions: [], corrections: [], openQuestions: [], hypotheses: [] };
    return { data, usage: this.usage() };
  }

  async draftActionCard(req: StructuredRequest) {
    this.structuredRequests.push({ kind: "action", req });
    const data = this.opts.actionCard
      ? this.opts.actionCard(req)
      : {
          what: `${MOCK_PREFIX} Send én melding om saken.`,
          when: "I morgen før kl. 12",
          doneWhen: "Meldingen er sendt.",
          ifStuck: "Skriv to setninger i stedet for en perfekt melding.",
        };
    return { data, usage: this.usage() };
  }

  async suggestMemories(req: StructuredRequest) {
    this.structuredRequests.push({ kind: "memory", req });
    return { data: { suggestions: [] as string[] }, usage: this.usage() };
  }

  private usage(): Usage {
    return { model: this.fastModel, inputTokens: 10, outputTokens: 10 };
  }
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new ProviderError("aborted", "aborted"));
    const t = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(new ProviderError("aborted", "aborted"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
