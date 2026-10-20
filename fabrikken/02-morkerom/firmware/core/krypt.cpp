#include "krypt.h"

#include <cstring>

#include "mbedtls/gcm.h"

namespace morkerom {

namespace {

void aad(uint32_t id, uint8_t ut[8]) {
  std::memcpy(ut, "MRK1", 4);
  for (int i = 0; i < 4; ++i) ut[4 + i] = static_cast<uint8_t>(id >> (24 - 8 * i));
}

}  // namespace

std::string forsegl(const Nokkel& n, uint32_t id, const std::string& klar, const uint8_t nonce[12]) {
  std::string ut(KONVOLUTT_HODE + klar.size(), '\0');
  auto* p = reinterpret_cast<uint8_t*>(&ut[0]);
  std::memcpy(p, "MRK1", 4);
  std::memcpy(p + 4, nonce, 12);
  uint8_t a[8];
  aad(id, a);
  mbedtls_gcm_context g;
  mbedtls_gcm_init(&g);
  int r = mbedtls_gcm_setkey(&g, MBEDTLS_CIPHER_ID_AES, n.k, 256);
  if (r == 0)
    r = mbedtls_gcm_crypt_and_tag(&g, MBEDTLS_GCM_ENCRYPT, klar.size(), nonce, 12, a, sizeof a,
                                  reinterpret_cast<const uint8_t*>(klar.data()), p + KONVOLUTT_HODE, 16, p + 16);
  mbedtls_gcm_free(&g);
  if (r != 0) return std::string();
  return ut;
}

bool aapne(const Nokkel& n, uint32_t id, const std::string& fil, std::string& klar) {
  if (fil.size() < KONVOLUTT_HODE || std::memcmp(fil.data(), "MRK1", 4) != 0) return false;
  const auto* p = reinterpret_cast<const uint8_t*>(fil.data());
  const size_t len = fil.size() - KONVOLUTT_HODE;
  std::string ut(len, '\0');
  uint8_t a[8];
  aad(id, a);
  mbedtls_gcm_context g;
  mbedtls_gcm_init(&g);
  int r = mbedtls_gcm_setkey(&g, MBEDTLS_CIPHER_ID_AES, n.k, 256);
  if (r == 0)
    r = mbedtls_gcm_auth_decrypt(&g, len, p + 4, 12, a, sizeof a, p + 16, 16, p + KONVOLUTT_HODE,
                                 reinterpret_cast<uint8_t*>(&ut[0]));
  mbedtls_gcm_free(&g);
  if (r != 0) return false;
  klar.swap(ut);
  return true;
}

}  // namespace morkerom
