import type { Config } from "../config.js";
import type { Queryable } from "../db.js";
import { Errors } from "../errors.js";
import type { Usage } from "../model/provider.js";

/** Kostnad i mikro-USD for et kall, ut fra konfigurerte priser. */
export function costMicroUsd(cfg: Config, usage: Usage, kind: "chat" | "fast"): number {
  const inP = kind === "chat" ? cfg.PRICE_CHAT_INPUT_PER_MTOK : cfg.PRICE_FAST_INPUT_PER_MTOK;
  const outP = kind === "chat" ? cfg.PRICE_CHAT_OUTPUT_PER_MTOK : cfg.PRICE_FAST_OUTPUT_PER_MTOK;
  // pris per MTok i USD = mikro-USD per token
  return Math.ceil(usage.inputTokens * inP + usage.outputTokens * outP);
}

export async function recordUsage(
  db: Queryable,
  cfg: Config,
  userId: string,
  usage: Usage,
  kind: "chat" | "fast",
): Promise<void> {
  await db.query(
    `INSERT INTO usage_daily (user_id, day, requests, input_tokens, output_tokens, cost_micro_usd)
     VALUES ($1, (now() AT TIME ZONE 'UTC')::date, 1, $2, $3, $4)
     ON CONFLICT (user_id, day) DO UPDATE SET
       requests = usage_daily.requests + 1,
       input_tokens = usage_daily.input_tokens + EXCLUDED.input_tokens,
       output_tokens = usage_daily.output_tokens + EXCLUDED.output_tokens,
       cost_micro_usd = usage_daily.cost_micro_usd + EXCLUDED.cost_micro_usd`,
    [userId, usage.inputTokens, usage.outputTokens, costMicroUsd(cfg, usage, kind)],
  );
}

/** Kaster AppError hvis brukeren har nådd grensene. Kalles før et modellkall. */
export async function enforceLimits(db: Queryable, cfg: Config, userId: string): Promise<void> {
  const { rows: rate } = await db.query<{ n: string }>(
    `SELECT count(*) AS n FROM messages
     WHERE user_id = $1 AND role = 'user' AND created_at > now() - interval '60 seconds'`,
    [userId],
  );
  if (Number(rate[0]!.n) >= cfg.RATE_LIMIT_MESSAGES_PER_MINUTE) throw Errors.rateLimited();

  const { rows } = await db.query<{ day_tokens: string | null; month_cost: string | null }>(
    `SELECT
       (SELECT input_tokens + output_tokens FROM usage_daily
         WHERE user_id = $1 AND day = (now() AT TIME ZONE 'UTC')::date) AS day_tokens,
       (SELECT sum(cost_micro_usd) FROM usage_daily
         WHERE user_id = $1 AND day >= date_trunc('month', now() AT TIME ZONE 'UTC')::date) AS month_cost`,
    [userId],
  );
  if (Number(rows[0]!.day_tokens ?? 0) >= cfg.DAILY_TOKEN_LIMIT_PER_USER) throw Errors.dailyLimit();
  if (Number(rows[0]!.month_cost ?? 0) >= cfg.MONTHLY_COST_LIMIT_USD_PER_USER * 1_000_000) throw Errors.monthlyLimit();
}

/** Enkel minnebasert teller per IP for anonym registrering. Per instans. */
export class IpWindowLimiter {
  private hits = new Map<string, number[]>();
  constructor(private readonly max: number, private readonly windowMs: number) {}
  allow(ip: string): boolean {
    const now = Date.now();
    const arr = (this.hits.get(ip) ?? []).filter((t) => now - t < this.windowMs);
    if (arr.length >= this.max) {
      this.hits.set(ip, arr);
      return false;
    }
    arr.push(now);
    this.hits.set(ip, arr);
    if (this.hits.size > 50_000) this.hits.clear();
    return true;
  }
}
