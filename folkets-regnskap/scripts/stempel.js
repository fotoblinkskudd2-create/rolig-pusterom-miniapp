// Moderatorverktøy. Endrer status på en innmeldt sak etter at dokumentasjon er sett.
// Dokumentasjonen (vedtak, brev, epikrise) vises moderator utenfor systemet og lagres ALDRI her.
// Bruk: node scripts/stempel.js <id> dokumentert|ubekreftet
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { byggStatistikk } from './bygg.js';

const rot = join(dirname(fileURLToPath(import.meta.url)), '..');
const [id, status] = process.argv.slice(2);

if (!/^[0-9a-f-]{36}$/.test(id || '') || !['dokumentert', 'ubekreftet'].includes(status)) {
  console.error('Bruk: node scripts/stempel.js <id> dokumentert|ubekreftet');
  process.exit(1);
}

const fil = join(rot, 'data', 'innmeldt', `${id}.json`);
const sak = JSON.parse(await readFile(fil, 'utf8'));
sak.status = status;
await writeFile(fil, JSON.stringify(sak, null, 2) + '\n');
await byggStatistikk(rot);
console.log(`${id} → ${status}`);
