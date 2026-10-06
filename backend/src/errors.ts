/** Feil med stabil kode (for klienten) og norsk melding (for mennesker). */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly retryable = false,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export const Errors = {
  unauthorized: () => new AppError(401, "unauthorized", "Du må logge inn på nytt."),
  notFound: (what = "Fant ikke det du ba om.") => new AppError(404, "not_found", what),
  validation: (msg: string) => new AppError(400, "validation_error", msg),
  tooLong: (max: number) =>
    new AppError(413, "message_too_long", `Meldingen er for lang. Maks ${max} tegn. Del den gjerne opp.`),
  rateLimited: () =>
    new AppError(429, "rate_limited", "Du sender raskt. Vent et minutt og prøv igjen.", true),
  dailyLimit: () =>
    new AppError(429, "daily_limit", "Du har brukt dagens kvote. Den nullstilles ved midnatt (UTC).", false),
  monthlyLimit: () =>
    new AppError(429, "monthly_limit", "Du har nådd månedens kostnadstak for samtaler.", false),
  generationInProgress: () =>
    new AppError(409, "generation_in_progress", "Det skrives allerede et svar i denne tråden. Stopp det først.", true),
  idempotencyConflict: () =>
    new AppError(409, "idempotency_conflict", "Samme meldings-ID ble brukt med annen tekst."),
  memoryDisabled: () =>
    new AppError(409, "memory_disabled", "Minne er slått av. Slå det på i innstillinger først."),
  modelUnavailable: () =>
    new AppError(503, "model_unavailable", "Modellen svarer ikke akkurat nå. Prøv igjen om litt.", true),
};
