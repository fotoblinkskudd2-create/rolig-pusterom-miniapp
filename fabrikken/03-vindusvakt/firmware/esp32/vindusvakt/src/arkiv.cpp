#include "arkiv.h"

#include <algorithm>
#include <cmath>
#include <cstring>

namespace vindusvakt {

uint8_t middel(const Gra& g) {
  if (g.px.empty()) return 0;
  uint64_t s = 0;
  for (uint8_t v : g.px) s += v;
  return static_cast<uint8_t>(s / g.px.size());
}

Prove lag_prove(const Gra& g, ms_t ts) {
  Prove p;
  p.ts = ts;
  p.lys = middel(g);
  const auto bits = fremkall(g, TW, TH, p.lys >= 40);
  std::memcpy(p.bits.data(), bits.data(), std::min<size_t>(bits.size(), TB));
  return p;
}

std::vector<uint8_t> lag_stor(const Gra& g) { return fremkall(g, SW, SH, middel(g) >= 40); }

void Arkiv::legg(const Prove& p) {
  auto it = std::upper_bound(prover_.begin(), prover_.end(), p.ts, [](ms_t t, const Prove& q) { return t < q.ts; });
  prover_.insert(it, p);
  const ms_t grense = prover_.back().ts - DOGN_I_ARKIV * DOGN;
  prover_.erase(prover_.begin(), std::find_if(prover_.begin(), prover_.end(), [grense](const Prove& q) { return q.ts >= grense; }));
}

const Prove* Arkiv::naermest(ms_t t, ms_t tol) const {
  const Prove* best = nullptr;
  ms_t avstand = tol + 1;
  for (const auto& p : prover_) {
    const ms_t a = p.ts > t ? p.ts - t : t - p.ts;
    if (a < avstand) { avstand = a; best = &p; }
  }
  return best;
}

namespace {
void legg64(std::string& o, int64_t v) { for (int i = 0; i < 8; ++i) o += static_cast<char>((static_cast<uint64_t>(v) >> (8 * i)) & 0xFF); }
int64_t les64(const std::string& s, size_t i) {
  uint64_t v = 0;
  for (int k = 7; k >= 0; --k) v = (v << 8) | static_cast<uint8_t>(s[i + k]);
  return static_cast<int64_t>(v);
}
}  // namespace

// "VVA1" | n u16 | n × (ts i64, lys u8, bits TB) | stor_ts i64 | har_stor u8 | [stor SB]
std::string Arkiv::serialiser() const {
  std::string o = "VVA1";
  const uint16_t n = static_cast<uint16_t>(prover_.size());
  o += static_cast<char>(n & 0xFF);
  o += static_cast<char>(n >> 8);
  for (const auto& p : prover_) {
    legg64(o, p.ts);
    o += static_cast<char>(p.lys);
    o.append(reinterpret_cast<const char*>(p.bits.data()), TB);
  }
  legg64(o, stor_ts);
  const bool har = stor.size() == static_cast<size_t>(SB);
  o += static_cast<char>(har ? 1 : 0);
  if (har) o.append(reinterpret_cast<const char*>(stor.data()), SB);
  return o;
}

bool Arkiv::les(const std::string& d) {
  if (d.size() < 6 || d.compare(0, 4, "VVA1") != 0) return false;
  const size_t n = static_cast<uint8_t>(d[4]) | (static_cast<size_t>(static_cast<uint8_t>(d[5])) << 8);
  const size_t trenger = 6 + n * (9 + TB) + 9;
  if (d.size() < trenger) return false;
  std::vector<Prove> v;
  size_t i = 6;
  for (size_t k = 0; k < n; ++k) {
    Prove p;
    p.ts = les64(d, i);
    p.lys = static_cast<uint8_t>(d[i + 8]);
    std::memcpy(p.bits.data(), d.data() + i + 9, TB);
    i += 9 + TB;
    if (!v.empty() && p.ts < v.back().ts) return false;
    v.push_back(p);
  }
  const ms_t st = les64(d, i);
  const bool har = d[i + 8] == 1;
  i += 9;
  if (har && d.size() < i + SB) return false;
  prover_ = std::move(v);
  stor_ts = st;
  stor.clear();
  if (har) stor.assign(d.begin() + static_cast<long>(i), d.begin() + static_cast<long>(i + SB));
  return true;
}

std::string sted_json(const Sted& s) {
  char b[96];
  std::snprintf(b, sizeof b, "\"lat\":%.4f,\"lon\":%.4f", s.lat, s.lon);
  return "{\"navn\":" + json::quote(s.navn) + "," + b + "}";
}

// lat/lon som tall i millionedeler (json.h har bare heltall): {"navn":"Tromsø","lat_u":69649200,"lon_u":18955300}
bool sted_fra_json(const std::string& j, Sted& s, std::string& feil) {
  json::Obj o;
  if (!json::parse(j, o)) { feil = "ugyldig JSON"; return false; }
  const int64_t la = json::get_n(o, "lat_u", INT64_MIN), lo = json::get_n(o, "lon_u", INT64_MIN);
  if (la == INT64_MIN || lo == INT64_MIN) { feil = "mangler lat_u/lon_u"; return false; }
  if (la < -90000000 || la > 90000000 || lo < -180000000 || lo > 180000000) { feil = "utenfor jorda"; return false; }
  std::string navn = json::get_s(o, "navn");
  while (navn.size() > 40) {  // kutt på tegngrense, ikke midt i æ/ø/å
    navn.pop_back();
    while (!navn.empty() && (static_cast<unsigned char>(navn.back()) & 0xC0) == 0x80) navn.pop_back();
    if (!navn.empty() && static_cast<unsigned char>(navn.back()) >= 0xC0) navn.pop_back();
  }
  if (navn.empty()) { feil = "mangler navn"; return false; }
  s.navn = navn;
  s.lat = static_cast<double>(la) / 1e6;
  s.lon = static_cast<double>(lo) / 1e6;
  return true;
}

}  // namespace vindusvakt
