# MØRKEROM — netttabell v0.1

*Pinner = `firmware/esp32/morkerom/morkerom.ino`. Endres de der, må de endres her.*

| Nett | Fra | Til | Merknad |
|---|---|---|---|
| `VBUS` | USB-C | lader VIN · deler → GPIO44 | 5 V |
| `VBAT` | LiPo + | lader · P-MOSFET → SYS · deler → GPIO1 (ADC1) | 3,0–4,2 V |
| `3V3` | LDO (ME6211, 500 mA) | ESP32-S3, OV5640 (via 2,8 V/1,5 V LDO-er på modulen), EPD, SD | kamera + Wi-Fi-topper ~400 mA |
| `CAM_XCLK` | GPIO15 | OV5640 XCLK | 20 MHz |
| `CAM_SIOD/SIOC` | GPIO4 / GPIO5 | OV5640 SCCB | I²C-lignende |
| `CAM_D7..D0` | GPIO16 17 18 12 10 8 9 11 | OV5640 Y9..Y2 | DVP 8-bit |
| `CAM_VSYNC/HREF/PCLK` | GPIO6 / 7 / 13 | OV5640 | |
| `SD_CLK/CMD/D0` | GPIO39 / 38 / 40 | microSD | SD_MMC 1-bit, 10k opp på CMD/D0 |
| `EPD_SCK/MOSI` | GPIO21 / GPIO47 | SSD1681 SCL/SDA | 10 MHz |
| `EPD_CS/DC/RST/BUSY` | GPIO41 / 42 / 48 / 2 | SSD1681 | + booster som Stafett (FPC 24p) |
| `UTLOSER` | knapp → GND | GPIO14 | intern pull-up |
| `BLA` | knapp → GND | GPIO0 (BOOT) | hold ved USB-innsetting = nedlastingsmodus; vekker fra dypsøvn (ext1) |
| `HALL` | DRV5032 ut | GPIO3 (RTC) | høy = deksel åpent; vekker fra dypsøvn (ext0) |
| `LED` | GPIO43 | ravgul LED, 1k | blinker mens bildet lagres |

## Hvorfor pinnene er der de er

- **Kamera og PSRAM tar mye.** OPI-PSRAM på N16R8 bruker GPIO35–37, så de er ikke i tabellen.
- **Vekking fra dypsøvn krever RTC-GPIO (0–21).** Dekselet (GPIO3) og bla (GPIO0) er derfor der. Utløseren trenger ikke å vekke: dekselet må uansett åpnes før man kan ta bilder.
- **Ingen blits, ingen mikrofon.** Det er bevisst.
