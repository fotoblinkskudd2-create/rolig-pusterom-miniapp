#pragma once
#include <string>

#include "arkiv.h"
#include "fonts.h"
#include "ramme.h"

namespace vindusvakt {

using Skjerm = felles::Ramme<800, 480>;

enum class Side { Uke = 0, IDag, Aret, ANTALL };

constexpr int UKE_TIMER[4] = {8, 12, 16, 20};  // lokale klokkeslett i ukesvisningen

struct Ctx {
  ms_t naa = 0;
  Side side = Side::Uke;
  Sted sted;
  bool privat = false;  // linsedekselet bak er lukket
};

void tegn(const Arkiv& a, const Ctx& c, Skjerm& s);

// Tekst om dagens lys, brukt både på skjermen og i API-et.
std::string lys_linje(const Sted& st, ms_t naa);

}  // namespace vindusvakt
