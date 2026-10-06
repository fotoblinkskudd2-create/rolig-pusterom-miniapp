import { createHash } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";

const APPLE_ISSUER = "https://appleid.apple.com";
let appleJwks: JWTVerifyGetKey | null = null;

export interface AppleIdentity {
  sub: string;
}

/**
 * Verifiserer et identity token fra Sign in with Apple på serveren:
 * signatur mot Apples JWKS, utsteder, publikum (bundle-ID), utløp og nonce.
 * Se https://developer.apple.com/documentation/sign_in_with_apple/verifying-a-user
 */
export async function verifyAppleIdentityToken(
  identityToken: string,
  rawNonce: string,
  bundleId: string,
  keys: JWTVerifyGetKey = (appleJwks ??= createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"))),
): Promise<AppleIdentity> {
  const { payload } = await jwtVerify(identityToken, keys, {
    issuer: APPLE_ISSUER,
    audience: bundleId,
    algorithms: ["RS256"],
  });
  const expectedNonce = createHash("sha256").update(rawNonce, "utf8").digest("hex");
  if (payload.nonce !== expectedNonce) throw new Error("nonce mismatch");
  if (typeof payload.sub !== "string" || payload.sub.length === 0) throw new Error("missing sub");
  return { sub: payload.sub };
}
