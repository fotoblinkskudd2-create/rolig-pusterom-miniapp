"""Midjourney-verktøy: prompt-bygging, parametre, seed, bildescoring og simulering.

Midjourney har ikke et offisielt offentlig API. Pipelinen bruker derfor filer:
du kjører prompten i Midjourney (Discord eller web), lagrer de 4 bildene i en mappe,
og scriptet tar over derfra. --simuler lager plassholderbilder for testing.
"""
from __future__ import annotations

import hashlib
import random
from dataclasses import dataclass, field
from pathlib import Path

from . import antislop

BILDE_ENDELSER = {".png", ".jpg", ".jpeg", ".webp"}

# Standard stil-lås for serien. Kan overstyres med --parametre.
STANDARD = {"v": "7", "ar": "4:5", "stylize": "150", "chaos": "8"}


@dataclass
class MJParametre:
    ar: str = STANDARD["ar"]
    v: str = STANDARD["v"]
    stylize: str = STANDARD["stylize"]
    chaos: str = STANDARD["chaos"]
    seed: int | None = None
    sref: str | None = None
    sw: int | None = None  # style weight for --sref (0–1000)
    raw: bool = True
    ekstra: list[str] = field(default_factory=list)

    def som_tekst(self) -> str:
        deler = [f"--ar {self.ar}", f"--v {self.v}", f"--stylize {self.stylize}", f"--chaos {self.chaos}"]
        if self.raw:
            deler.append("--style raw")
        if self.sref:
            deler.append(f"--sref {self.sref}")
            if self.sw is not None:
                deler.append(f"--sw {self.sw}")
        if self.seed is not None:
            deler.append(f"--seed {self.seed}")
        deler.extend(self.ekstra)
        return " ".join(deler)


def seed_fra(tekst: str) -> int:
    """Deterministisk seed (0–4294967295) fra tekst, slik at samme nyhet gir samme seed."""
    return int(hashlib.sha256(tekst.encode("utf-8")).hexdigest()[:8], 16)


def full_prompt(motiv: str, param: MJParametre) -> str:
    return f"{antislop.rens_prompt(motiv)} {param.som_tekst()}".strip()


def finn_bilder(mappe: Path) -> list[Path]:
    return sorted(p for p in mappe.iterdir() if p.suffix.lower() in BILDE_ENDELSER and p.is_file())


def score_bilde(sti: Path) -> dict:
    """Enkel scoring tilpasset stencil/gatekunst: kontrast + kanttetthet + lesbar negativ plass.

    Dette er en grovsortering, ikke smak. Bruk --velg for å overstyre.
    """
    try:
        from PIL import Image, ImageFilter, ImageStat
    except ImportError:
        return {"score": 0.0, "kontrast": 0.0, "kanter": 0.0, "negativ_plass": 0.0, "merknad": "Pillow mangler"}

    with Image.open(sti) as im:
        g = im.convert("L")
        g.thumbnail((512, 512))
        kontrast = ImageStat.Stat(g).stddev[0] / 128.0              # 0–~1
        kanter = ImageStat.Stat(g.filter(ImageFilter.FIND_EDGES)).mean[0] / 64.0
        hist = g.histogram()
        totalt = sum(hist) or 1
        lyst = sum(hist[200:]) / totalt                               # vegg/negativ plass
    # Stencil liker høy kontrast, moderat kantmengde og en del rolig flate.
    kanter_score = max(0.0, 1.0 - abs(min(kanter, 2.0) - 0.6))
    negativ_score = max(0.0, 1.0 - abs(lyst - 0.35) * 2)
    score = round(0.5 * min(kontrast, 1.0) + 0.3 * kanter_score + 0.2 * negativ_score, 4)
    return {
        "score": score,
        "kontrast": round(kontrast, 3),
        "kanter": round(kanter, 3),
        "negativ_plass": round(lyst, 3),
    }


def simuler_bilder(mappe: Path, antall: int = 4, seed: int = 0) -> list[Path]:
    """Lager plassholderbilder (stencil-aktige former) slik at pipelinen kan testes uten Midjourney."""
    from PIL import Image, ImageDraw

    mappe.mkdir(parents=True, exist_ok=True)
    rng = random.Random(seed)
    stier = []
    for i in range(antall):
        im = Image.new("L", (640, 800), color=rng.randint(170, 235))
        d = ImageDraw.Draw(im)
        for _ in range(rng.randint(2, 12)):
            x0, y0 = rng.randint(0, 560), rng.randint(0, 720)
            x1, y1 = x0 + rng.randint(30, 300), y0 + rng.randint(30, 300)
            fyll = rng.choice([0, 20, 40, 255])
            if rng.random() < 0.5:
                d.rectangle([x0, y0, x1, y1], fill=fyll)
            else:
                d.ellipse([x0, y0, x1, y1], fill=fyll)
        sti = mappe / f"simulert_{i + 1}.png"
        im.save(sti)
        stier.append(sti)
    return stier
