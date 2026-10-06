import { z } from "zod";

const bool = z
  .enum(["true", "false", "1", "0"])
  .transform((v) => v === "true" || v === "1");

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().default(8080),
    HOST: z.string().default("0.0.0.0"),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
    DATABASE_URL: z.string().min(1),
    TRUST_PROXY: bool.default(false),

    // Modell
    MODEL_PROVIDER: z.enum(["anthropic", "mock"]).default("anthropic"),
    ANTHROPIC_API_KEY: z.string().optional(),
    ANTHROPIC_BASE_URL: z.string().url().optional(),
    MODEL_CHAT: z.string().default("claude-opus-5-5"),
    MODEL_CHAT_EFFORT: z.enum(["low", "medium", "high", "xhigh", "max"]).default("low"),
    MODEL_CHAT_MAX_TOKENS: z.coerce.number().int().positive().default(8000),
    // Serverside fallback ved avslag (refusal). "default" eller "off".
    MODEL_FALLBACKS: z.enum(["default", "off"]).default("default"),
    MODEL_FAST: z.string().default("claude-haiku-4-5"),
    MODEL_FIRST_TOKEN_TIMEOUT_MS: z.coerce.number().int().positive().default(45_000),
    MODEL_TOTAL_TIMEOUT_MS: z.coerce.number().int().positive().default(120_000),
    MODEL_AUX_TIMEOUT_MS: z.coerce.number().int().positive().default(20_000),

    // Priser i USD per million tokens, brukt til kostnadstak.
    PRICE_CHAT_INPUT_PER_MTOK: z.coerce.number().nonnegative().default(4),
    PRICE_CHAT_OUTPUT_PER_MTOK: z.coerce.number().nonnegative().default(20),
    PRICE_FAST_INPUT_PER_MTOK: z.coerce.number().nonnegative().default(1),
    PRICE_FAST_OUTPUT_PER_MTOK: z.coerce.number().nonnegative().default(5),

    // Sikkerhet
    SAFETY_MODEL_CHECK: z.enum(["always", "flagged", "off"]).default("always"),

    // Grenser
    MAX_MESSAGE_CHARS: z.coerce.number().int().positive().default(4000),
    MAX_IMPORT_CHARS: z.coerce.number().int().positive().default(20_000),
    RATE_LIMIT_MESSAGES_PER_MINUTE: z.coerce.number().int().positive().default(8),
    DAILY_TOKEN_LIMIT_PER_USER: z.coerce.number().int().positive().default(400_000),
    MONTHLY_COST_LIMIT_USD_PER_USER: z.coerce.number().positive().default(5),
    ANON_SIGNUPS_PER_IP_PER_HOUR: z.coerce.number().int().positive().default(10),

    // Kontekst
    CONTEXT_BUDGET_TOKENS: z.coerce.number().int().positive().default(150_000),
    CONTEXT_KEEP_RECENT_MESSAGES: z.coerce.number().int().positive().default(16),

    // Historikk
    EPHEMERAL_TTL_HOURS: z.coerce.number().positive().default(24),
    ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(60),

    // Sign in with Apple (valgfritt)
    APPLE_BUNDLE_ID: z.string().optional(),
  })
  .superRefine((c, ctx) => {
    if (c.MODEL_PROVIDER === "anthropic" && !c.ANTHROPIC_API_KEY) {
      ctx.addIssue({
        code: "custom",
        path: ["ANTHROPIC_API_KEY"],
        message: "ANTHROPIC_API_KEY mangler. Sett den, eller bruk MODEL_PROVIDER=mock for lokal testing.",
      });
    }
    if (c.MODEL_PROVIDER === "mock" && c.NODE_ENV === "production") {
      ctx.addIssue({
        code: "custom",
        path: ["MODEL_PROVIDER"],
        message: "MODEL_PROVIDER=mock er ikke tillatt i produksjon.",
      });
    }
  });

export type Config = z.infer<typeof schema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Ugyldig konfigurasjon:\n${msg}`);
  }
  return parsed.data;
}

/** Konfigurasjon for tester: mock-modell, små grenser der det er nyttig. */
export function testConfig(overrides: Partial<Record<keyof Config, string>> = {}): Config {
  return loadConfig({
    NODE_ENV: "test",
    LOG_LEVEL: "silent",
    MODEL_PROVIDER: "mock",
    DATABASE_URL: process.env.TEST_DATABASE_URL ?? "postgres://postgres@127.0.0.1:54329/antipsykologen_test",
    ...overrides,
  });
}
