#!/usr/bin/env python3
"""Generer UV-mønster for glass (prototype).

Prinsipp: punkter som reflekterer UV. Synlig for fugl, nesten usynlig for mennesker.
Regel i prototypen (verifiser mot gjeldende anbefaling før bruk):
    gap mellom kanter horisontalt <= MAX_GAP_X mm
    gap mellom kanter vertikalt   <= MAX_GAP_Y mm
Verktøyet sjekker regelen og skriver ut dekningsgrad.
"""
import argparse
import math

MAX_GAP_X = 100.0   # mm, horisontalt
MAX_GAP_Y = 50.0    # mm, vertikalt


def build(width, height, dx, dy, r):
    cols = int(width // dx) + 1
    rows = int(height // dy) + 1
    points = []
    for j in range(rows):
        for i in range(cols):
            x = i * dx + dx / 2
            y = j * dy + dy / 2
            if x + r <= width and y + r <= height:
                points.append((x, y))
    return points


def check(dx, dy, r):
    gap_x = dx - 2 * r
    gap_y = dy - 2 * r
    ok_x = gap_x <= MAX_GAP_X
    ok_y = gap_y <= MAX_GAP_Y
    return gap_x, gap_y, ok_x and ok_y


def coverage(points, r, width, height):
    area_marked = len(points) * math.pi * r * r
    return area_marked / (width * height)


def to_svg(points, width, height, r):
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.0f} {height:.0f}" '
        f'width="{width:.0f}mm" height="{height:.0f}mm">',
        f'<rect width="{width:.0f}" height="{height:.0f}" fill="#f4f8fb" stroke="#333" stroke-width="4"/>',
    ]
    for x, y in points:
        parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="#1f3a5f"/>')
    parts.append(
        f'<text x="20" y="{height - 20:.0f}" font-size="24" fill="#333">'
        f'UV-mønster {width:.0f} x {height:.0f} mm. Mål i mm. Verifiser regel før bruk.</text>'
    )
    parts.append("</svg>")
    return "\n".join(parts)


def main():
    p = argparse.ArgumentParser(description="Generer UV-mønster for glass")
    p.add_argument("--width", type=float, default=1000.0, help="glassbredde, mm")
    p.add_argument("--height", type=float, default=1000.0, help="glasshøyde, mm")
    p.add_argument("--dx", type=float, default=100.0, help="senter-til-senter horisontalt, mm")
    p.add_argument("--dy", type=float, default=50.0, help="senter-til-senter vertikalt, mm")
    p.add_argument("--r", type=float, default=4.0, help="punktradius, mm")
    p.add_argument("--out", default="pattern.svg", help="utfil (SVG)")
    a = p.parse_args()

    gap_x, gap_y, ok = check(a.dx, a.dy, a.r)
    points = build(a.width, a.height, a.dx, a.dy, a.r)
    cov = coverage(points, a.r, a.width, a.height)

    with open(a.out, "w", encoding="utf-8") as f:
        f.write(to_svg(points, a.width, a.height, a.r))

    print(f"Punkter:            {len(points)}")
    print(f"Gap horisontalt:    {gap_x:.1f} mm  (maks {MAX_GAP_X:.0f} mm)")
    print(f"Gap vertikalt:      {gap_y:.1f} mm  (maks {MAX_GAP_Y:.0f} mm)")
    print(f"Dekning:            {cov * 100:.2f} %")
    print(f"Regel oppfylt:      {'JA' if ok else 'NEI'}")
    print(f"Skrevet:            {a.out}")
    if not ok:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
