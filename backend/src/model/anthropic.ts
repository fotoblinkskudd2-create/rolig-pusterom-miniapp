import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import type { Config } from "../config.js";
import {
  ActionCardDraft,
  MemorySuggestions,
  ProviderError,
  SafetyClassification,
  SummaryData,
  type ChatRequest,
  type ChatResult,
  type ModelProvider,
  type StructuredRequest,
  type Usage,
} from "./provider.js";

/**
 * Adapter mot Anthropic Messages API.
 * API-nøkkelen leses kun fra serverens miljø og forlater aldri backend.
 */
export class AnthropicProvider implements ModelProvider {
  readonly name = "anthropic" as const;
  readonly chatModel: string;
  readonly fastModel: string;
  private readonly client: Anthropic;

  constructor(private readonly cfg: Config) {
    this.client = new Anthropic({
      apiKey: cfg.ANTHROPIC_API_KEY,
      baseURL: cfg.ANTHROPIC_BASE_URL,
      // Vi håndterer tidsavbrudd selv (første token / total), og prøver ikke
      // strømmer på nytt automatisk: en ny strøm ville duplisert tekst.
      maxRetries: 0,
      timeout: cfg.MODEL_TOTAL_TIMEOUT_MS,
    });
    this.chatModel = cfg.MODEL_CHAT;
    this.fastModel = cfg.MODEL_FAST;
  }

  async streamChat(req: ChatRequest, onText: (text: string) => void): Promise<ChatResult> {
    const useFallbacks = this.cfg.MODEL_FALLBACKS === "default";
    try {
      const stream = this.client.beta.messages.stream(
        {
          model: this.chatModel,
          max_tokens: this.cfg.MODEL_CHAT_MAX_TOKENS,
          output_config: { effort: this.cfg.MODEL_CHAT_EFFORT },
          system: [
            { type: "text", text: req.systemStable, cache_control: { type: "ephemeral" } },
            { type: "text", text: req.systemDynamic },
          ],
          messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
          ...(useFallbacks ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
        },
        { signal: req.signal },
      );
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          onText(event.delta.text);
        }
      }
      const final = await stream.finalMessage();
      const stop =
        final.stop_reason === "end_turn" || final.stop_reason === "stop_sequence"
          ? "end_turn"
          : final.stop_reason === "max_tokens"
            ? "max_tokens"
            : final.stop_reason === "refusal"
              ? "refusal"
              : "other";
      return {
        stop,
        model: final.model,
        inputTokens:
          final.usage.input_tokens +
          (final.usage.cache_read_input_tokens ?? 0) +
          (final.usage.cache_creation_input_tokens ?? 0),
        outputTokens: final.usage.output_tokens,
      };
    } catch (err) {
      throw mapError(err, req.signal);
    }
  }

  classifySafety(req: StructuredRequest) {
    return this.structured(req, SafetyClassification, 600);
  }
  summarize(req: StructuredRequest) {
    return this.structured(req, SummaryData, 4000);
  }
  draftActionCard(req: StructuredRequest) {
    return this.structured(req, ActionCardDraft, 1000);
  }
  suggestMemories(req: StructuredRequest) {
    return this.structured(req, MemorySuggestions, 800);
  }

  private async structured<T extends z.ZodType>(
    req: StructuredRequest,
    schema: T,
    maxTokens: number,
  ): Promise<{ data: z.infer<T>; usage: Usage }> {
    try {
      const res = await this.client.messages.parse(
        {
          model: this.fastModel,
          max_tokens: maxTokens,
          system: req.system,
          messages: [{ role: "user", content: req.user }],
          output_config: { format: zodOutputFormat(schema) },
        },
        { signal: req.signal, timeout: this.cfg.MODEL_AUX_TIMEOUT_MS },
      );
      if (res.stop_reason === "refusal" || res.parsed_output == null) {
        throw new ProviderError("unknown", `structured output missing (stop_reason=${res.stop_reason})`);
      }
      return {
        data: res.parsed_output as z.infer<T>,
        usage: { model: res.model, inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens },
      };
    } catch (err) {
      throw mapError(err, req.signal);
    }
  }
}

function mapError(err: unknown, signal: AbortSignal): ProviderError {
  if (err instanceof ProviderError) return err;
  if (signal.aborted || err instanceof Anthropic.APIUserAbortError) {
    return new ProviderError("aborted", "aborted");
  }
  if (err instanceof Anthropic.APIConnectionTimeoutError) return new ProviderError("timeout", "timeout");
  if (err instanceof Anthropic.RateLimitError) return new ProviderError("rate_limited", "rate limited");
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    return new ProviderError("auth", "provider auth failed");
  }
  if (err instanceof Anthropic.BadRequestError) return new ProviderError("bad_request", "bad request");
  if (err instanceof Anthropic.InternalServerError) return new ProviderError("overloaded", `status ${err.status}`);
  if (err instanceof Anthropic.APIConnectionError) return new ProviderError("network", "connection error");
  if (err instanceof Anthropic.APIError) return new ProviderError("unknown", `status ${err.status}`);
  return new ProviderError("unknown", "unexpected provider error");
}
