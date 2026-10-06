import { afterEach, describe, expect, it } from "vitest";
import { acuteTemplate } from "../src/safety/assess.js";
import { RESOURCE_CONFIG } from "../src/safety/resources.js";
import { screen } from "../src/safety/screener.js";
import { Client, doneMessage, startServer, text, type TestServer } from "./helpers.js";

let s: TestServer;
afterEach(async () => s?.close());

describe("screener: kontekst, negasjon, sitat og usikkerhet", () => {
  const cases: [string, string][] = [
    ["Han slo meg i går da han var full.", "concern"],
    ["Samboeren min truer med å drepe meg hvis jeg går.", "concern"],
    ["Jeg er livredd for ham når han drikker.", "concern"],
    ["Han sa «jeg dreper deg» og knuste en tallerken.", "concern"],
    ["Jeg vil ta livet mitt.", "concern"],
    ["Jeg har bestemt meg for å ta livet mitt i kveld. Pillene ligger klare.", "acute"],
    ["Han står utenfor døra med kniv.", "acute"],
    ["Jeg har aldri tenkt å ta livet mitt, men jeg er sliten.", "uncertain"],
    ["I filmen sier hun «jeg vil dø», og det traff meg.", "uncertain"],
    ["Jeg kunne drept ham for at han lot oppvasken stå.", "uncertain"],
    ["Venninnen min snakker om å ta livet sitt.", "concern"],
    ["Jeg orker ikke mer av dette prosjektet.", "uncertain"],
    ["Mandager dreper meg.", "none"],
    ["Denne jobben tar livet av meg.", "none"],
    ["Da truet samboeren meg med kniven.", "concern"],
    ["Han tar telefonen min og får ikke lov til å møte venner.", "concern"],
    ["Jeg døde av latter da han falt i snøen.", "none"],
    ["Han legger aldri inn oppvasken og jeg er så lei.", "none"],
    ["Vi krangler om penger hele tiden.", "none"],
  ];
  for (const [input, expected] of cases) {
    it(`${expected}: ${input}`, () => {
      expect(screen(input).level).toBe(expected);
    });
  }
  it("returnerer aldri brukerens tekst", () => {
    const r = screen("Han slo meg i går.");
    expect(JSON.stringify(r)).not.toContain("slo");
  });
});

describe("7. Vold eller selvskading stopper mørk humor", () => {
  it("voldssignal: humor av, sikkerhetsmodus, hjelpetilbud – og det varer i tråden", async () => {
    s = await startServer({ mock: { reply: () => ["Er du trygg nå?"] }, cfg: { SAFETY_MODEL_CHECK: "off" } });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation("parforhold", { darkHumor: true, tone: "skarp" });

    await c.send(conv, "Han glemte bursdagen min igjen.");
    expect(s.mock.chatRequests.at(-1)!.systemDynamic).toContain("Brukeren har slått på mørk humor");

    const r = await c.send(conv, "I går slo han meg da jeg sa fra.");
    const sys = s.mock.chatRequests.at(-1)!.systemDynamic;
    expect(sys).toContain("Mørk humor er AV");
    expect(sys).toContain("SIKKERHETSMODUS");
    expect(sys).toContain("Ikke anbefal konfrontasjon");
    expect(sys).toContain("Tone: mild"); // skarp tone overstyres
    expect(sys).not.toContain("slått på mørk humor");
    const safety = r.events.find((e) => e.event === "safety")!;
    expect(safety.data.level).toBe("concern");
    expect(safety.data.resources.map((x: any) => x.phone)).toEqual(expect.arrayContaining(["112", "116 006"]));

    // Neste, nøytrale melding: fortsatt ingen humor.
    await c.send(conv, "Uansett. Hva med ferien?");
    expect(s.mock.chatRequests.at(-1)!.systemDynamic).toContain("Mørk humor er AV");
    // Humor kan ikke slås på igjen i tråden.
    const patch = await c.req("PATCH", `/v1/conversations/${conv}`, { darkHumor: true });
    expect(patch.status).toBe(409);
  });

  it("akutt selvskading: fast svar uten modell og uten humor", async () => {
    s = await startServer({ cfg: { SAFETY_MODEL_CHECK: "off" } });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation("utsettelse", { darkHumor: true });
    const r = await c.send(conv, "Jeg har bestemt meg for å ta livet mitt i natt.");
    expect(s.mock.chatRequests).toHaveLength(0);
    expect(text(r.events)).toContain("113");
    expect(text(r.events)).toContain("legger humoren helt bort");
    expect(doneMessage(r.events).generatedBy).toBe("safety_template");
    const safety = r.events.find((e) => e.event === "safety")!;
    expect(safety.data.level).toBe("acute");
  });

  it("modellklassifisering fanger signal screeneren ikke ser, og kan ikke senke et tydelig signal", async () => {
    s = await startServer({
      mock: {
        reply: () => ["ok"],
        safety: (req) =>
          req.user.includes("forsvinne fra alt")
            ? { level: "concern", categories: ["self_harm"], rationale: "x" }
            : { level: "none", categories: [], rationale: "x" },
      },
      cfg: { SAFETY_MODEL_CHECK: "always" },
    });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation("annet", { darkHumor: true });
    const r1 = await c.send(conv, "Jeg tenker mye på å bare forsvinne fra alt, for godt og alltid.");
    expect(r1.events.find((e) => e.event === "safety")?.data.level).toBe("concern");

    const conv2 = await c.newConversation("parforhold", { darkHumor: true });
    const r2 = await c.send(conv2, "Han slo meg.");
    // Modellen sier «none», men screeneren så et tydelig signal.
    expect(r2.events.find((e) => e.event === "safety")?.data.level).toBe("concern");
  });

  it("modellklassifisering kan avkrefte svake signaler (benektelse)", async () => {
    s = await startServer({
      mock: { reply: () => ["ok"], safety: () => ({ level: "none", categories: [], rationale: "x" }) },
      cfg: { SAFETY_MODEL_CHECK: "always" },
    });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation("annet", { darkHumor: true });
    await c.send(conv, "Jeg har aldri vært suicidal, bare lat.");
    expect(s.mock.chatRequests.at(-1)!.systemDynamic).toContain("Brukeren har slått på mørk humor");
  });

  it("feiler modellklassifiseringen, brukes screeneren", async () => {
    s = await startServer({
      mock: { reply: () => ["ok"], safety: () => { throw new Error("nede"); } },
      cfg: { SAFETY_MODEL_CHECK: "always" },
    });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation("parforhold", { darkHumor: true });
    const r = await c.send(conv, "Han truet med å drepe meg.");
    expect(r.events.find((e) => e.event === "safety")?.data.level).toBe("concern");
  });

  it("numre i det faste svaret finnes i den kontrollerte konfigurasjonen", () => {
    const configured = new Set(RESOURCE_CONFIG.resources.map((r) => r.phone));
    for (const cats of [["self_harm"], ["violence_victim"]] as const) {
      const nums = acuteTemplate([...cats]).match(/\b\d{3}(?: \d{3})?\b|\b\d{2} \d{2} \d{2} \d{2}\b/g) ?? [];
      for (const n of nums) expect(configured.has(n)).toBe(true);
    }
    expect(RESOURCE_CONFIG.checkedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(RESOURCE_CONFIG.country).toBe("NO");
  });
});
