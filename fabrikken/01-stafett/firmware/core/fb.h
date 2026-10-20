// 1-bit rammebuffer, 400×300, 1 = sort. Samme kode tegner på enheten og i testene.
#pragma once
#include <cstdint>
#include <cstring>
#include <string>
#include <vector>

#include "fonts.h"

namespace stafett {

class Fb {
 public:
  static constexpr int W = 400;
  static constexpr int H = 300;
  static constexpr int BYTES = W * H / 8;
  uint8_t buf[BYTES];

  Fb() { clear(); }
  void clear(bool sort = false) { std::memset(buf, sort ? 0xFF : 0x00, BYTES); }

  void px(int x, int y, bool sort = true) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const int i = (y * W + x) >> 3;
    const uint8_t m = 0x80 >> (x & 7);
    if (sort) buf[i] |= m; else buf[i] &= ~m;
  }
  bool get(int x, int y) const {
    if (x < 0 || y < 0 || x >= W || y >= H) return false;
    return buf[(y * W + x) >> 3] & (0x80 >> (x & 7));
  }
  void fill(int x, int y, int w, int h, bool sort = true) {
    for (int j = y; j < y + h; ++j) for (int i = x; i < x + w; ++i) px(i, j, sort);
  }
  void hline(int x, int y, int w, bool sort = true) { fill(x, y, w, 1, sort); }
  void vline(int x, int y, int h, bool sort = true) { fill(x, y, 1, h, sort); }
  void rect(int x, int y, int w, int h, bool sort = true) {
    hline(x, y, w, sort); hline(x, y + h - 1, w, sort); vline(x, y, h, sort); vline(x + w - 1, y, h, sort);
  }
  // Prikket linje: hver n-te piksel
  void dots(int x, int y, int w, int n = 3, bool sort = true) { for (int i = 0; i < w; i += n) px(x + i, y, sort); }
  // Skravering (diagonal), brukes for «borte»
  void hatch(int x, int y, int w, int h, int n = 4, bool sort = true) {
    for (int j = y; j < y + h; ++j) for (int i = x; i < x + w; ++i) if (((i + j) % n) == 0) px(i, j, sort);
  }
  void circle(int cx, int cy, int r, bool fylt = false, bool sort = true) {
    for (int y = -r; y <= r; ++y)
      for (int x = -r; x <= r; ++x) {
        const int d = x * x + y * y;
        if (fylt ? d <= r * r : (d <= r * r && d > (r - 1) * (r - 1))) px(cx + x, cy + y, sort);
      }
  }
  void line(int x0, int y0, int x1, int y1, bool sort = true) {
    int dx = x1 > x0 ? x1 - x0 : x0 - x1, sx = x0 < x1 ? 1 : -1;
    int dy = -(y1 > y0 ? y1 - y0 : y0 - y1), sy = y0 < y1 ? 1 : -1;
    int err = dx + dy;
    for (;;) {
      px(x0, y0, sort);
      if (x0 == x1 && y0 == y1) break;
      const int e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  // ---------- tekst ----------

  static uint32_t neste_cp(const std::string& s, size_t& i) {
    const unsigned char c = s[i];
    uint32_t cp;
    int n;
    if (c < 0x80) { cp = c; n = 1; }
    else if ((c >> 5) == 0x6) { cp = c & 0x1F; n = 2; }
    else if ((c >> 4) == 0xE) { cp = c & 0x0F; n = 3; }
    else if ((c >> 3) == 0x1E) { cp = c & 0x07; n = 4; }
    else { ++i; return '?'; }
    if (i + n > s.size()) { i = s.size(); return '?'; }
    for (int k = 1; k < n; ++k) cp = (cp << 6) | (static_cast<unsigned char>(s[i + k]) & 0x3F);
    i += n;
    return cp;
  }

  static const Glyph* glyph(const Font& f, uint32_t cp) {
    int lo = 0, hi = f.count - 1;
    while (lo <= hi) {
      const int mid = (lo + hi) / 2;
      if (f.glyphs[mid].cp == cp) return &f.glyphs[mid];
      if (f.glyphs[mid].cp < cp) lo = mid + 1; else hi = mid - 1;
    }
    return cp == '?' ? nullptr : glyph(f, '?');
  }

  static int width(const Font& f, const std::string& s) {
    int w = 0;
    for (size_t i = 0; i < s.size();) {
      const Glyph* g = glyph(f, neste_cp(s, i));
      if (g) w += g->adv;
    }
    return w;
  }

  // Tegner med grunnlinje-y. Returnerer x etter siste tegn.
  int text(const Font& f, int x, int baseline, const std::string& s, bool sort = true) {
    const int top = baseline - f.ascent;
    for (size_t i = 0; i < s.size();) {
      const Glyph* g = glyph(f, neste_cp(s, i));
      if (!g) continue;
      const int bpr = (g->w + 7) / 8;
      const uint8_t* bits = f.bits + g->off;
      for (int y = 0; y < g->h; ++y)
        for (int xx = 0; xx < g->w; ++xx)
          if (bits[y * bpr + (xx >> 3)] & (1 << (xx & 7))) px(x + g->x + xx, top + g->y + y, sort);
      x += g->adv;
    }
    return x;
  }
  int text_r(const Font& f, int right, int baseline, const std::string& s, bool sort = true) {
    return text(f, right - width(f, s), baseline, s, sort);
  }
  int text_c(const Font& f, int cx, int baseline, const std::string& s, bool sort = true) {
    return text(f, cx - width(f, s) / 2, baseline, s, sort);
  }

  // Avkort med «…» til maks bredde
  static std::string fit(const Font& f, const std::string& s, int maks) {
    if (width(f, s) <= maks) return s;
    std::string ut;
    const int ell = width(f, "…");
    for (size_t i = 0; i < s.size();) {
      const size_t start = i;
      neste_cp(s, i);
      std::string prove = ut + s.substr(start, i - start);
      if (width(f, prove) + ell > maks) break;
      ut = prove;
    }
    while (!ut.empty() && ut.back() == ' ') ut.pop_back();
    return ut + "…";
  }

  // Ordbryting. Respekterer \n. Siste linje avkortes med «…» hvis teksten ikke får plass.
  static std::vector<std::string> wrap(const Font& f, const std::string& s, int maks, int linjer) {
    std::vector<std::string> ut;
    std::string linje;
    size_t i = 0;
    bool kuttet = false;
    auto ny_linje = [&]() {
      if (static_cast<int>(ut.size()) >= linjer) { kuttet = true; return false; }
      ut.push_back(linje);
      linje.clear();
      return true;
    };
    while (i < s.size() && !kuttet) {
      if (s[i] == '\n') { if (!ny_linje()) break; ++i; continue; }
      size_t j = i;
      while (j < s.size() && s[j] != ' ' && s[j] != '\n') ++j;
      std::string ord = s.substr(i, j - i);
      std::string prove = linje.empty() ? ord : linje + " " + ord;
      if (width(f, prove) <= maks) {
        linje = prove;
      } else if (linje.empty()) {
        // Ordet er bredere enn linja alene: bryt på tegn
        std::string del;
        for (size_t k = 0; k < ord.size();) {
          const size_t st = k;
          neste_cp(ord, k);
          std::string p = del + ord.substr(st, k - st);
          if (width(f, p) > maks) { linje = del; if (!ny_linje()) break; del = ord.substr(st, k - st); }
          else del = p;
        }
        linje = del;
      } else {
        if (!ny_linje()) break;
        linje = ord;
      }
      i = j;
      if (i < s.size() && s[i] == ' ') ++i;
    }
    if (!kuttet && !linje.empty()) {
      if (static_cast<int>(ut.size()) < linjer) ut.push_back(linje);
      else kuttet = true;
    }
    if (kuttet && !ut.empty()) ut.back() = fit(f, ut.back() + " …", maks);
    return ut;
  }

  // Portable bitmap (P4) for test og simulator
  std::string pbm() const {
    std::string o = "P4\n" + std::to_string(W) + " " + std::to_string(H) + "\n";
    o.append(reinterpret_cast<const char*>(buf), BYTES);
    return o;
  }
};

}  // namespace stafett
