#include "enhet.h"

namespace stafett {

void Enhet::vis(Overlay o, ms_t naa, ms_t varighet) {
  ctx.overlay = o;
  overlay_til_ = varighet > 0 ? naa + varighet : 0;
  ctx.naa = naa;
  skitten = true;
}

void Enhet::trykk(ms_t naa) {
  if (ctx.overlay == Overlay::Reset) {
    if (slett_alt) slett_alt();
    auto skriv = s.skriv;
    s = State{};
    s.skriv = skriv;
    vis(Overlay::Ingen, naa, 0);
    ctx.side = Side::Oversikt;
    return;
  }
  if (ctx.overlay != Overlay::Ingen) { vis(Overlay::Ingen, naa, 0); return; }
  const ms_t sist = s.siste_aktivitet();
  const ms_t borte = sist ? naa - sist : 0;
  s.her(naa, "");
  ctx.side = Side::Oversikt;
  if (borte > BORTE_TERSKEL) {
    ctx.borte_ms = borte;
    vis(Overlay::Velkommen, naa, OVERLAY_TID);
  } else {
    vis(Overlay::Ingen, naa, 0);
  }
}

void Enhet::vri(int retning, ms_t naa) {
  if (ctx.overlay != Overlay::Ingen) { vis(Overlay::Ingen, naa, 0); return; }
  const int n = static_cast<int>(Side::ANTALL);
  ctx.side = static_cast<Side>(((static_cast<int>(ctx.side) + (retning > 0 ? 1 : -1)) % n + n) % n);
  ctx.naa = naa;
  skitten = true;
}

void Enhet::hold(ms_t varighet, ms_t naa) {
  if (varighet >= HOLD_RESET) vis(Overlay::Reset, naa, 30 * SEK);
  else if (varighet >= HOLD_QR) vis(Overlay::Qr, naa, 120 * SEK);
  else trykk(naa);
}

void Enhet::tick(ms_t naa) {
  if (overlay_til_ && naa >= overlay_til_) {
    ctx.overlay = Overlay::Ingen;
    overlay_til_ = 0;
    skitten = true;
  }
  const int minutt = lokal(naa).mm;
  if (minutt != sist_minutt_) { sist_minutt_ = minutt; skitten = true; }
  ctx.naa = naa;
}

}  // namespace stafett
