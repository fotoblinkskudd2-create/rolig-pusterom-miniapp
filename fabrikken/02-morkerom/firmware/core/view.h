#pragma once
#include <string>
#include <vector>

#include "fonts.h"
#include "ramme.h"
#include "rull.h"

namespace morkerom {

using Skjerm = felles::Ramme<200, 200>;
constexpr int BILDE_W = 200, BILDE_H = 144;  // fremkalt 1-bit-bilde på bakskjermen (25:18 ≈ 4:3 beskjært)

enum class Visning { Status, Tatt, Fremkalt, Nye, Full, Tvang, Qr, Av };

struct Ctx {
  ms_t naa = 0;
  Visning vis = Visning::Status;
  uint32_t bilde_id = 0;                 // for Fremkalt / Tatt
  int indeks = 0, av = 0;                // «2/7»
  int nye = 0;                           // for Nye
  const std::vector<uint8_t>* bits = nullptr;  // fremkalt bilde, BILDE_W×BILDE_H
  std::string url = "morkerom.local";
  std::string ap_navn = "Morkerom", ap_pass, nokkel;
  int batteri = -1;
};

void tegn(const Rull& r, const Ctx& c, Skjerm& s);

}  // namespace morkerom
