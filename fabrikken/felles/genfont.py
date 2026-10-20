#!/usr/bin/env python3
"""Rasteriser Inter til 1-bit bitmap-fonter for e-blekk.

    python3 felles/genfont.py <ut/fonts.h> NAVN:fil:px:terskel [NAVN:fil:px:terskel ...]
    fil = Inter-filnavn uten sti, f.eks. Inter-Medium.otf
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

INTER = Path("/usr/share/fonts/opentype/inter")
DEJAVU = Path("/usr/share/fonts/truetype/dejavu")

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
    dest = Path(sys.argv[1])
    fonts = []
    for spec in sys.argv[2:]:
        name, fil, px, thr = spec.split(":")
        fonts.append((name, INTER / fil, int(px), int(thr)))
    out = [
        "// GENERERT av felles/genfont.py — ikke rediger for hånd.",
        "// " + " ".join(sys.argv[2:]),
        "#pragma once",
        '#include "font.h"',
        "namespace felles {",
    ]
    for name, path, size, thr in fonts:
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
    out.append("}  // namespace felles")
    dest.write_text("\n".join(out) + "\n", encoding="utf-8")
    print(f"skrev {dest} ({dest.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
