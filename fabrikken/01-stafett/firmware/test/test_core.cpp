// Enhetstester for Stafett-kjernen. Kjøres på vertsmaskin: make -C firmware test
#include <cstdio>
#include <random>
#include <string>
#include <vector>

#include "../core/view.h"

using namespace stafett;

static int feil = 0, sjekker = 0;
#define SJEKK(x)                                                     \
  do {                                                               \
    ++sjekker;                                                       \
    if (!(x)) { ++feil; std::printf("FEIL %s:%d  %s\n", __FILE__, __LINE__, #x); } \
  } while (0)
#define LIK(a, b)                                                                                     \
  do {                                                                                                \
    ++sjekker;                                                                                        \
    const auto _a = (a); const auto _b = (b);                                                         \
    if (!(_a == _b)) { ++feil; std::printf("FEIL %s:%d  %s == %s\n", __FILE__, __LINE__, #a, #b); } \
  } while (0)

// 2026-10-20 13:41 UTC = 15:41 i Oslo (sommertid til 25.10)
constexpr ms_t T0 = 1792503660000LL;

static void test_tid() {
  const Lokal l = lokal(T0);
  LIK(l.yyyymmdd(), 20261020);
  LIK(l.hh, 15);
  LIK(l.mm, 41);
  LIK(std::string(UKEDAG_KORT[l.wd]), std::string("tir"));
  // Sommertid slutter søndag 25.10.2026 01:00 UTC
  const ms_t skifte = days_from_civil(2026, 10, 25) * DOGN + TIME;
  LIK(oslo_offset(skifte - 1), 2 * TIME);
  LIK(oslo_offset(skifte), 1 * TIME);
  // Sommertid starter søndag 29.03.2026 01:00 UTC
  const ms_t start = days_from_civil(2026, 3, 29) * DOGN + TIME;
  LIK(oslo_offset(start - 1), 1 * TIME);
  LIK(oslo_offset(start), 2 * TIME);
  LIK(pluss_maaned(20260131, 1), 20260228);
  LIK(pluss_maaned(20280131, 1), 20280229);
  LIK(pluss_maaned(20261115, 2), 20270115);
  LIK(naar(T0 - 20 * TIME, T0), std::string("i går 19:41"));
  LIK(varighet(15 * TIME + 3 * MIN), std::string("15 t"));
  LIK(varighet(42 * MIN), std::string("42 min"));
  LIK(varighet(80 * TIME), std::string("3 døgn"));
}

static void test_kroner() {
  LIK(kroner(189900), std::string("1 899 kr"));
  LIK(kroner(25000000), std::string("250 000 kr"));
  LIK(kroner(1250), std::string("12,50 kr"));
  LIK(kroner(5), std::string("0,05 kr"));
  LIK(kroner(-141200), std::string("-1 412 kr"));
}

static void test_json() {
  json::Obj o;
  SJEKK(json::parse(R"({"a":"blåbær \"x\" \u00e6\ud83d\ude00","n":-42,"b":true,"z":null})", o));
  LIK(json::get_s(o, "a"), std::string("blåbær \"x\" æ\xF0\x9F\x98\x80"));
  LIK(json::get_n(o, "n"), -42);
  SJEKK(json::get_b(o, "b"));
  json::Obj o2;
  SJEKK(json::parse(json::dump(o), o2));
  LIK(json::get_s(o2, "a"), json::get_s(o, "a"));
  const char* daarlige[] = {"", "{", "{\"a\":}", "{\"a\":1,}", "[1]", "{\"a\":\"\\x\"}", "{\"a\":1} x", "{\"a\":\"\x01\"}",
                            "{\"a\":99999999999999999999999}"};
  for (const char* d : daarlige) SJEKK(!json::parse(d, o));
}

static void test_rens() {
  LIK(rens_tekst("  hei\x01" "du \n\n\n\nder  ", 100), std::string("hei du \n\nder"));
  LIK(rens_tekst("a\xC3", 100), std::string("a"));          // avkuttet UTF-8
  LIK(rens_tekst("æøå", 5), std::string("æø"));            // ikke midt i et tegn
  LIK(rens_tekst("\xFF\xFEok", 10), std::string("ok"));
}

static void test_kjol() {
  State s;
  auto r = s.kjol_legg_inn(T0, "Lego-delen", "Lego 10316", 189900, "Komplett");
  SJEKK(r.ok);
  const uint32_t id = r.id;
  SJEKK(!s.kjol_avgjor(T0 + TIME, id, "kjop").ok);
  SJEKK(!s.kjol_avgjor(T0 + 47 * TIME, id, "forleng").ok);
  SJEKK(!s.kjol_avgjor(T0 + 48 * TIME, id, "hm").ok);
  SJEKK(s.kjol_aktive(T0 + 47 * TIME)[0]->klar(T0 + 47 * TIME) == false);
  SJEKK(s.kjol_aktive(T0 + 48 * TIME)[0]->klar(T0 + 48 * TIME));
  SJEKK(s.kjol_avgjor(T0 + 50 * TIME, id, "forleng").ok);
  LIK(s.kjol()[0].frist, T0 + 98 * TIME);
  SJEKK(!s.kjol_avgjor(T0 + 60 * TIME, id, "kjop").ok);
  SJEKK(s.kjol_avgjor(T0 + 60 * TIME, id, "dropp").ok);
  SJEKK(!s.kjol_avgjor(T0 + 61 * TIME, id, "dropp").ok);
  int n; int64_t sum;
  s.droppet(T0 + 61 * TIME, 30 * DOGN, n, sum);
  LIK(n, 1);
  LIK(sum, 189900);
  s.droppet(T0 + 61 * TIME + 31 * DOGN, 30 * DOGN, n, sum);
  LIK(n, 0);
  SJEKK(!s.kjol_legg_inn(T0, "", "   ", 100, "").ok);
  SJEKK(!s.kjol_legg_inn(T0, "", "x", -1, "").ok);
  // Rekkefølge: klare først
  State t;
  t.kjol_legg_inn(T0, "", "sen", 1, "");
  t.kjol_legg_inn(T0 - 49 * TIME, "", "klar", 1, "");
  LIK(t.kjol_aktive(T0)[0]->ting, std::string("klar"));
}

static void test_forfall() {
  State s;
  SJEKK(!s.forfall_legg_inn(T0, "Klarna", 141200, 20260230, true).ok);  // finnes ikke
  auto k = s.forfall_legg_inn(T0, "Klarna", 141200, 20261028, true);
  auto f = s.forfall_legg_inn(T0, "Strøm", 98000, 20261105, false);
  SJEKK(k.ok && f.ok);
  NesteForfall nf = s.neste_forfall(T0);
  LIK(nf.f->navn, std::string("Klarna"));
  LIK(nf.dato, 20261028);
  SJEKK(!nf.forfalt);
  SJEKK(s.forfall_betalt(T0, k.id, 20261028).ok);
  SJEKK(!s.forfall_betalt(T0, k.id, 20261028).ok);
  nf = s.neste_forfall(T0);
  LIK(nf.f->navn, std::string("Strøm"));
  SJEKK(s.forfall_betalt(T0, f.id, 20261105).ok);
  nf = s.neste_forfall(T0);
  LIK(nf.dato, 20261128);
  // Forfalt
  nf = s.neste_forfall(T0 + 40 * DOGN);
  SJEKK(nf.forfalt);
  SJEKK(s.forfall_avslutt(T0, k.id).ok);
  SJEKK(s.neste_forfall(T0).f == nullptr);
}

static void test_borte() {
  State s;
  s.her(T0 - 30 * TIME, "");
  s.her(T0 - 28 * TIME, "");
  s.overlevering(T0 - 13 * TIME, "Ola", "Hei");  // 15 t borte
  s.her(T0 - 12 * TIME, "");
  Borte b;
  SJEKK(s.siste_borte(T0, b));
  LIK(b.til - b.fra, 15 * TIME);
  SJEKK(!s.siste_borte(T0 - 20 * TIME, b) || b.til <= T0 - 20 * TIME);
  State tom;
  SJEKK(!tom.siste_borte(T0, b));
}

static void test_logg_og_kompakt() {
  std::vector<std::string> logg;
  State s;
  s.skriv = [&logg](const std::string& l) { logg.push_back(l); return true; };
  s.overlevering(T0 - 3 * TIME, "Ukjent", "Kjøpte Lego på Klarna. Beklager.\nDen kommer torsdag.");
  const uint32_t ho = s.handoffs().back().id;
  s.overlevering(T0 - 2 * TIME, "Alex", "Ok. Vi lar den ligge.", ho);
  SJEKK(!s.overlevering(T0, "x", "svar", 999).ok);
  SJEKK(!s.overlevering(T0, "x", "  \n ").ok);
  auto k = s.kjol_legg_inn(T0 - 50 * TIME, "", "Robotstøvsuger", 349000, "Elkjøp");
  s.kjol_avgjor(T0 - TIME, k.id, "dropp");
  auto f = s.forfall_legg_inn(T0, "Klarna", 141200, 20261028, true);
  s.forfall_betalt(T0, f.id, 20261028);
  s.her(T0, "");
  // Avspilling gir identisk tilstand
  State r;
  for (const auto& l : logg) SJEKK(r.spill_av(l));
  LIK(r.til_json(T0), s.til_json(T0));
  // Kompaktering gir identisk tilstand
  State c;
  for (const auto& l : s.kompakt()) SJEKK(c.spill_av(l));
  LIK(c.til_json(T0), s.til_json(T0));
  // Nye id-er kolliderer ikke etter avspilling
  auto ny = r.overlevering(T0, "", "ny");
  SJEKK(ny.id > f.id);
  // Lagringsfeil gir feil, ikke stille tap
  State d;
  d.skriv = [](const std::string&) { return false; };
  SJEKK(!d.overlevering(T0, "", "x").ok);
  SJEKK(d.handoffs().empty());
  // Eksport
  const std::string eks = s.eksport_tekst(T0);
  SJEKK(eks.find("Kjøpte Lego") != std::string::npos);
  SJEKK(eks.find("3 490 kr") != std::string::npos);
  SJEKK(eks.find("svar på") != std::string::npos);
}

static void test_tekst() {
  const std::string lang = "Kjøpte Lego på Klarna igjen. Beklager. Den kommer torsdag og jeg vet ikke hvordan jeg skal forklare det til de andre, men jeg prøver her. Og så kom det en til pakke i dag, ingen vet fra hvem.";
  auto l = Fb::wrap(F_BODY, lang, 376, 3);
  LIK(l.size(), static_cast<size_t>(3));
  for (auto& x : l) SJEKK(Fb::width(F_BODY, x) <= 376);
  SJEKK(l.back().find("…") != std::string::npos);
  auto kort = Fb::wrap(F_BODY, "Hei.", 376, 3);
  LIK(kort.size(), static_cast<size_t>(1));
  auto nl = Fb::wrap(F_BODY, "a\nb\nc\nd", 376, 3);
  LIK(nl.size(), static_cast<size_t>(3));
  auto ord = Fb::wrap(F_BODY, std::string(200, 'W'), 100, 2);
  for (auto& x : ord) SJEKK(Fb::width(F_BODY, x) <= 100);
  SJEKK(Fb::width(F_BODY, Fb::fit(F_BODY, lang, 120)) <= 120);
  SJEKK(Fb::glyph(F_BODY, 0x00F8) != nullptr);  // ø
  SJEKK(Fb::glyph(F_BODY, 0x2192) != nullptr);  // →
}

static void test_render() {
  State s;
  s.overlevering(T0 - 2 * TIME, "", "Hei");
  s.kjol_legg_inn(T0, "", "Lego", 189900, "");
  for (int side = 0; side < static_cast<int>(Side::ANTALL); ++side) {
    Fb fb;
    Ctx c;
    c.naa = T0;
    c.side = static_cast<Side>(side);
    tegn(s, c, fb);
    SJEKK(fb.get(1, 1));            // topplinjen er sort
    SJEKK(fb.get(1, Fb::H - 2));    // bunnlinjen er sort
    SJEKK(!fb.get(Fb::W / 2, 34));  // under topplinjen er hvitt
  }
  for (Overlay o : {Overlay::Velkommen, Overlay::Qr, Overlay::Reset}) {
    Fb fb;
    Ctx c;
    c.naa = T0;
    c.overlay = o;
    c.borte_ms = 15 * TIME;
    tegn(s, c, fb);
    int sorte = 0;
    for (int i = 0; i < Fb::BYTES; ++i) sorte += __builtin_popcount(fb.buf[i]);
    SJEKK(sorte > 500);
  }
  // Tom tilstand tegner uten krasj
  State tom;
  Fb fb;
  Ctx c;
  c.naa = T0;
  for (int side = 0; side < 4; ++side) { c.side = static_cast<Side>(side); tegn(tom, c, fb); }
}

static void test_fuzz() {
  std::mt19937 rng(48);
  const std::string biter[] = {"{", "}", "\"t\"", ":", ",", "\"ho\"", "\"kj\"", "\"kv\"", "\"ts\"", "1", "-", "\"id\"",
                               "\"\\u", "d83d", "\"", "\\", "true", "\xC3", "\xA5", "9999999999999", " "};
  State s;
  for (int i = 0; i < 30000; ++i) {
    std::string x;
    const int n = rng() % 20;
    for (int k = 0; k < n; ++k) x += biter[rng() % (sizeof(biter) / sizeof(biter[0]))];
    s.spill_av(x);
    rens_tekst(x, rng() % 30);
  }
  Fb fb;
  Ctx c;
  c.naa = T0;
  tegn(s, c, fb);
  SJEKK(true);
}

int main() {
  test_tid();
  test_kroner();
  test_json();
  test_rens();
  test_kjol();
  test_forfall();
  test_borte();
  test_logg_og_kompakt();
  test_tekst();
  test_render();
  test_fuzz();
  std::printf("%d sjekker, %d feil\n", sjekker, feil);
  return feil ? 1 : 0;
}
