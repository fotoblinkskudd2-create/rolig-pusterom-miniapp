// Felles hjelper for nettleserkontroller med forhåndsinstallert Playwright.
// Starter en lokal server (kommando), åpner Chromium og samler sjekker.
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

export async function ventPaa(url, ms = 15000) {
  const slutt = Date.now() + ms;
  while (Date.now() < slutt) {
    try { const r = await fetch(url); if (r.status < 500) return; } catch {}
    await new Promise(r => setTimeout(r, 150));
  }
  throw new Error("server svarte ikke: " + url);
}

export async function e2e(navn, mappe, { server, url, port }, fn) {
  const linjer = []; let ok = 0, feil = 0;
  const sjekk = (b, c, d = "") => { c ? ok++ : feil++; const l = `[${c ? "BESTÅTT" : "FEILET"}] ${b}${d !== "" ? "  — " + d : ""}`; linjer.push(l); console.log(l); return c; };
  let proc = null, browser = null;
  try {
    if (server) {
      proc = spawn(server[0], server.slice(1), { cwd: mappe, stdio: "ignore", env: { ...process.env, PORT: String(port) } });
      await ventPaa(url);
    }
    browser = await chromium.launch();
    const ctx = await browser.newContext({ acceptDownloads: true });
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    const konsollfeil = [];
    page.on("pageerror", e => konsollfeil.push(e.message));
    await fn({ page, ctx, browser, sjekk, url, notat: t => { linjer.push("  · " + t); console.log("  · " + t); } });
    sjekk("ingen JavaScript-feil i siden", konsollfeil.length === 0, konsollfeil.join(" | "));
  } catch (e) {
    sjekk("nettleserkontrollen kjørte uten krasj", false, String(e && e.stack || e).split("\n").slice(0, 3).join(" "));
  } finally {
    if (browser) await browser.close();
    if (proc) proc.kill();
  }
  mkdirSync(path.join(mappe, "resultat"), { recursive: true });
  writeFileSync(path.join(mappe, "resultat", "e2e.txt"),
    [`# Nettleserkontroll: ${navn}`, `Kjørt: ${new Date().toISOString()}`, `Resultat: ${ok} bestått, ${feil} feilet`, "", ...linjer].join("\n") + "\n");
  console.log(`\n${ok} bestått, ${feil} feilet`);
  process.exit(feil ? 1 : 0);
}
