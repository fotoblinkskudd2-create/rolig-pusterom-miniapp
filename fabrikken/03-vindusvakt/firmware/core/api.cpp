#include "api.h"

#include <cstdlib>

namespace vindusvakt {

namespace {

Svar feil(int kode, const std::string& t) {
  Svar s;
  s.kode = kode;
  s.kropp = "{\"ok\":false,\"feil\":" + json::quote(t) + "}";
  return s;
}

bool lik(const std::string& a, const std::string& b) {
  if (a.size() != b.size()) return false;
  unsigned char d = 0;
  for (size_t i = 0; i < a.size(); ++i) d |= static_cast<unsigned char>(a[i] ^ b[i]);
  return d == 0;
}

std::string pbm(const uint8_t* bits, int w, int h) {
  return "P4\n" + std::to_string(w) + " " + std::to_string(h) + "\n" + std::string(reinterpret_cast<const char*>(bits), static_cast<size_t>(w) * h / 8);
}

const char* type_navn(SolType t) { return t == SolType::Morketid ? "morketid" : t == SolType::Midnattssol ? "midnattssol" : "normal"; }

}  // namespace

std::string Api::param(const std::string& sti, const std::string& navn) {
  const size_t q = sti.find('?');
  if (q == std::string::npos) return "";
  size_t i = q + 1;
  while (i < sti.size()) {
    size_t amp = sti.find('&', i);
    if (amp == std::string::npos) amp = sti.size();
    const std::string par = sti.substr(i, amp - i);
    const size_t eq = par.find('=');
    if (par.substr(0, eq) == navn) return eq == std::string::npos ? "" : par.substr(eq + 1);
    i = amp + 1;
  }
  return "";
}

std::string Api::state_json(ms_t naa) const {
  const Sted& st = e_.ctx.sted;
  const int64_t dag = lokal(naa).dag;
  const SolDag sd = sol_dag(dag, st.lat, st.lon);
  std::string o = "{\"naa\":" + std::to_string(naa) + ",\"sted\":" + sted_json(st) + ",\"lys\":" + json::quote(lys_linje(st, naa));
  o += ",\"sol\":{\"type\":\"" + std::string(type_navn(sd.type)) + "\",\"opp\":" + std::to_string(sd.opp) + ",\"ned\":" + std::to_string(sd.ned) +
       ",\"lengde_min\":" + std::to_string(sd.lengde_min) + ",\"middag\":" + std::to_string(sd.middag) +
       ",\"bla_fra\":" + std::to_string(sd.har_bla ? sd.bla_fra : 0) + ",\"bla_til\":" + std::to_string(sd.har_bla ? sd.bla_til : 0) +
       ",\"dager_til_sol\":" + std::to_string(sd.type == SolType::Morketid ? dager_til_sol(dag, st.lat, st.lon) : 0) + "}";
  o += ",\"side\":" + std::to_string(static_cast<int>(e_.ctx.side)) + ",\"privat\":" + (e_.ctx.privat ? "true" : "false");
  o += ",\"prover\":[";
  bool forste = true;
  for (const auto& p : e_.arkiv.alle()) {
    o += (forste ? "" : ",") + std::string("{\"ts\":") + std::to_string(p.ts) + ",\"lys\":" + std::to_string(p.lys) + "}";
    forste = false;
  }
  return o + "]}";
}

Svar Api::handle(const std::string& metode, const std::string& full, const std::string& kropp, const std::string& nh, ms_t naa) {
  const std::string sti = full.substr(0, full.find('?'));
  if (metode == "GET" && (sti == "/" || sti == "/index.html")) {
    Svar s;
    s.type = "text/html; charset=utf-8";
    s.kropp = index_html ? index_html() : "<!doctype html><p>Vindusvakt</p>";
    return s;
  }
  if (sti.rfind("/api/", 0) != 0) return feil(404, "finnes ikke");
  if (!nokkel.empty() && !lik(nh.empty() ? param(full, "k") : nh, nokkel))
    return feil(401, "trenger nøkkel: hold knappen i 3 sekunder og skann koden");

  if (metode == "GET" && sti == "/api/state") {
    const std::string t = param(full, "now");
    if (!t.empty() && sett_klokke) {
      const ms_t tlf = std::atoll(t.c_str());
      if (tlf > 1600000000000LL && (tlf - naa > 30 * SEK || naa - tlf > 30 * SEK) && sett_klokke(tlf)) naa = tlf;
    }
    Svar s;
    s.kropp = state_json(naa);
    return s;
  }
  if (metode == "GET" && sti == "/api/skjerm.pbm") {
    Skjerm sk;
    e_.ctx.naa = naa;
    tegn(e_.arkiv, e_.ctx, sk);
    Svar s;
    s.type = "image/x-portable-bitmap";
    s.kropp = pbm(sk.buf, Skjerm::W, Skjerm::H);
    return s;
  }
  if (metode == "GET" && sti == "/api/stor.pbm") {
    if (e_.arkiv.stor.size() != static_cast<size_t>(SB)) return feil(404, "ingen bilder ennå");
    Svar s;
    s.type = "image/x-portable-bitmap";
    s.kropp = pbm(e_.arkiv.stor.data(), SW, SH);
    return s;
  }
  const std::string pre = "/api/prove/";
  if (metode == "GET" && sti.rfind(pre, 0) == 0 && sti.size() > pre.size() + 4 && sti.compare(sti.size() - 4, 4, ".pbm") == 0) {
    const std::string tall = sti.substr(pre.size(), sti.size() - pre.size() - 4);
    if (tall.empty() || tall.size() > 15 || tall.find_first_not_of("0123456789") != std::string::npos) return feil(404, "finnes ikke");
    const ms_t ts = std::atoll(tall.c_str());
    for (const auto& p : e_.arkiv.alle())
      if (p.ts == ts) {
        Svar s;
        s.type = "image/x-portable-bitmap";
        s.kropp = pbm(p.bits.data(), TW, TH);
        return s;
      }
    return feil(404, "finnes ikke");
  }
  if (metode == "GET") return feil(404, "finnes ikke");
  if (metode != "POST") return feil(405, "bruk GET eller POST");
  if (sti == "/api/sted") {
    Sted st;
    std::string f;
    if (!sted_fra_json(kropp, st, f)) return feil(400, f);
    e_.ctx.sted = st;
    e_.skitten = true;
    if (lagre_sted) lagre_sted(st);
    Svar s;
    s.kropp = "{\"ok\":true}";
    return s;
  }
  if (sti == "/api/knapp" && simulator) {
    json::Obj b;
    if (!json::parse(kropp, b)) return feil(400, "ugyldig JSON");
    const std::string k = json::get_s(b, "k");
    if (k == "neste") e_.knapp(naa);
    else if (k == "lukk") e_.privat(true, naa);
    else if (k == "aapne") e_.privat(false, naa);
    else return feil(400, "ukjent knapp");
    Svar s;
    s.kropp = "{\"ok\":true}";
    return s;
  }
  return feil(404, "finnes ikke");
}

}  // namespace vindusvakt
