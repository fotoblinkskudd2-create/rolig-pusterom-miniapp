#include "view.h"

#include "oppdrag.h"
#include "qrcodegen.hpp"

namespace morkerom {

namespace {

constexpr int M = 8;
constexpr int R = Skjerm::W - M;

void topp(Skjerm& s, const Ctx& c, const std::string& tittel) {
  s.fill(0, 0, Skjerm::W, 20);
  s.text(F_S, M, 14, tittel, false);
  const Lokal l = lokal(c.naa);
  std::string h = std::string(UKEDAG_KORT[l.wd]) + " " + klokke(l);
  if (c.batteri >= 0) h = std::to_string(c.batteri) + "%  " + h;
  s.text_r(F_S, R, 14, h, false);
}

std::string dato_kl(ms_t t) {
  const Lokal l = lokal(t);
  return std::string(UKEDAG_KORT[l.wd]) + " " + dato_kort(l) + " " + klokke(l);
}

std::string om(ms_t d) {
  if (d <= 0) return "nå";
  if (d > TIME) return std::to_string((d + TIME - 1) / TIME) + " t";
  return std::to_string((d + MIN - 1) / MIN) + " min";
}

void status(const Rull& r, const Ctx& c, Skjerm& s) {
  topp(s, c, "MØRKEROM");
  const int n = r.i_morket(c.naa);
  const std::string tall = std::to_string(n);
  s.text_c(F_XL, Skjerm::W / 2, 92, tall);
  s.text_c(F_M, Skjerm::W / 2, 112, n == 1 ? "bilde i mørket" : "bilder i mørket");
  const ms_t neste = r.neste_fremkalling(c.naa);
  s.text_c(F_S, Skjerm::W / 2, 128, neste ? "neste fremkalles om " + om(neste - c.naa) : "ta et bilde");
  s.dots(M, 138, R - M, 2);
  s.text(F_S, M, 153, "I DAG");
  int y = 170;
  for (const auto& l : Skjerm::wrap(F_M, OPPDRAG[dagens_oppdrag(c.naa)], R - M, 2)) { s.text(F_M, M, y, l); y += 16; }
  s.text(F_S, M, 197, "rull " + std::to_string(r.rull_nr()));
  s.text_r(F_S, R, 197, std::to_string(r.igjen(c.naa)) + " igjen");
}

void tatt(const Rull& r, const Ctx& c, Skjerm& s) {
  s.clear(true);
  s.text_c(F_L, Skjerm::W / 2, 80, "Inn i mørket.", false);
  const Bilde* b = r.finn(c.bilde_id);
  if (b) {
    s.text_c(F_S, Skjerm::W / 2, 112, "FREMKALLES", false);
    s.text_c(F_M, Skjerm::W / 2, 132, dato_kl(b->fremkalles), false);
  }
  s.text_c(F_S, Skjerm::W / 2, 186, std::to_string(r.igjen(c.naa)) + " igjen på rullen", false);
}

void fremkalt(const Rull& r, const Ctx& c, Skjerm& s) {
  s.clear();
  if (c.bits && c.bits->size() == static_cast<size_t>(BILDE_W) * BILDE_H / 8) {
    for (int y = 0; y < BILDE_H; ++y)
      for (int x = 0; x < BILDE_W; ++x)
        if ((*c.bits)[(static_cast<size_t>(y) * BILDE_W + x) >> 3] & (0x80 >> (x & 7))) s.px(x, y);
  } else {
    s.hatch(0, 0, BILDE_W, BILDE_H, 5);
    s.text_c(F_M, Skjerm::W / 2, BILDE_H / 2, "fremkaller …");
  }
  const Bilde* b = r.finn(c.bilde_id);
  s.hline(0, BILDE_H, Skjerm::W);
  if (b) {
    s.text(F_S, M, BILDE_H + 16, dato_kl(b->tatt));
    s.text_r(F_S, R, BILDE_H + 16, std::to_string(c.indeks + 1) + "/" + std::to_string(c.av));
    const std::string under = b->oppdrag >= 0 ? OPPDRAG[b->oppdrag] : (b->tvunget ? "fremkalt tidlig" : "");
    int y = BILDE_H + 33;
    for (const auto& l : Skjerm::wrap(F_M, under, R - M, 2)) { s.text(F_M, M, y, l); y += 15; }
  }
}

void nye(const Rull&, const Ctx& c, Skjerm& s) {
  topp(s, c, "MØRKEROM");
  s.text_c(F_XL, Skjerm::W / 2, 104, std::to_string(c.nye));
  s.text_c(F_L, Skjerm::W / 2, 136, "fremkalt.");
  s.text_c(F_S, Skjerm::W / 2, 176, "TRYKK BLA FOR Å SE");
}

void full(const Rull& r, const Ctx& c, Skjerm& s) {
  topp(s, c, "MØRKEROM");
  s.text_c(F_L, Skjerm::W / 2, 80, "Rullen er full.");
  const ms_t neste = r.neste_fremkalling(c.naa);
  s.text_c(F_M, Skjerm::W / 2, 112, "24 bilder ligger i mørket.");
  if (neste) s.text_c(F_M, Skjerm::W / 2, 132, "Neste blir ledig om " + om(neste - c.naa) + ".");
  s.text_c(F_S, Skjerm::W / 2, 180, "SE PÅ NOE I MELLOMTIDEN");
}

void tvang(const Rull& r, const Ctx& c, Skjerm& s) {
  s.clear(true);
  s.text(F_L, M, 46, "Fremkalle alt nå?", false);
  const int n = r.i_morket(c.naa);
  s.text(F_M, M, 76, std::to_string(n) + (n == 1 ? " bilde" : " bilder") + " kommer ut av", false);
  s.text(F_M, M, 94, "mørket med en gang.", false);
  s.text(F_M, M, 118, "Det er lov. Det telles.", false);
  s.text(F_S, M, 168, "UTLØSER = JA", false);
  s.text(F_S, M, 186, "BLA = NEI", false);
}

void qr(const Rull&, const Ctx& c, Skjerm& s) {
  s.clear();
  using qrcodegen::QrCode;
  const QrCode q = QrCode::encodeText(("http://" + c.url + "/" + (c.nokkel.empty() ? "" : "#k=" + c.nokkel)).c_str(), QrCode::Ecc::LOW);
  const int n = q.getSize();
  const int skala = 130 / (n + 2);
  const int side = (n + 2) * skala;
  const int x0 = (Skjerm::W - side) / 2, y0 = 4;
  for (int y = 0; y < n; ++y)
    for (int x = 0; x < n; ++x)
      if (q.getModule(x, y)) s.fill(x0 + (x + 1) * skala, y0 + (y + 1) * skala, skala, skala);
  int y = y0 + side + 14;
  s.text_c(F_S, Skjerm::W / 2, y, "NETT  " + c.ap_navn);
  s.text_c(F_S, Skjerm::W / 2, y + 15, "PASSORD  " + c.ap_pass);
  s.text_c(F_S, Skjerm::W / 2, y + 30, c.url);
}

}  // namespace

void tegn(const Rull& r, const Ctx& c, Skjerm& s) {
  s.clear();
  switch (c.vis) {
    case Visning::Tatt: tatt(r, c, s); break;
    case Visning::Fremkalt: fremkalt(r, c, s); break;
    case Visning::Nye: nye(r, c, s); break;
    case Visning::Full: full(r, c, s); break;
    case Visning::Tvang: tvang(r, c, s); break;
    case Visning::Qr: qr(r, c, s); break;
    case Visning::Status:
    case Visning::Av: status(r, c, s); break;
  }
}

}  // namespace morkerom
