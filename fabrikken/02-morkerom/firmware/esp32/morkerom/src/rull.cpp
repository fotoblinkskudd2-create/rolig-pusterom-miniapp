#include "rull.h"

#include <algorithm>

#include "oppdrag.h"

namespace morkerom {

using json::Obj;

const Bilde* Rull::finn(uint32_t id) const {
  for (const auto& b : bilder_) if (b.id == id) return &b;
  return nullptr;
}

bool Rull::bruk(const Obj& ev) {
  const std::string t = json::get_s(ev, "t");
  const ms_t ts = json::get_n(ev, "ts");
  if (ts <= 0) return false;
  if (t == "tatt") {
    Bilde b;
    b.id = static_cast<uint32_t>(json::get_n(ev, "id"));
    b.tatt = ts;
    b.fremkalles = ts + MORKE;
    b.oppdrag = static_cast<int>(json::get_n(ev, "opp", -1));
    if (!b.id || finn(b.id)) return false;
    if (b.oppdrag < -1 || b.oppdrag >= ANTALL_OPPDRAG) b.oppdrag = -1;
    bilder_.push_back(b);
    if (b.id >= neste_id_) neste_id_ = b.id + 1;
  } else if (t == "tvang") {
    for (auto& b : bilder_)
      if (b.i_morket(ts)) { b.fremkalles = ts; b.tvunget = true; }
  } else if (t == "kast") {
    const auto id = static_cast<uint32_t>(json::get_n(ev, "id"));
    for (auto& b : bilder_) if (b.id == id) { b.kastet = true; return true; }
    return false;
  } else {
    return false;
  }
  return true;
}

bool Rull::spill_av(const std::string& linje) {
  Obj ev;
  return json::parse(linje, ev) && bruk(ev);
}

Resultat Rull::send(const Obj& ev) {
  if (skriv && !skriv(json::dump(ev))) return Resultat::Feil("kunne ikke lagre");
  if (!bruk(ev)) return Resultat::Feil("ugyldig hendelse");
  Resultat r;
  r.id = static_cast<uint32_t>(json::get_n(ev, "id"));
  return r;
}

Resultat Rull::ta(ms_t naa, int oppdrag) {
  if (i_morket(naa) >= RULL) return Resultat::Feil("rullen er full");
  Obj ev{{"t", json::str("tatt")}, {"id", json::num(neste_id_)}, {"ts", json::num(naa)}};
  if (oppdrag >= 0) ev["opp"] = json::num(oppdrag);
  return send(ev);
}

Resultat Rull::fremkall_alt(ms_t naa) {
  if (i_morket(naa) == 0) return Resultat::Feil("ingenting i mørket");
  return send({{"t", json::str("tvang")}, {"ts", json::num(naa)}});
}

Resultat Rull::kast(ms_t naa, uint32_t id) {
  const Bilde* b = finn(id);
  if (!b || b->kastet) return Resultat::Feil("finner ikke bildet");
  return send({{"t", json::str("kast")}, {"id", json::num(id)}, {"ts", json::num(naa)}});
}

int Rull::i_morket(ms_t naa) const {
  int n = 0;
  for (const auto& b : bilder_) n += b.i_morket(naa);
  return n;
}

ms_t Rull::neste_fremkalling(ms_t naa) const {
  ms_t best = 0;
  for (const auto& b : bilder_)
    if (b.i_morket(naa) && (!best || b.fremkalles < best)) best = b.fremkalles;
  return best;
}

std::vector<const Bilde*> Rull::fremkalte(ms_t naa) const {
  std::vector<const Bilde*> v;
  for (const auto& b : bilder_) if (b.fremkalt(naa)) v.push_back(&b);
  std::stable_sort(v.begin(), v.end(), [](const Bilde* a, const Bilde* b) { return a->tatt > b->tatt; });
  return v;
}

std::vector<uint32_t> Rull::fremkalt_mellom(ms_t fra, ms_t til) const {
  std::vector<uint32_t> v;
  for (const auto& b : bilder_)
    if (!b.kastet && b.fremkalles > fra && b.fremkalles <= til) v.push_back(b.id);
  return v;
}

int Rull::tvunget() const {
  int n = 0;
  for (const auto& b : bilder_) n += b.tvunget && !b.kastet;
  return n;
}

std::string Rull::til_json(ms_t naa) const {
  std::string o = "{\"naa\":" + std::to_string(naa) + ",\"rull\":" + std::to_string(rull_nr()) +
                  ",\"i_morket\":" + std::to_string(i_morket(naa)) + ",\"igjen\":" + std::to_string(igjen(naa)) +
                  ",\"neste\":" + std::to_string(neste_fremkalling(naa)) + ",\"tvunget\":" + std::to_string(tvunget());
  const int opp = dagens_oppdrag(naa);
  o += ",\"oppdrag\":{\"nr\":" + std::to_string(opp) + ",\"tekst\":" + json::quote(OPPDRAG[opp]) + "}";
  // Mørket: bare når, aldri hva.
  o += ",\"morket\":[";
  bool forste = true;
  for (const auto& b : bilder_) {
    if (!b.i_morket(naa)) continue;
    o += (forste ? "" : ",") + std::string("{\"fremkalles\":") + std::to_string(b.fremkalles) + "}";
    forste = false;
  }
  o += "],\"fremkalte\":[";
  forste = true;
  for (const Bilde* b : fremkalte(naa)) {
    o += (forste ? "" : ",") + std::string("{\"id\":") + std::to_string(b->id) + ",\"tatt\":" + std::to_string(b->tatt) +
         ",\"fremkalt\":" + std::to_string(b->fremkalles) + ",\"tvunget\":" + (b->tvunget ? "true" : "false") +
         ",\"oppdrag\":" + (b->oppdrag >= 0 ? json::quote(OPPDRAG[b->oppdrag]) : "null") + "}";
    forste = false;
  }
  return o + "]}";
}

}  // namespace morkerom
