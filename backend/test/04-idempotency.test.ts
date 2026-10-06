import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { Client, doneMessage, startServer, text, waitFor, type TestServer } from "./helpers.js";

let s: TestServer;
afterEach(async () => s?.close());

async function count(s: TestServer, conv: string) {
  const { rows } = await s.db.query<{ role: string; n: string }>(
    "SELECT role, count(*) AS n FROM messages WHERE conversation_id = $1 GROUP BY role",
    [conv],
  );
  return Object.fromEntries(rows.map((r) => [r.role, Number(r.n)]));
}

describe("4. Gjentatt forespørsel skaper ikke doble meldinger", () => {
  it("samme clientMessageId etter fullført svar: avspilling, ingen ny melding, intet nytt modellkall", async () => {
    s = await startServer({ mock: { reply: () => ["Svar."] } });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation();
    const id = randomUUID();
    const first = await c.send(conv, "Hei", { clientMessageId: id });
    const second = await c.send(conv, "Hei", { clientMessageId: id });
    expect(await count(s, conv)).toEqual({ user: 1, assistant: 1 });
    expect(s.mock.chatRequests).toHaveLength(1);
    expect(doneMessage(second.events).id).toBe(doneMessage(first.events).id);
    expect(second.events[0]!.data.replay).toBe(true);
  });

  it("samtidige like forespørsler gir én brukermelding", async () => {
    s = await startServer({ mock: { reply: () => ["a", "b"], delayMs: 50 } });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation();
    const id = randomUUID();
    const results = await Promise.all([1, 2, 3].map(() => c.send(conv, "Hei", { clientMessageId: id })));
    const statuses = results.map((r) => r.status);
    expect(statuses.every((st) => st === 200 || st === 409)).toBe(true);
    await waitFor(async () => {
      const { rows } = await s.db.query("SELECT 1 FROM messages WHERE status IN ('created','generating')");
      return rows.length === 0;
    });
    expect((await count(s, conv)).user).toBe(1);
  });

  it("nytt forsøk etter avbrudd: samme brukermelding, nytt svar", async () => {
    s = await startServer({ mock: { reply: () => ["a ", "b ", "c ", "d"], delayMs: 80 } });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation();
    const id = randomUUID();
    const ac = new AbortController();
    await c.send(conv, "Hei", { clientMessageId: id, signal: ac.signal, onEvent: (e) => e.event === "delta" && ac.abort() });
    await waitFor(async () => {
      const { rows } = await s.db.query("SELECT 1 FROM messages WHERE status = 'cancelled'");
      return rows.length === 1;
    });
    const retry = await c.send(conv, "Hei", { clientMessageId: id });
    expect(doneMessage(retry.events).status).toBe("completed");
    expect(text(retry.events)).toBe("a b c d");
    expect(await count(s, conv)).toEqual({ user: 1, assistant: 2 });
    // Kun siste svar brukes videre i kontekst.
    await c.send(conv, "Neste");
    const turns = s.mock.chatRequests.at(-1)!.messages;
    expect(turns.filter((t) => t.role === "assistant")).toHaveLength(1);
    expect(turns.filter((t) => t.role === "assistant")[0]!.content).toBe("a b c d");
  });

  it("samme ID med annen tekst avvises", async () => {
    s = await startServer();
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation();
    const id = randomUUID();
    await c.send(conv, "Hei", { clientMessageId: id });
    const r = await c.send(conv, "Noe annet", { clientMessageId: id });
    expect(r.status).toBe(409);
    expect(r.json.error.code).toBe("idempotency_conflict");
  });

  it("ny melding mens et svar genereres avvises med 409", async () => {
    s = await startServer({ mock: { reply: () => ["a", "b", "c"], delayMs: 150 } });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation();
    const p = c.send(conv, "Første");
    await new Promise((r) => setTimeout(r, 100));
    const r = await c.send(conv, "Andre");
    expect(r.status).toBe(409);
    expect(r.json.error.code).toBe("generation_in_progress");
    await p;
  });
});
