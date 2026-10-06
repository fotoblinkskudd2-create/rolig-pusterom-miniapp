import { afterEach, describe, expect, it } from "vitest";
import { Client, startServer, type TestServer } from "./helpers.js";

let s: TestServer;
afterEach(async () => s?.close());

describe("logger inneholder ikke samtaletekst, hemmeligheter eller IP", () => {
  it("hele flyten, inkludert feil og sikkerhetssignal", async () => {
    s = await startServer({ mock: { reply: () => ["SVAR-HEMMELIG-9"] }, cfg: { SAFETY_MODEL_CHECK: "off" } });
    const c = await Client.anonymous(s.url);
    await c.req("PATCH", "/v1/me", { memoryEnabled: true, historyEnabled: true });
    const conv = await c.newConversation();
    await c.send(conv, "BRUKER-HEMMELIG-1 han slo meg");
    await c.send(conv, "x".repeat(5000) + "LANG-HEMMELIG-2");
    await c.req("POST", "/v1/memories", { content: "MINNE-HEMMELIG-3" });
    await c.req("POST", "/v1/conversations", { topic: "ugyldig-HEMMELIG-4" });
    await fetch(`${s.url}/v1/conversations`, {
      method: "POST",
      headers: { authorization: `Bearer ${c.token}`, "content-type": "application/json" },
      body: "{JSON-HEMMELIG-5",
    });
    // Serverens egen «listening»-linje viser bindeadressen; den er ikke en klient-IP.
    const all = s.logs.filter((l) => !l.includes("Server listening")).join("");
    expect(all.length).toBeGreaterThan(0);
    for (const secret of ["BRUKER-HEMMELIG-1", "LANG-HEMMELIG-2", "MINNE-HEMMELIG-3", "HEMMELIG-4", "JSON-HEMMELIG-5", "SVAR-HEMMELIG-9", c.token, c.refreshToken, "127.0.0.1"]) {
      expect(all).not.toContain(secret);
    }
    // Men driftsinformasjon finnes.
    expect(all).toContain("generation finished");
    expect(all).toContain("safety assessed");
  });
});
