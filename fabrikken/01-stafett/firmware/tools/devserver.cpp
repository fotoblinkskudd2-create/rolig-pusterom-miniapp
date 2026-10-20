// devserver: kjører Stafett-kjernen som en lokal HTTP-server, så telefon-UI og simulator kan testes uten maskinvare.
//   devserver [--port 8048] [--logg fil.jsonl] [--klokke ms] [--nokkel abc] [--web ../web]
// Ekstra for simulator: POST /sim/hopp {"ms":172800000} flytter klokka fram. GET /sim gir simulatorsiden.
#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>

#include <chrono>
#include <cctype>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>

#include "../core/api.h"

using namespace stafett;

static ms_t vegg() {
  return std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
}

// HTTP-hoder skiller ikke store og små bokstaver.
static std::string hode(const std::string& req, size_t slutt, const std::string& navn) {
  std::string lav = req.substr(0, slutt), n = navn;
  for (auto& c : lav) c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
  for (auto& c : n) c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
  const size_t i = lav.find("\r\n" + n + ":");
  if (i == std::string::npos) return "";
  size_t a = i + 3 + n.size();
  while (a < slutt && req[a] == ' ') ++a;
  return req.substr(a, req.find("\r\n", a) - a);
}

static std::string les_fil(const std::string& p) {
  std::ifstream f(p, std::ios::binary);
  std::stringstream ss;
  ss << f.rdbuf();
  return ss.str();
}

int main(int argc, char** argv) {
  int port = 8048;
  std::string logg = "build/dev.jsonl", web = "web", nokkel;
  ms_t forskyv = 0;
  bool laast = false;  // simulert klokke: telefonen får ikke stille den tilbake
  for (int i = 1; i + 1 < argc; i += 2) {
    const std::string a = argv[i], v = argv[i + 1];
    if (a == "--port") port = std::atoi(v.c_str());
    else if (a == "--logg") logg = v;
    else if (a == "--klokke") { forskyv = std::atoll(v.c_str()) - vegg(); laast = true; }
    else if (a == "--nokkel") nokkel = v;
    else if (a == "--web") web = v;
  }
  auto naa = [&]() { return vegg() + forskyv; };

  Enhet e;
  {
    std::ifstream in(logg);
    std::string l;
    int n = 0;
    while (std::getline(in, l)) if (!l.empty() && e.s.spill_av(l)) ++n;
    std::cerr << "spilte av " << n << " hendelser fra " << logg << "\n";
  }
  e.s.skriv = [&logg](const std::string& l) {
    std::ofstream out(logg, std::ios::app);
    out << l << "\n";
    return static_cast<bool>(out);
  };
  e.slett_alt = [&logg]() { std::ofstream(logg, std::ios::trunc); };
  e.ctx.ap_navn = "Stafett-DEV";
  e.ctx.ap_pass = "rolig-fjord-48";
  e.ctx.url = "localhost:" + std::to_string(port);

  Api api(e);
  api.nokkel = nokkel;
  e.ctx.nokkel = nokkel;
  api.simulator = true;
  api.index_html = [&web]() { return les_fil(web + "/index.html"); };
  api.sett_klokke = [&](ms_t t) {
    if (laast) return false;
    forskyv = t - vegg();
    return true;
  };

  const int srv = socket(AF_INET, SOCK_STREAM, 0);
  int ja = 1;
  setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &ja, sizeof ja);
  sockaddr_in adr{};
  adr.sin_family = AF_INET;
  adr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
  adr.sin_port = htons(port);
  if (bind(srv, reinterpret_cast<sockaddr*>(&adr), sizeof adr) < 0 || listen(srv, 16) < 0) {
    std::perror("bind");
    return 1;
  }
  std::cerr << "stafett devserver på http://localhost:" << port << "  (sim: /sim)\n";

  for (;;) {
    const int k = accept(srv, nullptr, nullptr);
    if (k < 0) continue;
    timeval tv{2, 0};
    setsockopt(k, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof tv);
    std::string req;
    char buf[4096];
    size_t hode_slutt = std::string::npos, lengde = 0;
    while (true) {
      const ssize_t n = recv(k, buf, sizeof buf, 0);
      if (n <= 0) break;
      req.append(buf, n);
      if (hode_slutt == std::string::npos && (hode_slutt = req.find("\r\n\r\n")) != std::string::npos)
        lengde = std::strtoul(hode(req, hode_slutt, "Content-Length").c_str(), nullptr, 10);
      if (hode_slutt != std::string::npos && req.size() >= hode_slutt + 4 + lengde) break;
      if (req.size() > 64 * 1024) break;
    }
    if (hode_slutt == std::string::npos) { close(k); continue; }
    std::istringstream forste(req.substr(0, req.find("\r\n")));
    std::string metode, sti;
    forste >> metode >> sti;
    const std::string nh = hode(req, hode_slutt, "X-Stafett-Nokkel");
    const std::string kropp = req.substr(hode_slutt + 4, lengde);

    Svar s;
    const std::string bar_sti = sti.substr(0, sti.find('?'));
    if (metode == "GET" && bar_sti == "/sim") {
      s.type = "text/html; charset=utf-8";
      s.kropp = les_fil(web + "/sim.html");
    } else if (metode == "POST" && bar_sti == "/sim/hopp") {
      json::Obj b;
      json::parse(kropp, b);
      forskyv += json::get_n(b, "ms");
      laast = true;
      e.tick(naa());
      s.kropp = "{\"ok\":true,\"naa\":" + std::to_string(naa()) + "}";
    } else {
      e.tick(naa());
      s = api.handle(metode, sti, kropp, nh, naa());
    }
    std::string ut = "HTTP/1.1 " + std::to_string(s.kode) + " OK\r\nContent-Type: " + s.type +
                     "\r\nContent-Length: " + std::to_string(s.kropp.size()) +
                     "\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n" + s.kropp;
    size_t sendt = 0;
    while (sendt < ut.size()) {
      const ssize_t n = send(k, ut.data() + sendt, ut.size() - sendt, MSG_NOSIGNAL);
      if (n <= 0) break;
      sendt += n;
    }
    close(k);
  }
}
