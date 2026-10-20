// Kameraets oppførsel: utløser, bla-knapp, skyvedeksel, tidtakere. Maskinvaren kaller bare disse.
#pragma once
#include <functional>
#include <vector>

#include "view.h"

namespace morkerom {

constexpr ms_t VIS_TATT = 3 * SEK;
constexpr ms_t VIS_KORT = 8 * SEK;
constexpr ms_t HOLD_QR = 3 * SEK;
constexpr ms_t HOLD_TVANG = 10 * SEK;

class Enhet {
 public:
  Rull rull;
  Ctx ctx;
  bool skitten = true;
  bool deksel_aapent = false;

  // Maskinvare: ta bildet og lagre det kryptert under denne id-en. false = ingenting lagret.
  std::function<bool(uint32_t id)> ta_bilde;
  // Maskinvare: hent (eller lag og bufre) fremkalt 1-bit for id. nullptr = ikke tilgjengelig.
  std::function<const std::vector<uint8_t>*(uint32_t id)> bits_for;

  void utloser(ms_t naa);
  void bla(ms_t naa);
  void hold_bla(ms_t varighet, ms_t naa);
  void deksel(bool aapent, ms_t naa);
  void tick(ms_t naa);
  void endret(ms_t naa) { ctx.naa = naa; skitten = true; }
  void tegn_til(Skjerm& s) { tegn(rull, ctx, s); skitten = false; }

 private:
  ms_t vis_til_ = 0;
  ms_t sist_sjekket_ = 0;
  std::string sist_nokkel_;
  void vis(Visning v, ms_t naa, ms_t varighet);
  void vis_fremkalt(int indeks, ms_t naa);
};

}  // namespace morkerom
