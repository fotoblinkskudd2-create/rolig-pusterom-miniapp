// Minimal driver for 1,54" 200×200 SSD1681 (Good Display GDEY0154D67 og kloner).
// Kommandosekvenser etter SSD1681-databladet og GxEPD2s GDEY0154D67-driver.
#pragma once
#include <Arduino.h>
#include <SPI.h>

class Epd1681 {
 public:
  static constexpr int W = 200, H = 200, BYTES = W * H / 8;

  Epd1681(int cs, int dc, int rst, int busy) : cs_(cs), dc_(dc), rst_(rst), busy_(busy) {}

  void begin(int sck, int mosi) {
    pinMode(cs_, OUTPUT);
    pinMode(dc_, OUTPUT);
    pinMode(rst_, OUTPUT);
    pinMode(busy_, INPUT);
    digitalWrite(cs_, HIGH);
    SPI.begin(sck, -1, mosi, cs_);
  }

  void full(const uint8_t* fb) {
    init();
    ram(0x26, fb);
    ram(0x24, fb);
    cmd(0x22); data(0xF7);
    cmd(0x20);
    vent(4000);
    delvise_ = 0;
  }

  // Delvis: ingen blink. Hver 20. gang full, mot spøkelser.
  void delvis(const uint8_t* fb) {
    if (sover_ || ++delvise_ > 20) { full(fb); return; }
    ram(0x24, fb);
    cmd(0x22); data(0xFF);
    cmd(0x20);
    vent(1500);
    ram(0x26, fb);
  }

  void sov() { cmd(0x10); data(0x01); sover_ = true; }

 private:
  int cs_, dc_, rst_, busy_;
  bool sover_ = true;
  int delvise_ = 0;

  void skriv(bool er_data, uint8_t b) {
    SPI.beginTransaction(SPISettings(10000000, MSBFIRST, SPI_MODE0));
    digitalWrite(dc_, er_data ? HIGH : LOW);
    digitalWrite(cs_, LOW);
    SPI.transfer(b);
    digitalWrite(cs_, HIGH);
    SPI.endTransaction();
  }
  void cmd(uint8_t c) { skriv(false, c); }
  void data(uint8_t d) { skriv(true, d); }
  void vent(uint32_t maks) {
    const uint32_t t0 = millis();
    while (digitalRead(busy_) == HIGH && millis() - t0 < maks) delay(2);
  }
  void vindu() {
    cmd(0x11); data(0x03);
    cmd(0x44); data(0x00); data(W / 8 - 1);
    cmd(0x45); data(0x00); data(0x00); data(H - 1); data(0x00);
    cmd(0x4E); data(0x00);
    cmd(0x4F); data(0x00); data(0x00);
  }
  void ram(uint8_t reg, const uint8_t* fb) {  // vår buffer: 1 = sort; SSD1681: 1 = hvit
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
    digitalWrite(rst_, LOW); delay(10);
    digitalWrite(rst_, HIGH); delay(10);
    vent(1000);
    cmd(0x12);                                            // SW-reset
    vent(1000);
    cmd(0x01); data(H - 1); data(0x00); data(0x00);       // driver output
    cmd(0x3C); data(0x05);                                // kant
    cmd(0x18); data(0x80);                                // intern temperaturføler
    vindu();
    sover_ = false;
  }
};
