import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { scan } from "../scripts/scan-client-secrets.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../..");

describe("2. API-nøkler finnes ikke i iOS-bundle eller klientkode", () => {
  it("iOS-kildekode, ressurser, plist og prosjektfil er rene", () => {
    const hits = scan(path.join(repo, "ios"));
    expect(hits).toEqual([]);
  });

  it("skanneren fanger faktisk en nøkkel (kontroll av testen)", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "scan-"));
    writeFileSync(path.join(dir, "Leak.swift"), 'let k = "sk-ant-api03-abcdefghijklmnopqrstuv"');
    writeFileSync(path.join(dir, "binary"), Buffer.concat([Buffer.from([0, 1, 2]), Buffer.from("api.anthropic.com")]));
    expect(scan(dir).map((h) => h.pattern).sort()).toEqual(["anthropic_key", "provider_host"]);
  });

  it(".env.example inneholder bare variabelnavn, ingen verdier for hemmeligheter", () => {
    const env = readFileSync(path.join(repo, "backend/.env.example"), "utf8");
    expect(env).toMatch(/^ANTHROPIC_API_KEY=$/m);
    expect(scan(path.join(repo, "backend/.env.example")).filter((h) => h.pattern !== "anthropic_env_name")).toEqual([]);
  });

  it("appens offline-kopi av hjelpetilbud er identisk med serverens kontrollerte konfigurasjon", () => {
    const server = JSON.parse(readFileSync(path.join(repo, "backend/config/hjelpetilbud.no.json"), "utf8"));
    const app = JSON.parse(readFileSync(path.join(repo, "ios/Antipsykologen/Resources/hjelpetilbud.no.json"), "utf8"));
    expect(app).toEqual(server);
  });
});
