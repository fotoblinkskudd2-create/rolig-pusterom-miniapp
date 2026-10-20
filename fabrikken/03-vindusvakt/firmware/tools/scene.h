// Simulert utsikt (bare vertsmaskin): fjord, fjell, vann og noen husvinduer.
// Lysstyrken følger ekte solhøyde for sted og tidspunkt. Ingen personer, ingen naboer.
#pragma once
#include <cmath>
#include <cstdint>

#include "dither.h"
#include "sol.h"

namespace vindusvakt {

inline uint32_t hash32(uint32_t x) {
  x ^= x >> 16; x *= 0x7feb352d; x ^= x >> 15; x *= 0x846ca68b; x ^= x >> 16;
  return x;
}

inline double himmel(double elev) {
  if (elev > 12) return 225;
  if (elev > 0) return 150 + elev * 6.2;
  if (elev > -6) return 60 + (elev + 6) * 15;   // borgerlig tusmørke: blåtime
  if (elev > -12) return 14 + (elev + 12) * 7.6;
  return 10;
}

inline felles::Gra utsikt(felles::ms_t t, double lat, double lon, int w = 320, int h = 240) {
  felles::Gra g;
  g.w = w;
  g.h = h;
  g.px.resize(static_cast<size_t>(w) * h);
  const double elev = felles::sol_hoyde(t, lat, lon);
  const double sky = himmel(elev);
  const int horisont = h * 55 / 100;
  const uint32_t time = static_cast<uint32_t>(felles::floordiv(t, felles::TIME));
  const double vaer = 0.75 + 0.25 * ((hash32(time / 6) % 1000) / 1000.0);  // skyer som skifter hver 6. time
  for (int x = 0; x < w; ++x) {
    const double u = static_cast<double>(x) / w;
    const int fjell1 = horisont - static_cast<int>(h * (0.18 + 0.07 * std::sin(u * 7.1 + 1.2) + 0.04 * std::sin(u * 17.3)));
    const int fjell2 = horisont - static_cast<int>(h * (0.08 + 0.04 * std::sin(u * 11.7 + 0.3) + 0.02 * std::sin(u * 31.0)));
    for (int y = 0; y < h; ++y) {
      double v;
      if (y < fjell1) v = sky * vaer * (0.82 + 0.18 * y / horisont);                  // himmel, lysere mot horisonten
      else if (y < fjell2) v = sky * 0.55 + (elev > 0 ? 18 : 0);                     // snødekt fjell bak
      else if (y < horisont) v = sky * 0.30;                                          // nært fjell
      else v = sky * 0.62 * vaer + 10 * std::sin(y * 1.7 + x * 0.05) * (elev > -6 ? 1 : 0.2);  // vann
      const uint32_t r = hash32(static_cast<uint32_t>(x * 7919 + y * 104729) ^ time);
      v += static_cast<double>(r % 9) - 4;                                            // sensorstøy
      g.px[static_cast<size_t>(y) * w + x] = static_cast<uint8_t>(std::fmax(0, std::fmin(255, v)));
    }
  }
  if (elev < -2) {  // husvinduer langs fjæra, tilfeldig på/av per time
    for (int i = 0; i < 6; ++i) {
      if (hash32(time * 31 + i) % 3 == 0) continue;
      const int x = 30 + i * 47, y = horisont - 6 - static_cast<int>(hash32(i) % 6);
      for (int dy = 0; dy < 4; ++dy)
        for (int dx = 0; dx < 4; ++dx) g.px[static_cast<size_t>(y + dy) * w + x + dx] = 255;
      for (int dy = 0; dy < 18; dy += 2) g.px[static_cast<size_t>(horisont + 4 + dy) * w + x + 1] = 150;  // speiling
    }
  }
  return g;
}

}  // namespace vindusvakt
