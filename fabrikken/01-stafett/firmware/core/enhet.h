// Enhetslogikk: hjulet, overlegg, tidtakere. Maskinvaren kaller bare disse metodene.
#pragma once
#include <functional>

#include "view.h"

namespace stafett {

constexpr ms_t OVERLAY_TID = 8 * SEK;
constexpr ms_t HOLD_QR = 3 * SEK;
constexpr ms_t HOLD_RESET = 10 * SEK;

class Enhet {
 public:
  State s;
  Ctx ctx;
  bool skitten = true;                // skjermen må tegnes på nytt
  std::function<void()> slett_alt;    // fabrikkreset (sletter logg, starter på nytt)

  void trykk(ms_t naa);
  void vri(int retning, ms_t naa);
  void hold(ms_t varighet, ms_t naa);  // kalles når knappen slippes etter langt trykk
  void tick(ms_t naa);                  // kalles minst hvert sekund
  void endret(ms_t naa) { ctx.naa = naa; skitten = true; }  // etter API-endring
  void tegn_til(Fb& fb) { tegn(s, ctx, fb); skitten = false; }

 private:
  ms_t overlay_til_ = 0;
  int sist_minutt_ = -1;
  void vis(Overlay o, ms_t naa, ms_t varighet);
};

}  // namespace stafett
