// Minimal driver for 7,5" 800×480 UC8179 (Good Display GDEY075T7 / Waveshare 7.5" V2-klasse).
// Sekvens etter UC8179-databladet og GxEPD2s GDEY075T7-driver. BUSY er LAV mens panelet jobber.
// Polaritet (KW-modus): 1 = hvit i «ny data» (0x13). Vår buffer: 1 = sort → inverteres. HYPOTESE til sett på panel.
#pragma once
#include <Arduino.h>
#include <SPI.h>

class EpdUC8179 {
 public:
  static constexpr int W = 800, H = 480, BYTES = W * H / 8;
  EpdUC8179(int cs, int dc, int rst, int busy) : cs_(cs), dc_(dc), rst_(rst), busy_(busy) {}

  void begin(int sck, int mosi) {
    pinMode(cs_, OUTPUT); pinMode(dc_, OUTPUT); pinMode(rst_, OUTPUT); pinMode(busy_, INPUT);
    digitalWrite(cs_, HIGH);
    SPI.begin(sck, -1, mosi, cs_);
  }

  // Full oppfrisking (~4 s). Én gang i timen er nok for et vindu.
  void full(const uint8_t* fb) {
    init();
    cmd(0x10); strom(fb, false);   // «gammel» = samme, ingen spøkelser å kompensere for
    cmd(0x13); strom(fb, true);
    cmd(0x12); delay(1); vent(10000);
    cmd(0x02); vent(2000);         // strøm av
  }
  void sov() { cmd(0x07); data(0xA5); }

 private:
  int cs_, dc_, rst_, busy_;
  void skriv(bool d, uint8_t b) {
    SPI.beginTransaction(SPISettings(8000000, MSBFIRST, SPI_MODE0));
    digitalWrite(dc_, d ? HIGH : LOW); digitalWrite(cs_, LOW); SPI.transfer(b); digitalWrite(cs_, HIGH);
    SPI.endTransaction();
  }
  void cmd(uint8_t c) { skriv(false, c); }
  void data(uint8_t d) { skriv(true, d); }
  void vent(uint32_t maks) { const uint32_t t0 = millis(); while (digitalRead(busy_) == LOW && millis() - t0 < maks) delay(5); }
  void strom(const uint8_t* fb, bool inverter) {
    SPI.beginTransaction(SPISettings(8000000, MSBFIRST, SPI_MODE0));
    digitalWrite(dc_, HIGH); digitalWrite(cs_, LOW);
    for (int i = 0; i < BYTES; ++i) SPI.transfer(inverter ? static_cast<uint8_t>(~fb[i]) : fb[i]);
    digitalWrite(cs_, HIGH);
    SPI.endTransaction();
  }
  void init() {
    digitalWrite(rst_, LOW); delay(10); digitalWrite(rst_, HIGH); delay(10);
    cmd(0x01); data(0x07); data(0x07); data(0x3F); data(0x3F);   // strøm
    cmd(0x04); delay(100); vent(2000);                            // strøm på
    cmd(0x00); data(0x1F);                                        // KW-modus
    cmd(0x61); data(0x03); data(0x20); data(0x01); data(0xE0);    // 800 × 480
    cmd(0x15); data(0x00);
    cmd(0x50); data(0x10); data(0x07);
    cmd(0x60); data(0x22);
  }
};
