"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Pt = { x: number; y: number };
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

export default function HomePage() {
  const [pos, setPos] = useState<Pt>({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  const target = useRef<Pt>({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const last = useRef<Pt>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!hasMoved) setHasMoved(true);
    };

    const tick = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const fallback = { x: w * 0.55, y: h * 0.35 };

      const desiredX = hasMoved ? target.current.x : fallback.x;
      const desiredY = hasMoved ? target.current.y : fallback.y;

      const nx = last.current.x + (desiredX - last.current.x) * 0.18;
      const ny = last.current.y + (desiredY - last.current.y) * 0.18;

      last.current = { x: nx, y: ny };
      setPos({ x: nx, y: ny });

      rafId.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove as any);
      if (rafId.current) window.cancelAnimationFrame(rafId.current);
    };
  }, [hasMoved]);

  const glowStyle = useMemo(() => {
    const x = clamp(pos.x, 0, window.innerWidth);
    const y = clamp(pos.y, 0, window.innerHeight);
    return {
      background: `radial-gradient(600px circle at ${x}px ${y}px,
        rgba(120, 255, 220, 0.14),
        rgba(120, 255, 220, 0.07) 25%,
        rgba(90, 140, 255, 0.06) 45%,
        rgba(0, 0, 0, 0) 70%)`,
    } as React.CSSProperties;
  }, [pos.x, pos.y]);

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={glowStyle} />

      <section className="relative min-h-[92vh] flex items-center justify-center px-6">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/90" />
            Cursor-glow WOW hero (restored)
          </div>

          <h1 className="mt-8 text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.02]">
            The <span className="text-white">WOW</span> website builder{" "}
            <span className="text-white/85">built by AI</span>{" "}
            <span className="text-white">— shipped fast.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            Generate a real site. Refine it. SEO it. Publish it.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/" className="rounded-xl bg-white text-black px-6 py-3 text-sm font-semibold hover:bg-white/90 transition">
              Build my site
            </a>
            <a href="/templates" className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition">
              See templates
            </a>
          </div>

          <div className="mt-10 text-xs uppercase tracking-[0.28em] text-white/45">
            D8_WOW_BUILT_BY_AI_SHIPPED_FAST_2026-01-25
          </div>
        </div>
      </section>
    </main>
  );
}
