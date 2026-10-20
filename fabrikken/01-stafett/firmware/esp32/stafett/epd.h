// Minimal driver for 4,2" 400×300 SSD1683 (Good Display GDEY042T81 og kloner).
// Kommandosekvenser etter SSD1683-databladet og GxEPD2s GDEY042T81-driver.
#pragma once
#include <Arduino.h>
#include <SPI.h>

class Epd {
 public:
  static constexpr int W = 400, H = 300, BYTES = W * H / 8;

  Epd(int cs, int dc, int rst, int busy) : cs_(cs), dc_(dc), rst_(rst), busy_(busy) {}

  void begin(int sck, int mosi) {
    pinMode(cs_, OUTPUT);
    pinMode(dc_, OUTPUT);
    pinMode(rst_, OUTPUT);
    pinMode(busy_, INPUT);
    digitalWrite(cs_, HIGH);
    SPI.begin(sck, -1, mosi, cs_);
    init();
  }

  // Full oppfrisking: blinker, fjerner spøkelser. Kjøres ved oppstart og hver 30. gang.
  void full(const uint8_t* fb) {
    if (sover_) init();
    ram(0x26, fb);  // «forrige» = nåværende, så neste delvise blir riktig
    ram(0x24, fb);
    cmd(0x22); data(0xF7);
    cmd(0x20);
    vent(5000);
    delvise_ = 0;
  }

  // Delvis oppfrisking (~0,4 s, ingen blink).
  void delvis(const uint8_t* fb) {
    if (sover_) { full(fb); return; }
    if (++delvise_ > 30) { full(fb); return; }
    cmd(0x3C); data(0x80);
    cmd(0x21); data(0x00); data(0x00);
    ram(0x24, fb);
    cmd(0x22); data(0xFC);
    cmd(0x20);
    vent(2000);
    ram(0x26, fb);
  }

  void sov() {
    cmd(0x10); data(0x01);
    sover_ = true;
  }

 private:
  int cs_, dc_, rst_, busy_;
  bool sover_ = true;
  int delvise_ = 0;

  void cmd(uint8_t c) {
    SPI.beginTransaction(SPISettings(10000000, MSBFIRST, SPI_MODE0));
    digitalWrite(dc_, LOW);
    digitalWrite(cs_, LOW);
    SPI.transfer(c);
    digitalWrite(cs_, HIGH);
    SPI.endTransaction();
  }
  void data(uint8_t d) {
    SPI.beginTransaction(SPISettings(10000000, MSBFIRST, SPI_MODE0));
    digitalWrite(dc_, HIGH);
    digitalWrite(cs_, LOW);
    SPI.transfer(d);
    digitalWrite(cs_, HIGH);
    SPI.endTransaction();
  }
  void vent(uint32_t maks_ms) {
    const uint32_t t0 = millis();
    while (digitalRead(busy_) == HIGH && millis() - t0 < maks_ms) delay(2);
  }
  void vindu() {
    cmd(0x11); data(0x03);                         // x+, y+
    cmd(0x44); data(0x00); data(W / 8 - 1);
    cmd(0x45); data(0x00); data(0x00); data((H - 1) & 0xFF); data((H - 1) >> 8);
    cmd(0x4E); data(0x00);
    cmd(0x4F); data(0x00); data(0x00);
  }
  // Vår rammebuffer: 1 = sort. SSD1683: 1 = hvit. Inverter i overføringen.
  void ram(uint8_t reg, const uint8_t* fb) {
    vindu();
    cmd(reg);
    SPI.beginTransaction(SPISettings(10000000, MSBFIRST, SPI_MODE0));
    digitalWrite(dc_, HIGH);
    digitalWrite(cs_, LOW);
    for (int i = 0; i < BYTES; ++i) SPI.transfer(static_cast<uint8_t>(~fb[i]));
    digitalWrite(cs_, HIGH);
    SPI.endTransaction();
  }
  void init() {
    digitalWrite(rst_, LOW);
    delay(10);
    digitalWrite(rst_, HIGH);
    delay(10);
    vent(1000);
    cmd(0x12);  // SW-reset
    vent(1000);
    cmd(0x21); data(0x40); data(0x00);
    cmd(0x3C); data(0x05);
    vindu();
    sover_ = false;
  }
};
