// render: tre scenarier × tre sider → PBM, med den ekte kjernen og simulert utsikt.
//   render <utmappe>
#include <sys/stat.h>

#include <cstdlib>
#include <fstream>
#include <iostream>

#include "../core/enhet.h"
#include "scene.h"

using namespace vindusvakt;

static void skriv(const std::string& p, const Skjerm& s) {
  std::ofstream f(p, std::ios::binary);
  f << "P4\n800 480\n";
  f.write(reinterpret_cast<const char*>(s.buf), Skjerm::BYTES);
  if (!f) { std::cerr << "kunne ikke skrive " << p << "\n"; std::exit(1); }
}

int main(int argc, char** argv) {
  const std::string ut = argc > 1 ? argv[1] : "build/skjermer";
  mkdir(ut.c_str(), 0755);
  struct S { const char* navn; const char* sted; double lat, lon; ms_t naa; };
  const S sc[] = {
      {"oslo", "Oslo", 59.9139, 10.7522, 1792503660000LL},                                  // tir 20.10.2026 15:41
      {"tromso-morketid", "Tromsø", 69.6492, 18.9553, days_from_civil(2026, 12, 10) * DOGN + 11 * TIME + 20 * MIN},
      {"tromso-midnattssol", "Tromsø", 69.6492, 18.9553, days_from_civil(2026, 6, 24) * DOGN + 21 * TIME + 50 * MIN},
  };
  for (const auto& s : sc) {
    Enhet e;
    e.ctx.sted.navn = s.sted;
    e.ctx.sted.lat = s.lat;
    e.ctx.sted.lon = s.lon;
    e.fang = [&](Gra& g) { g = utsikt(e.ctx.naa, s.lat, s.lon); return true; };
    for (int h = 7 * 24; h >= 0; --h) e.tick(s.naa - h * TIME);
    e.tick(s.naa);
    for (int side = 0; side < 3; ++side) {
      Skjerm sk;
      Ctx c = e.ctx;
      c.naa = s.naa;
      c.side = static_cast<Side>(side);
      tegn(e.arkiv, c, sk);
      skriv(ut + "/" + s.navn + "-" + std::to_string(side + 1) + ".pbm", sk);
    }
    std::cerr << s.navn << ": " << e.arkiv.alle().size() << " prøver · " << lys_linje(e.ctx.sted, s.naa) << "\n";
  }
  return 0;
}
