"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Phase =
  | "idle"
  | "frameIn"
  | "typing"
  | "heroIn"
  | "sectionsIn"
  | "pricingIn"
  | "badgesIn"
  | "done";

type Badge = { label: string; done: boolean };

const SESSION_KEY = "d8_home_demo_v1_played";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(!!mq.matches);
    update();
    if (typeof mq.addEventListener === "function") mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      if (typeof mq.removeEventListener === "function") mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);
  return reduced;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function BrowserDot({ className }: { className?: string }) {
  return <span className={cn("inline-block h-2.5 w-2.5 rounded-full", className)} />;
}

function MiniProgress({ value }: { value: number }) {
  const v = clamp(value, 0, 100);
  return (
    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-white/35 transition-all duration-300"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cn("h-4 w-4", className)} aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.667 13.2 4.4 9.933 3.333 11l4.334 4.334L16.667 6.334 15.6 5.267z"
      />
    </svg>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4", className)} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2l1.6 6.1L20 10l-6.4 1.9L12 18l-1.6-6.1L4 10l6.4-1.9L12 2z"
        opacity="0.9"
      />
    </svg>
  );
}

function useOncePerSession(): [boolean, () => void] {
  const [shouldPlay, setShouldPlay] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const played = window.sessionStorage.getItem(SESSION_KEY);
      setShouldPlay(played !== "1");
    } catch {
      // If sessionStorage is blocked, default to playing once.
      setShouldPlay(true);
    }
  }, []);

  const markPlayed = () => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore
    }
    setShouldPlay(false);
  };

  return [shouldPlay, markPlayed];
}

function useTyping(text: string, active: boolean, speedMs: number) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!active) return;
    let i = 0;
    setOut("");
    const t = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speedMs);
    return () => clearInterval(t);
  }, [text, active, speedMs]);
  return out;
}

function DemoBrowser({
  play,
  onDone,
}: {
  play: boolean;
  onDone: () => void;
}) {
  const reducedMotion = usePrefersReducedMotion();

  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);

  const headlineFull = "Grow your business with a website that converts.";
  const typed = useTyping(headlineFull, phase === "typing" && !reducedMotion, 22);

  const badgesBase: Badge[] = useMemo(
    () => [
      { label: "SEO Ready", done: false },
      { label: "Sitemap Generated", done: false },
      { label: "Published", done: false },
    ],
    []
  );
  const [badges, setBadges] = useState<Badge[]>(badgesBase);

  const timeouts = useRef<number[]>([]);
  const clearAll = () => {
    timeouts.current.forEach((id) => window.clearTimeout(id));
    timeouts.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timeouts.current.push(id);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    clearAll();

    // Reset state whenever play toggles on/off
    setPhase("idle");
    setProgress(0);
    setBadges(badgesBase);

    if (!play) {
      // Calm state: show final, no animation
      setPhase("done");
      setProgress(100);
      setBadges(badgesBase.map((b) => ({ ...b, done: true })));
      return;
    }

    if (reducedMotion) {
      // Reduced motion: skip animation but still communicate the value
      setPhase("done");
      setProgress(100);
      setBadges(badgesBase.map((b) => ({ ...b, done: true })));
      schedule(() => onDone(), 350);
      return;
    }

    // Timeline (~5 seconds total)
    schedule(() => setPhase("frameIn"), 150);
    schedule(() => setPhase("typing"), 520);
    schedule(() => setPhase("heroIn"), 1500);
    schedule(() => setPhase("sectionsIn"), 2300);
    schedule(() => setPhase("pricingIn"), 3100);
    schedule(() => setPhase("badgesIn"), 3700);
    schedule(() => setPhase("done"), 5000);
    schedule(() => onDone(), 5200);

    // Smooth progress
    const progTimers: Array<[number, number]> = [
      [650, 18],
      [1150, 32],
      [1750, 46],
      [2400, 62],
      [3150, 78],
      [3850, 92],
      [5000, 100],
    ];
    progTimers.forEach(([ms, val]) => schedule(() => setProgress(val), ms));

    // Badges tick
    schedule(
      () => setBadges((prev) => prev.map((b, i) => (i === 0 ? { ...b, done: true } : b))),
      3950
    );
    schedule(
      () => setBadges((prev) => prev.map((b, i) => (i === 1 ? { ...b, done: true } : b))),
      4350
    );
    schedule(
      () => setBadges((prev) => prev.map((b, i) => (i === 2 ? { ...b, done: true } : b))),
      4750
    );

    return () => clearAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, reducedMotion]); // badgesBase is stable via useMemo

  const showCursor = phase === "typing" && typed.length < headlineFull.length;

  const finalHeadline = reducedMotion || phase === "done" ? headlineFull : typed;

  return (
    <div className="relative">
      {/* Soft glow behind the demo */}
      <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-b from-white/12 via-white/6 to-transparent blur-2xl" />

      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-white/12 bg-black/35 shadow-2xl backdrop-blur-xl",
          "transition-transform duration-700",
          play && phase !== "idle" ? "translate-y-0 opacity-100" : "translate-y-2 opacity-95"
        )}
      >
        {/* Browser bar */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-black/35 px-4 py-3">
          <div className="flex items-center gap-2">
            <BrowserDot className="bg-red-400/80" />
            <BrowserDot className="bg-yellow-300/80" />
            <BrowserDot className="bg-green-400/80" />
          </div>
          <div className="flex-1">
            <div className="mx-auto flex max-w-[420px] items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
              dominat8.com / preview
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-white/60">
            <Sparkle className="opacity-80" />
            <span className="text-[11px] tracking-wide">Live Builder</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Top: headline typing */}
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/55">
                Generating homepage
              </div>
              <div className="text-[11px] text-white/55">{progress}%</div>
            </div>
            <MiniProgress value={progress} />
            <div className="mt-4 text-sm sm:text-base font-semibold text-white">
              <span>{finalHeadline}</span>
              {showCursor && (
                <span className="ml-1 inline-block w-[8px] animate-pulse rounded-sm bg-white/80 align-middle">
                  &nbsp;
                </span>
              )}
            </div>
            <div className="mt-2 text-xs text-white/60">
              Sections assemble automatically — no coding, no templates, no fuss.
            </div>
          </div>

          {/* Middle: sections (slide in) */}
          <div className="grid gap-3">
            <div
              className={cn(
                "rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-700",
                phase === "heroIn" || phase === "sectionsIn" || phase === "pricingIn" || phase === "badgesIn" || phase === "done"
                  ? "translate-x-0 opacity-100"
                  : "translate-x-2 opacity-0"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white">Hero</div>
                <div className="text-[11px] text-white/55">Headline + CTA</div>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="h-2 w-2/3 rounded-full bg-white/20" />
                <div className="h-2 w-1/3 rounded-full bg-white/10" />
              </div>
              <div className="mt-3 h-8 w-28 rounded-full bg-white/15" />
            </div>

            <div
              className={cn(
                "rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-700",
                phase === "sectionsIn" || phase === "pricingIn" || phase === "badgesIn" || phase === "done"
                  ? "translate-x-0 opacity-100"
                  : "translate-x-2 opacity-0"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white">Features</div>
                <div className="text-[11px] text-white/55">Trust + clarity</div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="h-10 rounded-xl bg-white/10" />
                <div className="h-10 rounded-xl bg-white/10" />
                <div className="h-10 rounded-xl bg-white/10" />
              </div>
            </div>

            <div
              className={cn(
                "rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-700",
                phase === "pricingIn" || phase === "badgesIn" || phase === "done"
                  ? "translate-x-0 opacity-100"
                  : "translate-x-2 opacity-0"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white">Pricing</div>
                <div className="text-[11px] text-white/55">Simple plans</div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[11px] text-white/60">Starter</div>
                  <div className="mt-1 h-3 w-16 rounded-full bg-white/20" />
                  <div className="mt-3 h-8 w-full rounded-lg bg-white/10" />
                </div>
                <div className="rounded-xl border border-white/15 bg-white/8 p-3">
                  <div className="text-[11px] text-white/70">Pro</div>
                  <div className="mt-1 h-3 w-20 rounded-full bg-white/25" />
                  <div className="mt-3 h-8 w-full rounded-lg bg-white/15" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: badges tick */}
          <div
            className={cn(
              "mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-700",
              phase === "badgesIn" || phase === "done" ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-white">Ready to launch</div>
              <div className="text-[11px] text-white/55">Auto-complete</div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {badges.map((b) => (
                <div
                  key={b.label}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
                    b.done ? "border-white/18 bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/70"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full border",
                      b.done ? "border-white/25 bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/50"
                    )}
                  >
                    {b.done ? <CheckIcon /> : <span className="text-[10px]">•</span>}
                  </span>
                  <span className="tracking-wide">{b.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 text-xs text-white/60">
              Animation plays once — then the page stays calm and readable.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomeClient() {
  const [shouldPlay, markPlayed] = useOncePerSession();

  // When the demo completes, mark session as played so it won't repeat
  const handleDone = () => markPlayed();

  return (
    <section className="relative w-full">
      <div className="mx-auto w-full max-w-7xl px-6 py-14 sm:py-18 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left: hero copy */}
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs text-white/75">
              <Sparkle className="opacity-80" />
              <span className="tracking-[0.18em] uppercase">AI Website Automation</span>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Your site, built for you.
              <span className="block text-white/80">From idea to published — fast.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70">
              Dominat8 assembles a conversion-focused website automatically: structure, sections, and launch-ready output —
              without the usual setup.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="/builder"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-black/20 transition hover:opacity-90"
              >
                Start building
              </a>

              <a
                href="/templates"
                className="inline-flex items-center justify-center rounded-xl border border-white/14 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/8"
              >
                View examples
              </a>

              <div className="ml-0 mt-2 w-full text-xs text-white/55 sm:ml-2 sm:mt-0 sm:w-auto">
                No credit card required
              </div>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-white">Fast</div>
                <div className="mt-1 text-xs text-white/60">Assembles pages in minutes</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-white">Structured</div>
                <div className="mt-1 text-xs text-white/60">Designed to convert</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-white">Launch-ready</div>
                <div className="mt-1 text-xs text-white/60">SEO + sitemap included</div>
              </div>
            </div>
          </div>

          {/* Right: live builder preview demo */}
          <div className="relative lg:pl-2">
            <DemoBrowser play={shouldPlay} onDone={handleDone} />
          </div>
        </div>
      </div>
    </section>
  );
}