#!/usr/bin/env python3
"""Agentbedrift: agenter som tar en idé helt til prototype, debugger, markedsfører og logger.

Kjør i 48 timer:   python3 agentbedrift/bedrift.py --timer 48
Én full runde:     python3 agentbedrift/bedrift.py --en-runde

Ingen avhengigheter. Bruker Claude-API hvis ANTHROPIC_API_KEY er satt, ellers lokale maler.
Kø og produktliste lagres etter hver oppgave, så et avbrutt løp fortsetter der det slapp.
"""
import argparse
import datetime
import html
import html.parser
import json
import os
import random
import time
import urllib.request
import xml.etree.ElementTree as ET

HER = os.path.dirname(os.path.abspath(__file__))
KJORING = os.path.join(HER, "kjoring")
PRODUKTER_DIR = os.path.join(HER, "produkter")
TILSTAND = os.path.join(KJORING, "tilstand.json")
LOGG_FIL = os.path.join(KJORING, "logg.jsonl")
MODELL = os.environ.get("BEDRIFT_MODELL", "claude-haiku-5-5")

# ---------------------------------------------------------------- produkter

PRODUKTER_START = [
    {
        "slug": "rentevekkeren",
        "navn": "Rentevekkeren",
        "problem": "Renta tikker opp mens du later som du sover",
        "bruker": "Den som har gjeld, en telefon full av varsler og under tre måneder mellom seg og kaos",
        "funksjoner": [
            "Viser rentetelling per sekund, lydløst, på skrivebordet",
            "Du legger inn saldo og rente, den regner resten",
            "Skjermen blir rød når døgnrenta er dyrere enn kaffebudsjettet",
        ],
        "fysisk": True,
        "hook": "Jeg stirrer på skjermen mens renta tikker opp som en bombe som aldri eksploderer, "
                "mens en del av hodet mitt kjøper robotstøvsuger på avbetaling og ler av meg mens jeg teller smuler.",
    },
    {
        "slug": "brevkniven",
        "navn": "Brevkniven",
        "problem": "Konvolutter som venter på deg som en dom med frimerke",
        "bruker": "Den som har en bunke ulest post og en søppelkasse som ikke er stor nok",
        "funksjoner": [
            "Blad som kutter konvolutten rent, uten å rive opp nervene",
            "Håndtak med hull, så den kan henges på veggen som et trofé",
            "Fysisk og lydløs, ingen app som sender deg nye varsler",
        ],
        "fysisk": True,
        "hook": "Konvolutten ligger på kjøkkenbordet som en dødsdom med frimerke. "
                "Hånda skjelver, kniven er kald, og jeg kutter den i to som om det var en dårlig vits.",
    },
    {
        "slug": "pustekortet",
        "navn": "Pustekortet",
        "problem": "Hodet kjører løp, kroppen har ikke fått beskjed",
        "bruker": "Den som trenger en eske med pusteøvelser de faktisk finner frem til når det brenner",
        "funksjoner": [
            "Eske til 52 kort, én øvelse per kort",
            "Hvert kort har inn-hold-ut-tid trykt rett på",
            "Får plass ved siden av telefonen, der panikken bor",
        ],
        "fysisk": True,
        "hook": "Hjertet hamrer som om noen står på døra med et inkassobrev. Jeg fomler etter kortet, "
                "får feil kort, to ord: pust ut. Så gjør jeg det, og det funker, bare fordi jeg ikke ga opp.",
    },
    {
        "slug": "impulsvakten",
        "navn": "Impulsvakten",
        "problem": "Handlekurven vet mer om deg enn du gjør",
        "bruker": "Den som har kortinfo lagret på tre nettbutikker og fortsatt synes det er en god idé",
        "funksjoner": [
            "Du setter en grense i kroner for hver handel",
            "Stopper handelen med en pause og et spørsmål som føles personlig",
            "Krever en setning før du kan kjøpe likevel",
        ],
        "fysisk": False,
        "hook": "Klokka er 02:14. Handlekurven er full av ting jeg ikke trenger, og fingeren min trykker på Kjøp "
                "som om den har en egen vilje. Den har ikke. Det har bare jeg.",
    },
    {
        "slug": "kaosdagboken",
        "navn": "Kaosdagboken",
        "problem": "Hodet glemmer alt som føltes riktig å skrive ned",
        "bruker": "Den som vil se mønsteret selv og slippe å stole på egen hukommelse",
        "funksjoner": [
            "Dagbok lagret lokalt i nettleseren, ingen sky",
            "Humørskala fra 1 til 10 på hver oppføring",
            "Spørsmål som tilfeldig graver litt for dypt",
        ],
        "fysisk": False,
        "hook": "Jeg skriver det ned fordi hjernen min lyver om det som skjedde i går. "
                "Penn i hånda, kaffe i halsen, og en tekst som ikke ber om unnskyldning.",
    },
]

RENTE_SCAD = """// Rentevekkeren - hus til skrivebordsklokke. Mål i mm.
bredde = 120;
dybde = 70;
hoyde = 45;
vegg = 3;

difference() {
    cube([bredde, dybde, hoyde]);
    translate([vegg, vegg, vegg]) cube([bredde - 2 * vegg, dybde - 2 * vegg, hoyde]);
    translate([15, -1, 15]) cube([90, vegg + 2, 22]);  // skjermvindu
}
"""

BREV_SCAD = """// Brevkniven - blad og håndtak. Mål i mm.
blad_lengde = 150;
blad_bredde = 14;
tykkelse = 2;

difference() {
    union() {
        linear_extrude(height = tykkelse)
            polygon([[0, 0], [blad_lengde, blad_bredde / 2], [0, blad_bredde]]);
        translate([-40, -5, 0]) cube([42, 24, 8]);  // håndtak
    }
    translate([-41, 8, -1]) cylinder(h = 10, r = 2);  // hengehull
}
"""

PUST_SCAD = """// Pustekortet - eske til 52 kort (ca. 0,3 mm per kort). Mål i mm.
kort_b = 62;
kort_h = 90;
kort_tykk = 16;
vegg = 2;
ytre_b = kort_b + 2 * vegg;
ytre_h = kort_h + 2 * vegg;
ytre_d = kort_tykk + 2 * vegg;

difference() {
    cube([ytre_b, ytre_d, ytre_h]);
    translate([vegg, vegg, vegg]) cube([kort_b, kort_tykk, kort_h]);
    translate([ytre_b / 2 - 20, -1, ytre_h - 12]) cube([40, vegg + 2, 5]);  // uttak
}
"""

# ---------------------------------------------------------------- prototype-widgets

SKAL = """<!doctype html>
<html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>@@NAVN@@ - prototype</title>
<style>
:root{--bg:#0f0d0c;--fg:#f2e8d5;--acc:#ff4d2e;--mut:#8a7f72}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif;padding:16px}
main{max-width:520px;margin:0 auto}
h1{font-size:2rem;margin:.5em 0 0;color:var(--acc)}
p.sub{color:var(--mut)}
.kort{border:1px solid #33291f;border-radius:12px;padding:16px;margin:16px 0}
input,textarea{font:inherit;padding:10px 12px;border-radius:8px;border:1px solid #33291f;background:#1a1613;color:var(--fg)}
button{font:inherit;padding:10px 14px;border-radius:8px;border:0;background:var(--acc);color:#0f0d0c;font-weight:700;cursor:pointer}
.stor{font-size:2.4rem;font-variant-numeric:tabular-nums}
</style></head><body><main>
<h1>@@NAVN@@</h1><p class="sub">@@PROBLEM@@</p>
@@INNHOLD@@
</main>
<script>
@@SKRIPT@@
</script></body></html>
"""

RENTE_INNHOLD = """<div class="kort">
<label>Saldo (kr) <input id="saldo" type="number" value="250000"></label><br><br>
<label>Rente (% per år) <input id="rente" type="number" value="14.5" step="0.1"></label>
</div>
<div class="kort">
<p>Renta tikker nå med</p>
<p class="stor" id="sek">0,00 kr/s</p>
<p>Siden du åpnet fanen: <b id="totalt">0,00 kr</b></p>
</div>"""

RENTE_SKRIPT = """const start = Date.now();
const fmt = (n, d) => n.toLocaleString('no-NO', {minimumFractionDigits: d, maximumFractionDigits: d});
function oppdater() {
  const saldo = parseFloat(document.getElementById('saldo').value) || 0;
  const rente = parseFloat(document.getElementById('rente').value) || 0;
  const kronerPerSek = saldo * rente / 100 / 365 / 86400;
  const sekunder = (Date.now() - start) / 1000;
  document.getElementById('sek').textContent = fmt(kronerPerSek, 4) + ' kr/s';
  document.getElementById('totalt').textContent = fmt(kronerPerSek * sekunder, 2) + ' kr';
}
document.querySelectorAll('input').forEach(i => i.addEventListener('input', oppdater));
setInterval(oppdater, 1000);
oppdater();"""

BREV_INNHOLD = """<div class="kort">
<p>Ulest post fra inkasso og annet mørkt</p>
<p class="stor" id="antall">3</p>
<button id="nytt">Nytt brev kommer</button> <button id="apne">Åpne ett</button>
</div>
<div class="kort" id="logg"><p>Klar. Ingen har åpnet noe ennå.</p></div>"""

BREV_SKRIPT = """let antall = 3;
const linjer = [
  'Du skylder penger. Vi vet hvor du bor.',
  'Siste varsel. Dette er ikke en spøk, men du er det.',
  'Renten er endret. Fremtiden din er nå dyrere.'
];
const vis = () => document.getElementById('antall').textContent = antall;
document.getElementById('nytt').onclick = () => { antall++; vis(); };
document.getElementById('apne').onclick = () => {
  const logg = document.getElementById('logg');
  if (antall === 0) { logg.innerHTML = '<p>Ingenting å åpne. Nærmeste du kommer fred.</p>'; return; }
  antall--; vis();
  const p = document.createElement('p');
  p.textContent = linjer[Math.floor(Math.random() * linjer.length)];
  logg.appendChild(p);
};"""

PUST_INNHOLD = """<div class="kort" style="text-align:center">
<div id="sirkel" style="width:160px;height:160px;margin:24px auto;border-radius:50%;background:var(--acc);opacity:.6;transition:transform 1s linear"></div>
<p class="stor" id="fase">Klar</p>
<button id="start">Start</button>
</div>"""

PUST_SKRIPT = """const faser = [['Inn', 4, 1.6], ['Hold', 4, 1.6], ['Ut', 6, 0.7], ['Hvil', 2, 1]];
let timer = null, i = 0, teller = 0;
const sirkel = document.getElementById('sirkel');
const fase = document.getElementById('fase');
const knapp = document.getElementById('start');
function steg() {
  const [navn, sek, skala] = faser[i];
  if (teller === 0) sirkel.style.transform = 'scale(' + skala + ')';
  fase.textContent = navn + ' (' + (sek - teller) + ')';
  teller++;
  if (teller > sek) { teller = 0; i = (i + 1) % faser.length; }
}
knapp.onclick = () => {
  if (timer) { clearInterval(timer); timer = null; knapp.textContent = 'Start'; fase.textContent = 'Pause'; return; }
  knapp.textContent = 'Stopp';
  steg();
  timer = setInterval(steg, 1000);
};"""

IMPULS_INNHOLD = """<div class="kort">
<label>Handlekurv (kr) <input id="kurv" type="number" value="1490"></label><br><br>
<label>Din grense (kr) <input id="grense" type="number" value="500"></label><br><br>
<button id="sjekk">Sjekk meg</button>
</div>
<div class="kort" id="svar"><p>Ingen dom ennå.</p></div>"""

IMPULS_SKRIPT = """document.getElementById('sjekk').onclick = () => {
  const kurv = parseFloat(document.getElementById('kurv').value) || 0;
  const grense = parseFloat(document.getElementById('grense').value) || 0;
  const svar = document.getElementById('svar');
  if (kurv <= grense) { svar.innerHTML = '<p>Under grensa. Grønt lys. Kjøp det du trenger, ikke det du fantaserer om.</p>'; return; }
  svar.innerHTML = '<p>Stopp. Du er ' + (kurv - grense) + ' kr over grensa.</p>'
    + '<p>Vent 30 minutter. Pust inn i fire, ut i seks.</p>'
    + '<input id="bekreft" placeholder="Skriv: JEG ER SIKKER"> <button id="kjop">Kjøp likevel</button>';
  document.getElementById('kjop').onclick = () => {
    if (document.getElementById('bekreft').value.trim() === 'JEG ER SIKKER') {
      svar.innerHTML = '<p>Ok. Det er ditt liv. Kvitteringen i søppelet, vakten i bakhodet.</p>';
    } else {
      svar.innerHTML += '<p>Det er ikke sikkert du er sikker. Prøv igjen senere.</p>';
    }
  };
};"""

DAGBOK_INNHOLD = """<div class="kort">
<p id="prompt"></p>
<textarea id="tekst" rows="5" style="width:100%;box-sizing:border-box"></textarea>
<label>Humør (1-10) <input id="humor" type="range" min="1" max="10" value="5"></label>
<p><button id="lagre">Lagre kaoset</button></p>
</div>
<div class="kort" id="liste"></div>"""

DAGBOK_SKRIPT = """const prompter = [
  'Hva har du lovet deg selv i dag som du allerede har brutt?',
  'Hva ville du sagt til systemet hvis det hadde ansikt?',
  'Hva kjentes i beina i dag?'
];
document.getElementById('prompt').textContent = prompter[Math.floor(Math.random() * prompter.length)];
let oppforinger = [];
try { oppforinger = JSON.parse(localStorage.getItem('dagbok') || '[]'); } catch (e) { oppforinger = []; }
function vis() {
  const html = oppforinger.slice().reverse().map(o =>
    '<p><b>' + o.dato + ' - humør ' + o.humor + '</b><br>' + o.tekst.replace(/</g, '&lt;') + '</p>').join('');
  document.getElementById('liste').innerHTML = html || '<p>Tomt. Ennå.</p>';
}
document.getElementById('lagre').onclick = () => {
  const tekst = document.getElementById('tekst').value.trim();
  if (!tekst) return;
  oppforinger.push({dato: new Date().toLocaleString('no-NO'), humor: document.getElementById('humor').value, tekst});
  try { localStorage.setItem('dagbok', JSON.stringify(oppforinger)); } catch (e) {}
  document.getElementById('tekst').value = '';
  vis();
};
vis();"""

WIDGETS = {
    "rentevekkeren": (RENTE_INNHOLD, RENTE_SKRIPT),
    "brevkniven": (BREV_INNHOLD, BREV_SKRIPT),
    "pustekortet": (PUST_INNHOLD, PUST_SKRIPT),
    "impulsvakten": (IMPULS_INNHOLD, IMPULS_SKRIPT),
    "kaosdagboken": (DAGBOK_INNHOLD, DAGBOK_SKRIPT),
}
SCAD = {"rentevekkeren": RENTE_SCAD, "brevkniven": BREV_SCAD, "pustekortet": PUST_SCAD}

# ---------------------------------------------------------------- hjelpere

def na():
    return datetime.datetime.now().isoformat(timespec="seconds")


def logg(agent, melding, produkt=None):
    post = {"tid": na(), "agent": agent, "produkt": produkt, "melding": melding}
    os.makedirs(KJORING, exist_ok=True)
    with open(LOGG_FIL, "a", encoding="utf-8") as f:
        f.write(json.dumps(post, ensure_ascii=False) + "\n")
    print(f"[{post['tid']}] {agent:<16} {produkt or '-':<26} {melding}", flush=True)


def skriv_fil(p, filnavn, tekst):
    mappe = os.path.join(PRODUKTER_DIR, p["slug"])
    os.makedirs(mappe, exist_ok=True)
    with open(os.path.join(mappe, filnavn), "w", encoding="utf-8") as f:
        f.write(tekst)


def skriv(instruks, mal):
    """Claude-tekst hvis API-nøkkel finnes, ellers malen. Feil gir malen, og løpet fortsetter."""
    nokkel = os.environ.get("ANTHROPIC_API_KEY")
    if not nokkel:
        return mal
    body = json.dumps({"model": MODELL, "max_tokens": 1200,
                       "messages": [{"role": "user", "content": instruks}]}).encode("utf-8")
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages", data=body,
        headers={"x-api-key": nokkel, "anthropic-version": "2023-06-01", "content-type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            data = json.load(r)
        return "".join(b.get("text", "") for b in data["content"]) or mal
    except Exception as e:  # nettverk, kvote, format: bruk malen
        logg("bedrift", f"API feilet, bruker mal: {e}")
        return mal


def lag(p, filnavn, rolle, oppgave, mal):
    instruks = (f"Du er {rolle} i en liten bedrift. {oppgave} Svar på norsk, som Markdown.\n\n"
                f"Produkt: {json.dumps(p, ensure_ascii=False)}")
    skriv_fil(p, filnavn, skriv(instruks, mal))


def oppgave(t, p, stadium, forsok=1):
    oppg = {"id": t["id"], "produkt": p["slug"], "stadium": stadium, "forsok": forsok}
    t["id"] += 1
    return oppg

# ---------------------------------------------------------------- stadier (agentene)

def research(p):
    mal = (f"# Research: {p['navn']}\n\n**Problem:** {p['problem']}\n\n**Bruker:** {p['bruker']}\n\n"
           "**Kilder:** ingen. Offline-modus, ingen websøk. Alt under er antakelser som må verifiseres.\n\n"
           "**Hypotese:** Noen har dette problemet, og de gidder ikke å fikse det selv.\n")
    lag(p, "01-research.md", "researchansvarlig",
        "Skriv en kort markedsbrief, maks 200 ord. Merk alt usikkert som usikkert. Ikke finn på tall.", mal)


def design(p):
    funk = "\n".join(f"- {f}" for f in p["funksjoner"])
    mal = (f"# Design: {p['navn']}\n\n**Målgruppe:** {p['bruker']}\n\n**MVP-funksjoner:**\n{funk}\n\n"
           "**Første brukeropplevelse:** Du ser problemet, trykker én gang, og produktet sier sannheten høyt.\n")
    lag(p, "02-design.md", "designansvarlig",
        "Lag en designbeskrivelse: målgruppe, MVP-funksjoner og tre steg i brukeropplevelsen.", mal)


def oppfinner(p):
    mal = (f"# Oppfinnelse: {p['navn']}\n\n**Kjerneidé:** {p['problem']}, løst med friksjon i riktig dose.\n\n"
           f"**Mekanisme:** {'; '.join(p['funksjoner'])}. Ingenting skjult, ingenting smart. "
           "Bare nok friksjon til å stoppe deg én gang.\n")
    lag(p, "03-oppfinnelse.md", "oppfinner",
        "Beskriv mekanismen og hvorfor den virker, i korte avsnitt.", mal)


def cad(p):
    if not p.get("fysisk"):
        return
    skriv_fil(p, "04-cad.scad", SCAD.get(p["slug"], f"// {p['navn']}: CAD-kilde ikke laget ennå\n"))


def tegning(p):
    linjer = "".join(
        f'<text x="40" y="{190 + 28 * i}" font-size="18" fill="#f2e8d5">- {html.escape(f)}</text>\n'
        for i, f in enumerate(p["funksjoner"]))
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
<rect width="800" height="500" fill="#0f0d0c"/>
<rect x="20" y="20" width="760" height="460" rx="16" fill="none" stroke="#ff4d2e" stroke-width="2"/>
<text x="40" y="70" font-size="36" font-weight="700" fill="#ff4d2e">{html.escape(p["navn"])}</text>
<text x="40" y="110" font-size="18" fill="#8a7f72">{html.escape(p["problem"])}</text>
{linjer}<text x="40" y="460" font-size="14" fill="#8a7f72">Skisse {p["slug"]}. Ikke målskalert, ikke produksjonstegning.</text>
</svg>
'''
    skriv_fil(p, "05-tegning.svg", svg)


def ingenior(p):
    innhold, skript = WIDGETS.get(p["slug"]) or WIDGETS.get(p.get("arv"), WIDGETS["kaosdagboken"])
    side = (SKAL.replace("@@NAVN@@", html.escape(p["navn"]))
            .replace("@@PROBLEM@@", html.escape(p["problem"]))
            .replace("@@INNHOLD@@", innhold)
            .replace("@@SKRIPT@@", skript))
    skriv_fil(p, "06-prototype.html", side)


class _Tagsjekk(html.parser.HTMLParser):
    VOID = {"meta", "link", "input", "br", "img", "hr"}

    def __init__(self):
        super().__init__()
        self.stakk = []
        self.feil = []

    def handle_starttag(self, tag, attrs):
        if tag not in self.VOID:
            self.stakk.append(tag)

    def handle_endtag(self, tag):
        if tag in self.VOID:
            return
        if self.stakk and self.stakk[-1] == tag:
            self.stakk.pop()
        else:
            self.feil.append(f"uventet </{tag}>")


def qa(p):
    """Debugger alt som ble laget. Returnerer liste med problemer."""
    mappe = os.path.join(PRODUKTER_DIR, p["slug"])
    problemer = []
    for fil in sorted(os.listdir(mappe)):
        with open(os.path.join(mappe, fil), encoding="utf-8") as f:
            tekst = f.read()
        if fil.endswith(".html"):
            sjekk = _Tagsjekk()
            sjekk.feed(tekst)
            problemer += [f"{fil}: {x}" for x in sjekk.feil]
            if sjekk.stakk:
                problemer.append(f"{fil}: ulukkede tagger {sjekk.stakk}")
        elif fil.endswith(".svg"):
            try:
                ET.fromstring(tekst)
            except ET.ParseError as e:
                problemer.append(f"{fil}: ugyldig XML ({e})")
        elif fil.endswith(".scad"):
            for par in ("()", "[]", "{}"):
                if tekst.count(par[0]) != tekst.count(par[1]):
                    problemer.append(f"{fil}: ubalansert {par}")
        elif fil.endswith(".md") and len(tekst) < 120:
            problemer.append(f"{fil}: for kort")
        if "@@" in tekst:
            problemer.append(f"{fil}: ubyttet mal-token")
    rapport = "# QA\n\n" + ("Alt grønt.\n" if not problemer else "\n".join(f"- {x}" for x in problemer) + "\n")
    skriv_fil(p, "07-qa.md", rapport)
    p["qa"] = "OK" if not problemer else f"advarsler: {len(problemer)}"
    return problemer


def marked(p):
    funk = "\n".join(f"- {f}" for f in p["funksjoner"])
    mal = (f"# {p['navn']} - annonsetekst (gonzo-utgave)\n\n{p['hook']}\n\n"
           f"{p['problem']}. Ikke en løsning, men et vitne. {p['navn']} gjør én ting: "
           "den ser deg mens du later som det går bra.\n\n"
           f"**Funksjoner:**\n{funk}\n\n**For:** {p['bruker']}\n\n"
           "**Neste steg:** Åpne prototypen (06-prototype.html). Hater du den? Bra. Da er den ekte.\n")
    lag(p, "08-markedsforing.md", "markedsføringssjef",
        "Skriv annonsetekst i gonzo-stil: første person, midt i scenen, rå og sarkastisk. "
        "Ingen påstander om fakta uten kilde, ingen konspirasjonsteorier om navngitte personer.", mal)


def loggfor(p):
    rader = []
    for mappenavn in sorted(os.listdir(PRODUKTER_DIR)) if os.path.isdir(PRODUKTER_DIR) else []:
        if mappenavn == "INDEKS.md":
            continue
        rader.append(f"| {mappenavn} | ferdig |")
    indeks = "# Produktindeks\n\n| produkt | status |\n|---|---|\n" + "\n".join(rader) + "\n"
    with open(os.path.join(PRODUKTER_DIR, "INDEKS.md"), "w", encoding="utf-8") as f:
        f.write(indeks)
    logg("loggføring", f"{p['navn']} ferdig, QA: {p.get('qa', 'ukjent')}", p["slug"])


STADIER = ["research", "design", "oppfinner", "cad", "tegning", "ingenior", "qa", "marked", "logg"]
FUNKSJON = {"research": research, "design": design, "oppfinner": oppfinner, "cad": cad,
            "tegning": tegning, "ingenior": ingenior, "qa": qa, "marked": marked, "logg": loggfor}
AVDELING = {"research": "researchbedrift", "design": "designbedrift", "oppfinner": "oppfinnerne",
            "cad": "cad-kontoret", "tegning": "tegnestuen", "ingenior": "prototypeverkstedet",
            "qa": "debugging", "marked": "markedsføring", "logg": "loggføring"}


def neste(p, stadium):
    i = STADIER.index(stadium)
    for s in STADIER[i + 1:]:
        if s == "cad" and not p.get("fysisk"):
            continue
        return s
    return None


def utfor(t, oppg):
    p = next(x for x in t["produkter"] if x["slug"] == oppg["produkt"])
    stadium = oppg["stadium"]
    try:
        problemer = FUNKSJON[stadium](p)
    except Exception as e:  # én krasj stopper ikke bedriften
        p["feil"] = f"{stadium}: {e}"
        logg("debugging", f"{stadium} krasjet: {e}", p["slug"])
        return
    if stadium == "qa" and problemer:
        if oppg["forsok"] < 2:
            logg("debugging", f"fant {len(problemer)} feil, sender til prototypeverkstedet igjen", p["slug"])
            t["kø"].insert(0, oppgave(t, p, "ingenior", oppg["forsok"] + 1))
            return
        logg("debugging", "fortsatt feil etter andre runde, går videre med advarsel", p["slug"])
    nxt = neste(p, stadium)
    if nxt:
        t["kø"].append(oppgave(t, p, nxt, oppg["forsok"]))
    else:
        p["ferdig"] = True
        logg(AVDELING[stadium], "siste steg, ingen flere oppgaver for produktet", p["slug"])
    logg(AVDELING[stadium], f"fullførte {stadium}", p["slug"])


def ny_idé(t):
    """Bedriften lager egne oppgaver: kombinerer to ferdige produkter til et nytt."""
    ferdige = [p for p in t["produkter"] if p.get("ferdig")]
    if len(ferdige) < 2:
        return False
    a, b = random.sample(ferdige, 2)
    slug = f"{a['slug']}-{b['slug']}"
    teller = 2
    base = slug
    while any(p["slug"] == slug for p in t["produkter"]):
        slug = f"{base}-{teller}"
        teller += 1
    p = {
        "slug": slug,
        "navn": f"{a['navn']} x {b['navn']}",
        "problem": f"{a['problem']}, og verre: {b['problem'][0].lower() + b['problem'][1:]}",
        "bruker": b["bruker"],
        "funksjoner": a["funksjoner"][:1] + b["funksjoner"][:2],
        "fysisk": False,
        "arv": a["slug"],
        "hook": f"{a['navn']} og {b['navn']} fikk barn. Jeg var vitne. Ingen spurte om vi ville ha det.",
        "ferdig": False,
    }
    t["produkter"].append(p)
    t["kø"].append(oppgave(t, p, "research"))
    logg("oppfinner", f"ny idé fra {a['navn']} + {b['navn']}", slug)
    return True

# ---------------------------------------------------------------- løkken

def last():
    if os.path.exists(TILSTAND):
        with open(TILSTAND, encoding="utf-8") as f:
            return json.load(f)
    t = {"id": 1, "produkter": json.loads(json.dumps(PRODUKTER_START)), "kø": []}
    for p in t["produkter"]:
        p["ferdig"] = False
        t["kø"].append(oppgave(t, p, "research"))
    return t


def lagre(t):
    os.makedirs(KJORING, exist_ok=True)
    with open(TILSTAND, "w", encoding="utf-8") as f:
        json.dump(t, f, ensure_ascii=False, indent=1)


def kjor(t, slutt, en_runde, maks, pause):
    sist_venting = 0.0
    while True:
        if slutt and time.time() >= slutt:
            logg("bedrift", "tiden er ute. Kø og tilstand er lagret, start på nytt for å fortsette.")
            break
        if not t["kø"]:
            if en_runde:
                break
            if len(t["produkter"]) < maks and ny_idé(t):
                lagre(t)
                continue
            if time.time() - sist_venting > 300:
                logg("bedrift", "ingenting i køen og taket er nådd, venter på nye idéer")
                sist_venting = time.time()
            time.sleep(60)
            continue
        utfor(t, t["kø"].pop(0))
        lagre(t)
        time.sleep(pause)
    lagre(t)
    ferdige = sum(1 for p in t["produkter"] if p.get("ferdig"))
    logg("bedrift", f"stopp: {ferdige} ferdige av {len(t['produkter'])} produkter, {len(t['kø'])} oppgaver i kø")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--timer", type=float, default=48, help="kjøretid i timer (0 = ubegrenset)")
    ap.add_argument("--en-runde", action="store_true", help="kjør køen tom og stopp")
    ap.add_argument("--maks", type=int, default=60, help="maks antall produkter bedriften lager")
    ap.add_argument("--pause", type=float, default=1.0, help="sekunder mellom oppgaver")
    args = ap.parse_args()
    slutt = time.time() + args.timer * 3600 if args.timer > 0 else None
    os.makedirs(PRODUKTER_DIR, exist_ok=True)
    t = last()
    logg("bedrift", f"start: {len(t['produkter'])} produkter, {len(t['kø'])} oppgaver, "
                    f"modus: {'API' if os.environ.get('ANTHROPIC_API_KEY') else 'lokale maler'}")
    kjor(t, slutt, args.en_runde, args.maks, args.pause)


if __name__ == "__main__":
    main()
