import { createHash, randomBytes } from "node:crypto";
import type { Queryable } from "../db.js";

export const hashToken = (token: string): Buffer => createHash("sha256").update(token, "utf8").digest();
const newToken = (prefix: string) => `${prefix}_${randomBytes(32).toString("base64url")}`;

export interface IssuedTokens {
  refreshToken?: string;
  accessToken: string;
  accessExpiresAt: string;
}

export async function issueRefreshToken(db: Queryable, userId: string): Promise<{ id: string; token: string }> {
  const token = newToken("apr");
  const { rows } = await db.query<{ id: string }>(
    "INSERT INTO refresh_tokens (user_id, token_hash) VALUES ($1, $2) RETURNING id",
    [userId, hashToken(token)],
  );
  return { id: rows[0]!.id, token };
}

export async function issueAccessToken(
  db: Queryable,
  userId: string,
  refreshTokenId: string | null,
  ttlMinutes: number,
): Promise<{ token: string; expiresAt: Date }> {
  const token = newToken("apa");
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
  await db.query(
    "INSERT INTO access_tokens (user_id, refresh_token_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)",
    [userId, refreshTokenId, hashToken(token), expiresAt],
  );
  return { token, expiresAt };
}

/** Returnerer bruker-ID for et gyldig tilgangstoken, ellers null. */
export async function verifyAccessToken(db: Queryable, token: string): Promise<string | null> {
  if (!/^apa_[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const { rows } = await db.query<{ user_id: string }>(
    "SELECT user_id FROM access_tokens WHERE token_hash = $1 AND expires_at > now()",
    [hashToken(token)],
  );
  return rows[0]?.user_id ?? null;
}

export async function useRefreshToken(db: Queryable, token: string): Promise<{ id: string; userId: string } | null> {
  if (!/^apr_[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const { rows } = await db.query<{ id: string; user_id: string }>(
    `UPDATE refresh_tokens SET last_used_at = now()
     WHERE token_hash = $1 AND revoked_at IS NULL
     RETURNING id, user_id`,
    [hashToken(token)],
  );
  const r = rows[0];
  return r ? { id: r.id, userId: r.user_id } : null;
}
