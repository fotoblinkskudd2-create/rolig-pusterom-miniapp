// JS-motstykke til felles/kontroll.py. Skriver resultat/kontroll.txt i oppdragsmappen.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { isDeepStrictEqual, inspect } from "node:util";

export async function kjor(navn, mappe, fn) {
  const linjer = []; let ok = 0, feil = 0;
  const vis = v => inspect(v, { depth: 4, breakLength: 200 });
  const k = {
    sjekk(b, c, d = "") { c ? ok++ : feil++; const l = `[${c ? "BESTÅTT" : "FEILET"}] ${b}${d !== "" ? "  — " + (typeof d === "string" ? d : vis(d)) : ""}`; linjer.push(l); console.log(l); return c; },
    lik(b, faktisk, forventet, tol) {
      const c = tol === undefined ? isDeepStrictEqual(faktisk, forventet) : Math.abs(faktisk - forventet) <= tol;
      return k.sjekk(b, c, `faktisk=${vis(faktisk)} forventet=${vis(forventet)}`);
    },
    kaster(b, f) { try { f(); } catch (e) { return k.sjekk(b, true, String(e.message || e)); } return k.sjekk(b, false, "ingen feil ble kastet"); },
    notat(t) { linjer.push("  · " + t); console.log("  · " + t); },
  };
  try { await fn(k); } catch (e) { k.sjekk("kontrollskriptet kjørte uten krasj", false, String(e.stack || e).split("\n").slice(0, 3).join(" ")); }
  mkdirSync(path.join(mappe, "resultat"), { recursive: true });
  writeFileSync(path.join(mappe, "resultat", "kontroll.txt"),
    [`# Kontroll: ${navn}`, `Kjørt: ${new Date().toISOString()}`, `Resultat: ${ok} bestått, ${feil} feilet`, "", ...linjer].join("\n") + "\n");
  console.log(`\n${ok} bestått, ${feil} feilet`);
  process.exitCode = feil ? 1 : 0;
}
