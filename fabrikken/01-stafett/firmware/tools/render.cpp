// render: hendelseslogg (JSON Lines) → skjermbilde (PBM), med nøyaktig samme kode som enheten.
//   render <logg.jsonl> <naa_ms> <side 0-3|velkommen|qr|reset> <ut.pbm> [borte_ms]
#include <cstdio>
#include <cstdlib>
#include <fstream>
#include <iostream>
#include <string>

#include "../core/view.h"

using namespace stafett;

int main(int argc, char** argv) {
  if (argc < 5) {
    std::cerr << "bruk: render <logg.jsonl> <naa_ms> <side> <ut.pbm> [borte_ms]\n";
    return 2;
  }
  State s;
  std::ifstream in(argv[1]);
  std::string linje;
  int ok = 0, feil = 0;
  while (std::getline(in, linje)) {
    if (linje.empty()) continue;
    (s.spill_av(linje) ? ok : feil)++;
  }
  Ctx c;
  c.naa = std::atoll(argv[2]);
  const std::string side = argv[3];
  if (side == "velkommen") c.overlay = Overlay::Velkommen;
  else if (side == "qr") c.overlay = Overlay::Qr;
  else if (side == "reset") c.overlay = Overlay::Reset;
  else c.side = static_cast<Side>(std::atoi(side.c_str()) % static_cast<int>(Side::ANTALL));
  if (argc > 5) c.borte_ms = std::atoll(argv[5]);
  c.ap_navn = "Stafett-7F3A";
  c.ap_pass = "rolig-fjord-48";
  Fb fb;
  tegn(s, c, fb);
  std::ofstream out(argv[4], std::ios::binary);
  out << fb.pbm();
  std::cerr << "spilt av " << ok << " hendelser, " << feil << " ødelagte\n";
  return 0;
}
