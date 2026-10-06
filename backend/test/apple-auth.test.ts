import { createHash } from "node:crypto";
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from "jose";
import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { testConfig } from "../src/config.js";
import { getDb, resetDb } from "./helpers.js";

// Verifiserer Sign in with Apple-logikken med lokalt genererte nøkler (ikke Apples ekte nøkler).
let close: (() => Promise<void>) | null = null;
afterEach(async () => close?.());

async function setup() {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const jwk = { ...(await exportJWK(publicKey)), kid: "k1", alg: "RS256" };
  const keys = createLocalJWKSet({ keys: [jwk] });
  const db = await getDb();
  await resetDb(db);
  const { app } = await buildApp({ cfg: testConfig({ APPLE_BUNDLE_ID: "no.example.antipsykologen" }), db, appleKeys: keys });
  close = () => app.close();
  const sign = (claims: Record<string, unknown>, opts: { aud?: string; iss?: string; exp?: string } = {}) =>
    new SignJWT(claims)
      .setProtectedHeader({ alg: "RS256", kid: "k1" })
      .setIssuer(opts.iss ?? "https://appleid.apple.com")
      .setAudience(opts.aud ?? "no.example.antipsykologen")
      .setIssuedAt()
      .setExpirationTime(opts.exp ?? "5m")
      .sign(privateKey);
  return { app, sign };
}

const nonce = "a-raw-nonce-that-is-long-enough";
const hashed = createHash("sha256").update(nonce).digest("hex");

describe("Sign in with Apple – serververifisering", () => {
  it("godtar gyldig token og gir samme konto ved ny innlogging", async () => {
    const { app, sign } = await setup();
    const tok = await sign({ sub: "apple-user-1", nonce: hashed });
    const r1 = await app.inject({ method: "POST", url: "/v1/auth/apple", payload: { identityToken: tok, rawNonce: nonce } });
    expect(r1.statusCode).toBe(200);
    const r2 = await app.inject({ method: "POST", url: "/v1/auth/apple", payload: { identityToken: await sign({ sub: "apple-user-1", nonce: hashed }), rawNonce: nonce } });
    expect(r2.json().userId).toBe(r1.json().userId);
  });

  it("kobler Apple-ID til eksisterende anonym konto", async () => {
    const { app, sign } = await setup();
    const anon = (await app.inject({ method: "POST", url: "/v1/auth/anonymous" })).json();
    const r = await app.inject({
      method: "POST", url: "/v1/auth/apple",
      headers: { authorization: `Bearer ${anon.accessToken}` },
      payload: { identityToken: await sign({ sub: "apple-user-2", nonce: hashed }), rawNonce: nonce },
    });
    expect(r.json().userId).toBe(anon.userId);
  });

  for (const [name, mk] of [
    ["feil publikum", (sign: any) => sign({ sub: "x", nonce: hashed }, { aud: "com.other.app" })],
    ["feil utsteder", (sign: any) => sign({ sub: "x", nonce: hashed }, { iss: "https://evil.example" })],
    ["feil nonce", (sign: any) => sign({ sub: "x", nonce: "feil" })],
    ["utløpt", (sign: any) => sign({ sub: "x", nonce: hashed }, { exp: "-1m" })],
  ] as const) {
    it(`avviser ${name}`, async () => {
      const { app, sign } = await setup();
      const r = await app.inject({ method: "POST", url: "/v1/auth/apple", payload: { identityToken: await mk(sign), rawNonce: nonce } });
      expect(r.statusCode).toBe(401);
    });
  }

  it("avviser token signert med en annen nøkkel", async () => {
    const { app } = await setup();
    const other = await generateKeyPair("RS256");
    const tok = await new SignJWT({ sub: "x", nonce: hashed })
      .setProtectedHeader({ alg: "RS256", kid: "k1" })
      .setIssuer("https://appleid.apple.com").setAudience("no.example.antipsykologen").setExpirationTime("5m")
      .sign(other.privateKey);
    const r = await app.inject({ method: "POST", url: "/v1/auth/apple", payload: { identityToken: tok, rawNonce: nonce } });
    expect(r.statusCode).toBe(401);
  });
});
