import os
import sys
import tempfile
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


@pytest.fixture(autouse=True)
def isolated_data_dir(monkeypatch, tmp_path):
    """Every test gets a throwaway SQLite DB and data dir so tests never touch
    the real regnviking.db and never interfere with each other."""
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    monkeypatch.setenv("REGNVIKING_DATA_DIR", str(data_dir))
    monkeypatch.setenv("REGNVIKING_BACKUP_DIR", str(tmp_path / "backups"))
    monkeypatch.setenv("REGNVIKING_PRODUCTS_DIR", str(tmp_path / "products"))
    monkeypatch.setenv("REGNVIKING_BACKUP_SECONDS", "999999")
    monkeypatch.setenv("REGNVIKING_TICK_SECONDS", "0.2")

    # app.config reads env at import time; force a clean re-import per test.
    for mod in list(sys.modules):
        if mod == "app" or mod.startswith("app."):
            del sys.modules[mod]
    yield
