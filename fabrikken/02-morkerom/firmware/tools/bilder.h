// Vertsmaskin: JPEG → gråtoner (stb_image), og simulert kamera/minnekort med ekte kryptering.
#pragma once
#define STB_IMAGE_IMPLEMENTATION
#define STBI_ONLY_JPEG
#include <cstring>
#include <fstream>
#include <map>
#include <random>
#include <sstream>
#include <string>
#include <vector>

#include "../core/dither.h"
#include "../core/krypt.h"
#include "../core/view.h"
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wunused-parameter"
#pragma GCC diagnostic ignored "-Wsign-compare"
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#include "stb_image.h"
#pragma GCC diagnostic pop

namespace morkerom {

inline std::string les_fil(const std::string& p) {
  std::ifstream f(p, std::ios::binary);
  std::stringstream ss;
  ss << f.rdbuf();
  return ss.str();
}

inline bool skriv_fil(const std::string& p, const std::string& d) {
  std::ofstream f(p, std::ios::binary | std::ios::trunc);
  f << d;
  return static_cast<bool>(f);
}

inline bool jpeg_til_gra(const std::string& jpeg, Gra& g) {
  int w, h, n;
  unsigned char* px = stbi_load_from_memory(reinterpret_cast<const unsigned char*>(jpeg.data()), static_cast<int>(jpeg.size()), &w, &h, &n, 1);
  if (!px) return false;
  g.w = w;
  g.h = h;
  g.px.assign(px, px + static_cast<size_t>(w) * h);
  stbi_image_free(px);
  return true;
}

// Simulert minnekort: <dir>/B0001.mrk, nøkkel i <dir>/nokkel.bin (på ESP32: NVS).
class Kort {
 public:
  std::string dir;
  std::vector<std::string> eksempler;  // JPEG-filer kameraet «ser»
  Nokkel nokkel{};
  std::map<uint32_t, std::vector<uint8_t>> d1;  // fremkalt-buffer

  void start() {
    std::string k = les_fil(dir + "/nokkel.bin");
    if (k.size() != 32) {
      std::random_device rd;
      k.resize(32);
      for (auto& c : k) c = static_cast<char>(rd());
      skriv_fil(dir + "/nokkel.bin", k);
    }
    std::memcpy(nokkel.k, k.data(), 32);
  }
  std::string sti(uint32_t id) const {
    char b[16];
    std::snprintf(b, sizeof b, "/B%04u.mrk", id);
    return dir + b;
  }
  bool ta(uint32_t id) {
    if (eksempler.empty()) return false;
    const std::string jpeg = les_fil(eksempler[(id - 1) % eksempler.size()]);
    if (jpeg.empty()) return false;
    std::random_device rd;
    uint8_t nonce[12];
    for (auto& b : nonce) b = static_cast<uint8_t>(rd());
    return skriv_fil(sti(id), forsegl(nokkel, id, jpeg, nonce));
  }
  bool original(uint32_t id, std::string& jpeg) { return aapne(nokkel, id, les_fil(sti(id)), jpeg); }
  const std::vector<uint8_t>* bits(uint32_t id) {
    auto it = d1.find(id);
    if (it != d1.end()) return &it->second;
    std::string jpeg;
    Gra g;
    if (!original(id, jpeg) || !jpeg_til_gra(jpeg, g)) return nullptr;
    return &(d1[id] = fremkall(g, BILDE_W, BILDE_H));
  }
};

}  // namespace morkerom
