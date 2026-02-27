'use client';

/**
 * D8_TV_SHELL_v2_20260220
 * Real TV shell — live system status, deployment feed, agent monitor.
 */

import * as React from 'react';

type PingResult = { ok: boolean; status: number; ms: number; at: string; data?: Record<string, unknown> };

async function pingUrl(url: string): Promise<PingResult> {
  const t0 = Date.now();
  const at = new Date().toISOString();
  try {
    const r = await fetch(url, { cache: 'no-store' });
    const ms = Date.now() - t0;
    let data: Record<string, unknown> | undefined;
    try { data = await r.json(); } catch { /* not json */ }
    return { ok: r.ok, status: r.status, ms, at, data };
  } catch {
    return { ok: false, status: 0, ms: Date.now() - t0, at };
  }
}

type Deployment = { domain: string; desc: string; status: string; pill: string; progress: number; icon: string };

function pillColor(p: string) {
  if (p === 'OK' || p === 'LIVE') return { fg: '#34D399', bg: 'rgba(52,211,153,0.12)', bd: 'rgba(52,211,153,0.28)' };
  if (p === 'TODO' || p === 'PENDING') return { fg: '#FFD166', bg: 'rgba(255,209,102,0.12)', bd: 'rgba(255,209,102,0.28)' };
  return { fg: 'rgba(255,255,255,0.60)', bg: 'rgba(255,255,255,0.06)', bd: 'rgba(255,255,255,0.14)' };
}

function barGrad(status: string, prog: number) {
  if (status === 'LIVE' || status === 'OK') return 'linear-gradient(90deg,#34D399,#29E09A)';
  if (prog > 60) return 'linear-gradient(90deg,#F0924A,#E07A38)';
  return 'linear-gradient(90deg,#4A90E2,#6AABF0)';
}

function deployIcon(icon: string) {
  const m: Record<string, string> = { rocket: '🚀', globe: '🌐', bot: '🤖' };
  return m[icon] ?? '⚙️';
}

export default function TvShell() {
  const [stamp, setStamp] = React.useState<PingResult | null>(null);
  const [deployments, setDeployments] = React.useState<Deployment[]>([]);
  const [tick, setTick] = React.useState(0);
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    let alive = true;

    async function refresh() {
      const ts = Math.floor(Date.now() / 1000);
      const [s, dep] = await Promise.all([
        pingUrl(`/api/__d8__/stamp?ts=${ts}`),
        fetch(`/api/tv/deployments?ts=${ts}`, { cache: 'no-store' })
          .then(r => r.json())
          .then(d => (Array.isArray(d.deployments) ? d.deployments : []))
          .catch(() => [] as Deployment[]),
      ]);
      if (!alive) return;
      setStamp(s);
      setDeployments(dep as Deployment[]);
      setTick(x => x + 1);
    }

    refresh();
    const id = setInterval(refresh, 6000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const health = stamp?.ok;

  return (
    <div
      style={{
        position: 'fixed', bottom: 14, right: 14, zIndex: 99990,
        width: 340, maxWidth: 'calc(100vw - 28px)',
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.10)',
        background: 'rgba(0,0,0,0.70)',
        backdropFilter: 'blur(14px)',
        overflow: 'hidden',
        fontFamily: 'ui-sans-serif,system-ui,-apple-system,sans-serif',
        fontSize: 12,
        color: 'rgba(255,255,255,0.88)',
      }}
      data-d8="TV_SHELL_v2_20260220"
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: open ? '1px solid rgba(255,255,255,0.08)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
            background: health ? '#34D399' : 'rgba(255,77,109,0.9)',
            boxShadow: health ? '0 0 6px #34D399' : '0 0 6px rgba(255,77,109,0.9)',
          }} />
          <span style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>D8 TV</span>
          <span style={{ opacity: 0.40, fontSize: 11 }}>tick {tick}</span>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 8, padding: '4px 10px', color: 'rgba(255,255,255,0.75)',
            cursor: 'pointer', fontSize: 11, fontFamily: 'inherit',
          }}
          type="button"
        >
          {open ? 'Hide' : 'Show'}
        </button>
      </div>

      {open && (
        <>
          {/* Stamp row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 14px', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ opacity: 0.45 }}>stamp</span>
            <span style={{ fontFamily: 'ui-monospace,monospace', opacity: 0.75, flex: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 10 }}>
              {stamp ? String(stamp.data?.stamp ?? 'ok') : '…'}
            </span>
            <span style={{
              padding: '2px 8px', borderRadius: 999, fontWeight: 600, fontSize: 10,
              background: health ? 'rgba(52,211,153,0.12)' : 'rgba(255,77,109,0.12)',
              color: health ? '#34D399' : 'rgba(255,77,109,0.90)',
              border: `1px solid ${health ? 'rgba(52,211,153,0.25)' : 'rgba(255,77,109,0.25)'}`,
              flexShrink: 0,
            }}>
              {stamp ? (stamp.ok ? 'OK' : 'ERR') : '…'}
            </span>
          </div>

          {/* Deployments */}
          <div style={{ padding: '10px 14px 4px' }}>
            <div style={{ opacity: 0.40, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 10 }}>
              Deployments
            </div>
            {deployments.length === 0 && (
              <div style={{ opacity: 0.35, padding: '4px 0 8px' }}>Loading…</div>
            )}
            {deployments.map((d, i) => {
              const pc = pillColor(d.pill);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{deployIcon(d.icon)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.domain}
                      </span>
                      <span style={{
                        padding: '1px 6px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                        color: pc.fg, background: pc.bg, border: `1px solid ${pc.bd}`,
                        flexShrink: 0,
                      }}>
                        {d.pill}
                      </span>
                    </div>
                    <div style={{ marginTop: 5, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${d.progress}%`,
                        background: barGrad(d.status, d.progress),
                        borderRadius: 999, transition: 'width 600ms ease',
                      }} />
                    </div>
                    <div style={{ marginTop: 3, fontSize: 10, opacity: 0.40 }}>{d.desc} · {d.progress}%</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            padding: '8px 14px 10px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between',
            opacity: 0.35, fontSize: 10,
          }}>
            <span>TV_SHELL_v2</span>
            <a href="/api/__d8__/stamp" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
              stamp ↗
            </a>
          </div>
        </>
      )}
    </div>
  );
}
