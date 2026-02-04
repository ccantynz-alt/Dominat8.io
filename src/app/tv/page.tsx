"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type FetchResult = {
  ok: boolean;
  status: number | null;
  body: string;
  at: string;
};

function nowIso() {
  try { return new Date().toISOString(); } catch { return "" as any; }
}

async function fetchText(url: string, timeoutMs: number): Promise<FetchResult> {
  const at = nowIso();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: ctrl.signal,
      headers: { "cache-control": "no-store" },
    });

    const body = await res.text();
    return { ok: res.ok, status: res.status, body, at };
  } catch (e: any) {
    const msg = (e && e.name === "AbortError")
      ? "TIMEOUT"
      : ("FETCH_ERROR: " + (e?.message ?? String(e)));
    return { ok: false, status: null, body: msg, at };
  } finally {
    clearTimeout(t);
  }
}

export default function TvPage() {
  const base = (process.env.NEXT_PUBLIC_STAGING_BASE_URL || "").replace(/\/+$/, "");
  const baseMissing = !base;

  const healthUrl = useMemo(() => baseMissing ? "" : `${base}/healthz`, [base, baseMissing]);
  const stampUrl  = useMemo(() => baseMissing ? "" : `${base}/api/debug/stamp`, [base, baseMissing]);

  const [health, setHealth] = useState<FetchResult | null>(null);
  const [stamp, setStamp]   = useState<FetchResult | null>(null);
  const [tick, setTick]     = useState<number>(0);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (baseMissing) return;

    async function pollOnce() {
      const ts = Math.floor(Date.now() / 1000);
      const h = await fetchText(`${healthUrl}?ts=${ts}`, 12000);
      const s = await fetchText(`${stampUrl}?ts=${ts}`, 12000);
      setHealth(h);
      setStamp(s);
      setTick((x) => x + 1);
    }

    // immediate, then every 5s
    pollOnce();
    timerRef.current = setInterval(pollOnce, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [baseMissing, healthUrl, stampUrl]);

  const isGreen = !!health?.ok && !!stamp?.ok;

  const promoteCmd =
`powershell -NoProfile -ExecutionPolicy Bypass \`
  -File ".\\D8_IO_PROMOTE_STAGING_TO_LIVE_001.ps1" \`
  -RepoRoot "C:\\Temp\\FARMS\\Dominat8.io-clone"`;

  return (
    <main style={{
      minHeight: "100vh",
      padding: 24,
      background: "#05070a",
      color: "#eaf0ff",
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 0.2 }}>DOMINAT8 TV — STAGING</div>
          <div style={{ marginTop: 6, opacity: 0.8 }}>
            Refresh: 5s · Tick: {tick} · Now: {nowIso()}
          </div>
        </div>

        <div style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.12)",
          background: isGreen ? "rgba(0,255,160,0.12)" : "rgba(255,64,64,0.12)",
          color: isGreen ? "#73ffcb" : "#ff8c8c",
          fontWeight: 800,
          minWidth: 120,
          textAlign: "center"
        }}>
          {baseMissing ? "ENV MISSING" : (isGreen ? "GREEN" : "RED")}
        </div>
      </div>

      <div style={{ marginTop: 18, padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)" }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>NEXT_PUBLIC_STAGING_BASE_URL</div>
        <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace", opacity: 0.9 }}>
          {baseMissing ? "(NOT SET — set NEXT_PUBLIC_STAGING_BASE_URL in the service that serves /tv)" : base}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginTop: 18 }}>
        <section style={{ padding: 14, borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 800 }}>STAGING /healthz</div>
            <div style={{ opacity: 0.75, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace" }}>
              {healthUrl || "(missing env)"}
            </div>
          </div>
          <div style={{ marginTop: 8, opacity: 0.85 }}>at: {health?.at || "-" } · status: {health?.status ?? "-"}</div>
          <pre style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 10,
            overflowX: "auto",
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 12
          }}>{health?.body || ""}</pre>
        </section>

        <section style={{ padding: 14, borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 800 }}>STAGING /api/debug/stamp</div>
            <div style={{ opacity: 0.75, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace" }}>
              {stampUrl || "(missing env)"}
            </div>
          </div>
          <div style={{ marginTop: 8, opacity: 0.85 }}>at: {stamp?.at || "-" } · status: {stamp?.status ?? "-"}</div>
          <pre style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 10,
            overflowX: "auto",
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 12
          }}>{stamp?.body || ""}</pre>
        </section>

        <section style={{ padding: 14, borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)" }}>
          <div style={{ fontWeight: 800 }}>PROMOTE (manual, guarded)</div>
          <div style={{ marginTop: 8, opacity: 0.85 }}>
            This is intentionally not auto-run. Copy/paste when you decide to promote.
          </div>
          <pre style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 10,
            overflowX: "auto",
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 12
          }}>{promoteCmd}</pre>
        </section>
      </div>
    </main>
  );
}
