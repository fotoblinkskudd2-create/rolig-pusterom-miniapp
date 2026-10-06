import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { sweepStale } from "./conversation/generation.js";
import { createDb } from "./db.js";
import { migrate } from "./migrate.js";

const cfg = loadConfig();
const db = createDb(cfg.DATABASE_URL);
await migrate(db, (m) => console.log(m));
const { app, ctx } = await buildApp({ cfg, db });

if (ctx.provider.name === "mock") {
  app.log.warn("MODEL_PROVIDER=mock: svarene er IKKE fra en språkmodell. Kun for lokal testing.");
}

// Vedlikehold: rydd hengende svar og utløpte ikke-lagrede samtaler og tokens.
const maintenance = async () => {
  try {
    const stale = await sweepStale(db);
    const exp = await db.query("DELETE FROM conversations WHERE expires_at IS NOT NULL AND expires_at < now()");
    await db.query("DELETE FROM access_tokens WHERE expires_at < now() - interval '1 day'");
    if (stale || exp.rowCount) app.log.info({ stale, expiredConversations: exp.rowCount }, "maintenance");
  } catch (err) {
    app.log.error({ err }, "maintenance failed");
  }
};
await maintenance();
const timer = setInterval(maintenance, 5 * 60_000);

await app.listen({ port: cfg.PORT, host: cfg.HOST });

const shutdown = async () => {
  clearInterval(timer);
  for (const c of ctx.active.values()) c.abort();
  await app.close();
  await db.end();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
