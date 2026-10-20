#include "api.h"

#include <cstdlib>

namespace stafett {

namespace {

Svar ok_json(const Resultat& r) {
  Svar s;
  if (r.ok) {
    s.kropp = "{\"ok\":true,\"id\":" + std::to_string(r.id) + "}";
  } else {
    s.kode = 400;
    s.kropp = "{\"ok\":false,\"feil\":" + json::quote(r.feil) + "}";
  }
  return s;
}

Svar feil(int kode, const std::string& t) {
  Svar s;
  s.kode = kode;
  s.kropp = "{\"ok\":false,\"feil\":" + json::quote(t) + "}";
  return s;
}

// Konstant-tid sammenligning, så nøkkelen ikke kan gjettes tegn for tegn.
bool lik(const std::string& a, const std::string& b) {
  if (a.size() != b.size()) return false;
  unsigned char d = 0;
  for (size_t i = 0; i < a.size(); ++i) d |= static_cast<unsigned char>(a[i] ^ b[i]);
  return d == 0;
}

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

Svar Api::handle(const std::string& metode, const std::string& full_sti, const std::string& kropp,
                 const std::string& nokkel_header, ms_t naa) {
  const std::string sti = full_sti.substr(0, full_sti.find('?'));

  if (metode == "GET" && (sti == "/" || sti == "/index.html" || sti == "/kjol")) {
    Svar s;
    s.type = "text/html; charset=utf-8";
    s.kropp = index_html ? index_html() : "<!doctype html><p>Stafett</p>";
    return s;
  }

  const bool beskyttet = sti.rfind("/api/", 0) == 0 || sti == "/skjerm.pbm";
  if (!beskyttet) return feil(404, "finnes ikke");
  if (!nokkel.empty()) {
    const std::string gitt = nokkel_header.empty() ? param(full_sti, "k") : nokkel_header;
    if (!lik(gitt, nokkel)) return feil(401, "trenger nøkkel: hold hjulet i 3 sekunder og skann koden");
  }

  json::Obj b;
  if (metode == "POST" && !json::parse(kropp.empty() ? "{}" : kropp, b)) return feil(400, "ugyldig JSON");
  State& s = e_.s;
  auto endret = [&](const Resultat& r) {
    if (r.ok) e_.endret(naa);
    return ok_json(r);
  };

  if (metode == "GET" && sti == "/api/state") {
    const std::string t = param(full_sti, "now");
    if (!t.empty() && sett_klokke) {
      const ms_t telefon = std::atoll(t.c_str());
      if (telefon > 1600000000000LL && (telefon - naa > 30 * SEK || naa - telefon > 30 * SEK) && sett_klokke(telefon)) {
        naa = telefon;
        e_.endret(naa);
      }
    }
    Svar r;
    std::string j = s.til_json(naa);
    j.pop_back();
    j += ",\"side\":" + std::to_string(static_cast<int>(e_.ctx.side)) + ",\"overlay\":" +
         std::to_string(static_cast<int>(e_.ctx.overlay)) + "}";
    r.kropp = j;
    return r;
  }
  if (metode == "GET" && sti == "/api/eksport.txt") {
    Svar r;
    r.type = "text/plain; charset=utf-8";
    r.kropp = s.eksport_tekst(naa);
    return r;
  }
  if (metode == "GET" && sti == "/skjerm.pbm") {
    Fb fb;
    e_.ctx.naa = naa;
    tegn(s, e_.ctx, fb);
    Svar r;
    r.type = "image/x-portable-bitmap";
    r.kropp = fb.pbm();
    return r;
  }
  if (metode != "POST") return feil(405, "bruk POST");

  const auto id = static_cast<uint32_t>(json::get_n(b, "id"));
  if (sti == "/api/handoff")
    return endret(s.overlevering(naa, json::get_s(b, "del"), json::get_s(b, "tekst"), static_cast<uint32_t>(json::get_n(b, "svar"))));
  if (sti == "/api/kjol")
    return endret(s.kjol_legg_inn(naa, json::get_s(b, "del"), json::get_s(b, "ting"), json::get_n(b, "ore"), json::get_s(b, "butikk")));
  if (sti == "/api/kjol/avgjor") return endret(s.kjol_avgjor(naa, id, json::get_s(b, "valg")));
  if (sti == "/api/forfall")
    return endret(s.forfall_legg_inn(naa, json::get_s(b, "navn"), json::get_n(b, "ore"),
                                     static_cast<int32_t>(json::get_n(b, "dato")), json::get_b(b, "mnd")));
  if (sti == "/api/forfall/betalt") return endret(s.forfall_betalt(naa, id, static_cast<int32_t>(json::get_n(b, "dato"))));
  if (sti == "/api/forfall/avslutt") return endret(s.forfall_avslutt(naa, id));
  if (sti == "/api/her") return endret(s.her(naa, json::get_s(b, "del")));
  if (sti == "/api/hjul" && simulator) {
    const std::string h = json::get_s(b, "h");
    if (h == "trykk") e_.trykk(naa);
    else if (h == "vri+") e_.vri(1, naa);
    else if (h == "vri-") e_.vri(-1, naa);
    else if (h == "hold3") e_.hold(HOLD_QR, naa);
    else if (h == "hold10") e_.hold(HOLD_RESET, naa);
    else return feil(400, "ukjent handling");
    Resultat r;
    return ok_json(r);
  }
  return feil(404, "finnes ikke");
}

}  // namespace stafett
