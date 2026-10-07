"""Felles epistemisk merke. Alle motorer SKAL bruke dette, ingen egne varianter."""
from enum import Enum


class Merke(str, Enum):
    DOKUMENTERT = "DOKUMENTERT"  # primærkilde finnes og er sjekket
    BEREGNET = "BEREGNET"        # utledet fra dokumenterte tall
    HYPOTESE = "HYPOTESE"        # plausibelt, ikke belagt
    MOTBEVIST = "MOTBEVIST"      # aktivt tilbakevist
    UAVKLART = "UAVKLART"        # kilder spriker eller mangler
