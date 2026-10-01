#!/usr/bin/env bash
# Oppretter en ny selvstendig app fra den felles malen (kopierer kjernen fra focusdump).
# Bruk: output/ny-app.sh <app-id> "<Visningsnavn>" "<Kort løfte>"
set -euo pipefail
ID="$1"; NAME="$2"; TAGLINE="${3:-}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
SRC="$ROOT/apps/focusdump"
DST="$ROOT/apps/$ID"
[ -e "$DST" ] && { echo "$DST finnes allerede"; exit 1; }
mkdir -p "$DST"/{server/app,src/app,public,tests,docs}
cp -r "$SRC/server/core" "$DST/server/"
cp -r "$SRC/src/core" "$DST/src/"
cp "$SRC/server/index.ts" "$DST/server/"
cp "$SRC/src/main.tsx" "$SRC/src/vite-env.d.ts" "$DST/src/"
cp "$SRC/tests/helpers.ts" "$DST/tests/"
cp "$SRC/public/sw.js" "$SRC/public/icon.svg" "$DST/public/"
cp "$SRC"/{tsconfig.json,tsconfig.server.json,vite.config.ts,.gitignore,package-lock.json} "$DST/"
sed -e "s/\"name\": \"focusdump\"/\"name\": \"$ID\"/" -e "s/\"description\": \".*\"/\"description\": \"$NAME – $TAGLINE\"/" "$SRC/package.json" > "$DST/package.json"
node -e "const f='$DST/package-lock.json';const l=JSON.parse(require('fs').readFileSync(f));l.name='$ID';l.packages[''].name='$ID';require('fs').writeFileSync(f,JSON.stringify(l,null,2)+'\n')"
sed -e "s/FocusDump/$NAME/g" -e "s/Tøm hodet. Velg én handling. Start fem minutter./$TAGLINE/" "$SRC/index.html" > "$DST/index.html"
cat > "$DST/public/manifest.webmanifest" <<JSON
{
  "name": "$NAME",
  "short_name": "$NAME",
  "description": "$TAGLINE",
  "lang": "nb",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f6f5f1",
  "theme_color": "#2f6b55",
  "icons": [{ "src": "/icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any" }]
}
JSON
cat > "$DST/capacitor.config.json" <<JSON
{
  "appId": "no.alexander.$ID",
  "appName": "$NAME",
  "webDir": "dist",
  "ios": { "contentInset": "always" }
}
JSON
echo "export const APP = { id: '$ID', name: '$NAME', version: '1.0.0' };" > "$DST/server/app/meta.ts"
cat > "$DST/server/app/index.ts" <<'TS'
import type { AppDef } from '../core/server.js';
import { APP } from './meta.js';
import { migrations } from './migrations.js';
import { routes } from './routes.js';

export const appDef: AppDef = { ...APP, migrations, routes };
TS
echo "Opprettet $DST. Skriv nå server/app/{domain,migrations,routes}.ts, server/seed.ts, src/app/{App.tsx,app.css}, tests/{domain,api,e2e}.test.ts og docs/."
