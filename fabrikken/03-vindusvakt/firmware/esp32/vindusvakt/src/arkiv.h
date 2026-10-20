// Vindusvaktens hukommelse: én prøve i timen i åtte døgn. Bare 1-bit-miniatyr og lysverdi — aldri originalbildet.
#pragma once
#include <array>
#include <cstdint>
#include <string>
#include <vector>

#include "dither.h"
#include "json.h"
#include "sol.h"
#include "tid.h"

namespace vindusvakt {

using namespace felles;

constexpr int TW = 112, TH = 84, TB = TW * TH / 8;           // miniatyr i ukesvisningen
constexpr int SW = 336, SH = 252, SB = SW * SH / 8;          // siste bilde, stort
constexpr int DOGN_I_ARKIV = 8;

struct Prove {
  ms_t ts = 0;
  uint8_t lys = 0;                // middel-lysstyrke 0–255 i hele bildet
  std::array<uint8_t, TB> bits{};
};

struct Sted {
  std::string navn = "Oslo";
  double lat = 59.9139, lon = 10.7522;
};

// Lag prøve fra et gråtonebilde. Mørke bilder strekkes ikke (det gir bare støy).
Prove lag_prove(const Gra& g, ms_t ts);
std::vector<uint8_t> lag_stor(const Gra& g);
uint8_t middel(const Gra& g);

class Arkiv {
 public:
  void legg(const Prove& p);                       // sortert, eldre enn 8 døgn fra nyeste kastes
  const Prove* naermest(ms_t t, ms_t tol = 40 * MIN) const;
  const std::vector<Prove>& alle() const { return prover_; }
  const Prove* siste() const { return prover_.empty() ? nullptr : &prover_.back(); }

  std::vector<uint8_t> stor;  // siste store bilde (SB byte) eller tomt
  ms_t stor_ts = 0;

  std::string serialiser() const;
  bool les(const std::string& data);

 private:
  std::vector<Prove> prover_;
};

std::string sted_json(const Sted& s);
bool sted_fra_json(const std::string& j, Sted& s, std::string& feil);

}  // namespace vindusvakt
