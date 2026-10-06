import { afterEach, describe, expect, it } from "vitest";
import { Client, startServer, type TestServer } from "./helpers.js";

let s: TestServer;
afterEach(async () => s?.close());

const allContext = (s: TestServer) =>
  JSON.stringify(s.mock.chatRequests.map((r) => [r.systemDynamic, r.messages]));

describe("5. Slettede data kommer ikke tilbake gjennom minne", () => {
  it("minne avledet av slettet samtale forsvinner og brukes ikke i ny kontekst", async () => {
    s = await startServer({ mock: { reply: () => ["ok"] } });
    const c = await Client.anonymous(s.url);
    await c.req("PATCH", "/v1/me", { historyEnabled: true, memoryEnabled: true });
    const conv1 = await c.newConversation();
    await c.send(conv1, "Søsteren min heter Kari-Unik-123.");
    await c.req("POST", "/v1/memories", { content: "Søsteren heter Kari-Unik-123", sourceConversationId: conv1 });
    await c.req("POST", "/v1/memories", { content: "Manuelt minne uten kilde" });

    // Før sletting: minnet brukes.
    const conv2 = await c.newConversation();
    await c.send(conv2, "Hei");
    expect(s.mock.chatRequests.at(-1)!.systemDynamic).toContain("Kari-Unik-123");

    expect((await c.req("DELETE", `/v1/conversations/${conv1}`)).status).toBe(204);
    const mems = (await c.req("GET", "/v1/memories")).json.memories;
    expect(mems.map((m: any) => m.content)).toEqual(["Manuelt minne uten kilde"]);

    s.mock.chatRequests.length = 0;
    await c.send(conv2, "Husker du søsteren min?");
    expect(allContext(s)).not.toContain("Kari-Unik-123");
    expect(s.mock.chatRequests.at(-1)!.systemDynamic).toContain("Manuelt minne uten kilde");

    // Ingen rester i databasen.
    const { rows } = await s.db.query(
      `SELECT 'm' FROM messages WHERE content LIKE '%Kari-Unik-123%'
       UNION ALL SELECT 'mem' FROM memories WHERE content LIKE '%Kari-Unik-123%'
       UNION ALL SELECT 's' FROM conversation_summaries WHERE data::text LIKE '%Kari-Unik-123%'`,
    );
    expect(rows).toHaveLength(0);
  });

  it("minne av: minner brukes ikke i kontekst og kan ikke opprettes", async () => {
    s = await startServer({ mock: { reply: () => ["ok"] } });
    const c = await Client.anonymous(s.url);
    await c.req("PATCH", "/v1/me", { memoryEnabled: true });
    await c.req("POST", "/v1/memories", { content: "Hemmelig-minne-77" });
    await c.req("PATCH", "/v1/me", { memoryEnabled: false });
    const conv = await c.newConversation();
    await c.send(conv, "Hei");
    expect(allContext(s)).not.toContain("Hemmelig-minne-77");
    const r = await c.req("POST", "/v1/memories", { content: "nytt" });
    expect(r.status).toBe(409);
  });

  it("minner kan ses, korrigeres og slettes enkeltvis og samlet", async () => {
    s = await startServer();
    const c = await Client.anonymous(s.url);
    await c.req("PATCH", "/v1/me", { memoryEnabled: true });
    const m = await c.req("POST", "/v1/memories", { content: "Jobber i Bergen" });
    const upd = await c.req("PATCH", `/v1/memories/${m.json.id}`, { content: "Jobber i Bodø" });
    expect(upd.json.content).toBe("Jobber i Bodø");
    await c.req("POST", "/v1/memories", { content: "To" });
    expect((await c.req("DELETE", `/v1/memories/${m.json.id}`)).status).toBe(204);
    expect((await c.req("GET", "/v1/memories")).json.memories).toHaveLength(1);
    expect((await c.req("DELETE", "/v1/memories")).json.deleted).toBe(1);
  });

  it("slett all historikk fjerner samtaler, sammendrag og avledede minner", async () => {
    s = await startServer({ mock: { reply: () => ["ok"] } });
    const c = await Client.anonymous(s.url);
    await c.req("PATCH", "/v1/me", { historyEnabled: true, memoryEnabled: true });
    const conv = await c.newConversation();
    await c.send(conv, "Hei");
    await s.db.query("INSERT INTO conversation_summaries (conversation_id, through_seq, data) VALUES ($1, 1, '{}')", [conv]);
    await c.req("POST", "/v1/memories", { content: "fra samtale", sourceConversationId: conv });
    const r = await c.req("DELETE", "/v1/conversations");
    expect(r.json.deleted).toBe(1);
    const left = await s.db.query(
      "SELECT (SELECT count(*) FROM messages) m, (SELECT count(*) FROM conversation_summaries) s, (SELECT count(*) FROM memories) mem",
    );
    expect(left.rows[0]).toEqual({ m: "0", s: "0", mem: "0" });
  });

  it("kontosletting fjerner alt, og tokenet slutter å virke", async () => {
    s = await startServer({ mock: { reply: () => ["ok"] } });
    const c = await Client.anonymous(s.url);
    await c.req("PATCH", "/v1/me", { historyEnabled: true, memoryEnabled: true });
    const conv = await c.newConversation();
    await c.send(conv, "Hei");
    await c.req("POST", "/v1/memories", { content: "x" });
    await c.req("POST", "/v1/action-cards", { what: "a", when: "b", doneWhen: "c", ifStuck: "d" });
    expect((await c.req("DELETE", "/v1/me")).status).toBe(204);
    expect((await c.req("GET", "/v1/me")).status).toBe(401);
    const { rows } = await s.db.query(
      `SELECT (SELECT count(*) FROM users) u, (SELECT count(*) FROM messages) m, (SELECT count(*) FROM memories) mem,
              (SELECT count(*) FROM action_cards) a, (SELECT count(*) FROM usage_daily) us, (SELECT count(*) FROM refresh_tokens) rt`,
    );
    expect(rows[0]).toEqual({ u: "0", m: "0", mem: "0", a: "0", us: "0", rt: "0" });
  });

  it("historikk av: samtalen vises ikke i historikk og har utløpstid", async () => {
    s = await startServer({ mock: { reply: () => ["ok"] } });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation();
    await c.send(conv, "Hei");
    expect((await c.req("GET", "/v1/conversations")).json.conversations).toEqual([]);
    const g = await c.req("GET", `/v1/conversations/${conv}`);
    expect(g.json.conversation.persisted).toBe(false);
    expect(g.json.conversation.expiresAt).not.toBeNull();
    // Utløpt samtale er borte for klienten.
    await s.db.query("UPDATE conversations SET expires_at = now() - interval '1 minute' WHERE id = $1", [conv]);
    expect((await c.req("GET", `/v1/conversations/${conv}`)).status).toBe(404);
  });

  it("eksport inneholder brukerens data", async () => {
    s = await startServer({ mock: { reply: () => ["svar"] } });
    const c = await Client.anonymous(s.url);
    await c.req("PATCH", "/v1/me", { historyEnabled: true, memoryEnabled: true });
    const conv = await c.newConversation();
    await c.send(conv, "Min tekst");
    await c.req("POST", "/v1/memories", { content: "minne" });
    const e = await c.req("GET", "/v1/export");
    expect(e.json.format).toBe("antipsykologen-export-v1");
    expect(e.json.conversations[0].messages.map((m: any) => m.content)).toEqual(["Min tekst", "svar"]);
    expect(e.json.memories[0].content).toBe("minne");
  });
});
