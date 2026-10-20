// Enhetstester for Mørkerom-kjernen. make -C firmware test
#include <cstdio>
#include <cstring>
#include <random>
#include <set>
#include <string>
#include <vector>

#include "../core/api.h"
#include "../core/dither.h"
#include "../core/krypt.h"
#include "../core/oppdrag.h"

using namespace morkerom;

static int feil = 0, sjekker = 0;
#define SJEKK(x)                                                                    \
  do {                                                                              \
    ++sjekker;                                                                      \
    if (!(x)) { ++feil; std::printf("FEIL %s:%d  %s\n", __FILE__, __LINE__, #x); } \
  } while (0)
#define LIK(a, b)                                                                                     \
  do {                                                                                                \
    ++sjekker;                                                                                        \
    const auto _a = (a); const auto _b = (b);                                                         \
    if (!(_a == _b)) { ++feil; std::printf("FEIL %s:%d  %s == %s\n", __FILE__, __LINE__, #a, #b); } \
  } while (0)

constexpr ms_t T0 = 1792503660000LL;  // tir 20.10.2026 15:41 Oslo

static int sorte(const std::vector<uint8_t>& bits) {
  int n = 0;
  for (uint8_t b : bits) n += __builtin_popcount(b);
  return n;
}

static void test_oppdrag() {
  // Hvert oppdrag nøyaktig én gang i hver 64-dagersperiode
  for (int64_t start : {0LL, 64LL * 300, 64LL * 321}) {
    std::set<int> sett;
    for (int d = 0; d < 64; ++d) sett.insert(oppdrag_for_dag(start + d));
    LIK(sett.size(), static_cast<size_t>(64));
  }
  // Samme dag = samme oppdrag, morgen og kveld
  const int64_t idag = lokal(T0).dag;
  LIK(dagens_oppdrag(T0 - 15 * TIME), oppdrag_for_dag(idag));
  LIK(dagens_oppdrag(T0 + 8 * TIME), oppdrag_for_dag(idag));     // 23:41 samme dag
  SJEKK(dagens_oppdrag(T0 + 9 * TIME) == oppdrag_for_dag(idag + 1));  // 00:41 neste dag
  // Ingen tomme, ingen for lange (to linjer à ~26 tegn på 200 px)
  for (int i = 0; i < ANTALL_OPPDRAG; ++i) {
    SJEKK(std::strlen(OPPDRAG[i]) > 3);
    SJEKK(Skjerm::wrap(F_M, OPPDRAG[i], 184, 3).size() <= 2);
  }
}

static void test_rull() {
  Rull r;
  std::vector<std::string> logg;
  r.skriv = [&logg](const std::string& l) { logg.push_back(l); return true; };
  LIK(r.i_morket(T0), 0);
  LIK(r.neste_fremkalling(T0), 0);
  auto a = r.ta(T0, 5);
  SJEKK(a.ok);
  LIK(r.i_morket(T0), 1);
  LIK(r.igjen(T0), 23);
  LIK(r.neste_fremkalling(T0), T0 + 48 * TIME);
  SJEKK(r.fremkalte(T0 + 48 * TIME - 1).empty());
  LIK(r.fremkalte(T0 + 48 * TIME).size(), static_cast<size_t>(1));
  // Full rull
  for (int i = 1; i < RULL; ++i) SJEKK(r.ta(T0 + i * MIN, -1).ok);
  LIK(r.i_morket(T0 + 30 * MIN), RULL);
  SJEKK(!r.ta(T0 + 30 * MIN, -1).ok);
  // Første fremkalles → plass til ett
  SJEKK(r.ta(T0 + 48 * TIME, -1).ok);
  SJEKK(!r.ta(T0 + 48 * TIME, -1).ok);
  LIK(r.rull_nr(), 2);
  // Fremkalt mellom
  LIK(r.fremkalt_mellom(T0, T0 + 48 * TIME + 2 * MIN).size(), static_cast<size_t>(3));
  // Tvang
  SJEKK(r.fremkall_alt(T0 + 49 * TIME).ok);
  LIK(r.i_morket(T0 + 49 * TIME), 0);
  LIK(r.tvunget(), 1);  // rull 1 er fremkalt av seg selv ved 48 t 23 min; bare den nye var i mørket
  SJEKK(!r.fremkall_alt(T0 + 49 * TIME).ok);
  // Kast
  SJEKK(r.kast(T0 + 50 * TIME, a.id).ok);
  SJEKK(!r.kast(T0 + 50 * TIME, a.id).ok);
  SJEKK(r.finn(a.id)->kastet);
  LIK(r.fremkalte(T0 + 50 * TIME).size(), static_cast<size_t>(24));
  // Avspilling gir identisk tilstand
  Rull b;
  for (const auto& l : logg) SJEKK(b.spill_av(l));
  LIK(b.til_json(T0 + 51 * TIME), r.til_json(T0 + 51 * TIME));
  LIK(b.neste_id(), r.neste_id());
  // Ødelagte linjer avvises
  SJEKK(!b.spill_av("{\"t\":\"tatt\",\"id\":1,\"ts\":5}"));  // duplikat-id
  SJEKK(!b.spill_av("{\"t\":\"tatt\",\"ts\":5}"));
  SJEKK(!b.spill_av("{\"t\":\"x\",\"ts\":5}"));
  SJEKK(!b.spill_av("ikke json"));
  // JSON avslører ikke innhold i mørket
  Rull c;
  c.ta(T0, 7);
  const std::string j = c.til_json(T0 + TIME);
  SJEKK(j.find("\"morket\":[{\"fremkalles\":") != std::string::npos);
  SJEKK(j.find("\"fremkalte\":[]") != std::string::npos);
  SJEKK(j.find("\"id\":1") == std::string::npos);
  // Lagringsfeil = ingenting endret
  Rull d;
  d.skriv = [](const std::string&) { return false; };
  SJEKK(!d.ta(T0, 1).ok);
  LIK(d.tatt_totalt(), 0);
}

static Gra flat(int w, int h, uint8_t v) {
  Gra g;
  g.w = w; g.h = h;
  g.px.assign(static_cast<size_t>(w) * h, v);
  return g;
}

static void test_dither() {
  LIK(sorte(atkinson(flat(200, 144, 0))), 200 * 144);
  LIK(sorte(atkinson(flat(200, 144, 255))), 0);
  const int mid = sorte(atkinson(flat(200, 144, 128)));
  SJEKK(mid > 200 * 144 * 40 / 100 && mid < 200 * 144 * 60 / 100);
  // Gradient: tettheten synker monotont fra venstre (sort) til høyre (hvit)
  Gra g;
  g.w = 200; g.h = 144;
  g.px.resize(200 * 144);
  for (int y = 0; y < 144; ++y) for (int x = 0; x < 200; ++x) g.px[y * 200 + x] = static_cast<uint8_t>(x * 255 / 199);
  const auto bits = atkinson(g);
  int forrige = 1 << 30;
  for (int band = 0; band < 5; ++band) {
    int n = 0;
    for (int y = 0; y < 144; ++y)
      for (int x = band * 40; x < band * 40 + 40; ++x) n += (bits[(y * 200 + x) >> 3] & (0x80 >> (x & 7))) ? 1 : 0;
    SJEKK(n < forrige);
    forrige = n;
  }
  // Skalering: senterbeskjær bevarer sideforhold, arealsnitt bevarer middel
  Gra stor = flat(2592, 1944, 90);
  for (int x = 0; x < 300; ++x) for (int y = 0; y < 1944; ++y) stor.px[y * 2592 + x] = 255;  // hvit stripe helt til venstre
  const Gra s = skaler_fyll(stor, 200, 144);
  LIK(s.w, 200);
  LIK(s.h, 144);
  LIK(static_cast<int>(s.at(100, 72)), 90);
  // 2592×1944 (4:3) → 25:18: beskjærer litt i høyden, ikke bredden; stripa (11,6 %) skal være med
  SJEKK(s.at(5, 72) == 255);
  // Strekk: flatt bilde røres ikke, lavkontrast strekkes
  Gra f = flat(50, 50, 128);
  strekk(f);
  LIK(static_cast<int>(f.at(10, 10)), 128);
  Gra lav;
  lav.w = 100; lav.h = 1;
  for (int i = 0; i < 100; ++i) lav.px.push_back(static_cast<uint8_t>(100 + i / 2));
  strekk(lav);
  SJEKK(lav.px.front() < 10 && lav.px.back() > 245);
  // Tomme inndata krasjer ikke
  Gra tom;
  LIK(fremkall(tom, 200, 144).size(), static_cast<size_t>(200 * 144 / 8));
}

static void test_krypt() {
  Nokkel n;
  for (int i = 0; i < 32; ++i) n.k[i] = static_cast<uint8_t>(i * 7 + 1);
  uint8_t nonce[12];
  for (int i = 0; i < 12; ++i) nonce[i] = static_cast<uint8_t>(0xA0 + i);
  std::string jpeg = "\xFF\xD8\xFF\xE0 et bilde av noe som er varmt \xFF\xD9";
  jpeg += std::string(5000, 'x');
  const std::string fil = forsegl(n, 7, jpeg, nonce);
  LIK(fil.size(), jpeg.size() + KONVOLUTT_HODE);
  SJEKK(fil.compare(0, 4, "MRK1") == 0);
  SJEKK(fil.find("varmt") == std::string::npos);  // klartekst finnes ikke i filen
  std::string ut;
  SJEKK(aapne(n, 7, fil, ut));
  LIK(ut, jpeg);
  // Endret ett bit i innholdet
  std::string t = fil;
  t[KONVOLUTT_HODE + 100] ^= 1;
  SJEKK(!aapne(n, 7, t, ut));
  // Endret tag
  t = fil;
  t[20] ^= 1;
  SJEKK(!aapne(n, 7, t, ut));
  // Feil id (fil byttet med et annet bilde)
  SJEKK(!aapne(n, 8, fil, ut));
  // Feil nøkkel
  Nokkel m = n;
  m.k[0] ^= 1;
  SJEKK(!aapne(m, 7, fil, ut));
  // For kort / feil magi
  SJEKK(!aapne(n, 7, fil.substr(0, 20), ut));
  SJEKK(!aapne(n, 7, "XRK1" + fil.substr(4), ut));
  // Tomt innhold
  SJEKK(aapne(n, 1, forsegl(n, 1, "", nonce), ut) && ut.empty());
}

static void test_enhet_og_api() {
  Enhet e;
  std::set<uint32_t> lagret;
  std::vector<uint8_t> gra_bits(BILDE_W * BILDE_H / 8, 0x55);
  e.ta_bilde = [&](uint32_t id) { lagret.insert(id); return true; };
  e.bits_for = [&](uint32_t) { return &gra_bits; };
  // Deksel lukket: utløser gjør ingenting
  e.utloser(T0);
  LIK(e.rull.tatt_totalt(), 0);
  e.deksel(true, T0);
  e.utloser(T0);
  LIK(e.rull.tatt_totalt(), 1);
  SJEKK(lagret.count(1));
  SJEKK(e.ctx.vis == Visning::Tatt);
  e.tick(T0 + VIS_TATT + 1);
  SJEKK(e.ctx.vis == Visning::Status);
  // Kamera feiler: ingenting logges
  e.ta_bilde = [](uint32_t) { return false; };
  e.utloser(T0 + MIN);
  LIK(e.rull.tatt_totalt(), 1);
  e.ta_bilde = [&](uint32_t id) { lagret.insert(id); return true; };
  // Bla uten fremkalte → status
  e.bla(T0 + MIN);
  SJEKK(e.ctx.vis == Visning::Status);
  // 48 t senere: tick varsler
  e.tick(T0 + 48 * TIME + SEK);
  SJEKK(e.ctx.vis == Visning::Nye);
  LIK(e.ctx.nye, 1);
  e.bla(T0 + 48 * TIME + 2 * SEK);
  SJEKK(e.ctx.vis == Visning::Fremkalt);
  LIK(e.ctx.bilde_id, 1u);
  SJEKK(e.ctx.bits == &gra_bits);
  e.bla(T0 + 48 * TIME + 3 * SEK);
  SJEKK(e.ctx.vis == Visning::Status);
  // Tvang
  e.utloser(T0 + 49 * TIME);
  e.utloser(T0 + 49 * TIME + 1);
  LIK(e.rull.i_morket(T0 + 49 * TIME + 2), 2);
  e.hold_bla(HOLD_TVANG, T0 + 49 * TIME + 3);
  SJEKK(e.ctx.vis == Visning::Tvang);
  e.bla(T0 + 49 * TIME + 4);  // nei
  LIK(e.rull.i_morket(T0 + 49 * TIME + 5), 2);
  e.hold_bla(HOLD_TVANG, T0 + 49 * TIME + 6);
  e.utloser(T0 + 49 * TIME + 7);  // ja
  LIK(e.rull.i_morket(T0 + 49 * TIME + 8), 0);
  SJEKK(e.ctx.vis == Visning::Nye);
  LIK(e.ctx.nye, 2);
  // Hold 3 s = QR
  e.hold_bla(HOLD_QR, T0 + 50 * TIME);
  SJEKK(e.ctx.vis == Visning::Qr);

  // API
  Api api(e);
  api.nokkel = "k";
  api.les_original = [](uint32_t id, std::string& j) { j = "JPEG" + std::to_string(id); return true; };
  e.deksel(true, T0 + 50 * TIME);
  e.utloser(T0 + 50 * TIME);  // nytt bilde i mørket: id 4
  const uint32_t morkt = e.rull.neste_id() - 1;
  LIK(api.handle("GET", "/api/state", "", "", T0 + 50 * TIME).kode, 401);
  LIK(api.handle("GET", "/api/bilde/" + std::to_string(morkt) + ".jpg", "", "k", T0 + 51 * TIME).kode, 403);
  LIK(api.handle("GET", "/api/bilde/" + std::to_string(morkt) + ".pbm", "", "k", T0 + 51 * TIME).kode, 403);
  auto s = api.handle("GET", "/api/bilde/1.jpg", "", "k", T0 + 51 * TIME);
  LIK(s.kode, 200);
  LIK(s.kropp, std::string("JPEG1"));
  LIK(s.type, std::string("image/jpeg"));
  s = api.handle("GET", "/api/bilde/1.pbm", "", "k", T0 + 51 * TIME);
  LIK(s.kropp.size(), static_cast<size_t>(BILDE_W * BILDE_H / 8 + 11));  // "P4\n200 144\n"
  LIK(api.handle("GET", "/api/bilde/999.jpg", "", "k", T0).kode, 404);
  LIK(api.handle("GET", "/api/bilde/../x.jpg", "", "k", T0).kode, 404);
  LIK(api.handle("GET", "/api/bilde/1x.jpg", "", "k", T0).kode, 404);
  s = api.handle("GET", "/api/kontaktark.pbm", "", "k", T0 + 51 * TIME);
  SJEKK(s.kropp.rfind("P4\n", 0) == 0);
  LIK(api.handle("POST", "/api/fremkall-alt", "{}", "k", T0 + 51 * TIME).kode, 400);
  LIK(api.handle("POST", "/api/fremkall-alt", "{\"bekreft\":true}", "k", T0 + 51 * TIME).kode, 200);
  LIK(api.handle("GET", "/api/bilde/" + std::to_string(morkt) + ".jpg", "", "k", T0 + 51 * TIME).kode, 200);
  LIK(api.handle("POST", "/api/kast", "{\"id\":1}", "k", T0 + 52 * TIME).kode, 200);
  LIK(api.handle("GET", "/api/bilde/1.jpg", "", "k", T0 + 52 * TIME).kode, 404);
  LIK(api.handle("POST", "/api/knapp", "{\"k\":\"utloser\"}", "k", T0).kode, 404);  // ikke på ekte kamera
  s = api.handle("GET", "/api/state?now=" + std::to_string(T0 + 99 * TIME), "", "k", T0 + 52 * TIME);
  SJEKK(s.kropp.find("\"naa\":" + std::to_string(T0 + 52 * TIME)) != std::string::npos);  // ingen sett_klokke = enhetens tid
}

static void test_skjermer() {
  Enhet e;
  std::vector<uint8_t> bits(BILDE_W * BILDE_H / 8, 0xAA);
  e.bits_for = [&](uint32_t) { return &bits; };
  e.deksel(true, T0);
  for (int i = 0; i < 3; ++i) e.utloser(T0 + i);
  for (Visning v : {Visning::Status, Visning::Tatt, Visning::Fremkalt, Visning::Nye, Visning::Full, Visning::Tvang, Visning::Qr, Visning::Av}) {
    Skjerm s;
    Ctx c = e.ctx;
    c.vis = v;
    c.naa = T0 + 49 * TIME;
    c.bilde_id = 1;
    c.bits = &bits;
    c.nye = 3;
    c.ap_pass = "abc";
    c.nokkel = "nokkel";
    tegn(e.rull, c, s);
    SJEKK(sorte(std::vector<uint8_t>(s.buf, s.buf + Skjerm::BYTES)) > 200);
  }
}

static void test_fuzz() {
  std::mt19937 rng(64);
  const std::string biter[] = {"{", "}", "\"t\"", ":", ",", "\"tatt\"", "\"tvang\"", "\"kast\"", "\"ts\"", "1", "-", "\"id\"", "\"opp\"", "99", "\"", " "};
  Rull r;
  for (int i = 0; i < 20000; ++i) {
    std::string x;
    const int n = rng() % 18;
    for (int k = 0; k < n; ++k) x += biter[rng() % (sizeof(biter) / sizeof(biter[0]))];
    r.spill_av(x);
  }
  Skjerm s;
  Ctx c;
  c.naa = T0;
  tegn(r, c, s);
  Nokkel nk{};
  std::string ut;
  for (int i = 0; i < 2000; ++i) {
    std::string f(rng() % 80, '\0');
    for (auto& ch : f) ch = static_cast<char>(rng());
    if (i % 2) f.replace(0, std::min<size_t>(4, f.size()), "MRK1");
    SJEKK(!aapne(nk, 1, f, ut));
  }
}

int main() {
  test_oppdrag();
  test_rull();
  test_dither();
  test_krypt();
  test_enhet_og_api();
  test_skjermer();
  test_fuzz();
  std::printf("%d sjekker, %d feil\n", sjekker, feil);
  return feil ? 1 : 0;
}
