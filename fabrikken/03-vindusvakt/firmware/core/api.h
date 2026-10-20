// Vindusvaktens telefon-API: se uka, sett stedet. Uavhengig av nettverksstakk.
#pragma once
#include <functional>
#include <string>

#include "enhet.h"

namespace vindusvakt {

struct Svar {
  int kode = 200;
  std::string type = "application/json; charset=utf-8";
  std::string kropp;
};

class Api {
 public:
  explicit Api(Enhet& e) : e_(e) {}
  std::string nokkel;
  bool simulator = false;
  std::function<std::string()> index_html;
  std::function<bool(ms_t)> sett_klokke;
  std::function<void(const Sted&)> lagre_sted;

  Svar handle(const std::string& metode, const std::string& sti, const std::string& kropp,
              const std::string& nokkel_header, ms_t naa);
  static std::string param(const std::string& sti, const std::string& navn);
  std::string state_json(ms_t naa) const;

 private:
  Enhet& e_;
};

}  // namespace vindusvakt
