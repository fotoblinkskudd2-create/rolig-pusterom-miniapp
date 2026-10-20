#include "enhet.h"

#include "oppdrag.h"

namespace morkerom {

void Enhet::vis(Visning v, ms_t naa, ms_t varighet) {
  ctx.vis = v;
  ctx.naa = naa;
  vis_til_ = varighet > 0 ? naa + varighet : 0;
  skitten = true;
}

void Enhet::vis_fremkalt(int indeks, ms_t naa) {
  const auto f = rull.fremkalte(naa);
  if (f.empty() || indeks >= static_cast<int>(f.size())) { ctx.bits = nullptr; vis(Visning::Status, naa, 0); return; }
  ctx.indeks = indeks;
  ctx.av = static_cast<int>(f.size());
  ctx.bilde_id = f[indeks]->id;
  ctx.bits = bits_for ? bits_for(ctx.bilde_id) : nullptr;
  vis(Visning::Fremkalt, naa, 60 * SEK);
}

void Enhet::utloser(ms_t naa) {
  if (ctx.vis == Visning::Tvang) {
    const int n = rull.i_morket(naa);
    if (rull.fremkall_alt(naa).ok) { ctx.nye = n; sist_sjekket_ = naa; vis(Visning::Nye, naa, 0); }
    else vis(Visning::Status, naa, 0);
    return;
  }
  if (!deksel_aapent) return;
  if (rull.igjen(naa) <= 0) { vis(Visning::Full, naa, VIS_KORT); return; }
  const uint32_t id = rull.neste_id();
  if (ta_bilde && !ta_bilde(id)) return;  // ingenting lagret: ingenting logget
  const Resultat r = rull.ta(naa, dagens_oppdrag(naa));
  if (!r.ok) return;
  ctx.bilde_id = r.id;
  vis(Visning::Tatt, naa, VIS_TATT);
}

void Enhet::bla(ms_t naa) {
  switch (ctx.vis) {
    case Visning::Tvang:
    case Visning::Qr:
    case Visning::Full:
    case Visning::Tatt:
      vis(Visning::Status, naa, 0);
      return;
    case Visning::Fremkalt:
      vis_fremkalt(ctx.indeks + 1, naa);
      return;
    default:
      vis_fremkalt(0, naa);
  }
}

void Enhet::hold_bla(ms_t varighet, ms_t naa) {
  if (varighet >= HOLD_TVANG) {
    if (rull.i_morket(naa) > 0) vis(Visning::Tvang, naa, 30 * SEK);
  } else if (varighet >= HOLD_QR) {
    vis(Visning::Qr, naa, 120 * SEK);
  } else {
    bla(naa);
  }
}

void Enhet::deksel(bool aapent, ms_t naa) {
  deksel_aapent = aapent;
  if (!aapent) vis(Visning::Status, naa, 0);
  else { ctx.naa = naa; skitten = true; }
}

void Enhet::tick(ms_t naa) {
  ctx.naa = naa;
  if (vis_til_ && naa >= vis_til_) vis(Visning::Status, naa, 0);
  if (!sist_sjekket_) sist_sjekket_ = naa;
  const auto nye = rull.fremkalt_mellom(sist_sjekket_, naa);
  sist_sjekket_ = naa;
  if (!nye.empty() && (ctx.vis == Visning::Status || ctx.vis == Visning::Nye)) {
    ctx.nye = (ctx.vis == Visning::Nye ? ctx.nye : 0) + static_cast<int>(nye.size());
    vis(Visning::Nye, naa, 0);
  }
  // Statusskjermen tegnes bare på nytt når noe synlig endres (e-blekk og batteri).
  if (ctx.vis == Visning::Status) {
    const ms_t neste = rull.neste_fremkalling(naa);
    const ms_t igjen = neste ? (neste - naa + TIME - 1) / TIME : -1;
    const std::string k = std::to_string(igjen) + "|" + std::to_string(rull.i_morket(naa)) + "|" +
                          std::to_string(dagens_oppdrag(naa)) + "|" + std::to_string(lokal(naa).hh) + ":" +
                          std::to_string(lokal(naa).mm) + "|" + std::to_string(ctx.batteri);
    if (k != sist_nokkel_) { sist_nokkel_ = k; skitten = true; }
  }
}

}  // namespace morkerom
