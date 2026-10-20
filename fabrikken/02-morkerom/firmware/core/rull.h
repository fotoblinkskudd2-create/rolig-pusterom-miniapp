// Mørkerommets modell: bilder som ligger i mørket i 48 timer. Append-only hendelseslogg.
#pragma once
#include <cstdint>
#include <functional>
#include <string>
#include <vector>

#include "json.h"
#include "tid.h"

namespace morkerom {

using namespace felles;

constexpr ms_t MORKE = 48 * TIME;
constexpr int RULL = 24;  // maks bilder i mørket samtidig

struct Bilde {
  uint32_t id = 0;
  ms_t tatt = 0;
  ms_t fremkalles = 0;   // tatt + 48 t, eller tidspunkt for tvunget fremkalling
  int oppdrag = -1;      // dagens oppdrag da bildet ble tatt
  bool tvunget = false;
  bool kastet = false;
  bool fremkalt(ms_t naa) const { return !kastet && naa >= fremkalles; }
  bool i_morket(ms_t naa) const { return !kastet && naa < fremkalles; }
};

struct Resultat {
  bool ok = true;
  std::string feil;
  uint32_t id = 0;
  static Resultat Feil(const std::string& f) { Resultat r; r.ok = false; r.feil = f; return r; }
};

class Rull {
 public:
  std::function<bool(const std::string&)> skriv;

  bool spill_av(const std::string& linje);

  Resultat ta(ms_t naa, int oppdrag);           // nytt bilde inn i mørket
  Resultat fremkall_alt(ms_t naa);              // tvunget: alt i mørket fremkalles nå
  Resultat kast(ms_t naa, uint32_t id);         // fjern et bilde for godt

  const std::vector<Bilde>& bilder() const { return bilder_; }
  const Bilde* finn(uint32_t id) const;
  int i_morket(ms_t naa) const;
  int igjen(ms_t naa) const { return RULL - i_morket(naa); }
  int tatt_totalt() const { return static_cast<int>(bilder_.size()); }
  int rull_nr() const { return tatt_totalt() / RULL + 1; }
  ms_t neste_fremkalling(ms_t naa) const;       // 0 = ingen i mørket
  std::vector<const Bilde*> fremkalte(ms_t naa) const;  // nyeste først
  std::vector<uint32_t> fremkalt_mellom(ms_t fra, ms_t til) const;  // (fra, til]
  int tvunget() const;
  uint32_t neste_id() const { return neste_id_; }

  std::string til_json(ms_t naa) const;

 private:
  bool bruk(const json::Obj& ev);
  Resultat send(const json::Obj& ev);
  uint32_t neste_id_ = 1;
  std::vector<Bilde> bilder_;
};

}  // namespace morkerom
