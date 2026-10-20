// devserver: Mørkerom-kjernen som lokal HTTP-server med simulert kamera (eksempelbilder) og ekte kryptering.
//   devserver [--port 8064] [--sd build/sd] [--klokke ms] [--nokkel abc] [--web web] [--eksempler tools/eksempler]
// Simulator: GET /sim, POST /sim/hopp {"ms":...}
#include <dirent.h>
#include <sys/stat.h>

#include <algorithm>
#include <chrono>
#include <iostream>

#include "../core/api.h"
#include "bilder.h"
#include "devhttp.h"

using namespace morkerom;

static ms_t vegg() {
  return std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
}

int main(int argc, char** argv) {
  int port = 8064;
  std::string sd = "build/sd", web = "web", nokkel, eks = "tools/eksempler";
  ms_t forskyv = 0;
  bool laast = false;
  for (int i = 1; i + 1 < argc; i += 2) {
    const std::string a = argv[i], v = argv[i + 1];
    if (a == "--port") port = std::atoi(v.c_str());
    else if (a == "--sd") sd = v;
    else if (a == "--klokke") { forskyv = std::atoll(v.c_str()) - vegg(); laast = true; }
    else if (a == "--nokkel") nokkel = v;
    else if (a == "--web") web = v;
    else if (a == "--eksempler") eks = v;
  }
  auto naa = [&]() { return vegg() + forskyv; };
  mkdir(sd.c_str(), 0755);

  Kort kort;
  kort.dir = sd;
  if (DIR* d = opendir(eks.c_str())) {
    while (dirent* e = readdir(d)) {
      const std::string n = e->d_name;
      if (n.size() > 4 && n.substr(n.size() - 4) == ".jpg") kort.eksempler.push_back(eks + "/" + n);
    }
    closedir(d);
  }
  std::sort(kort.eksempler.begin(), kort.eksempler.end());
  kort.start();

  Enhet e;
  const std::string logg = sd + "/logg.jsonl";
  {
    std::ifstream in(logg);
    std::string l;
    int n = 0;
    while (std::getline(in, l)) if (!l.empty() && e.rull.spill_av(l)) ++n;
    std::cerr << "spilte av " << n << " hendelser fra " << logg << "\n";
  }
  e.rull.skriv = [&logg](const std::string& l) {
    std::ofstream out(logg, std::ios::app);
    out << l << "\n";
    return static_cast<bool>(out);
  };
  e.ta_bilde = [&](uint32_t id) { return kort.ta(id); };
  e.bits_for = [&](uint32_t id) { return kort.bits(id); };
  e.ctx.ap_navn = "Morkerom-DEV";
  e.ctx.ap_pass = "stille-kopp-48";
  e.ctx.nokkel = nokkel;
  e.ctx.url = "localhost:" + std::to_string(port);

  Api api(e);
  api.nokkel = nokkel;
  api.simulator = true;
  api.index_html = [&web]() { return les_fil(web + "/index.html"); };
  api.sett_klokke = [&](ms_t t) {
    if (laast) return false;
    forskyv = t - vegg();
    return true;
  };
  api.les_original = [&](uint32_t id, std::string& j) { return kort.original(id, j); };

  std::cerr << "mørkerom devserver på http://localhost:" << port << "  (sim: /sim)\n";
  return felles::http_serve(port, [&](const felles::HttpForesporsel& f) {
    felles::HttpSvar ut;
    const std::string bar = f.sti.substr(0, f.sti.find('?'));
    if (f.metode == "GET" && bar == "/sim") {
      ut.type = "text/html; charset=utf-8";
      ut.kropp = les_fil(web + "/sim.html");
      return ut;
    }
    if (f.metode == "POST" && bar == "/sim/hopp") {
      json::Obj b;
      json::parse(f.kropp, b);
      forskyv += json::get_n(b, "ms");
      laast = true;
      e.tick(naa());
      ut.kropp = "{\"ok\":true,\"naa\":" + std::to_string(naa()) + "}";
      return ut;
    }
    e.tick(naa());
    const Svar s = api.handle(f.metode, f.sti, f.kropp, f.hode("X-Morkerom-Nokkel"), naa());
    ut.kode = s.kode;
    ut.type = s.type;
    ut.kropp = s.kropp;
    // Simulatoren vil se bakskjermen
    return ut;
  });
}
