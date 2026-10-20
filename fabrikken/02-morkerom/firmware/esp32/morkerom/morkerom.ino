// MØRKEROM — ESP32-S3-firmware. Bare maskinvare-lim: logikken ligger i src/ (= firmware/core, testet på vertsmaskin).
// Bygg: make -C firmware esp32
//
// Pinner (ESP32-S3-WROOM-1-N16R8):
//   OV5640 (DVP): XCLK 15, SIOD 4, SIOC 5, Y9..Y2 16 17 18 12 10 8 9 11, VSYNC 6, HREF 7, PCLK 13
//   microSD (SD_MMC 1-bit): CLK 39, CMD 38, D0 40
//   EPD SSD1681: SCK 21, MOSI 47, CS 41, DC 42, RST 48, BUSY 2
//   Utløser 14 · Bla 0 (= BOOT: hold inne mens USB settes i → oppdateringsmodus)
//   Deksel: hall-bryter (DRV5032) 3, høy = åpent · LED 43 · VBUS 44 · VBAT ADC 1 (100k/100k)
#include <Preferences.h>
#include <SD_MMC.h>
#include <WebServer.h>
#include <WiFi.h>
#include <esp_camera.h>
#include <esp_random.h>
#include <esp_sleep.h>
#include <img_converters.h>
#include <sys/time.h>

#include "epd1681.h"
#include "src/api.h"
#include "src/dither.h"
#include "src/krypt.h"
#include "src/web_index.h"

using namespace morkerom;

constexpr int UTLOSER = 14, BLA = 0, HALL = 3, LED = 43, VBUS = 44, VBAT = 1;
constexpr const char* MAPPE = "/MORKEROM";
constexpr uint32_t WIFI_MS = 10 * 60 * 1000;
constexpr uint32_t VAAKEN_MS = 45 * 1000;  // deksel lukket: hvor lenge den holder seg våken etter siste trykk

Epd1681 epd(41, 42, 48, 2);
Enhet enhet;
Api api(enhet);
WebServer server(80);
Skjerm skjerm;
Nokkel nokkel;
std::map<uint32_t, std::vector<uint8_t>> d1;
RTC_DATA_ATTR int64_t rtc_sist_sjekket = 0;
bool wifi_paa = false, kamera_paa = false;
uint32_t wifi_av = 0, sist_aktiv = 0;

ms_t naa() {
  timeval tv;
  gettimeofday(&tv, nullptr);
  return static_cast<ms_t>(tv.tv_sec) * 1000 + tv.tv_usec / 1000;
}

std::string sti(uint32_t id, const char* ext) {
  char b[32];
  snprintf(b, sizeof b, "%s/B%04u.%s", MAPPE, static_cast<unsigned>(id), ext);
  return b;
}

std::string les(const std::string& p) {
  File f = SD_MMC.open(p.c_str(), "r");
  if (!f) return "";
  std::string s(f.size(), '\0');
  f.read(reinterpret_cast<uint8_t*>(&s[0]), s.size());
  f.close();
  return s;
}

bool skriv(const std::string& p, const std::string& d) {
  File f = SD_MMC.open(p.c_str(), "w");
  if (!f) return false;
  const size_t n = f.write(reinterpret_cast<const uint8_t*>(d.data()), d.size());
  f.close();
  return n == d.size();
}

// ---------- kamera ----------
bool kamera_start() {
  if (kamera_paa) return true;
  camera_config_t c = {};
  c.pin_pwdn = -1; c.pin_reset = -1; c.pin_xclk = 15; c.pin_sccb_sda = 4; c.pin_sccb_scl = 5;
  c.pin_d7 = 16; c.pin_d6 = 17; c.pin_d5 = 18; c.pin_d4 = 12; c.pin_d3 = 10; c.pin_d2 = 8; c.pin_d1 = 9; c.pin_d0 = 11;
  c.pin_vsync = 6; c.pin_href = 7; c.pin_pclk = 13;
  c.xclk_freq_hz = 20000000;
  c.ledc_timer = LEDC_TIMER_0;
  c.ledc_channel = LEDC_CHANNEL_0;
  c.pixel_format = PIXFORMAT_JPEG;
  c.frame_size = FRAMESIZE_QSXGA;  // 2560×1920
  c.jpeg_quality = 10;
  c.fb_count = 1;
  c.fb_location = CAMERA_FB_IN_PSRAM;
  c.grab_mode = CAMERA_GRAB_LATEST;
  kamera_paa = esp_camera_init(&c) == ESP_OK;
  return kamera_paa;
}

void kamera_stopp() {
  if (kamera_paa) esp_camera_deinit();
  kamera_paa = false;
}

bool ta_bilde(uint32_t id) {
  if (!kamera_start()) return false;
  digitalWrite(LED, HIGH);
  camera_fb_t* fb = esp_camera_fb_get();  // første ramme etter oppvåkning kan være mørk: kast den
  if (fb) esp_camera_fb_return(fb);
  fb = esp_camera_fb_get();
  if (!fb) { digitalWrite(LED, LOW); return false; }
  uint8_t nonce[12];
  esp_fill_random(nonce, sizeof nonce);
  const std::string jpeg(reinterpret_cast<const char*>(fb->buf), fb->len);
  esp_camera_fb_return(fb);
  const bool ok = skriv(sti(id, "mrk"), forsegl(nokkel, id, jpeg, nonce));
  digitalWrite(LED, LOW);
  return ok;
}

bool original(uint32_t id, std::string& jpeg) { return aapne(nokkel, id, les(sti(id, "mrk")), jpeg); }

// Fremkall: dekrypter, dekod JPEG i 1/8 skala (2560×1920 → 320×240), gråtoner, Atkinson. Bufres på kortet.
const std::vector<uint8_t>* bits_for(uint32_t id) {
  auto it = d1.find(id);
  if (it != d1.end()) return &it->second;
  const std::string lagret = les(sti(id, "d1"));
  if (lagret.size() == static_cast<size_t>(BILDE_W) * BILDE_H / 8) {
    return &(d1[id] = std::vector<uint8_t>(lagret.begin(), lagret.end()));
  }
  std::string jpeg;
  if (!original(id, jpeg)) return nullptr;
  const int w = 320, h = 240;
  std::vector<uint8_t> rgb(static_cast<size_t>(w) * h * 2);
  if (!jpg2rgb565(reinterpret_cast<const uint8_t*>(jpeg.data()), jpeg.size(), rgb.data(), JPG_SCALE_8X)) return nullptr;
  Gra g;
  g.w = w;
  g.h = h;
  g.px.resize(static_cast<size_t>(w) * h);
  for (size_t i = 0; i < g.px.size(); ++i) {
    const uint16_t p = static_cast<uint16_t>(rgb[2 * i] << 8 | rgb[2 * i + 1]);
    const int r = (p >> 11) << 3, gg = ((p >> 5) & 0x3F) << 2, b = (p & 0x1F) << 3;
    g.px[i] = static_cast<uint8_t>((r * 77 + gg * 150 + b * 29) >> 8);
  }
  auto bits = fremkall(g, BILDE_W, BILDE_H);
  skriv(sti(id, "d1"), std::string(bits.begin(), bits.end()));  // 1-bit lagres først når bildet er fremkalt
  return &(d1[id] = std::move(bits));
}

// ---------- nett ----------
void wifi_start() {
  if (!wifi_paa) {
    WiFi.mode(WIFI_AP);
    WiFi.softAP(enhet.ctx.ap_navn.c_str(), enhet.ctx.ap_pass.c_str());
    server.begin();
    wifi_paa = true;
  }
  wifi_av = millis() + WIFI_MS;
}
void wifi_stopp() {
  if (!wifi_paa) return;
  server.stop();
  WiFi.softAPdisconnect(true);
  WiFi.mode(WIFI_OFF);
  wifi_paa = false;
}

void http() {
  std::string s = server.uri().c_str();
  for (int i = 0; i < server.args(); ++i) {
    if (server.argName(i) == "plain") continue;
    s += (s.find('?') == std::string::npos ? "?" : "&");
    s += std::string(server.argName(i).c_str()) + "=" + server.arg(i).c_str();
  }
  const char* m = server.method() == HTTP_POST ? "POST" : server.method() == HTTP_GET ? "GET" : "ANNET";
  const Svar r = api.handle(m, s, server.arg("plain").c_str(), server.header("X-Morkerom-Nokkel").c_str(), naa());
  server.sendHeader("Cache-Control", "no-store");
  server.send_P(r.kode, r.type.c_str(), r.kropp.data(), r.kropp.size());
  wifi_av = millis() + WIFI_MS;
}

std::string tilfeldig(size_t n, const char* alfabet) {
  std::string s;
  const size_t k = strlen(alfabet);
  for (size_t i = 0; i < n; ++i) s += alfabet[esp_random() % k];
  return s;
}

// ---------- knapper ----------
struct Knapp {
  int pin;
  bool nede = false;
  uint32_t t0 = 0;
  // returnerer varighet ved slipp, ellers 0
  uint32_t les() {
    const bool n = digitalRead(pin) == LOW;
    if (n && !nede) { nede = true; t0 = millis(); }
    if (!n && nede && millis() - t0 > 25) { nede = false; return millis() - t0; }
    return 0;
  }
};
Knapp utl{UTLOSER}, bla{BLA};

void sov_hvis_mulig() {
  const bool aapent = digitalRead(HALL);
  const bool usb = digitalRead(VBUS);
  if (aapent || usb || wifi_paa || millis() - sist_aktiv < VAAKEN_MS) return;
  // Deksel lukket, på batteri: dypsøvn til dekselet åpnes, bla trykkes, eller neste hele time.
  rtc_sist_sjekket = naa();
  epd.sov();
  kamera_stopp();
  esp_sleep_enable_ext0_wakeup(static_cast<gpio_num_t>(HALL), 1);
  esp_sleep_enable_ext1_wakeup(1ULL << BLA, ESP_EXT1_WAKEUP_ANY_LOW);
  const ms_t t = naa();
  esp_sleep_enable_timer_wakeup(static_cast<uint64_t>((t / TIME + 1) * TIME - t) * 1000);
  esp_deep_sleep_start();
}

void setup() {
  Serial.begin(115200);
  pinMode(UTLOSER, INPUT_PULLUP);
  pinMode(BLA, INPUT_PULLUP);
  pinMode(HALL, INPUT);
  pinMode(VBUS, INPUT);
  pinMode(LED, OUTPUT);
  sist_aktiv = millis();

  Preferences p;
  p.begin("morkerom", false);
  if (p.getBytesLength("nokkel") != 32) {
    uint8_t k[32];
    esp_fill_random(k, 32);
    p.putBytes("nokkel", k, 32);
    p.putString("id", tilfeldig(4, "0123456789ABCDEF").c_str());
    p.putString("appass", tilfeldig(12, "abcdefghjkmnpqrstuvwxyz23456789").c_str());
    p.putString("apikey", tilfeldig(16, "abcdefghjkmnpqrstuvwxyz23456789").c_str());
  }
  p.getBytes("nokkel", nokkel.k, 32);
  enhet.ctx.ap_navn = std::string("Morkerom-") + p.getString("id").c_str();
  enhet.ctx.ap_pass = p.getString("appass").c_str();
  enhet.ctx.nokkel = p.getString("apikey").c_str();
  p.end();

  SD_MMC.setPins(39, 38, 40);
  if (SD_MMC.begin("/sdcard", true)) {
    SD_MMC.mkdir(MAPPE);
    File f = SD_MMC.open((std::string(MAPPE) + "/logg.jsonl").c_str(), "r");
    std::string l;
    while (f && f.available()) {
      const char c = f.read();
      if (c != '\n') { l += c; continue; }
      enhet.rull.spill_av(l);
      l.clear();
    }
    if (f) f.close();
  }
  enhet.rull.skriv = [](const std::string& l) {
    File f = SD_MMC.open((std::string(MAPPE) + "/logg.jsonl").c_str(), "a");
    if (!f) return false;
    const bool ok = f.print(l.c_str()) == l.size() && f.print('\n') == 1;
    f.close();
    return ok;
  };
  enhet.ta_bilde = ta_bilde;
  enhet.bits_for = bits_for;
  enhet.ctx.url = "morkerom.local";

  api.nokkel = enhet.ctx.nokkel;
  api.index_html = []() { return std::string(WEB_INDEX); };
  api.sett_klokke = [](ms_t t) {
    timeval tv{static_cast<time_t>(t / 1000), static_cast<suseconds_t>((t % 1000) * 1000)};
    settimeofday(&tv, nullptr);
    return true;
  };
  api.les_original = original;
  const char* hoder[] = {"X-Morkerom-Nokkel"};
  server.collectHeaders(hoder, 1);
  server.onNotFound(http);

  epd.begin(21, 47);
  enhet.deksel(digitalRead(HALL), naa());
  if (rtc_sist_sjekket) enhet.tick(rtc_sist_sjekket);  // «fremkalt mens du sov» oppdages ved neste tick
  if (naa() < 1700000000000LL) enhet.hold_bla(HOLD_QR, naa());  // ingen klokke: koble til telefonen først
  enhet.tick(naa());
  enhet.tegn_til(skjerm);
  epd.full(skjerm.buf);
  if (enhet.deksel_aapent) kamera_start();
}

void loop() {
  const ms_t t = naa();
  const bool aapent = digitalRead(HALL);
  if (aapent != enhet.deksel_aapent) {
    enhet.deksel(aapent, t);
    if (aapent) kamera_start(); else kamera_stopp();
    sist_aktiv = millis();
  }
  if (const uint32_t v = utl.les()) { (void)v; enhet.utloser(t); sist_aktiv = millis(); }
  if (const uint32_t v = bla.les()) {
    enhet.hold_bla(v, t);
    if (enhet.ctx.vis == Visning::Qr) wifi_start();
    sist_aktiv = millis();
  }
  if (wifi_paa) {
    server.handleClient();
    if (millis() > wifi_av) wifi_stopp();
  }
  const int pst = digitalRead(VBUS) ? -1 : constrain(map(analogReadMilliVolts(VBAT) * 2, 3300, 4150, 0, 100), 0, 100);
  if (pst != enhet.ctx.batteri) { enhet.ctx.batteri = pst; enhet.skitten = true; }
  enhet.tick(t);
  if (enhet.skitten) {
    enhet.tegn_til(skjerm);
    epd.delvis(skjerm.buf);
  }
  sov_hvis_mulig();
  delay(5);
}
