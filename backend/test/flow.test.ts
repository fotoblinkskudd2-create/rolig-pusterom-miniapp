import { afterEach, describe, expect, it } from "vitest";
import { Client, doneMessage, startServer, text, type TestServer } from "./helpers.js";
import { MOCK_PREFIX } from "../src/model/mock.js";

let s: TestServer;
afterEach(async () => s?.close());

describe("grunnflyt: melding → backend → modell → strømmet svar", () => {
  it("strømmer svar i biter og lagrer fullført svar", async () => {
    s = await startServer({ mock: { reply: () => ["Du har ", "forklart det. ", "Hva gjør du nå?"], delayMs: 20 } });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation("utsettelse");
    const r = await c.send(conv, "Jeg skal skrive søknaden, men rydder kjøleskapet i stedet.");
    expect(r.status).toBe(200);
    const kinds = r.events.map((e) => e.event);
    expect(kinds[0]).toBe("user_message");
    expect(kinds[1]).toBe("assistant_message");
    expect(kinds.filter((k) => k === "delta").length).toBe(3);
    expect(kinds.at(-1)).toBe("done");
    expect(text(r.events)).toBe("Du har forklart det. Hva gjør du nå?");
    const done = doneMessage(r.events);
    expect(done.status).toBe("completed");

    const g = await c.req("GET", `/v1/conversations/${conv}`);
    expect(g.json.messages.map((m: any) => [m.role, m.status])).toEqual([
      ["user", "completed"],
      ["assistant", "completed"],
    ]);
    expect(g.json.messages[1].content).toBe("Du har forklart det. Hva gjør du nå?");
  });

  it("meta viser tydelig at mock ikke er en modell", async () => {
    s = await startServer();
    const c = await Client.anonymous(s.url);
    const meta = await c.req("GET", "/v1/meta");
    expect(meta.json.provider).toBe("mock");
    expect(meta.json.modelBacked).toBe(false);
    const conv = await c.newConversation();
    const r = await c.send(conv, "Hei");
    expect(text(r.events).startsWith(MOCK_PREFIX)).toBe(true);
  });

  it("krever innlogging", async () => {
    s = await startServer();
    const res = await fetch(`${s.url}/v1/conversations`);
    expect(res.status).toBe(401);
    const bad = await fetch(`${s.url}/v1/conversations`, { headers: { authorization: "Bearer apa_feil" } });
    expect(bad.status).toBe(401);
  });

  it("fornyer tilgangstoken med enhetsnøkkel, og utlogging trekker den tilbake", async () => {
    s = await startServer();
    const c = await Client.anonymous(s.url);
    const t = await c.req("POST", "/v1/auth/token", { refreshToken: c.refreshToken });
    expect(t.status).toBe(200);
    expect(t.json.userId).toBe(c.userId);
    await c.req("POST", "/v1/auth/logout", { refreshToken: c.refreshToken });
    const t2 = await c.req("POST", "/v1/auth/token", { refreshToken: c.refreshToken });
    expect(t2.status).toBe(401);
  });

  it("helsesjekk", async () => {
    s = await startServer();
    expect((await fetch(`${s.url}/healthz`)).status).toBe(200);
    const r = await fetch(`${s.url}/readyz`);
    expect(await r.json()).toMatchObject({ ok: true, db: "ok" });
  });
});
