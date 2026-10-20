// Fremkalling til 1-bit: beskjær til format, skaler, strekk nivåer, Atkinson-dithering.
// Atkinson sprer bare 6/8 av feilen, så lyse og mørke flater blir rene og bildet får korn som film.
#pragma once
#include <cstdint>
#include <vector>

namespace morkerom {

struct Gra {
  int w = 0, h = 0;
  std::vector<uint8_t> px;  // 0 = sort, 255 = hvit
  uint8_t at(int x, int y) const { return px[static_cast<size_t>(y) * w + x]; }
};

// Senterbeskjær til målformatet og skaler med arealsnitt.
Gra skaler_fyll(const Gra& inn, int w, int h);

// Strekk slik at 2. og 98. persentil blir 0 og 255. Flate bilder (lite spenn) røres ikke.
void strekk(Gra& g);

// Atkinson til pakket 1-bit (MSB først, 1 = sort), w må være delelig med 8.
std::vector<uint8_t> atkinson(const Gra& g);

// Hele kjeden: inn → w×h 1-bit
std::vector<uint8_t> fremkall(const Gra& inn, int w, int h);

}  // namespace morkerom
