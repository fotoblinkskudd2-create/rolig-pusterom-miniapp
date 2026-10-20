#include "enhet.h"

namespace vindusvakt {

void Enhet::knapp(ms_t naa) {
  const int n = static_cast<int>(Side::ANTALL);
  ctx.side = static_cast<Side>((static_cast<int>(ctx.side) + 1) % n);
  ctx.naa = naa;
  skitten = true;
}

void Enhet::privat(bool lukket, ms_t naa) {
  ctx.privat = lukket;
  ctx.naa = naa;
  skitten = true;
}

void Enhet::tick(ms_t naa) {
  ctx.naa = naa;
  const int64_t time = floordiv(naa, TIME);
  if (time == siste_time_) return;
  siste_time_ = time;
  skitten = true;  // klokke og lys oppdateres hver time
  if (ctx.privat || !fang) return;
  Gra g;
  if (!fang(g) || g.px.empty()) return;
  arkiv.legg(lag_prove(g, naa));
  arkiv.stor = lag_stor(g);
  arkiv.stor_ts = naa;
  if (lagre) lagre();
}

}  // namespace vindusvakt
