/**
 * Leter etter API-nøkler og leverandørdetaljer i iOS-kildekode eller en bygget .app-bundle.
 *
 *   npx tsx scripts/scan-client-secrets.ts ../ios
 *   npx tsx scripts/scan-client-secrets.ts path/til/Antipsykologen.app   (etter xcodebuild)
 *
 * Avslutter med kode 1 ved funn. Brukes også av test/02-no-secrets-in-client.test.ts.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PATTERNS: { id: string; re: RegExp }[] = [
  { id: "anthropic_key", re: /sk-ant-[A-Za-z0-9_-]{10,}/ },
  { id: "generic_sk_key", re: /\bsk-[A-Za-z0-9]{20,}/ },
  { id: "anthropic_env_name", re: /ANTHROPIC_API_KEY/ },
  { id: "x_api_key_header", re: /x-api-key/i },
  { id: "provider_host", re: /api\.anthropic\.com/ },
  { id: "bearer_literal", re: /Bearer [A-Za-z0-9_-]{30,}/ },
  { id: "private_key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

const SKIP_DIRS = new Set(["node_modules", ".git", "DerivedData", "xcuserdata"]);

export function scan(root: string): { file: string; pattern: string }[] {
  const hits: { file: string; pattern: string }[] = [];
  const walk = (p: string) => {
    const st = statSync(p);
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(path.basename(p))) return;
      for (const f of readdirSync(p)) walk(path.join(p, f));
      return;
    }
    if (st.size > 50 * 1024 * 1024) return;
    // Binærfiler leses som latin1 slik at ASCII-strenger i kompilert kode også fanges.
    const text = readFileSync(p).toString("latin1");
    for (const { id, re } of PATTERNS) if (re.test(text)) hits.push({ file: p, pattern: id });
  };
  walk(root);
  return hits;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const root = process.argv[2];
  if (!root) {
    console.error("Bruk: tsx scripts/scan-client-secrets.ts <mappe eller .app>");
    process.exit(2);
  }
  const hits = scan(root);
  if (hits.length) {
    for (const h of hits) console.error(`FUNN: ${h.pattern} i ${h.file}`);
    process.exit(1);
  }
  console.log(`Ingen nøkler eller leverandørdetaljer funnet i ${root}`);
}
