// Stafett-tilstand: en append-only hendelseslogg spilt av til en modell.
// Ingen hendelse kan slette en annen dels overlevering.
#pragma once
#include <cstdint>
#include <functional>
#include <string>
#include <vector>

#include "json.h"
#include "tid.h"

namespace stafett {

using namespace felles;

constexpr ms_t KJOL_TID = 48 * TIME;
constexpr ms_t BORTE_TERSKEL = 12 * TIME;  // en vanlig natt skal ikke telle som «borte»
constexpr size_t MAKS_TEKST = 600;  // byte UTF-8
constexpr size_t MAKS_NAVN = 40;
const std::string UKJENT_DEL = "ukjent del";

struct Handoff {
  uint32_t id = 0;
  ms_t ts = 0;
  std::string del, tekst;
  uint32_t svar_til = 0;  // 0 = ny tråd
};

enum class Valg { Venter, Kjopt, Droppet };

struct Kjol {
  uint32_t id = 0;
  ms_t lagt_inn = 0, frist = 0, avgjort = 0;
  std::string ting, butikk, del;
  int64_t ore = 0;
  Valg valg = Valg::Venter;
  int forlenget = 0;
  bool klar(ms_t naa) const { return valg == Valg::Venter && naa >= frist; }
};

struct Forfall {
  uint32_t id = 0;
  ms_t lagt_inn = 0;
  std::string navn;
  int64_t ore = 0;
  int32_t dato = 0;  // første forfall, yyyymmdd
  bool maanedlig = false;
  bool avsluttet = false;
  std::vector<int32_t> betalt;  // betalte forekomster, yyyymmdd
};

struct NesteForfall {
  const Forfall* f = nullptr;
  int32_t dato = 0;
  bool forfalt = false;
};

struct Borte {
  ms_t fra = 0, til = 0;
};

struct Resultat {
  bool ok = true;
  std::string feil;
  uint32_t id = 0;
  static Resultat Feil(const std::string& f) { Resultat r; r.ok = false; r.feil = f; return r; }
};

class State {
 public:
  // Loggen: kalles med hver ny hendelseslinje (JSON). På enheten: LittleFS-append.
  std::function<bool(const std::string&)> skriv;

  // Spill av en lagret linje. Returnerer false hvis linjen er ødelagt (hoppes over).
  bool spill_av(const std::string& linje);

  // Kommandoer. Validerer, lager hendelse, skriver til logg, oppdaterer modell.
  Resultat overlevering(ms_t naa, const std::string& del, const std::string& tekst, uint32_t svar_til = 0);
  Resultat kjol_legg_inn(ms_t naa, const std::string& del, const std::string& ting, int64_t ore, const std::string& butikk);
  Resultat kjol_avgjor(ms_t naa, uint32_t id, const std::string& valg);  // "kjop" | "dropp" | "forleng"
  Resultat forfall_legg_inn(ms_t naa, const std::string& navn, int64_t ore, int32_t dato, bool maanedlig);
  Resultat forfall_betalt(ms_t naa, uint32_t id, int32_t forekomst);
  Resultat forfall_avslutt(ms_t naa, uint32_t id);
  Resultat her(ms_t naa, const std::string& del);

  // Spørringer
  const std::vector<Handoff>& handoffs() const { return handoffs_; }
  const std::vector<Kjol>& kjol() const { return kjol_; }
  const std::vector<Forfall>& forfall() const { return forfall_; }
  const std::vector<ms_t>& aktivitet() const { return aktivitet_; }

  const Handoff* siste_handoff() const { return handoffs_.empty() ? nullptr : &handoffs_.back(); }
  std::vector<const Kjol*> kjol_aktive(ms_t naa) const;  // klare først, så etter frist
  NesteForfall neste_forfall(ms_t naa) const;
  // Siste avsluttede fravær lengre enn terskel, før `naa`.
  bool siste_borte(ms_t naa, Borte& ut, ms_t terskel = BORTE_TERSKEL) const;
  // Droppet de siste `periode` ms: antall og sum øre. Penger du ikke brukte.
  void droppet(ms_t naa, ms_t periode, int& antall, int64_t& ore) const;
  ms_t siste_aktivitet() const { return aktivitet_.empty() ? 0 : aktivitet_.back(); }
  std::vector<std::string> deler() const;

  std::string eksport_tekst(ms_t naa) const;
  std::string til_json(ms_t naa) const;

  // Kompakter: skriv hele modellen som minimal hendelsesrekke (samme semantikk).
  std::vector<std::string> kompakt() const;

 private:
  bool bruk(const json::Obj& ev);
  Resultat send(json::Obj ev);
  Kjol* finn_kjol(uint32_t id);
  Forfall* finn_forfall(uint32_t id);
  void merk(ms_t ts);

  uint32_t neste_id_ = 1;
  std::vector<Handoff> handoffs_;
  std::vector<Kjol> kjol_;
  std::vector<Forfall> forfall_;
  std::vector<ms_t> aktivitet_;  // sortert
  std::vector<std::pair<ms_t, std::string>> her_;
};

std::string kroner(int64_t ore);  // «1 899 kr», «12,50 kr»
std::string rens_tekst(const std::string& s, size_t maks);  // trim, kontrolltegn ut, UTF-8-sikker avkorting

}  // namespace stafett
