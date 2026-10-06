import type { FastifyBaseLogger } from "fastify";
import type { Config } from "../config.js";
import type { Db } from "../db.js";
import { ProviderError, type ModelProvider, type SafetyCategory, type SafetyLevel } from "../model/provider.js";
import { acuteTemplate } from "../safety/assess.js";
import { resourcesFor } from "../safety/resources.js";
import { levelAtLeast } from "../safety/screener.js";
import type { SseStream } from "../sse.js";
import { recordUsage } from "../usage/limits.js";
import { messageView, type DbConversation, type DbMessage } from "../views.js";
import { buildTurns, type MessageRow } from "./context.js";
import { PROMPT_VERSION, SYSTEM_PROMPT, buildDynamicSystem, type Topic, type TurnKind } from "./prompt.js";
import { maybeSummarize } from "./summary.js";

export interface GenerationDeps {
  db: Db;
  cfg: Config;
  provider: ModelProvider;
  /** Lokale avbrytere per assistentmelding (i tillegg til DB-flagg for andre instanser). */
  active: Map<string, AbortController>;
  log: FastifyBaseLogger;
}

type Reason =
  | "user_cancelled"
  | "client_disconnected"
  | "superseded"
  | "timeout"
  | "max_tokens"
  | "refusal"
  | "provider_error";

const USER_ERRORS: Record<string, string> = {
  timeout: "Svaret tok for lang tid og ble stoppet. Prøv igjen.",
  rate_limited: "Modelltjenesten er overbelastet akkurat nå. Prøv igjen om litt.",
  overloaded: "Modelltjenesten svarer ikke akkurat nå. Prøv igjen om litt.",
  network: "Fikk ikke kontakt med modelltjenesten. Prøv igjen.",
  auth: "Tjenesten er feilkonfigurert. Det er ikke din feil.",
  bad_request: "Noe gikk galt med forespørselen. Prøv igjen, eller start en ny tråd.",
  refusal: "Modellen ville ikke svare på dette. Prøv å formulere det annerledes.",
  unknown: "Noe gikk galt. Prøv igjen.",
};

export async function loadMessages(db: Db, conversationId: string): Promise<(MessageRow & DbMessage)[]> {
  const { rows } = await db.query<MessageRow & DbMessage>(
    "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY seq",
    [conversationId],
  );
  return rows;
}

/**
 * Kjører ett assistentsvar fra start til endelig status, og strømmer hendelser
 * til klienten. Endelig status er alltid én av completed/cancelled/failed.
 */
export async function runGeneration(
  deps: GenerationDeps,
  p: {
    userId: string;
    conversation: DbConversation;
    userMessage: DbMessage;
    assistantId: string;
    turnLevel: SafetyLevel;
    turnCategories: SafetyCategory[];
    sse: SseStream;
  },
): Promise<void> {
  const { db, cfg, provider } = deps;
  const controller = new AbortController();
  deps.active.set(p.assistantId, controller);
  let reason: Reason | null = null;
  const abort = (r: Reason) => {
    if (!controller.signal.aborted) {
      reason = r;
      controller.abort();
    }
  };
  (controller as AbortController & { abortWith?: (r: Reason) => void }).abortWith = abort;
  p.sse.onClose(() => abort("client_disconnected"));

  let content = "";
  let lastFlush = Date.now();
  const timers: NodeJS.Timeout[] = [];

  const finish = async (status: "completed" | "cancelled" | "failed", extra: Partial<Record<string, unknown>> = {}) => {
    timers.forEach(clearTimeout);
    timers.forEach(clearInterval);
    deps.active.delete(p.assistantId);
    const { rows } = await db.query<DbMessage>(
      `UPDATE messages SET status = $2, content = $3, incomplete_reason = $4, error_code = $5,
         generated_by = COALESCE($6, generated_by), input_tokens = $7, output_tokens = $8,
         prompt_version = $9, updated_at = now()
       WHERE id = $1 RETURNING *`,
      [
        p.assistantId,
        status,
        content,
        (extra.incompleteReason as string | undefined) ?? null,
        (extra.errorCode as string | undefined) ?? null,
        (extra.generatedBy as string | undefined) ?? null,
        (extra.inputTokens as number | undefined) ?? null,
        (extra.outputTokens as number | undefined) ?? null,
        PROMPT_VERSION,
      ],
    );
    const msg = rows[0]!;
    if (extra.userError) p.sse.send("error", { code: extra.errorCode, message: extra.userError, retryable: true });
    p.sse.send("done", { message: messageView(msg) });
    p.sse.end();
    deps.log.info(
      { msgId: p.assistantId, status, reason: extra.incompleteReason ?? null, out: extra.outputTokens ?? null },
      "generation finished",
    );
  };

  try {
    // Sikkerhetsnivå for svaret: tråden «husker» alvorlige signaler.
    const level: SafetyLevel = levelAtLeast(p.conversation.safety_level, "concern")
      ? levelAtLeast(p.turnLevel, p.conversation.safety_level)
        ? p.turnLevel
        : p.conversation.safety_level
      : p.turnLevel;
    const resources = resourcesFor(level, p.turnCategories);
    if (resources.length) p.sse.send("safety", { level, resources });

    if (p.turnLevel === "acute") {
      content = acuteTemplate(p.turnCategories);
      p.sse.send("delta", { text: content });
      await finish("completed", { generatedBy: "safety_template" });
      return;
    }

    await db.query("UPDATE messages SET status = 'generating', updated_at = now() WHERE id = $1", [p.assistantId]);

    const rows = await loadMessages(db, p.conversation.id);
    const summary = await maybeSummarize(db, cfg, provider, p.userId, p.conversation.id, rows, p.assistantId);
    const unsummarized = rows.filter((r) => r.seq > (summary?.through_seq ?? 0));
    const turns = buildTurns(unsummarized, p.assistantId);

    const { rows: userRows } = await db.query<{ memory_enabled: boolean }>(
      "SELECT memory_enabled FROM users WHERE id = $1",
      [p.userId],
    );
    const memories = userRows[0]?.memory_enabled
      ? (
          await db.query<{ id: string; content: string }>(
            "SELECT id, content FROM memories WHERE user_id = $1 ORDER BY created_at",
            [p.userId],
          )
        ).rows
      : [];

    const systemDynamic = buildDynamicSystem({
      topic: p.conversation.topic as Topic,
      tone: p.conversation.tone,
      darkHumor: p.conversation.dark_humor,
      safetyLevel: level,
      turnKind: p.userMessage.kind as TurnKind,
      summary: summary?.data ?? null,
      memories,
      resourceNames: resourcesFor(level === "uncertain" ? "concern" : level, p.turnCategories).map(
        (r) => `${r.name} ${r.phone}`,
      ),
    });

    // Tidsavbrudd: første tekst og total varighet.
    let gotFirst = false;
    timers.push(
      setTimeout(() => {
        if (!gotFirst) abort("timeout");
      }, cfg.MODEL_FIRST_TOKEN_TIMEOUT_MS),
    );
    timers.push(setTimeout(() => abort("timeout"), cfg.MODEL_TOTAL_TIMEOUT_MS));
    // Avbrytelse fra en annen instans eller et avbrutt API-kall: DB-flagg.
    timers.push(
      setInterval(async () => {
        try {
          const { rows: c } = await db.query<{ cancel_requested_at: Date | null }>(
            "SELECT cancel_requested_at FROM messages WHERE id = $1",
            [p.assistantId],
          );
          if (c[0]?.cancel_requested_at) abort("user_cancelled");
        } catch {
          /* neste runde */
        }
      }, 1000),
    );

    const result = await provider.streamChat(
      { systemStable: SYSTEM_PROMPT, systemDynamic, messages: turns, signal: controller.signal },
      (text) => {
        gotFirst = true;
        content += text;
        p.sse.send("delta", { text });
        if (Date.now() - lastFlush > 1000) {
          lastFlush = Date.now();
          db.query("UPDATE messages SET content = $2, updated_at = now() WHERE id = $1 AND status = 'generating'", [
            p.assistantId,
            content,
          ]).catch(() => {});
        }
      },
    );

    await recordUsage(
      db,
      cfg,
      p.userId,
      { model: result.model, inputTokens: result.inputTokens, outputTokens: result.outputTokens },
      "chat",
    );
    if (result.stop === "refusal") {
      await finish("failed", {
        incompleteReason: "refusal",
        errorCode: "refusal",
        userError: USER_ERRORS.refusal,
        generatedBy: result.model,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
      });
      return;
    }
    await finish("completed", {
      incompleteReason: result.stop === "max_tokens" ? "max_tokens" : undefined,
      generatedBy: result.model,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    });
  } catch (err) {
    const pe = err instanceof ProviderError ? err : null;
    if (pe?.kind === "aborted" || controller.signal.aborted) {
      const r: Reason = (reason as Reason | null) ?? "client_disconnected";
      if (r === "timeout") {
        await finish(content ? "cancelled" : "failed", {
          incompleteReason: "timeout",
          errorCode: "timeout",
          userError: USER_ERRORS.timeout,
        });
      } else {
        await finish("cancelled", { incompleteReason: r });
      }
      return;
    }
    const kind = pe?.kind ?? "unknown";
    deps.log.warn({ msgId: p.assistantId, kind }, "generation failed");
    await finish(content ? "cancelled" : "failed", {
      incompleteReason: "provider_error",
      errorCode: kind,
      userError: USER_ERRORS[kind] ?? USER_ERRORS.unknown,
    }).catch(() => {});
  }
}

/** Ber en pågående generering stoppe (lokalt og via DB for andre instanser). */
export async function requestCancel(
  deps: Pick<GenerationDeps, "db" | "active">,
  assistantId: string,
  reason: Reason,
): Promise<void> {
  await deps.db.query(
    "UPDATE messages SET cancel_requested_at = now() WHERE id = $1 AND status IN ('created', 'generating')",
    [assistantId],
  );
  const c = deps.active.get(assistantId) as (AbortController & { abortWith?: (r: Reason) => void }) | undefined;
  c?.abortWith?.(reason);
}

/** Markerer svar som har hengt (krasj/omstart) som avbrutt eller feilet. */
export async function sweepStale(db: Db): Promise<number> {
  const { rowCount } = await db.query(
    `UPDATE messages SET
       status = CASE WHEN content <> '' THEN 'cancelled' ELSE 'failed' END,
       incomplete_reason = 'server_restart', updated_at = now()
     WHERE status IN ('created', 'generating') AND updated_at < now() - interval '3 minutes'`,
  );
  return rowCount ?? 0;
}
