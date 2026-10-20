// Minimal HTTP/1.1-server for vertsmaskinen (simulatorer og e2e). Én tråd, én forespørsel om gangen.
// Ikke for produksjon: på enhetene brukes ESP32 WebServer.
#pragma once
#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>

#include <cctype>
#include <cstdio>
#include <cstdlib>
#include <functional>
#include <sstream>
#include <string>

namespace felles {

struct HttpSvar {
  int kode = 200;
  std::string type = "application/json; charset=utf-8";
  std::string kropp;
};

struct HttpForesporsel {
  std::string metode, sti, kropp, hoder;
  // Hoder skiller ikke store og små bokstaver.
  std::string hode(const std::string& navn) const {
    std::string lav = hoder, n = navn;
    for (auto& c : lav) c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
    for (auto& c : n) c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
    const size_t i = lav.find("\r\n" + n + ":");
    if (i == std::string::npos) return "";
    size_t a = i + 3 + n.size();
    while (a < hoder.size() && hoder[a] == ' ') ++a;
    return hoder.substr(a, hoder.find("\r\n", a) - a);
  }
};

inline int http_serve(int port, const std::function<HttpSvar(const HttpForesporsel&)>& h) {
  const int srv = socket(AF_INET, SOCK_STREAM, 0);
  int ja = 1;
  setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &ja, sizeof ja);
  sockaddr_in adr{};
  adr.sin_family = AF_INET;
  adr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
  adr.sin_port = htons(static_cast<uint16_t>(port));
  if (bind(srv, reinterpret_cast<sockaddr*>(&adr), sizeof adr) < 0 || listen(srv, 16) < 0) {
    std::perror("bind");
    return 1;
  }
  for (;;) {
    const int k = accept(srv, nullptr, nullptr);
    if (k < 0) continue;
    timeval tv{2, 0};
    setsockopt(k, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof tv);
    std::string req;
    char buf[8192];
    size_t slutt = std::string::npos, lengde = 0;
    HttpForesporsel f;
    for (;;) {
      const ssize_t n = recv(k, buf, sizeof buf, 0);
      if (n <= 0) break;
      req.append(buf, static_cast<size_t>(n));
      if (slutt == std::string::npos && (slutt = req.find("\r\n\r\n")) != std::string::npos) {
        f.hoder = req.substr(0, slutt + 2);
        lengde = std::strtoul(f.hode("Content-Length").c_str(), nullptr, 10);
      }
      if (slutt != std::string::npos && req.size() >= slutt + 4 + lengde) break;
      if (req.size() > 1024 * 1024) break;
    }
    if (slutt == std::string::npos) { close(k); continue; }
    std::istringstream forste(req.substr(0, req.find("\r\n")));
    forste >> f.metode >> f.sti;
    f.kropp = req.substr(slutt + 4, lengde);
    const HttpSvar s = h(f);
    const std::string ut = "HTTP/1.1 " + std::to_string(s.kode) + " OK\r\nContent-Type: " + s.type +
                           "\r\nContent-Length: " + std::to_string(s.kropp.size()) +
                           "\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n" + s.kropp;
    size_t sendt = 0;
    while (sendt < ut.size()) {
      const ssize_t n = send(k, ut.data() + sendt, ut.size() - sendt, MSG_NOSIGNAL);
      if (n <= 0) break;
      sendt += static_cast<size_t>(n);
    }
    close(k);
  }
}

}  // namespace felles
