#!/usr/bin/env python3
"""Rasteriser Inter til 1-bit bitmap-fonter for e-blekk (400x300).

Skriver firmware/core/fonts.h. Kjøres på nytt når tegnsett eller størrelser endres:
    python3 firmware/tools/genfont.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
INTER = Path("/usr/share/fonts/opentype/inter")
DEJAVU = Path("/usr/share/fonts/truetype/dejavu")

# (navn, fil, piksler, terskel)
FONTS = [
    ("F_BODY", INTER / "Inter-Medium.otf", 16, 120),
    ("F_LABEL", INTER / "Inter-Bold.otf", 12, 120),
    ("F_BIG", INTER / "InterDisplay-Bold.otf", 26, 128),
    ("F_HUGE", INTER / "InterDisplay-Bold.otf", 44, 128),
]
SYMBOL_FALLBACK = {"→", "←", "✓", "…", "·", "–", "—", "×", "°"}
CHARS = [chr(c) for c in range(32, 127)] + list("æøåÆØÅéÉèüöäÜÖÄ«»") + sorted(SYMBOL_FALLBACK)


def render_glyph(font, ch, threshold):
    left, top, right, bottom = font.getbbox(ch)
    adv = round(font.getlength(ch))
    w, h = max(0, right - left), max(0, bottom - top)
    if w == 0 or h == 0:
        return dict(w=0, h=0, x=0, y=0, adv=adv, bits=[])
    img = Image.new("L", (w, h), 0)
    ImageDraw.Draw(img).text((-left, -top), ch, font=font, fill=255)
    px = img.load()
    rows = []
    for y in range(h):
        row = 0
        for x in range(w):
            if px[x, y] >= threshold:
                row |= 1 << x
        rows.append(row)
    # Pakk radvis, LSB først, (w+7)//8 byte per rad
    bpr = (w + 7) // 8
    data = []
    for row in rows:
        for b in range(bpr):
            data.append((row >> (8 * b)) & 0xFF)
    return dict(w=w, h=h, x=left, y=top, adv=adv, bits=data)


def main():
    out = [
        "// GENERERT av tools/genfont.py — ikke rediger for hånd.",
        "#pragma once",
        "#include <cstdint>",
        "namespace stafett {",
        "struct Glyph { uint32_t cp; uint8_t w, h; int8_t x, y; uint8_t adv; uint32_t off; };",
        "struct Font { const Glyph* glyphs; uint16_t count; const uint8_t* bits; uint8_t ascent; uint8_t line; };",
    ]
    for name, path, size, thr in FONTS:
        main_font = ImageFont.truetype(str(path), size)
        sym_font = ImageFont.truetype(str(DEJAVU / ("DejaVuSans-Bold.ttf" if "Bold" in path.name else "DejaVuSans.ttf")), size)
        glyphs, bits = [], []
        for ch in CHARS:
            f = sym_font if ch in SYMBOL_FALLBACK else main_font
            g = render_glyph(f, ch, thr)
            glyphs.append((ord(ch), g, len(bits)))
            bits.extend(g["bits"])
        ascent, descent = main_font.getmetrics()
        lower = name.lower()
        out.append(f"static const uint8_t {lower}_bits[] = {{")
        for i in range(0, len(bits), 24):
            out.append("  " + ",".join(str(b) for b in bits[i:i + 24]) + ",")
        out.append("  0 };")
        out.append(f"static const Glyph {lower}_glyphs[] = {{")
        for cp, g, off in sorted(glyphs, key=lambda t: t[0]):
            out.append(f"  {{{cp},{g['w']},{g['h']},{g['x']},{g['y']},{g['adv']},{off}}},")
        out.append("};")
        out.append(
            f"static const Font {name} = {{ {lower}_glyphs, {len(glyphs)}, {lower}_bits, {ascent}, {ascent + descent} }};"
        )
    out.append("}  // namespace stafett")
    dest = ROOT / "core" / "fonts.h"
    dest.write_text("\n".join(out) + "\n", encoding="utf-8")
    print(f"skrev {dest} ({dest.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
