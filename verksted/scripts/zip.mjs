// Pakker ferdig bygg + kildekode til ../leveranse/. Kjør etter `npm run build`.
import { execSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';

mkdirSync('../leveranse', { recursive: true });
for (const f of ['verksted-app.zip', 'verksted-kildekode.zip']) rmSync(`../leveranse/${f}`, { force: true });
execSync('cd dist && zip -qr ../../leveranse/verksted-app.zip .', { stdio: 'inherit' });
execSync('zip -qr ../leveranse/verksted-kildekode.zip . -x "node_modules/*" "dist/*" "shots/*"', { stdio: 'inherit' });
console.log(execSync('ls -la ../leveranse').toString());
