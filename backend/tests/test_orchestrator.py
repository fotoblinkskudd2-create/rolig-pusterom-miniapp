def test_kernel_registers_all_eight_agents():
    from app.db import init_db
    init_db()
    from app.orchestrator import get_kernel

    kernel = get_kernel()
    assert set(kernel.agents.keys()) == {
        "drone_rd", "biomimicry", "arctic_ops", "panicsafe",
        "patent", "mvp_factory", "roi_tracker", "gonzo_critique",
    }
    statuses = kernel.agent_status()
    assert len(statuses) == 8
    assert all(s["status"] == "idle" for s in statuses)


def test_run_sync_returns_completed_task():
    from app.db import init_db
    init_db()
    from app.orchestrator import get_kernel

    kernel = get_kernel()
    task = kernel.run_sync("roi_tracker", "summary", {})
    assert task["status"] == "done"
    assert "net_nok" in task["result"]


def test_kill_switch_blocks_new_task_execution():
    from app.db import init_db
    init_db()
    from app.orchestrator import get_kernel

    kernel = get_kernel()
    kernel.engage_kill_switch("test")
    assert kernel.is_killed()

    task_id = kernel.submit("roi_tracker", "summary", {})
    import time
    time.sleep(0.3)
    task = kernel.get_task(task_id)
    # killed kernel must not silently execute -- task stays queued, never marked done
    assert task["status"] == "queued"

    kernel.disengage_kill_switch()
    assert not kernel.is_killed()


def test_self_healing_retries_then_recovers(monkeypatch):
    from app.db import init_db
    init_db()
    from app.orchestrator import get_kernel

    kernel = get_kernel()
    agent = kernel.agents["gonzo_critique"]

    calls = {"n": 0}
    original_handle = agent.handle

    def flaky_handle(kind, payload):
        calls["n"] += 1
        if calls["n"] < 2:
            raise RuntimeError("simulated transient failure")
        return original_handle(kind, payload)

    monkeypatch.setattr(agent, "handle", flaky_handle)

    import time
    task_id = kernel.submit("gonzo_critique", "critique", {"text": "needs validation", "artifact_type": "test"})
    deadline = time.time() + 10
    task = None
    while time.time() < deadline:
        task = kernel.get_task(task_id)
        if task["status"] == "done":
            break
        time.sleep(0.1)

    assert task["status"] == "done"
    assert calls["n"] == 2  # failed once, retried, then succeeded
