#!/usr/bin/env bash
# Kvalitetsport for repoet. Kjør: bash tools/check.sh
# Avslutter med 1 ved første brutte regel.
set -u
cd "$(dirname "$0")/.."
fail=0
ok()   { printf 'OK    %s\n' "$1"; }
feil() { printf 'FEIL  %s\n' "$1"; fail=1; }

# 1. VERK.md er hel: 22 nummererte seksjoner, i rekkefølge.
hdr='^[0-9]{1,2}\. [A-ZÆØÅ][A-ZÆØÅ -]+$'
n=$(grep -cE "$hdr" VERK.md)
seq_ok=$(grep -E "$hdr" VERK.md | grep -oE '^[0-9]+' | tr -d . | paste -sd' ')
[ "$n" = 22 ] && [ "$seq_ok" = "$(seq -s' ' 1 22)" ] \
  && ok "VERK.md har seksjon 1–22" || feil "VERK.md: fant $n seksjoner ($seq_ok)"

# 2. Agentfilene peker på VERK.md.
grep -q '^@VERK.md' CLAUDE.md && grep -q '^@AGENTS.md' CLAUDE.md \
  && ok "CLAUDE.md importerer VERK.md og AGENTS.md" || feil "CLAUDE.md mangler import"
grep -q 'VERK.md' AGENTS.md && ok "AGENTS.md peker på VERK.md" || feil "AGENTS.md peker ikke på VERK.md"

# 3. Personvern: ingen nettverkskall eller eksterne ressurser i appen.
if grep -nE 'fetch\(|XMLHttpRequest|sendBeacon|WebSocket|<script[^>]+src=|<link[^>]+href="https?:|https?://' index.html isolation-mirror.html; then
  feil "Nettverk/ekstern ressurs funnet over (bryter lokal-first)"
else
  ok "Ingen nettverkskall eller eksterne ressurser"
fi

# 4. Inline-JS er syntaktisk gyldig (krever node).
if command -v node >/dev/null; then
  for f in index.html isolation-mirror.html; do
    tmp=$(mktemp --suffix=.js)
    awk '/<script>/{on=1;next} /<\/script>/{on=0} on' "$f" > "$tmp"
    if node --check "$tmp" 2>/dev/null; then ok "JS-syntaks $f"; else feil "JS-syntaks $f"; node --check "$tmp"; fi
    rm -f "$tmp"
  done
else
  printf 'HOPPET JS-syntaks (node mangler)\n'
fi

# 5. Lagringsnøkler i koden = nøkler dokumentert i RUN.md.
for key in $(grep -oE "localStorage\.(get|set)Item\('[a-zA-Z]+'" index.html isolation-mirror.html | grep -oE "'[a-zA-Z]+'" | tr -d "'" | sort -u); do
  grep -q "\`$key\`" RUN.md && ok "localStorage-nøkkel '$key' dokumentert" || feil "localStorage-nøkkel '$key' mangler i RUN.md"
done

exit $fail
