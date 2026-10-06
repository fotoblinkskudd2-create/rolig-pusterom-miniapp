import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { AppContext } from "../app.js";
import { Errors } from "../errors.js";
import { RESOURCE_CONFIG } from "../safety/resources.js";
import { conversationView, messageView, type DbConversation, type DbMessage } from "../views.js";
import { ownConversation } from "./conversations.js";
import { parse, requireAuth } from "./auth.js";

const Uuid = z.string().uuid();

interface DbUser {
  id: string;
  apple_sub: string | null;
  tone: string;
  dark_humor: boolean;
  history_enabled: boolean;
  memory_enabled: boolean;
  created_at: Date;
}
const userView = (u: DbUser) => ({
  id: u.id,
  signedInWithApple: u.apple_sub !== null,
  tone: u.tone,
  darkHumor: u.dark_humor,
  historyEnabled: u.history_enabled,
  memoryEnabled: u.memory_enabled,
  createdAt: u.created_at.toISOString(),
});

interface DbMemory {
  id: string;
  content: string;
  source_conversation_id: string | null;
  created_at: Date;
  updated_at: Date;
}
const memoryView = (m: DbMemory) => ({
  id: m.id,
  content: m.content,
  sourceConversationId: m.source_conversation_id,
  createdAt: m.created_at.toISOString(),
  updatedAt: m.updated_at.toISOString(),
});

interface DbCard {
  id: string;
  conversation_id: string | null;
  what: string;
  when_text: string;
  done_when: string;
  if_stuck: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}
const cardView = (c: DbCard) => ({
  id: c.id,
  conversationId: c.conversation_id,
  what: c.what,
  when: c.when_text,
  doneWhen: c.done_when,
  ifStuck: c.if_stuck,
  status: c.status,
  createdAt: c.created_at.toISOString(),
  updatedAt: c.updated_at.toISOString(),
});

export async function accountRoutes(app: FastifyInstance, ctx: AppContext) {
  const auth = requireAuth(ctx);
  const { db, cfg } = ctx;

  // ---- Profil og innstillinger -------------------------------------------------
  app.get("/v1/me", { preHandler: auth }, async (req) => {
    const { rows } = await db.query<DbUser>("SELECT * FROM users WHERE id = $1", [req.userId]);
    return userView(rows[0]!);
  });

  app.patch("/v1/me", { preHandler: auth }, async (req) => {
    const b = parse(
      z.object({
        tone: z.enum(["mild", "torr", "skarp"]).optional(),
        darkHumor: z.boolean().optional(),
        historyEnabled: z.boolean().optional(),
        memoryEnabled: z.boolean().optional(),
      }),
      req.body,
    );
    const { rows } = await db.query<DbUser>(
      `UPDATE users SET tone = COALESCE($2, tone), dark_humor = COALESCE($3, dark_humor),
         history_enabled = COALESCE($4, history_enabled), memory_enabled = COALESCE($5, memory_enabled),
         updated_at = now()
       WHERE id = $1 RETURNING *`,
      [req.userId, b.tone ?? null, b.darkHumor ?? null, b.historyEnabled ?? null, b.memoryEnabled ?? null],
    );
    return userView(rows[0]!);
  });

  // Kontosletting: alt knyttet til brukeren slettes (ON DELETE CASCADE).
  app.delete("/v1/me", { preHandler: auth }, async (req, reply) => {
    for (const [id, c] of ctx.active) {
      const { rows } = await db.query("SELECT 1 FROM messages WHERE id = $1 AND user_id = $2", [id, req.userId]);
      if (rows.length) c.abort();
    }
    await db.query("DELETE FROM users WHERE id = $1", [req.userId]);
    reply.code(204);
  });

  // Eksport av alt som er lagret om brukeren.
  app.get("/v1/export", { preHandler: auth }, async (req, reply) => {
    const uid = req.userId;
    const [user, convs, msgs, mems, cards, usage] = await Promise.all([
      db.query<DbUser>("SELECT * FROM users WHERE id = $1", [uid]),
      db.query<DbConversation>("SELECT * FROM conversations WHERE user_id = $1 ORDER BY created_at", [uid]),
      db.query<DbMessage>("SELECT * FROM messages WHERE user_id = $1 ORDER BY conversation_id, seq", [uid]),
      db.query<DbMemory>("SELECT * FROM memories WHERE user_id = $1 ORDER BY created_at", [uid]),
      db.query<DbCard>("SELECT * FROM action_cards WHERE user_id = $1 ORDER BY created_at", [uid]),
      db.query("SELECT day, requests, input_tokens, output_tokens FROM usage_daily WHERE user_id = $1 ORDER BY day", [uid]),
    ]);
    reply.header("content-disposition", 'attachment; filename="antipsykologen-eksport.json"');
    return {
      exportedAt: new Date().toISOString(),
      format: "antipsykologen-export-v1",
      user: userView(user.rows[0]!),
      conversations: convs.rows.map((c) => ({
        ...conversationView(c),
        messages: msgs.rows.filter((m) => m.conversation_id === c.id).map(messageView),
      })),
      memories: mems.rows.map(memoryView),
      actionCards: cards.rows.map(cardView),
      usage: usage.rows,
    };
  });

  // ---- Minne -------------------------------------------------------------------
  const ownMemory = async (userId: string, id: string) => {
    if (!Uuid.safeParse(id).success) throw Errors.notFound("Fant ikke minnet.");
    const { rows } = await db.query<DbMemory>("SELECT * FROM memories WHERE id = $1 AND user_id = $2", [id, userId]);
    if (!rows[0]) throw Errors.notFound("Fant ikke minnet.");
    return rows[0];
  };

  app.get("/v1/memories", { preHandler: auth }, async (req) => {
    const { rows } = await db.query<DbMemory>("SELECT * FROM memories WHERE user_id = $1 ORDER BY created_at", [
      req.userId,
    ]);
    return { memories: rows.map(memoryView) };
  });

  app.post("/v1/memories", { preHandler: auth }, async (req, reply) => {
    const b = parse(
      z.object({ content: z.string().trim().min(1).max(500), sourceConversationId: Uuid.optional() }),
      req.body,
    );
    const { rows: u } = await db.query<{ memory_enabled: boolean }>("SELECT memory_enabled FROM users WHERE id = $1", [
      req.userId,
    ]);
    if (!u[0]?.memory_enabled) throw Errors.memoryDisabled();
    if (b.sourceConversationId) await ownConversation(db, req.userId, b.sourceConversationId);
    const { rows } = await db.query<DbMemory>(
      "INSERT INTO memories (user_id, content, source_conversation_id) VALUES ($1, $2, $3) RETURNING *",
      [req.userId, b.content, b.sourceConversationId ?? null],
    );
    reply.code(201);
    return memoryView(rows[0]!);
  });

  app.patch<{ Params: { id: string } }>("/v1/memories/:id", { preHandler: auth }, async (req) => {
    const b = parse(z.object({ content: z.string().trim().min(1).max(500) }), req.body);
    const m = await ownMemory(req.userId, req.params.id);
    const { rows } = await db.query<DbMemory>(
      "UPDATE memories SET content = $3, updated_at = now() WHERE id = $1 AND user_id = $2 RETURNING *",
      [m.id, req.userId, b.content],
    );
    return memoryView(rows[0]!);
  });

  app.delete<{ Params: { id: string } }>("/v1/memories/:id", { preHandler: auth }, async (req, reply) => {
    const m = await ownMemory(req.userId, req.params.id);
    await db.query("DELETE FROM memories WHERE id = $1 AND user_id = $2", [m.id, req.userId]);
    reply.code(204);
  });

  app.delete("/v1/memories", { preHandler: auth }, async (req) => {
    const { rowCount } = await db.query("DELETE FROM memories WHERE user_id = $1", [req.userId]);
    return { deleted: rowCount ?? 0 };
  });

  // ---- Handlingskort -----------------------------------------------------------
  const CardBody = z.object({
    conversationId: Uuid.optional(),
    what: z.string().trim().min(1).max(500),
    when: z.string().trim().min(1).max(200),
    doneWhen: z.string().trim().min(1).max(500),
    ifStuck: z.string().trim().min(1).max(500),
  });
  const ownCard = async (userId: string, id: string) => {
    if (!Uuid.safeParse(id).success) throw Errors.notFound("Fant ikke handlingskortet.");
    const { rows } = await db.query<DbCard>("SELECT * FROM action_cards WHERE id = $1 AND user_id = $2", [id, userId]);
    if (!rows[0]) throw Errors.notFound("Fant ikke handlingskortet.");
    return rows[0];
  };

  app.get("/v1/action-cards", { preHandler: auth }, async (req) => {
    const { rows } = await db.query<DbCard>(
      "SELECT * FROM action_cards WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200",
      [req.userId],
    );
    return { actionCards: rows.map(cardView) };
  });

  app.post("/v1/action-cards", { preHandler: auth }, async (req, reply) => {
    const b = parse(CardBody, req.body);
    if (b.conversationId) await ownConversation(db, req.userId, b.conversationId);
    const { rows } = await db.query<DbCard>(
      `INSERT INTO action_cards (user_id, conversation_id, what, when_text, done_when, if_stuck)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId, b.conversationId ?? null, b.what, b.when, b.doneWhen, b.ifStuck],
    );
    reply.code(201);
    return cardView(rows[0]!);
  });

  app.patch<{ Params: { id: string } }>("/v1/action-cards/:id", { preHandler: auth }, async (req) => {
    const b = parse(
      CardBody.omit({ conversationId: true })
        .partial()
        .extend({ status: z.enum(["open", "done", "set_aside"]).optional() }),
      req.body,
    );
    const c = await ownCard(req.userId, req.params.id);
    const { rows } = await db.query<DbCard>(
      `UPDATE action_cards SET what = COALESCE($3, what), when_text = COALESCE($4, when_text),
         done_when = COALESCE($5, done_when), if_stuck = COALESCE($6, if_stuck),
         status = COALESCE($7, status), updated_at = now()
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [c.id, req.userId, b.what ?? null, b.when ?? null, b.doneWhen ?? null, b.ifStuck ?? null, b.status ?? null],
    );
    return cardView(rows[0]!);
  });

  app.delete<{ Params: { id: string } }>("/v1/action-cards/:id", { preHandler: auth }, async (req, reply) => {
    const c = await ownCard(req.userId, req.params.id);
    await db.query("DELETE FROM action_cards WHERE id = $1 AND user_id = $2", [c.id, req.userId]);
    reply.code(204);
  });

  // ---- Meta og helse -----------------------------------------------------------
  app.get("/v1/meta", async () => ({
    provider: ctx.provider.name,
    modelBacked: ctx.provider.name !== "mock",
    chatModel: ctx.provider.chatModel,
    limits: { maxMessageChars: cfg.MAX_MESSAGE_CHARS, maxImportChars: cfg.MAX_IMPORT_CHARS },
    ephemeralTtlHours: cfg.EPHEMERAL_TTL_HOURS,
    resources: RESOURCE_CONFIG,
  }));

  app.get("/healthz", async () => ({ ok: true }));
  app.get("/readyz", async (_req, reply) => {
    try {
      await db.query("SELECT 1");
      return { ok: true, db: "ok", provider: ctx.provider.name };
    } catch {
      reply.code(503);
      return { ok: false, db: "unavailable" };
    }
  });
}
