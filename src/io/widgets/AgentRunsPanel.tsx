'use client';

/**
 * D8_IO_AGENT_RUNS_PANEL_v2_20260220
 * Real agent runs panel for the IO surface — fetches /api/io/agents/runs.
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

function dot(s: AgentRun['status']) {
  if (s === 'succeeded') return { c: 'rgba(52,211,153,0.95)', bg: 'rgba(52,211,153,0.12)', label: 'Done' };
  if (s === 'running')   return { c: 'rgba(124,90,255,0.95)',  bg: 'rgba(124,90,255,0.12)',  label: 'Running' };
  if (s === 'queued')    return { c: 'rgba(232,180,79,0.95)', bg: 'rgba(232,180,79,0.12)', label: 'Queued' };
  return                        { c: 'rgba(255,107,138,0.95)',  bg: 'rgba(255,107,138,0.12)',  label: 'Failed' };
}

function age(iso: string) {
  try {
    const d = Date.now() - new Date(iso).getTime();
    return d < 60000 ? `${Math.round(d / 1000)}s ago` : `${Math.round(d / 60000)}m ago`;
  } catch { return ''; }
}

function dur(ms?: number) {
  if (!ms) return '';
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

export default function AgentRunsPanel() {
  const [runs, setRuns] = React.useState<AgentRun[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    let alive = true;
    async function poll() {
      try {
        const ts = Math.floor(Date.now() / 1000);
        const r = await fetch(`/api/io/agents/runs?ts=${ts}`, { cache: 'no-store' });
        const d = await r.json();
        if (alive) { setRuns(Array.isArray(d.runs) ? d.runs : []); setLoading(false); }
      } catch { if (alive) setLoading(false); }
      if (alive) setTick(x => x + 1);
    }
    poll();
    const id = setInterval(poll, 5000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const running = runs.filter(r => r.status === 'running').length;

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <style>{`@keyframes arp-pulse{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="kicker">agent runs</div>
          {running > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: 'rgba(124,90,255,0.10)', border: '1px solid rgba(124,90,255,0.25)', fontSize: 11, color: 'rgba(124,90,255,0.90)' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(124,90,255,0.9)', display: 'inline-block', animation: 'arp-pulse 1.2s ease-in-out infinite' }} />
              {running}
            </span>
          )}
        </div>
        <span style={{ fontSize: 10, opacity: 0.35 }}>tick {tick}</span>
      </div>

      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {loading && <div style={{ padding: '12px 14px', fontSize: 12, opacity: 0.45 }}>Loading…</div>}
        {!loading && runs.length === 0 && <div style={{ padding: '12px 14px', fontSize: 12, opacity: 0.40 }}>No runs yet.</div>}
        {runs.map(run => {
          const d = dot(run.status);
          return (
            <div key={run.id} style={{ display: 'flex', gap: 10, padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ paddingTop: 3 }}>
                <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: d.c, boxShadow: run.status === 'running' ? `0 0 5px ${d.c}` : 'none' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'ui-monospace,monospace', color: 'rgba(255,255,255,0.88)' }}>{run.agent}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 999, background: d.bg, color: d.c }}>{d.label}</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.summary}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 3, display: 'flex', gap: 6 }}>
                  <span>{age(run.startedAt)}</span>
                  {run.durationMs != null && <span>· {dur(run.durationMs)}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { AgentRunsPanel };
