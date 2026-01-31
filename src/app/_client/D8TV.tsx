'use client';

/**
 * D8_TV_CHANNELS_v1_20260201a
 * "TV Channels" HUD overlay (glass + steel + depth)
 * Dev-only by default (prod opt-in via NEXT_PUBLIC_D8_TV=1)
 */

import * as React from 'react';

type AnyObj = Record<string, any>;

type ApiResult = {
  ok: boolean;
  status: number;
  at: string;
  ms: number;
  data?: AnyObj;
  err?: string;
};

type Channel = 'deploy' | 'agents' | 'kv' | 'routes';

function isoNow() {
  try { return new Date().toISOString(); } catch { return ''; }
}

async function getJson(url: string): Promise<ApiResult> {
  const t0 = Date.now();
  try {
    const r = await fetch(url, { cache: 'no-store' });
    const ms = Date.now() - t0;
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    let data: AnyObj | undefined = undefined;

    if (ct.includes('application/json')) {
      data = await r.json();
    } else {
      const text = await r.text();
      data = { text };
    }

    return { ok: r.ok, status: r.status, at: isoNow(), ms, data };
  } catch (e: any) {
    const ms = Date.now() - t0;
    return { ok: false, status: 0, at: isoNow(), ms, err: String(e?.message || e) };
  }
}

async function probe(url: string): Promise<ApiResult> {
  const t0 = Date.now();
  try {
    const r = await fetch(url, { cache: 'no-store' });
    const ms = Date.now() - t0;
    return { ok: r.ok, status: r.status, at: isoNow(), ms, data: { url } };
  } catch (e: any) {
    const ms = Date.now() - t0;
    return { ok: false, status: 0, at: isoNow(), ms, err: String(e?.message || e), data: { url } };
  }
}

function Badge(props: { ok: boolean; text: string }) {
  return (
    <span
      className="d8-chip"
      style={{
        borderColor: props.ok ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.10)',
        background: props.ok ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
        color: 'rgba(255,255,255,0.86)',
      }}
    >
      <span
        style={{
          width: 8, height: 8, borderRadius: 999,
          background: props.ok ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.30)',
          display: 'inline-block'
        }}
      />
      {props.text}
    </span>
  );
}

function Tab(props: { id: Channel; current: Channel; label: string; onClick: (id: Channel) => void }) {
  const active = props.current === props.id;
  return (
    <button
      className={"d8-btn " + (active ? "d8-btn--solid" : "d8-btn--ghost")}
      style={{
        padding: '8px 10px',
        borderRadius: 999,
        fontSize: 12,
        lineHeight: 1,
        opacity: active ? 1 : 0.86
      }}
      onClick={() => props.onClick(props.id)}
      type="button"
    >
      {props.label}
    </button>
  );
}

function KVRow(props: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12 }}>
      <div style={{ opacity: 0.65 }}>{props.k}</div>
      <div style={{ opacity: 0.95, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, ""Liberation Mono"", ""Courier New"", monospace' }}>
        {props.v}
      </div>
    </div>
  );
}

export default function D8TV() {
  const enabled =
    (process.env.NEXT_PUBLIC_D8_TV === '1') ||
    (process.env.NODE_ENV !== 'production');

  const [open, setOpen] = React.useState(true);
  const [ch, setCh] = React.useState<Channel>('deploy');

  const [stamp, setStamp] = React.useState<ApiResult | null>(null);
  const [where, setWhere] = React.useState<ApiResult | null>(null);
  const [proof, setProof] = React.useState<ApiResult | null>(null);
  const [kv, setKv] = React.useState<ApiResult | null>(null);

  const [agents, setAgents] = React.useState<ApiResult[]>([]);
  const [routes, setRoutes] = React.useState<ApiResult[]>([]);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (!enabled) return;

    let alive = true;

    async function pullCore() {
      const ts = Math.floor(Date.now() / 1000);
      const s = await getJson(/api/__d8__/stamp?ts=20260131_232831);
      const w = await getJson(/api/__d8__/where?ts=20260131_232831);
      const p = await getJson(/api/__d8__/proof?ts=20260131_232831);
      const k = await getJson(/api/__d8__/kv?ts=20260131_232831);

      if (!alive) return;
      setStamp(s);
      setWhere(w);
      setProof(p);
      setKv(k);
      setTick((x) => x + 1);
    }

    pullCore().catch(() => {});
    const t = setInterval(() => pullCore().catch(() => {}), 5000);

    return () => { alive = false; clearInterval(t); };
  }, [enabled]);

  const refreshAgents = React.useCallback(async () => {
    const probes = [
      '/api/agents/run',
      '/api/agents/ping',
      '/api/engine/health',
      '/api/engine/patch-run',
      '/api/__d8__/stamp',
      '/api/__d8__/proof',
    ];
    const ts = Math.floor(Date.now() / 1000);
    const out: ApiResult[] = [];
    for (const u of probes) {
      const r = await probe(${u}ts=20260131_232831);
      out.push(r);
    }
    setAgents(out);
  }, []);

  const refreshRoutes = React.useCallback(async () => {
    const checks = [
      '/',
      '/pricing',
      '/templates',
      '/gallery',
      '/admin',
      '/api/__d8__/stamp',
      '/api/__d8__/proof',
      '/api/__d8__/kv',
    ];
    const ts = Math.floor(Date.now() / 1000);
    const out: ApiResult[] = [];
    for (const u of checks) {
      const r = await probe(${u}ts=20260131_232831);
      out.push(r);
    }
    setRoutes(out);
  }, []);

  React.useEffect(() => {
    if (!enabled) return;
    if (ch === 'agents' && agents.length === 0) { refreshAgents().catch(() => {}); }
    if (ch === 'routes' && routes.length === 0) { refreshRoutes().catch(() => {}); }
  }, [enabled, ch, agents.length, routes.length, refreshAgents, refreshRoutes]);

  if (!enabled) return null;

  const okCount = [stamp, where, proof, kv].filter((x) => x && x.ok).length;

  return (
    <div
      style={{
        position: 'fixed',
        left: 14,
        bottom: 14,
        zIndex: 99999,
        width: 420,
        maxWidth: 'calc(100vw - 28px)',
      }}
      data-d8="TV_CHANNELS_v1_20260201a"
    >
      <style jsx global>{
        /* D8_TV_CHANNELS self-contained styling (does not touch your main UI) */
        [data-d8="TV_CHANNELS_v1_20260201a"] { pointer-events: auto; }
        [data-d8="TV_CHANNELS_v1_20260201a"] .d8-panel{
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);
          background: linear-gradient(180deg, rgba(20,24,34,0.72), rgba(10,12,18,0.66));
          box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 18px 60px rgba(0,0,0,0.65);
          color: rgba(255,255,255,0.92);
          backdrop-filter: blur(10px);
        }
        [data-d8="TV_CHANNELS_v1_20260201a"] .d8-chip{
          display: inline-flex;
          gap: 8px;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.10);
          font-size: 12px;
          line-height: 1;
          user-select: none;
        }
        [data-d8="TV_CHANNELS_v1_20260201a"] .d8-btn{
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.92);
          cursor: pointer;
          user-select: none;
        }
        [data-d8="TV_CHANNELS_v1_20260201a"] .d8-btn--ghost{
          background: rgba(255,255,255,0.02);
        }
        [data-d8="TV_CHANNELS_v1_20260201a"] .d8-btn--solid{
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
        }
        [data-d8="TV_CHANNELS_v1_20260201a"] .d8-btn:hover{
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.18);
        }
        [data-d8="TV_CHANNELS_v1_20260201a"] .d8-card{
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
        }
        [data-d8="TV_CHANNELS_v1_20260201a"] .d8-divider{
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
      }</style>

      <div className="d8-panel" style={{ padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge ok={okCount -ge 2} text={"D8 TV  â€¢  " + okCount + "/4"} />
            <span style={{ fontSize: 12, opacity: 0.72 }}>{isoNow()}</span>
          </div>
          <button className="d8-btn d8-btn--ghost" style={{ padding: '6px 10px', borderRadius: 999 }} onClick={() => setOpen((v) => !v)} type="button">
            {open ? 'Hide' : 'Show'}
          </button>
        </div>

        {open && (
          <>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tab id="deploy" current={ch} label="Deploy" onClick={setCh} />
              <Tab id="agents" current={ch} label="Agents" onClick={setCh} />
              <Tab id="kv" current={ch} label="KV" onClick={setCh} />
              <Tab id="routes" current={ch} label="Routes" onClick={setCh} />
            </div>

            <div className="d8-divider" style={{ margin: '10px 0' }} />

            {ch === 'deploy' && (
              <div style={{ display: 'grid', gap: 10 }}>
                <div className="d8-card" style={{ padding: 10 }}>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Core</div>
                  <KVRow k="route" v={typeof window !== 'undefined' ? window.location.pathname : '(ssr)'} />
                  <KVRow k="tick" v={String(tick)} />
                </div>

                <div className="d8-card" style={{ padding: 10 }}>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Stamp</div>
                  <KVRow k="ok" v={String(stamp?.ok ?? '(loading)')} />
                  <KVRow k="status" v={String(stamp?.status ?? '(none)')} />
                  <KVRow k="ms" v={stamp ? String(stamp.ms) : '(none)'} />
                  <KVRow k="stamp" v={String(stamp?.data?.stamp ?? '(none)')} />
                  <KVRow k="env" v={String(stamp?.data?.env ?? '(none)')} />
                  {stamp?.err ? <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>error: {stamp.err}</div> : null}
                </div>

                <div className="d8-card" style={{ padding: 10 }}>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Proof</div>
                  <KVRow k="ok" v={String(proof?.ok ?? '(loading)')} />
                  <KVRow k="region" v={String(proof?.data?.vercel?.region ?? '(none)')} />
                  <KVRow k="vercelEnv" v={String(proof?.data?.vercel?.env ?? '(none)')} />
                  <KVRow k="git" v={String(proof?.data?.vercel?.gitCommit ?? '(none)')} />
                  {proof?.err ? <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>error: {proof.err}</div> : null}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a className="d8-btn d8-btn--ghost" style={{ padding: '8px 10px', borderRadius: 999, textDecoration: 'none' }} href="/api/__d8__/stamp" target="_blank" rel="noreferrer">Open stamp</a>
                  <a className="d8-btn d8-btn--ghost" style={{ padding: '8px 10px', borderRadius: 999, textDecoration: 'none' }} href="/api/__d8__/proof" target="_blank" rel="noreferrer">Open proof</a>
                  <a className="d8-btn d8-btn--ghost" style={{ padding: '8px 10px', borderRadius: 999, textDecoration: 'none' }} href="/api/__d8__/where" target="_blank" rel="noreferrer">Open where</a>
                </div>
              </div>
            )}

            {ch === 'agents' && (
              <div style={{ display: 'grid', gap: 10 }}>
                <div className="d8-card" style={{ padding: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Agent probes</div>
                    <button className="d8-btn d8-btn--ghost" style={{ padding: '6px 10px', borderRadius: 999 }} onClick={() => refreshAgents().catch(() => {})} type="button">
                      Refresh
                    </button>
                  </div>
                  <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                    {agents.length === 0 ? (
                      <div style={{ fontSize: 12, opacity: 0.72 }}>No probes yet.</div>
                    ) : agents.map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ fontSize: 12, opacity: 0.9, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, ""Liberation Mono"", ""Courier New"", monospace' }}>
                          {String(r.data?.url || '')}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.85 }}>
                          {r.ok ? ('OK ' + r.status) : ('FAIL ' + (r.status || '0'))} â€¢ {r.ms}ms
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>
                    Tip: 404 is fine here â€” it tells you exactly whatâ€™s missing on this deploy.
                  </div>
                </div>
              </div>
            )}

            {ch === 'kv' && (
              <div style={{ display: 'grid', gap: 10 }}>
                <div className="d8-card" style={{ padding: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>KV env presence</div>
                    <a className="d8-btn d8-btn--ghost" style={{ padding: '6px 10px', borderRadius: 999, textDecoration: 'none' }} href="/api/__d8__/kv" target="_blank" rel="noreferrer">
                      Open
                    </a>
                  </div>

                  <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                    <KVRow k="ok" v={String(kv?.ok ?? '(loading)')} />
                    <KVRow k="KV_REST_API_URL" v={String(kv?.data?.presence?.KV_REST_API_URL ?? '(none)')} />
                    <KVRow k="KV_REST_API_TOKEN" v={String(kv?.data?.presence?.KV_REST_API_TOKEN ?? '(none)')} />
                    <KVRow k="UPSTASH_REDIS_REST_URL" v={String(kv?.data?.presence?.UPSTASH_REDIS_REST_URL ?? '(none)')} />
                    <KVRow k="UPSTASH_REDIS_REST_TOKEN" v={String(kv?.data?.presence?.UPSTASH_REDIS_REST_TOKEN ?? '(none)')} />
                    <KVRow k="UPSTASH_REDIS_URL" v={String(kv?.data?.presence?.UPSTASH_REDIS_URL ?? '(none)')} />
                    <KVRow k="UPSTASH_REDIS_TOKEN" v={String(kv?.data?.presence?.UPSTASH_REDIS_TOKEN ?? '(none)')} />
                  </div>

                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>
                    This reports only true/false (presence). No secrets are returned.
                  </div>
                </div>
              </div>
            )}

            {ch === 'routes' && (
              <div style={{ display: 'grid', gap: 10 }}>
                <div className="d8-card" style={{ padding: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Route smoke checks</div>
                    <button className="d8-btn d8-btn--ghost" style={{ padding: '6px 10px', borderRadius: 999 }} onClick={() => refreshRoutes().catch(() => {})} type="button">
                      Refresh
                    </button>
                  </div>

                  <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                    {routes.length === 0 ? (
                      <div style={{ fontSize: 12, opacity: 0.72 }}>No checks yet.</div>
                    ) : routes.map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ fontSize: 12, opacity: 0.9, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, ""Liberation Mono"", ""Courier New"", monospace' }}>
                          {String(r.data?.url || '')}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.85 }}>
                          {r.ok ? ('OK ' + r.status) : ('FAIL ' + (r.status || '0'))} â€¢ {r.ms}ms
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>
                    Use this to instantly spot 404s after deploys.
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}