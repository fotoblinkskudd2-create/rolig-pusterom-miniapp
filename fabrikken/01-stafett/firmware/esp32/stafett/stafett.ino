// STAFETT — ESP32-C3-firmware. Bare maskinvare-lim: all logikk ligger i src/ (= firmware/core, testet på vertsmaskin).
// Bygg: make -C firmware esp32   (kopierer core → esp32/stafett/src og kompilerer med arduino-cli)
//
// Pinner (ESP32-C3-MINI-1):
//   EPD  SCK 4  MOSI 6  CS 7  DC 10  RST 2  BUSY 8
//   Hjul A 20  B 21  trykk 9 (= BOOT: hold inne mens USB settes i → oppdateringsmodus)
//   VBUS-deteksjon 5 (spenningsdeler 100k/100k), VBAT ADC 3 (100k/100k)
//   32 kHz-krystall på 0/1, USB-CDC på 18/19
#include <ESPmDNS.h>
#include <LittleFS.h>
#include <WebServer.h>
#include <WiFi.h>
#include <esp_random.h>
#include <esp_sleep.h>
#include <sys/time.h>

#include "epd.h"
#include "src/api.h"
#include "src/web_index.h"  // generert: telefon-UI som streng

using namespace stafett;

constexpr int EPD_SCK = 4, EPD_MOSI = 6, EPD_CS = 7, EPD_DC = 10, EPD_RST = 2, EPD_BUSY = 8;
constexpr int ENC_A = 20, ENC_B = 21, ENC_SW = 9, VBUS = 5, VBAT = 3;
constexpr const char* LOGG = "/logg.jsonl";
constexpr size_t KOMPAKT_GRENSE = 256 * 1024;
constexpr uint32_t WIFI_BATTERI_MS = 10 * 60 * 1000;

Epd epd(EPD_CS, EPD_DC, EPD_RST, EPD_BUSY);
Enhet enhet;
Api api(enhet);
WebServer server(80);
Fb fb;

bool klokke_satt = false;
bool wifi_paa = false;
uint32_t wifi_av_ved = 0;

// ---------- tid ----------
ms_t naa() {
  timeval tv;
  gettimeofday(&tv, nullptr);
  return static_cast<ms_t>(tv.tv_sec) * 1000 + tv.tv_usec / 1000;
}
bool sett_klokke(ms_t t) {
  timeval tv{static_cast<time_t>(t / 1000), static_cast<suseconds_t>((t % 1000) * 1000)};
  settimeofday(&tv, nullptr);
  klokke_satt = true;
  File f = LittleFS.open("/klokke", "w");  // overlever omstart på batteri (RTC-domenet holder tiden i lett søvn)
  if (f) { f.print(static_cast<long long>(t / 1000)); f.close(); }
  return true;
}

// ---------- lagring ----------
std::string les_linje(File& f) {
  std::string s;
  while (f.available()) {
    const char c = f.read();
    if (c == '\n') break;
    s += c;
  }
  return s;
}

void last_logg() {
  File f = LittleFS.open(LOGG, "r");
  if (!f) return;
  int ok = 0, feil = 0;
  while (f.available()) {
    const std::string l = les_linje(f);
    if (l.empty()) continue;
    (enhet.s.spill_av(l) ? ok : feil)++;
  }
  const size_t str = f.size();
  f.close();
  Serial.printf("logg: %d hendelser, %d ødelagte, %u byte\n", ok, feil, static_cast<unsigned>(str));
  if (str > KOMPAKT_GRENSE) {
    File t = LittleFS.open("/logg.tmp", "w");
    for (const auto& l : enhet.s.kompakt()) { t.print(l.c_str()); t.print('\n'); }
    t.close();
    LittleFS.remove(LOGG);
    LittleFS.rename("/logg.tmp", LOGG);
  }
}

bool skriv_logg(const std::string& l) {
  File f = LittleFS.open(LOGG, "a");
  if (!f) return false;
  const size_t n = f.print(l.c_str()) + f.print('\n');
  f.close();
  return n == l.size() + 1;
}

std::string les_eller_lag(const char* sti, size_t lengde, const char* alfabet) {
  File f = LittleFS.open(sti, "r");
  if (f) { std::string s = les_linje(f); f.close(); if (s.size() == lengde) return s; }
  std::string s;
  const size_t n = strlen(alfabet);
  for (size_t i = 0; i < lengde; ++i) s += alfabet[esp_random() % n];
  f = LittleFS.open(sti, "w");
  f.print(s.c_str());
  f.close();
  return s;
}

// ---------- nett ----------
void wifi_start() {
  if (wifi_paa) return;
  WiFi.mode(WIFI_AP);
  WiFi.softAP(enhet.ctx.ap_navn.c_str(), enhet.ctx.ap_pass.c_str());
  MDNS.begin("stafett");
  MDNS.addService("http", "tcp", 80);
  server.begin();
  wifi_paa = true;
}
void wifi_stopp() {
  if (!wifi_paa) return;
  server.stop();
  MDNS.end();
  WiFi.softAPdisconnect(true);
  WiFi.mode(WIFI_OFF);
  wifi_paa = false;
}

void http() {
  std::string sti = server.uri().c_str();
  for (int i = 0; i < server.args(); ++i) {
    if (server.argName(i) == "plain") continue;
    sti += (sti.find('?') == std::string::npos ? "?" : "&");
    sti += server.argName(i).c_str();
    sti += "=";
    sti += server.arg(i).c_str();
  }
  const char* m = server.method() == HTTP_POST ? "POST" : server.method() == HTTP_GET ? "GET" : "ANNET";
  const Svar s = api.handle(m, sti, server.arg("plain").c_str(), server.header("X-Stafett-Nokkel").c_str(), naa());
  server.sendHeader("Cache-Control", "no-store");
  server.send_P(s.kode, s.type.c_str(), s.kropp.data(), s.kropp.size());
}

// ---------- hjul ----------
volatile int8_t enc_steg = 0;
void IRAM_ATTR enc_isr() {
  static uint8_t forrige = 0;
  static int8_t sum = 0;
  static const int8_t tabell[16] = {0, -1, 1, 0, 1, 0, 0, -1, -1, 0, 0, 1, 0, 1, -1, 0};
  forrige = ((forrige << 2) | (digitalRead(ENC_A) << 1) | digitalRead(ENC_B)) & 0x0F;
  sum += tabell[forrige];
  if (sum >= 4) { enc_steg++; sum = 0; }      // ett hakk = 4 kvadraturtilstander
  else if (sum <= -4) { enc_steg--; sum = 0; }
}

uint32_t trykk_start = 0;
bool trykk_nede = false;

void les_hjul() {
  noInterrupts();
  const int8_t steg = enc_steg;
  enc_steg = 0;
  interrupts();
  if (steg) enhet.vri(steg, naa());

  const bool nede = digitalRead(ENC_SW) == LOW;
  if (nede && !trykk_nede) { trykk_start = millis(); trykk_nede = true; }
  if (!nede && trykk_nede && millis() - trykk_start > 30) {
    trykk_nede = false;
    const uint32_t varighet = millis() - trykk_start;
    if (!klokke_satt && varighet < HOLD_QR) enhet.hold(HOLD_QR, naa());  // uten klokke: vis tilkobling
    else enhet.hold(varighet, naa());
    if (!digitalRead(VBUS)) { wifi_start(); wifi_av_ved = millis() + WIFI_BATTERI_MS; }
  }
}

// ---------- oppstart ----------
void setup() {
  Serial.begin(115200);
  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  pinMode(ENC_SW, INPUT_PULLUP);
  pinMode(VBUS, INPUT);
  attachInterrupt(ENC_A, enc_isr, CHANGE);
  attachInterrupt(ENC_B, enc_isr, CHANGE);
  analogReadResolution(12);

  LittleFS.begin(true);
  if (naa() > 1700000000000LL) klokke_satt = true;  // RTC holdt tiden gjennom lett søvn / myk omstart
  else {
    File k = LittleFS.open("/klokke", "r");
    if (k) {  // sist kjente tid: bedre enn 1970, men ikke «satt»
      const long long s = atoll(les_linje(k).c_str());
      k.close();
      timeval tv{static_cast<time_t>(s), 0};
      settimeofday(&tv, nullptr);
    }
  }

  const std::string id = les_eller_lag("/id", 4, "0123456789ABCDEF");
  enhet.ctx.ap_navn = "Stafett-" + id;
  enhet.ctx.ap_pass = les_eller_lag("/appass", 12, "abcdefghjkmnpqrstuvwxyz23456789");
  enhet.ctx.nokkel = les_eller_lag("/nokkel", 16, "abcdefghjkmnpqrstuvwxyz23456789");
  enhet.ctx.url = "stafett.local";

  enhet.s.skriv = skriv_logg;
  last_logg();
  enhet.slett_alt = []() {
    LittleFS.remove(LOGG);
    LittleFS.remove("/nokkel");  // ny nøkkel: gamle telefoner mister tilgang
    ESP.restart();
  };

  api.nokkel = enhet.ctx.nokkel;
  api.index_html = []() { return std::string(WEB_INDEX); };
  api.sett_klokke = sett_klokke;
  const char* hoder[] = {"X-Stafett-Nokkel"};
  server.collectHeaders(hoder, 1);
  server.onNotFound(http);

  epd.begin(EPD_SCK, EPD_MOSI);
  if (!klokke_satt) enhet.hold(HOLD_QR, naa());
  enhet.tick(naa());
  enhet.tegn_til(fb);
  epd.full(fb.buf);

  if (digitalRead(VBUS)) wifi_start();
}

void loop() {
  const bool usb = digitalRead(VBUS);
  if (usb) {
    wifi_start();
    wifi_av_ved = 0;
  } else if (wifi_paa && wifi_av_ved && millis() > wifi_av_ved) {
    wifi_stopp();
  }
  if (wifi_paa) server.handleClient();
  les_hjul();

  const int pst = usb ? -1 : constrain(map(analogReadMilliVolts(VBAT) * 2, 3300, 4150, 0, 100), 0, 100);
  if (pst != enhet.ctx.batteri) { enhet.ctx.batteri = pst; enhet.skitten = true; }
  enhet.tick(naa());
  if (enhet.skitten) {
    enhet.tegn_til(fb);
    epd.delvis(fb.buf);
  }

  if (!usb && !wifi_paa && !trykk_nede) {
    // Batteri: lett søvn til neste hele 5. minutt eller til hjulet rører seg.
    epd.sov();
    const ms_t t = naa();
    const ms_t til = (t / (5 * MIN) + 1) * (5 * MIN) - t;
    gpio_wakeup_enable(static_cast<gpio_num_t>(ENC_SW), GPIO_INTR_LOW_LEVEL);
    gpio_wakeup_enable(static_cast<gpio_num_t>(ENC_A), digitalRead(ENC_A) ? GPIO_INTR_LOW_LEVEL : GPIO_INTR_HIGH_LEVEL);
    esp_sleep_enable_gpio_wakeup();
    esp_sleep_enable_timer_wakeup(static_cast<uint64_t>(til) * 1000);
    esp_light_sleep_start();
  } else {
    delay(5);
  }
}
