#include "view.h"

#include "qrcodegen.hpp"

namespace stafett {

namespace {

constexpr int M = 12;            // marg
constexpr int R = Fb::W - M;     // høyre kant for tekst
constexpr int TOPP = 30;         // topplinje-høyde
constexpr int BUNN = 274;        // bunnlinje starter

const Font& BODY = F_BODY;
const Font& LAB = F_LABEL;

void topp(Fb& fb, const Ctx& c, const std::string& tittel) {
  fb.fill(0, 0, Fb::W, TOPP);
  const int x = fb.text(LAB, M, 20, "STAFETT", false);
  if (!tittel.empty()) fb.text(LAB, x + 10, 20, "/  " + tittel, false);
  const Lokal l = lokal(c.naa);
  std::string h = std::string(UKEDAG_KORT[l.wd]) + " " + dato_kort(l) + "   " + klokke(l);
  if (c.batteri >= 0) h = std::to_string(c.batteri) + "%   " + h;
  fb.text_r(LAB, R, 20, h, false);
}

void bunn(Fb& fb, const Ctx& c) {
  fb.fill(0, BUNN, Fb::W, Fb::H - BUNN);
  fb.circle(M + 6, BUNN + 13, 6, false, false);
  fb.circle(M + 6, BUNN + 13, 2, true, false);
  fb.text(LAB, M + 18, BUNN + 18, "trykk: jeg er her", false);
  fb.text_r(LAB, R, BUNN + 18, c.url, false);
  // sideprikker
  const int n = static_cast<int>(Side::ANTALL);
  const int cx = Fb::W / 2 + 30, gap = 12;
  for (int i = 0; i < n; ++i)
    fb.circle(cx + (i - n / 2) * gap, BUNN + 13, 3, i == static_cast<int>(c.side), false);
}

void merkelapp(Fb& fb, int y, const std::string& t, bool invers = false) {
  if (invers) {
    const int w = Fb::width(LAB, t) + 8;
    fb.fill(M - 4, y - 12, w, 16);
    fb.text(LAB, M, y, t, false);
  } else {
    fb.text(LAB, M, y, t);
  }
}

void boks(Fb& fb, int x, int y, bool kryss) {
  fb.rect(x, y, 13, 13);
  if (kryss) {
    fb.line(x + 3, y + 6, x + 5, y + 9);
    fb.line(x + 5, y + 9, x + 10, y + 3);
    fb.line(x + 3, y + 7, x + 5, y + 10);
    fb.line(x + 5, y + 10, x + 10, y + 4);
  }
}

std::string nedtelling(const Kjol& k, ms_t naa) {
  return k.klar(naa) ? "klar" : igjen(k.frist - naa) + " igjen";
}

std::string forfall_dato(int32_t v) { return to_siffer(v % 100) + "." + to_siffer((v / 100) % 100); }

// ---------- sider ----------

void oversikt(const State& s, const Ctx& c, Fb& fb) {
  topp(fb, c, "");
  int y = TOPP + 18;

  // SIST UTE
  merkelapp(fb, y, "SIST UTE");
  const Handoff* h = s.siste_handoff();
  if (h) {
    fb.text(LAB, M + 74, y, Fb::fit(LAB, naar(h->ts, c.naa) + "  ·  " + h->del, R - M - 74));
    int by = y + 22;
    for (const auto& l : Fb::wrap(BODY, h->tekst, R - M, 3)) { fb.text(BODY, M, by, l); by += 20; }
  } else {
    fb.text(BODY, M, y + 22, "Ingen noter ennå. Skriv den første på");
    fb.text(BODY, M, y + 42, "telefonen: " + c.url);
  }
  y = 120;
  fb.dots(M, y, R - M, 2);

  // KJØLEROM
  y += 18;
  merkelapp(fb, y, "KJØLEROM");
  const auto ak = s.kjol_aktive(c.naa);
  if (ak.size() > 2) fb.text_r(LAB, R, y, "+" + std::to_string(ak.size() - 2) + " til");
  if (ak.empty()) {
    fb.text(BODY, M, y + 24, "Tomt. Det du vil ha, kan vente her i 48 t.");
  }
  for (size_t i = 0; i < ak.size() && i < 2; ++i) {
    const Kjol& k = *ak[i];
    const int ry = y + 24 + static_cast<int>(i) * 22;
    const bool klar = k.klar(c.naa);
    boks(fb, M, ry - 12, klar);
    const std::string tid = nedtelling(k, c.naa);
    const std::string pris = kroner(k.ore);
    const int tid_w = 86;
    fb.text_r(klar ? LAB : BODY, R, ry, tid);
    fb.text_r(BODY, R - tid_w - 8, ry, pris);
    const int ting_maks = R - tid_w - 8 - Fb::width(BODY, pris) - 12 - (M + 20);
    fb.text(BODY, M + 20, ry, Fb::fit(BODY, k.ting, ting_maks));
  }
  y = 194;
  fb.dots(M, y, R - M, 2);

  // NESTE FORFALL
  y += 18;
  const NesteForfall nf = s.neste_forfall(c.naa);
  merkelapp(fb, y, nf.forfalt ? "FORFALT" : "NESTE FORFALL", nf.forfalt);
  if (nf.f) {
    const std::string t = forfall_dato(nf.dato) + "  " + nf.f->navn;
    fb.text_r(BODY, R, y + 1, kroner(nf.f->ore));
    fb.text(BODY, M + 120, y + 1, Fb::fit(BODY, t, R - M - 120 - Fb::width(BODY, kroner(nf.f->ore)) - 10));
  } else {
    fb.text(BODY, M + 120, y + 1, "ingenting registrert");
  }

  // BORTE eller SPART
  y += 24;
  Borte b;
  if (s.siste_borte(c.naa, b)) {
    merkelapp(fb, y, "BORTE");
    fb.text(BODY, M + 120, y + 1, Fb::fit(BODY, naar(b.fra, c.naa) + " → " + naar(b.til, c.naa), R - M - 120 - 50));
    fb.text_r(LAB, R, y, varighet(b.til - b.fra));
  }
  y += 24;
  int n;
  int64_t sum;
  s.droppet(c.naa, 30 * DOGN, n, sum);
  if (n > 0) {
    merkelapp(fb, y, "LATT VÆRE");
    fb.text(BODY, M + 120, y + 1, std::to_string(n) + " ting siste 30 døgn");
    fb.text_r(LAB, R, y, kroner(sum));
  }
  bunn(fb, c);
}

void noter(const State& s, const Ctx& c, Fb& fb) {
  topp(fb, c, "NOTER");
  const auto& hs = s.handoffs();
  int y = TOPP + 20;
  if (hs.empty()) fb.text(BODY, M, y + 10, "Ingen noter ennå.");
  for (size_t i = hs.size(); i-- > 0 && y < BUNN - 30;) {
    const Handoff& h = hs[i];
    std::string hode = naar(h.ts, c.naa) + "  ·  " + h.del;
    if (h.svar_til) hode = "→ svar  ·  " + hode;
    fb.text(LAB, M, y, Fb::fit(LAB, hode, R - M));
    y += 20;
    const int plass = (BUNN - 8 - y) / 20;
    const int maks = plass < 3 ? plass : 3;
    if (maks <= 0) break;
    for (const auto& l : Fb::wrap(BODY, h.tekst, R - M - 10, maks)) { fb.text(BODY, M + 10, y, l); y += 20; }
    y += 8;
  }
  bunn(fb, c);
}

void kjolerom(const State& s, const Ctx& c, Fb& fb) {
  topp(fb, c, "KJØLEROM");
  const auto ak = s.kjol_aktive(c.naa);
  int y = TOPP + 24;
  if (ak.empty()) {
    fb.text(BODY, M, y + 6, "Tomt.");
    fb.text(BODY, M, y + 30, "Legg det du har lyst på her. Det venter i");
    fb.text(BODY, M, y + 50, "48 timer. Etterpå bestemmer du: kjøp,");
    fb.text(BODY, M, y + 70, "dropp eller 48 t til. Ingenting er forbudt.");
  }
  for (const Kjol* kp : ak) {
    if (y > BUNN - 70) break;
    const Kjol& k = *kp;
    const bool klar = k.klar(c.naa);
    const std::string pris = kroner(k.ore);
    fb.text_r(BODY, R, y, pris);
    fb.text(BODY, M, y, Fb::fit(BODY, k.ting, R - M - Fb::width(BODY, pris) - 12));
    y += 10;
    // 48 t-stolpe
    const int bw = R - M;
    fb.rect(M, y, bw, 8);
    const ms_t total = k.frist - k.lagt_inn > 0 ? k.frist - k.lagt_inn : 1;
    ms_t gaatt = c.naa - k.lagt_inn;
    if (gaatt > total) gaatt = total;
    if (gaatt < 0) gaatt = 0;
    fb.fill(M, y, static_cast<int>((bw * gaatt) / total), 8);
    y += 22;
    std::string under = naar(k.lagt_inn, c.naa) + "  ·  " + k.del;
    if (!k.butikk.empty()) under += "  ·  " + k.butikk;
    const std::string hoyre = klar ? "KLAR · AVGJØR PÅ TLF" : nedtelling(k, c.naa);
    fb.text_r(LAB, R, y, hoyre);
    fb.text(LAB, M, y, Fb::fit(LAB, under, R - M - Fb::width(LAB, hoyre) - 12));
    y += 22;
  }
  int n;
  int64_t sum;
  s.droppet(c.naa, 30 * DOGN, n, sum);
  fb.dots(M, BUNN - 26, R - M, 2);
  fb.text(LAB, M, BUNN - 8, "LATT VÆRE SISTE 30 DØGN");
  fb.text_r(LAB, R, BUNN - 8, std::to_string(n) + " ting  ·  " + kroner(sum));
  bunn(fb, c);
}

void tidslinje(const State& s, const Ctx& c, Fb& fb) {
  topp(fb, c, "TIDSLINJE");
  const int x0 = 66, x1 = R, bw = x1 - x0;
  const Lokal idag = lokal(c.naa);
  // timemerker
  int y = TOPP + 18;
  for (int t = 0; t <= 24; t += 6) {
    const int x = x0 + bw * t / 24;
    fb.text_c(LAB, x, y, std::to_string(t));
  }
  y += 6;
  const int rad_h = 27;
  const auto& akt = s.aktivitet();
  for (int d = 6; d >= 0; --d) {
    const int64_t dag = idag.dag - d;
    const ms_t dag_start = dag * DOGN - oslo_offset(dag * DOGN);
    const ms_t dag_slutt = dag_start + DOGN;
    const Lokal l = lokal(dag_start + TIME * 12);
    const int ry = y + (6 - d) * rad_h;
    fb.text(LAB, M, ry + 18, std::string(UKEDAG_KORT[l.wd]) + " " + to_siffer(l.d));
    fb.rect(x0, ry + 6, bw, 16);
    auto xpos = [&](ms_t t) {
      if (t < dag_start) t = dag_start;
      if (t > dag_slutt) t = dag_slutt;
      return x0 + static_cast<int>((bw * (t - dag_start)) / DOGN);
    };
    // fravær (skravert)
    for (size_t i = 1; i < akt.size(); ++i) {
      if (akt[i] - akt[i - 1] <= BORTE_TERSKEL) continue;
      if (akt[i] < dag_start || akt[i - 1] > dag_slutt) continue;
      const int a = xpos(akt[i - 1]), b = xpos(akt[i]);
      fb.hatch(a, ry + 7, b - a, 14, 3);
    }
    // pågående fravær
    if (!akt.empty() && c.naa - akt.back() > BORTE_TERSKEL && c.naa >= dag_start && akt.back() <= dag_slutt) {
      const int a = xpos(akt.back()), b = xpos(c.naa);
      fb.hatch(a, ry + 7, b - a, 14, 3);
    }
    // aktivitet
    for (ms_t t : akt) if (t >= dag_start && t < dag_slutt) fb.fill(xpos(t), ry + 4, 2, 20);
    // nå-markør
    if (d == 0) {
      const int nx = xpos(c.naa);
      fb.line(nx - 4, ry + 1, nx + 4, ry + 1);
      fb.line(nx - 4, ry + 1, nx, ry + 5);
      fb.line(nx + 4, ry + 1, nx, ry + 5);
    }
  }
  fb.fill(M, BUNN - 16, 2, 12);
  fb.text(LAB, M + 8, BUNN - 6, "noe skjedde");
  fb.hatch(M + 100, BUNN - 16, 22, 12, 3);
  fb.rect(M + 100, BUNN - 16, 22, 12);
  fb.text(LAB, M + 128, BUNN - 6, "ingen spor > " + varighet(BORTE_TERSKEL));
  bunn(fb, c);
}

void velkommen(const State& s, const Ctx& c, Fb& fb) {
  fb.clear();
  fb.text(F_HUGE, 28, 92, "Hei.");
  fb.text(F_BIG, 28, 140, "Du var borte i " + varighet(c.borte_ms) + ".");
  const Handoff* h = s.siste_handoff();
  int y = 182;
  if (h) {
    fb.text(BODY, 28, y, "Siste note: " + naar(h->ts, c.naa) + " · " + h->del);
    y += 22;
  }
  const auto ak = s.kjol_aktive(c.naa);
  int klare = 0;
  for (auto* k : ak) klare += k->klar(c.naa);
  if (klare) {
    fb.text(BODY, 28, y, std::to_string(klare) + " ting i kjølerommet er " + (klare == 1 ? "klar" : "klare") + " til å avgjøres.");
    y += 22;
  }
  fb.text(LAB, 28, 268, "VRI HJULET FOR Å LESE");
}

void qr(const State&, const Ctx& c, Fb& fb) {
  topp(fb, c, "KOBLE TIL");
  using qrcodegen::QrCode;
  const QrCode q = QrCode::encodeText(("http://" + c.url + "/" + (c.nokkel.empty() ? "" : "#k=" + c.nokkel)).c_str(), QrCode::Ecc::MEDIUM);
  const int n = q.getSize();
  const int skala = 180 / (n + 4);
  const int x0 = M + 4, y0 = TOPP + 24;
  fb.fill(x0, y0, (n + 4) * skala, (n + 4) * skala, false);
  for (int y = 0; y < n; ++y)
    for (int x = 0; x < n; ++x)
      if (q.getModule(x, y)) fb.fill(x0 + (x + 2) * skala, y0 + (y + 2) * skala, skala, skala);
  const int tx = x0 + (n + 4) * skala + 18;
  int y = TOPP + 46;
  fb.text(LAB, tx, y, "1. NETTVERK");
  fb.text(BODY, tx, y + 22, c.ap_navn);
  y += 56;
  fb.text(LAB, tx, y, "2. PASSORD");
  fb.text(BODY, tx, y + 22, c.ap_pass.empty() ? "(hjemmenett)" : c.ap_pass);
  y += 56;
  fb.text(LAB, tx, y, "3. ÅPNE");
  fb.text(BODY, tx, y + 22, c.url);
  fb.text(BODY, M + 4, BUNN - 12, "Ingen internett. Bare telefonen og denne.");
  bunn(fb, c);
}

void reset(const State&, const Ctx& c, Fb& fb) {
  fb.clear(true);
  fb.text(F_BIG, 28, 100, "Slette alt?", false);
  fb.text(BODY, 28, 140, "Alle noter, kjølerom og forfall forsvinner.", false);
  fb.text(BODY, 28, 162, "Det kan ikke angres. Eksporter først.", false);
  fb.text(LAB, 28, 220, "TRYKK = SLETT      VRI = AVBRYT", false);
  (void)c;
}

}  // namespace

void tegn(const State& s, const Ctx& c, Fb& fb) {
  fb.clear();
  switch (c.overlay) {
    case Overlay::Velkommen: velkommen(s, c, fb); return;
    case Overlay::Qr: qr(s, c, fb); return;
    case Overlay::Reset: reset(s, c, fb); return;
    case Overlay::Ingen: break;
  }
  switch (c.side) {
    case Side::Noter: noter(s, c, fb); break;
    case Side::Kjolerom: kjolerom(s, c, fb); break;
    case Side::Tidslinje: tidslinje(s, c, fb); break;
    default: oversikt(s, c, fb); break;
  }
}

}  // namespace stafett
