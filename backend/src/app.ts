import Fastify, { type FastifyInstance } from "fastify";
import type { JWTVerifyGetKey } from "jose";
import type { Writable } from "node:stream";
import type { Config } from "./config.js";
import type { Db } from "./db.js";
import { AppError } from "./errors.js";
import { AnthropicProvider } from "./model/anthropic.js";
import { MockProvider } from "./model/mock.js";
import type { ModelProvider } from "./model/provider.js";
import { accountRoutes } from "./routes/account.js";
import { authRoutes } from "./routes/auth.js";
import { conversationRoutes } from "./routes/conversations.js";

export interface AppContext {
  cfg: Config;
  db: Db;
  provider: ModelProvider;
  active: Map<string, AbortController>;
  log: FastifyInstance["log"];
  appleKeys?: JWTVerifyGetKey;
}

export interface BuildOptions {
  cfg: Config;
  db: Db;
  provider?: ModelProvider;
  logStream?: Writable;
  appleKeys?: JWTVerifyGetKey;
}

export function createProvider(cfg: Config): ModelProvider {
  return cfg.MODEL_PROVIDER === "mock" ? new MockProvider({ delayMs: 40 }) : new AnthropicProvider(cfg);
}

export async function buildApp(opts: BuildOptions): Promise<{ app: FastifyInstance; ctx: AppContext }> {
  const app = Fastify({
    bodyLimit: 128 * 1024,
    trustProxy: opts.cfg.TRUST_PROXY,
    // Skjuler ID-er for forespørsler i URL; logger aldri body, IP eller headere.
    logger: {
      level: opts.cfg.LOG_LEVEL,
      ...(opts.logStream ? { stream: opts.logStream } : {}),
      redact: ["req.headers.authorization", "req.headers.cookie"],
      serializers: {
        req: (req) => ({ method: req.method, url: req.url?.split("?")[0], id: req.id }),
        res: (res) => ({ statusCode: res.statusCode }),
        // Bare type og kode; meldinger fra tredjepart kan inneholde brukertekst.
        err: (err: Error & { code?: string }) => ({ type: err.name, code: err.code, message: "", stack: "" }),
      },
    },
  });

  const ctx: AppContext = {
    cfg: opts.cfg,
    db: opts.db,
    provider: opts.provider ?? createProvider(opts.cfg),
    active: new Map(),
    log: app.log,
    appleKeys: opts.appleKeys,
  };

  app.setErrorHandler((err: Error & { statusCode?: number; code?: string }, req, reply) => {
    if (err instanceof AppError) {
      reply.code(err.status).send({ error: { code: err.code, message: err.message, retryable: err.retryable } });
      return;
    }
    if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
      // Fastify-feil (ugyldig JSON, for stor body). Ikke send/logg detaljer som kan inneholde brukertekst.
      const code = err.statusCode === 413 ? "payload_too_large" : "bad_request";
      const message = err.statusCode === 413 ? "Forespørselen er for stor." : "Ugyldig forespørsel.";
      reply.code(err.statusCode).send({ error: { code, message, retryable: false } });
      return;
    }
    req.log.error({ err }, "unhandled error");
    reply.code(500).send({ error: { code: "internal", message: "Noe gikk galt på serveren. Prøv igjen.", retryable: true } });
  });

  await authRoutes(app, ctx);
  await conversationRoutes(app, ctx);
  await accountRoutes(app, ctx);
  return { app, ctx };
}
