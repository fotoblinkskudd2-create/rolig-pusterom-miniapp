import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import type { AppContext } from "../app.js";
import { verifyAppleIdentityToken } from "../auth/apple.js";
import { hashToken, issueAccessToken, issueRefreshToken, useRefreshToken, verifyAccessToken } from "../auth/tokens.js";
import { withTx } from "../db.js";
import { AppError, Errors } from "../errors.js";
import { IpWindowLimiter } from "../usage/limits.js";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}

/** preHandler: krever gyldig tilgangstoken. Setter request.userId. */
export function requireAuth(ctx: AppContext) {
  return async (req: FastifyRequest) => {
    const h = req.headers.authorization;
    const token = h?.startsWith("Bearer ") ? h.slice(7).trim() : null;
    if (!token) throw Errors.unauthorized();
    const userId = await verifyAccessToken(ctx.db, token);
    if (!userId) throw Errors.unauthorized();
    req.userId = userId;
  };
}

export function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const r = schema.safeParse(data ?? {});
  if (!r.success) {
    // Bare feltnavn, aldri verdier (kan være samtaletekst).
    throw Errors.validation(`Ugyldige felt: ${r.error.issues.map((i) => i.path.join(".") || "(body)").join(", ")}`);
  }
  return r.data;
}

export async function authRoutes(app: FastifyInstance, ctx: AppContext) {
  const signupLimiter = new IpWindowLimiter(ctx.cfg.ANON_SIGNUPS_PER_IP_PER_HOUR, 3_600_000);

  const tokensResponse = async (userId: string, refreshTokenId: string, refreshToken?: string) => {
    const access = await issueAccessToken(ctx.db, userId, refreshTokenId, ctx.cfg.ACCESS_TOKEN_TTL_MINUTES);
    return {
      userId,
      ...(refreshToken ? { refreshToken } : {}),
      accessToken: access.token,
      accessExpiresAt: access.expiresAt.toISOString(),
    };
  };

  // Anonym konto: enheten får en langlivet nøkkel (Keychain) og et kortlivet tilgangstoken.
  app.post("/v1/auth/anonymous", async (req, reply) => {
    if (!signupLimiter.allow(req.ip)) {
      throw new AppError(429, "rate_limited", "For mange nye kontoer fra dette nettet. Prøv igjen senere.", true);
    }
    const result = await withTx(ctx.db, async (tx) => {
      const { rows } = await tx.query<{ id: string }>("INSERT INTO users DEFAULT VALUES RETURNING id");
      const userId = rows[0]!.id;
      const refresh = await issueRefreshToken(tx, userId);
      const access = await issueAccessToken(tx, userId, refresh.id, ctx.cfg.ACCESS_TOKEN_TTL_MINUTES);
      return {
        userId,
        refreshToken: refresh.token,
        accessToken: access.token,
        accessExpiresAt: access.expiresAt.toISOString(),
      };
    });
    reply.code(201);
    return result;
  });

  app.post("/v1/auth/token", async (req) => {
    const body = parse(z.object({ refreshToken: z.string().max(200) }), req.body);
    const r = await useRefreshToken(ctx.db, body.refreshToken);
    if (!r) throw Errors.unauthorized();
    return tokensResponse(r.userId, r.id);
  });

  // Sign in with Apple. Med gyldig Bearer-token kobles Apple-ID-en til nåværende anonym konto.
  app.post("/v1/auth/apple", async (req) => {
    if (!ctx.cfg.APPLE_BUNDLE_ID) {
      throw new AppError(501, "apple_not_configured", "Sign in with Apple er ikke satt opp på serveren.");
    }
    const body = parse(
      z.object({ identityToken: z.string().max(5000), rawNonce: z.string().min(16).max(200) }),
      req.body,
    );
    let sub: string;
    try {
      sub = (await verifyAppleIdentityToken(body.identityToken, body.rawNonce, ctx.cfg.APPLE_BUNDLE_ID, ctx.appleKeys))
        .sub;
    } catch {
      throw Errors.unauthorized();
    }
    const h = req.headers.authorization;
    const currentUser = h?.startsWith("Bearer ") ? await verifyAccessToken(ctx.db, h.slice(7)) : null;

    return withTx(ctx.db, async (tx) => {
      const existing = await tx.query<{ id: string }>("SELECT id FROM users WHERE apple_sub = $1", [sub]);
      let userId = existing.rows[0]?.id;
      if (!userId && currentUser) {
        await tx.query("UPDATE users SET apple_sub = $2, updated_at = now() WHERE id = $1 AND apple_sub IS NULL", [
          currentUser,
          sub,
        ]);
        userId = currentUser;
      }
      if (!userId) {
        userId = (await tx.query<{ id: string }>("INSERT INTO users (apple_sub) VALUES ($1) RETURNING id", [sub]))
          .rows[0]!.id;
      }
      const refresh = await issueRefreshToken(tx, userId);
      const access = await issueAccessToken(tx, userId, refresh.id, ctx.cfg.ACCESS_TOKEN_TTL_MINUTES);
      return {
        userId,
        refreshToken: refresh.token,
        accessToken: access.token,
        accessExpiresAt: access.expiresAt.toISOString(),
      };
    });
  });

  app.post("/v1/auth/logout", async (req, reply) => {
    const body = parse(z.object({ refreshToken: z.string().max(200) }), req.body);
    await ctx.db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1", [
      hashToken(body.refreshToken),
    ]);
    await ctx.db.query(
      "DELETE FROM access_tokens WHERE refresh_token_id IN (SELECT id FROM refresh_tokens WHERE token_hash = $1)",
      [hashToken(body.refreshToken)],
    );
    reply.code(204);
  });
}
