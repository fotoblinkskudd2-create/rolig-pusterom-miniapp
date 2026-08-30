"""Central logging configuration for Pusterom CLI."""
from __future__ import annotations

import logging
from pathlib import Path

LOG_FILE = Path("pusterom.log")


def configure(verbose: bool = False) -> logging.Logger:
    """Configure the 'pusterom' logger: DEBUG to a file, WARNING (or DEBUG) to console."""
    logger = logging.getLogger("pusterom")
    if logger.handlers:
        return logger  # already configured, e.g. by an earlier call or in tests
    logger.setLevel(logging.DEBUG)

    file_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG if verbose else logging.WARNING)
    console_handler.setFormatter(logging.Formatter("%(levelname)s: %(message)s"))

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    return logger
