'use client';

/**
 * D8_AGENT_RUNS_PANEL_v2_20260220
 * Real panel — fetches from /api/io/agents/runs every 5s.
 */

import * as React from 'react';

type AgentRun = {
  id: string;
  agent: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  summary: string;
};

type AgentRunsPanelProps = {
  projectId?: string;
  className?: string;
};

function statusDot(s: AgentRun['status']): { color: string; bg: string; label: string } {
  if (s === 'succeeded') return { color: 'rgba(52,211,153,0.95)', bg: 'rgba(52,211,153,0.12)', label: 'Done' };
  if (s === 'running')   return { color: 'rgba(124,90,255,0.95)',  bg: 'rgba(124,90,255,0.12)',  label: 'Running' };
  if (s === 'queued')    return { color: 'rgba(232,180,79,0.95)', bg: 'rgba(232,180,79,0.12)', label: 'Queued' };
  return                        { color: 'rgba(255,107,138,0.95)',  bg: 'rgba(255,107,138,0.12)',  label: 'Failed' };
}

function fmtDuration(ms?: number): string {
  if (!ms) return '';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function fmtAge(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
    return `${Math.round(diff / 60000)}m ago`;
  } catch { return ''; }
}

export default function AgentRunsPanel({ projectId, className }: AgentRunsPanelProps) {
  const [runs, setRuns] = React.useState<AgentRun[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    let alive = true;

    async function poll() {
      try {
        const ts = Math.floor(Date.now() / 1000);
        const res = await fetch(`/api/io/agents/runs?ts=${ts}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (alive) {
          setRuns(Array.isArray(data.runs) ? data.runs : []);
          setLoading(false);
          setError(null);
        }
      } catch (e: unknown) {
        if (alive) {
          setError(e instanceof Error ? e.message : 'Failed to load');
          setLoading(false);
        }
      }
      if (alive) setTick((x) => x + 1);
    }

    poll();
    const id = setInterval(poll, 5000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const running = runs.filter((r) => r.status === 'running').length;

  return (
    <div
      className={className}
      style={{
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)',
      }}
      data-d8="AGENT_RUNS_PANEL_v2_20260220"
    >
      <style>{`@keyframes arp-blink{0%,100%{opacity:1;}50%{opacity:0.25;}}`}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.88)' }}>
            Agent Runs
          </span>
          {running > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 999,
              background: 'rgba(124,90,255,0.12)',
              border: '1px solid rgba(124,90,255,0.28)',
              fontSize: 11, color: 'rgba(124,90,255,0.90)', fontWeight: 600,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'rgba(124,90,255,0.9)', display: 'inline-block',
                animation: 'arp-blink 1.2s ease-in-out infinite',
              }} />
              {running} running
            </span>
          )}
        </div>
        {projectId && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{projectId}</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '8px 0' }}>
        {loading && (
          <div style={{ padding: '14px 16px', fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>
            Loading runs…
          </div>
        )}
        {!loading && error && (
          <div style={{ padding: '14px 16px', fontSize: 12, color: 'rgba(255,107,138,0.80)' }}>
            Error: {error}
          </div>
        )}
        {!loading && !error && runs.length === 0 && (
          <div style={{ padding: '14px 16px', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            No agent runs yet.
          </div>
        )}
        {!loading && runs.map((run) => {
          const dot = statusDot(run.status);
          return (
            <div key={run.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '8px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ paddingTop: 3, flexShrink: 0 }}>
                <span style={{
                  display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                  background: dot.color,
                  boxShadow: run.status === 'running' ? `0 0 6px ${dot.color}` : 'none',
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.88)',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  }}>
                    {run.agent}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
                    padding: '2px 7px', borderRadius: 999,
                    background: dot.bg, color: dot.color, flexShrink: 0,
                  }}>
                    {dot.label}
                  </span>
                </div>
                <div style={{
                  marginTop: 3, fontSize: 11, lineHeight: 1.4,
                  color: 'rgba(255,255,255,0.55)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {run.summary}
                </div>
                <div style={{ marginTop: 4, fontSize: 10, color: 'rgba(255,255,255,0.30)', display: 'flex', gap: 8 }}>
                  <span>{fmtAge(run.startedAt)}</span>
                  {run.durationMs != null && <span>· {fmtDuration(run.durationMs)}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && runs.length > 0 && (
        <div style={{
          padding: '8px 14px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: 10, color: 'rgba(255,255,255,0.28)',
        }}>
          Tick {tick} · Auto-refreshes every 5s
        </div>
      )}
    </div>
  );
}
