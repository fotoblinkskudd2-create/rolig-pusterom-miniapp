// render: demo-scenario → alle bakskjermer som PBM, med ekte kryptering og dithering.
//   render <eksempelmappe> <utmappe>
#include <dirent.h>
#include <sys/stat.h>

#include <algorithm>
#include <cstdio>
#include <iostream>

#include "../core/api.h"
#include "bilder.h"

using namespace morkerom;

int main(int argc, char** argv) {
  if (argc < 3) { std::cerr << "bruk: render <eksempler> <ut>\n"; return 2; }
  const std::string ut = argv[2];
  mkdir(ut.c_str(), 0755);
  Kort kort;
  kort.dir = ut;
  if (DIR* d = opendir(argv[1])) {
    while (dirent* e = readdir(d)) {
      const std::string n = e->d_name;
      if (n.size() > 4 && n.substr(n.size() - 4) == ".jpg") kort.eksempler.push_back(std::string(argv[1]) + "/" + n);
    }
    closedir(d);
  }
  std::sort(kort.eksempler.begin(), kort.eksempler.end());
  kort.start();

  const ms_t T0 = 1792330860000LL;  // søn 18.10.2026 15:41 Oslo
  Enhet e;
  e.ta_bilde = [&](uint32_t id) { return kort.ta(id); };
  e.bits_for = [&](uint32_t id) { return kort.bits(id); };
  e.ctx.ap_navn = "Morkerom-2B9C";
  e.ctx.ap_pass = "stille-kopp-48";
  e.ctx.nokkel = "demonokkel";
  e.deksel(true, T0);
  // Seks bilder for to døgn siden, sju i dag
  for (int i = 0; i < 6; ++i) e.utloser(T0 + i * 47 * MIN);
  const ms_t NAA = T0 + 48 * TIME + 6 * 47 * MIN;
  for (int i = 0; i < 7; ++i) e.utloser(NAA - 9 * TIME + i * 61 * MIN);

  auto skriv = [&](const char* navn, Ctx c) {
    Skjerm s;
    tegn(e.rull, c, s);
    skriv_fil(ut + "/" + navn + ".pbm", "P4\n200 200\n" + std::string(reinterpret_cast<const char*>(s.buf), Skjerm::BYTES));
  };
  Ctx c = e.ctx;
  c.naa = NAA;
  c.vis = Visning::Status; skriv("1-status", c);
  c.vis = Visning::Tatt; c.bilde_id = 13; skriv("2-tatt", c);
  c.vis = Visning::Nye; c.nye = 6; skriv("3-nye", c);
  const auto f = e.rull.fremkalte(NAA);
  for (size_t i = 0; i < f.size(); ++i) {
    c.vis = Visning::Fremkalt;
    c.bilde_id = f[i]->id;
    c.indeks = static_cast<int>(i);
    c.av = static_cast<int>(f.size());
    c.bits = kort.bits(f[i]->id);
    skriv(("4-fremkalt-" + std::to_string(f[i]->id)).c_str(), c);
  }
  c.bits = nullptr;
  c.vis = Visning::Tvang; skriv("5-tvang", c);
  c.vis = Visning::Qr; skriv("6-qr", c);
  // Full rull
  Enhet full;
  full.deksel(true, NAA);
  for (int i = 0; i < 24; ++i) full.utloser(NAA - 20 * TIME + i * MIN);
  Ctx cf = full.ctx;
  cf.naa = NAA;
  cf.vis = Visning::Full;
  Skjerm s;
  tegn(full.rull, cf, s);
  skriv_fil(ut + "/7-full.pbm", "P4\n200 200\n" + std::string(reinterpret_cast<const char*>(s.buf), Skjerm::BYTES));
  // Kontaktark
  Api api(e);
  int w, h;
  const std::string ark = api.kontaktark(NAA, w, h);
  skriv_fil(ut + "/8-kontaktark.pbm", "P4\n" + std::to_string(w) + " " + std::to_string(h) + "\n" + ark);
  std::cerr << "fremkalte: " << f.size() << ", i mørket: " << e.rull.i_morket(NAA) << "\n";
  return 0;
}
