def test_drone_design_cycle_under_15_minutes_and_produces_patent():
    from app.db import init_db
    init_db()
    from app.services import run_drone_design_cycle

    result = run_drone_design_cycle({"theater": "svalbard", "min_temp_c": -30})

    assert result["acceptance_under_15min"] is True
    assert result["elapsed_seconds"] < 900
    assert result["invention_id"] > 0
    assert result["patent"]["patent_id"] > 0
    assert len(result["patent"]["claims"]["en"]) >= 2
    assert "gonzo_critique" in result
    assert result["simulation"]["estimated_endurance_min"] > 0


def test_ukraine_theater_applies_ew_constraints():
    from app.db import init_db
    init_db()
    from app.services import run_drone_design_cycle

    result = run_drone_design_cycle({"theater": "ukraine", "min_temp_c": -15})
    assert "ew_resilience" in result["spec"]["ops_constraints"]["environment"]


def test_panicsafe_cycle_produces_protocol_and_patent():
    from app.db import init_db
    init_db()
    from app.services import run_panicsafe_cycle

    result = run_panicsafe_cycle({"scenario_id": "crowd_enclosure"})
    assert "PanicGuard" in result["simulation"]["protocol_md"]
    assert "clinical" in result["simulation"]["protocol_md"].lower()
    assert result["patent"]["patent_id"] > 0
    assert result["gonzo_critique"]["credibility_score"] >= 0


def test_mvp_factory_scaffolds_runnable_files(tmp_path):
    from app.db import init_db
    init_db()
    from app.orchestrator import get_kernel

    kernel = get_kernel()
    task = kernel.run_sync(
        "mvp_factory", "scaffold",
        {"idea": "Guided breathing app for panic attacks", "price_nok": 149},
    )
    result = task["result"]
    from app.config import PRODUCTS_DIR

    scaffold_dir = PRODUCTS_DIR / result["slug"]
    assert (scaffold_dir / "main.py").exists()
    assert (scaffold_dir / "static" / "index.html").exists()
    assert (scaffold_dir / "Dockerfile").exists()
    assert "stripe" in (scaffold_dir / "main.py").read_text().lower()


def test_backup_copies_data_and_products():
    from app.db import init_db
    init_db()
    from app.orchestrator import get_kernel
    from app.backup import run_backup
    from app.config import BACKUP_DIR

    get_kernel().run_sync("mvp_factory", "scaffold", {"idea": "test idea"})
    rel = run_backup()
    from app.config import BASE_DIR

    backup_path = (BASE_DIR / rel) if not rel.startswith("/") else __import__("pathlib").Path(rel)
    assert backup_path.exists()
