import { afterEach, describe, expect, it } from "vitest";
import { ProviderError } from "../src/model/provider.js";
import { Client, doneMessage, startServer, waitFor, type TestServer } from "./helpers.js";

let s: TestServer;
afterEach(async () => s?.close());

const slow = { reply: () => ["En ", "to ", "tre ", "fire ", "fem ", "seks ", "sju ", "åtte"], delayMs: 120 };

async function lastAssistant(c: Client, conv: string) {
  const g = await c.req("GET", `/v1/conversations/${conv}`);
  return g.json.messages.filter((m: any) => m.role === "assistant").at(-1);
}

describe("3. Avbrutt strømming vises som avbrutt", () => {
  it("klienten bryter forbindelsen: svaret lagres som cancelled med delvis tekst", async () => {
    s = await startServer({ mock: slow });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation();
    const ac = new AbortController();
    let deltas = 0;
    await c.send(conv, "Hei", {
      signal: ac.signal,
      onEvent: (e) => {
        if (e.event === "delta" && ++deltas === 2) ac.abort();
      },
    });
    const m = await waitFor(async () => {
      const a = await lastAssistant(c, conv);
      return a.status !== "generating" && a.status !== "created" ? a : null;
    });
    expect(m.status).toBe("cancelled");
    expect(m.incompleteReason).toBe("client_disconnected");
    expect(m.content.length).toBeGreaterThan(0);
    expect(m.content).not.toContain("åtte"); // ikke fullført
  });

  it("stopp-knappen (cancel-endepunkt) gir cancelled/user_cancelled og done-hendelse", async () => {
    s = await startServer({ mock: slow });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation();
    let assistantId = "";
    const r = await c.send(conv, "Hei", {
      onEvent: (e) => {
        if (e.event === "assistant_message") assistantId = e.data.message.id;
        if (e.event === "delta" && e.data.text === "to ") void c.req("POST", `/v1/messages/${assistantId}/cancel`);
      },
    });
    const done = doneMessage(r.events);
    expect(done.status).toBe("cancelled");
    expect(done.incompleteReason).toBe("user_cancelled");
    expect((await lastAssistant(c, conv)).status).toBe("cancelled");
  });

  it("avbrutt svar merkes som avbrutt i videre kontekst, ikke som fullført", async () => {
    s = await startServer({ mock: slow });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation();
    const ac = new AbortController();
    await c.send(conv, "Første", { signal: ac.signal, onEvent: (e) => e.event === "delta" && ac.abort() });
    await waitFor(async () => (await lastAssistant(c, conv)).status === "cancelled");
    s.mock.opts = { reply: () => ["ok"] };
    await c.send(conv, "Andre");
    const req = s.mock.chatRequests.at(-1)!;
    const assistantTurn = req.messages.find((m) => m.role === "assistant")!;
    expect(assistantTurn.content).toContain("[Svaret ble avbrutt her.]");
  });

  it("tidsavbrudd før første tekst gir failed/timeout med forståelig feilmelding", async () => {
    s = await startServer({ mock: { firstDelayMs: 2000 }, cfg: { MODEL_FIRST_TOKEN_TIMEOUT_MS: "200" } });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation();
    const r = await c.send(conv, "Hei");
    const err = r.events.find((e) => e.event === "error")!;
    expect(err.data.code).toBe("timeout");
    expect(err.data.message).toMatch(/tok for lang tid/);
    expect(doneMessage(r.events)).toMatchObject({ status: "failed", incompleteReason: "timeout" });
  });

  it("max_tokens markeres som ufullstendig", async () => {
    s = await startServer({ mock: { stop: "max_tokens" } });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation();
    const r = await c.send(conv, "Hei");
    expect(doneMessage(r.events)).toMatchObject({ status: "completed", incompleteReason: "max_tokens" });
  });

  it("modellfeil midt i: delvis tekst blir cancelled med provider_error, ikke fullført", async () => {
    let n = 0;
    s = await startServer();
    s.mock.streamChat = async (_req, onText) => {
      onText("Begynte ");
      n++;
      throw new ProviderError("overloaded", "x");
    };
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation();
    const r = await c.send(conv, "Hei");
    expect(n).toBe(1);
    expect(doneMessage(r.events)).toMatchObject({ status: "cancelled", incompleteReason: "provider_error" });
    expect(r.events.find((e) => e.event === "error")!.data.message).toMatch(/svarer ikke/);
  });
});
