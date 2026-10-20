// Bitmap-font for 1-bit skjermer. Data genereres av genfont.py.
#pragma once
#include <cstdint>

namespace felles {
struct Glyph { uint32_t cp; uint8_t w, h; int8_t x, y; uint8_t adv; uint32_t off; };
struct Font { const Glyph* glyphs; uint16_t count; const uint8_t* bits; uint8_t ascent; uint8_t line; };
}  // namespace felles
