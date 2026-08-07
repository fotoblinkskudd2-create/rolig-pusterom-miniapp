export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type AgentStatus = {
  name: string;
  status: string;
  last_tick: string;
  failure_count: number;
  revenue_nok: number;
  cost_nok: number;
};

export type RoiSummary = {
  total_revenue_nok: number;
  total_cost_nok: number;
  net_nok: number;
  profitable: boolean;
  by_agent: AgentStatus[];
};

export type Dashboard = {
  killed: boolean;
  agents: AgentStatus[];
  roi: RoiSummary;
  inventions: { id: number; title: string; domain: string; status: string; created_at: string }[];
  patents: { id: number; title: string; jurisdiction: string; novelty_risk: string; status: string; created_at: string }[];
  mvps: { id: number; idea: string; slug: string; status: string; deadline_at: string; created_at: string }[];
  panicsafe_sessions: { id: number; scenario: string; created_at: string }[];
};

export async function fetchDashboard(): Promise<Dashboard> {
  const res = await fetch(`${API_URL}/api/dashboard`, { cache: "no-store" });
  if (!res.ok) throw new Error(`dashboard fetch failed: ${res.status}`);
  return res.json();
}

export async function killSwitch(reason: string): Promise<void> {
  await fetch(`${API_URL}/api/swarm/kill`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
}

export async function resumeSwarm(): Promise<void> {
  await fetch(`${API_URL}/api/swarm/resume`, { method: "POST" });
}
