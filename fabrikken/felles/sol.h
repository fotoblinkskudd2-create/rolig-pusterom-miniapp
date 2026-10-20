// Solas gang uten nett: soloppgang, solnedgang, blåtime, mørketid og midnattssol.
// NOAA-algoritmen (Meeus, forenklet), to iterasjoner. Nøyaktighet ~1–2 min under 65° N, noen minutter nær polarsirkelen.
#pragma once
#include <cmath>
#include <cstdint>

#include "tid.h"

namespace felles {

enum class SolType { Normal, Morketid, Midnattssol };

struct SolDag {
  SolType type = SolType::Normal;
  ms_t opp = 0, ned = 0;          // UTC, bare for Normal
  ms_t middag = 0;                // UTC, sola høyest
  double maks_hoyde = 0;          // grader over horisonten ved middag
  int lengde_min = 0;             // minutter med sol over horisonten (0 i mørketid, 1440 i midnattssol)
  bool har_bla = false;           // borgerlig tusmørke (sola mellom −6° og 0°) finnes
  ms_t bla_fra = 0, bla_til = 0;  // i mørketid: lyseste del av dagen
};

namespace sol_detalj {

constexpr double PI_ = 3.14159265358979323846;  // ikke «PI»: Arduino.h definerer det som makro
inline double rad(double g) { return g * PI_ / 180.0; }
inline double grad(double r) { return r * 180.0 / PI_; }

// Deklinasjon (rad) og tidsjevning (min) for et tidspunkt i julianske århundrer fra J2000.
inline void sol_param(double t, double& dekl, double& eqtid) {
  const double l0 = std::fmod(280.46646 + t * (36000.76983 + t * 0.0003032), 360.0);
  const double m = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const double e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const double c = std::sin(rad(m)) * (1.914602 - t * (0.004817 + 0.000014 * t)) + std::sin(rad(2 * m)) * (0.019993 - 0.000101 * t) +
                   std::sin(rad(3 * m)) * 0.000289;
  const double sann = l0 + c;
  const double omega = 125.04 - 1934.136 * t;
  const double lambda = sann - 0.00569 - 0.00478 * std::sin(rad(omega));
  const double eps0 = 23.0 + (26.0 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60.0) / 60.0;
  const double eps = eps0 + 0.00256 * std::cos(rad(omega));
  dekl = std::asin(std::sin(rad(eps)) * std::sin(rad(lambda)));
  const double y = std::tan(rad(eps / 2)) * std::tan(rad(eps / 2));
  eqtid = 4 * grad(y * std::sin(2 * rad(l0)) - 2 * e * std::sin(rad(m)) + 4 * e * y * std::sin(rad(m)) * std::cos(2 * rad(l0)) -
                   0.5 * y * y * std::sin(4 * rad(l0)) - 1.25 * e * e * std::sin(2 * rad(m)));
}

inline double jh(ms_t utc) { return (static_cast<double>(utc) / 86400000.0 + 2440587.5 - 2451545.0) / 36525.0; }

// Timevinkel (grader) for gitt senitvinkel, eller NAN hvis sola aldri når den (>1) / aldri går under (<-1).
inline double timevinkel(double lat, double dekl, double senit, int& fortegn) {
  const double c = (std::cos(rad(senit)) - std::sin(rad(lat)) * std::sin(dekl)) / (std::cos(rad(lat)) * std::cos(dekl));
  fortegn = c > 1 ? 1 : (c < -1 ? -1 : 0);
  if (fortegn) return NAN;
  return grad(std::acos(c));
}

// Tidspunkt (UTC ms) for hendelse på UTC-dato `dag`, med en forbedring rundt første anslag.
inline bool hendelse(int64_t dag, double lat, double lon, double senit, bool opp, ms_t& ut) {
  ms_t t = dag * DOGN + 12 * TIME;
  for (int iter = 0; iter < 2; ++iter) {
    double dekl, eq;
    sol_param(jh(t), dekl, eq);
    int f;
    const double h = timevinkel(lat, dekl, senit, f);
    if (f) return false;
    const double min = 720 - 4 * (lon + (opp ? h : -h)) - eq;
    t = dag * DOGN + static_cast<ms_t>(min * 60000.0);
  }
  ut = t;
  return true;
}

}  // namespace sol_detalj

// dag = UTC-dagnummer (lokal dato er god nok her; hendelsene ligger nær lokal middag).
inline SolDag sol_dag(int64_t dag, double lat, double lon) {
  using namespace sol_detalj;
  SolDag s;
  double dekl, eq;
  sol_param(jh(dag * DOGN + 12 * TIME), dekl, eq);
  s.middag = dag * DOGN + static_cast<ms_t>((720 - 4 * lon - eq) * 60000.0);
  s.maks_hoyde = 90.0 - std::fabs(lat - grad(dekl));
  int f;
  timevinkel(lat, dekl, 90.833, f);
  if (f > 0) s.type = SolType::Morketid;
  else if (f < 0) s.type = SolType::Midnattssol;
  if (s.type == SolType::Normal) {
    if (!hendelse(dag, lat, lon, 90.833, true, s.opp) || !hendelse(dag, lat, lon, 90.833, false, s.ned)) {
      s.type = s.maks_hoyde > 0 ? SolType::Midnattssol : SolType::Morketid;
    } else {
      s.lengde_min = static_cast<int>((s.ned - s.opp) / MIN);
    }
  }
  if (s.type == SolType::Midnattssol) s.lengde_min = 1440;
  if (s.type == SolType::Morketid) {
    // Blåtime: når sola er over −6°, rundt middag
    ms_t a, b;
    if (hendelse(dag, lat, lon, 96.0, true, a) && hendelse(dag, lat, lon, 96.0, false, b)) {
      s.har_bla = true;
      s.bla_fra = a;
      s.bla_til = b;
    }
  }
  return s;
}

// Solhøyde (grader) på et vilkårlig tidspunkt. Brukes for å simulere lys og for lyskurven.
inline double sol_hoyde(ms_t utc, double lat, double lon) {
  using namespace sol_detalj;
  double dekl, eq;
  sol_param(jh(utc), dekl, eq);
  const double min_utc = static_cast<double>(utc - floordiv(utc, DOGN) * DOGN) / 60000.0;
  const double sann_sol = std::fmod(min_utc + eq + 4 * lon + 1440.0, 1440.0);
  const double ha = sann_sol / 4 - 180;
  const double cz = std::sin(rad(lat)) * std::sin(dekl) + std::cos(rad(lat)) * std::cos(dekl) * std::cos(rad(ha));
  return 90.0 - grad(std::acos(std::fmax(-1.0, std::fmin(1.0, cz))));
}

// Dager til neste dag med soloppgang (0 = i dag). -1 hvis ingen innen et år.
inline int dager_til_sol(int64_t dag, double lat, double lon) {
  for (int i = 0; i < 366; ++i)
    if (sol_dag(dag + i, lat, lon).type != SolType::Morketid) return i;
  return -1;
}

// Dager til første dag med solnedgang igjen (0 = i dag). -1 hvis ingen innen et år.
inline int dager_til_solnedgang(int64_t dag, double lat, double lon) {
  for (int i = 0; i < 366; ++i)
    if (sol_dag(dag + i, lat, lon).type != SolType::Midnattssol) return i;
  return -1;
}

}  // namespace felles
