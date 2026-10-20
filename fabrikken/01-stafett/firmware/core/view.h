#pragma once
#include <string>

#include "fb.h"
#include "state.h"

namespace stafett {

enum class Side { Oversikt = 0, Noter, Kjolerom, Tidslinje, ANTALL };
enum class Overlay { Ingen, Velkommen, Qr, Reset };

struct Ctx {
  ms_t naa = 0;
  Side side = Side::Oversikt;
  Overlay overlay = Overlay::Ingen;
  ms_t borte_ms = 0;              // for Velkommen
  std::string url = "stafett.local";
  std::string ap_navn = "Stafett";
  std::string ap_pass;
  std::string nokkel;              // parring: QR-koden bærer nøkkelen til telefonen
  int batteri = -1;               // -1 = på USB
};

void tegn(const State& s, const Ctx& c, Fb& fb);

}  // namespace stafett
