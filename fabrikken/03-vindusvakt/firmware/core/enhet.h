// Vindusvaktens oppførsel: ett bilde i timen, én knapp som blar, linsedeksel bak = privat.
#pragma once
#include <functional>

#include "view.h"

namespace vindusvakt {

class Enhet {
 public:
  Arkiv arkiv;
  Ctx ctx;
  bool skitten = true;

  std::function<bool(Gra&)> fang;        // maskinvare: ta et bilde ut av vinduet, som gråtoner
  std::function<void()> lagre;           // maskinvare: skriv arkivet til flash

  void knapp(ms_t naa);
  void privat(bool lukket, ms_t naa);
  void tick(ms_t naa);                   // kalles ofte; fanger ett bilde per hele time
  void tegn_til(Skjerm& s) { tegn(arkiv, ctx, s); skitten = false; }
  int64_t siste_time() const { return siste_time_; }

 private:
  int64_t siste_time_ = -1;
};

}  // namespace vindusvakt
