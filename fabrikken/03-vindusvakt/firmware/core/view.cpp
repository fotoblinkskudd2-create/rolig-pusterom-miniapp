#include "view.h"

#include <algorithm>
#include <cmath>

namespace vindusvakt {

namespace {

constexpr int M = 16;
constexpr int R = Skjerm::W - M;
constexpr int TOPP = 40;
const char* const MND_KORT[] = {"jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"};

std::string kl(ms_t t) { return klokke(lokal(t)); }

std::string lengde(int min) {
  return std::to_string(min / 60) + " t " + std::to_string(min % 60) + " min";
}

std::string dato_lang(int64_t dag) {
  const Dato d = civil_from_days(dag);
  return std::to_string(d.d) + ". " + MND_KORT[d.m - 1];
}

void topp(Skjerm& s, const Ctx& c, const std::string& tittel) {
  s.fill(0, 0, Skjerm::W, TOPP);
  int x = s.text(F_S, M, 26, "VINDUSVAKT", false);
  x = s.text(F_S, x + 14, 26, "·  " + c.sted.navn, false);
  if (!tittel.empty()) s.text(F_S, x + 14, 26, "·  " + tittel, false);
  const Lokal l = lokal(c.naa);
  std::string h = std::string(UKEDAG_KORT[l.wd]) + " " + dato_kort(l) + "   " + klokke(l);
  if (c.privat) h = "LINSE LUKKET   " + h;
  s.text_r(F_S, R, 26, h, false);
}

void miniatyr(Skjerm& s, int x0, int y0, const Prove* p) {
  if (!p) {
    s.rect(x0, y0, TW, TH);
    s.hatch(x0 + 1, y0 + 1, TW - 2, TH - 2, 6);
    return;
  }
  for (int y = 0; y < TH; ++y)
    for (int x = 0; x < TW; ++x)
      if (p->bits[(y * TW + x) >> 3] & (0x80 >> (x & 7))) s.px(x0 + x, y0 + y);
}

// Lokalt midnatt (UTC ms) for lokal dag
ms_t lokal_midnatt(int64_t dag) {
  const ms_t g = dag * DOGN;
  return g - oslo_offset(g);
}

void uke(const Arkiv& a, const Ctx& c, Skjerm& s) {
  topp(s, c, "UKA I VINDUET");
  const int64_t idag = lokal(c.naa).dag;
  const int gap = 2, x0 = (Skjerm::W - (7 * TW + 6 * gap)) / 2;
  const int y_lab = TOPP + 20, y0 = TOPP + 28;
  for (int d = 0; d < 7; ++d) {
    const int64_t dag = idag - 6 + d;
    const int x = x0 + d * (TW + gap);
    const Lokal l = lokal(lokal_midnatt(dag) + 12 * TIME);
    const std::string navn = d == 6 ? "i dag" : std::string(UKEDAG_KORT[l.wd]) + " " + std::to_string(l.d);
    s.text_c(F_S, x + TW / 2, y_lab, navn);
    for (int r = 0; r < 4; ++r) {
      const ms_t t = lokal_midnatt(dag) + UKE_TIMER[r] * TIME;
      const int y = y0 + r * (TH + gap);
      if (t > c.naa) { s.dots(x, y + TH / 2, TW, 4); continue; }  // ikke kommet ennå
      miniatyr(s, x, y, a.naermest(t));
    }
  }
  // tider på venstre kant
  for (int r = 0; r < 4; ++r) {
    const int y = y0 + r * (TH + gap) + 14;
    s.fill(x0, y - 12, 24, 16);
    s.text(F_S, x0 + 3, y, std::to_string(UKE_TIMER[r]), false);
  }
  const int yb = y0 + 4 * (TH + gap) + 30;
  s.hline(M, yb - 22, R - M);
  s.text(F_M, M, yb, lys_linje(c.sted, c.naa));
  s.text_r(F_S, R, yb + 26, "kl. 08 · 12 · 16 · 20, nærmeste bilde. Bare 112×84 svart-hvitt lagres.");
}

void idag(const Arkiv& a, const Ctx& c, Skjerm& s) {
  topp(s, c, "I DAG");
  const int x0 = M, y0 = TOPP + 16;
  if (a.stor.size() == static_cast<size_t>(SB)) {
    for (int y = 0; y < SH; ++y)
      for (int x = 0; x < SW; ++x)
        if (a.stor[(y * SW + x) >> 3] & (0x80 >> (x & 7))) s.px(x0 + x, y0 + y);
    s.text(F_S, x0, y0 + SH + 18, "sist sett ut: " + naar(a.stor_ts, c.naa));
  } else {
    s.rect(x0, y0, SW, SH);
    s.hatch(x0 + 1, y0 + 1, SW - 2, SH - 2, 6);
    s.text_c(F_M, x0 + SW / 2, y0 + SH / 2, "ingen bilder ennå");
  }

  // Lyset, til høyre
  const int xr = x0 + SW + 28;
  const int64_t idag_utc = lokal(c.naa).dag;
  const SolDag sd = sol_dag(idag_utc, c.sted.lat, c.sted.lon);
  const SolDag ig = sol_dag(idag_utc - 1, c.sted.lat, c.sted.lon);
  int y = y0 + 20;
  if (sd.type == SolType::Morketid) {
    const int n = dager_til_sol(idag_utc, c.sted.lat, c.sted.lon);
    s.text(F_S, xr, y, "MØRKETID");
    s.text(F_XL, xr, y + 84, std::to_string(n));
    s.text(F_L, xr + Skjerm::width(F_XL, std::to_string(n)) + 14, y + 84, n == 1 ? "dag" : "dager");
    s.text(F_M, xr, y + 118, "til sola kommer over horisonten,");
    s.text(F_M, xr, y + 140, dato_lang(idag_utc + n) + ".");
    if (sd.har_bla) s.text(F_M, xr, y + 178, "Blåtime i dag " + kl(sd.bla_fra) + "–" + kl(sd.bla_til) + ".");
    else s.text(F_M, xr, y + 178, "Ingen blåtime i dag. Bare natt.");
  } else if (sd.type == SolType::Midnattssol) {
    s.text(F_S, xr, y, "MIDNATTSSOL");
    s.text(F_XL, xr, y + 84, "24 t");
    const int n = dager_til_solnedgang(idag_utc, c.sted.lat, c.sted.lon);
    s.text(F_M, xr, y + 118, "Sola går ikke ned i dag.");
    s.text(F_M, xr, y + 140, "Lavest kl. " + kl(sd.middag + 12 * TIME) + ".");
    if (n > 0) s.text(F_M, xr, y + 178, "Første solnedgang om " + std::to_string(n) + (n == 1 ? " dag" : " dager") + ", " + dato_lang(idag_utc + n) + ".");
  } else {
    s.text(F_S, xr, y, "DAGEN I DAG");
    const std::string t = std::to_string(sd.lengde_min / 60) + " t";
    const int xe = s.text(F_XL, xr, y + 84, t);
    s.text(F_L, xe + 14, y + 84, std::to_string(sd.lengde_min % 60) + " min");
    s.text(F_M, xr, y + 118, "Sola opp " + kl(sd.opp) + ", ned " + kl(sd.ned) + ".");
    const int diff = sd.lengde_min - (ig.type == SolType::Normal ? ig.lengde_min : sd.lengde_min);
    std::string endring = diff == 0 ? "Like lang som i går." : std::to_string(std::abs(diff)) + " min " + (diff > 0 ? "lengre" : "kortere") + " enn i går.";
    s.text(F_M, xr, y + 140, endring);
    s.text(F_M, xr, y + 178, "Sola står høyest kl. " + kl(sd.middag) + ".");
  }

  // Lyskurve: 7 døgn, én verdi i timen, natt (sol under −6°) skravert
  const int gx = M, gy = 352, gw = R - M, gh = 100;
  s.text(F_S, gx, gy - 10, "LYSET DE SISTE 7 DØGNENE");
  s.rect(gx, gy, gw, gh);
  const ms_t start = lokal_midnatt(lokal(c.naa).dag - 6);
  for (int px = 1; px < gw - 1; ++px) {
    const ms_t t = start + static_cast<ms_t>(px) * (7 * DOGN) / gw;
    if (t > c.naa) break;
    if (sol_hoyde(t, c.sted.lat, c.sted.lon) < -6) for (int yy = gy + 1; yy < gy + gh - 1; yy += 3) s.px(gx + px, yy + (px % 3));
  }
  int px_for = -1, py_for = -1;
  for (const auto& p : a.alle()) {
    if (p.ts < start || p.ts > c.naa) continue;
    const int px = gx + static_cast<int>((p.ts - start) * gw / (7 * DOGN));
    const int py = gy + gh - 3 - p.lys * (gh - 6) / 255;
    if (px_for >= 0 && px - px_for < gw / 7 / 4 + 4) { s.line(px_for, py_for, px, py); s.line(px_for, py_for + 1, px, py + 1); }
    s.fill(px - 1, py - 1, 3, 3);
    px_for = px;
    py_for = py;
  }
  for (int d = 0; d <= 7; ++d) s.vline(gx + d * gw / 7, gy + gh, 5);
  s.text(F_S, gx, gy + gh + 20, dato_lang(lokal(c.naa).dag - 6));
  s.text_r(F_S, gx + gw, gy + gh + 20, "nå");
}

void aret(const Arkiv&, const Ctx& c, Skjerm& s) {
  topp(s, c, "ÅRET");
  const Lokal l = lokal(c.naa);
  const int64_t nyttar = days_from_civil(l.y, 1, 1);
  const int dager = static_cast<int>(days_from_civil(l.y + 1, 1, 1) - nyttar);
  const int gx = M + 40, gy = TOPP + 40, gw = R - gx - 4, gh = 300;
  for (int t = 0; t <= 24; t += 6) {
    const int y = gy + gh - t * gh / 24;
    s.dots(gx, y, gw, 4);
    s.text_r(F_S, gx - 8, y + 5, std::to_string(t) + " t");
  }
  int px_for = -1, py_for = 0;
  int mork_fra = -1;
  for (int d = 0; d < dager; ++d) {
    const SolDag sd = sol_dag(nyttar + d, c.sted.lat, c.sted.lon);
    const int px = gx + d * gw / dager;
    const int py = gy + gh - sd.lengde_min * gh / 1440;
    if (px_for >= 0) { s.line(px_for, py_for, px, py); s.line(px_for, py_for - 1, px, py - 1); }
    if (sd.type == SolType::Morketid && mork_fra < 0) mork_fra = px;
    if (sd.type != SolType::Morketid && mork_fra >= 0) { s.hatch(mork_fra, gy + gh - 18, px - mork_fra, 18, 3); mork_fra = -1; }
    px_for = px;
    py_for = py;
  }
  if (mork_fra >= 0) s.hatch(mork_fra, gy + gh - 18, gx + gw - mork_fra, 18, 3);
  for (int m = 0; m < 12; ++m) {
    const int px = gx + static_cast<int>((days_from_civil(l.y, m + 1, 1) - nyttar) * gw / dager);
    s.vline(px, gy + gh, 6);
    s.text(F_S, px + 6, gy + gh + 22, MND_KORT[m]);
  }
  // I dag
  const int d_idag = static_cast<int>(l.dag - nyttar);
  const SolDag sd = sol_dag(l.dag, c.sted.lat, c.sted.lon);
  const int px = gx + d_idag * gw / dager, py = gy + gh - sd.lengde_min * gh / 1440;
  s.vline(px, gy, gh);
  s.circle(px, py, 7, true);
  s.circle(px, py, 11);
  const std::string merke = "DU ER HER";
  const int tx = px + 16 + Skjerm::width(F_S, merke) > gx + gw ? px - 16 - Skjerm::width(F_S, merke) : px + 16;
  s.text(F_S, tx, std::max(gy + 16, std::min(py - 16, gy + gh - 28)), merke);
  // Retning
  const SolDag i_morgen = sol_dag(l.dag + 1, c.sted.lat, c.sted.lon);
  const int diff = i_morgen.lengde_min - sd.lengde_min;
  std::string t;
  if (sd.type == SolType::Morketid && l.m == 12 && l.d < 21) t = "Mørketid. Midt i den, 21. desember, snur det.";
  else if (sd.type == SolType::Morketid) t = "Mørketid, men det har snudd. Sola kommer " + dato_lang(l.dag + dager_til_sol(l.dag, c.sted.lat, c.sted.lon)) + ".";
  else if (sd.type == SolType::Midnattssol) t = "Midnattssol. Kurven står på toppen til " + dato_lang(l.dag + dager_til_solnedgang(l.dag, c.sted.lat, c.sted.lon)) + ".";
  else if (diff > 0) t = "Dagene blir lengre. " + std::to_string(diff) + " min mer lys i morgen.";
  else if (diff < 0) t = "Dagene blir kortere. Lyset snur 21. desember.";
  else t = "Lyset står stille i dag.";
  s.text(F_M, M, Skjerm::H - 20, t);
}

}  // namespace

std::string lys_linje(const Sted& st, ms_t naa) {
  const int64_t d = lokal(naa).dag;
  const SolDag sd = sol_dag(d, st.lat, st.lon);
  if (sd.type == SolType::Morketid) {
    const int n = dager_til_sol(d, st.lat, st.lon);
    std::string t = "Mørketid. Sola er tilbake om " + std::to_string(n) + (n == 1 ? " dag" : " dager") + " (" + dato_lang(d + n) + ").";
    if (sd.har_bla) t += " Blåtime " + kl(sd.bla_fra) + "–" + kl(sd.bla_til) + ".";
    return t;
  }
  if (sd.type == SolType::Midnattssol) {
    const int n = dager_til_solnedgang(d, st.lat, st.lon);
    return "Midnattssol. Sola går ikke ned i dag" + (n > 0 ? std::string(", og ikke før ") + dato_lang(d + n) + "." : std::string("."));
  }
  const SolDag ig = sol_dag(d - 1, st.lat, st.lon);
  const int diff = sd.lengde_min - (ig.type == SolType::Normal ? ig.lengde_min : sd.lengde_min);
  return "Sola opp " + kl(sd.opp) + ", ned " + kl(sd.ned) + ". " + lengde(sd.lengde_min) + " lys, " +
         (diff == 0 ? "like mye som i går." : std::to_string(std::abs(diff)) + " min " + (diff > 0 ? "mer" : "mindre") + " enn i går.");
}

void tegn(const Arkiv& a, const Ctx& c, Skjerm& s) {
  s.clear();
  switch (c.side) {
    case Side::IDag: idag(a, c, s); break;
    case Side::Aret: aret(a, c, s); break;
    default: uke(a, c, s); break;
  }
}

}  // namespace vindusvakt
