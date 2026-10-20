// Enhetstester for Vindusvakt. make -C firmware test
#include <cstdio>
#include <random>
#include <string>

#include "../core/api.h"
#include "../tools/scene.h"

using namespace vindusvakt;

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
#define NAER(a, b, tol)                                                                                       \
  do {                                                                                                        \
    ++sjekker;                                                                                                \
    const double _a = (a), _b = (b);                                                                          \
    if (std::fabs(_a - _b) > (tol)) { ++feil; std::printf("FEIL %s:%d  %s ≈ %s (%.2f vs %.2f)\n", __FILE__, __LINE__, #a, #b, _a, _b); } \
  } while (0)

constexpr double OSLO_LAT = 59.9139, OSLO_LON = 10.7522;
constexpr double TROMSO_LAT = 69.6492, TROMSO_LON = 18.9553;
constexpr ms_t T0 = 1792503660000LL;  // tir 20.10.2026 15:41 Oslo

static int min_lokal(ms_t t) { const Lokal l = lokal(t); return l.hh * 60 + l.mm; }

static void test_sol() {
  // Oslo, kjente verdier (timeanddate.com): 21.06 opp 03:54 ned 22:44; 21.12 opp 09:18 ned 15:12
  SolDag s = sol_dag(days_from_civil(2026, 6, 21), OSLO_LAT, OSLO_LON);
  SJEKK(s.type == SolType::Normal);
  NAER(min_lokal(s.opp), 3 * 60 + 54, 3);
  NAER(min_lokal(s.ned), 22 * 60 + 44, 3);
  s = sol_dag(days_from_civil(2026, 12, 21), OSLO_LAT, OSLO_LON);
  NAER(min_lokal(s.opp), 9 * 60 + 18, 3);
  NAER(min_lokal(s.ned), 15 * 60 + 12, 3);
  NAER(s.maks_hoyde, 6.6, 0.3);
  // Solhøyde ved middag = maks_hoyde
  NAER(sol_hoyde(s.middag, OSLO_LAT, OSLO_LON), s.maks_hoyde, 0.3);
  // Tromsø: mørketid ca. 28.11–15.01 (Tromsø byguide, Visit Norway)
  SJEKK(sol_dag(days_from_civil(2026, 11, 26), TROMSO_LAT, TROMSO_LON).type == SolType::Normal);
  SJEKK(sol_dag(days_from_civil(2026, 11, 29), TROMSO_LAT, TROMSO_LON).type == SolType::Morketid);
  SJEKK(sol_dag(days_from_civil(2027, 1, 13), TROMSO_LAT, TROMSO_LON).type == SolType::Morketid);
  SJEKK(sol_dag(days_from_civil(2027, 1, 17), TROMSO_LAT, TROMSO_LON).type == SolType::Normal);
  // Midnattssol ca. 20.05–22.07 (± refraksjon)
  SJEKK(sol_dag(days_from_civil(2026, 5, 22), TROMSO_LAT, TROMSO_LON).type == SolType::Midnattssol);
  SJEKK(sol_dag(days_from_civil(2026, 7, 20), TROMSO_LAT, TROMSO_LON).type == SolType::Midnattssol);
  SJEKK(sol_dag(days_from_civil(2026, 8, 1), TROMSO_LAT, TROMSO_LON).type == SolType::Normal);
  LIK(sol_dag(days_from_civil(2026, 6, 21), TROMSO_LAT, TROMSO_LON).lengde_min, 1440);
  // Blåtime i mørketid i Tromsø
  s = sol_dag(days_from_civil(2026, 12, 21), TROMSO_LAT, TROMSO_LON);
  SJEKK(s.type == SolType::Morketid && s.har_bla && s.bla_til > s.bla_fra);
  SJEKK(s.bla_til - s.bla_fra > 2 * TIME && s.bla_til - s.bla_fra < 7 * TIME);
  // Dager til sola
  const int n = dager_til_sol(days_from_civil(2026, 12, 1), TROMSO_LAT, TROMSO_LON);
  SJEKK(n >= 43 && n <= 47);
  LIK(dager_til_sol(days_from_civil(2026, 6, 1), OSLO_LAT, OSLO_LON), 0);
  // Svalbard (78,2° N): mørketid midt i desember, ingen blåtime ved vintersolverv
  s = sol_dag(days_from_civil(2026, 12, 21), 78.22, 15.65);
  SJEKK(s.type == SolType::Morketid && !s.har_bla);
  // Ekvator: alltid ~12 t
  NAER(sol_dag(days_from_civil(2026, 3, 20), 0.0, 0.0).lengde_min, 12 * 60 + 7, 6);
}

static Prove prove_med(ms_t ts, uint8_t lys) {
  Prove p;
  p.ts = ts;
  p.lys = lys;
  return p;
}

static void test_arkiv() {
  Arkiv a;
  SJEKK(a.siste() == nullptr);
  a.legg(prove_med(T0, 100));
  a.legg(prove_med(T0 - 2 * TIME, 50));
  a.legg(prove_med(T0 - TIME, 70));
  LIK(a.alle().size(), static_cast<size_t>(3));
  SJEKK(a.alle()[0].ts < a.alle()[1].ts && a.alle()[1].ts < a.alle()[2].ts);
  LIK(a.naermest(T0 - TIME + 10 * MIN)->lys, 70);
  SJEKK(a.naermest(T0 + 2 * TIME) == nullptr);  // utenfor 40 min
  // Kasting av gammelt
  for (int i = 1; i <= 9 * 24; ++i) a.legg(prove_med(T0 + i * TIME, static_cast<uint8_t>(i)));
  SJEKK(a.alle().front().ts >= a.alle().back().ts - 8 * DOGN);
  SJEKK(a.alle().size() <= static_cast<size_t>(8 * 24 + 1));
  // Serialisering
  a.stor.assign(SB, 0x5A);
  a.stor_ts = T0;
  Arkiv b;
  SJEKK(b.les(a.serialiser()));
  LIK(b.alle().size(), a.alle().size());
  LIK(b.alle().back().lys, a.alle().back().lys);
  LIK(b.stor.size(), static_cast<size_t>(SB));
  LIK(b.stor_ts, T0);
  SJEKK(!b.les("VVA1"));
  SJEKK(!b.les("XXXX" + a.serialiser().substr(4)));
  SJEKK(!b.les(a.serialiser().substr(0, 500)));
  LIK(b.alle().size(), a.alle().size());  // mislykket les endrer ingenting
  // Fuzz
  std::mt19937 rng(3);
  for (int i = 0; i < 3000; ++i) {
    std::string s(rng() % 3000, '\0');
    for (auto& c : s) c = static_cast<char>(rng());
    if (i % 2) s.replace(0, std::min<size_t>(4, s.size()), "VVA1");
    Arkiv c;
    c.les(s);
  }
}

static void test_prove_og_sted() {
  // Natt: utsikt i Tromsø i mørketid kl 00 er mørk; dag i Oslo i juni er lys
  const Gra natt = utsikt(days_from_civil(2026, 12, 21) * DOGN - TIME, TROMSO_LAT, TROMSO_LON);
  const Gra dag = utsikt(days_from_civil(2026, 6, 21) * DOGN + 11 * TIME, OSLO_LAT, OSLO_LON);
  SJEKK(middel(natt) < 40);
  SJEKK(middel(dag) > 100);
  const Prove pn = lag_prove(natt, 1), pd = lag_prove(dag, 2);
  int sn = 0, sd = 0;
  for (uint8_t b : pn.bits) sn += __builtin_popcount(b);
  for (uint8_t b : pd.bits) sd += __builtin_popcount(b);
  SJEKK(sn > TW * TH * 80 / 100);  // natt forblir natt (ikke strukket til grå støy)
  SJEKK(sd < TW * TH * 70 / 100);
  LIK(lag_stor(dag).size(), static_cast<size_t>(SB));
  // Sted
  Sted s;
  std::string f;
  SJEKK(sted_fra_json(R"({"navn":"Tromsø","lat_u":69649200,"lon_u":18955300})", s, f));
  NAER(s.lat, 69.6492, 1e-6);
  LIK(s.navn, std::string("Tromsø"));
  SJEKK(!sted_fra_json(R"({"navn":"X","lat_u":95000000,"lon_u":0})", s, f));
  SJEKK(!sted_fra_json(R"({"navn":"","lat_u":1,"lon_u":0})", s, f));
  SJEKK(!sted_fra_json(R"({"navn":"X"})", s, f));
  SJEKK(sted_fra_json(R"({"navn":"ææææææææææææææææææææææææææææææ","lat_u":1,"lon_u":1})", s, f));
  SJEKK(s.navn.size() <= 40 && (static_cast<unsigned char>(s.navn.back()) & 0xC0) == 0x80);  // slutter på helt tegn (æ = C3 A6)
  LIK(s.navn.size() % 2, static_cast<size_t>(0));
  LIK(sted_json(s).find("\"lat\":0.0000") != std::string::npos, true);
}

static void test_enhet_og_api() {
  Enhet e;
  int fanget = 0;
  e.fang = [&](Gra& g) { ++fanget; g = utsikt(e.ctx.naa, OSLO_LAT, OSLO_LON); return true; };
  int lagret = 0;
  e.lagre = [&]() { ++lagret; };
  e.tick(T0);
  e.tick(T0 + MIN);
  e.tick(T0 + 10 * MIN);
  LIK(fanget, 1);  // ett bilde per time
  e.tick(T0 + TIME);
  LIK(fanget, 2);
  LIK(lagret, 2);
  LIK(e.arkiv.alle().size(), static_cast<size_t>(2));
  e.privat(true, T0 + 2 * TIME);
  e.tick(T0 + 2 * TIME);
  LIK(fanget, 2);  // linse lukket: ingen bilder
  e.privat(false, T0 + 3 * TIME);
  e.fang = [&](Gra&) { ++fanget; return false; };
  e.tick(T0 + 3 * TIME);
  LIK(e.arkiv.alle().size(), static_cast<size_t>(2));  // kamerafeil: ingenting lagret
  e.knapp(T0);
  SJEKK(e.ctx.side == Side::IDag);
  e.knapp(T0);
  e.knapp(T0);
  SJEKK(e.ctx.side == Side::Uke);

  Api api(e);
  api.nokkel = "v";
  Sted lagret_sted;
  api.lagre_sted = [&](const Sted& s) { lagret_sted = s; };
  LIK(api.handle("GET", "/api/state", "", "", T0).kode, 401);
  Svar s = api.handle("GET", "/api/state", "", "v", T0);
  LIK(s.kode, 200);
  SJEKK(s.kropp.find("\"lys\":\"Sola opp") != std::string::npos);
  SJEKK(s.kropp.find("\"prover\":[{\"ts\":") != std::string::npos);
  const ms_t ts = e.arkiv.alle()[0].ts;
  s = api.handle("GET", "/api/prove/" + std::to_string(ts) + ".pbm", "", "v", T0);
  LIK(s.kode, 200);
  LIK(s.kropp.size(), static_cast<size_t>(TB + 10));  // "P4\n112 84\n" = 10 tegn
  LIK(api.handle("GET", "/api/prove/123.pbm", "", "v", T0).kode, 404);
  LIK(api.handle("GET", "/api/prove/../x.pbm", "", "v", T0).kode, 404);
  LIK(api.handle("GET", "/api/stor.pbm", "", "v", T0).kode, 200);
  LIK(api.handle("GET", "/api/skjerm.pbm", "", "v", T0).kropp.size(), static_cast<size_t>(Skjerm::BYTES + 11));
  LIK(api.handle("POST", "/api/sted", R"({"navn":"Tromsø","lat_u":69649200,"lon_u":18955300})", "v", T0).kode, 200);
  LIK(lagret_sted.navn, std::string("Tromsø"));
  LIK(e.ctx.sted.navn, std::string("Tromsø"));
  LIK(api.handle("POST", "/api/sted", R"({"navn":"X","lat_u":1})", "v", T0).kode, 400);
  LIK(api.handle("POST", "/api/knapp", R"({"k":"neste"})", "v", T0).kode, 404);  // ikke på ekte enhet
  // Mørketid i API-et
  s = api.handle("GET", "/api/state", "", "v", days_from_civil(2026, 12, 10) * DOGN + 12 * TIME);
  SJEKK(s.kropp.find("\"type\":\"morketid\"") != std::string::npos);
  SJEKK(s.kropp.find("Mørketid. Sola er tilbake om") != std::string::npos);
}

static void test_skjermer() {
  struct Tilfelle { Sted st; ms_t naa; };
  Sted oslo, tromso;
  tromso.navn = "Tromsø"; tromso.lat = TROMSO_LAT; tromso.lon = TROMSO_LON;
  const Tilfelle tilfeller[] = {
      {oslo, T0},
      {tromso, days_from_civil(2026, 12, 21) * DOGN + 11 * TIME},
      {tromso, days_from_civil(2026, 6, 21) * DOGN + 11 * TIME},
      {oslo, days_from_civil(2026, 12, 31) * DOGN + 23 * TIME + 30 * MIN},
  };
  for (const auto& t : tilfeller) {
    for (bool fylt : {false, true}) {
      Enhet e;
      e.ctx.sted = t.st;
      if (fylt) {
        e.fang = [&](Gra& g) { g = utsikt(e.ctx.naa, t.st.lat, t.st.lon); return true; };
        for (int h = 7 * 24; h >= 0; --h) e.tick(t.naa - h * TIME);
      }
      for (int side = 0; side < static_cast<int>(Side::ANTALL); ++side) {
        Skjerm s;
        Ctx c = e.ctx;
        c.naa = t.naa;
        c.side = static_cast<Side>(side);
        tegn(e.arkiv, c, s);
        SJEKK(s.get(2, 2));            // topplinjen
        SJEKK(!s.get(Skjerm::W / 2, 44) || side == 0);
      }
    }
  }
}

int main() {
  test_sol();
  test_arkiv();
  test_prove_og_sted();
  test_enhet_og_api();
  test_skjermer();
  std::printf("%d sjekker, %d feil\n", sjekker, feil);
  return feil ? 1 : 0;
}
