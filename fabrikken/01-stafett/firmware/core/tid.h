// Tid uten internett: UTC-millisekunder inn, Oslo-lokaltid ut.
// Kalenderalgoritmer etter Howard Hinnant (public domain).
#pragma once
#include <cstdint>
#include <string>

namespace stafett {

using ms_t = int64_t;
constexpr ms_t SEK = 1000;
constexpr ms_t MIN = 60 * SEK;
constexpr ms_t TIME = 60 * MIN;
constexpr ms_t DOGN = 24 * TIME;

inline int64_t floordiv(int64_t a, int64_t b) { return (a >= 0 ? a : a - b + 1) / b; }

inline int64_t days_from_civil(int64_t y, unsigned m, unsigned d) {
  y -= m <= 2;
  const int64_t era = (y >= 0 ? y : y - 399) / 400;
  const unsigned yoe = static_cast<unsigned>(y - era * 400);
  const unsigned doy = (153 * (m + (m > 2 ? -3 : 9)) + 2) / 5 + d - 1;
  const unsigned doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
  return era * 146097 + static_cast<int64_t>(doe) - 719468;
}

struct Dato { int y; int m; int d; };

inline Dato civil_from_days(int64_t z) {
  z += 719468;
  const int64_t era = (z >= 0 ? z : z - 146096) / 146097;
  const unsigned doe = static_cast<unsigned>(z - era * 146097);
  const unsigned yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
  const int64_t y = static_cast<int64_t>(yoe) + era * 400;
  const unsigned doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
  const unsigned mp = (5 * doy + 2) / 153;
  const unsigned d = doy - (153 * mp + 2) / 5 + 1;
  const unsigned m = mp < 10 ? mp + 3 : mp - 9;
  return {static_cast<int>(y + (m <= 2)), static_cast<int>(m), static_cast<int>(d)};
}

// 0 = søndag
inline int ukedag(int64_t dager) { return static_cast<int>(((dager % 7) + 11) % 7); }

// Siste søndag i måneden, som dagnummer
inline int64_t siste_sondag(int y, int m) {
  const int64_t siste = (m == 12 ? days_from_civil(y + 1, 1, 1) : days_from_civil(y, m + 1, 1)) - 1;
  return siste - ukedag(siste);
}

// CET/CEST. Sommertid fra siste søndag i mars 01:00 UTC til siste søndag i oktober 01:00 UTC.
inline ms_t oslo_offset(ms_t utc) {
  const int64_t dag = floordiv(utc, DOGN);
  const int y = civil_from_days(dag).y;
  const ms_t start = siste_sondag(y, 3) * DOGN + 1 * TIME;
  const ms_t slutt = siste_sondag(y, 10) * DOGN + 1 * TIME;
  return (utc >= start && utc < slutt) ? 2 * TIME : 1 * TIME;
}

struct Lokal {
  int y, m, d, hh, mm, wd;
  int64_t dag;  // lokalt dagnummer siden 1970-01-01
  int32_t yyyymmdd() const { return y * 10000 + m * 100 + d; }
};

inline Lokal lokal(ms_t utc) {
  const ms_t t = utc + oslo_offset(utc);
  const int64_t dag = floordiv(t, DOGN);
  const ms_t rest = t - dag * DOGN;
  const Dato c = civil_from_days(dag);
  return {c.y, c.m, c.d, static_cast<int>(rest / TIME), static_cast<int>((rest % TIME) / MIN), ukedag(dag), dag};
}

inline int64_t dag_fra_yyyymmdd(int32_t v) { return days_from_civil(v / 10000, (v / 100) % 100, v % 100); }
inline int32_t yyyymmdd_fra_dag(int64_t dag) {
  const Dato c = civil_from_days(dag);
  return c.y * 10000 + c.m * 100 + c.d;
}

// Samme dag i neste måned; klippes til månedens siste dag (31. jan → 28./29. feb).
inline int32_t pluss_maaned(int32_t v, int antall) {
  int y = v / 10000, m = (v / 100) % 100, d = v % 100;
  m += antall;
  while (m > 12) { m -= 12; ++y; }
  const int64_t forste_neste = days_from_civil(m == 12 ? y + 1 : y, m == 12 ? 1 : m + 1, 1);
  const int dager_i_mnd = static_cast<int>(forste_neste - days_from_civil(y, m, 1));
  if (d > dager_i_mnd) d = dager_i_mnd;
  return y * 10000 + m * 100 + d;
}

static const char* const UKEDAG_KORT[] = {"søn", "man", "tir", "ons", "tor", "fre", "lør"};

inline std::string to_siffer(int v) {
  char b[4] = {static_cast<char>('0' + (v / 10) % 10), static_cast<char>('0' + v % 10), 0, 0};
  return b;
}

inline std::string klokke(const Lokal& l) { return to_siffer(l.hh) + ":" + to_siffer(l.mm); }
inline std::string dato_kort(const Lokal& l) { return to_siffer(l.d) + "." + to_siffer(l.m); }

// «i dag 09:30», «i går 18:10», «lør 17.10 18:10»
inline std::string naar(ms_t t, ms_t naa) {
  const Lokal a = lokal(t), b = lokal(naa);
  if (a.dag == b.dag) return "i dag " + klokke(a);
  if (a.dag == b.dag - 1) return "i går " + klokke(a);
  return std::string(UKEDAG_KORT[a.wd]) + " " + dato_kort(a) + " " + klokke(a);
}

// «15 t», «42 min», «3 døgn»
inline std::string varighet(ms_t d) {
  if (d < 0) d = 0;
  if (d >= 3 * DOGN) return std::to_string(d / DOGN) + " døgn";
  if (d >= TIME) return std::to_string(d / TIME) + " t";
  return std::to_string((d + MIN - 1) / MIN) + " min";
}

// Nedtelling rundes opp: nettopp lagt inn = «48 t», ikke «47 t».
inline std::string igjen(ms_t d) {
  if (d <= 0) return "0 min";
  if (d > TIME) return std::to_string((d + TIME - 1) / TIME) + " t";
  return std::to_string((d + MIN - 1) / MIN) + " min";
}

}  // namespace stafett
