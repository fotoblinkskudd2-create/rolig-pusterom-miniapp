// devserver: Vindusvakt-kjernen som lokal HTTP-server med simulert utsikt.
//   devserver [--port 8072] [--data build/data] [--klokke ms] [--nokkel abc] [--web web]
// Simulator: GET /sim, POST /sim/hopp {"ms":...} — går time for time, så ukearkivet fylles som på ekte.
#include <sys/stat.h>

#include <chrono>
#include <fstream>
#include <iostream>
#include <sstream>

#include "../core/api.h"
#include "devhttp.h"
#include "scene.h"

using namespace vindusvakt;

static ms_t vegg() {
  return std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
}
static std::string les(const std::string& p) {
  std::ifstream f(p, std::ios::binary);
  std::stringstream ss;
  ss << f.rdbuf();
  return ss.str();
}
static void skriv(const std::string& p, const std::string& d) {
  std::ofstream f(p, std::ios::binary | std::ios::trunc);
  f << d;
}

int main(int argc, char** argv) {
  int port = 8072;
  std::string data = "build/data", web = "web", nokkel;
  ms_t forskyv = 0;
  bool laast = false;
  for (int i = 1; i + 1 < argc; i += 2) {
    const std::string a = argv[i], v = argv[i + 1];
    if (a == "--port") port = std::atoi(v.c_str());
    else if (a == "--data") data = v;
    else if (a == "--klokke") { forskyv = std::atoll(v.c_str()) - vegg(); laast = true; }
    else if (a == "--nokkel") nokkel = v;
    else if (a == "--web") web = v;
  }
  auto naa = [&]() { return vegg() + forskyv; };
  mkdir(data.c_str(), 0755);

  Enhet e;
  if (e.arkiv.les(les(data + "/arkiv.bin"))) std::cerr << "arkiv: " << e.arkiv.alle().size() << " prøver\n";
  {
    std::string f;
    Sted st;
    if (sted_fra_json(les(data + "/sted.json"), st, f)) e.ctx.sted = st;
  }
  e.fang = [&](Gra& g) { g = utsikt(e.ctx.naa, e.ctx.sted.lat, e.ctx.sted.lon); return true; };
  e.lagre = [&]() { skriv(data + "/arkiv.bin", e.arkiv.serialiser()); };

  Api api(e);
  api.nokkel = nokkel;
  api.simulator = true;
  api.index_html = [&]() { return les(web + "/index.html"); };
  api.sett_klokke = [&](ms_t t) {
    if (laast) return false;
    forskyv = t - vegg();
    return true;
  };
  api.lagre_sted = [&](const Sted& s) {
    char b[160];
    std::snprintf(b, sizeof b, "{\"navn\":%s,\"lat_u\":%lld,\"lon_u\":%lld}", json::quote(s.navn).c_str(),
                  static_cast<long long>(s.lat * 1e6 + (s.lat >= 0 ? 0.5 : -0.5)), static_cast<long long>(s.lon * 1e6 + (s.lon >= 0 ? 0.5 : -0.5)));
    skriv(data + "/sted.json", b);
  };

  std::cerr << "vindusvakt devserver på http://localhost:" << port << "  (sim: /sim)\n";
  return felles::http_serve(port, [&](const felles::HttpForesporsel& f) {
    felles::HttpSvar ut;
    const std::string bar = f.sti.substr(0, f.sti.find('?'));
    if (f.metode == "GET" && bar == "/sim") {
      ut.type = "text/html; charset=utf-8";
      ut.kropp = les(web + "/sim.html");
      return ut;
    }
    if (f.metode == "POST" && bar == "/sim/hopp") {
      json::Obj b;
      json::parse(f.kropp, b);
      const ms_t ms = json::get_n(b, "ms");
      for (ms_t steg = 0; steg < ms; steg += TIME) {  // time for time
        forskyv += std::min<ms_t>(TIME, ms - steg);
        e.tick(naa());
      }
      laast = true;
      ut.kropp = "{\"ok\":true,\"naa\":" + std::to_string(naa()) + "}";
      return ut;
    }
    e.tick(naa());
    const Svar s = api.handle(f.metode, f.sti, f.kropp, f.hode("X-Vindusvakt-Nokkel"), naa());
    ut.kode = s.kode;
    ut.type = s.type;
    ut.kropp = s.kropp;
    return ut;
  });
}
