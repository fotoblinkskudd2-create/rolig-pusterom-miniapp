#!/usr/bin/env bash
# Ren verifisering av én app: ren installasjon, bygg, domene/API-tester og e2e.
# Skriver testlogg med kommando, tidspunkt, exit-kode og utdrag til rapporter/<app-id>/TESTLOGG.md.
# Bruk: output/verify.sh <app-id>
set -u
APP="$1"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/output/apps/$APP"
REP="$ROOT/rapporter/$APP"
LOG="$REP/TESTLOGG.md"
mkdir -p "$REP"
cd "$DIR" || { echo "Fant ikke $DIR"; exit 2; }

{
  echo "# Testlogg: $APP"
  echo
  echo "Generert av \`output/verify.sh $APP\`."
  echo
  echo "- Tidspunkt (UTC): $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "- Node: $(node -v), npm: $(npm -v)"
  echo "- OS: $(uname -sr)"
  echo "- Kodeversjon: $(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo ukjent) (arbeidskopi kan ha uinnsjekkede endringer)"
  echo "- Nettleser: Chromium fra PLAYWRIGHT_BROWSERS_PATH (${PLAYWRIGHT_BROWSERS_PATH:-ikke satt})"
  echo
} > "$LOG"

FAIL=0
run() {
  local counts="$1"; shift
  local title="$1"; shift
  local out; out="$(mktemp)"
  local start; start=$(date -u +%H:%M:%S)
  "$@" >"$out" 2>&1
  local code=$?
  [ $code -ne 0 ] && [ "$counts" = web ] && FAIL=1
  {
    echo "## $title"
    echo
    echo "- Kommando: \`$*\`"
    echo "- Start: $start UTC, exit-kode: **$code**"
    echo
    echo '```'
    grep -vE 'ExperimentalWarning|trace-warnings|^\s*$' "$out" | sed 's/\x1b\[[0-9;]*m//g' | tail -n 40
    echo '```'
    echo
  } >> "$LOG"
  rm -f "$out"
  echo "$title: exit $code"
}

rm -rf node_modules dist dist-server
run web "Ren installasjon" npm ci --no-audit --no-fund
run web "Bygg (typesjekk klient + server, vite build)" npm run build
run web "Domene- og API-tester" npx vitest run tests/domain.test.ts tests/api.test.ts --reporter=verbose
run web "Ende-til-ende i Chromium (390 px, restart, offline, eksport)" npx vitest run tests/e2e.test.ts --reporter=verbose
run ios "Capacitor iOS-synk (genererer/oppdaterer Xcode-prosjekt, ikke native bygg)" npx cap sync ios
run ios "Native iOS-bygg" bash -c 'command -v xcodebuild || { echo "xcodebuild finnes ikke i dette miljøet (Linux). Native bygg ikke mulig her."; exit 3; }'

RESULT="$([ $FAIL -eq 0 ] && echo 'WEB: alle kontroller bestått' || echo 'WEB: FEIL – se logg')"
{ echo "## Samlet"; echo; echo "$RESULT. iOS: native bygg ikke kjørt – se stegene over."; } >> "$LOG"
echo "$RESULT"
echo "Logg: $LOG"
exit 0
