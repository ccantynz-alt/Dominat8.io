"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type HealthState = {
  ok: boolean;
  code?: number;
  text?: string;
  atUtc?: string;
};

function nowUtc(): string {
  const d = new Date();
  return d.toISOString();
}

async function fetchHealth(url: string): Promise<HealthState> {
  try {
    const ts = Math.floor(Date.now() / 1000);
    const u = url.includes("?") ? `${url}&ts=${ts}` : `${url}?ts=${ts}`;
    const res = await fetch(u, { cache: "no-store" });
    const text = await res.text().catch(() => "");
    return { ok: res.ok, code: res.status, text: text?.slice(0, 160) ?? "", atUtc: nowUtc() };
  } catch (e: any) {
    return { ok: false, code: 0, text: String(e?.message ?? e ?? "unknown"), atUtc: nowUtc() };
  }
}

function cls(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export default function Home() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [mode, setMode] = useState<"staging" | "live">("staging");
  const [health, setHealth] = useState<HealthState>({ ok: false, code: 0, text: "booting...", atUtc: nowUtc() });

  const [prompt, setPrompt] = useState<string>("");

  const tvUrl = useMemo(() => {
    // IMPORTANT: This assumes /tv exists (it does in this repo).
    // mode is purely for your UI + future wiring; safe even if /tv ignores it.
    const base = `/tv?mode=${encodeURIComponent(mode)}`;
    return base;
  }, [mode]);

  const ioUrl = useMemo(() => `/io`, []);
  const sitesUrl = useMemo(() => `/sites`, []);

  // restore prompt
  useEffect(() => {
    try {
      const v = localStorage.getItem("d8_prompt") ?? "";
      setPrompt(v);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("d8_prompt", prompt ?? "");
    } catch {}
  }, [prompt]);

  // health poll
  useEffect(() => {
    let dead = false;

    async function tick() {
      const h = await fetchHealth("/api/io/health");
      if (!dead) setHealth(h);
    }

    tick();
    const t = setInterval(tick, 8000);
    return () => {
      dead = true;
      clearInterval(t);
    };
  }, []);

  function postToTv(type: string, payload: any) {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ source: "d8-cockpit", type, payload, atUtc: nowUtc() }, "*");
  }

  function onSendPrompt() {
    const p = (prompt ?? "").trim();
    if (!p) return;
    postToTv("PROMPT", { prompt: p, mode });
  }

  function onSoftRefreshTv() {
    // refresh iframe without full page reload
    if (!iframeRef.current) return;
    iframeRef.current.src = tvUrl + (tvUrl.includes("?") ? "&" : "?") + "r=" + Date.now();
  }

  const healthLabel = health.ok ? "GREEN" : "RED";
  const healthSub = health.code ? `HTTP ${health.code}` : "NO SIGNAL";

  return (
    <div className="min-h-screen w-full bg-black text-white overflow-hidden">
      {/* Fullscreen TV */}
      <div className="fixed inset-0">
        <iframe
          ref={iframeRef}
          title="D8 TV"
          src={tvUrl}
          className="h-full w-full border-0"
          allow="clipboard-read; clipboard-write"
        />
        {/* subtle vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/55" />
      </div>

      {/* Cockpit overlay */}
      <div className="relative z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur">
              <div className="text-sm font-semibold tracking-wide">DOMINAT8 — COCKPIT</div>
              <div className="text-[11px] opacity-70">Product-first landing (TV is the homepage)</div>
            </div>

            <button
              onClick={() => setMode(mode === "staging" ? "live" : "staging")}
              className={cls(
                "rounded-xl px-3 py-2 text-sm font-semibold backdrop-blur border transition",
                mode === "staging"
                  ? "bg-blue-500/15 border-blue-400/25 hover:bg-blue-500/20"
                  : "bg-emerald-500/15 border-emerald-400/25 hover:bg-emerald-500/20"
              )}
              title="Toggle mode (staging vs live)"
            >
              MODE: {mode.toUpperCase()}
            </button>

            <button
              onClick={onSoftRefreshTv}
              className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur border border-white/10 hover:bg-white/15 transition"
              title="Soft refresh TV"
            >
              REFRESH TV
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={cls(
                "rounded-xl px-3 py-2 text-sm font-semibold backdrop-blur border",
                health.ok ? "bg-emerald-500/15 border-emerald-400/25" : "bg-red-500/15 border-red-400/25"
              )}
              title={health.text || ""}
            >
              <div className="flex items-center gap-2">
                <span className={cls("inline-block h-2.5 w-2.5 rounded-full", health.ok ? "bg-emerald-400" : "bg-red-400")} />
                <span>{healthLabel}</span>
                <span className="opacity-70 text-xs font-normal">{healthSub}</span>
              </div>
              <div className="opacity-60 text-[11px] mt-0.5">/api/io/health • {health.atUtc}</div>
            </div>
          </div>
        </div>

        {/* Bottom dock + prompt injector */}
        <div className="fixed bottom-0 left-0 right-0 p-4">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl bg-black/40 backdrop-blur border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Dock */}
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={tvUrl}
                    className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold border border-white/10 hover:bg-white/15 transition"
                    title="Open TV"
                  >
                    TV
                  </a>
                  <a
                    href={ioUrl}
                    className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold border border-white/10 hover:bg-white/15 transition"
                    title="Open IO"
                  >
                    IO
                  </a>
                  <a
                    href={sitesUrl}
                    className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold border border-white/10 hover:bg-white/15 transition"
                    title="Open Sites"
                  >
                    SITES
                  </a>

                  <button
                    onClick={() => postToTv("PING", { mode })}
                    className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold border border-white/10 hover:bg-white/15 transition"
                    title="PostMessage ping to TV"
                  >
                    PING TV
                  </button>
                </div>

                {/* Prompt injector */}
                <div className="flex items-center gap-2">
                  <input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Inject a prompt into the TV (postMessage)…"
                    className="w-[min(560px,70vw)] rounded-xl bg-black/50 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/25"
                  />
                  <button
                    onClick={onSendPrompt}
                    className="rounded-xl bg-white text-black px-3 py-2 text-sm font-extrabold hover:opacity-90 transition"
                    title="Send prompt to TV via postMessage"
                  >
                    SEND
                  </button>
                </div>
              </div>

              <div className="px-4 pb-3 text-[11px] opacity-70">
                Tip: This landing is intentionally “TV-first”. The dock and prompt injector are overlays; TV can ignore messages until you wire it.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* tiny finish stamp for proof */}
      <div className="pointer-events-none fixed left-3 top-[68px] z-10 text-[10px] opacity-40">
        FINISH_STAMP_PRODUCT_FIRST_{new Date().toISOString()}
      </div>
    </div>
  );
}