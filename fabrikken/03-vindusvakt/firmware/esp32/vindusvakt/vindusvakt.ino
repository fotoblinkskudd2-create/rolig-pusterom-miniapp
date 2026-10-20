// VINDUSVAKT — ESP32-S3-firmware. Bare maskinvare-lim: logikken ligger i src/ (= firmware/core, testet på vertsmaskin).
// Bygg: make -C firmware esp32
//
// Pinner (ESP32-S3-WROOM-1-N16R8):
//   OV2640 (DVP): XCLK 15, SIOD 4, SIOC 5, Y9..Y2 16 17 18 12 10 8 9 11, VSYNC 6, HREF 7, PCLK 13
//   EPD UC8179: SCK 21, MOSI 47, CS 41, DC 42, RST 48, BUSY 2
//   Knapp 0 (= BOOT) · linsedeksel: hall-bryter 3 (høy = åpent) · VBAT ADC 1
// Personvern: kameraet leverer 320×240 GRÅTONER rett fra sensoren. Det finnes aldri et originalbilde å lagre.
#include <FFat.h>
#include <Preferences.h>
#include <WebServer.h>
#include <WiFi.h>
#include <esp_camera.h>
#include <esp_random.h>
#include <esp_sleep.h>
#include <sys/time.h>

#include "epd_uc8179.h"
#include "src/api.h"
#include "src/web_index.h"

using namespace vindusvakt;

constexpr int KNAPP = 0, HALL = 3, VBAT = 1;
constexpr uint32_t WIFI_MS = 10 * 60 * 1000;

EpdUC8179 epd(41, 42, 48, 2);
Enhet enhet;
Api api(enhet);
WebServer server(80);
Skjerm skjerm;
RTC_DATA_ATTR int rtc_side = 0;
bool wifi_paa = false;
uint32_t wifi_av = 0;

ms_t naa() { timeval tv; gettimeofday(&tv, nullptr); return static_cast<ms_t>(tv.tv_sec) * 1000 + tv.tv_usec / 1000; }

std::string les(const char* p) {
  File f = FFat.open(p, "r");
  if (!f) return "";
  std::string s(f.size(), '\0');
  f.read(reinterpret_cast<uint8_t*>(&s[0]), s.size());
  f.close();
  return s;
}
void skriv(const char* p, const std::string& d) {
  File f = FFat.open(p, "w");
  if (!f) return;
  f.write(reinterpret_cast<const uint8_t*>(d.data()), d.size());
  f.close();
}

bool fang(Gra& g) {
  camera_config_t c = {};
  c.pin_pwdn = -1; c.pin_reset = -1; c.pin_xclk = 15; c.pin_sccb_sda = 4; c.pin_sccb_scl = 5;
  c.pin_d7 = 16; c.pin_d6 = 17; c.pin_d5 = 18; c.pin_d4 = 12; c.pin_d3 = 10; c.pin_d2 = 8; c.pin_d1 = 9; c.pin_d0 = 11;
  c.pin_vsync = 6; c.pin_href = 7; c.pin_pclk = 13;
  c.xclk_freq_hz = 20000000;
  c.ledc_timer = LEDC_TIMER_0; c.ledc_channel = LEDC_CHANNEL_0;
  c.pixel_format = PIXFORMAT_GRAYSCALE;
  c.frame_size = FRAMESIZE_QVGA;  // 320×240
  c.fb_count = 1;
  c.fb_location = CAMERA_FB_IN_PSRAM;
  c.grab_mode = CAMERA_GRAB_LATEST;
  if (esp_camera_init(&c) != ESP_OK) return false;
  // La automatisk eksponering finne lyset: kast de første rammene
  for (int i = 0; i < 6; ++i) { camera_fb_t* fb = esp_camera_fb_get(); if (fb) esp_camera_fb_return(fb); delay(60); }
  camera_fb_t* fb = esp_camera_fb_get();
  bool ok = false;
  if (fb && fb->len == static_cast<size_t>(fb->width) * fb->height) {
    g.w = fb->width; g.h = fb->height;
    g.px.assign(fb->buf, fb->buf + fb->len);
    ok = true;
  }
  if (fb) esp_camera_fb_return(fb);
  esp_camera_deinit();
  return ok;
}

void http() {
  std::string s = server.uri().c_str();
  for (int i = 0; i < server.args(); ++i) {
    if (server.argName(i) == "plain") continue;
    s += (s.find('?') == std::string::npos ? "?" : "&");
    s += std::string(server.argName(i).c_str()) + "=" + server.arg(i).c_str();
  }
  const char* m = server.method() == HTTP_POST ? "POST" : server.method() == HTTP_GET ? "GET" : "ANNET";
  const Svar r = api.handle(m, s, server.arg("plain").c_str(), server.header("X-Vindusvakt-Nokkel").c_str(), naa());
  server.send_P(r.kode, r.type.c_str(), r.kropp.data(), r.kropp.size());
  wifi_av = millis() + WIFI_MS;
}

std::string tilfeldig(size_t n) {
  static const char* a = "abcdefghjkmnpqrstuvwxyz23456789";
  std::string s;
  for (size_t i = 0; i < n; ++i) s += a[esp_random() % 31];
  return s;
}

void setup() {
  pinMode(KNAPP, INPUT_PULLUP);
  pinMode(HALL, INPUT);
  FFat.begin(true);
  Preferences p;
  p.begin("vindusvakt", false);
  if (!p.isKey("apikey")) { p.putString("apikey", tilfeldig(16).c_str()); p.putString("appass", tilfeldig(12).c_str()); }
  const std::string nokkel = p.getString("apikey").c_str(), pass = p.getString("appass").c_str();
  p.end();

  enhet.arkiv.les(les("/arkiv.bin"));
  Sted st;
  std::string f;
  if (sted_fra_json(les("/sted.json"), st, f)) enhet.ctx.sted = st;
  enhet.ctx.side = static_cast<Side>(rtc_side % static_cast<int>(Side::ANTALL));
  enhet.fang = fang;
  enhet.lagre = []() { skriv("/arkiv.bin", enhet.arkiv.serialiser()); };
  api.nokkel = nokkel;
  api.index_html = []() { return std::string(WEB_INDEX); };
  api.sett_klokke = [](ms_t t) { timeval tv{static_cast<time_t>(t / 1000), 0}; settimeofday(&tv, nullptr); return true; };
  api.lagre_sted = [](const Sted& s) {
    char b[160];
    snprintf(b, sizeof b, "{\"navn\":%s,\"lat_u\":%lld,\"lon_u\":%lld}", json::quote(s.navn).c_str(),
             static_cast<long long>(llround(s.lat * 1e6)), static_cast<long long>(llround(s.lon * 1e6)));
    skriv("/sted.json", b);
  };
  const char* hoder[] = {"X-Vindusvakt-Nokkel"};
  server.collectHeaders(hoder, 1);
  server.onNotFound(http);
  epd.begin(21, 47);

  const auto grunn = esp_sleep_get_wakeup_cause();
  enhet.ctx.privat = !digitalRead(HALL);
  if (grunn == ESP_SLEEP_WAKEUP_EXT0) {             // knappen: neste side, eller hold 3 s = koble til telefonen
    const uint32_t t0 = millis();
    while (!digitalRead(KNAPP) && millis() - t0 < 3500) delay(10);
    if (millis() - t0 >= 3000 || naa() < 1700000000000LL) {
      enhet.ctx.kobling = "Vindusvakt|" + pass + "|vindusvakt.local";
      WiFi.mode(WIFI_AP);
      WiFi.softAP("Vindusvakt", pass.c_str());
      server.begin();
      wifi_paa = true;
      wifi_av = millis() + WIFI_MS;
    } else {
      enhet.knapp(naa());
      rtc_side = static_cast<int>(enhet.ctx.side);
    }
  }
  enhet.tick(naa());   // fanger bildet hvis det er en ny time
  enhet.tegn_til(skjerm);
  epd.full(skjerm.buf);
}

void sov() {
  epd.sov();
  const ms_t t = naa();
  esp_sleep_enable_timer_wakeup(static_cast<uint64_t>((t / TIME + 1) * TIME - t + 2000) * 1000);  // 2 s etter hel time
  esp_sleep_enable_ext0_wakeup(static_cast<gpio_num_t>(KNAPP), 0);
  esp_deep_sleep_start();
}

void loop() {
  if (!wifi_paa) sov();
  server.handleClient();
  if (enhet.skitten) { enhet.tegn_til(skjerm); epd.full(skjerm.buf); }
  if (millis() > wifi_av) { WiFi.mode(WIFI_OFF); wifi_paa = false; enhet.ctx.kobling.clear(); enhet.tegn_til(skjerm); epd.full(skjerm.buf); }
  delay(5);
}
