// Bildekonvolutt: "MRK1" | nonce(12) | tag(16) | AES-256-GCM(innhold), AAD = bilde-id.
// mbedTLS på både vert og ESP32 (samme API i 2.28 og 3.x).
#pragma once
#include <cstdint>
#include <string>

namespace morkerom {

struct Nokkel {
  uint8_t k[32];
};

constexpr size_t KONVOLUTT_HODE = 4 + 12 + 16;

// nonce må være unik per bilde (tilfeldig 96 bit holder for et kameras levetid).
std::string forsegl(const Nokkel& n, uint32_t id, const std::string& klar, const uint8_t nonce[12]);

// false hvis filen er ødelagt, byttet (feil id), eller nøkkelen er feil.
bool aapne(const Nokkel& n, uint32_t id, const std::string& fil, std::string& klar);

}  // namespace morkerom
