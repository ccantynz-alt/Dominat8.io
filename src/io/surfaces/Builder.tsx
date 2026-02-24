"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import FOG from "vanta/dist/vanta.fog.min";
import * as THREE from "three";
import AquariumBackground from "@/components/AquariumBackground";
import { useSpeechRecognition } from "@/io/hooks/useSpeechRecognition";

// ─── Types ────────────────────────────────────────────────────────────────────

type BuildState = "idle" | "generating" | "done" | "error";

type Deployment = {
  domain: string;
  desc: string;
  status: string;
  pill: string;
  progress: number;
  icon: string;
};

interface Site {
  id: string;
  prompt: string;
  industry: string;
  html: string;
  createdAt: Date;
  tokens?: number;
  durationMs?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  { label: "Restaurant", icon: "🍽️" },
  { label: "Law Firm", icon: "⚖️" },
  { label: "SaaS", icon: "⚡" },
  { label: "Real Estate", icon: "🏠" },
  { label: "Fitness", icon: "💪" },
  { label: "E-commerce", icon: "🛍️" },
  { label: "Portfolio", icon: "✦" },
  { label: "Medical", icon: "🏥" },
  { label: "Agency", icon: "🚀" },
  { label: "Construction", icon: "🔨" },
];

const EXAMPLE_PROMPTS = [
  "A luxury plumbing company in Auckland — premium, trustworthy, modern",
  "A boutique coffee roastery in Brooklyn with a subscription service",
  "A personal injury law firm that wins cases and takes no prisoners",
  "A cutting-edge SaaS tool that automates customer support with AI",
  "A high-end wedding photography studio in Melbourne",
];

const VIBES = [
  { label: "Minimal",   icon: "○", hint: "Ultra-clean, whitespace-heavy. Monochrome with one precise accent. Typography-led, no decoration." },
  { label: "Bold",      icon: "■", hint: "Maximum visual impact. Oversized type, high-contrast shapes, hero that punches you in the face." },
  { label: "Luxury",    icon: "◆", hint: "Premium editorial. Dark bg, gold/platinum accents, tight serif display font, vast whitespace." },
  { label: "Dark",      icon: "◉", hint: "Full dark mode. Neon glowing accents, subtle grid-line bg, cyberpunk-adjacent but professional." },
  { label: "Playful",   icon: "✦", hint: "Vibrant gradients, rounded friendly shapes, personality-forward. Warm, inviting, energetic." },
  { label: "Corporate", icon: "▲", hint: "Polished and trustworthy. Blue tones, measured layout, clear hierarchy, enterprise-ready." },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useTypewriter(texts: string[], interval = 4000) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const target = texts[index];
    if (charIdx < target.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 28);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setIndex((i) => (i + 1) % texts.length);
        setCharIdx(0);
      }, interval);
      return () => clearTimeout(t);
    }
  }, [charIdx, index, texts, interval]);

  useEffect(() => {
    setDisplayed(texts[index].slice(0, charIdx));
  }, [charIdx, index, texts]);

  return displayed;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Dots() {
  return (
    <span className="d8b-dots">
      <span /><span /><span />
    </span>
  );
}

function InputLeadIcon() {
  return (
    <span className="d8h-input-icon" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18M5 12l14 0M3 8l6 4 6-4" />
      </svg>
    </span>
  );
}

function MicIcon({ listening }: { listening: boolean }) {
  return (
    <span className={`d8h-mic-icon ${listening ? "d8h-mic-icon--active" : ""}`} aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
      </svg>
    </span>
  );
}

function SiteCard({ site, onSelect }: { site: Site; onSelect: () => void }) {
  const age = Math.round((Date.now() - site.createdAt.getTime()) / 1000);
  const ageStr = age < 60 ? `${age}s ago` : `${Math.round(age / 60)}m ago`;

  return (
    <button className="d8b-site-card" onClick={onSelect} type="button">
      <div className="d8b-site-preview">
        <iframe
          srcDoc={site.html}
          sandbox="allow-scripts"
          className="d8b-site-thumb"
          title={`Preview: ${site.prompt}`}
        />
        <div className="d8b-site-overlay" />
      </div>
      <div className="d8b-site-meta">
        <div className="d8b-site-name">{site.industry || "Site"}</div>
        <div className="d8b-site-age">{ageStr}</div>
      </div>
    </button>
  );
}

// Social proof — monitor + sites built today
const SITE_PREVIEWS = [
  { bar: "rgba(212,175,55,0.5)", body: "linear-gradient(180deg, rgba(212,175,55,0.08), rgba(26,15,0,0.5))", accent: "#D4AF37" },
  { bar: "rgba(56,189,248,0.4)", body: "linear-gradient(180deg, rgba(56,189,248,0.06), rgba(26,15,0,0.5))", accent: "#38BDF8" },
  { bar: "rgba(56,201,164,0.4)", body: "linear-gradient(180deg, rgba(56,201,164,0.06), rgba(26,15,0,0.5))", accent: "#38C9A4" },
  { bar: "rgba(240,146,74,0.4)", body: "linear-gradient(180deg, rgba(240,146,74,0.06), rgba(26,15,0,0.5))", accent: "#F0924A" },
  { bar: "rgba(124,92,255,0.4)", body: "linear-gradient(180deg, rgba(124,92,255,0.06), rgba(26,15,0,0.5))", accent: "#7C5CFF" },
];

function SocialProof() {
  const [count, setCount] = React.useState(() => {
    const d = new Date();
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    return 2400 + (seed % 600);
  });
  const [siteIndex, setSiteIndex] = React.useState(0);
  const preview = SITE_PREVIEWS[siteIndex % SITE_PREVIEWS.length];

  React.useEffect(() => {
    const tick = () => setCount(c => c + Math.floor(Math.random() * 3) + 1);
    const id = setInterval(tick, 8000 + Math.random() * 7000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    const rot = setInterval(() => setSiteIndex(i => i + 1), 4000);
    return () => clearInterval(rot);
  }, []);

  return (
    <div className="d8h-social-proof">
      <div className="d8h-sp-monitor" aria-hidden>
        <div className="d8h-sp-monitor-frame">
          <div className="d8h-sp-monitor-screen">
            <div className="d8h-sp-monitor-bar" style={{ background: preview.bar }} />
            <div className="d8h-sp-monitor-body" style={{ background: preview.body }}>
              <div className="d8h-sp-monitor-hero" style={{ background: preview.accent }} />
              <div className="d8h-sp-monitor-cards">
                <span /><span /><span />
              </div>
            </div>
          </div>
          <div className="d8h-sp-monitor-stand" />
        </div>
      </div>
      <div className="d8h-sp-stat-wrap">
        <span className="d8h-sp-stat">{count.toLocaleString()}</span>
        <span className="d8h-sp-label">sites built today</span>
      </div>
    </div>
  );
}

function GeneratingAnimation({ progress }: { progress: number }) {
  return (
    <div className="d8b-gen-anim">
      <div className="d8b-gen-ring">
        <svg viewBox="0 0 80 80" className="d8b-gen-svg">
          <circle cx="40" cy="40" r="34" className="d8b-gen-track" />
          <circle
            cx="40" cy="40" r="34"
            className="d8b-gen-arc"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
          />
        </svg>
        <span className="d8b-gen-pct">{Math.round(progress)}%</span>
      </div>
      <div className="d8b-gen-label">
        Building your site<Dots />
      </div>
      <div className="d8b-gen-sub">AI is crafting your design in real time</div>
    </div>
  );
}

// ─── Deployments hook ─────────────────────────────────────────────────────────

function useDeployments() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    async function poll() {
      try {
        const res = await fetch("/api/tv/deployments", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (alive && Array.isArray(data.deployments)) {
          setDeployments(data.deployments);
          setLoaded(true);
        }
      } catch { /* silent */ }
    }
    poll();
    const id = setInterval(poll, 8000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return { deployments, loaded };
}

// ─── Dock icons (SVG) ─────────────────────────────────────────────────────────

function DockIcon({ name }: { name: string }) {
  const w = 20; const h = 20;
  const stroke = "currentColor"; const sw = 1.5;
  const svgs: Record<string, React.ReactNode> = {
    Deploy: (
      <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" />
      </svg>
    ),
    Domains: (
      <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    SSL: (
      <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    Monitor: (
      <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><path d="M8 21h8M12 17v4" />
      </svg>
    ),
    Logs: (
      <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    Fix: (
      <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    Automate: (
      <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    Integrate: (
      <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    Settings: (
      <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  };
  return <span className="dock-icon-svg">{svgs[name] ?? null}</span>;
}

interface DockItem {
  label: string;
  href: string | null;
}

const DOCK_ITEMS: DockItem[] = [
  { label: "Deploy",    href: "/cockpit/deploy" },
  { label: "Domains",   href: "/cockpit/domain" },
  { label: "SSL",       href: "/cockpit/ssl" },
  { label: "Monitor",   href: "/cockpit/monitor" },
  { label: "Logs",      href: "/cockpit/logs" },
  { label: "Fix",       href: "/cockpit/fix" },
  { label: "Automate",  href: "/cockpit/animate" },
  { label: "Integrate", href: "/cockpit/integrate" },
  { label: "Settings",  href: "/cockpit/settings" },
];

// ─── localStorage history persistence ─────────────────────────────────────────

const LS_KEY = "d8_sites_v1";

function loadSavedSites(): Site[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Omit<Site, "createdAt"> & { createdAt: string }>;
    return parsed.map(s => ({ ...s, createdAt: new Date(s.createdAt) }));
  } catch { return []; }
}

function saveSites(sites: Site[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(sites)); } catch { /* quota */ }
}

// ─── Deployment pill color ─────────────────────────────────────────────────────

function pillStyle(pill: string): { color: string; bg: string; border: string } {
  if (pill === "OK" || pill === "LIVE")
    return { color: "rgba(56,248,166,0.95)", bg: "rgba(56,248,166,0.12)", border: "rgba(56,248,166,0.30)" };
  if (pill === "TODO" || pill === "PENDING")
    return { color: "rgba(255,209,102,0.95)", bg: "rgba(255,209,102,0.12)", border: "rgba(255,209,102,0.30)" };
  return { color: "rgba(255,255,255,0.60)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.14)" };
}

function barColor(progress: number, status: string): string {
  if (status === "LIVE" || status === "OK") return "linear-gradient(90deg,#38F8A6,#29E09A)";
  if (status === "DEPLOYING" || (progress > 60 && progress < 90)) return "linear-gradient(90deg,#F0924A,#E07A38)";
  return "linear-gradient(90deg,#4A90E2,#6AABF0)";
}

function deployIcon(icon: string): string {
  if (icon === "rocket") return "🚀";
  if (icon === "globe")  return "🌐";
  if (icon === "bot")    return "🤖";
  return "⚙️";
}

// ─── Main Builder ─────────────────────────────────────────────────────────────

export function Builder() {
  const [prompt, setPrompt] = useState("");
  const [industry, setIndustry] = useState("");
  const [state, setState] = useState<BuildState>("idle");
  const [html, setHtml] = useState("");
  const [progress, setProgress] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [sites, setSites] = useState<Site[]>(() => {
    if (typeof window === "undefined") return [];
    return loadSavedSites();
  });
  const [activeSite, setActiveSite] = useState<Site | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [sidebarTab, setSidebarTab] = useState<"new" | "history">("new");
  const [showDeploy, setShowDeploy] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "sharing" | "copied" | "error">("idle");
  const [showRefine, setShowRefine] = useState(false);
  const [refineInput, setRefineInput] = useState("");
  const [basePrompt, setBasePrompt] = useState(""); // original prompt before any refinements
  const [vibe, setVibe] = useState("");
  const [fixState, setFixState] = useState<"idle" | "fixing">("idle");
  const [showSeo, setShowSeo] = useState(false);
  const [seoState, setSeoState] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [seoData, setSeoData] = useState<{
    score: number; grade: string; summary: string;
    issues: { severity: string; category: string; message: string; fix: string }[];
    strengths: string[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backgroundMode, setBackgroundMode] = useState<"fog" | "aquarium">("fog");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const startRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<ReturnType<typeof FOG> | null>(null);

  // Abort any in-flight generation when the component unmounts
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Gold fog background (Vanta) — only when fog mode is selected; destroy when switching to aquarium
  useEffect(() => {
    if (backgroundMode !== "fog") {
      if (vantaEffect) {
        vantaEffect.destroy();
        setVantaEffect(null);
      }
      return;
    }
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(
        FOG({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          highlightColor: 0xffe066,
          midtoneColor: 0xe6a23c,
          lowlightColor: 0x8b6914,
          baseColor: 0x1a0f00,
          blurFactor: 0.5,
          speed: 1.5,
          zoom: 0.5,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect, backgroundMode]);

  useEffect(() => {
    const dashboard = document.querySelector('.main-interface-container');
    if (!dashboard) return;

    const handleMouseMove = (e: MouseEvent) => {
      const xAxis = (window.innerWidth / 2 - e.pageX) / 40;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 40;
      (dashboard as HTMLElement).style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const placeholder = useTypewriter(EXAMPLE_PROMPTS);
  const { deployments, loaded } = useDeployments();
  const searchParams = useSearchParams();
  const { isListening, startListening } = useSpeechRecognition({
    onTranscript: (text) => {
      setPrompt(text);
    },
  });

  // Pre-fill prompt from URL ?prompt= param (e.g. from /templates)
  useEffect(() => {
    const p = searchParams?.get("prompt");
    if (p && p.trim()) {
      setPrompt(p.trim());
      // Remove param from URL without page reload
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("prompt");
        window.history.replaceState({}, "", url.toString());
      } catch { /* noop */ }
    }
  }, [searchParams]);

  // Persist history
  useEffect(() => { saveSites(sites); }, [sites]);

  // Update iframe srcDoc in real time (throttled)
  const htmlRef = useRef("");
  useEffect(() => {
    htmlRef.current = html;
  }, [html]);

  const generate = useCallback(async (overridePrompt?: string) => {
    const activePrompt = overridePrompt ?? prompt;
    if (!activePrompt.trim() || state === "generating") return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState("generating");
    setHtml("");
    setProgress(0);
    setActiveSite(null);
    startRef.current = Date.now();
    progressRef.current = 0;

    // Animate progress (fake progress up to 95%, real completion sets 100)
    const progressTimer = setInterval(() => {
      progressRef.current = Math.min(progressRef.current + Math.random() * 3, 94);
      setProgress(progressRef.current);
    }, 300);

    try {
      const res = await fetch("/api/io/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: activePrompt, industry, vibe }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const body = await res.text();
        // Never show raw HTML (e.g. Next.js 404 page) as the error message
        const isHtml = body?.trim().startsWith("<!") || (body?.includes("</html>") ?? false);
        const raw = body?.trim() || "";
        const msg = isHtml
          ? `Server error (${res.status}). The generate API may be unavailable — check that the app is running and /api/io/generate exists.`
          : (raw || `API error: ${res.status}`);
        const displayMsg = msg.length > 500 ? `${msg.slice(0, 497)}…` : msg;
        setErrorMessage(displayMsg);
        throw new Error(msg);
      }
      if (!res.body) {
        setErrorMessage("No response body");
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setHtml(accumulated);
        }
      } finally {
        reader.releaseLock();
      }

      clearInterval(progressTimer);
      setProgress(100);
      const dur = Date.now() - startRef.current;
      setDurationMs(dur);

      const site: Site = {
        id: crypto.randomUUID(),
        prompt: activePrompt,
        industry,
        html: accumulated,
        createdAt: new Date(),
        durationMs: dur,
      };

      setSites((prev) => [site, ...prev]);
      setActiveSite(site);
      setState("done");
    } catch (err: unknown) {
      clearInterval(progressTimer);
      if (err instanceof Error && err.name === "AbortError") {
        setState("idle");
      } else {
        const msg = err instanceof Error ? err.message : "Network or stream error. Check your connection.";
        setErrorMessage(msg);
        setState("error");
      }
    }
  }, [prompt, industry, vibe, state]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      generate();
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setState("idle");
    setErrorMessage(null);
    setHtml("");
    setProgress(0);
    setActiveSite(null);
    setShareState("idle");
    setShowRefine(false);
    setRefineInput("");
    setBasePrompt("");
    setFixState("idle");
    setShowSeo(false);
    setSeoState("idle");
    setSeoData(null);
  };

  const handleRefine = useCallback(() => {
    if (!refineInput.trim() || state === "generating") return;
    const base = basePrompt || prompt;
    const refined = `${base}\n\nRefinement: ${refineInput.trim()}`;
    setPrompt(refined);
    setBasePrompt(base);
    setRefineInput("");
    setShowRefine(false);
    generate(refined);
  }, [refineInput, basePrompt, prompt, state, generate]);

  const handleShare = useCallback(async () => {
    if (!html || shareState === "sharing") return;
    setShareState("sharing");
    try {
      const res = await fetch("/api/sites/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, prompt }),
      });
      const data = await res.json();
      if (data.ok && data.shareUrl) {
        const fullUrl = `${window.location.origin}${data.shareUrl}`;
        await navigator.clipboard.writeText(fullUrl);
        setShareState("copied");
        setTimeout(() => setShareState("idle"), 3000);
      } else {
        setShareState("error");
        setTimeout(() => setShareState("idle"), 3000);
      }
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 3000);
    }
  }, [html, prompt, shareState]);

  const handleFix = useCallback(async () => {
    if (fixState === "fixing") return;
    const sourceHtml = activeSite?.html || html;
    if (!sourceHtml) return;
    setFixState("fixing");
    setState("generating");
    setHtml("");
    setProgress(0);
    setActiveSite(null);
    startRef.current = Date.now();
    progressRef.current = 0;
    const progressTimer = setInterval(() => {
      progressRef.current = Math.min(progressRef.current + Math.random() * 3, 94);
      setProgress(progressRef.current);
    }, 300);
    try {
      const res = await fetch("/api/io/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: sourceHtml, prompt }),
      });
      if (!res.ok || !res.body) throw new Error("Fix failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setHtml(accumulated);
      }
      clearInterval(progressTimer);
      setProgress(100);
      const dur = Date.now() - startRef.current;
      setDurationMs(dur);
      const site: Site = { id: crypto.randomUUID(), prompt: `[Fixed] ${prompt}`, industry, html: accumulated, createdAt: new Date(), durationMs: dur };
      setSites((prev) => [site, ...prev]);
      setActiveSite(site);
      setState("done");
    } catch {
      clearInterval(progressTimer);
      setState("error");
    } finally {
      setFixState("idle");
    }
  }, [fixState, activeSite, html, prompt, industry]);

  const handleSeo = useCallback(async () => {
    if (seoState === "scanning" || !html) return;
    setSeoState("scanning");
    setShowSeo(true);
    setSeoData(null);
    try {
      const res = await fetch("/api/io/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      const data = await res.json();
      setSeoData(data);
      setSeoState("done");
    } catch {
      setSeoState("error");
    }
  }, [seoState, html]);

  const isBuilding = state === "generating";
  const isDone = state === "done";
  const isIdle = state === "idle";
  const isError = state === "error";

  // ── Background: Gold fog (Vanta) or live aquarium ──
  const fogLayer = (
    <div
      ref={vantaRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        background: "var(--bg-0, #04060e)",
      }}
    />
  );
  const backgroundLayer =
    backgroundMode === "aquarium" ? <AquariumBackground /> : fogLayer;

  // ── New home layout (idle, no html) ──────────────────────────────────────
  if (isIdle && !html) {
    return (
      <>
        {backgroundLayer}
        <div className="d8h-root d8h-root--fog" style={{ position: "relative", zIndex: 1 }}>
        <HomeStyles />

        {/* Header */}
        <header className="d8h-header">
          <div className="d8h-logo">
            <span className="d8h-logo-mark">D8</span>
            <span className="d8h-logo-dot" />
            <span className="d8h-logo-text">Dominat8.io</span>
          </div>
          <nav className="d8h-nav">
            <button
              type="button"
              onClick={() => setBackgroundMode((m) => (m === "fog" ? "aquarium" : "fog"))}
              className="d8h-nav-link"
              style={{
                cursor: "pointer",
                border: "none",
                background: "none",
                font: "inherit",
                padding: 0,
              }}
              title={backgroundMode === "fog" ? "Switch to aquarium background" : "Switch to gold fog background"}
            >
              {backgroundMode === "fog" ? "🐠 Aquarium" : "✨ Fog"}
            </button>
            <a href="/pricing" className="d8h-nav-link">Pricing</a>
          </nav>
        </header>

        {/* Hero */}
        <div className="d8h-hero">
          <h1 className="d8h-title">What would you like to build?</h1>
          <p className="d8h-sub">Describe your business. Your site appears in seconds.</p>

          {/* Prompt row */}
          <div className="d8h-input-row">
            <InputLeadIcon />
            <input
              ref={inputRef}
              className="d8h-input search-input"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") generate(); }}
              placeholder={placeholder || "Describe your project…"}
              autoFocus
            />
            <button
              className="d8h-gen-btn"
              onClick={() => generate()}
              disabled={!prompt.trim()}
              type="button"
            >
              GENERATE
            </button>
            <button
              className={`d8h-mic-btn ${isListening ? "d8h-mic-btn--listening" : ""}`}
              onClick={startListening}
              disabled={isListening}
              type="button"
              title={isListening ? "Listening…" : "Voice input"}
            >
              <MicIcon listening={isListening} />
            </button>
          </div>

        </div>

        {/* Deployments */}
        <section className="d8h-deploys">
          <div className="d8h-deploys-header">
            <span className="d8h-deploys-title">Deployments</span>
            <span className="d8h-deploys-live">
              <span className="d8h-live-dot" />
              {loaded ? `${deployments.length} active` : "Loading…"}
            </span>
          </div>

          <div className="d8h-deploys-list">
            {(loaded ? deployments : []).map((dep, i) => {
              const ps = pillStyle(dep.pill);
              const bar = barColor(dep.progress, dep.status);
              return (
                <div key={i} className="d8h-dep-row">
                  <span className="d8h-dep-icon">{deployIcon(dep.icon)}</span>
                  <div className="d8h-dep-info">
                    <div className="d8h-dep-domain">{dep.domain}</div>
                    <div className="d8h-dep-desc">{dep.desc}</div>
                  </div>
                  <div className="d8h-dep-bar-wrap">
                    <div className="d8h-dep-bar-track">
                      <div
                        className="d8h-dep-bar-fill"
                        style={{ width: `${dep.progress}%`, background: bar }}
                      />
                    </div>
                    <div className="d8h-dep-pct">{dep.progress}%</div>
                  </div>
                  <div className="d8h-dep-status">{dep.status}</div>
                  <span
                    className="d8h-dep-pill"
                    style={{ color: ps.color, background: ps.bg, borderColor: ps.border }}
                  >
                    {dep.pill}
                  </span>
                </div>
              );
            })}
            {loaded && deployments.length === 0 && (
              <div className="d8h-deploys-empty">No active deployments</div>
            )}
          </div>
        </section>

        {/* Bottom bar: sites built (left), dock (center), links (right) — all aligned */}
        <div className="d8h-bottom-bar">
          <div className="d8h-bottom-left">
            <SocialProof />
          </div>
          <div className="d8h-dock-bar">
          <div className="d8h-dock-glass">
            {DOCK_ITEMS.map((item) => {
              const isActive = item.label === "Settings";
              const content = (
                <>
                  <DockIcon name={item.label} />
                  <span className="d8h-dock-label">{item.label}</span>
                </>
              );
              return item.href ? (
                <a key={item.label} href={item.href} className={`d8h-dock-item ${isActive ? "d8h-dock-item--active" : ""}`} data-label={item.label}>
                  {content}
                </a>
              ) : (
                <div key={item.label} className={`d8h-dock-item ${isActive ? "d8h-dock-item--active" : ""}`} data-label={item.label} role="button" tabIndex={0}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
          <div className="d8h-bottom-right">
            <a href="/pricing" className="d8h-footer-link">Pricing</a>
            <a href="/about" className="d8h-footer-link">About</a>
            <a href="/privacy" className="d8h-footer-link">Privacy</a>
            <a href="/terms" className="d8h-footer-link">Terms</a>
            <span className="d8h-footer-copy">© {new Date().getFullYear()} Dominat8.io</span>
          </div>
        </div>
        </div>
      </>
    );
  }

  return (
    <>
      {backgroundLayer}
      <div className="d8b-root main-interface-container" style={{ position: "relative", zIndex: 1 }}>
      <BuilderStyles />

      {/* ── Sidebar ── */}
      <aside className="d8b-sidebar">
        <div className="d8b-logo">
          <span className="d8b-logo-mark">D8</span>
          <span className="d8b-logo-sub">IO Builder</span>
        </div>

        <div className="d8b-sidebar-tabs">
          <button
            className={`d8b-tab ${sidebarTab === "new" ? "d8b-tab--active" : ""}`}
            onClick={() => setSidebarTab("new")}
            type="button"
          >
            New Site
          </button>
          <button
            className={`d8b-tab ${sidebarTab === "history" ? "d8b-tab--active" : ""}`}
            onClick={() => setSidebarTab("history")}
            type="button"
          >
            History {sites.length > 0 && <span className="d8b-count">{sites.length}</span>}
          </button>
        </div>

        {sidebarTab === "new" ? (
          <div className="d8b-sidebar-content">
            {/* Prompt */}
            <div className="d8b-field">
              <label className="d8b-label">Describe your website</label>
              <textarea
                ref={textareaRef}
                className="d8b-textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder + "|"}
                rows={5}
                disabled={isBuilding}
                autoFocus
              />
              <div className="d8b-hint">⌘ + Enter to generate</div>
            </div>

            {/* Industry */}
            <div className="d8b-field">
              <label className="d8b-label">Industry (optional)</label>
              <div className="d8b-chips">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.label}
                    type="button"
                    className={`d8b-chip ${industry === ind.label ? "d8b-chip--active" : ""}`}
                    onClick={() => setIndustry((prev) => prev === ind.label ? "" : ind.label)}
                    disabled={isBuilding}
                  >
                    <span>{ind.icon}</span> {ind.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vibe / Style */}
            <div className="d8b-field">
              <label className="d8b-label">Style (optional)</label>
              <div className="d8b-chips">
                {VIBES.map((v) => (
                  <button
                    key={v.label}
                    type="button"
                    className={`d8b-chip ${vibe === v.label ? "d8b-chip--active" : ""}`}
                    onClick={() => setVibe((prev) => prev === v.label ? "" : v.label)}
                    disabled={isBuilding}
                    title={v.hint}
                  >
                    <span>{v.icon}</span> {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              className={`d8b-generate-btn ${isBuilding ? "d8b-generate-btn--building" : ""}`}
              onClick={isBuilding ? reset : () => generate()}
              disabled={!prompt.trim() && !isBuilding}
              type="button"
            >
              {isBuilding ? (
                <><span className="d8b-stop-icon">■</span> Stop</>
              ) : (
                <><span className="d8b-spark">⚡</span> Generate Site</>
              )}
            </button>

            {isDone && (
              <button className="d8b-regen-btn" onClick={reset} type="button">
                ↩ Build another
              </button>
            )}

            {isDone && (
              <div className="d8b-refine-section">
                <button
                  className={`d8b-refine-toggle ${showRefine ? "d8b-refine-toggle--active" : ""}`}
                  onClick={() => setShowRefine((v) => !v)}
                  type="button"
                >
                  ✨ Refine design
                  <span className="d8b-refine-arrow">{showRefine ? "▲" : "▼"}</span>
                </button>
                {showRefine && (
                  <div className="d8b-refine-panel">
                    <textarea
                      className="d8b-textarea"
                      value={refineInput}
                      onChange={(e) => setRefineInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          handleRefine();
                        }
                      }}
                      placeholder="e.g. Make it more minimal, use blue tones, add a FAQ section…"
                      rows={3}
                    />
                    <button
                      className="d8b-refine-btn"
                      onClick={handleRefine}
                      disabled={!refineInput.trim()}
                      type="button"
                    >
                      ⚡ Apply refinement
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Fix + SEO agents */}
            {isDone && (
              <div className="d8b-agent-row">
                <button
                  className={`d8b-agent-btn ${fixState === "fixing" ? "d8b-agent-btn--loading" : ""}`}
                  onClick={handleFix}
                  disabled={fixState === "fixing"}
                  type="button"
                  title="Auto-detect and fix layout, content, and code issues"
                >
                  {fixState === "fixing" ? "⏳ Fixing…" : "🔧 Fix issues"}
                </button>
                <button
                  className={`d8b-agent-btn ${showSeo ? "d8b-agent-btn--active" : ""} ${seoState === "scanning" ? "d8b-agent-btn--loading" : ""}`}
                  onClick={handleSeo}
                  disabled={seoState === "scanning"}
                  type="button"
                  title="Scan the generated site for SEO issues"
                >
                  {seoState === "scanning" ? "⏳ Scanning…" : "📊 SEO scan"}
                </button>
              </div>
            )}

            {/* SEO results panel */}
            {showSeo && (
              <div className="d8b-seo-panel">
                {seoState === "scanning" && (
                  <div className="d8b-seo-loading">Analysing SEO…</div>
                )}
                {seoState === "error" && (
                  <div className="d8b-seo-loading" style={{ color: "rgba(255,100,100,0.8)" }}>Scan failed. Try again.</div>
                )}
                {seoState === "done" && seoData && (
                  <>
                    <div className="d8b-seo-score-row">
                      <span className="d8b-seo-score" style={{ color: seoData.score >= 80 ? "rgba(56,248,166,0.9)" : seoData.score >= 60 ? "rgba(255,209,102,0.9)" : "rgba(255,100,100,0.85)" }}>
                        {seoData.score}
                      </span>
                      <div>
                        <div className="d8b-seo-grade" style={{ color: seoData.score >= 80 ? "rgba(56,248,166,0.75)" : seoData.score >= 60 ? "rgba(255,209,102,0.75)" : "rgba(255,100,100,0.75)" }}>
                          Grade {seoData.grade}
                        </div>
                        <div className="d8b-seo-summary">{seoData.summary}</div>
                      </div>
                    </div>
                    {(seoData.strengths ?? []).length > 0 && (
                      <div className="d8b-seo-strengths">
                        {seoData.strengths.slice(0, 3).map((s, i) => (
                          <div key={i} className="d8b-seo-strength">✓ {s}</div>
                        ))}
                      </div>
                    )}
                    {(seoData.issues ?? []).length > 0 && (
                      <div className="d8b-seo-issues">
                        {seoData.issues.map((issue, i) => (
                          <div key={i} className={`d8b-seo-issue d8b-seo-issue--${issue.severity}`}>
                            <div className="d8b-seo-issue-msg">{issue.message}</div>
                            <div className="d8b-seo-issue-fix">{issue.fix}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Stats when done */}
            {isDone && activeSite && (
              <div className="d8b-stats">
                <div className="d8b-stat">
                  <span className="d8b-stat-val">{(durationMs / 1000).toFixed(1)}s</span>
                  <span className="d8b-stat-label">Generated in</span>
                </div>
                <div className="d8b-stat">
                  <span className="d8b-stat-val">{html.length.toLocaleString()}</span>
                  <span className="d8b-stat-label">Characters</span>
                </div>
                <div className="d8b-stat">
                  <span className="d8b-stat-val green">✓</span>
                  <span className="d8b-stat-label">SEO Ready</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="d8b-sidebar-content">
            {sites.length === 0 ? (
              <div className="d8b-empty">
                <div className="d8b-empty-icon">✦</div>
                <div className="d8b-empty-text">No sites yet.<br />Generate your first.</div>
              </div>
            ) : (
              <div className="d8b-history">
                {sites.map((s) => (
                  <SiteCard
                    key={s.id}
                    site={s}
                    onSelect={() => {
                      setActiveSite(s);
                      setHtml(s.html);
                      setState("done");
                      setSidebarTab("new");
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="d8b-sidebar-foot">
          <div className="d8b-foot-badge">AI-powered · Dominat8.io</div>
        </div>
      </aside>

      {/* ── Main canvas ── */}
      <main className="d8b-canvas">
        {isIdle && !html ? (
          /* ── Empty state ── */
          <div className="d8b-empty-canvas">
            <div className="d8b-splash">
              <div className="d8b-splash-mark">✦</div>
              <h1 className="d8b-splash-title">Build anything.</h1>
              <p className="d8b-splash-sub">
                Describe your website and watch it appear in seconds.<br />
                No templates. No drag and drop. Just results.
              </p>
              <div className="d8b-splash-examples">
                <div className="d8b-examples-label">Try one of these:</div>
                {EXAMPLE_PROMPTS.slice(0, 3).map((ex) => (
                  <button
                    key={ex}
                    className="d8b-example-btn"
                    onClick={() => {
                      setPrompt(ex);
                      textareaRef.current?.focus();
                    }}
                    type="button"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isBuilding && !html ? (
          /* ── Generating start state ── */
          <div className="d8b-generating-screen">
            <GeneratingAnimation progress={progress} />
          </div>
        ) : isError ? (
          /* ── Error state ── */
          <div className="d8b-error-screen">
            <div className="d8b-error-content">
              <div className="d8b-error-icon">⚠️</div>
              <h2 className="d8b-error-title">Generation failed</h2>
              <p className="d8b-error-message">
                {errorMessage || "Something went wrong while building your site. Please try again."}
              </p>
              <button
                className="d8b-error-retry-btn"
                onClick={() => {
                  reset();
                  generate();
                }}
                type="button"
              >
                🔄 Retry
              </button>
            </div>
          </div>
        ) : (
          /* ── Preview / Code ── */
          <div className="d8b-preview-wrap">
            {/* Toolbar */}
            <div className="d8b-toolbar">
              <div className="d8b-toolbar-left">
                {isBuilding && (
                  <div className="d8b-live-badge">
                    <span className="d8b-live-dot" /> LIVE
                  </div>
                )}
                {isDone && <div className="d8b-done-badge">✓ Complete</div>}
                <span className="d8b-toolbar-prompt">{prompt.slice(0, 50)}{prompt.length > 50 ? "…" : ""}</span>
              </div>
              <div className="d8b-toolbar-right">
                <div className="d8b-view-toggle">
                  <button className={`d8b-view-btn ${viewMode === "preview" ? "d8b-view-btn--active" : ""}`} onClick={() => setViewMode("preview")} type="button">Preview</button>
                  <button className={`d8b-view-btn ${viewMode === "code" ? "d8b-view-btn--active" : ""}`} onClick={() => setViewMode("code")} type="button">Code</button>
                </div>
                {viewMode === "preview" && (
                  <div className="d8b-view-toggle">
                    <button className={`d8b-view-btn ${device === "desktop" ? "d8b-view-btn--active" : ""}`} onClick={() => setDevice("desktop")} type="button" title="Desktop">🖥</button>
                    <button className={`d8b-view-btn ${device === "mobile" ? "d8b-view-btn--active" : ""}`} onClick={() => setDevice("mobile")} type="button" title="Mobile">📱</button>
                  </div>
                )}
                {isDone && (
                  <>
                    <button
                      className="d8b-action-btn"
                      onClick={handleShare}
                      type="button"
                      title="Copy shareable link"
                      style={shareState === "copied" ? { color: "#38F8A6", borderColor: "rgba(56,248,166,0.30)" } : shareState === "error" ? { color: "#FF4D6D" } : {}}
                    >
                      {shareState === "sharing" ? "⏳ Sharing…" : shareState === "copied" ? "✓ Link copied!" : shareState === "error" ? "✕ Share failed" : "↗ Share"}
                    </button>
                    <button
                      className="d8b-action-btn"
                      onClick={() => {
                        const blob = new Blob([html], { type: "text/html" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "website.html";
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      type="button"
                    >
                      ↓ Download
                    </button>
                    <button className="d8b-deploy-btn" type="button" onClick={() => setShowDeploy(true)}>
                      ⚡ Deploy
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Canvas */}
            {viewMode === "preview" ? (
              <div className={device === "mobile" ? "d8b-iframe-mobile-wrap" : "d8b-iframe-wrap"}>
                {isBuilding && progress < 15 && (
                  <div className="d8b-iframe-loader">
                    <GeneratingAnimation progress={progress} />
                  </div>
                )}
                {device === "mobile" ? (
                  <div className="d8b-phone-frame">
                    <div className="d8b-phone-notch" />
                    <iframe
                      ref={iframeRef}
                      srcDoc={html || "<html><body style='background:#fff'></body></html>"}
                      sandbox="allow-scripts"
                      className="d8b-phone-iframe"
                      title="Generated website mobile preview"
                    />
                  </div>
                ) : (
                  <iframe
                    ref={iframeRef}
                    srcDoc={html || "<html><body style='background:#07090f'></body></html>"}
                    sandbox="allow-scripts"
                    className="d8b-iframe"
                    title="Generated website preview"
                  />
                )}
              </div>
            ) : (
              <div className="d8b-code-wrap">
                <pre className="d8b-code">{html}</pre>
              </div>
            )}

            {/* Progress bar */}
            {isBuilding && (
              <div className="d8b-progress-bar">
                <div className="d8b-progress-fill progress-fill" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Deploy modal */}
      {showDeploy && html && (
        <DeployModal html={html} prompt={prompt} onClose={() => setShowDeploy(false)} />
      )}
    </div>
    </>
  );
}

// ─── Deploy Modal ─────────────────────────────────────────────────────────────

type DeployStep = "options" | "deploying" | "done";

function DeployModal({ html, prompt, onClose }: { html: string; prompt: string; onClose: () => void }) {
  const [step, setStep] = useState<DeployStep>("options");
  const [log, setLog] = useState<string[]>([]);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [domainInput, setDomainInput] = useState("");
  const [domainStep, setDomainStep] = useState<"idle" | "challenge" | "verifying" | "verified">("idle");
  const [domainInstructions, setDomainInstructions] = useState("");

  async function doDeploy() {
    setStep("deploying");
    setLog([]);
    setShareUrl(null);
    setSiteId(null);

    const addLog = (msg: string) => setLog((prev) => [...prev, msg]);

    addLog("Saving your site…");
    try {
      const res = await fetch("/api/sites/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, prompt }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        addLog(data?.error || "Save failed");
        addLog("Try downloading HTML instead.");
        setStep("options");
        return;
      }

      addLog("✓ Site saved");
      addLog("Provisioning live URL…");
      addLog("✓ Site is live!");
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setShareUrl(data.shareUrl ? `${origin}${data.shareUrl}` : null);
      setSiteId(data.id ?? null);
      setStep("done");
    } catch {
      addLog("Network error. Try again.");
      setStep("options");
    }
  }

  async function requestDomainChallenge() {
    const d = domainInput.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
    if (!d || !siteId) return;
    setDomainStep("challenge");
    try {
      const res = await fetch("/api/domains/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: d, siteId }),
      });
      const data = await res.json();
      if (data.ok && data.instructions) {
        setDomainInstructions(data.instructions);
      } else {
        setDomainInstructions(data.error || "Failed to create challenge");
      }
    } catch {
      setDomainInstructions("Network error");
    }
  }

  async function verifyDomain() {
    const d = domainInput.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
    if (!d || !siteId) return;
    setDomainStep("verifying");
    try {
      const res = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: d, siteId }),
      });
      const data = await res.json();
      if (data.verified) {
        setDomainInstructions(`✓ Verified! Add a CNAME: ${d} → cname.vercel-dns.com (or your hosting provider).`);
        setDomainStep("verified");
      } else {
        setDomainInstructions(data.error || "Verification failed. DNS may take a few minutes.");
        setDomainStep("challenge");
      }
    } catch {
      setDomainInstructions("Network error");
      setDomainStep("challenge");
    }
  }

  function download() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="d8b-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="d8b-modal">
        <div className="d8b-modal-header">
          <div className="d8b-modal-title">
            {step === "options" && "Deploy your site"}
            {step === "deploying" && "Deploying…"}
            {step === "done" && "🎉 Site deployed!"}
          </div>
          <button className="d8b-modal-close" onClick={onClose} type="button">✕</button>
        </div>

        {step === "options" && (
          <div className="d8b-modal-body">
            <p className="d8b-modal-desc">
              Your site is ready. Choose how to publish it.
            </p>
            <div className="d8b-deploy-options">
              <button className="d8b-deploy-option" onClick={doDeploy} type="button">
                <span className="d8b-deploy-option-icon">⚡</span>
                <div>
                  <div className="d8b-deploy-option-title">Deploy to Dominat8</div>
                  <div className="d8b-deploy-option-sub">Live URL in seconds · Free subdomain</div>
                </div>
              </button>
              <button className="d8b-deploy-option d8b-deploy-option--ghost" onClick={download} type="button">
                <span className="d8b-deploy-option-icon">↓</span>
                <div>
                  <div className="d8b-deploy-option-title">Download HTML</div>
                  <div className="d8b-deploy-option-sub">Single file · Host anywhere</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {(step === "deploying" || step === "done") && (
          <div className="d8b-modal-body">
            <div className="d8b-deploy-log">
              {log.map((l, i) => (
                <div key={i} className={`d8b-deploy-log-line ${l.startsWith("✓") ? "d8b-deploy-log-line--ok" : ""}`}>
                  <span>{l.startsWith("✓") ? "✓" : "›"}</span> {l.replace("✓ ", "")}
                </div>
              ))}
              {step === "deploying" && <div className="d8b-deploy-cursor">_</div>}
            </div>
            {step === "done" && (
              <div className="d8b-deploy-success">
                {shareUrl && (
                  <div className="d8b-deploy-url-row">
                    <div className="d8b-deploy-url">{shareUrl}</div>
                    <button
                      className="d8b-deploy-copy"
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(shareUrl); }}
                    >
                      Copy
                    </button>
                  </div>
                )}
                {siteId && (
                  <div className="d8b-domain-section">
                    <div className="d8b-domain-title">Add custom domain</div>
                    {domainStep === "idle" && (
                      <div className="d8b-domain-row">
                        <input
                          className="d8b-domain-input"
                          type="text"
                          placeholder="mysite.com"
                          value={domainInput}
                          onChange={(e) => setDomainInput(e.target.value)}
                        />
                        <button className="d8b-domain-btn" type="button" onClick={requestDomainChallenge}>
                          Verify ownership
                        </button>
                      </div>
                    )}
                    {(domainStep === "challenge" || domainStep === "verifying") && (
                      <>
                        <div className="d8b-domain-instructions">{domainInstructions}</div>
                        <div className="d8b-domain-row">
                          <button
                            className="d8b-domain-btn"
                            type="button"
                            disabled={domainStep === "verifying"}
                            onClick={verifyDomain}
                          >
                            {domainStep === "verifying" ? "Checking…" : "Verify"}
                          </button>
                          <button
                            className="d8b-domain-btn d8b-domain-btn--ghost"
                            type="button"
                            onClick={() => { setDomainStep("idle"); setDomainInstructions(""); }}
                          >
                            Back
                          </button>
                        </div>
                      </>
                    )}
                    {domainStep === "verified" && (
                      <div className="d8b-domain-instructions d8b-domain-instructions--ok">{domainInstructions}</div>
                    )}
                  </div>
                )}
                <button className="d8b-deploy-btn" onClick={onClose} type="button">Done ✓</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles (co-located for portability) ─────────────────────────────────────

function BuilderStyles() {
  return (
    <style>{`
      /* ── Reset / root ── */
      .d8b-root {
        display: flex;
        height: 100vh;
        width: 100vw;
        background: #07090f;
        color: #d7dbea;
        font-family: 'Outfit', 'Inter', system-ui, sans-serif;
        overflow: hidden;
      }

      /* ── Sidebar ── */
      .d8b-sidebar {
        width: 300px;
        min-width: 300px;
        display: flex;
        flex-direction: column;
        background: linear-gradient(180deg, #0a0d18 0%, #080b15 100%);
        border-right: 1px solid rgba(255,255,255,0.07);
        overflow: hidden;
      }

      .d8b-logo {
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding: 20px 20px 0;
      }
      .d8b-logo-mark {
        font-size: 20px;
        font-weight: 800;
        color: #fff;
        letter-spacing: -0.04em;
      }
      .d8b-logo-sub {
        font-size: 12px;
        color: rgba(255,255,255,0.4);
        font-weight: 500;
        letter-spacing: 0.02em;
      }

      .d8b-sidebar-tabs {
        display: flex;
        gap: 2px;
        padding: 16px 14px 0;
      }
      .d8b-tab {
        flex: 1;
        padding: 8px 0;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: rgba(255,255,255,0.45);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 140ms ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .d8b-tab--active {
        background: rgba(255,255,255,0.07);
        color: #fff;
      }
      .d8b-tab:hover:not(.d8b-tab--active) {
        color: rgba(255,255,255,0.7);
      }
      .d8b-count {
        background: rgba(255,255,255,0.12);
        color: rgba(255,255,255,0.7);
        border-radius: 999px;
        padding: 1px 6px;
        font-size: 11px;
      }

      .d8b-sidebar-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px 14px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .d8b-sidebar-content::-webkit-scrollbar { width: 4px; }
      .d8b-sidebar-content::-webkit-scrollbar-track { background: transparent; }
      .d8b-sidebar-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }

      /* ── Fields ── */
      .d8b-field { display: flex; flex-direction: column; gap: 8px; }
      .d8b-label {
        font-size: 11px;
        font-weight: 600;
        color: rgba(255,255,255,0.4);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .d8b-textarea {
        width: 100%;
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.10);
        border-radius: 10px;
        color: #e8eaf6;
        font-size: 13px;
        line-height: 1.6;
        padding: 10px 12px;
        resize: none;
        font-family: inherit;
        outline: none;
        transition: border-color 140ms ease;
      }
      .d8b-textarea:focus {
        border-color: rgba(255,255,255,0.22);
      }
      .d8b-textarea:disabled { opacity: 0.5; cursor: not-allowed; }
      .d8b-hint {
        font-size: 11px;
        color: rgba(255,255,255,0.25);
        text-align: right;
      }

      /* ── Chips ── */
      .d8b-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .d8b-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.03);
        color: rgba(255,255,255,0.55);
        font-size: 12px;
        font-family: inherit;
        cursor: pointer;
        transition: all 120ms ease;
      }
      .d8b-chip:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.85); }
      .d8b-chip--active {
        border-color: rgba(61,240,255,0.5);
        background: rgba(61,240,255,0.08);
        color: rgba(61,240,255,0.9);
      }
      .d8b-chip:disabled { opacity: 0.4; cursor: not-allowed; }

      /* ── Generate button ── */
      .d8b-generate-btn {
        width: 100%;
        padding: 13px;
        border-radius: 12px;
        border: 1px solid rgba(61,240,255,0.4);
        background: linear-gradient(180deg, rgba(61,240,255,0.15), rgba(61,240,255,0.06));
        color: rgba(61,240,255,0.95);
        font-size: 15px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: all 140ms ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        letter-spacing: -0.01em;
      }
      .d8b-generate-btn:hover:not(:disabled) {
        background: linear-gradient(180deg, rgba(61,240,255,0.22), rgba(61,240,255,0.10));
        border-color: rgba(61,240,255,0.6);
        transform: translateY(-1px);
      }
      .d8b-generate-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
      .d8b-generate-btn--building {
        border-color: rgba(255,80,80,0.4);
        background: linear-gradient(180deg, rgba(255,80,80,0.12), rgba(255,80,80,0.05));
        color: rgba(255,100,100,0.9);
      }
      .d8b-generate-btn--building:hover {
        border-color: rgba(255,80,80,0.6) !important;
        background: linear-gradient(180deg, rgba(255,80,80,0.18), rgba(255,80,80,0.08)) !important;
      }
      .d8b-spark { font-size: 16px; }
      .d8b-stop-icon { font-size: 10px; }

      .d8b-regen-btn {
        width: 100%;
        padding: 10px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.10);
        background: transparent;
        color: rgba(255,255,255,0.5);
        font-size: 13px;
        font-family: inherit;
        cursor: pointer;
        transition: all 120ms ease;
      }
      .d8b-regen-btn:hover { color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.18); }

      /* ── Stats ── */
      .d8b-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .d8b-stat {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 10px;
        padding: 10px 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .d8b-stat-val { font-size: 15px; font-weight: 700; color: #fff; }
      .d8b-stat-val.green { color: rgba(61,240,180,0.9); }
      .d8b-stat-label { font-size: 10px; color: rgba(255,255,255,0.35); text-align: center; }

      /* ── History ── */
      .d8b-history { display: flex; flex-direction: column; gap: 10px; }
      .d8b-site-card {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        text-align: left;
        padding: 0;
        transition: all 140ms ease;
        width: 100%;
      }
      .d8b-site-card:hover { border-color: rgba(255,255,255,0.16); transform: translateY(-1px); }
      .d8b-site-preview { position: relative; height: 100px; overflow: hidden; }
      .d8b-site-thumb { width: 100%; height: 400px; transform: scale(0.25) translateY(-75%); transform-origin: top left; pointer-events: none; border: none; }
      .d8b-site-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5)); }
      .d8b-site-meta { padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; }
      .d8b-site-name { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.8); }
      .d8b-site-age { font-size: 11px; color: rgba(255,255,255,0.3); }

      /* ── Empty state ── */
      .d8b-empty { display: flex; flex-direction: column; align-items: center; padding: 32px 16px; gap: 12px; }
      .d8b-empty-icon { font-size: 28px; opacity: 0.3; }
      .d8b-empty-text { font-size: 13px; color: rgba(255,255,255,0.35); text-align: center; line-height: 1.6; }

      /* ── Sidebar footer ── */
      .d8b-sidebar-foot {
        padding: 12px 16px;
        border-top: 1px solid rgba(255,255,255,0.05);
      }
      .d8b-foot-badge {
        font-size: 10px;
        color: rgba(255,255,255,0.2);
        letter-spacing: 0.04em;
        text-align: center;
      }

      /* ── Main canvas ── */
      .d8b-canvas {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
      }

      /* ── Empty canvas ── */
      .d8b-empty-canvas {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background:
          radial-gradient(800px 600px at 50% 30%, rgba(61,240,255,0.03), transparent 60%),
          #07090f;
      }
      .d8b-splash { text-align: center; max-width: 520px; padding: 0 24px; }
      .d8b-splash-mark {
        font-size: 48px;
        color: rgba(61,240,255,0.3);
        display: block;
        margin-bottom: 16px;
        animation: d8b-pulse 3s ease-in-out infinite;
      }
      @keyframes d8b-pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.05); }
      }
      .d8b-splash-title {
        font-size: 48px;
        font-weight: 800;
        color: #fff;
        letter-spacing: -0.04em;
        line-height: 1;
        margin: 0 0 16px;
      }
      .d8b-splash-sub {
        font-size: 16px;
        color: rgba(255,255,255,0.45);
        line-height: 1.7;
        margin: 0 0 32px;
      }
      .d8b-splash-examples { display: flex; flex-direction: column; gap: 8px; }
      .d8b-examples-label { font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px; }
      .d8b-example-btn {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 10px;
        color: rgba(255,255,255,0.55);
        font-size: 13px;
        font-family: inherit;
        padding: 12px 16px;
        text-align: left;
        cursor: pointer;
        transition: all 140ms ease;
        line-height: 1.4;
      }
      .d8b-example-btn:hover {
        border-color: rgba(255,255,255,0.16);
        color: rgba(255,255,255,0.85);
        background: rgba(255,255,255,0.05);
        transform: translateX(4px);
      }

      /* ── Generating screen ── */
      .d8b-generating-screen {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #07090f;
      }
      .d8b-gen-anim { display: flex; flex-direction: column; align-items: center; gap: 16px; }
      .d8b-gen-ring { position: relative; width: 80px; height: 80px; }
      .d8b-gen-svg { width: 80px; height: 80px; transform: rotate(-90deg); }
      .d8b-gen-track { fill: none; stroke: rgba(255,255,255,0.07); stroke-width: 4; }
      .d8b-gen-arc {
        fill: none;
        stroke: rgba(61,240,255,0.8);
        stroke-width: 4;
        stroke-linecap: round;
        transition: stroke-dashoffset 300ms ease;
      }
      .d8b-gen-pct {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 700;
        color: rgba(61,240,255,0.9);
      }
      .d8b-gen-label { font-size: 18px; font-weight: 600; color: #fff; }
      .d8b-gen-sub { font-size: 13px; color: rgba(255,255,255,0.4); }

      /* ── Error screen ── */
      .d8b-error-screen {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background:
          radial-gradient(800px 600px at 50% 30%, rgba(255,100,100,0.02), transparent 60%),
          #07090f;
      }
      .d8b-error-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        max-width: 400px;
        padding: 0 24px;
        text-align: center;
      }
      .d8b-error-icon {
        font-size: 48px;
        display: block;
      }
      .d8b-error-title {
        font-size: 32px;
        font-weight: 700;
        color: #fff;
        margin: 0;
        letter-spacing: -0.02em;
      }
      .d8b-error-message {
        font-size: 15px;
        color: rgba(255,255,255,0.5);
        line-height: 1.6;
        margin: 0 0 8px;
      }
      .d8b-error-retry-btn {
        margin-top: 12px;
        padding: 12px 24px;
        border-radius: 10px;
        border: 1px solid rgba(255,100,100,0.4);
        background: linear-gradient(180deg, rgba(255,100,100,0.12), rgba(255,100,100,0.05));
        color: rgba(255,120,120,0.95);
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: all 140ms ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .d8b-error-retry-btn:hover {
        background: linear-gradient(180deg, rgba(255,100,100,0.18), rgba(255,100,100,0.08));
        border-color: rgba(255,100,100,0.6);
        transform: translateY(-1px);
      }

      /* ── Dots animation ── */
      .d8b-dots { display: inline-flex; gap: 2px; margin-left: 4px; }
      .d8b-dots span {
        width: 4px; height: 4px;
        border-radius: 50%;
        background: rgba(255,255,255,0.6);
        animation: d8b-dot 1.2s ease-in-out infinite;
      }
      .d8b-dots span:nth-child(2) { animation-delay: 0.2s; }
      .d8b-dots span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes d8b-dot {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
      }

      /* ── Preview wrap ── */
      .d8b-preview-wrap {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
      }

      /* ── Toolbar ── */
      .d8b-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        height: 48px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        background: rgba(0,0,0,0.2);
        flex-shrink: 0;
        gap: 12px;
      }
      .d8b-toolbar-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .d8b-toolbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

      .d8b-live-badge {
        display: flex;
        align-items: center;
        gap: 5px;
        background: rgba(255,80,80,0.12);
        border: 1px solid rgba(255,80,80,0.3);
        border-radius: 999px;
        padding: 3px 8px;
        font-size: 10px;
        font-weight: 700;
        color: rgba(255,100,100,0.9);
        letter-spacing: 0.06em;
      }
      .d8b-live-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: rgba(255,100,100,0.9);
        animation: d8b-blink 1s ease-in-out infinite;
      }
      @keyframes d8b-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

      .d8b-done-badge {
        background: rgba(61,240,180,0.1);
        border: 1px solid rgba(61,240,180,0.3);
        border-radius: 999px;
        padding: 3px 8px;
        font-size: 10px;
        font-weight: 700;
        color: rgba(61,240,180,0.9);
        letter-spacing: 0.04em;
      }

      .d8b-toolbar-prompt {
        font-size: 13px;
        color: rgba(255,255,255,0.4);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .d8b-view-toggle {
        display: flex;
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
        padding: 2px;
        gap: 2px;
      }
      .d8b-view-btn {
        padding: 5px 12px;
        border-radius: 6px;
        border: none;
        background: transparent;
        color: rgba(255,255,255,0.45);
        font-size: 12px;
        font-family: inherit;
        cursor: pointer;
        transition: all 120ms ease;
      }
      .d8b-view-btn--active { background: rgba(255,255,255,0.1); color: #fff; }

      .d8b-action-btn {
        padding: 7px 12px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.12);
        background: transparent;
        color: rgba(255,255,255,0.6);
        font-size: 12px;
        font-family: inherit;
        cursor: pointer;
        transition: all 120ms ease;
      }
      .d8b-action-btn:hover { border-color: rgba(255,255,255,0.22); color: #fff; }

      .d8b-deploy-btn {
        padding: 7px 14px;
        border-radius: 8px;
        border: 1px solid rgba(61,240,255,0.4);
        background: linear-gradient(180deg, rgba(61,240,255,0.15), rgba(61,240,255,0.06));
        color: rgba(61,240,255,0.9);
        font-size: 12px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: all 120ms ease;
      }
      .d8b-deploy-btn:hover:not(:disabled) {
        border-color: rgba(61,240,255,0.6);
        background: linear-gradient(180deg, rgba(61,240,255,0.22), rgba(61,240,255,0.10));
      }
      .d8b-deploy-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* ── iframe ── */
      .d8b-iframe-wrap {
        flex: 1;
        position: relative;
        overflow: hidden;
        background: #fff;
      }
      .d8b-iframe-loader {
        position: absolute;
        inset: 0;
        z-index: 10;
        background: #07090f;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .d8b-iframe {
        width: 100%;
        height: 100%;
        border: none;
        display: block;
      }

      /* ── Code view ── */
      .d8b-code-wrap {
        flex: 1;
        overflow: auto;
        background: #0a0d18;
      }
      .d8b-code {
        padding: 20px 24px;
        font-size: 12px;
        line-height: 1.7;
        color: #9aa3c7;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        white-space: pre-wrap;
        word-break: break-all;
        margin: 0;
      }

      /* ── Progress bar ── */
      .d8b-progress-bar {
        height: 2px;
        background: rgba(255,255,255,0.05);
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
      }
      .d8b-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, rgba(61,240,255,0.6), rgba(61,240,255,1));
        transition: width 300ms ease;
        border-radius: 0 2px 2px 0;
      }

      /* ── Mobile device frame ── */
      .d8b-iframe-mobile-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0a0d18;
        overflow: hidden;
        padding: 24px 0 16px;
      }
      .d8b-phone-frame {
        width: 375px;
        height: calc(100% - 8px);
        max-height: 780px;
        border-radius: 40px;
        border: 8px solid rgba(255,255,255,0.12);
        background: #000;
        position: relative;
        overflow: hidden;
        box-shadow: 0 24px 64px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.06);
      }
      .d8b-phone-notch {
        position: absolute; top: 0; left: 50%; transform: translateX(-50%);
        width: 100px; height: 26px;
        background: #000;
        border-radius: 0 0 18px 18px;
        z-index: 10;
      }
      .d8b-phone-iframe {
        width: 100%; height: 100%; border: none;
        border-radius: 32px;
      }

      /* ── Deploy Modal ── */
      .d8b-modal-backdrop {
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(0,0,0,0.70);
        backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center;
        padding: 24px;
      }
      .d8b-modal {
        width: min(480px, 100%);
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.12);
        background: #0d1020;
        box-shadow: 0 32px 80px rgba(0,0,0,0.70);
        overflow: hidden;
        animation: d8b-modal-in 200ms ease;
      }
      @keyframes d8b-modal-in { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }

      .d8b-modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      .d8b-modal-title { font-size: 16px; font-weight: 700; color: #fff; }
      .d8b-modal-close {
        background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.10);
        border-radius: 8px; width: 28px; height: 28px;
        color: rgba(255,255,255,0.60); cursor: pointer; font-size: 12px; font-family: inherit;
        display: flex; align-items: center; justify-content: center;
      }
      .d8b-modal-close:hover { color: #fff; }

      .d8b-modal-body { padding: 20px; }
      .d8b-modal-desc { font-size: 14px; color: rgba(255,255,255,0.50); margin: 0 0 16px; line-height: 1.5; }

      .d8b-deploy-options { display: flex; flex-direction: column; gap: 10px; }
      .d8b-deploy-option {
        display: flex; align-items: center; gap: 14px;
        padding: 14px 16px; border-radius: 14px;
        border: 1px solid rgba(61,240,255,0.30);
        background: rgba(61,240,255,0.06);
        color: rgba(255,255,255,0.90);
        text-align: left; cursor: pointer; font-family: inherit;
        transition: all 140ms ease;
      }
      .d8b-deploy-option:hover { border-color: rgba(61,240,255,0.55); background: rgba(61,240,255,0.10); }
      .d8b-deploy-option--ghost { border-color: rgba(255,255,255,0.10); background: rgba(255,255,255,0.03); }
      .d8b-deploy-option--ghost:hover { border-color: rgba(255,255,255,0.20); background: rgba(255,255,255,0.06); }
      .d8b-deploy-option-icon { font-size: 20px; flex-shrink: 0; }
      .d8b-deploy-option-title { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
      .d8b-deploy-option-sub { font-size: 12px; color: rgba(255,255,255,0.45); }

      .d8b-deploy-log {
        background: #070a10; border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.07);
        padding: 14px 16px; min-height: 160px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px; line-height: 1.8;
        display: flex; flex-direction: column; gap: 2px;
      }
      .d8b-deploy-log-line { color: rgba(255,255,255,0.65); }
      .d8b-deploy-log-line--ok { color: rgba(56,248,166,0.90); }
      .d8b-deploy-cursor { animation: d8b-blink 1s step-end infinite; color: rgba(61,240,255,0.8); }

      .d8b-deploy-success { margin-top: 14px; display: flex; flex-direction: column; gap: 10px; }
      .d8b-deploy-url-row { display: flex; align-items: center; gap: 10px; }
      .d8b-deploy-url {
        flex: 1; padding: 10px 14px; border-radius: 10px;
        background: rgba(56,248,166,0.08); border: 1px solid rgba(56,248,166,0.25);
        font-size: 13px; font-family: ui-monospace, monospace; color: rgba(56,248,166,0.90);
      }
      .d8b-deploy-copy {
        padding: 10px 16px; border-radius: 10px;
        border: 1px solid rgba(56,248,166,0.35); background: rgba(56,248,166,0.10);
        color: rgba(56,248,166,0.95); font-size: 13px; font-weight: 600; cursor: pointer;
        transition: all 120ms ease;
      }
      .d8b-deploy-copy:hover { background: rgba(56,248,166,0.18); }

      .d8b-domain-section { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.08); }
      .d8b-domain-title { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 8px; }
      .d8b-domain-row { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
      .d8b-domain-input {
        flex: 1; padding: 10px 14px; border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04);
        color: #fff; font-size: 13px;
      }
      .d8b-domain-btn {
        padding: 10px 16px; border-radius: 10px;
        border: 1px solid rgba(61,240,255,0.35); background: rgba(61,240,255,0.1);
        color: rgba(61,240,255,0.95); font-size: 13px; font-weight: 600; cursor: pointer;
      }
      .d8b-domain-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .d8b-domain-btn--ghost { background: transparent; border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); }
      .d8b-domain-instructions {
        font-size: 12px; color: rgba(255,255,255,0.6); padding: 10px; border-radius: 8px;
        background: rgba(0,0,0,0.2); font-family: ui-monospace, monospace; word-break: break-all;
      }
      .d8b-domain-instructions--ok { color: rgba(56,248,166,0.9); }

      /* ── Refine ── */
      .d8b-refine-section { display: flex; flex-direction: column; gap: 8px; }
      .d8b-refine-toggle {
        width: 100%; padding: 10px 14px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.10);
        background: transparent;
        color: rgba(255,255,255,0.55);
        font-size: 13px; font-family: inherit;
        cursor: pointer; transition: all 120ms ease;
        display: flex; align-items: center; justify-content: space-between;
      }
      .d8b-refine-toggle:hover { color: rgba(255,255,255,0.80); border-color: rgba(255,255,255,0.18); }
      .d8b-refine-toggle--active {
        border-color: rgba(61,240,255,0.35);
        background: rgba(61,240,255,0.06);
        color: rgba(61,240,255,0.85);
      }
      .d8b-refine-arrow { font-size: 10px; opacity: 0.6; }
      .d8b-refine-panel { display: flex; flex-direction: column; gap: 8px; }
      .d8b-refine-btn {
        width: 100%; padding: 10px;
        border-radius: 10px;
        border: 1px solid rgba(61,240,255,0.35);
        background: linear-gradient(180deg, rgba(61,240,255,0.10), rgba(61,240,255,0.04));
        color: rgba(61,240,255,0.90);
        font-size: 13px; font-weight: 600; font-family: inherit;
        cursor: pointer; transition: all 120ms ease;
      }
      .d8b-refine-btn:hover:not(:disabled) {
        border-color: rgba(61,240,255,0.55);
        background: linear-gradient(180deg, rgba(61,240,255,0.16), rgba(61,240,255,0.08));
      }
      .d8b-refine-btn:disabled { opacity: 0.35; cursor: not-allowed; }

      /* ── Agent row ── */
      .d8b-agent-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .d8b-agent-btn {
        padding: 9px 10px; border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.60);
        font-size: 12px; font-family: inherit; font-weight: 500;
        cursor: pointer; transition: all 120ms ease;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .d8b-agent-btn:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.85); border-color: rgba(255,255,255,0.18); }
      .d8b-agent-btn--active { border-color: rgba(61,240,255,0.35); background: rgba(61,240,255,0.06); color: rgba(61,240,255,0.85); }
      .d8b-agent-btn--loading { opacity: 0.6; cursor: not-allowed; }
      .d8b-agent-btn:disabled { opacity: 0.45; cursor: not-allowed; }

      /* ── SEO panel ── */
      .d8b-seo-panel {
        border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.02); padding: 14px;
        display: flex; flex-direction: column; gap: 12px;
      }
      .d8b-seo-loading { font-size: 12px; color: rgba(255,255,255,0.45); text-align: center; padding: 8px 0; }
      .d8b-seo-score-row { display: flex; align-items: center; gap: 12px; }
      .d8b-seo-score { font-size: 36px; font-weight: 800; letter-spacing: -0.04em; line-height: 1; flex-shrink: 0; }
      .d8b-seo-grade { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; margin-bottom: 3px; }
      .d8b-seo-summary { font-size: 11px; color: rgba(255,255,255,0.50); line-height: 1.5; }
      .d8b-seo-strengths { display: flex; flex-direction: column; gap: 4px; }
      .d8b-seo-strength { font-size: 11px; color: rgba(56,248,166,0.75); line-height: 1.5; }
      .d8b-seo-issues { display: flex; flex-direction: column; gap: 8px; }
      .d8b-seo-issue {
        padding: 8px 10px; border-radius: 8px;
        border-left: 2px solid rgba(255,255,255,0.15);
      }
      .d8b-seo-issue--critical { border-left-color: rgba(255,80,80,0.70); background: rgba(255,80,80,0.05); }
      .d8b-seo-issue--warning  { border-left-color: rgba(255,180,50,0.70); background: rgba(255,180,50,0.05); }
      .d8b-seo-issue--info     { border-left-color: rgba(61,240,255,0.40); background: rgba(61,240,255,0.04); }
      .d8b-seo-issue-msg { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.80); margin-bottom: 3px; }
      .d8b-seo-issue-fix { font-size: 10px; color: rgba(255,255,255,0.45); line-height: 1.5; }

      /* ── Mobile ── */
      @media (max-width: 768px) {
        .d8b-sidebar { width: 260px; min-width: 260px; }
        .d8b-splash-title { font-size: 32px; }
      }
    `}</style>
  );
}

// ─── Home Styles ──────────────────────────────────────────────────────────────

function HomeStyles() {
  return (
    <style>{`
      .d8h-root {
        min-height: 100vh;
        width: 100%;
        background:
          radial-gradient(900px 600px at 15% 10%, rgba(61,240,255,0.04), transparent 60%),
          radial-gradient(700px 500px at 85% 5%, rgba(124,92,255,0.05), transparent 60%),
          #06080e;
        color: #e9eef7;
        font-family: 'Outfit', 'Inter', system-ui, sans-serif;
        display: flex;
        flex-direction: column;
        padding-bottom: 100px;
      }
      .d8h-root--fog {
        background: transparent;
      }

      /* ── Header ── */
      .d8h-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 28px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .d8h-logo { display: flex; align-items: center; gap: 7px; }
      .d8h-logo-mark {
        font-size: 17px; font-weight: 800;
        color: #fff; letter-spacing: -0.04em;
      }
      .d8h-logo-dot {
        width: 5px; height: 5px; border-radius: 50%;
        background: rgba(212,175,55,0.85);
      }
      .d8h-logo-text {
        font-size: 13px; font-weight: 500;
        color: rgba(255,255,255,0.45); letter-spacing: 0.01em;
      }
      .d8h-nav { display: flex; gap: 6px; }
      .d8h-nav-link {
        padding: 6px 14px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.55);
        font-size: 12px;
        text-decoration: none;
        transition: all 120ms ease;
      }
      .d8h-nav-link:hover { color: #fff; border-color: rgba(255,255,255,0.20); }

      /* ── Hero ── */
      .d8h-hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 96px 32px 64px;
        gap: 36px;
      }
      .d8h-title {
        margin: 0;
        font-size: clamp(40px, 7vw, 72px);
        font-weight: 800;
        line-height: 1.08;
        color: #fff;
        letter-spacing: -0.04em;
        text-align: center;
      }
      .d8h-sub {
        margin: 0;
        font-size: 16px;
        max-width: 420px;
        color: rgba(255,255,255,0.40);
        text-align: center;
        letter-spacing: -0.01em;
      }

      /* ── Input row ── */
      .d8h-input-row {
        display: flex;
        align-items: center;
        width: min(720px, 100%);
        background: rgba(255,255,255,0.055);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 16px;
        padding: 6px 6px 6px 16px;
        gap: 10px;
        transition: border-color 140ms ease;
      }
      .d8h-input-row:focus-within {
        border-color: rgba(212,175,55,0.35);
      }
      .d8h-input-icon {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: rgba(212,175,55,0.7);
      }
      .d8h-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: #fff;
        font-size: 15px;
        font-family: inherit;
        letter-spacing: -0.01em;
        min-width: 0;
      }
      .d8h-input::placeholder { color: rgba(255,255,255,0.30); }
      .d8h-gen-btn {
        flex-shrink: 0;
        padding: 11px 22px;
        border-radius: 11px;
        border: none;
        background: linear-gradient(135deg, #D4AF37, #B8962E);
        color: #0c0a06;
        font-size: 13px;
        font-weight: 700;
        font-family: inherit;
        letter-spacing: 0.06em;
        cursor: pointer;
        transition: all 140ms ease;
        box-shadow: 0 2px 12px rgba(212,175,55,0.35);
      }
      .d8h-gen-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #E5C04A, #C9A63C);
        box-shadow: 0 4px 18px rgba(212,175,55,0.45);
        transform: translateY(-1px);
      }
      .d8h-gen-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

      .d8h-mic-btn {
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        padding: 0;
        border-radius: 11px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.75);
        cursor: pointer;
        transition: all 140ms ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .d8h-mic-btn:hover:not(:disabled) {
        background: rgba(212,175,55,0.12);
        border-color: rgba(212,175,55,0.35);
        color: rgba(255,255,255,0.95);
      }
      .d8h-mic-btn--listening {
        background: rgba(212,80,80,0.15);
        border-color: rgba(212,80,80,0.4);
        color: #e8a0a0;
      }
      .d8h-mic-btn--listening .d8h-mic-icon { animation: d8h-mic-pulse 1.2s ease-in-out infinite; }
      .d8h-mic-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .d8h-mic-icon { display: inline-flex; align-items: center; justify-content: center; }
      @keyframes d8h-mic-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      /* ── Industry chips ── */
      .d8h-chips {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 6px;
        width: min(720px, 100%);
      }
      .d8h-chip {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 5px 12px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.03);
        color: rgba(255,255,255,0.45);
        font-size: 12px; font-family: inherit;
        cursor: pointer; transition: all 120ms ease;
      }
      .d8h-chip:hover { border-color: rgba(255,255,255,0.20); color: rgba(255,255,255,0.80); }
      .d8h-chip--active {
        border-color: rgba(212,175,55,0.5);
        background: rgba(212,175,55,0.12);
        color: rgba(255,255,255,0.95);
      }

      /* ── Social proof ── */
      .d8h-social-proof {
        display: flex; align-items: center; justify-content: flex-start;
        gap: 20px;
        padding: 0;
      }
      .d8h-sp-monitor {
        flex-shrink: 0;
      }
      .d8h-sp-monitor-frame {
        display: flex; flex-direction: column; align-items: center;
      }
      .d8h-sp-monitor-screen {
        width: 72px; height: 46px;
        border-radius: 6px;
        overflow: hidden;
        border: 2px solid rgba(212,175,55,0.3);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
      }
      .d8h-sp-monitor-bar {
        height: 6px;
        transition: background 800ms ease;
      }
      .d8h-sp-monitor-body {
        flex: 1;
        height: 38px;
        transition: background 800ms ease;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 4px;
      }
      .d8h-sp-monitor-hero {
        height: 8px;
        border-radius: 2px;
        opacity: 0.5;
        transition: background 800ms ease;
      }
      .d8h-sp-monitor-cards {
        display: flex; gap: 3px;
      }
      .d8h-sp-monitor-cards span {
        flex: 1;
        height: 6px;
        border-radius: 2px;
        background: rgba(255,255,255,0.08);
      }
      .d8h-sp-monitor-stand {
        width: 16px; height: 6px;
        margin-top: 2px;
        border-radius: 0 0 4px 4px;
        background: rgba(212,175,55,0.2);
      }
      .d8h-sp-stat-wrap {
        display: flex; align-items: baseline; gap: 8px;
      }
      .d8h-sp-stat {
        font-size: 18px; font-weight: 600;
        color: rgba(212,175,55,0.95);
        letter-spacing: 0.02em;
      }
      .d8h-sp-label {
        font-size: 14px; font-weight: 400;
        color: rgba(255,255,255,0.45);
        letter-spacing: 0.01em;
      }

      /* ── Deployments ── */
      .d8h-deploys {
        width: min(800px, 100%);
        margin: 0 auto;
        padding: 0 24px 140px;
      }
      .d8h-deploys-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 0 12px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        margin-bottom: 10px;
      }
      .d8h-deploys-title {
        font-size: 13px; font-weight: 600;
        color: rgba(255,255,255,0.55);
        text-transform: uppercase; letter-spacing: 0.08em;
      }
      .d8h-deploys-live {
        display: flex; align-items: center; gap: 6px;
        font-size: 12px; color: rgba(255,255,255,0.40);
      }
      .d8h-live-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #D4AF37;
        animation: d8h-blink 2s ease-in-out infinite;
      }
      @keyframes d8h-blink { 0%,100%{opacity:1;} 50%{opacity:0.35;} }

      .d8h-deploys-list { display: flex; flex-direction: column; gap: 8px; }
      .d8h-dep-row {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 16px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.03);
        transition: background 140ms ease;
      }
      .d8h-dep-row:hover { background: rgba(255,255,255,0.05); }
      .d8h-dep-icon { font-size: 18px; flex-shrink: 0; }
      .d8h-dep-info { flex: 1; min-width: 0; }
      .d8h-dep-domain {
        font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.88);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .d8h-dep-desc {
        font-size: 11px; color: rgba(255,255,255,0.40);
        margin-top: 2px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .d8h-dep-bar-wrap {
        display: flex; align-items: center; gap: 8px;
        flex-shrink: 0; width: 140px;
      }
      .d8h-dep-bar-track {
        flex: 1; height: 5px; border-radius: 999px;
        background: rgba(255,255,255,0.08); overflow: hidden;
      }
      .d8h-dep-bar-fill {
        height: 100%; border-radius: 999px;
        transition: width 600ms ease;
      }
      .d8h-dep-pct { font-size: 11px; color: rgba(255,255,255,0.45); flex-shrink: 0; width: 30px; text-align: right; }
      .d8h-dep-status { font-size: 11px; color: rgba(255,255,255,0.45); flex-shrink: 0; width: 70px; text-align: center; }
      .d8h-dep-pill {
        display: inline-flex; align-items: center;
        padding: 4px 10px; border-radius: 999px;
        border: 1px solid; font-size: 11px; font-weight: 600;
        letter-spacing: 0.04em; flex-shrink: 0;
      }
      .d8h-deploys-empty {
        font-size: 13px; color: rgba(255,255,255,0.30);
        text-align: center; padding: 20px 0;
      }

      /* ── Bottom bar: left (sites built), center (dock), right (links) ── */
      .d8h-bottom-bar {
        position: fixed;
        bottom: 0; left: 0; right: 0;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        padding: 16px 24px 24px;
        z-index: 100;
        pointer-events: none;
      }
      .d8h-bottom-bar > * { pointer-events: auto; }
      .d8h-bottom-left {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        min-width: 0;
      }
      .d8h-bottom-right {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px 16px;
        flex-wrap: wrap;
      }
      .d8h-bottom-right .d8h-footer-link {
        font-size: 12px; color: rgba(255,255,255,0.4);
        text-decoration: none; transition: color 140ms ease;
      }
      .d8h-bottom-right .d8h-footer-link:hover { color: rgba(255,255,255,0.75); }
      .d8h-bottom-right .d8h-footer-copy {
        font-size: 11px; color: rgba(255,255,255,0.22);
        margin-left: 12px;
      }
      .d8h-dock-bar {
        flex-shrink: 0;
        display: flex; justify-content: center;
      }
      .d8h-dock-glass {
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        width: min(900px, 100%);
        padding: 12px 24px 14px;
        background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(26,15,0,0.35) 50%, rgba(15,10,0,0.4) 100%);
        backdrop-filter: blur(28px) saturate(150%);
        -webkit-backdrop-filter: blur(28px) saturate(150%);
        border: 1px solid rgba(212,175,55,0.22);
        border-radius: 24px;
        box-shadow:
          0 8px 32px rgba(0,0,0,0.2),
          0 0 0 1px rgba(255,255,255,0.04) inset,
          inset 0 1px 0 rgba(255,255,255,0.12);
      }
      .d8h-dock-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px 14px 6px;
        border-radius: 14px;
        border: 1px solid transparent;
        color: rgba(255,255,255,0.55);
        text-decoration: none;
        cursor: pointer;
        transition: all 180ms ease;
      }
      .d8h-dock-item:hover {
        background: rgba(255,255,255,0.1);
        border-color: rgba(212,175,55,0.3);
        color: rgba(255,255,255,0.98);
      }
      .d8h-dock-item--active {
        background: rgba(255,255,255,0.08);
        border-color: rgba(212,175,55,0.35);
        color: rgba(255,255,255,1);
      }
      .dock-icon-svg { display: inline-flex; align-items: center; justify-content: center; }
      .d8h-dock-label {
        font-size: 10px; font-family: inherit; font-weight: 500;
        color: inherit;
        letter-spacing: 0.02em;
        white-space: nowrap;
      }

      /* ── Footer ── */

      @media (max-width: 640px) {
        .d8h-title { font-size: 32px; }
        .d8h-dock-glass { gap: 2px; padding: 8px 12px 10px; }
        .d8h-dock-item { padding: 6px 8px 4px; }
        .d8h-dock-label { display: none; }
      }
    `}</style>
  );
}
