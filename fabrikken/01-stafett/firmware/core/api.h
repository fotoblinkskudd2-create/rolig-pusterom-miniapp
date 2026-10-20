// HTTP-API, uavhengig av nettverksstakk. ESP32-WebServer og vertsserveren kaller begge handle().
#pragma once
#include <functional>
#include <string>

#include "enhet.h"

namespace stafett {

struct Svar {
  int kode = 200;
  std::string type = "application/json; charset=utf-8";
  std::string kropp;
};

class Api {
 public:
  explicit Api(Enhet& e) : e_(e) {}

  std::string nokkel;                         // tom = ingen nøkkel (kun under utvikling)
  bool simulator = false;                     // tillat /api/hjul
  std::function<std::string()> index_html;    // telefon-UI
  std::function<bool(ms_t)> sett_klokke;      // telefonen vet hva klokka er; false = enheten beholder sin

  Svar handle(const std::string& metode, const std::string& sti, const std::string& kropp,
              const std::string& nokkel_header, ms_t naa);

  static std::string param(const std::string& sti, const std::string& navn);

 private:
  Enhet& e_;
};

}  // namespace stafett
