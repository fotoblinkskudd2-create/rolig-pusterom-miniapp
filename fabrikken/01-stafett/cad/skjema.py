#!/usr/bin/env python3
"""Koblingsskjema (blokknivå med pinner) for Stafett v0.1. Skriver render/skjema.png|svg og ../SKJEMA.md (netttabell).

Pinnene er de samme som i firmware/esp32/stafett/stafett.ino — endres de der, må de endres her.
"""
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyBboxPatch  # noqa: E402

HER = Path(__file__).resolve().parent
INK, PAPIR, DEMP = "#1e1e1c", "#ffffff", "#6b6a64"

NETT = [
    # nett, fra, til, merknad
    ("VBUS", "USB-C VBUS", "MCP73831 VIN · Schottky → SYS · deler → GPIO5", "5 V"),
    ("VBAT", "LiPo +", "MCP73831 VBAT · P-MOSFET → SYS · deler → GPIO3", "3,0–4,2 V"),
    ("SYS", "Schottky/P-MOSFET", "ME6211 VIN", "lastdeling: USB når den finnes"),
    ("3V3", "ME6211 VOUT", "ESP32 3V3 · EPD VCI/VDDIO · EC11 pull-ups", "500 mA maks"),
    ("EPD_SCK", "ESP32 GPIO4", "FPC SCL", "SPI 10 MHz"),
    ("EPD_MOSI", "ESP32 GPIO6", "FPC SDA", ""),
    ("EPD_CS", "ESP32 GPIO7", "FPC CS#", ""),
    ("EPD_DC", "ESP32 GPIO10", "FPC D/C#", ""),
    ("EPD_RST", "ESP32 GPIO2", "FPC RES#", "strapping: ekstern 10k opp"),
    ("EPD_BUSY", "FPC BUSY", "ESP32 GPIO8", "strapping: må være høy kun ved nedlasting"),
    ("EPD_GDR/RESE", "FPC GDR/RESE", "boost: MOSFET-port / strømføler 2,2 Ω", "som Waveshare-driverkort"),
    ("ENC_A", "EC11 A", "ESP32 GPIO20", "intern pull-up, 10 nF til GND"),
    ("ENC_B", "EC11 B", "ESP32 GPIO21", "intern pull-up, 10 nF til GND"),
    ("ENC_SW", "EC11 SW", "ESP32 GPIO9 (BOOT)", "hold ved USB-innsetting = nedlastingsmodus"),
    ("XTAL32", "32,768 kHz krystall", "ESP32 GPIO0/GPIO1", "2× 12 pF"),
    ("USB_D±", "USB-C D+/D−", "ESP32 GPIO19/GPIO18", "USB-CDC for logg og flash"),
    ("CC1/CC2", "USB-C CC", "5,1 kΩ til GND", "ellers gir USB-C-ladere ingen strøm"),
]


def blokk(ax, x, y, w, h, tittel, pinner_v=(), pinner_h=(), fyll="#f3f1ec"):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.15", fc=fyll, ec=INK, lw=1.2))
    ax.text(x + w / 2, y + h - 0.35, tittel, ha="center", va="top", fontsize=9, fontweight="bold")
    for i, p in enumerate(pinner_v):
        yy = y + h - 1.0 - i * 0.42
        ax.text(x + 0.12, yy, p, ha="left", va="center", fontsize=6.5, family="DejaVu Sans Mono")
    for i, p in enumerate(pinner_h):
        yy = y + h - 1.0 - i * 0.42
        ax.text(x + w - 0.12, yy, p, ha="right", va="center", fontsize=6.5, family="DejaVu Sans Mono")


def pil(ax, a, b, tekst="", farge=INK):
    ax.annotate("", b, a, arrowprops=dict(arrowstyle="-|>", lw=1.0, color=farge, shrinkA=2, shrinkB=2))
    if tekst:
        ax.text((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.15, tekst, ha="center", va="bottom", fontsize=6.5, color=DEMP)


def main():
    plt.rcParams.update({"font.family": "Inter"})
    fig, ax = plt.subplots(figsize=(14, 8.5))
    ax.set_xlim(0, 28)
    ax.set_ylim(0, 17)
    ax.axis("off")
    ax.text(0.3, 16.6, "STAFETT v0.1 — koblingsskjema (blokknivå)", fontsize=14, fontweight="bold")
    ax.text(0.3, 16.05, "Kilde: cad/skjema.py · pinner = firmware/esp32/stafett/stafett.ino · 20.10.2026", fontsize=8, color=DEMP)

    def py(top, i):  # y for pinne i i en blokk med gitt toppkant
        return top - 1.0 - i * 0.42

    def ledning(pkt, tekst="", tpos=0, pil_slutt=True):
        xs, ys = zip(*pkt)
        ax.plot(xs, ys, color=INK, lw=0.9, solid_capstyle="round")
        if pil_slutt:
            (x1, y1), (x2, y2) = pkt[-2], pkt[-1]
            ax.annotate("", (x2, y2), (x1 + (x2 - x1) * 0.6, y1 + (y2 - y1) * 0.6), arrowprops=dict(arrowstyle="-|>", lw=0.9, color=INK))
        if tekst:
            (x1, y1), (x2, y2) = pkt[tpos], pkt[tpos + 1]
            ax.text((x1 + x2) / 2, (y1 + y2) / 2 + 0.1, tekst, ha="center", va="bottom", fontsize=6.5, color=DEMP)

    def punkt(x, y):
        ax.plot([x], [y], "o", ms=3.2, color=INK)

    # blokker (x, y, b, h)
    blokk(ax, 0.5, 10.7, 4.2, 4.0, "USB-C", pinner_h=["D+", "D−", "VBUS", "CC1 5k1↓", "CC2 5k1↓", "GND"])
    blokk(ax, 6.0, 11.3, 4.4, 2.6, "MCP73831 lader", pinner_v=["VIN", "PROG 2k → 500 mA"], pinner_h=["VBAT", "STAT"])
    blokk(ax, 6.0, 7.9, 4.4, 2.8, "LiPo 1200 mAh", pinner_v=["503450", "m/ beskyttelse"], pinner_h=["+", "−"], fyll="#efe6cf")
    blokk(ax, 11.6, 10.2, 4.2, 3.2, "Strømvei", pinner_v=["VBUS → Schottky", "VBAT → P-MOSFET"], pinner_h=["SYS"])
    blokk(ax, 11.6, 6.6, 4.2, 2.6, "ME6211 LDO", pinner_v=["VIN ← SYS"], pinner_h=["3V3"])
    blokk(ax, 17.2, 5.0, 5.0, 9.4, "ESP32-C3-MINI-1", pinner_v=[
        "GPIO19 USB_D+", "GPIO18 USB_D−", "GPIO5  VBUS/2", "GPIO3  VBAT/2", "GPIO9  ENC_SW", "GPIO20 ENC_A", "GPIO21 ENC_B", "3V3", "GND"],
        pinner_h=["GPIO4  SCK", "GPIO6  MOSI", "GPIO7  CS", "GPIO10 DC", "GPIO2  RST", "GPIO8  BUSY"], fyll="#e7ebe6")
    blokk(ax, 17.6, 14.75, 4.2, 1.15, "32,768 kHz ±20 ppm", fyll="#f3f1ec")
    blokk(ax, 23.4, 8.0, 4.2, 6.4, "E-blekk 4,2\"", pinner_v=["SCL", "SDA", "CS#", "D/C#", "RES#", "BUSY"], fyll="#f3f1ec")
    ax.text(25.5, 8.4, "FPC 24p · 3V3", ha="center", fontsize=6.5, color=DEMP)
    blokk(ax, 23.4, 4.0, 4.2, 3.2, "Boost (EPD)", pinner_v=["10 µH · Si1308", "3× MBR0530", "GDR · RESE"], fyll="#f3f1ec")
    blokk(ax, 11.6, 1.6, 4.2, 3.6, "EC11 hjul", pinner_h=["SW", "A", "B", "C → GND"])
    blokk(ax, 0.5, 1.6, 4.2, 3.6, "NTAG213", pinner_v=["passiv", "ingen kobling", "URL:", "stafett.local/kjol"], fyll="#ffffff")

    usb_t, lad_t, lipo_t, sv_t, ldo_t, esp_t, ec_t = 14.7, 13.9, 10.7, 13.4, 9.2, 14.4, 5.2
    # USB D± → toppfelt → ESP
    ledning([(4.7, py(usb_t, 0.5)), (5.2, py(usb_t, 0.5)), (5.2, 15.65), (16.9, 15.65), (16.9, py(esp_t, 0.5)), (17.2, py(esp_t, 0.5))], "USB D±", 2)
    # VBUS → lader, → strømvei, → ESP-deler
    ledning([(4.7, py(usb_t, 2)), (6.0, py(lad_t, 0))], "VBUS", 0)
    punkt(5.6, py(usb_t, 2))
    ledning([(5.6, py(usb_t, 2)), (5.6, 15.25), (11.2, 15.25), (11.2, py(sv_t, 0)), (11.6, py(sv_t, 0))], "VBUS", 1)
    punkt(11.2, 15.25)
    ledning([(11.2, 15.25), (16.6, 15.25), (16.6, py(esp_t, 2)), (17.2, py(esp_t, 2))], "÷2", 0)
    # VBAT
    ledning([(10.4, py(lad_t, 0)), (10.9, py(lad_t, 0)), (10.9, py(lipo_t, 0)), (10.4, py(lipo_t, 0))], "VBAT", 0)
    punkt(10.9, py(sv_t, 1))
    ledning([(10.9, py(sv_t, 1)), (11.6, py(sv_t, 1))])
    punkt(10.9, py(lipo_t, 0))
    ledning([(10.9, py(lipo_t, 0)), (10.9, 6.15), (16.3, 6.15), (16.3, py(esp_t, 3)), (17.2, py(esp_t, 3))], "VBAT ÷2", 1)
    # SYS → LDO → 3V3 → ESP
    ledning([(13.7, 10.2), (13.7, 9.2)], "SYS", 0)
    ledning([(15.8, py(ldo_t, 0)), (16.0, py(ldo_t, 0)), (16.0, py(esp_t, 7)), (17.2, py(esp_t, 7))], "3V3", 1)
    # EC11 → ESP
    ledning([(15.8, py(ec_t, 1)), (16.6, py(ec_t, 1)), (16.6, py(esp_t, 5)), (17.2, py(esp_t, 5))], "SW · A · B", 0)
    # Krystall
    ledning([(19.7, 14.75), (19.7, 14.4)])
    ax.text(19.9, 14.5, "GPIO0/1", fontsize=6.5, color=DEMP, va="center")
    # SPI + kontroll
    for i in range(6):
        y = py(esp_t, i)
        ledning([(22.2, y), (23.4, y)], pil_slutt=i != 5)
        if i == 5:
            ax.annotate("", (22.2, y), (22.8, y), arrowprops=dict(arrowstyle="-|>", lw=0.9, color=INK))
    ledning([(25.5, 8.0), (25.5, 7.2)], "GDR/RESE", 0)

    ax.text(0.5, 0.6, "Merk: skjemaet er på blokknivå for prototyp. KiCad-skjema + PCB er neste steg (HULL.md).", fontsize=8, color=DEMP)
    for ext in ("png", "svg"):
        fig.savefig(HER / "render" / f"skjema.{ext}", dpi=170, bbox_inches="tight", facecolor=PAPIR)

    L = ["# STAFETT — netttabell v0.1\n", "*Generert av `cad/skjema.py`. Pinner = `firmware/esp32/stafett/stafett.ino`.*\n",
         "![Skjema](cad/render/skjema.png)\n", "| Nett | Fra | Til | Merknad |", "|---|---|---|---|"]
    L += [f"| `{n}` | {a} | {b} | {m} |" for n, a, b, m in NETT]
    L.append("\n## Strapping-pinner på ESP32-C3 (hvorfor pinnene er der de er)\n")
    L.append("- **GPIO2, GPIO8, GPIO9** bestemmer oppstartsmodus. GPIO9 lav ved oppstart = nedlastingsmodus. Hjulknappen ligger der med vilje: "
             "*hold hjulet inne mens du setter i USB* = oppdater fastvaren. Ingen ekstra knapp.")
    L.append("- **GPIO0/1** går til 32 kHz-krystallen. Uten den driver klokka ±5 %, og en 48-timers nedtelling kan bomme med over to timer.")
    L.append("- **VBUS-deteksjon på GPIO5**, ikke GPIO9: ellers ville enheten startet i nedlastingsmodus hver gang den ble skrudd på fra batteri.")
    (HER.parent / "SKJEMA.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    print("skrev render/skjema.png|svg og SKJEMA.md")


if __name__ == "__main__":
    main()
