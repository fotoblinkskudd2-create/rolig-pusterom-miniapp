#include "api.h"

#include <cstdlib>

namespace morkerom {

namespace {

Svar json_svar(const Resultat& r) {
  Svar s;
  if (r.ok) s.kropp = "{\"ok\":true,\"id\":" + std::to_string(r.id) + "}";
  else { s.kode = 400; s.kropp = "{\"ok\":false,\"feil\":" + json::quote(r.feil) + "}"; }
  return s;
}

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

// "/api/bilde/12.jpg" → 12, ".jpg"
bool bilde_sti(const std::string& sti, uint32_t& id, std::string& ext) {
  const std::string pre = "/api/bilde/";
  if (sti.rfind(pre, 0) != 0) return false;
  const std::string rest = sti.substr(pre.size());
  const size_t dot = rest.find('.');
  if (dot == std::string::npos || dot == 0 || dot > 9) return false;
  for (size_t i = 0; i < dot; ++i) if (rest[i] < '0' || rest[i] > '9') return false;
  id = static_cast<uint32_t>(std::strtoul(rest.substr(0, dot).c_str(), nullptr, 10));
  ext = rest.substr(dot);
  return true;
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

std::string Api::pbm(const std::vector<uint8_t>& bits, int w, int h) {
  std::string o = "P4\n" + std::to_string(w) + " " + std::to_string(h) + "\n";
  o.append(reinterpret_cast<const char*>(bits.data()), bits.size());
  return o;
}

std::string Api::kontaktark(ms_t naa, int& w, int& h) const {
  const auto f = e_.rull.fremkalte(naa);
  const int kol = 4, tw = BILDE_W / 2, th = BILDE_H / 2, gap = 4;
  const int rader = f.empty() ? 1 : (static_cast<int>(f.size()) + kol - 1) / kol;
  w = kol * tw + (kol + 1) * gap;
  w = (w + 7) / 8 * 8;
  h = rader * th + (rader + 1) * gap;
  std::vector<uint8_t> ut(static_cast<size_t>(w) * h / 8, 0x00);  // hvitt ark; hvert bilde får sort ramme
  auto sett = [&](int x, int y, bool sort) {
    const size_t i = (static_cast<size_t>(y) * w + x) >> 3;
    const uint8_t m = 0x80 >> (x & 7);
    if (sort) ut[i] |= m; else ut[i] &= ~m;
  };
  for (size_t n = 0; n < f.size(); ++n) {
    const auto* bits = e_.bits_for ? e_.bits_for(f[n]->id) : nullptr;
    const int ox = gap + static_cast<int>(n % kol) * (tw + gap), oy = gap + static_cast<int>(n / kol) * (th + gap);
    for (int y = 0; y < th; ++y)
      for (int x = 0; x < tw; ++x) {
        bool sort = false;
        if (bits) {  // 2×2-blokk: sort hvis minst to av fire er sorte
          int c = 0;
          for (int dy = 0; dy < 2; ++dy)
            for (int dx = 0; dx < 2; ++dx) {
              const int sx = x * 2 + dx, sy = y * 2 + dy;
              c += ((*bits)[(static_cast<size_t>(sy) * BILDE_W + sx) >> 3] & (0x80 >> (sx & 7))) ? 1 : 0;
            }
          sort = c >= 2;
        }
        sett(ox + x, oy + y, sort);
      }
    for (int x = -1; x <= tw; ++x) { sett(ox + x, oy - 1, true); sett(ox + x, oy + th, true); }
    for (int y = -1; y <= th; ++y) { sett(ox - 1, oy + y, true); sett(ox + tw, oy + y, true); }
  }
  return std::string(reinterpret_cast<const char*>(ut.data()), ut.size());
}

Svar Api::handle(const std::string& metode, const std::string& full, const std::string& kropp,
                 const std::string& nh, ms_t naa) {
  const std::string sti = full.substr(0, full.find('?'));
  if (metode == "GET" && (sti == "/" || sti == "/index.html")) {
    Svar s;
    s.type = "text/html; charset=utf-8";
    s.kropp = index_html ? index_html() : "<!doctype html><p>Mørkerom</p>";
    return s;
  }
  if (sti.rfind("/api/", 0) != 0) return feil(404, "finnes ikke");
  if (!nokkel.empty() && !lik(nh.empty() ? param(full, "k") : nh, nokkel))
    return feil(401, "trenger nøkkel: hold bla-knappen i 3 sekunder og skann koden");

  Rull& r = e_.rull;
  if (metode == "GET" && sti == "/api/state") {
    const std::string t = param(full, "now");
    if (!t.empty() && sett_klokke) {
      const ms_t tlf = std::atoll(t.c_str());
      if (tlf > 1600000000000LL && (tlf - naa > 30 * SEK || naa - tlf > 30 * SEK) && sett_klokke(tlf)) {
        naa = tlf;
        e_.endret(naa);
      }
    }
    Svar s;
    s.kropp = r.til_json(naa);
    s.kropp.pop_back();
    s.kropp += ",\"vis\":" + std::to_string(static_cast<int>(e_.ctx.vis)) + "}";
    return s;
  }
  uint32_t id;
  std::string ext;
  if (metode == "GET" && bilde_sti(sti, id, ext)) {
    const Bilde* b = r.finn(id);
    if (!b || b->kastet) return feil(404, "finnes ikke");
    if (!b->fremkalt(naa)) return feil(403, "fortsatt i mørket");
    Svar s;
    if (ext == ".jpg") {
      if (!les_original || !les_original(id, s.kropp)) return feil(500, "kunne ikke lese bildet");
      s.type = "image/jpeg";
      return s;
    }
    if (ext == ".pbm") {
      const auto* bits = e_.bits_for ? e_.bits_for(id) : nullptr;
      if (!bits) return feil(500, "kunne ikke fremkalle");
      s.type = "image/x-portable-bitmap";
      s.kropp = pbm(*bits, BILDE_W, BILDE_H);
      return s;
    }
    return feil(404, "finnes ikke");
  }
  if (metode == "GET" && sti == "/api/skjerm.pbm") {
    Skjerm sk;
    e_.ctx.naa = naa;
    tegn(r, e_.ctx, sk);
    Svar s;
    s.type = "image/x-portable-bitmap";
    s.kropp = "P4\n200 200\n" + std::string(reinterpret_cast<const char*>(sk.buf), Skjerm::BYTES);
    return s;
  }
  if (metode == "GET" && sti == "/api/kontaktark.pbm") {
    int w, h;
    const std::string bits = kontaktark(naa, w, h);
    Svar s;
    s.type = "image/x-portable-bitmap";
    s.kropp = "P4\n" + std::to_string(w) + " " + std::to_string(h) + "\n" + bits;
    return s;
  }
  if (metode == "GET") return feil(404, "finnes ikke");
  if (metode != "POST") return feil(405, "bruk GET eller POST");
  json::Obj b;
  if (!json::parse(kropp.empty() ? "{}" : kropp, b)) return feil(400, "ugyldig JSON");
  if (sti == "/api/fremkall-alt") {
    if (!json::get_b(b, "bekreft")) return feil(400, "må bekreftes");
    const int n = r.i_morket(naa);
    const Resultat res = r.fremkall_alt(naa);
    if (res.ok) { e_.ctx.nye = n; e_.endret(naa); }
    return json_svar(res);
  }
  if (sti == "/api/kast") {
    const Resultat res = r.kast(naa, static_cast<uint32_t>(json::get_n(b, "id")));
    if (res.ok) e_.endret(naa);
    return json_svar(res);
  }
  if (sti == "/api/knapp" && simulator) {
    const std::string k = json::get_s(b, "k");
    if (k == "utloser") e_.utloser(naa);
    else if (k == "bla") e_.bla(naa);
    else if (k == "hold3") e_.hold_bla(HOLD_QR, naa);
    else if (k == "hold10") e_.hold_bla(HOLD_TVANG, naa);
    else if (k == "aapne") e_.deksel(true, naa);
    else if (k == "lukk") e_.deksel(false, naa);
    else return feil(400, "ukjent knapp");
    return json_svar(Resultat{});
  }
  return feil(404, "finnes ikke");
}

}  // namespace morkerom
