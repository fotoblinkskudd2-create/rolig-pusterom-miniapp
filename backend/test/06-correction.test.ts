import { afterEach, describe, expect, it } from "vitest";
import { guardSummary } from "../src/conversation/summary.js";
import { Client, doneMessage, startServer, type TestServer } from "./helpers.js";

let s: TestServer;
afterEach(async () => s?.close());

describe("6. «Du har misforstått» korrigerer videre kontekst", () => {
  it("markerer vurderingen, instruerer modellen, og merknaden følger med i senere svar", async () => {
    let n = 0;
    s = await startServer({
      mock: {
        reply: () => [["Det høres ut som du unngår konflikt med sjefen."], ["Greit. Hva er riktig?"], ["Ok."]][n++ % 3]!,
      },
    });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation("arbeid");
    const first = await c.send(conv, "Jeg sa ja til enda et prosjekt.");
    const wrongId = doneMessage(first.events).id;

    await c.send(conv, "Jeg unngår ikke konflikt. Jeg trenger pengene.", { kind: "correction" });
    const corrReq = s.mock.chatRequests.at(-1)!;
    expect(corrReq.systemDynamic).toContain("Brukeren har trykket «Du har misforstått»");
    const lastUser = corrReq.messages.at(-1)!;
    expect(lastUser.role).toBe("user");
    expect(lastUser.content).toContain("[Brukeren trykket «Du har misforstått».]");
    expect(lastUser.content).toContain("Jeg trenger pengene.");

    // Det korrigerte svaret er merket i databasen og i all videre kontekst.
    const g = await c.req("GET", `/v1/conversations/${conv}`);
    expect(g.json.messages.find((m: any) => m.id === wrongId).correctedAt).not.toBeNull();

    await c.send(conv, "Hva gjør jeg med prosjektet?");
    const later = s.mock.chatRequests.at(-1)!;
    const wrongTurn = later.messages.find((m) => m.content.includes("unngår konflikt med sjefen"))!;
    expect(wrongTurn.role).toBe("assistant");
    expect(wrongTurn.content).toContain("Brukeren har sagt at denne vurderingen bommet");
    // Korreksjonsinstruksen gjelder bare det ene svaret.
    expect(later.systemDynamic).not.toContain("har trykket «Du har misforstått»");
  });

  it("korrigering kan peke på et bestemt svar", async () => {
    s = await startServer({ mock: { reply: () => ["svar"] } });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation();
    const a1 = doneMessage((await c.send(conv, "En")).events).id;
    const a2 = doneMessage((await c.send(conv, "To")).events).id;
    await c.send(conv, "", { kind: "correction", correctsMessageId: a1 });
    const msgs = (await c.req("GET", `/v1/conversations/${conv}`)).json.messages;
    expect(msgs.find((m: any) => m.id === a1).correctedAt).not.toBeNull();
    expect(msgs.find((m: any) => m.id === a2).correctedAt).toBeNull();
  });

  it("sammendrag: korrigeringer beholdes og hypoteser blir ikke fakta", () => {
    const prev = {
      userFacts: ["Brukeren jobber i kommunen"],
      goals: [],
      agreedActions: [],
      corrections: ["Brukeren unngår ikke konflikt; trenger pengene"],
      openQuestions: [],
      hypotheses: ["Brukeren er redd for sjefen"],
    };
    const next = {
      userFacts: ["Brukeren jobber i kommunen", "Brukeren er redd for sjefen."],
      goals: ["Få mindre å gjøre"],
      agreedActions: [],
      corrections: [],
      openQuestions: [],
      hypotheses: [],
    };
    const g = guardSummary(prev, next);
    expect(g.userFacts).toEqual(["Brukeren jobber i kommunen"]);
    expect(g.hypotheses).toContain("Brukeren er redd for sjefen.");
    expect(g.corrections).toContain("Brukeren unngår ikke konflikt; trenger pengene");
  });
});
