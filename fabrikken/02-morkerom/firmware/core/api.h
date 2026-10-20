// Fremkallingsrommet: telefonens API. Uavhengig av nettverksstakk.
#pragma once
#include <functional>
#include <string>

#include "enhet.h"

namespace morkerom {

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
  std::function<bool(uint32_t id, std::string& jpeg)> les_original;  // dekrypterer

  Svar handle(const std::string& metode, const std::string& sti, const std::string& kropp,
              const std::string& nokkel_header, ms_t naa);

  static std::string param(const std::string& sti, const std::string& navn);
  static std::string pbm(const std::vector<uint8_t>& bits, int w, int h);
  std::string kontaktark(ms_t naa, int& w, int& h) const;  // 1-bit, 4 kolonner à 100×72

 private:
  Enhet& e_;
};

}  // namespace morkerom
