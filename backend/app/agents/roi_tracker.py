"""ROI-Tracker agent: records cost/revenue and computes empire-wide profitability."""
from __future__ import annotations

from app.agents.base import BaseAgent
from app.db import get_conn, now, tx


class ROITrackerAgent(BaseAgent):
    name = "roi_tracker"
    description = "Cost vs value ledger and empire-wide ROI computation"

    def handle(self, kind: str, payload: dict) -> dict:
        if kind == "record":
            return self._record(payload)
        if kind == "summary":
            return self._summary(payload)
        raise ValueError(f"unknown task kind for roi_tracker: {kind}")

    def _record(self, payload: dict) -> dict:
        source = payload["source"]
        agent = payload.get("agent", "unassigned")
        kind_ = payload.get("kind", "cost")  # cost | revenue
        amount_nok = float(payload["amount_nok"])
        note = payload.get("note", "")

        with tx() as conn:
            conn.execute(
                """INSERT INTO roi_entries (source, agent, kind, amount_nok, note, created_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (source, agent, kind_, amount_nok, note, now()),
            )
            col = "revenue_nok" if kind_ == "revenue" else "cost_nok"
            conn.execute(
                f"UPDATE agents SET {col} = {col} + ? WHERE name = ?", (amount_nok, agent)
            )
        return {"recorded": True, "source": source, "agent": agent, "kind": kind_, "amount_nok": amount_nok}

    def _summary(self, payload: dict) -> dict:
        conn = get_conn()
        rows = conn.execute("SELECT kind, SUM(amount_nok) as total FROM roi_entries GROUP BY kind").fetchall()
        totals = {r["kind"]: r["total"] for r in rows}
        revenue = totals.get("revenue", 0) or 0
        cost = totals.get("cost", 0) or 0
        by_agent = conn.execute(
            "SELECT name, revenue_nok, cost_nok, (revenue_nok - cost_nok) as net FROM agents ORDER BY net DESC"
        ).fetchall()
        return {
            "total_revenue_nok": revenue,
            "total_cost_nok": cost,
            "net_nok": round(revenue - cost, 2),
            "profitable": revenue > cost,
            "by_agent": [dict(r) for r in by_agent],
        }
