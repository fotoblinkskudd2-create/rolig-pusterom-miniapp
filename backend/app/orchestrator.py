"""REGNViking OS swarm kernel: master orchestrator over the 8 specialized agents.

Responsibilities:
- persistent task queue (SQLite) so work survives a restart
- bounded parallel execution (resource budget via a thread pool)
- self-healing: retries with backoff, per-agent failure isolation, degraded-status marking
- offline-first: never blocks on network; agents already degrade gracefully on their own
- kill switch + audit log for every dispatch
"""
from __future__ import annotations

import threading
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from typing import Any

from app.agents import ALL_AGENTS, BaseAgent
from app.audit import log
from app.config import MAX_PARALLEL_AGENTS, MAX_TASK_RETRIES, TICK_INTERVAL_SECONDS
from app.db import dumps, get_conn, loads, now, tx

STALE_TASK_SECONDS = max(TICK_INTERVAL_SECONDS * 4, 60)


class SwarmKernel:
    def __init__(self) -> None:
        self.agents: dict[str, BaseAgent] = {cls.name: cls() for cls in ALL_AGENTS}
        self._executor = ThreadPoolExecutor(max_workers=MAX_PARALLEL_AGENTS, thread_name_prefix="swarm")
        self._stop_flag = threading.Event()
        self._loop_thread: threading.Thread | None = None
        self._register_agents()

    # ---------- agent registry / persistent state ----------

    def _register_agents(self) -> None:
        with tx() as conn:
            for name in self.agents:
                conn.execute(
                    "INSERT OR IGNORE INTO agents (name, status, last_tick) VALUES (?, 'idle', ?)",
                    (name, now()),
                )

    def agent_status(self) -> list[dict]:
        rows = get_conn().execute("SELECT * FROM agents ORDER BY name").fetchall()
        return [dict(r) for r in rows]

    # ---------- kill switch ----------

    def is_killed(self) -> bool:
        row = get_conn().execute("SELECT engaged FROM kill_switch WHERE id = 1").fetchone()
        return bool(row and row["engaged"])

    def engage_kill_switch(self, reason: str) -> None:
        with tx() as conn:
            conn.execute(
                "UPDATE kill_switch SET engaged = 1, reason = ?, updated_at = ? WHERE id = 1",
                (reason, now()),
            )
        log("kernel", "kill_switch.engaged", {"reason": reason})
        self._stop_flag.set()

    def disengage_kill_switch(self) -> None:
        with tx() as conn:
            conn.execute(
                "UPDATE kill_switch SET engaged = 0, reason = NULL, updated_at = ? WHERE id = 1", (now(),)
            )
        log("kernel", "kill_switch.disengaged", {})
        self._stop_flag.clear()

    # ---------- task queue ----------

    def submit(self, agent_name: str, kind: str, payload: dict[str, Any]) -> int:
        if agent_name not in self.agents:
            raise ValueError(f"unknown agent: {agent_name}")
        with tx() as conn:
            cur = conn.execute(
                """INSERT INTO tasks (agent, kind, payload, status, created_at, updated_at)
                   VALUES (?, ?, ?, 'queued', ?, ?)""",
                (agent_name, kind, dumps(payload), now(), now()),
            )
            task_id = cur.lastrowid
        self._executor.submit(self._run_task, task_id)
        return task_id

    def get_task(self, task_id: int) -> dict | None:
        row = get_conn().execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        if not row:
            return None
        d = dict(row)
        d["payload"] = loads(d["payload"])
        d["result"] = loads(d["result"])
        return d

    def run_sync(self, agent_name: str, kind: str, payload: dict[str, Any]) -> dict:
        """Run a task inline and block for the result -- used by demo/acceptance scripts
        and by any caller that needs the output immediately rather than polling."""
        task_id = self.submit(agent_name, kind, payload)
        deadline = time.time() + 60
        while time.time() < deadline:
            task = self.get_task(task_id)
            if task and task["status"] in ("done", "failed"):
                return task
            time.sleep(0.05)
        raise TimeoutError(f"task {task_id} did not complete in time")

    def _run_task(self, task_id: int) -> None:
        if self.is_killed():
            return
        conn = get_conn()
        row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        if row is None:
            return
        agent_name, kind = row["agent"], row["kind"]
        payload = loads(row["payload"])
        agent = self.agents[agent_name]

        attempts = row["attempts"]
        with tx() as c:
            c.execute(
                "UPDATE tasks SET status='running', attempts = attempts + 1, updated_at=? WHERE id=?",
                (now(), task_id),
            )
            c.execute("UPDATE agents SET status='busy', last_tick=? WHERE name=?", (now(), agent_name))

        try:
            result = agent.run(kind, payload)
            with tx() as c:
                c.execute(
                    "UPDATE tasks SET status='done', result=?, error=NULL, updated_at=? WHERE id=?",
                    (dumps(result), now(), task_id),
                )
                c.execute(
                    "UPDATE agents SET status='idle', last_tick=?, failure_count=0 WHERE name=?",
                    (now(), agent_name),
                )
        except Exception as exc:  # noqa: BLE001 -- self-healing boundary, must not crash the kernel
            log(agent_name, "task.error", {"kind": kind, "error": str(exc), "attempt": attempts + 1})
            if attempts + 1 < MAX_TASK_RETRIES:
                with tx() as c:
                    c.execute(
                        "UPDATE tasks SET status='queued', error=?, updated_at=? WHERE id=?",
                        (str(exc), now(), task_id),
                    )
                backoff = min(2 ** (attempts + 1), 30)
                threading.Timer(backoff, lambda: self._executor.submit(self._run_task, task_id)).start()
                with tx() as c:
                    c.execute(
                        "UPDATE agents SET status='retrying', last_tick=?, failure_count = failure_count + 1 "
                        "WHERE name=?",
                        (now(), agent_name),
                    )
            else:
                with tx() as c:
                    c.execute(
                        "UPDATE tasks SET status='failed', error=?, updated_at=? WHERE id=?",
                        (str(exc), now(), task_id),
                    )
                    c.execute(
                        "UPDATE agents SET status='degraded', last_tick=?, failure_count = failure_count + 1 "
                        "WHERE name=?",
                        (now(), agent_name),
                    )
                log(agent_name, "task.failed_permanently", {"kind": kind, "task_id": task_id})

    # ---------- background loop (24/7 mode) ----------

    def tick(self) -> dict:
        if self.is_killed():
            return {"killed": True}
        with tx() as conn:
            conn.execute("UPDATE agents SET last_tick=? WHERE status != 'busy'", (now(),))
        # self-healing sweep: requeue anything stuck in 'running' well past a normal
        # task duration (orphaned by a crashed/restarted process, not just still busy)
        stale_before = (datetime.now(timezone.utc) - timedelta(seconds=STALE_TASK_SECONDS)).isoformat()
        stuck = get_conn().execute(
            "SELECT id FROM tasks WHERE status='running' AND updated_at < ?",
            (stale_before,),
        ).fetchall()
        for row in stuck:
            self._executor.submit(self._run_task, row["id"])
        log("kernel", "tick", {"requeued": len(stuck)})
        return {"killed": False, "requeued": len(stuck), "agents": self.agent_status()}

    def start_background_loop(self) -> None:
        if self._loop_thread and self._loop_thread.is_alive():
            return

        def _loop() -> None:
            log("kernel", "loop.started", {})
            while not self._stop_flag.is_set():
                try:
                    if self.is_killed():
                        self._stop_flag.set()
                        break
                    self.tick()
                except Exception as exc:  # noqa: BLE001 -- kernel loop must never die
                    log("kernel", "loop.error", {"error": str(exc)})
                self._stop_flag.wait(TICK_INTERVAL_SECONDS)
            log("kernel", "loop.stopped", {})

        self._loop_thread = threading.Thread(target=_loop, daemon=True, name="swarm-loop")
        self._loop_thread.start()

    def stop_background_loop(self) -> None:
        self._stop_flag.set()


_kernel: SwarmKernel | None = None
_kernel_lock = threading.Lock()


def get_kernel() -> SwarmKernel:
    global _kernel
    if _kernel is None:
        with _kernel_lock:
            if _kernel is None:
                _kernel = SwarmKernel()
    return _kernel
