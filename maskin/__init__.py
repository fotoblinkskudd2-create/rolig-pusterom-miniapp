"""Oppfinnelsesmaskinen: finn gode produktdesign ved å søke i et parameterrom.

Et produkt beskrives i én fil (problem.py) med:
  ROM     dict navn -> Tall(lo, hi) | Heltall(lo, hi) | Valg([...])
  score   funksjon(design: dict) -> dict med delpoeng 0..1 (nøkler med _ er info, ikke poeng)
  FOKUS   dict profilnavn -> vekter per delpoeng
  rydd    valgfri funksjon(design) -> design, gjør designet fysisk konsistent
  NOKKEL  valgfri liste parameternavn som skiller "ulike konsepter" i utskriften
  REFERANSE valgfri dict, et kjent produkt å sammenligne med

Ingen avhengigheter utover Python 3.8+.
"""
import json
import random
from dataclasses import dataclass


@dataclass
class Tall:
    lo: float
    hi: float

    def trekk(self, rng):
        return rng.uniform(self.lo, self.hi)

    def muter(self, v, rng):
        return min(self.hi, max(self.lo, v + rng.gauss(0, (self.hi - self.lo) * 0.1)))


@dataclass
class Heltall(Tall):
    def trekk(self, rng):
        return rng.randint(int(self.lo), int(self.hi))

    def muter(self, v, rng):
        return int(round(super().muter(v, rng)))


@dataclass
class Valg:
    valg: list

    def trekk(self, rng):
        return rng.choice(self.valg)

    def muter(self, v, rng):
        return rng.choice(self.valg)


class Maskin:
    def __init__(self, problem, fokus=None, seed=1):
        self.p = problem
        self.rom = problem.ROM
        fokuser = getattr(problem, "FOKUS", None) or {}
        if fokus is None:
            fokus = next(iter(fokuser), None)
        if fokus is not None and fokus not in fokuser:
            raise SystemExit(f"Ukjent fokus '{fokus}'. Velg mellom: {', '.join(fokuser)}")
        self.fokus = fokus
        self.vekter = fokuser.get(fokus) if fokus else None
        self.rng = random.Random(seed)
        self._cache = {}

    def _rydd(self, d):
        rydd = getattr(self.p, "rydd", None)
        return rydd(d) if rydd else d

    def delpoeng(self, d):
        nokkel = json.dumps(d, sort_keys=True, default=str)
        if nokkel not in self._cache:
            self._cache[nokkel] = self.p.score(dict(d))
        return self._cache[nokkel]

    def poeng(self, d):
        dp = self.delpoeng(d)
        vekter = self.vekter or {k: 1 for k in dp if not k.startswith("_")}
        total = sum(vekter.values()) or 1
        return sum(w * dp[k] for k, w in vekter.items()) / total

    def tilfeldig(self):
        return self._rydd({n: r.trekk(self.rng) for n, r in self.rom.items()})

    def kryss(self, a, b):
        return self._rydd({n: self.rng.choice((a, b))[n] for n in self.rom})

    def muter(self, d, rate=0.15):
        return self._rydd({n: (r.muter(d[n], self.rng) if self.rng.random() < rate else d[n])
                           for n, r in self.rom.items()})

    def utvikle(self, generasjoner=200, storrelse=120, logg=print):
        pop = [self.tilfeldig() for _ in range(storrelse)]
        for gen in range(generasjoner):
            pop.sort(key=self.poeng, reverse=True)
            elite = pop[: max(1, storrelse // 10)]
            barn = []
            while len(barn) < storrelse - len(elite):
                a = max(self.rng.sample(pop, 4), key=self.poeng)
                b = max(self.rng.sample(pop, 4), key=self.poeng)
                barn.append(self.muter(self.kryss(a, b)))
            pop = elite + barn
            if logg and gen % max(1, generasjoner // 10) == 0:
                logg(f"  generasjon {gen:4d}  beste poeng {self.poeng(pop[0]):.3f}")
        pop.sort(key=self.poeng, reverse=True)
        return pop

    def ulike(self, pop, n):
        """De n beste som er ulike konsepter (ifølge problem.NOKKEL)."""
        felter = getattr(self.p, "NOKKEL", None)
        sett, ut = set(), []
        for d in pop:
            k = tuple(d[f] for f in felter) if felter else json.dumps(d, sort_keys=True, default=str)
            if k in sett:
                continue
            sett.add(k)
            ut.append(d)
            if len(ut) == n:
                break
        return ut

    def beskriv(self, d):
        dp = self.delpoeng(d)
        linjer = [f"POENG {self.poeng(d):.3f}"]
        info = [f"{k[1:]} {v:.0f}" if isinstance(v, (int, float)) else f"{k[1:]} {v}"
                for k, v in dp.items() if k.startswith("_")]
        if info:
            linjer[0] += "   " + ", ".join(info)
        param = []
        for n, v in d.items():
            if isinstance(v, bool):
                if v:
                    param.append(n)
            elif isinstance(v, float):
                param.append(f"{n}={v:.3g}")
            else:
                param.append(f"{n}={v}")
        linjer.append("  " + ", ".join(param))
        linjer.append("  " + "  ".join(f"{k} {v:.2f}" for k, v in dp.items() if not k.startswith("_")))
        return "\n".join(linjer)
