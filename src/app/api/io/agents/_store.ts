// In-memory agent run store — survives the process lifetime, resets on cold start.
// Mirrors the _feed.ts pattern used by the machine subsystem.

export type AgentType =
  | "seo-sweep"
  | "design-fixer"
  | "responsive-audit"
  | "performance-optimizer"
  | "accessibility-checker"
  | "link-scanner";

export type RunStatus = "queued" | "running" | "succeeded" | "failed";

export interface AgentRun {
  id: string;
  agent: AgentType;
  name: string;
  status: RunStatus;
  summary: string;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
}

export const AGENT_LABELS: Record<AgentType, string> = {
  "seo-sweep":              "SEO Sweep",
  "design-fixer":           "Design Fixer",
  "responsive-audit":       "Responsive Audit",
  "performance-optimizer":  "Performance Optimizer",
  "accessibility-checker":  "Accessibility Checker",
  "link-scanner":           "Link Scanner",
};

const MAX_RUNS = 60;
const _runs: AgentRun[] = [];

export function startRun(agent: AgentType): string {
  const id = `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  _runs.unshift({
    id,
    agent,
    name: AGENT_LABELS[agent],
    status: "running",
    summary: `${AGENT_LABELS[agent]} running…`,
    startedAt: new Date().toISOString(),
  });
  if (_runs.length > MAX_RUNS) _runs.splice(MAX_RUNS);
  return id;
}

export function completeRun(id: string, summary: string): void {
  const r = _runs.find(r => r.id === id);
  if (!r) return;
  r.status = "succeeded";
  r.summary = summary;
  r.finishedAt = new Date().toISOString();
  r.durationMs = Date.now() - new Date(r.startedAt).getTime();
}

export function failRun(id: string, error: string): void {
  const r = _runs.find(r => r.id === id);
  if (!r) return;
  r.status = "failed";
  r.summary = error;
  r.finishedAt = new Date().toISOString();
  r.durationMs = Date.now() - new Date(r.startedAt).getTime();
}

export function getRuns(limit = 20): AgentRun[] {
  return _runs.slice(0, limit);
}
