import { afterEach, describe, expect, it } from "vitest";
import { Client, doneMessage, startServer, type TestServer } from "./helpers.js";

let s: TestServer;
afterEach(async () => s?.close());

describe("1. Bruker A får ikke tilgang til bruker Bs data", () => {
  it("samtaler, meldinger, avbrytelse, minner, handlingskort og eksport er isolert", async () => {
    s = await startServer();
    const a = await Client.anonymous(s.url);
    const b = await Client.anonymous(s.url);
    await b.req("PATCH", "/v1/me", { historyEnabled: true, memoryEnabled: true });
    const bConv = await b.newConversation();
    const sent = await b.send(bConv, "Hemmelig tekst fra B");
    const bAssistant = doneMessage(sent.events).id;
    const mem = await b.req("POST", "/v1/memories", { content: "B sitt minne", sourceConversationId: bConv });
    const card = await b.req("POST", "/v1/action-cards", {
      conversationId: bConv, what: "x", when: "y", doneWhen: "z", ifStuck: "w",
    });

    // A prøver alt: 404 (ikke 403) så A ikke får vite at ressursen finnes.
    expect((await a.req("GET", `/v1/conversations/${bConv}`)).status).toBe(404);
    expect((await a.req("PATCH", `/v1/conversations/${bConv}`, { tone: "skarp" })).status).toBe(404);
    expect((await a.req("DELETE", `/v1/conversations/${bConv}`)).status).toBe(404);
    expect((await a.send(bConv, "inntrenger")).status).toBe(404);
    expect((await a.req("POST", `/v1/messages/${bAssistant}/cancel`)).status).toBe(404);
    expect((await a.req("POST", `/v1/conversations/${bConv}/action-card-draft`, {})).status).toBe(404);
    expect((await a.req("PATCH", `/v1/memories/${mem.json.id}`, { content: "endret" })).status).toBe(404);
    expect((await a.req("DELETE", `/v1/memories/${mem.json.id}`)).status).toBe(404);
    expect((await a.req("PATCH", `/v1/action-cards/${card.json.id}`, { status: "done" })).status).toBe(404);
    expect((await a.req("DELETE", `/v1/action-cards/${card.json.id}`)).status).toBe(404);
    // A kan ikke knytte egne minner/kort til Bs samtale.
    await a.req("PATCH", "/v1/me", { memoryEnabled: true });
    expect((await a.req("POST", "/v1/memories", { content: "x", sourceConversationId: bConv })).status).toBe(404);

    // Lister og eksport for A er tomme.
    expect((await a.req("GET", "/v1/conversations")).json.conversations).toEqual([]);
    expect((await a.req("GET", "/v1/memories")).json.memories).toEqual([]);
    expect((await a.req("GET", "/v1/action-cards")).json.actionCards).toEqual([]);
    const exp = await a.req("GET", "/v1/export");
    expect(JSON.stringify(exp.json)).not.toContain("Hemmelig tekst fra B");
    expect(JSON.stringify(exp.json)).not.toContain("B sitt minne");
    // A slettet all historikk – Bs data er urørt.
    await a.req("DELETE", "/v1/conversations");
    await a.req("DELETE", "/v1/memories");
    expect((await b.req("GET", `/v1/conversations/${bConv}`)).status).toBe(200);
    expect((await b.req("GET", "/v1/memories")).json.memories).toHaveLength(1);
    // B sitt innhold ble ikke endret.
    const bView = await b.req("GET", `/v1/conversations/${bConv}`);
    expect(bView.json.conversation.tone).toBe("torr");
  });

  it("ugyldige ID-er gir 404, ikke 500", async () => {
    s = await startServer();
    const a = await Client.anonymous(s.url);
    expect((await a.req("GET", "/v1/conversations/ikke-en-uuid")).status).toBe(404);
    expect((await a.req("DELETE", "/v1/memories/123")).status).toBe(404);
  });
});
