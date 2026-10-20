// Dagens oppdrag: ett om dagen, samme hele dagen, ingen gjentakelse innen 64 dager.
// Reglene for listen: se ut, ikke inn. Ingen ansikter, ingen kropp, ingen barndom, ingen prestasjon.
#pragma once
#include <cstdint>

#include "tid.h"

namespace morkerom {

using namespace felles;

static const char* const OPPDRAG[] = {
    "noe som er varmt",
    "et lys du ikke la merke til i går",
    "noe som har ventet lenge",
    "skyggen av noe",
    "noe blått",
    "det første du ser utenfor døra",
    "noe noen har laget for hånd",
    "en dør",
    "noe lite og helt",
    "vann, i en eller annen form",
    "noe som er slitt fordi det blir brukt",
    "et vindu sett utenfra",
    "noe som vokser",
    "noe du holder i hånda",
    "noe som lager lyd",
    "noe rundt",
    "tre ting som står sammen",
    "et sted du pleier å sitte",
    "himmelen akkurat nå",
    "noe som er reparert",
    "noe som minner deg om noen",
    "bakken under deg",
    "noe du er glad du har",
    "noe stille",
    "et mønster",
    "noe som står åpent",
    "det som er rett foran deg",
    "noe som er varmere enn det ser ut",
    "noe gammelt",
    "noe nytt",
    "en vei",
    "noe som henger",
    "noe symmetrisk",
    "en refleksjon i noe som ikke er et speil",
    "lys gjennom noe",
    "noe rotete som er helt greit",
    "noe du kan spise",
    "noe som venter på våren",
    "noe som er til for andre",
    "et hjørne",
    "noe hvitt",
    "noe som beveger seg",
    "noe du ikke vet navnet på",
    "en hylle",
    "noe tungt",
    "noe lett",
    "et spor etter noen",
    "noe mykt",
    "en trapp",
    "noe utenfor rekkevidde",
    "noe nær vann",
    "noe grønt",
    "noe som gir lys",
    "en kopp",
    "noe som står alene og klarer seg",
    "noe som holder noe annet sammen",
    "to farger som passer",
    "noe kaldt",
    "et tak",
    "noe du har gått forbi hundre ganger",
    "noe nede ved gulvet",
    "noe halvferdig",
    "det fineste i rommet",
    "noe som er sant akkurat nå",
};
constexpr int ANTALL_OPPDRAG = sizeof(OPPDRAG) / sizeof(OPPDRAG[0]);
static_assert(ANTALL_OPPDRAG == 64, "64 oppdrag");

// Fast stokking per periode på 64 dager (xorshift seedet med periodenummer).
inline int oppdrag_for_dag(int64_t dag) {
  const int64_t periode = floordiv(dag, ANTALL_OPPDRAG);
  const int indeks = static_cast<int>(dag - periode * ANTALL_OPPDRAG);
  int rekke[ANTALL_OPPDRAG];
  for (int i = 0; i < ANTALL_OPPDRAG; ++i) rekke[i] = i;
  uint32_t x = static_cast<uint32_t>(periode * 2654435761u) ^ 0x4D524B31u;  // "MRK1"
  for (int i = ANTALL_OPPDRAG - 1; i > 0; --i) {
    x ^= x << 13; x ^= x >> 17; x ^= x << 5;
    const int j = static_cast<int>(x % static_cast<uint32_t>(i + 1));
    const int t = rekke[i]; rekke[i] = rekke[j]; rekke[j] = t;
  }
  return rekke[indeks];
}

inline int dagens_oppdrag(ms_t naa) { return oppdrag_for_dag(lokal(naa).dag); }

}  // namespace morkerom
