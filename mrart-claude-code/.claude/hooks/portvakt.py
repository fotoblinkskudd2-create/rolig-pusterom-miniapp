#!/usr/bin/env python3
"""PreToolUse-hook for Bash: blokkerer handlinger som krever menneskelig ja.

Leser hook-JSON fra stdin. Exit 2 = blokker (begrunnelse på stderr går til Claude).
Overstyring: operatøren kan skrive JA-fil `.mrart/ja.txt` med eksakt kommando på én linje.
Fila slettes etter bruk (engangs-ja).

Kommandoen tolkes med shlex før reglene kjøres, slik at sitater (g""it, "$HOME"),
globale git-flagg (git -C . push, git -c x=y push, git --no-pager push), kjeder
(&&, ;, |, $(...), `...`) og skall-innpakning (bash -c '...', eval) ikke omgår sperren.
Prinsipp: feil på trygg side. Kan kommandoen ikke tolkes, vurderes den både rå og grovt normalisert.
"""
import json, os, re, shlex, sys

# git-flagg som tar et argument i neste token (git [flagg] <underkommando>)
GIT_FLAGG_MED_ARG = {"-C", "-c", "--git-dir", "--work-tree", "--namespace",
                     "--exec-path", "--config-env", "--super-prefix", "--list-cmds"}
SKALL = {"sh", "bash", "zsh", "dash", "ksh", "fish"}

# Regler mot normalisert segmenttekst (sitater fjernet, ett segment om gangen)
REGLER = [
    (r"\bgh\s+(pr\s+(create|merge)|release|repo\s+(create|delete)|issue\s+create)\b", "GitHub-skrivehandling krever ja"),
    (r"\b(npm|pnpm|yarn)\s+publish\b|\btwine\s+upload\b|\bcargo\s+publish\b", "publisering av pakke krever ja"),
    (r"\b(vercel|netlify|firebase|fly|wrangler)\b.*\b(deploy|publish)\b|\bvercel\s+--prod\b", "deploy krever ja"),
    (r"\b(sendmail|mailx?|msmtp|mutt)\b", "e-postsending krever ja"),
    (r"\bcurl\b.*(-X\s*(POST|PUT|PATCH|DELETE)|--request\s*=?\s*(POST|PUT|PATCH|DELETE)"
     r"|--data\S*|--json\b|-d\s*\S|-F\s*\S|--form\b|-T\s*\S|--upload-file\b)", "nettverksskriving med curl krever ja"),
    (r"\brm\s+(-\S+\s+)*-[a-zA-Z]*[rR][a-zA-Z]*\s+(-\S+\s+)*(/|~/?|\$\{?HOME\}?/?|\*|\.\.?/?)(\s|$)",
     "rekursiv sletting av rot/hjem/alt er blokkert"),
    (r"\b(stripe|vipps|paypal)\b", "betalings-CLI krever ja"),
    (r"\bsecurity\s+find-generic-password\b|\b(cat|less|more|head|tail|cp|base64)\b.*(\.env\b|id_rsa|id_ed25519|\.ssh/)",
     "lesing av hemmeligheter er blokkert"),
]


def tokens(cmd: str) -> list:
    """Shlex med skilletegn som egne tokens. $( og backtick gjøres til skilletegn."""
    forbered = cmd.replace("$(", " ; ").replace("`", " ; ")
    try:
        lx = shlex.shlex(forbered, posix=True, punctuation_chars=";&|()<>")
        lx.whitespace_split = True
        lx.commenters = ""
        return list(lx)
    except ValueError:
        # ubalanserte sitater: grov normalisering, fortsatt feil på trygg side
        grov = re.sub(r"[\"'\\]", "", forbered)
        return re.sub(r"([;&|()<>])", r" \1 ", grov).split()


def segmenter(toks: list) -> list:
    segs, nå = [], []
    for t in toks:
        if t and all(ch in ";&|()<>" for ch in t):
            if nå: segs.append(nå)
            nå = []
        else:
            nå.append(t)
    if nå: segs.append(nå)
    return segs


def git_brudd(seg: list):
    """Finn git-kall i segmentet og returner grunn hvis underkommandoen krever ja."""
    for i, t in enumerate(seg):
        if os.path.basename(t) != "git":
            continue
        j = i + 1
        while j < len(seg) and seg[j].startswith("-"):
            flagg = seg[j].split("=", 1)[0]
            if flagg in GIT_FLAGG_MED_ARG and "=" not in seg[j] and not (flagg == "-C" and len(seg[j]) > 2):
                j += 1  # hopp over flaggets argument
            if flagg == "-c" and j < len(seg) and re.match(r"(?i)alias\.", seg[j]):
                return "git-alias definert i kommandolinjen krever ja"
            j += 1
        if j >= len(seg):
            continue
        sub = seg[j]
        if sub == "push":
            return "git push krever menneskelig ja"
        if sub == "remote" and j + 1 < len(seg) and seg[j + 1] in {"add", "set-url", "remove", "rm", "rename"}:
            return "endring av git remote krever ja"
        if sub == "config" and any(re.match(r"(?i)(alias\.|remote\.\S+\.(url|pushurl))", x) for x in seg[j + 1:]):
            return "git config av alias/remote-url krever ja"
    return None


def vurder(cmd: str, dybde: int = 0):
    if dybde > 4:
        return "for dyp skall-innpakning — blokkert"
    toks = tokens(cmd)
    # på tvers av segmenter: nedlasting pipet rett inn i et skall
    if re.search(r"\b(wget|curl)\b.*\|\s*(\S*/)?(sudo\s+)?(ba|z|da|k)?sh\b", " ".join(toks), re.IGNORECASE):
        return "kjøring av nedlastet skript er blokkert"
    for seg in segmenter(toks):
        # skall-innpakning: bash -c '...', eval ...
        for i, t in enumerate(seg):
            b = os.path.basename(t)
            if b in SKALL and "-c" in seg[i + 1:]:
                k = seg.index("-c", i + 1)
                if k + 1 < len(seg):
                    g = vurder(seg[k + 1], dybde + 1)
                    if g: return g
            if b == "eval" and i + 1 < len(seg):
                g = vurder(" ".join(seg[i + 1:]), dybde + 1)
                if g: return g
        g = git_brudd(seg)
        if g: return g
        tekst = " ".join(seg)
        for monster, grunn in REGLER:
            if re.search(monster, tekst, re.IGNORECASE):
                return grunn
    return None


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0
    cmd = (data.get("tool_input") or {}).get("command", "") or ""
    grunn = vurder(cmd)
    if not grunn:
        return 0
    root = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
    ja_fil = os.path.join(root, ".mrart", "ja.txt")
    if os.path.exists(ja_fil):
        with open(ja_fil, encoding="utf-8") as f:
            godkjent = f.read().strip()
        if godkjent == cmd.strip():
            os.remove(ja_fil)
            return 0
    sys.stderr.write(
        f"PORTVAKT: {grunn}. Kommando stoppet: {cmd!r}. "
        "Be operatøren om eksplisitt ja. Operatøren godkjenner ved å skrive den eksakte "
        "kommandoen i .mrart/ja.txt (engangs).\n")
    return 2


if __name__ == "__main__":
    sys.exit(main())
