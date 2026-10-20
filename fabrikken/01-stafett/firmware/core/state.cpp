#include "state.h"

#include <algorithm>

namespace stafett {

using json::Obj;

// ---------- hjelpere ----------

std::string kroner(int64_t ore) {
  const bool neg = ore < 0;
  if (neg) ore = -ore;
  std::string hel = std::to_string(ore / 100);
  std::string med;
  int teller = 0;
  for (int i = static_cast<int>(hel.size()) - 1; i >= 0; --i) {
    med.insert(med.begin(), hel[i]);
    if (++teller % 3 == 0 && i > 0) med.insert(med.begin(), ' ');
  }
  if (ore % 100) med += "," + to_siffer(static_cast<int>(ore % 100));
  return (neg ? "-" : "") + med + " kr";
}

static size_t utf8_len(unsigned char c) {
  if (c < 0x80) return 1;
  if ((c >> 5) == 0x6) return 2;
  if ((c >> 4) == 0xE) return 3;
  if ((c >> 3) == 0x1E) return 4;
  return 0;
}

std::string rens_tekst(const std::string& s, size_t maks) {
  std::string out;
  int nylinjer = 0;
  for (size_t i = 0; i < s.size();) {
    const unsigned char c = s[i];
    const size_t n = utf8_len(c);
    bool gyldig = n > 0 && i + n <= s.size();
    for (size_t k = 1; gyldig && k < n; ++k) gyldig = (static_cast<unsigned char>(s[i + k]) >> 6) == 0x2;
    if (!gyldig) { ++i; continue; }
    if (n == 1 && c == '\n') {
      if (++nylinjer <= 2) out += '\n';
      ++i;
      continue;
    }
    if (n == 1 && (c < 0x20 || c == 0x7F)) { out += ' '; ++i; continue; }
    nylinjer = 0;
    if (out.size() + n > maks) break;
    out.append(s, i, n);
    i += n;
  }
  const size_t a = out.find_first_not_of(" \n");
  if (a == std::string::npos) return "";
  const size_t b = out.find_last_not_of(" \n");
  return out.substr(a, b - a + 1);
}

static std::string rens_del(const std::string& del) {
  std::string d = rens_tekst(del, MAKS_NAVN);
  std::replace(d.begin(), d.end(), '\n', ' ');
  return d.empty() ? UKJENT_DEL : d;
}

void State::merk(ms_t ts) {
  aktivitet_.insert(std::upper_bound(aktivitet_.begin(), aktivitet_.end(), ts), ts);
}

Kjol* State::finn_kjol(uint32_t id) {
  for (auto& k : kjol_) if (k.id == id) return &k;
  return nullptr;
}

Forfall* State::finn_forfall(uint32_t id) {
  for (auto& f : forfall_) if (f.id == id) return &f;
  return nullptr;
}

// ---------- hendelser ----------

bool State::bruk(const Obj& ev) {
  const std::string t = json::get_s(ev, "t");
  const ms_t ts = json::get_n(ev, "ts");
  const uint32_t id = static_cast<uint32_t>(json::get_n(ev, "id"));
  if (ts <= 0) return false;

  if (t == "ho") {
    Handoff h;
    h.id = id; h.ts = ts;
    h.del = json::get_s(ev, "del", UKJENT_DEL);
    h.tekst = json::get_s(ev, "tekst");
    h.svar_til = static_cast<uint32_t>(json::get_n(ev, "svar"));
    if (!id || h.tekst.empty()) return false;
    handoffs_.push_back(h);
  } else if (t == "kj") {
    Kjol k;
    k.id = id; k.lagt_inn = ts;
    k.frist = json::get_n(ev, "frist", ts + KJOL_TID);
    k.forlenget = static_cast<int>(json::get_n(ev, "forl"));
    k.del = json::get_s(ev, "del", UKJENT_DEL);
    k.ting = json::get_s(ev, "ting");
    k.butikk = json::get_s(ev, "butikk");
    k.ore = json::get_n(ev, "ore");
    if (!id || k.ting.empty()) return false;
    kjol_.push_back(k);
  } else if (t == "kv") {
    Kjol* k = finn_kjol(id);
    if (!k) return false;
    const std::string v = json::get_s(ev, "valg");
    if (v == "kjop") { k->valg = Valg::Kjopt; k->avgjort = ts; }
    else if (v == "dropp") { k->valg = Valg::Droppet; k->avgjort = ts; }
    else if (v == "forleng") { k->frist = ts + KJOL_TID; k->forlenget++; }
    else return false;
  } else if (t == "ff") {
    Forfall f;
    f.id = id;
    f.lagt_inn = ts;
    f.navn = json::get_s(ev, "navn");
    f.ore = json::get_n(ev, "ore");
    f.dato = static_cast<int32_t>(json::get_n(ev, "dato"));
    f.maanedlig = json::get_b(ev, "mnd");
    if (!id || f.navn.empty() || f.dato < 19700101) return false;
    forfall_.push_back(f);
  } else if (t == "fb") {
    Forfall* f = finn_forfall(id);
    if (!f) return false;
    f->betalt.push_back(static_cast<int32_t>(json::get_n(ev, "dato")));
  } else if (t == "fa") {
    Forfall* f = finn_forfall(id);
    if (!f) return false;
    f->avsluttet = true;
  } else if (t == "her") {
    her_.emplace_back(ts, json::get_s(ev, "del", UKJENT_DEL));
  } else {
    return false;
  }
  if (id >= neste_id_) neste_id_ = id + 1;
  merk(ts);
  return true;
}

bool State::spill_av(const std::string& linje) {
  Obj ev;
  if (!json::parse(linje, ev)) return false;
  return bruk(ev);
}

Resultat State::send(Obj ev) {
  if (skriv && !skriv(json::dump(ev))) return Resultat::Feil("kunne ikke lagre");
  if (!bruk(ev)) return Resultat::Feil("ugyldig hendelse");
  Resultat r;
  r.id = static_cast<uint32_t>(json::get_n(ev, "id"));
  return r;
}

// ---------- kommandoer ----------

Resultat State::overlevering(ms_t naa, const std::string& del, const std::string& tekst, uint32_t svar_til) {
  const std::string t = rens_tekst(tekst, MAKS_TEKST);
  if (t.empty()) return Resultat::Feil("tom note");
  if (svar_til) {
    bool fins = false;
    for (const auto& h : handoffs_) fins |= h.id == svar_til;
    if (!fins) return Resultat::Feil("finner ikke noten");
  }
  Obj ev{{"t", json::str("ho")}, {"id", json::num(neste_id_)}, {"ts", json::num(naa)},
         {"del", json::str(rens_del(del))}, {"tekst", json::str(t)}};
  if (svar_til) ev["svar"] = json::num(svar_til);
  return send(ev);
}

Resultat State::kjol_legg_inn(ms_t naa, const std::string& del, const std::string& ting, int64_t ore, const std::string& butikk) {
  std::string t = rens_tekst(ting, 80);
  std::replace(t.begin(), t.end(), '\n', ' ');
  if (t.empty()) return Resultat::Feil("hva vil du ha?");
  if (ore < 0 || ore > 100000000LL * 100) return Resultat::Feil("ugyldig pris");
  std::string b = rens_tekst(butikk, MAKS_NAVN);
  std::replace(b.begin(), b.end(), '\n', ' ');
  return send({{"t", json::str("kj")}, {"id", json::num(neste_id_)}, {"ts", json::num(naa)},
               {"del", json::str(rens_del(del))}, {"ting", json::str(t)}, {"ore", json::num(ore)},
               {"butikk", json::str(b)}});
}

Resultat State::kjol_avgjor(ms_t naa, uint32_t id, const std::string& valg) {
  Kjol* k = finn_kjol(id);
  if (!k) return Resultat::Feil("finner ikke tingen");
  if (k->valg != Valg::Venter) return Resultat::Feil("allerede avgjort");
  if (valg != "kjop" && valg != "dropp" && valg != "forleng") return Resultat::Feil("ukjent valg");
  if (valg != "dropp" && !k->klar(naa)) return Resultat::Feil("ikke ferdig kjølt: " + igjen(k->frist - naa) + " igjen");
  return send({{"t", json::str("kv")}, {"id", json::num(id)}, {"ts", json::num(naa)}, {"valg", json::str(valg)}});
}

static bool gyldig_dato(int32_t v) {
  const int y = v / 10000, m = (v / 100) % 100, d = v % 100;
  if (y < 2000 || y > 2200 || m < 1 || m > 12 || d < 1) return false;
  return yyyymmdd_fra_dag(days_from_civil(y, m, d)) == v;
}

Resultat State::forfall_legg_inn(ms_t naa, const std::string& navn, int64_t ore, int32_t dato, bool maanedlig) {
  std::string n = rens_tekst(navn, MAKS_NAVN);
  std::replace(n.begin(), n.end(), '\n', ' ');
  if (n.empty()) return Resultat::Feil("mangler navn");
  if (!gyldig_dato(dato)) return Resultat::Feil("ugyldig dato");
  if (ore < 0) return Resultat::Feil("ugyldig beløp");
  return send({{"t", json::str("ff")}, {"id", json::num(neste_id_)}, {"ts", json::num(naa)},
               {"navn", json::str(n)}, {"ore", json::num(ore)}, {"dato", json::num(dato)},
               {"mnd", json::boolean(maanedlig)}});
}

Resultat State::forfall_betalt(ms_t naa, uint32_t id, int32_t forekomst) {
  Forfall* f = finn_forfall(id);
  if (!f) return Resultat::Feil("finner ikke forfallet");
  if (!gyldig_dato(forekomst)) return Resultat::Feil("ugyldig dato");
  if (std::find(f->betalt.begin(), f->betalt.end(), forekomst) != f->betalt.end()) return Resultat::Feil("allerede betalt");
  return send({{"t", json::str("fb")}, {"id", json::num(id)}, {"ts", json::num(naa)}, {"dato", json::num(forekomst)}});
}

Resultat State::forfall_avslutt(ms_t naa, uint32_t id) {
  Forfall* f = finn_forfall(id);
  if (!f) return Resultat::Feil("finner ikke forfallet");
  if (f->avsluttet) return Resultat::Feil("allerede avsluttet");
  return send({{"t", json::str("fa")}, {"id", json::num(id)}, {"ts", json::num(naa)}});
}

Resultat State::her(ms_t naa, const std::string& del) {
  return send({{"t", json::str("her")}, {"ts", json::num(naa)}, {"del", json::str(rens_del(del))}});
}

// ---------- spørringer ----------

std::vector<const Kjol*> State::kjol_aktive(ms_t naa) const {
  std::vector<const Kjol*> v;
  for (const auto& k : kjol_) if (k.valg == Valg::Venter) v.push_back(&k);
  std::stable_sort(v.begin(), v.end(), [naa](const Kjol* a, const Kjol* b) {
    if (a->klar(naa) != b->klar(naa)) return a->klar(naa);
    return a->frist < b->frist;
  });
  return v;
}

NesteForfall State::neste_forfall(ms_t naa) const {
  NesteForfall best;
  const int32_t idag = lokal(naa).yyyymmdd();
  for (const auto& f : forfall_) {
    if (f.avsluttet) continue;
    for (int k = 0; k < (f.maanedlig ? 1200 : 1); ++k) {
      const int32_t occ = f.maanedlig ? pluss_maaned(f.dato, k) : f.dato;
      if (std::find(f.betalt.begin(), f.betalt.end(), occ) != f.betalt.end()) continue;
      if (!best.f || occ < best.dato) { best.f = &f; best.dato = occ; best.forfalt = occ < idag; }
      break;
    }
  }
  return best;
}

bool State::siste_borte(ms_t naa, Borte& ut, ms_t terskel) const {
  for (size_t i = aktivitet_.size(); i-- > 1;) {
    if (aktivitet_[i] > naa) continue;
    if (aktivitet_[i] - aktivitet_[i - 1] > terskel) {
      ut.fra = aktivitet_[i - 1];
      ut.til = aktivitet_[i];
      return true;
    }
  }
  return false;
}

void State::droppet(ms_t naa, ms_t periode, int& antall, int64_t& ore) const {
  antall = 0; ore = 0;
  for (const auto& k : kjol_)
    if (k.valg == Valg::Droppet && k.avgjort >= naa - periode && k.avgjort <= naa) { ++antall; ore += k.ore; }
}

std::vector<std::string> State::deler() const {
  std::vector<std::string> v;
  auto legg = [&v](const std::string& d) {
    if (d != UKJENT_DEL && std::find(v.begin(), v.end(), d) == v.end()) v.push_back(d);
  };
  for (const auto& h : handoffs_) legg(h.del);
  for (const auto& k : kjol_) legg(k.del);
  for (const auto& p : her_) legg(p.second);
  return v;
}

static const char* valg_navn(Valg v) {
  switch (v) {
    case Valg::Kjopt: return "kjopt";
    case Valg::Droppet: return "droppet";
    default: return "venter";
  }
}

static std::string dato_tekst(int32_t v) {
  return to_siffer(v % 100) + "." + to_siffer((v / 100) % 100) + "." + std::to_string(v / 10000);
}

std::string State::eksport_tekst(ms_t naa) const {
  std::string o = "STAFETT — eksport " + naar(naa, naa) + "\n";
  o += "Alt under ble skrevet på denne enheten. Ingenting er sendt noe sted.\n\n";
  o += "== OVERLEVERINGER ==\n";
  for (const auto& h : handoffs_) {
    o += "[" + std::to_string(h.id) + "] " + naar(h.ts, naa) + " · " + h.del;
    if (h.svar_til) o += " (svar på " + std::to_string(h.svar_til) + ")";
    o += "\n" + h.tekst + "\n\n";
  }
  o += "== KJØLEROM ==\n";
  for (const auto& k : kjol_) {
    o += "[" + std::to_string(k.id) + "] " + k.ting + " · " + kroner(k.ore);
    if (!k.butikk.empty()) o += " · " + k.butikk;
    o += " · lagt inn " + naar(k.lagt_inn, naa) + " av " + k.del + " · ";
    if (k.valg == Valg::Venter) o += k.klar(naa) ? "klar til å avgjøre" : igjen(k.frist - naa) + " igjen";
    else o += std::string(k.valg == Valg::Kjopt ? "kjøpt " : "droppet ") + naar(k.avgjort, naa);
    if (k.forlenget) o += " · forlenget " + std::to_string(k.forlenget) + "×";
    o += "\n";
  }
  int n; int64_t sum;
  droppet(naa, 30 * DOGN, n, sum);
  o += "Droppet siste 30 døgn: " + std::to_string(n) + " ting, " + kroner(sum) + "\n\n";
  o += "== FORFALL ==\n";
  for (const auto& f : forfall_) {
    o += "[" + std::to_string(f.id) + "] " + f.navn + " · " + kroner(f.ore) + " · " + dato_tekst(f.dato);
    if (f.maanedlig) o += " (månedlig)";
    if (f.avsluttet) o += " · avsluttet";
    o += " · betalt: " + std::to_string(f.betalt.size()) + "\n";
  }
  o += "\n== TILSTEDE ==\n";
  for (const auto& p : her_) o += naar(p.first, naa) + " · " + p.second + "\n";
  Borte b;
  if (siste_borte(naa, b)) o += "\nSiste fravær: " + naar(b.fra, naa) + " → " + naar(b.til, naa) + " (" + varighet(b.til - b.fra) + ")\n";
  return o;
}

std::string State::til_json(ms_t naa) const {
  using json::quote;
  std::string o = "{\"naa\":" + std::to_string(naa);
  o += ",\"handoffs\":[";
  for (size_t i = 0; i < handoffs_.size(); ++i) {
    const auto& h = handoffs_[i];
    if (i) o += ",";
    o += "{\"id\":" + std::to_string(h.id) + ",\"ts\":" + std::to_string(h.ts) + ",\"del\":" + quote(h.del) +
         ",\"tekst\":" + quote(h.tekst) + ",\"svar\":" + std::to_string(h.svar_til) + "}";
  }
  o += "],\"kjol\":[";
  for (size_t i = 0; i < kjol_.size(); ++i) {
    const auto& k = kjol_[i];
    if (i) o += ",";
    o += "{\"id\":" + std::to_string(k.id) + ",\"ts\":" + std::to_string(k.lagt_inn) + ",\"frist\":" + std::to_string(k.frist) +
         ",\"ting\":" + quote(k.ting) + ",\"ore\":" + std::to_string(k.ore) + ",\"butikk\":" + quote(k.butikk) +
         ",\"del\":" + quote(k.del) + ",\"valg\":\"" + valg_navn(k.valg) + "\",\"avgjort\":" + std::to_string(k.avgjort) +
         ",\"forl\":" + std::to_string(k.forlenget) + ",\"klar\":" + (k.klar(naa) ? "true" : "false") + "}";
  }
  o += "],\"forfall\":[";
  for (size_t i = 0; i < forfall_.size(); ++i) {
    const auto& f = forfall_[i];
    if (i) o += ",";
    o += "{\"id\":" + std::to_string(f.id) + ",\"navn\":" + quote(f.navn) + ",\"ore\":" + std::to_string(f.ore) +
         ",\"dato\":" + std::to_string(f.dato) + ",\"mnd\":" + (f.maanedlig ? "true" : "false") +
         ",\"avsluttet\":" + (f.avsluttet ? "true" : "false") + ",\"betalt\":[";
    for (size_t j = 0; j < f.betalt.size(); ++j) o += (j ? "," : "") + std::to_string(f.betalt[j]);
    o += "]}";
  }
  o += "]";
  const NesteForfall nf = neste_forfall(naa);
  if (nf.f) o += ",\"neste_forfall\":{\"id\":" + std::to_string(nf.f->id) + ",\"dato\":" + std::to_string(nf.dato) + ",\"forfalt\":" + (nf.forfalt ? "true" : "false") + "}";
  Borte b;
  if (siste_borte(naa, b)) o += ",\"borte\":{\"fra\":" + std::to_string(b.fra) + ",\"til\":" + std::to_string(b.til) + "}";
  int n; int64_t sum;
  droppet(naa, 30 * DOGN, n, sum);
  o += ",\"droppet30\":{\"antall\":" + std::to_string(n) + ",\"ore\":" + std::to_string(sum) + "}";
  o += ",\"deler\":[";
  const auto d = deler();
  for (size_t i = 0; i < d.size(); ++i) o += (i ? "," : "") + quote(d[i]);
  o += "]}";
  return o;
}

std::vector<std::string> State::kompakt() const {
  std::vector<std::pair<ms_t, std::string>> ev;
  for (const auto& h : handoffs_) {
    Obj o{{"t", json::str("ho")}, {"id", json::num(h.id)}, {"ts", json::num(h.ts)}, {"del", json::str(h.del)}, {"tekst", json::str(h.tekst)}};
    if (h.svar_til) o["svar"] = json::num(h.svar_til);
    ev.emplace_back(h.ts, json::dump(o));
  }
  for (const auto& k : kjol_) {
    ev.emplace_back(k.lagt_inn, json::dump({{"t", json::str("kj")}, {"id", json::num(k.id)}, {"ts", json::num(k.lagt_inn)},
                                            {"del", json::str(k.del)}, {"ting", json::str(k.ting)}, {"ore", json::num(k.ore)},
                                            {"butikk", json::str(k.butikk)}, {"frist", json::num(k.frist)}, {"forl", json::num(k.forlenget)}}));
    if (k.valg != Valg::Venter)
      ev.emplace_back(k.avgjort, json::dump({{"t", json::str("kv")}, {"id", json::num(k.id)}, {"ts", json::num(k.avgjort)},
                                             {"valg", json::str(k.valg == Valg::Kjopt ? "kjop" : "dropp")}}));
  }
  for (const auto& p : her_) ev.emplace_back(p.first, json::dump({{"t", json::str("her")}, {"ts", json::num(p.first)}, {"del", json::str(p.second)}}));
  // Forfall først (betalinger refererer dem). Betalingstidspunkt komprimeres til lagt_inn.
  std::vector<std::string> ut;
  for (const auto& f : forfall_) {
    ut.push_back(json::dump({{"t", json::str("ff")}, {"id", json::num(f.id)}, {"ts", json::num(f.lagt_inn)}, {"navn", json::str(f.navn)},
                             {"ore", json::num(f.ore)}, {"dato", json::num(f.dato)}, {"mnd", json::boolean(f.maanedlig)}}));
    for (int32_t b : f.betalt) ut.push_back(json::dump({{"t", json::str("fb")}, {"id", json::num(f.id)}, {"ts", json::num(f.lagt_inn)}, {"dato", json::num(b)}}));
    if (f.avsluttet) ut.push_back(json::dump({{"t", json::str("fa")}, {"id", json::num(f.id)}, {"ts", json::num(f.lagt_inn)}}));
  }
  std::stable_sort(ev.begin(), ev.end(), [](const auto& a, const auto& b) { return a.first < b.first; });
  for (auto& e : ev) ut.push_back(e.second);
  return ut;
}

}  // namespace stafett
