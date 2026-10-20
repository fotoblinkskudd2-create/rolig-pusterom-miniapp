#include "dither.h"

#include <algorithm>

namespace felles {

Gra skaler_fyll(const Gra& inn, int w, int h) {
  Gra ut;
  ut.w = w;
  ut.h = h;
  ut.px.assign(static_cast<size_t>(w) * h, 255);
  if (inn.w <= 0 || inn.h <= 0 || w <= 0 || h <= 0) return ut;
  // Beskjær: største utsnitt med målets sideforhold, sentrert
  int cw = inn.w, ch = inn.w * h / w;
  if (ch > inn.h) { ch = inn.h; cw = inn.h * w / h; }
  const int cx = (inn.w - cw) / 2, cy = (inn.h - ch) / 2;
  for (int y = 0; y < h; ++y) {
    const int y0 = cy + y * ch / h, y1 = std::max(y0 + 1, cy + (y + 1) * ch / h);
    for (int x = 0; x < w; ++x) {
      const int x0 = cx + x * cw / w, x1 = std::max(x0 + 1, cx + (x + 1) * cw / w);
      uint32_t sum = 0, n = 0;
      for (int yy = y0; yy < y1; ++yy)
        for (int xx = x0; xx < x1; ++xx) { sum += inn.at(xx, yy); ++n; }
      ut.px[static_cast<size_t>(y) * w + x] = static_cast<uint8_t>(sum / n);
    }
  }
  return ut;
}

void strekk(Gra& g) {
  if (g.px.empty()) return;
  uint32_t hist[256] = {0};
  for (uint8_t v : g.px) hist[v]++;
  const uint32_t n = static_cast<uint32_t>(g.px.size());
  int lo = 0, hi = 255;
  for (uint32_t c = 0; lo < 255 && (c += hist[lo]) < n / 50;) ++lo;
  for (uint32_t c = 0; hi > 0 && (c += hist[hi]) < n / 50;) --hi;
  if (hi - lo < 24) return;  // flatt: la det være (en grå vegg skal forbli grå)
  for (auto& v : g.px) {
    const int s = (static_cast<int>(v) - lo) * 255 / (hi - lo);
    v = static_cast<uint8_t>(std::clamp(s, 0, 255));
  }
}

std::vector<uint8_t> atkinson(const Gra& g) {
  const int w = g.w, h = g.h;
  std::vector<int16_t> e(g.px.begin(), g.px.end());
  std::vector<uint8_t> ut(static_cast<size_t>(w) * h / 8, 0);
  auto legg = [&](int x, int y, int d) {
    if (x >= 0 && x < w && y < h) e[static_cast<size_t>(y) * w + x] = static_cast<int16_t>(e[static_cast<size_t>(y) * w + x] + d);
  };
  for (int y = 0; y < h; ++y) {
    for (int x = 0; x < w; ++x) {
      const int gammel = e[static_cast<size_t>(y) * w + x];
      const bool hvit = gammel >= 128;
      if (!hvit) ut[(static_cast<size_t>(y) * w + x) >> 3] |= 0x80 >> (x & 7);
      const int d = (gammel - (hvit ? 255 : 0)) / 8;
      legg(x + 1, y, d); legg(x + 2, y, d);
      legg(x - 1, y + 1, d); legg(x, y + 1, d); legg(x + 1, y + 1, d);
      legg(x, y + 2, d);
    }
  }
  return ut;
}

std::vector<uint8_t> fremkall(const Gra& inn, int w, int h, bool strekk_niva) {
  Gra g = skaler_fyll(inn, w, h);
  if (strekk_niva) strekk(g);
  return atkinson(g);
}

}  // namespace felles
