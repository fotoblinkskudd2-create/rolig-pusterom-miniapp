"""Én statisk HTML-fil. Inline SVG, inline CSS, null eksterne avhengigheter."""
from __future__ import annotations

from datetime import date, datetime
from html import escape

from .benker import kjør_alle
from .data import Datasett
from .metrikk import Sum, per_dag, per_dag_motor, summer
from .tekst import KOLONNER, kort_status, tabellrader

B, H, PAD = 640, 160, 28


def søyler(serie: list[tuple[date, float]], tittel: str, fmt: str = "{:.2f}") -> str:
    maks = max((v for _, v in serie), default=0) or 1
    n = max(len(serie), 1)
    bredde = (B - 2 * PAD) / n
    deler = [f'<svg viewBox="0 0 {B} {H + 24}" role="img" aria-label="{escape(tittel)}">',
             f'<line x1="{PAD}" y1="{H}" x2="{B - PAD}" y2="{H}" class="akse"/>']
    for i, (dg, v) in enumerate(serie):
        h = (v / maks) * (H - PAD)
        x = PAD + i * bredde
        deler.append(f'<rect x="{x + 1:.1f}" y="{H - h:.1f}" width="{max(bredde - 2, 1):.1f}" '
                     f'height="{h:.1f}" class="soyle"><title>{dg.isoformat()}: {fmt.format(v)}</title></rect>')
        if n <= 10 or i % max(n // 6, 1) == 0 or i == n - 1:
            deler.append(f'<text x="{x + bredde / 2:.1f}" y="{H + 16}" class="etikett">{dg.strftime("%d.%m")}</text>')
    deler.append(f'<text x="{PAD}" y="14" class="etikett venstre">maks {fmt.format(maks)}</text></svg>')
    return "".join(deler)


def _graf(tittel: str, dager: list[tuple[date, Sum]], felt, fmt: str = "{:.2f}") -> str:
    serie = [(dg, float(felt(s) or 0)) for dg, s in dager]
    return f"<figure><figcaption>{escape(tittel)}</figcaption>{søyler(serie, tittel, fmt)}</figure>"


CSS = """
:root{--bg:#f7f6f2;--fg:#1d1d1b;--dim:#6b6a65;--linje:#d8d6cf;--soyle:#3a5a7a;--glir:#a23b2a;--last:#2f6b3f}
@media (prefers-color-scheme:dark){:root{--bg:#141413;--fg:#ecebe6;--dim:#9a988f;--linje:#34332f;--soyle:#7fa6cc;--glir:#e07a5f;--last:#7fbf8f}}
body{background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif;margin:0;padding:24px 16px;max-width:900px;margin-inline:auto}
h1{font-size:20px;margin:0 0 4px}h2{font-size:16px;margin:32px 0 8px}
.status{font-family:ui-monospace,monospace;font-size:13px;overflow-wrap:anywhere;border-left:3px solid var(--soyle);padding:8px 12px;margin:16px 0}
.GLIR{color:var(--glir);font-weight:600}.LÅST{color:var(--last);font-weight:600}
figure{margin:16px 0}figcaption{color:var(--dim);font-size:13px}
svg{width:100%;height:auto}.akse{stroke:var(--linje)}.soyle{fill:var(--soyle)}
.etikett{fill:var(--dim);font-size:10px;text-anchor:middle}.venstre{text-anchor:start}
.tabell{overflow-x:auto}table{border-collapse:collapse;font-size:13px;width:100%}
th,td{padding:4px 8px;border-bottom:1px solid var(--linje);text-align:right;white-space:nowrap}
th:nth-child(-n+2),td:nth-child(-n+2){text-align:left}.dim{color:var(--dim)}
"""


def lag_html(d: Datasett, nå: datetime) -> str:
    rader30 = per_dag_motor(d, nå, 30)
    uke = summer(per_dag_motor(d, nå, 7), 7)
    benker = kjør_alle(d, nå)
    dager30 = per_dag(rader30, nå, 30)
    status = "<br>".join(escape(l) for l in kort_status(uke, benker))
    benk_html = "".join(
        f'<p><span class="{escape(b.status)}">{escape(b.navn)}: {escape(b.status)}</span> — {escape(b.linje)}</p>'
        for b in benker)
    th = "".join(f"<th>{escape(k)}</th>" for k in KOLONNER)
    tr = "".join("<tr>" + "".join(f"<td>{escape(c)}</td>" for c in rad) + "</tr>"
                 for rad in reversed(tabellrader(rader30)))
    return f"""<!doctype html>
<html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MR ART målebenk</title><style>{CSS}</style></head><body>
<h1>MR ART — målebenk</h1><p class="dim">Generert {escape(nå.astimezone().strftime("%d.%m.%Y %H:%M"))}. Vindu: 30 dager.</p>
<div class="status">{status}</div>
<h2>Benker</h2>{benk_html or '<p class="dim">Ingen benker.</p>'}
<h2>30 dager</h2>
{_graf("Kostnad per dag (USD)", dager30, lambda s: s.kostnad_usd, "{:.3f}")}
{_graf("Kall per dag", dager30, lambda s: s.kall, "{:.0f}")}
{_graf("Manuelle inngrep per dag", dager30, lambda s: s.inngrep, "{:.0f}")}
{_graf("Snittscore per dag (1–5)", dager30, lambda s: s.snittscore, "{:.1f}")}
<h2>Per dag og motor</h2><div class="tabell"><table><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div>
</body></html>
"""
