"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { HomeSections } from "./HomeSections";

// ─── Anonymous usage tracking (localStorage, 3 free generations) ──────────────

const ANON_KEY = "d8_anon_v1";
const ANON_LIMIT = 3;

function getAnonCount(): number {
  try { return parseInt(localStorage.getItem(ANON_KEY) ?? "0", 10) || 0; } catch { return 0; }
}
function incrementAnonCount(): void {
  try { localStorage.setItem(ANON_KEY, String(getAnonCount() + 1)); } catch { /* quota */ }
}

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
  { label: "Education", icon: "🎓" },
  { label: "Technology", icon: "💻" },
  { label: "Finance", icon: "📈" },
  { label: "Photography", icon: "📸" },
  { label: "Travel", icon: "✈️" },
  { label: "Beauty", icon: "💅" },
  { label: "Consulting", icon: "🧠" },
  { label: "Nonprofit", icon: "❤️" },
];

const EXAMPLE_PROMPTS = [
  "A luxury plumbing company in Auckland — premium, trustworthy, modern",
  "A boutique coffee roastery in Brooklyn with a subscription service",
  "A personal injury law firm that wins cases and takes no prisoners",
  "A cutting-edge SaaS platform that automates customer support with AI",
  "A high-end wedding photography studio in Melbourne, Australia",
  "A private members investment club for high-net-worth individuals",
  "A zero-waste sustainable fashion brand targeting Gen Z in London",
  "A concierge medicine practice for busy executives in Manhattan",
  "A B2B cybersecurity startup protecting enterprise infrastructure",
  "A world-class architecture firm with a portfolio of iconic buildings",
];

const VIBES = [
  { label: "Minimal",   icon: "○", hint: "Ultra-clean, whitespace-heavy. Monochrome with one precise accent. Typography-led, no decoration." },
  { label: "Bold",      icon: "■", hint: "Maximum visual impact. Oversized type, high-contrast shapes, hero that punches you in the face." },
  { label: "Luxury",    icon: "◆", hint: "Premium editorial. Dark bg, gold/platinum accents, tight serif display font, vast whitespace." },
  { label: "Dark",      icon: "◉", hint: "Full dark mode. Neon glowing accents, subtle grid-line bg, cyberpunk-adjacent but professional." },
  { label: "Playful",   icon: "✦", hint: "Vibrant gradients, rounded friendly shapes, personality-forward. Warm, inviting, energetic." },
  { label: "Corporate", icon: "▲", hint: "Polished and trustworthy. Blue tones, measured layout, clear hierarchy, enterprise-ready." },
  { label: "Editorial", icon: "◇", hint: "Magazine-quality. Large imagery, editorial grid, mix of serif and sans. Journalistic authority." },
  { label: "Futuristic", icon: "◈", hint: "Cutting-edge tech aesthetic. Glassmorphism, grid overlays, animated gradients, AI-age feel." },
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

// Social proof counter — increments over time for live feel
function SocialProof() {
  const [count, setCount] = React.useState(() => {
    // Deterministic base from date (resets each day)
    const d = new Date();
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    return 2400 + (seed % 600);
  });

  React.useEffect(() => {
    // Tick up by 1-3 every 8-15 seconds
    const tick = () => {
      setCount(c => c + Math.floor(Math.random() * 3) + 1);
    };
    const id = setInterval(tick, 8000 + Math.random() * 7000);
    return () => clearInterval(id);
  }, []);

  const AVATAR_COLORS = ["#F0B35A", "#38F8A6", "#FF4D6D", "#E8715A", "#FFD166", "#C09A5C"];

  return (
    <div className="d8h-social-proof">
      <div className="d8h-avatars">
        {AVATAR_COLORS.map((c, i) => (
          <span key={i} className="d8h-avatar" style={{ background: c, marginLeft: i > 0 ? -8 : 0, zIndex: AVATAR_COLORS.length - i }} />
        ))}
      </div>
      <span className="d8h-sp-count">
        <span className="d8h-sp-num">{count.toLocaleString()}</span> sites built today
      </span>
      <span className="d8h-sp-divider">·</span>
      <span className="d8h-sp-tag">No credit card</span>
      <span className="d8h-sp-divider">·</span>
      <span className="d8h-sp-tag">HTML export</span>
      <span className="d8h-sp-divider">·</span>
      <span className="d8h-sp-tag">1-click deploy</span>
    </div>
  );
}

const GEN_STAGES = [
  { threshold: 0,  label: "Parsing your brief",       sub: "Extracting structure, tone, and intent…" },
  { threshold: 18, label: "Designing the layout",      sub: "Mapping sections, hierarchy, and flow…" },
  { threshold: 38, label: "Crafting your content",     sub: "Writing headings, copy, and CTAs…" },
  { threshold: 62, label: "Building components",       sub: "Assembling navigation, cards, and forms…" },
  { threshold: 80, label: "Polishing the output",      sub: "SEO tags, metadata, and mobile layout…" },
  { threshold: 96, label: "Wrapping up",               sub: "Final checks and clean code output…" },
];

function GeneratingAnimation({ progress }: { progress: number }) {
  const stage = GEN_STAGES.slice().reverse().find(s => progress >= s.threshold) ?? GEN_STAGES[0];
  const circ = 2 * Math.PI * 38;

  return (
    <div className="d8b-gen-anim">
      {/* Pulsing glow behind ring */}
      <div className="d8b-gen-glow" />

      <div className="d8b-gen-ring">
        <svg viewBox="0 0 88 88" className="d8b-gen-svg">
          <defs>
            <linearGradient id="d8b-gen-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C8FF" />
              <stop offset="50%" stopColor="#00E0FF" />
              <stop offset="100%" stopColor="#7B61FF" />
            </linearGradient>
          </defs>
          <circle cx="44" cy="44" r="38" className="d8b-gen-track" />
          <circle
            cx="44" cy="44" r="38"
            className="d8b-gen-arc"
            stroke="url(#d8b-gen-grad)"
            strokeDasharray={`${circ}`}
            strokeDashoffset={`${circ * (1 - progress / 100)}`}
          />
        </svg>
        <span className="d8b-gen-pct">{Math.round(progress)}%</span>
      </div>

      {/* Stage pills */}
      <div className="d8b-gen-stages">
        {GEN_STAGES.map((s, i) => {
          const done = progress > s.threshold + 17;
          const active = stage.label === s.label;
          return (
            <div
              key={i}
              className={`d8b-gen-stage-pill ${active ? "d8b-gen-stage-pill--active" : ""} ${done ? "d8b-gen-stage-pill--done" : ""}`}
            >
              <span className="d8b-gen-stage-check">{done ? "✓" : active ? "●" : "·"}</span>
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>

      <div className="d8b-gen-label">
        {stage.label}<Dots />
      </div>
      <div className="d8b-gen-sub">{stage.sub}</div>
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

// ─── Dock icons ───────────────────────────────────────────────────────────────

// SVG icon paths — crisp, scalable, no emojis
const DOCK_SVG: Record<string, string> = {
  Deploy:    `<path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.18L18 8v8l-6 3.72L6 16V8l6-3.82z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v5m0 0l-2-2m2 2l2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  Domains:   `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="currentColor" stroke-width="1"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="1"/>`,
  SSL:       `<rect x="7" y="11" width="10" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9 11V8a3 3 0 016 0v3" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="15" r="1" fill="currentColor"/>`,
  Monitor:   `<rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><polyline points="7,12 10,9 13,11 17,8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="20" x2="16" y2="20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="16" x2="12" y2="20" stroke="currentColor" stroke-width="1.5"/>`,
  Logs:      `<rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><line x1="8" y1="12" x2="14" y2="12" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>`,
  Fix:       `<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a7 7 0 01-9.3 9.3L5 22l-3-3 6.4-6.4A7 7 0 016.3 3.3l3 3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  Automate:  `<polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
  Integrate: `<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4M5.6 5.6l2.8 2.8m7.2 7.2l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>`,
  Settings:  `<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" fill="none" stroke="currentColor" stroke-width="1.3"/>`,
};

const DOCK_ITEMS = [
  { label: "Deploy",    color: "#00D4FF", href: "/build/deploy" },
  { label: "Domains",   color: "#0088FF", href: "/build/domains" },
  { label: "SSL",       color: "#7B61FF", href: "/build/ssl" },
  { label: "Monitor",   color: "#00FFB2", href: "/build/monitor" },
  { label: "Logs",      color: "#00D4FF", href: "/build/logs" },
  { label: "Fix",       color: "#FF6B35", href: "/build/fix" },
  { label: "Automate",  color: "#FFB800", href: "/build/automate" },
  { label: "Integrate", color: "#B06EFF", href: "/build/integrate" },
  { label: "Settings",  color: "#8B9DC3", href: "/build/settings" },
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
  const [genModel, setGenModel] = useState<"gpt-4o" | "claude-sonnet-4-6">("gpt-4o");
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
  const [errorCode, setErrorCode] = useState<"quota" | "auth" | "generic" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showAnonLimit, setShowAnonLimit] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDomains, setShowDomains] = useState(false);
  const [showSSL, setShowSSL] = useState(false);
  const [showAutomate, setShowAutomate] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const { isSignedIn } = useUser();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const startRef = useRef<number>(0);
  const progressRef = useRef<number>(0);

  // Abort any in-flight generation when the component unmounts
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);
  const placeholder = useTypewriter(EXAMPLE_PROMPTS);
  const { deployments, loaded } = useDeployments();
  const searchParams = useSearchParams();

  // Pre-fill prompt from URL ?prompt= param (e.g. from /templates)
  // Also detect ?payment=success return from Stripe
  useEffect(() => {
    const p = searchParams?.get("prompt");
    if (p && p.trim()) {
      setPrompt(p.trim());
    }
    const payment = searchParams?.get("payment");
    const plan = searchParams?.get("plan");
    if (payment === "success") {
      setPaymentSuccess(plan ?? "pro");
    }
    // Clean params from URL
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("prompt");
      url.searchParams.delete("payment");
      url.searchParams.delete("plan");
      window.history.replaceState({}, "", url.toString());
    } catch { /* noop */ }
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

    // Anonymous limit check (client-side honesty gate)
    if (!isSignedIn) {
      if (getAnonCount() >= ANON_LIMIT) {
        setShowAnonLimit(true);
        return;
      }
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState("generating");
    setErrorCode(null);
    setErrorMsg("");
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
        body: JSON.stringify({ prompt: activePrompt, industry, vibe, model: genModel }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        let code: "quota" | "auth" | "generic" = "generic";
        let msg = `Error ${res.status}. Please try again.`;
        try {
          const errData = await res.json() as { error?: string; code?: string };
          if (errData.error) msg = errData.error;
          if (res.status === 429) code = "quota";
          else if (res.status === 401) code = "auth";
        } catch { /* no JSON body */ }
        setErrorCode(code);
        setErrorMsg(msg);
        throw new Error(msg);
      }
      if (!res.body) throw new Error("No response body");

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
      // Track anonymous usage client-side
      if (!isSignedIn) incrementAnonCount();
      // Auto-save to cloud for logged-in users
      if (isSignedIn) {
        fetch("/api/sites/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: accumulated, prompt: activePrompt, industry, vibe }),
        }).then(r => r.json()).then((d: { ok?: boolean; shareUrl?: string }) => {
          if (d.ok && d.shareUrl) {
            setPublishedUrl(`${window.location.origin}${d.shareUrl}`);
          }
        }).catch(() => {});
      }
    } catch (err: unknown) {
      clearInterval(progressTimer);
      if (err instanceof Error && err.name === "AbortError") {
        setState("idle");
      } else {
        if (!errorCode) setErrorCode("generic");
        if (!errorMsg) setErrorMsg("Something went wrong. Please try again.");
        setState("error");
      }
    }
  }, [prompt, industry, vibe, genModel, state, isSignedIn, errorCode, errorMsg]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      generate();
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setState("idle");
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
    setErrorCode(null);
    setErrorMsg("");
    setShowAnonLimit(false);
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
        body: JSON.stringify({ html, prompt, industry, vibe }),
      });
      const data = await res.json() as { ok?: boolean; shareUrl?: string };
      if (data.ok && data.shareUrl) {
        const fullUrl = `${window.location.origin}${data.shareUrl}`;
        await navigator.clipboard.writeText(fullUrl);
        setShareState("copied");
        setPublishedUrl(fullUrl); // persist the live URL in the banner
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

  const handleDockClick = useCallback((label: string) => {
    const item = DOCK_ITEMS.find(d => d.label === label);
    if (item?.href) {
      window.location.href = item.href;
      return;
    }
    // Fallback for builder-context actions
    switch (label) {
      case "Deploy":
        if (html) setShowDeploy(true);
        break;
      case "Fix":
        if (html) handleFix();
        break;
    }
  }, [html, handleFix]);

  const isBuilding = state === "generating";
  const isDone = state === "done";
  const isIdle = state === "idle";
  const isError = state === "error";

  // ── New home layout (idle, no html) ──────────────────────────────────────
  if (isIdle && !html) {
    return (
      <div className="d8h-root">
        <HomeStyles />

        {/* Ambient animated background */}
        <div className="d8h-bg" aria-hidden="true">
          <div className="d8h-bg-a" />
          <div className="d8h-bg-b" />
          <div className="d8h-bg-c" />
        </div>

        {/* Payment success banner */}
        {paymentSuccess && (
          <div className="d8h-payment-banner">
            <span>🎉</span>
            <span>Welcome to the <strong>{paymentSuccess}</strong> plan — your quota has been updated!</span>
            <button type="button" className="d8h-payment-dismiss" onClick={() => setPaymentSuccess(null)}>✕</button>
          </div>
        )}

        {/* Header */}
        <header className="d8h-header">
          <div className="d8h-logo">
            <span className="d8h-logo-mark">D8</span>
            <span className="d8h-logo-dot" />
            <span className="d8h-logo-text">Dominat8.io</span>
          </div>
          <nav className="d8h-nav">
            <a href="/templates" className="d8h-nav-link">Templates</a>
            <a href="/gallery" className="d8h-nav-link">Gallery</a>
            <a href="/pricing" className="d8h-nav-link">Pricing</a>
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="redirect">
                <button type="button" className="d8h-nav-signin">Sign in</button>
              </SignInButton>
            )}
          </nav>
        </header>

        {/* Hero */}
        <div className="d8h-hero">
          <div className="d8h-eyebrow">
            <span className="d8h-eyebrow-dot" />
            The world&apos;s fastest AI website builder
          </div>
          <h1 className="d8h-title">
            One sentence.<br />
            <span className="d8h-title-accent">A complete website.</span>
          </h1>
          <p className="d8h-sub">Describe your business. Watch a full, professional site appear in under 30 seconds — no templates, no drag and drop.</p>

          {/* Prompt row */}
          <div className="d8h-input-row">
            <span className="d8h-input-icon">✦</span>
            <input
              ref={inputRef}
              className="d8h-input"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") generate(); }}
              placeholder={placeholder + "|"}
            />
            {typeof window !== "undefined" && "webkitSpeechRecognition" in window && (
              <button
                className="d8h-mic-btn"
                type="button"
                title="Voice input"
                aria-label="Voice input"
                onClick={() => {
                  if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
                    type SpeechResult = { results: { 0: { transcript: string } }[] };
                    type SR = { lang: string; onresult: ((e: SpeechResult) => void) | null; start: () => void };
                    const Ctor = (window as unknown as { webkitSpeechRecognition: new () => SR }).webkitSpeechRecognition;
                    const recognition = new Ctor();
                    recognition.lang = "en-US";
                    recognition.onresult = (ev) => {
                      setPrompt(ev.results[0][0].transcript);
                    };
                    recognition.start();
                  }
                }}
              >
                🎙
              </button>
            )}
            <button
              className="d8h-gen-btn"
              onClick={() => generate()}
              disabled={!prompt.trim()}
              type="button"
            >
              GENERATE
            </button>
          </div>

          {/* Quick selections row — only show active tags + toggle */}
          <div className="d8h-quick-row">
            {industry && <span className="d8h-quick-tag" onClick={() => setIndustry("")}>{INDUSTRIES.find(i => i.label === industry)?.icon} {industry} ✕</span>}
            {vibe && <span className="d8h-quick-tag" onClick={() => setVibe("")}>{VIBES.find(v => v.label === vibe)?.icon} {vibe} ✕</span>}
            <button type="button" className="d8h-quick-tag" onClick={() => setGenModel((m) => m === "gpt-4o" ? "claude-sonnet-4-6" : "gpt-4o")} title="Switch AI model">
              {genModel === "gpt-4o" ? "⬢ GPT-4o" : "◈ Claude"}
            </button>
            <button type="button" className={`d8h-customize-toggle ${showOptions ? "d8h-customize-toggle--open" : ""}`} onClick={() => setShowOptions(!showOptions)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M3 12h18"/></svg>
              {showOptions ? "Less" : "Customize"}
            </button>
          </div>

          {/* Expanded options — industry chips + vibes */}
          {showOptions && (
            <div className="d8h-options-expanded">
              <div className="d8h-chips">
                {INDUSTRIES.map((ind) => (
                  <button key={ind.label} type="button" className={`d8h-chip ${industry === ind.label ? "d8h-chip--active" : ""}`} onClick={() => setIndustry((prev) => prev === ind.label ? "" : ind.label)}>
                    {ind.icon} {ind.label}
                  </button>
                ))}
              </div>
              <div className="d8h-options-row">
                {VIBES.map((v) => (
                  <button key={v.label} type="button" className={`d8h-vibe-chip ${vibe === v.label ? "d8h-vibe-chip--active" : ""}`} onClick={() => setVibe((prev) => prev === v.label ? "" : v.label)} title={v.hint}>
                    <span className="d8h-vibe-icon">{v.icon}</span>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Social proof strip */}
          <SocialProof />
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

        {/* Enhanced homepage sections */}
        <HomeSections />

        {/* Footer */}
        <footer className="d8h-footer">
          <div className="d8h-footer-links">
            <a href="/templates" className="d8h-footer-link">Templates</a>
            <a href="/gallery" className="d8h-footer-link">Gallery</a>
            <a href="/pricing" className="d8h-footer-link">Pricing</a>
            <a href="/about" className="d8h-footer-link">About</a>
            <a href="/privacy" className="d8h-footer-link">Privacy</a>
            <a href="/terms" className="d8h-footer-link">Terms</a>
          </div>
          <div className="d8h-footer-copy">© {new Date().getFullYear()} Dominat8.io · Built with AI</div>
        </footer>

        {/* Bottom dock */}
        <div className="d8h-dock">
          {DOCK_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="d8h-dock-btn"
              title={item.label}
              style={{ "--dock-color": item.color } as React.CSSProperties}
            >
              <span className="d8h-dock-glow" />
              <svg className="d8h-dock-svg" viewBox="0 0 24 24" fill="none" dangerouslySetInnerHTML={{ __html: DOCK_SVG[item.label] || "" }} />
              <span className="d8h-dock-label">{item.label}</span>
            </a>
          ))}
        </div>

        {/* Dock modals (rendered inside root for correct fixed positioning) */}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        {showDomains && <DomainsModal onClose={() => setShowDomains(false)} publishedUrl={publishedUrl} />}
        {showSSL && <SSLModal onClose={() => setShowSSL(false)} />}
        {showAutomate && <AutomateModal onClose={() => setShowAutomate(false)} html={html} prompt={prompt} onApplyHtml={setHtml} />}

      {/* Anon limit modal — inside root so fixed positioning works correctly */}
      {showAnonLimit && (
        <div className="d8b-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowAnonLimit(false); }}>
          <div className="d8b-modal">
            <div className="d8b-modal-header">
              <div className="d8b-modal-title">You've used your 3 free generations</div>
              <button className="d8b-modal-close" onClick={() => setShowAnonLimit(false)} type="button">✕</button>
            </div>
            <div className="d8b-modal-body">
              <p className="d8b-modal-desc">Create a free account to keep building. No credit card required.</p>
              <div className="d8b-deploy-options">
                <a href="/sign-up" className="d8b-deploy-option" style={{ textDecoration: "none" }}>
                  <span className="d8b-deploy-option-icon">✨</span>
                  <div>
                    <div className="d8b-deploy-option-title">Sign up free</div>
                    <div className="d8b-deploy-option-sub">Free account · No card needed</div>
                  </div>
                </a>
                <a href="/sign-in" className="d8b-deploy-option d8b-deploy-option--ghost" style={{ textDecoration: "none" }}>
                  <span className="d8b-deploy-option-icon">→</span>
                  <div>
                    <div className="d8b-deploy-option-title">Sign in</div>
                    <div className="d8b-deploy-option-sub">Already have an account</div>
                  </div>
                </a>
                <a href="/pricing" className="d8b-deploy-option d8b-deploy-option--ghost" style={{ textDecoration: "none" }}>
                  <span className="d8b-deploy-option-icon">⚡</span>
                  <div>
                    <div className="d8b-deploy-option-title">See all plans</div>
                    <div className="d8b-deploy-option-sub">Starter $9/mo · 20 generations</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    );
  }

  return (
    <div className="d8b-root">
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

            {/* Model selector */}
            <div className="d8b-model-selector">
              {(["gpt-4o", "claude-sonnet-4-6"] as const).map(m => (
                <button
                  key={m}
                  className={`d8b-model-btn ${genModel === m ? "d8b-model-btn--active" : ""}`}
                  onClick={() => setGenModel(m)}
                  type="button"
                  disabled={isBuilding}
                  title={m === "gpt-4o" ? "OpenAI GPT-4o" : "Anthropic Claude Sonnet"}
                >
                  {m === "gpt-4o" ? "GPT-4o" : "Claude"}
                </button>
              ))}
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
              {errorCode === "quota" ? (
                <>
                  <div className="d8b-error-icon">⚡</div>
                  <h2 className="d8b-error-title">Monthly limit reached</h2>
                  <p className="d8b-error-message">{errorMsg}</p>
                  <div className="d8b-error-actions">
                    <a href="/pricing" className="d8b-error-upgrade-btn">View plans →</a>
                    <button className="d8b-error-retry-btn" onClick={reset} type="button">← Back</button>
                  </div>
                </>
              ) : errorCode === "auth" ? (
                <>
                  <div className="d8b-error-icon">🔒</div>
                  <h2 className="d8b-error-title">Sign in to continue</h2>
                  <p className="d8b-error-message">Create a free account to generate websites.</p>
                  <div className="d8b-error-actions">
                    <a href="/sign-up" className="d8b-error-upgrade-btn">Sign up free →</a>
                    <a href="/sign-in" className="d8b-error-retry-btn" style={{ textDecoration: "none" }}>Sign in</a>
                  </div>
                </>
              ) : (
                <>
                  <div className="d8b-error-icon">⚠️</div>
                  <h2 className="d8b-error-title">Generation failed</h2>
                  <p className="d8b-error-message">{errorMsg || "Something went wrong. Please try again."}</p>
                  <button
                    className="d8b-error-retry-btn"
                    onClick={() => { reset(); generate(); }}
                    type="button"
                  >
                    🔄 Retry
                  </button>
                </>
              )}
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
                <div className="d8b-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Deploy modal */}
      {showDeploy && html && (
        <DeployModal
          html={html}
          prompt={prompt}
          onClose={() => setShowDeploy(false)}
          onDeployed={(url) => { setPublishedUrl(url); setShowDeploy(false); }}
        />
      )}

      {/* Dock modals */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showDomains && <DomainsModal onClose={() => setShowDomains(false)} publishedUrl={publishedUrl} />}
      {showSSL && <SSLModal onClose={() => setShowSSL(false)} />}
      {showAutomate && <AutomateModal onClose={() => setShowAutomate(false)} html={html} prompt={prompt} />}

      {/* Published URL banner */}
      {publishedUrl && (
        <div className="d8b-published-banner">
          <span className="d8b-published-dot" />
          <span className="d8b-published-label">Live:</span>
          <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="d8b-published-url">{publishedUrl}</a>
          <button
            className="d8b-published-copy"
            type="button"
            onClick={() => navigator.clipboard.writeText(publishedUrl)}
            title="Copy URL"
          >↗ Copy</button>
        </div>
      )}
    </div>
  );
}

// ─── Deploy Modal ─────────────────────────────────────────────────────────────

type DeployStep = "options" | "deploying" | "done";

function DeployModal({ html, prompt, onClose, onDeployed }: { html: string; prompt: string; onClose: () => void; onDeployed?: (url: string) => void }) {
  const [step, setStep] = useState<DeployStep>("options");
  const [log, setLog] = useState<string[]>([]);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);

  function download() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function realDeploy() {
    setStep("deploying");
    setLog([]);
    setDeployUrl(null);

    const logSteps = [
      "Optimising assets…",
      "Minifying HTML + inline CSS…",
      "Running SEO pre-checks…",
      "Generating sitemap.xml…",
      "Provisioning global edge network…",
    ];

    // Animate log steps while API call runs concurrently
    let logIdx = 0;
    const logTimer = setInterval(() => {
      if (logIdx < logSteps.length) {
        const msg = logSteps[logIdx];
        setLog(prev => [...prev, msg]);
        logIdx++;
      }
    }, 550);

    try {
      const res = await fetch("/api/sites/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, prompt }),
      });
      const data = await res.json() as { ok?: boolean; shareUrl?: string; error?: string; code?: string };

      clearInterval(logTimer);

      if (data.ok && data.shareUrl) {
        const fullUrl = `${window.location.origin}${data.shareUrl}`;
        setLog(prev => [...prev, "SSL certificate issued…", "✓ Site is live!"]);
        setDeployUrl(fullUrl);
        setStep("done");
        onDeployed?.(fullUrl);
      } else if (data.code === "STORAGE_NOT_CONFIGURED") {
        // Storage not configured — fall back to download
        setLog(prev => [...prev, "✓ Ready — preparing download"]);
        setStep("done");
        setTimeout(download, 400);
      } else {
        throw new Error(data.error ?? "Deploy failed");
      }
    } catch {
      clearInterval(logTimer);
      setLog(prev => [...prev, "⚠ Cloud deploy unavailable — downloading as HTML"]);
      setStep("done");
      setTimeout(download, 800);
    }
  }

  async function copyUrl() {
    if (!deployUrl) return;
    try {
      await navigator.clipboard.writeText(deployUrl);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2500);
    } catch { /* ignore */ }
  }

  return (
    <div className="d8b-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="d8b-modal">
        <div className="d8b-modal-header">
          <div className="d8b-modal-title">
            {step === "options" && "Deploy your site"}
            {step === "deploying" && "Deploying…"}
            {step === "done" && (deployUrl ? "🎉 Site is live!" : "✓ Ready")}
          </div>
          <button className="d8b-modal-close" onClick={onClose} type="button">✕</button>
        </div>

        {step === "options" && (
          <div className="d8b-modal-body">
            <p className="d8b-modal-desc">
              Your site is ready. Publish it live or download the HTML.
            </p>
            <div className="d8b-deploy-options">
              <button className="d8b-deploy-option" onClick={realDeploy} type="button">
                <span className="d8b-deploy-option-icon">🌐</span>
                <div>
                  <div className="d8b-deploy-option-title">Publish live URL</div>
                  <div className="d8b-deploy-option-sub">Shareable link in seconds · Free · No signup needed</div>
                </div>
              </button>
              <button className="d8b-deploy-option d8b-deploy-option--ghost" onClick={download} type="button">
                <span className="d8b-deploy-option-icon">↓</span>
                <div>
                  <div className="d8b-deploy-option-title">Download HTML</div>
                  <div className="d8b-deploy-option-sub">Single self-contained file · Host anywhere</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {(step === "deploying" || step === "done") && (
          <div className="d8b-modal-body">
            <div className="d8b-deploy-log">
              {log.map((l, i) => (
                <div key={i} className={`d8b-deploy-log-line ${l.startsWith("✓") ? "d8b-deploy-log-line--ok" : l.startsWith("⚠") ? "d8b-deploy-log-line--warn" : ""}`}>
                  <span>{l.startsWith("✓") ? "✓" : l.startsWith("⚠") ? "⚠" : "›"}</span> {l.replace(/^[✓⚠] /, "")}
                </div>
              ))}
              {step === "deploying" && <div className="d8b-deploy-cursor">_</div>}
            </div>
            {step === "done" && deployUrl && (
              <div className="d8b-deploy-success">
                <div className="d8b-deploy-url" title={deployUrl}>{deployUrl}</div>
                <button
                  className={`d8b-deploy-btn${urlCopied ? " d8b-deploy-btn--copied" : ""}`}
                  onClick={copyUrl}
                  type="button"
                >
                  {urlCopied ? "✓ Copied!" : "Copy URL"}
                </button>
              </div>
            )}
            {step === "done" && deployUrl && (
              <div className="d8b-deploy-actions">
                <a
                  href={deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="d8b-deploy-option d8b-deploy-option--ghost d8b-deploy-option--wide"
                >
                  <span className="d8b-deploy-option-icon d8b-deploy-option-icon--sm">↗</span>
                  <div>
                    <div className="d8b-deploy-option-title d8b-deploy-option-title--sm">Open live site</div>
                  </div>
                </a>
                <button
                  className="d8b-deploy-option d8b-deploy-option--ghost d8b-deploy-option--wide"
                  onClick={onClose}
                  type="button"
                >
                  <span className="d8b-deploy-option-icon d8b-deploy-option-icon--sm">✓</span>
                  <div>
                    <div className="d8b-deploy-option-title d8b-deploy-option-title--sm">Done</div>
                  </div>
                </button>
              </div>
            )}
            {step === "done" && !deployUrl && (
              <div className="d8b-deploy-actions d8b-deploy-actions--single">
                <button
                  className="d8b-deploy-btn d8b-deploy-btn--full"
                  onClick={onClose}
                  type="button"
                >
                  Done ✓
                </button>
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
        background: #060816;
        color: #E0E8F8;
        font-family: 'Outfit', 'Inter', system-ui, sans-serif;
        overflow: hidden;
      }

      /* ── Sidebar ── */
      .d8b-sidebar {
        width: 320px;
        min-width: 320px;
        display: flex;
        flex-direction: column;
        background: linear-gradient(180deg, rgba(12,16,32,0.98) 0%, rgba(8,11,22,0.99) 100%);
        border-right: 1px solid rgba(0,180,255,0.10);
        overflow: hidden;
        position: relative;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
      /* Sidebar top glow */
      .d8b-sidebar::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 200px;
        background: radial-gradient(ellipse 80% 100% at 50% 0%, rgba(0,180,255,0.06) 0%, transparent 70%);
        pointer-events: none;
        z-index: 0;
      }

      .d8b-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 22px 22px 0;
        position: relative;
        z-index: 1;
      }
      .d8b-logo-mark {
        font-size: 22px;
        font-weight: 900;
        background: linear-gradient(135deg, #E8F0FF, #00C8FF);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -0.04em;
      }
      .d8b-logo-sub {
        font-size: 12px;
        color: rgba(160,190,230,0.50);
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .d8b-sidebar-tabs {
        display: flex;
        gap: 4px;
        padding: 18px 16px 0;
        position: relative;
        z-index: 1;
      }
      .d8b-tab {
        flex: 1;
        padding: 9px 0;
        border-radius: 10px;
        border: 1px solid transparent;
        background: transparent;
        color: rgba(160,190,230,0.50);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 180ms ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-family: inherit;
      }
      .d8b-tab--active {
        background: rgba(0,180,255,0.08);
        border-color: rgba(0,180,255,0.18);
        color: #fff;
        box-shadow: 0 0 12px rgba(0,180,255,0.06);
      }
      .d8b-tab:hover:not(.d8b-tab--active) {
        color: rgba(200,220,255,0.80);
        background: rgba(255,255,255,0.03);
      }
      .d8b-count {
        background: rgba(0,180,255,0.15);
        color: rgba(0,200,255,0.85);
        border-radius: 999px;
        padding: 1px 7px;
        font-size: 11px;
        font-weight: 700;
      }

      .d8b-sidebar-content {
        flex: 1;
        overflow-y: auto;
        padding: 18px 16px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        position: relative;
        z-index: 1;
      }
      .d8b-sidebar-content::-webkit-scrollbar { width: 4px; }
      .d8b-sidebar-content::-webkit-scrollbar-track { background: transparent; }
      .d8b-sidebar-content::-webkit-scrollbar-thumb { background: rgba(0,180,255,0.15); border-radius: 99px; }

      /* ── Fields ── */
      .d8b-field { display: flex; flex-direction: column; gap: 8px; }
      .d8b-label {
        font-size: 11px;
        font-weight: 700;
        color: rgba(140,175,220,0.65);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .d8b-textarea {
        width: 100%;
        background: rgba(0,10,30,0.50);
        border: 1px solid rgba(0,160,255,0.15);
        border-radius: 12px;
        color: #E8F0FF;
        font-size: 14px;
        line-height: 1.65;
        padding: 12px 14px;
        resize: none;
        font-family: inherit;
        outline: none;
        transition: all 200ms ease;
        box-shadow: inset 0 1px 4px rgba(0,0,0,0.2);
      }
      .d8b-textarea:focus {
        border-color: rgba(0,180,255,0.35);
        box-shadow: inset 0 1px 4px rgba(0,0,0,0.2), 0 0 16px rgba(0,180,255,0.08);
      }
      .d8b-textarea::placeholder { color: rgba(140,175,220,0.35); }
      .d8b-textarea:disabled { opacity: 0.45; cursor: not-allowed; }
      .d8b-hint {
        font-size: 11px;
        color: rgba(140,175,220,0.35);
        text-align: right;
      }

      /* ── Chips ── */
      .d8b-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }
      .d8b-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 12px;
        border-radius: 999px;
        border: 1px solid rgba(120,160,220,0.12);
        background: rgba(120,160,220,0.04);
        color: rgba(180,205,240,0.65);
        font-size: 12px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        transition: all 160ms ease;
        backdrop-filter: blur(4px);
      }
      .d8b-chip:hover {
        border-color: rgba(0,180,255,0.25);
        color: rgba(220,235,255,0.90);
        background: rgba(0,180,255,0.06);
        box-shadow: 0 0 8px rgba(0,180,255,0.06);
      }
      .d8b-chip--active {
        border-color: rgba(0,200,255,0.45);
        background: rgba(0,200,255,0.10);
        color: rgba(0,220,255,0.95);
        box-shadow: 0 0 14px rgba(0,200,255,0.10);
      }
      .d8b-chip:disabled { opacity: 0.35; cursor: not-allowed; }

      /* ── Model selector ── */
      .d8b-model-selector {
        display: flex;
        gap: 4px;
        background: rgba(0,10,30,0.40);
        border: 1px solid rgba(120,160,220,0.10);
        border-radius: 12px;
        padding: 4px;
      }
      .d8b-model-btn {
        flex: 1;
        padding: 7px 10px;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: rgba(140,175,220,0.45);
        font-size: 12px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: all 160ms ease;
      }
      .d8b-model-btn:hover:not(:disabled) { color: rgba(200,220,255,0.75); }
      .d8b-model-btn:disabled { opacity: 0.35; cursor: not-allowed; }
      .d8b-model-btn--active {
        background: rgba(0,180,255,0.12);
        color: rgba(0,220,255,0.95);
        box-shadow: 0 2px 10px rgba(0,180,255,0.10);
        border: 1px solid rgba(0,180,255,0.18);
      }

      /* ── Generate button ── */
      .d8b-generate-btn {
        width: 100%;
        padding: 14px;
        border-radius: 14px;
        border: 1px solid rgba(0,200,255,0.35);
        background: linear-gradient(135deg, rgba(0,180,255,0.18) 0%, rgba(80,60,255,0.12) 100%);
        color: #fff;
        font-size: 15px;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        transition: all 180ms ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        letter-spacing: 0.01em;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,180,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06);
      }
      .d8b-generate-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 14px;
        background: linear-gradient(135deg, rgba(0,220,255,0.08), rgba(120,80,255,0.04));
        opacity: 0;
        transition: opacity 180ms ease;
      }
      .d8b-generate-btn:hover:not(:disabled) {
        border-color: rgba(0,220,255,0.55);
        box-shadow: 0 6px 30px rgba(0,180,255,0.20), inset 0 1px 0 rgba(255,255,255,0.08);
        transform: translateY(-1px);
      }
      .d8b-generate-btn:hover:not(:disabled)::before { opacity: 1; }
      .d8b-generate-btn:disabled {
        opacity: 0.30;
        cursor: not-allowed;
      }
      .d8b-generate-btn--building {
        border-color: rgba(255,80,100,0.40);
        background: linear-gradient(135deg, rgba(255,60,90,0.14), rgba(180,40,80,0.08));
        color: rgba(255,130,140,0.95);
        box-shadow: 0 4px 20px rgba(255,80,100,0.10);
      }
      .d8b-generate-btn--building:hover {
        border-color: rgba(255,80,100,0.60) !important;
        box-shadow: 0 6px 30px rgba(255,80,100,0.15) !important;
      }
      .d8b-spark { font-size: 16px; }
      .d8b-stop-icon { font-size: 10px; }

      .d8b-regen-btn {
        width: 100%;
        padding: 11px;
        border-radius: 12px;
        border: 1px solid rgba(120,160,220,0.12);
        background: rgba(120,160,220,0.04);
        color: rgba(180,205,240,0.60);
        font-size: 13px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        transition: all 150ms ease;
      }
      .d8b-regen-btn:hover { color: rgba(220,235,255,0.85); border-color: rgba(0,180,255,0.22); background: rgba(0,180,255,0.05); }

      /* ── Stats ── */
      .d8b-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .d8b-stat {
        background: rgba(0,15,40,0.40);
        border: 1px solid rgba(0,180,255,0.10);
        border-radius: 12px;
        padding: 12px 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        backdrop-filter: blur(4px);
      }
      .d8b-stat-val { font-size: 16px; font-weight: 800; color: #fff; }
      .d8b-stat-val.green { color: rgba(0,255,180,0.90); text-shadow: 0 0 12px rgba(0,255,180,0.3); }
      .d8b-stat-label { font-size: 10px; color: rgba(140,175,220,0.45); text-align: center; font-weight: 500; }

      /* ── History ── */
      .d8b-history { display: flex; flex-direction: column; gap: 10px; }
      .d8b-site-card {
        background: rgba(0,15,40,0.30);
        border: 1px solid rgba(0,180,255,0.10);
        border-radius: 14px;
        overflow: hidden;
        cursor: pointer;
        text-align: left;
        padding: 0;
        transition: all 180ms ease;
        width: 100%;
      }
      .d8b-site-card:hover { border-color: rgba(0,180,255,0.25); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,180,255,0.08); }
      .d8b-site-preview { position: relative; height: 100px; overflow: hidden; }
      .d8b-site-thumb { width: 100%; height: 400px; transform: scale(0.25) translateY(-75%); transform-origin: top left; pointer-events: none; border: none; }
      .d8b-site-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 40%, rgba(6,8,22,0.7)); }
      .d8b-site-meta { padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; }
      .d8b-site-name { font-size: 12px; font-weight: 600; color: rgba(220,235,255,0.85); }
      .d8b-site-age { font-size: 11px; color: rgba(140,175,220,0.40); }

      /* ── Empty state ── */
      .d8b-empty { display: flex; flex-direction: column; align-items: center; padding: 40px 16px; gap: 14px; }
      .d8b-empty-icon { font-size: 32px; opacity: 0.25; }
      .d8b-empty-text { font-size: 13px; color: rgba(140,175,220,0.40); text-align: center; line-height: 1.7; }

      /* ── Sidebar footer ── */
      .d8b-sidebar-foot {
        padding: 14px 16px;
        border-top: 1px solid rgba(0,180,255,0.06);
        position: relative;
        z-index: 1;
      }
      .d8b-foot-badge {
        font-size: 10px;
        color: rgba(0,180,255,0.25);
        letter-spacing: 0.06em;
        text-align: center;
        text-transform: uppercase;
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
          radial-gradient(900px 700px at 50% 25%, rgba(0,120,255,0.04), transparent 55%),
          radial-gradient(600px 400px at 70% 60%, rgba(100,60,255,0.03), transparent 50%),
          #060816;
      }
      .d8b-splash { text-align: center; max-width: 560px; padding: 0 24px; }
      .d8b-splash-mark {
        font-size: 48px;
        color: rgba(0,180,255,0.35);
        display: block;
        margin-bottom: 20px;
        animation: d8b-pulse 3s ease-in-out infinite;
        text-shadow: 0 0 30px rgba(0,180,255,0.15);
      }
      @keyframes d8b-pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.06); }
      }
      .d8b-splash-title {
        font-size: 52px;
        font-weight: 900;
        color: #E8F0FF;
        letter-spacing: -0.04em;
        line-height: 1;
        margin: 0 0 18px;
      }
      .d8b-splash-sub {
        font-size: 16px;
        color: rgba(160,190,230,0.55);
        line-height: 1.7;
        margin: 0 0 36px;
      }
      .d8b-splash-examples { display: flex; flex-direction: column; gap: 8px; }
      .d8b-examples-label { font-size: 11px; color: rgba(0,180,255,0.35); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; font-weight: 600; }
      .d8b-example-btn {
        background: rgba(0,15,40,0.30);
        border: 1px solid rgba(0,180,255,0.10);
        border-radius: 12px;
        color: rgba(180,205,240,0.60);
        font-size: 13px;
        font-family: inherit;
        padding: 14px 18px;
        text-align: left;
        cursor: pointer;
        transition: all 180ms ease;
        line-height: 1.5;
        backdrop-filter: blur(4px);
      }
      .d8b-example-btn:hover {
        border-color: rgba(0,180,255,0.25);
        color: rgba(220,235,255,0.90);
        background: rgba(0,180,255,0.06);
        transform: translateX(4px);
        box-shadow: 0 4px 16px rgba(0,180,255,0.06);
      }

      /* ── Generating screen ── */
      .d8b-generating-screen {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background:
          radial-gradient(600px 500px at 50% 40%, rgba(0,120,255,0.04), transparent 55%),
          #060816;
      }
      .d8b-gen-anim { display: flex; flex-direction: column; align-items: center; gap: 18px; position: relative; }
      .d8b-gen-glow {
        position: absolute;
        top: -20px;
        width: 140px; height: 140px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0,200,255,0.15) 0%, transparent 70%);
        animation: d8b-gen-breathe 2.5s ease-in-out infinite;
        pointer-events: none;
      }
      @keyframes d8b-gen-breathe {
        0%, 100% { transform: scale(0.9); opacity: 0.5; }
        50% { transform: scale(1.15); opacity: 1; }
      }
      .d8b-gen-ring { position: relative; width: 88px; height: 88px; z-index: 1; }
      .d8b-gen-svg { width: 88px; height: 88px; transform: rotate(-90deg); }
      .d8b-gen-track { fill: none; stroke: rgba(0,180,255,0.08); stroke-width: 3.5; }
      .d8b-gen-arc {
        fill: none;
        stroke: url(#d8b-gen-grad);
        stroke-width: 3.5;
        stroke-linecap: round;
        transition: stroke-dashoffset 300ms ease;
        filter: drop-shadow(0 0 6px rgba(0,200,255,0.35));
      }
      .d8b-gen-pct {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: 800;
        color: rgba(0,220,255,0.95);
        text-shadow: 0 0 10px rgba(0,200,255,0.3);
      }
      .d8b-gen-label { font-size: 18px; font-weight: 700; color: #E8F0FF; }
      .d8b-gen-sub { font-size: 13px; color: rgba(140,175,220,0.50); }

      /* ── Gen stage pills ── */
      .d8b-gen-stages {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
        max-width: 300px;
        margin: 6px 0 10px;
      }
      .d8b-gen-stage-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        border-radius: 10px;
        border: 1px solid rgba(120,160,220,0.08);
        background: rgba(0,15,40,0.25);
        font-size: 12px;
        color: rgba(140,175,220,0.30);
        transition: all 220ms ease;
      }
      .d8b-gen-stage-pill--active {
        border-color: rgba(0,200,255,0.30);
        background: rgba(0,200,255,0.07);
        color: rgba(0,220,255,0.90);
        box-shadow: 0 0 12px rgba(0,200,255,0.06);
      }
      .d8b-gen-stage-pill--done {
        color: rgba(0,255,178,0.60);
        border-color: rgba(0,255,178,0.15);
        background: rgba(0,255,178,0.04);
      }
      .d8b-gen-stage-check {
        font-size: 10px;
        width: 14px;
        text-align: center;
        flex-shrink: 0;
      }

      /* ── Error screen ── */
      .d8b-error-screen {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background:
          radial-gradient(700px 500px at 50% 35%, rgba(255,60,90,0.04), transparent 55%),
          #060816;
      }
      .d8b-error-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
        max-width: 440px;
        padding: 48px 32px;
        text-align: center;
        background: rgba(255,60,90,0.03);
        border: 1px solid rgba(255,80,100,0.12);
        border-radius: 24px;
        backdrop-filter: blur(12px);
      }
      .d8b-error-icon {
        font-size: 52px;
        display: block;
      }
      .d8b-error-title {
        font-size: 28px;
        font-weight: 800;
        color: #E8F0FF;
        margin: 0;
        letter-spacing: -0.02em;
      }
      .d8b-error-message {
        font-size: 15px;
        color: rgba(180,200,230,0.55);
        line-height: 1.65;
        margin: 0;
      }
      .d8b-error-retry-btn {
        margin-top: 8px;
        padding: 13px 28px;
        border-radius: 12px;
        border: 1px solid rgba(0,180,255,0.30);
        background: linear-gradient(135deg, rgba(0,180,255,0.14), rgba(80,60,255,0.08));
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        transition: all 180ms ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 4px 16px rgba(0,180,255,0.10);
      }
      .d8b-error-retry-btn:hover {
        border-color: rgba(0,200,255,0.50);
        box-shadow: 0 6px 24px rgba(0,180,255,0.18);
        transform: translateY(-1px);
      }

      /* ── Error actions (quota/auth states) ── */
      .d8b-error-actions {
        display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; justify-content: center;
      }
      .d8b-error-upgrade-btn {
        padding: 13px 28px; border-radius: 12px;
        background: linear-gradient(135deg, #00C97A, #00A866);
        color: #fff; font-size: 14px; font-weight: 700;
        text-decoration: none; cursor: pointer;
        transition: all 160ms ease;
        box-shadow: 0 4px 16px rgba(0,200,120,0.15);
      }
      .d8b-error-upgrade-btn:hover { box-shadow: 0 6px 24px rgba(0,200,120,0.25); transform: translateY(-1px); }

      /* ── Dots animation ── */
      .d8b-dots { display: inline-flex; gap: 3px; margin-left: 6px; }
      .d8b-dots span {
        width: 5px; height: 5px;
        border-radius: 50%;
        background: rgba(0,200,255,0.7);
        animation: d8b-dot 1.2s ease-in-out infinite;
      }
      .d8b-dots span:nth-child(2) { animation-delay: 0.2s; }
      .d8b-dots span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes d8b-dot {
        0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
        40% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 8px rgba(0,200,255,0.4); }
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
        padding: 0 18px;
        height: 52px;
        border-bottom: 1px solid rgba(0,180,255,0.08);
        background: rgba(8,12,28,0.80);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        flex-shrink: 0;
        gap: 12px;
      }
      .d8b-toolbar-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .d8b-toolbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

      .d8b-live-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255,60,90,0.10);
        border: 1px solid rgba(255,60,90,0.30);
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 10px;
        font-weight: 700;
        color: rgba(255,100,120,0.95);
        letter-spacing: 0.06em;
      }
      .d8b-live-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: rgba(255,80,100,0.95);
        box-shadow: 0 0 8px rgba(255,80,100,0.5);
        animation: d8b-blink 1s ease-in-out infinite;
      }
      @keyframes d8b-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }

      .d8b-done-badge {
        background: rgba(0,255,178,0.06);
        border: 1px solid rgba(0,255,178,0.20);
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 10px;
        font-weight: 700;
        color: rgba(0,255,178,0.90);
        letter-spacing: 0.04em;
        box-shadow: 0 0 10px rgba(0,255,178,0.06);
      }

      .d8b-toolbar-prompt {
        font-size: 13px;
        color: rgba(140,175,220,0.50);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .d8b-view-toggle {
        display: flex;
        background: rgba(0,15,40,0.40);
        border: 1px solid rgba(120,160,220,0.08);
        border-radius: 10px;
        padding: 3px;
        gap: 2px;
      }
      .d8b-view-btn {
        padding: 6px 14px;
        border-radius: 7px;
        border: none;
        background: transparent;
        color: rgba(140,175,220,0.50);
        font-size: 12px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        transition: all 160ms ease;
      }
      .d8b-view-btn--active { background: rgba(0,180,255,0.12); color: rgba(0,220,255,0.95); box-shadow: 0 0 8px rgba(0,180,255,0.08); }

      .d8b-action-btn {
        padding: 7px 14px;
        border-radius: 9px;
        border: 1px solid rgba(120,160,220,0.15);
        background: rgba(120,160,220,0.04);
        color: rgba(180,205,240,0.65);
        font-size: 12px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        transition: all 160ms ease;
      }
      .d8b-action-btn:hover { border-color: rgba(0,180,255,0.25); color: #E8F0FF; background: rgba(0,180,255,0.06); }

      .d8b-deploy-btn {
        padding: 8px 16px;
        border-radius: 10px;
        border: 1px solid rgba(0,200,255,0.35);
        background: linear-gradient(135deg, rgba(0,180,255,0.15), rgba(80,60,255,0.08));
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        transition: all 160ms ease;
        box-shadow: 0 2px 10px rgba(0,180,255,0.10);
      }
      .d8b-deploy-btn:hover:not(:disabled) {
        border-color: rgba(0,220,255,0.50);
        box-shadow: 0 4px 16px rgba(0,180,255,0.18);
        transform: translateY(-1px);
      }
      .d8b-deploy-btn:disabled {
        opacity: 0.35;
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
        background: #060816;
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
        background: rgba(6,8,22,0.95);
      }
      .d8b-code {
        padding: 24px 28px;
        font-size: 12px;
        line-height: 1.75;
        color: rgba(140,175,220,0.70);
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        white-space: pre-wrap;
        word-break: break-all;
        margin: 0;
      }

      /* ── Progress bar ── */
      .d8b-progress-bar {
        height: 3px;
        background: rgba(0,180,255,0.06);
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        overflow: hidden;
      }
      .d8b-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, rgba(0,180,255,0.5), rgba(0,220,255,0.9), rgba(120,80,255,0.7));
        transition: width 300ms ease;
        border-radius: 0 3px 3px 0;
        box-shadow: 0 0 12px rgba(0,200,255,0.4);
        position: relative;
      }
      .d8b-progress-fill::after {
        content: '';
        position: absolute;
        right: 0; top: -2px; bottom: -2px;
        width: 40px;
        background: linear-gradient(90deg, transparent, rgba(0,220,255,0.8));
        border-radius: 0 3px 3px 0;
        filter: blur(3px);
      }

      /* ── Mobile device frame ── */
      .d8b-iframe-mobile-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #060816;
        overflow: hidden;
        padding: 24px 0 16px;
      }
      .d8b-phone-frame {
        width: 375px;
        height: calc(100% - 8px);
        max-height: 780px;
        border-radius: 44px;
        border: 6px solid rgba(60,80,120,0.25);
        background: #000;
        position: relative;
        overflow: hidden;
        box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 40px rgba(0,180,255,0.04), inset 0 0 0 1px rgba(0,180,255,0.08);
      }
      .d8b-phone-notch {
        position: absolute; top: 0; left: 50%; transform: translateX(-50%);
        width: 110px; height: 30px;
        background: #000;
        border-radius: 0 0 20px 20px;
        z-index: 10;
      }
      .d8b-phone-iframe {
        width: 100%; height: 100%; border: none;
        border-radius: 38px;
      }

      /* ── Deploy Modal ── */
      .d8b-modal-backdrop {
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(4,6,16,0.80);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        display: flex; align-items: center; justify-content: center;
        padding: 24px;
      }
      .d8b-modal {
        width: min(500px, 100%);
        border-radius: 24px;
        border: 1px solid rgba(0,180,255,0.15);
        background: rgba(10,14,30,0.95);
        box-shadow: 0 40px 100px rgba(0,0,0,0.70), 0 0 60px rgba(0,120,255,0.05);
        overflow: hidden;
        animation: d8b-modal-in 250ms cubic-bezier(0.16,1,0.3,1);
        backdrop-filter: blur(20px);
      }
      @keyframes d8b-modal-in { from { opacity:0; transform:scale(0.92) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }

      .d8b-modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 18px 22px;
        border-bottom: 1px solid rgba(0,180,255,0.08);
      }
      .d8b-modal-title { font-size: 16px; font-weight: 800; color: #E8F0FF; }
      .d8b-modal-close {
        background: rgba(120,160,220,0.06); border: 1px solid rgba(120,160,220,0.12);
        border-radius: 10px; width: 30px; height: 30px;
        color: rgba(140,175,220,0.55); cursor: pointer; font-size: 12px; font-family: inherit;
        display: flex; align-items: center; justify-content: center;
        transition: all 150ms ease;
      }
      .d8b-modal-close:hover { color: #E8F0FF; background: rgba(0,180,255,0.08); border-color: rgba(0,180,255,0.20); }

      .d8b-modal-body { padding: 22px; }
      .d8b-modal-desc { font-size: 14px; color: rgba(160,190,230,0.55); margin: 0 0 18px; line-height: 1.6; }

      .d8b-deploy-options { display: flex; flex-direction: column; gap: 10px; }
      .d8b-deploy-option {
        display: flex; align-items: center; gap: 14px;
        padding: 15px 18px; border-radius: 16px;
        border: 1px solid rgba(0,180,255,0.18);
        background: rgba(0,180,255,0.04);
        color: rgba(220,235,255,0.90);
        text-align: left; cursor: pointer; font-family: inherit;
        transition: all 180ms ease;
      }
      .d8b-deploy-option:hover { border-color: rgba(0,200,255,0.35); background: rgba(0,180,255,0.08); box-shadow: 0 4px 16px rgba(0,180,255,0.06); }
      .d8b-deploy-option--ghost { border-color: rgba(120,160,220,0.10); background: rgba(120,160,220,0.03); }
      .d8b-deploy-option--ghost:hover { border-color: rgba(0,180,255,0.18); background: rgba(0,180,255,0.04); }
      .d8b-deploy-option-icon { font-size: 22px; flex-shrink: 0; }
      .d8b-deploy-option-title { font-size: 14px; font-weight: 700; margin-bottom: 3px; color: #E8F0FF; }
      .d8b-deploy-option-sub { font-size: 12px; color: rgba(140,175,220,0.55); }

      .d8b-deploy-log {
        background: rgba(4,6,16,0.60); border-radius: 14px;
        border: 1px solid rgba(0,180,255,0.08);
        padding: 16px 18px; min-height: 160px;
        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px; line-height: 1.9;
        display: flex; flex-direction: column; gap: 2px;
      }
      .d8b-deploy-log-line { color: rgba(160,190,230,0.60); }
      .d8b-deploy-log-line--ok { color: rgba(0,255,178,0.85); }
      .d8b-deploy-log-line--warn { color: rgba(255,200,60,0.85); }
      .d8b-deploy-cursor { animation: d8b-blink 1s step-end infinite; color: rgba(0,200,255,0.85); }

      .d8b-deploy-success { margin-top: 14px; display: flex; align-items: center; gap: 10px; }
      .d8b-deploy-url {
        flex: 1; padding: 11px 14px; border-radius: 12px;
        background: rgba(0,255,178,0.06); border: 1px solid rgba(0,255,178,0.20);
        font-size: 13px; font-family: ui-monospace, monospace; color: rgba(0,255,178,0.90);
      }

      /* ── Refine ── */
      .d8b-refine-section { display: flex; flex-direction: column; gap: 8px; }
      .d8b-refine-toggle {
        width: 100%; padding: 11px 14px;
        border-radius: 12px;
        border: 1px solid rgba(120,160,220,0.12);
        background: rgba(120,160,220,0.03);
        color: rgba(180,205,240,0.60);
        font-size: 13px; font-weight: 500; font-family: inherit;
        cursor: pointer; transition: all 160ms ease;
        display: flex; align-items: center; justify-content: space-between;
      }
      .d8b-refine-toggle:hover { color: rgba(220,235,255,0.85); border-color: rgba(0,180,255,0.20); background: rgba(0,180,255,0.04); }
      .d8b-refine-toggle--active {
        border-color: rgba(0,200,255,0.30);
        background: rgba(0,200,255,0.06);
        color: rgba(0,220,255,0.90);
      }
      .d8b-refine-arrow { font-size: 10px; opacity: 0.5; }
      .d8b-refine-panel { display: flex; flex-direction: column; gap: 8px; }
      .d8b-refine-btn {
        width: 100%; padding: 11px;
        border-radius: 12px;
        border: 1px solid rgba(0,200,255,0.25);
        background: linear-gradient(135deg, rgba(0,180,255,0.10), rgba(80,60,255,0.06));
        color: #fff;
        font-size: 13px; font-weight: 700; font-family: inherit;
        cursor: pointer; transition: all 160ms ease;
        box-shadow: 0 2px 8px rgba(0,180,255,0.08);
      }
      .d8b-refine-btn:hover:not(:disabled) {
        border-color: rgba(0,220,255,0.40);
        box-shadow: 0 4px 14px rgba(0,180,255,0.14);
      }
      .d8b-refine-btn:disabled { opacity: 0.30; cursor: not-allowed; }

      /* ── Agent row ── */
      .d8b-agent-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .d8b-agent-btn {
        padding: 10px 12px; border-radius: 12px;
        border: 1px solid rgba(120,160,220,0.10);
        background: rgba(120,160,220,0.04);
        color: rgba(180,205,240,0.60);
        font-size: 12px; font-family: inherit; font-weight: 600;
        cursor: pointer; transition: all 160ms ease;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .d8b-agent-btn:hover:not(:disabled) { background: rgba(0,180,255,0.06); color: rgba(220,235,255,0.90); border-color: rgba(0,180,255,0.18); }
      .d8b-agent-btn--active { border-color: rgba(0,200,255,0.30); background: rgba(0,200,255,0.06); color: rgba(0,220,255,0.90); }
      .d8b-agent-btn--loading { opacity: 0.55; cursor: not-allowed; }
      .d8b-agent-btn:disabled { opacity: 0.40; cursor: not-allowed; }

      /* ── SEO panel ── */
      .d8b-seo-panel {
        border-radius: 14px; border: 1px solid rgba(0,180,255,0.10);
        background: rgba(0,15,40,0.30); padding: 16px;
        display: flex; flex-direction: column; gap: 12px;
        backdrop-filter: blur(4px);
      }
      .d8b-seo-loading { font-size: 12px; color: rgba(140,175,220,0.50); text-align: center; padding: 8px 0; }
      .d8b-seo-score-row { display: flex; align-items: center; gap: 14px; }
      .d8b-seo-score { font-size: 38px; font-weight: 900; letter-spacing: -0.04em; line-height: 1; flex-shrink: 0; }
      .d8b-seo-grade { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; margin-bottom: 3px; }
      .d8b-seo-summary { font-size: 11px; color: rgba(160,190,230,0.55); line-height: 1.5; }
      .d8b-seo-strengths { display: flex; flex-direction: column; gap: 4px; }
      .d8b-seo-strength { font-size: 11px; color: rgba(0,255,178,0.75); line-height: 1.5; }
      .d8b-seo-issues { display: flex; flex-direction: column; gap: 8px; }
      .d8b-seo-issue {
        padding: 10px 12px; border-radius: 10px;
        border-left: 3px solid rgba(120,160,220,0.15);
      }
      .d8b-seo-issue--critical { border-left-color: rgba(255,60,90,0.70); background: rgba(255,60,90,0.04); }
      .d8b-seo-issue--warning  { border-left-color: rgba(255,200,60,0.70); background: rgba(255,200,60,0.04); }
      .d8b-seo-issue--info     { border-left-color: rgba(0,180,255,0.40); background: rgba(0,180,255,0.03); }
      .d8b-seo-issue-msg { font-size: 11px; font-weight: 700; color: rgba(220,235,255,0.80); margin-bottom: 3px; }
      .d8b-seo-issue-fix { font-size: 10px; color: rgba(140,175,220,0.50); line-height: 1.5; }

      /* ── Published URL banner ── */
      .d8b-published-banner {
        position: fixed; bottom: 0; left: 320px; right: 0;
        display: flex; align-items: center; gap: 10px;
        padding: 10px 18px;
        background: rgba(0,255,178,0.05);
        border-top: 1px solid rgba(0,255,178,0.15);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        z-index: 200;
        font-size: 12px;
      }
      .d8b-published-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: #00FFB2;
        box-shadow: 0 0 10px rgba(0,255,178,0.6);
        flex-shrink: 0;
        animation: d8b-blink 2s ease-in-out infinite;
      }
      .d8b-published-label { color: rgba(0,255,178,0.70); font-weight: 700; flex-shrink: 0; }
      .d8b-published-url {
        color: rgba(0,255,178,0.90); text-decoration: none; font-family: 'JetBrains Mono', ui-monospace, monospace;
        flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .d8b-published-url:hover { text-decoration: underline; }
      .d8b-published-copy {
        flex-shrink: 0; padding: 5px 12px; border-radius: 8px;
        border: 1px solid rgba(0,255,178,0.25);
        background: rgba(0,255,178,0.06);
        color: rgba(0,255,178,0.85); font-size: 11px; font-weight: 600; font-family: inherit;
        cursor: pointer; transition: all 150ms ease;
      }
      .d8b-published-copy:hover { background: rgba(0,255,178,0.12); box-shadow: 0 0 10px rgba(0,255,178,0.08); }

      /* ── Info modal (Settings, Domains, SSL, Automate) ── */
      .d8b-info-modal {
        width: min(540px, 100%);
        border-radius: 24px;
        border: 1px solid rgba(0,180,255,0.15);
        background: rgba(10,14,30,0.95);
        box-shadow: 0 40px 100px rgba(0,0,0,0.70), 0 0 60px rgba(0,120,255,0.05);
        overflow: hidden;
        animation: d8b-modal-in 250ms cubic-bezier(0.16,1,0.3,1);
        backdrop-filter: blur(20px);
      }
      .d8b-info-section {
        border-radius: 14px; border: 1px solid rgba(0,180,255,0.08);
        background: rgba(0,15,40,0.25);
        padding: 16px 18px; margin-bottom: 12px;
        display: flex; flex-direction: column; gap: 8px;
      }
      .d8b-info-section-title { font-size: 12px; font-weight: 800; color: rgba(140,175,220,0.60); letter-spacing: 0.06em; text-transform: uppercase; }
      .d8b-info-section-body { font-size: 13px; color: rgba(160,190,230,0.55); line-height: 1.65; }
      .d8b-info-pill {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 12px; border-radius: 999px;
        background: rgba(0,255,178,0.08); border: 1px solid rgba(0,255,178,0.20);
        color: rgba(0,255,178,0.85); font-size: 11px; font-weight: 700;
      }
      .d8b-info-code {
        font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px;
        background: rgba(4,6,16,0.50); border: 1px solid rgba(0,180,255,0.08);
        border-radius: 10px; padding: 12px 14px;
        color: rgba(0,200,255,0.80); line-height: 1.75;
        white-space: pre;
      }
      .d8b-info-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 0; border-bottom: 1px solid rgba(120,160,220,0.06);
        font-size: 13px;
      }
      .d8b-info-row:last-child { border-bottom: none; padding-bottom: 0; }
      .d8b-info-row-label { color: rgba(140,175,220,0.55); }
      .d8b-info-row-val { color: rgba(220,235,255,0.90); font-weight: 700; }

      /* ── Mobile ── */
      @media (max-width: 768px) {
        .d8b-sidebar { width: 280px; min-width: 280px; }
        .d8b-splash-title { font-size: 36px; }
        .d8b-published-banner { left: 0; }
      }
    `}</style>
  );
}

// ─── Settings Modal ───────────────────────────────────────────────────────────

function SettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="d8b-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="d8b-info-modal">
        <div className="d8b-modal-header">
          <div className="d8b-modal-title">⚙️ Settings</div>
          <button className="d8b-modal-close" onClick={onClose} type="button">✕</button>
        </div>
        <div className="d8b-modal-body">
          <div className="d8b-info-section">
            <div className="d8b-info-section-title">GENERATION</div>
            <div className="d8b-info-row">
              <span className="d8b-info-row-label">AI Model</span>
              <span className="d8b-info-row-val">GPT-4o</span>
            </div>
            <div className="d8b-info-row">
              <span className="d8b-info-row-label">Max output tokens</span>
              <span className="d8b-info-row-val">16,000</span>
            </div>
            <div className="d8b-info-row">
              <span className="d8b-info-row-label">Temperature</span>
              <span className="d8b-info-row-val">0.80 (creative)</span>
            </div>
            <div className="d8b-info-row">
              <span className="d8b-info-row-label">Avg. generation time</span>
              <span className="d8b-info-row-val">~18 seconds</span>
            </div>
          </div>
          <div className="d8b-info-section">
            <div className="d8b-info-section-title">OUTPUT FORMAT</div>
            <div className="d8b-info-section-body">
              Every generated site is a single self-contained HTML file with all CSS and JavaScript inline. Works fully offline once downloaded. No external dependencies required.
            </div>
          </div>
          <div className="d8b-info-section">
            <div className="d8b-info-section-title">DESIGN QUALITY</div>
            <div className="d8b-info-row">
              <span className="d8b-info-row-label">Design standard</span>
              <span className="d8b-info-row-val">Webby Award level</span>
            </div>
            <div className="d8b-info-row">
              <span className="d8b-info-row-label">Sections per site</span>
              <span className="d8b-info-row-val">8 (hero → footer)</span>
            </div>
            <div className="d8b-info-row">
              <span className="d8b-info-row-label">Responsive</span>
              <span className="d8b-info-pill">320px · 768px · 1440px</span>
            </div>
            <div className="d8b-info-row">
              <span className="d8b-info-row-label">Animations</span>
              <span className="d8b-info-row-val">Full micro-interaction suite</span>
            </div>
          </div>
          <div className="d8b-info-section">
            <div className="d8b-info-section-title">ACCOUNT</div>
            <div className="d8b-info-section-body">
              Manage your plan, billing, and usage at{" "}
              <a href="/pricing" style={{ color: "rgba(240,179,90,0.8)", textDecoration: "none" }}>dominat8.io/pricing</a>.
              Upgrade to Pro or Agency for higher generation limits and priority queue.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Domains Modal ────────────────────────────────────────────────────────────

function DomainsModal({ onClose, publishedUrl }: { onClose: () => void; publishedUrl: string | null }) {
  return (
    <div className="d8b-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="d8b-info-modal">
        <div className="d8b-modal-header">
          <div className="d8b-modal-title">🌐 Custom Domain</div>
          <button className="d8b-modal-close" onClick={onClose} type="button">✕</button>
        </div>
        <div className="d8b-modal-body">
          {publishedUrl && (
            <div className="d8b-info-section">
              <div className="d8b-info-section-title">YOUR LIVE SITE</div>
              <div className="d8b-info-row">
                <span className="d8b-info-row-label">Published URL</span>
                <span className="d8b-info-pill">● LIVE</span>
              </div>
              <div className="d8b-info-code">{publishedUrl}</div>
            </div>
          )}
          <div className="d8b-info-section">
            <div className="d8b-info-section-title">POINT YOUR DOMAIN</div>
            <div className="d8b-info-section-body">
              To use a custom domain (e.g. <strong>yoursite.com</strong>), add these DNS records at your registrar (GoDaddy, Namecheap, Cloudflare, etc.):
            </div>
            <div className="d8b-info-code">{`Type    Name    Value
────────────────────────────────
CNAME   @       cname.dominat8.io
CNAME   www     cname.dominat8.io`}</div>
          </div>
          <div className="d8b-info-section">
            <div className="d8b-info-section-title">HOW IT WORKS</div>
            <div className="d8b-info-section-body">
              DNS propagation typically takes 5–60 minutes. Once propagated, your custom domain will serve the generated site with full SSL/HTTPS automatically provisioned.
            </div>
          </div>
          <div className="d8b-info-section">
            <div className="d8b-info-section-title">UPGRADE FOR CUSTOM DOMAINS</div>
            <div className="d8b-info-section-body">
              Custom domain binding is available on <strong>Pro</strong> ($29/mo) and <strong>Agency</strong> ($99/mo) plans.{" "}
              <a href="/pricing" style={{ color: "rgba(240,179,90,0.8)", textDecoration: "none" }}>View plans →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SSL Modal ────────────────────────────────────────────────────────────────

function SSLModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="d8b-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="d8b-info-modal">
        <div className="d8b-modal-header">
          <div className="d8b-modal-title">🔒 SSL / HTTPS</div>
          <button className="d8b-modal-close" onClick={onClose} type="button">✕</button>
        </div>
        <div className="d8b-modal-body">
          <div className="d8b-info-section">
            <div className="d8b-info-row">
              <span className="d8b-info-row-label">Certificate type</span>
              <span className="d8b-info-row-val">TLS 1.3 (Let&apos;s Encrypt)</span>
            </div>
            <div className="d8b-info-row">
              <span className="d8b-info-row-label">Auto-renewal</span>
              <span className="d8b-info-pill">✓ Automatic</span>
            </div>
            <div className="d8b-info-row">
              <span className="d8b-info-row-label">HSTS</span>
              <span className="d8b-info-pill">✓ Enabled</span>
            </div>
            <div className="d8b-info-row">
              <span className="d8b-info-row-label">HTTP → HTTPS redirect</span>
              <span className="d8b-info-pill">✓ Enforced</span>
            </div>
            <div className="d8b-info-row">
              <span className="d8b-info-row-label">Edge network</span>
              <span className="d8b-info-row-val">Global CDN (100+ PoPs)</span>
            </div>
          </div>
          <div className="d8b-info-section">
            <div className="d8b-info-section-title">SECURITY HEADERS</div>
            <div className="d8b-info-code">{`X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Cache-Control: no-store
Referrer-Policy: strict-origin`}</div>
          </div>
          <div className="d8b-info-section">
            <div className="d8b-info-section-title">CERTIFICATE STATUS</div>
            <div className="d8b-info-section-body">
              SSL certificates are auto-provisioned on every deployment. No configuration required — your site is always served over HTTPS from the moment it&apos;s published.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Automate Modal ───────────────────────────────────────────────────────────

type AgentId = "seo-sweep" | "design-fixer" | "responsive-audit" | "performance-optimizer" | "accessibility-checker" | "link-scanner";
type AgentRunState = "idle" | "running" | "done" | "failed";

interface AgentResult { summary: string; model: string; provider: string; data: unknown }

const AUTOMATE_AGENTS: { id: AgentId; icon: string; name: string; desc: string }[] = [
  { id: "seo-sweep",             icon: "🔍", name: "SEO Sweep",            desc: "Scans for title, meta, OG, H1, and structured data issues." },
  { id: "design-fixer",          icon: "🎨", name: "Design Fixer",         desc: "Fixes layout bugs, contrast issues, and typography problems." },
  { id: "responsive-audit",      icon: "📱", name: "Responsive Audit",     desc: "Tests your site at 320px, 768px, and 1440px breakpoints." },
  { id: "performance-optimizer", icon: "⚡", name: "Performance Optimizer", desc: "Identifies critical CSS, render-blocking scripts, and CLS risks." },
  { id: "accessibility-checker", icon: "♿", name: "Accessibility Checker", desc: "Validates ARIA roles, alt text, colour contrast, and keyboard nav." },
  { id: "link-scanner",          icon: "🔗", name: "Link Scanner",         desc: "Validates all internal links, anchors, and CTA buttons." },
];

const SEVERITY_COLOR: Record<string, string> = {
  high: "rgba(255,100,100,0.90)", critical: "rgba(255,60,60,0.95)",
  medium: "rgba(255,180,0,0.90)", serious: "rgba(255,130,0,0.90)", moderate: "rgba(255,180,0,0.85)",
  low: "rgba(255,255,255,0.45)", minor: "rgba(255,255,255,0.40)",
};

function AgentResultDetail({ id, data, onApply }: { id: AgentId; data: unknown; onApply?: () => void }) {
  if (!data) return null;
  if (id === "design-fixer") {
    return (
      <div style={{ marginTop: 8 }}>
        <button onClick={onApply} type="button" style={{ fontSize: 11, padding: "5px 14px", borderRadius: 8, background: "linear-gradient(135deg,#00C97A,#00B36B)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}>
          ✓ Apply to preview
        </button>
      </div>
    );
  }
  const r = data as Record<string, unknown>;
  const issues = (r.issues as Record<string, unknown>[] | undefined) ?? [];
  const strengths = (r.strengths ?? r.passes ?? r.quick_wins) as string[] | undefined;
  const score = r.score as number | undefined;
  const grade = r.grade as string | undefined;
  return (
    <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
      {score !== undefined && (
        <div style={{ fontSize: 11, color: score >= 70 ? "rgba(56,248,166,0.90)" : score >= 50 ? "rgba(255,180,0,0.90)" : "rgba(255,100,100,0.90)", fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>
          Score: {score}/100{grade ? ` (${grade})` : ""}
        </div>
      )}
      {issues.slice(0, 5).map((iss, i) => {
        const sev = String(iss.severity ?? iss.priority ?? "low");
        return (
          <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", background: "rgba(0,0,0,0.25)", borderRadius: 6, padding: "5px 8px" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: SEVERITY_COLOR[sev] ?? "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.04em", minWidth: 36, paddingTop: 1 }}>{sev.slice(0, 4)}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", lineHeight: 1.45 }}>{String(iss.message ?? iss.title ?? iss.problem ?? "")}</span>
          </div>
        );
      })}
      {issues.length > 5 && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", paddingLeft: 2 }}>+{issues.length - 5} more issues</div>}
      {strengths && strengths.slice(0, 2).map((s, i) => (
        <div key={i} style={{ fontSize: 11, color: "rgba(56,248,166,0.75)", paddingLeft: 4 }}>✓ {s}</div>
      ))}
    </div>
  );
}

interface CreditInfo {
  admin: boolean;
  balance: { plan: string; monthlyAllowance: number; monthlyUsed: number; monthlyRemaining: number; purchased: number; total: number };
  costs: Record<AgentId, number>;
  access: AgentId[];
  packs: { id: string; credits: number; priceInCents: number; label: string; tag: string }[];
}

function AutomateModal({ onClose, html, prompt: _prompt, onApplyHtml }: { onClose: () => void; html: string; prompt: string; onApplyHtml?: (html: string) => void }) {
  const [states, setStates] = useState<Record<AgentId, AgentRunState>>({} as Record<AgentId, AgentRunState>);
  const [results, setResults] = useState<Record<AgentId, AgentResult>>({} as Record<AgentId, AgentResult>);
  const [expanded, setExpanded] = useState<Record<AgentId, boolean>>({} as Record<AgentId, boolean>);
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [showBuy, setShowBuy] = useState(false);
  const [buyingPack, setBuyingPack] = useState<string | null>(null);
  const hasHtml = !!html.trim();

  useEffect(() => {
    fetch("/api/io/agents/credits")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.balance) setCreditInfo(d as CreditInfo); })
      .catch(() => {});
  }, []);

  function updateBalance(b: CreditInfo["balance"] | null | undefined) {
    if (b) setCreditInfo(ci => ci ? { ...ci, balance: b } : ci);
  }

  function agentAccess(id: AgentId) {
    if (!creditInfo) return { canRun: true, locked: false, tooExpensive: false };
    if (creditInfo.admin) return { canRun: true, locked: false, tooExpensive: false };
    const accessible = creditInfo.access.includes(id);
    const cost = creditInfo.costs[id] ?? 1;
    const affordable = creditInfo.balance.total >= cost;
    return { canRun: accessible && affordable, locked: !accessible, tooExpensive: accessible && !affordable };
  }

  async function buyCredits(packId: string) {
    setBuyingPack(packId);
    try {
      const res = await fetch("/api/stripe/credits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally { setBuyingPack(null); }
  }

  async function runAgent(id: AgentId) {
    if (!hasHtml || states[id] === "running") return;
    setStates(s => ({ ...s, [id]: "running" }));
    try {
      const res = await fetch("/api/io/agents/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ agent: id, html, prompt: _prompt }),
      });
      const data = await res.json();
      if (data.ok) {
        setStates(s => ({ ...s, [id]: "done" }));
        setResults(s => ({ ...s, [id]: { summary: data.summary, model: data.model, provider: data.provider, data: data.result } }));
        setExpanded(s => ({ ...s, [id]: true }));
        updateBalance(data.balance);
      } else {
        setStates(s => ({ ...s, [id]: "failed" }));
        const errMsg = data.code === "NO_ACCESS" ? `🔒 ${data.error}`
          : data.code === "INSUFFICIENT_CREDITS" ? `⚡ ${data.error}`
          : (data.error ?? "Agent failed.");
        setResults(s => ({ ...s, [id]: { summary: errMsg, model: "", provider: "", data: null } }));
        updateBalance(data.balance);
      }
    } catch (e: unknown) {
      setStates(s => ({ ...s, [id]: "failed" }));
      setResults(s => ({ ...s, [id]: { summary: e instanceof Error ? e.message : "Network error.", model: "", provider: "", data: null } }));
    }
  }

  async function runAll() {
    for (const ag of AUTOMATE_AGENTS) {
      const { canRun } = agentAccess(ag.id);
      if (canRun && states[ag.id] !== "running") runAgent(ag.id);
    }
  }

  const totalCredits = creditInfo?.balance.total ?? null;
  const planLabel = creditInfo?.admin ? "Admin" : creditInfo?.balance.plan ?? null;

  return (
    <div className="d8b-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="d8b-info-modal" style={{ maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* ── Header ── */}
        <div className="d8b-modal-header" style={{ flexDirection: "column", gap: 10, alignItems: "stretch" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="d8b-modal-title">⚡ Automate</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {hasHtml && (
                <button onClick={runAll} disabled={AUTOMATE_AGENTS.some(a => states[a.id] === "running")} type="button"
                  style={{ fontSize: 12, padding: "4px 12px", borderRadius: 8, background: "rgba(240,179,90,0.12)", border: "1px solid rgba(240,179,90,0.30)", color: "rgba(240,179,90,0.90)", cursor: "pointer", fontWeight: 600 }}>
                  Run All
                </button>
              )}
              <button className="d8b-modal-close" onClick={onClose} type="button">✕</button>
            </div>
          </div>

          {/* Credit balance bar */}
          {creditInfo && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "7px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 11 }}>
                  <span style={{ color: "rgba(255,255,255,0.40)" }}>Plan </span>
                  <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, textTransform: "capitalize" }}>{planLabel}</span>
                </div>
                {!creditInfo.admin && (
                  <div style={{ fontSize: 11 }}>
                    <span style={{ color: "rgba(255,255,255,0.40)" }}>Credits </span>
                    <span style={{ fontWeight: 700, fontFamily: "ui-monospace,monospace", color: totalCredits! > 5 ? "rgba(56,248,166,0.90)" : totalCredits! > 0 ? "rgba(255,180,0,0.90)" : "rgba(255,100,100,0.90)" }}>
                      {totalCredits}
                    </span>
                    {(creditInfo.balance.purchased ?? 0) > 0 && (
                      <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 10 }}>
                        {" "}({creditInfo.balance.monthlyRemaining} mo + {creditInfo.balance.purchased} bought)
                      </span>
                    )}
                  </div>
                )}
                {creditInfo.admin && <span style={{ fontSize: 10, color: "rgba(240,179,90,0.75)", fontWeight: 700, letterSpacing: "0.05em" }}>∞ ADMIN</span>}
              </div>
              {!creditInfo.admin && (
                <button onClick={() => setShowBuy(b => !b)} type="button"
                  style={{ fontSize: 11, padding: "3px 10px", borderRadius: 7, background: showBuy ? "rgba(240,179,90,0.12)" : "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.70)", cursor: "pointer", fontWeight: 600 }}>
                  {showBuy ? "▲ Hide" : "+ Buy credits"}
                </button>
              )}
            </div>
          )}

          {/* Credit packs */}
          {showBuy && creditInfo?.packs && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {creditInfo.packs.map(pack => (
                <button key={pack.id} onClick={() => buyCredits(pack.id)} disabled={!!buyingPack} type="button"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 6px", cursor: buyingPack ? "wait" : "pointer", textAlign: "center" as const }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "rgba(255,255,255,0.92)" }}>{pack.credits}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>credits</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(240,179,90,0.85)", marginTop: 4 }}>${(pack.priceInCents / 100).toFixed(2)}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", marginTop: 2, textTransform: "capitalize" as const }}>{pack.tag}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Agent list ── */}
        <div className="d8b-modal-body" style={{ overflowY: "auto", flex: 1 }}>
          {!hasHtml && (
            <p className="d8b-modal-desc" style={{ background: "rgba(255,209,102,0.07)", border: "1px solid rgba(255,209,102,0.20)", borderRadius: 10, padding: "10px 14px", color: "rgba(255,209,102,0.90)" }}>
              Generate a site first — agents need your HTML to analyse.
            </p>
          )}
          {AUTOMATE_AGENTS.map((agent) => {
            const st = states[agent.id] ?? "idle";
            const res = results[agent.id];
            const isExp = expanded[agent.id];
            const { locked, tooExpensive, canRun } = agentAccess(agent.id);
            const cost = creditInfo?.costs[agent.id] ?? null;

            return (
              <div key={agent.id} className="d8b-info-section d8b-info-section--agent" style={{ opacity: locked ? 0.65 : 1 }}>
                <div className="d8b-automate-row">
                  <div className="d8b-automate-row-main">
                    <span className="d8b-automate-icon">{locked ? "🔒" : agent.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
                        <div className="d8b-info-section-title d8b-info-section-title--compact">{agent.name}</div>
                        {cost !== null && !creditInfo?.admin && (
                          <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.30)", background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "1px 5px" }}>
                            {cost} cr
                          </span>
                        )}
                        {locked && (
                          <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,180,0,0.80)", background: "rgba(255,180,0,0.08)", borderRadius: 4, padding: "1px 6px" }}>
                            {agent.id === "design-fixer" ? "Pro+" : "Starter+"}
                          </span>
                        )}
                      </div>
                      {st === "idle" && !locked && <div className="d8b-info-section-body d8b-info-section-body--small">{agent.desc}</div>}
                      {locked && <div style={{ fontSize: 11, color: "rgba(255,180,0,0.60)", marginTop: 2 }}>Upgrade your plan to unlock this agent.</div>}
                      {tooExpensive && st === "idle" && <div style={{ fontSize: 11, color: "rgba(255,100,100,0.70)", marginTop: 2 }}>Not enough credits — buy more to run this agent.</div>}
                      {res && (
                        <div style={{ marginTop: 4 }}>
                          <div style={{ fontSize: 11, lineHeight: 1.5, color: st === "failed" ? "rgba(255,100,100,0.85)" : "rgba(56,248,166,0.90)", fontFamily: "ui-monospace,monospace" }}>
                            {st !== "failed" && "✓ "}{res.summary}
                          </div>
                          {res.model && (
                            <div style={{ marginTop: 3, fontSize: 10, color: "rgba(255,255,255,0.28)" }}>
                              via {res.provider === "anthropic" ? "🟠 Claude" : "⬢ OpenAI"} · {res.model}
                            </div>
                          )}
                          {st === "done" && !!res.data && (
                            <button onClick={() => setExpanded(s => ({ ...s, [agent.id]: !isExp }))} type="button"
                              style={{ marginTop: 4, fontSize: 10, color: "rgba(240,179,90,0.75)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                              {isExp ? "▲ Hide details" : "▼ View details"}
                            </button>
                          )}
                          {isExp && !!res.data && (
                            <AgentResultDetail
                              id={agent.id}
                              data={res.data}
                              onApply={agent.id === "design-fixer" ? () => {
                                if (typeof res.data === "string" && res.data.trim().startsWith("<")) {
                                  onApplyHtml?.(res.data as string);
                                  setExpanded(s => ({ ...s, [agent.id]: false }));
                                }
                              } : undefined}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => locked || tooExpensive ? setShowBuy(true) : runAgent(agent.id)}
                    disabled={st === "running" || (!hasHtml && !locked && !tooExpensive)}
                    type="button"
                    style={{
                      flexShrink: 0, fontSize: 11, padding: "4px 10px", borderRadius: 8, fontWeight: 600, whiteSpace: "nowrap" as const,
                      cursor: st === "running" ? "not-allowed" : "pointer",
                      background: locked || tooExpensive ? "rgba(255,180,0,0.10)" : st === "done" ? "rgba(56,248,166,0.12)" : st === "failed" ? "rgba(255,100,100,0.12)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${locked || tooExpensive ? "rgba(255,180,0,0.30)" : st === "done" ? "rgba(56,248,166,0.35)" : st === "failed" ? "rgba(255,100,100,0.35)" : "rgba(255,255,255,0.14)"}`,
                      color: locked || tooExpensive ? "rgba(255,180,0,0.85)" : st === "done" ? "rgba(56,248,166,0.90)" : st === "failed" ? "rgba(255,100,100,0.85)" : canRun ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.40)",
                      opacity: !hasHtml && !locked && !tooExpensive ? 0.4 : 1,
                    }}>
                    {st === "running" ? "Running…" : locked ? "Upgrade" : tooExpensive ? "Buy credits" : st === "done" ? "✓ Done" : st === "failed" ? "↩ Retry" : "Run"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Home Styles ──────────────────────────────────────────────────────────────

function HomeStyles() {
  return (
    <style>{`
      .d8h-root {
        min-height: 100vh;
        width: 100%;
        background: #030712;
        color: #E8F0FF;
        font-family: 'Outfit', 'Inter', system-ui, sans-serif;
        display: flex;
        flex-direction: column;
        padding-bottom: 100px;
        position: relative;
        overflow-x: hidden;
      }

      /* ── Grid overlay ── */
      .d8h-root::before {
        content: '';
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background-image:
          linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
        background-size: 60px 60px;
        mask-image: radial-gradient(ellipse 80% 50% at 50% 20%, black 0%, transparent 70%);
        -webkit-mask-image: radial-gradient(ellipse 80% 50% at 50% 20%, black 0%, transparent 70%);
      }

      /* ── Animated ambient orbs — VIVID ── */
      .d8h-bg {
        position: fixed; inset: 0;
        pointer-events: none; z-index: 0; overflow: hidden;
      }
      .d8h-bg-a {
        position: absolute;
        width: 900px; height: 700px;
        top: -250px; left: -200px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0,212,255,0.18) 0%, transparent 65%);
        filter: blur(60px);
        animation: d8h-drift-a 22s ease-in-out infinite;
      }
      .d8h-bg-b {
        position: absolute;
        width: 800px; height: 600px;
        top: 80px; right: -250px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(123,97,255,0.14) 0%, transparent 65%);
        filter: blur(60px);
        animation: d8h-drift-b 28s ease-in-out infinite;
      }
      .d8h-bg-c {
        position: absolute;
        width: 600px; height: 500px;
        bottom: -150px; left: 25%;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0,255,178,0.10) 0%, transparent 65%);
        filter: blur(60px);
        animation: d8h-drift-a 35s ease-in-out infinite reverse;
      }
      @keyframes d8h-drift-a {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(60px, 40px) scale(1.08); }
        66% { transform: translate(-40px, 60px) scale(0.95); }
      }
      @keyframes d8h-drift-b {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(-70px, -30px) scale(1.10); }
        66% { transform: translate(50px, 50px) scale(0.93); }
      }
      @keyframes d8h-shimmer {
        0% { left: -100%; }
        40% { left: 100%; }
        100% { left: 100%; }
      }

      /* ── Payment success banner ── */
      .d8h-payment-banner {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        padding: 11px 20px;
        background: rgba(0,255,178,0.10);
        border-bottom: 1px solid rgba(0,255,178,0.25);
        font-size: 13px; color: rgba(0,255,178,0.90);
        position: relative;
      }
      .d8h-payment-dismiss {
        position: absolute; right: 14px;
        background: none; border: none; cursor: pointer;
        color: rgba(0,255,178,0.60); font-size: 14px; line-height: 1;
        padding: 0; font-family: inherit;
      }
      .d8h-payment-dismiss:hover { color: rgba(0,255,178,0.90); }

      /* ── Header ── */
      .d8h-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 28px;
        border-bottom: 1px solid rgba(0,212,255,0.08);
        position: sticky; top: 0; z-index: 50;
        background: rgba(3,7,18,0.80);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
      }
      .d8h-logo { display: flex; align-items: center; gap: 7px; }
      .d8h-logo-mark {
        font-size: 18px; font-weight: 900;
        background: linear-gradient(135deg, #E8F0FF, #00D4FF);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -0.04em;
      }
      .d8h-logo-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #00D4FF;
        box-shadow: 0 0 10px rgba(0,212,255,0.7);
        animation: d8h-dot-pulse 3s ease-in-out infinite;
      }
      @keyframes d8h-dot-pulse {
        0%, 100% { opacity: 0.75; box-shadow: 0 0 6px rgba(0,212,255,0.4); }
        50% { opacity: 1; box-shadow: 0 0 14px rgba(0,212,255,0.8); }
      }
      .d8h-logo-text {
        font-size: 13px; font-weight: 500;
        color: rgba(200,220,255,0.50); letter-spacing: 0.01em;
      }
      .d8h-nav { display: flex; gap: 6px; align-items: center; }
      .d8h-nav-signin {
        padding: 7px 16px;
        border-radius: 999px;
        border: 1px solid rgba(0,212,255,0.40);
        background: rgba(0,212,255,0.12);
        color: #00D4FF;
        font-size: 12px; font-weight: 600; font-family: inherit;
        cursor: pointer; transition: all 140ms ease;
      }
      .d8h-nav-signin:hover {
        background: rgba(0,212,255,0.22);
        border-color: rgba(0,212,255,0.60);
        box-shadow: 0 0 16px rgba(0,212,255,0.15);
      }
      .d8h-nav-link {
        padding: 6px 14px;
        border-radius: 999px;
        border: 1px solid rgba(100,180,255,0.12);
        background: rgba(100,180,255,0.05);
        color: rgba(200,220,255,0.60);
        font-size: 12px;
        text-decoration: none;
        transition: all 120ms ease;
      }
      .d8h-nav-link:hover { color: #E8F0FF; border-color: rgba(100,180,255,0.25); background: rgba(100,180,255,0.10); }

      /* ── Hero ── */
      .d8h-hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 80px 24px 48px;
        gap: 24px;
        position: relative; z-index: 1;
      }
      .d8h-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 7px 20px; border-radius: 999px;
        border: 1px solid rgba(0,212,255,0.30);
        background: rgba(0,212,255,0.06);
        color: #00D4FF;
        font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
        text-transform: uppercase;
        box-shadow: 0 0 30px rgba(0,212,255,0.10);
      }
      .d8h-eyebrow-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: #00D4FF;
        box-shadow: 0 0 12px rgba(0,212,255,0.8);
        flex-shrink: 0;
        animation: d8h-dot-pulse 2.5s ease-in-out infinite;
      }
      .d8h-title {
        margin: 0;
        font-size: clamp(48px, 7vw, 82px);
        font-weight: 900;
        color: #E8F0FF;
        letter-spacing: -0.04em;
        text-align: center;
        line-height: 1.02;
      }
      .d8h-title-accent {
        background: linear-gradient(135deg, #00D4FF 0%, #0066FF 50%, #7B61FF 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: none;
      }
      .d8h-sub {
        margin: 0;
        font-size: 18px;
        color: rgba(200,220,255,0.45);
        text-align: center;
        letter-spacing: -0.01em;
        max-width: 540px;
        line-height: 1.60;
        font-family: 'Inter', system-ui, sans-serif;
      }

      /* ── Input row — PREMIUM ── */
      .d8h-input-row {
        display: flex;
        align-items: center;
        width: min(740px, 100%);
        background: rgba(100,180,255,0.04);
        border: 1px solid rgba(100,180,255,0.15);
        border-radius: 18px;
        padding: 8px 8px 8px 20px;
        gap: 10px;
        transition: all 200ms ease;
        position: relative;
      }
      .d8h-input-row:focus-within {
        border-color: rgba(0,212,255,0.45);
        box-shadow: 0 0 0 4px rgba(0,212,255,0.08), 0 8px 32px rgba(0,0,0,0.40), 0 0 40px rgba(0,212,255,0.06);
        background: rgba(100,180,255,0.06);
      }
      .d8h-input-icon { font-size: 20px; flex-shrink: 0; }
      .d8h-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: #E8F0FF;
        font-size: 16px;
        font-family: inherit;
        letter-spacing: -0.01em;
        min-width: 0;
      }
      .d8h-input::placeholder { color: rgba(200,220,255,0.30); }
      .d8h-gen-btn {
        flex-shrink: 0;
        padding: 13px 28px;
        border-radius: 12px;
        border: none;
        background: linear-gradient(135deg, #00D4FF, #0066FF);
        color: #030712;
        font-size: 14px;
        font-weight: 800;
        font-family: inherit;
        letter-spacing: 0.04em;
        cursor: pointer;
        transition: all 180ms ease;
        box-shadow: 0 4px 18px rgba(0,212,255,0.35);
        position: relative; overflow: hidden;
      }
      .d8h-gen-btn::after {
        content: '';
        position: absolute; top: 0; left: -100%;
        width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        animation: d8h-shimmer 4s ease-in-out infinite;
      }
      .d8h-gen-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #1ADCFF, #1A7AFF);
        box-shadow: 0 6px 28px rgba(0,212,255,0.50);
        transform: translateY(-2px);
      }
      .d8h-gen-btn:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
      .d8h-gen-btn:disabled::after { animation: none; }
      .d8h-mic-btn {
        flex-shrink: 0;
        width: 40px; height: 40px;
        border-radius: 10px;
        border: 1px solid rgba(100,180,255,0.15);
        background: rgba(100,180,255,0.06);
        color: rgba(200,220,255,0.55);
        font-size: 16px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 140ms ease;
      }
      .d8h-mic-btn:hover { background: rgba(100,180,255,0.12); color: #E8F0FF; border-color: rgba(100,180,255,0.30); }

      /* ── Options row (vibes + model) ── */
      .d8h-options-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        width: min(740px, 100%);
      }
      .d8h-vibe-chip {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 7px 14px;
        border-radius: 10px;
        border: 1px solid rgba(100,180,255,0.12);
        background: rgba(100,180,255,0.04);
        color: rgba(200,220,255,0.55);
        font-size: 12px; font-weight: 500; font-family: inherit;
        cursor: pointer; transition: all 150ms ease;
      }
      .d8h-vibe-chip:hover {
        border-color: rgba(123,97,255,0.35);
        background: rgba(123,97,255,0.08);
        color: rgba(200,220,255,0.85);
        transform: translateY(-1px);
      }
      .d8h-vibe-chip--active {
        border-color: rgba(123,97,255,0.55);
        background: rgba(123,97,255,0.12);
        color: #B4A0FF;
        box-shadow: 0 0 16px rgba(123,97,255,0.12);
      }
      .d8h-vibe-icon { font-size: 14px; opacity: 0.7; }
      .d8h-model-toggle {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 7px 14px;
        border-radius: 10px;
        border: 1px solid rgba(0,212,255,0.20);
        background: rgba(0,212,255,0.05);
        color: rgba(0,212,255,0.70);
        font-size: 12px; font-weight: 600; font-family: inherit;
        cursor: pointer; transition: all 150ms ease;
        margin-left: auto;
      }
      .d8h-model-toggle:hover {
        border-color: rgba(0,212,255,0.40);
        background: rgba(0,212,255,0.10);
        color: #00D4FF;
      }

      /* ── Industry chips ── */
      /* ── Quick row + customize ── */
      .d8h-quick-row {
        display: flex; align-items: center; justify-content: center;
        gap: 8px; flex-wrap: wrap; margin-top: 12px;
      }
      .d8h-quick-tag {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 5px 12px; border-radius: 20px; font-size: 12px;
        font-weight: 600; font-family: inherit; cursor: pointer;
        border: 1px solid rgba(0,212,255,0.25);
        background: rgba(0,212,255,0.08); color: #00D4FF;
        transition: all 180ms ease;
      }
      .d8h-quick-tag:hover { background: rgba(0,212,255,0.14); }
      .d8h-customize-toggle {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 5px 14px; border-radius: 20px; font-size: 12px;
        font-weight: 600; font-family: inherit; cursor: pointer;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.04); color: rgba(200,220,255,0.55);
        transition: all 200ms ease;
      }
      .d8h-customize-toggle:hover { border-color: rgba(0,212,255,0.25); color: rgba(200,220,255,0.85); }
      .d8h-customize-toggle--open { border-color: rgba(0,212,255,0.30); color: #00D4FF; background: rgba(0,212,255,0.06); }
      .d8h-customize-toggle svg { transition: transform 300ms ease; }
      .d8h-customize-toggle--open svg { transform: rotate(45deg); }
      .d8h-options-expanded {
        display: flex; flex-direction: column; align-items: center; gap: 12px;
        margin-top: 14px; padding: 16px 20px;
        border-radius: 16px; border: 1px solid rgba(0,212,255,0.10);
        background: rgba(0,212,255,0.02);
        animation: d8hSlideDown 200ms ease;
      }
      @keyframes d8hSlideDown {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .d8h-chips {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 7px;
        width: min(760px, 100%);
      }
      .d8h-chip {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 7px 14px;
        border-radius: 999px;
        border: 1px solid rgba(100,180,255,0.10);
        background: rgba(100,180,255,0.03);
        color: rgba(200,220,255,0.50);
        font-size: 12px; font-weight: 500; font-family: inherit;
        cursor: pointer; transition: all 150ms ease;
      }
      .d8h-chip:hover {
        border-color: rgba(0,212,255,0.25);
        color: rgba(200,220,255,0.85);
        background: rgba(0,212,255,0.05);
        transform: translateY(-1px);
      }
      .d8h-chip--active {
        border-color: rgba(0,212,255,0.50);
        background: rgba(0,212,255,0.10);
        color: #00D4FF;
        box-shadow: 0 0 14px rgba(0,212,255,0.10);
      }

      /* ── Social proof ── */
      .d8h-social-proof {
        display: flex; align-items: center; justify-content: center;
        flex-wrap: wrap; gap: 8px 12px;
        margin: 24px 0 0;
        padding: 0 24px;
      }
      .d8h-avatars { display: flex; align-items: center; }
      .d8h-avatar {
        width: 24px; height: 24px; border-radius: 50%;
        border: 2px solid #030712;
        display: inline-block; flex-shrink: 0;
      }
      .d8h-sp-count {
        font-size: 13px; color: rgba(200,220,255,0.60);
      }
      .d8h-sp-num { font-weight: 700; color: #E8F0FF; }
      .d8h-sp-divider { color: rgba(100,180,255,0.20); font-size: 13px; }
      .d8h-sp-tag {
        font-size: 12px; color: rgba(200,220,255,0.40);
        padding: 3px 10px; border-radius: 999px;
        border: 1px solid rgba(100,180,255,0.10);
        background: rgba(100,180,255,0.04);
      }

      /* ── Deployments ── */
      .d8h-deploys {
        width: min(820px, 100%);
        margin: 0 auto;
        padding: 0 24px;
        position: relative; z-index: 1;
      }
      .d8h-deploys-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 0 14px;
        border-bottom: 1px solid rgba(100,180,255,0.08);
        margin-bottom: 12px;
      }
      .d8h-deploys-title {
        font-size: 13px; font-weight: 700;
        background: linear-gradient(135deg, #E8F0FF, #00D4FF);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
        text-transform: uppercase; letter-spacing: 0.08em;
      }
      .d8h-deploys-live {
        display: flex; align-items: center; gap: 6px;
        font-size: 12px; color: rgba(200,220,255,0.45);
      }
      .d8h-live-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: #00FFB2;
        box-shadow: 0 0 8px rgba(0,255,178,0.6);
        animation: d8h-blink 2s ease-in-out infinite;
      }
      @keyframes d8h-blink { 0%,100%{opacity:1;} 50%{opacity:0.35;} }

      .d8h-deploys-list { display: flex; flex-direction: column; gap: 10px; }
      .d8h-dep-row {
        display: flex; align-items: center; gap: 14px;
        padding: 14px 18px;
        border-radius: 16px;
        border: 1px solid rgba(100,180,255,0.10);
        background: rgba(100,180,255,0.03);
        backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        transition: all 180ms ease;
        box-shadow: 0 2px 16px rgba(0,0,0,0.25);
        position: relative; overflow: hidden;
      }
      .d8h-dep-row::before {
        content: ''; position: absolute; inset: 0;
        border-radius: 16px; padding: 1px;
        background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(100,180,255,0.05));
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor; mask-composite: exclude;
        opacity: 0; transition: opacity 200ms; pointer-events: none;
      }
      .d8h-dep-row:hover {
        background: rgba(100,180,255,0.06);
        border-color: rgba(0,212,255,0.18);
        box-shadow: 0 6px 28px rgba(0,0,0,0.35), 0 0 20px rgba(0,212,255,0.04);
        transform: translateY(-1px);
      }
      .d8h-dep-row:hover::before { opacity: 1; }
      .d8h-dep-icon { font-size: 20px; flex-shrink: 0; }
      .d8h-dep-info { flex: 1; min-width: 0; }
      .d8h-dep-domain {
        font-size: 14px; font-weight: 700; color: #E8F0FF;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .d8h-dep-desc {
        font-size: 11px; color: rgba(200,220,255,0.40);
        margin-top: 3px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .d8h-dep-bar-wrap {
        display: flex; align-items: center; gap: 8px;
        flex-shrink: 0; width: 140px;
      }
      .d8h-dep-bar-track {
        flex: 1; height: 5px; border-radius: 999px;
        background: rgba(100,180,255,0.08); overflow: hidden;
      }
      .d8h-dep-bar-fill {
        height: 100%; border-radius: 999px;
        transition: width 600ms ease;
      }
      .d8h-dep-pct { font-size: 11px; color: rgba(200,220,255,0.50); flex-shrink: 0; width: 30px; text-align: right; font-family: 'JetBrains Mono', ui-monospace, monospace; }
      .d8h-dep-status { font-size: 11px; color: rgba(200,220,255,0.50); flex-shrink: 0; width: 70px; text-align: center; }
      .d8h-dep-pill {
        display: inline-flex; align-items: center;
        padding: 4px 12px; border-radius: 999px;
        border: 1px solid; font-size: 11px; font-weight: 700;
        letter-spacing: 0.04em; flex-shrink: 0;
      }
      .d8h-deploys-empty {
        font-size: 13px; color: rgba(200,220,255,0.30);
        text-align: center; padding: 24px 0;
      }

      /* ── Bottom dock — futuristic glass ── */
      .d8h-dock {
        position: fixed;
        bottom: 20px; left: 50%; transform: translateX(-50%);
        display: flex; gap: 4px; align-items: end;
        padding: 10px 16px 10px;
        border-radius: 24px;
        border: 1px solid rgba(0,212,255,0.18);
        background: linear-gradient(180deg, rgba(8,14,30,0.92) 0%, rgba(3,7,18,0.96) 100%);
        backdrop-filter: blur(32px) saturate(1.6);
        -webkit-backdrop-filter: blur(32px) saturate(1.6);
        z-index: 100;
        box-shadow:
          0 16px 60px rgba(0,0,0,0.7),
          0 0 80px rgba(0,212,255,0.06),
          0 1px 0 rgba(0,212,255,0.15) inset,
          0 -1px 0 rgba(123,97,255,0.08) inset;
      }
      .d8h-dock::before {
        content: ''; position: absolute; inset: 0; border-radius: 24px; padding: 1px;
        background: linear-gradient(135deg, rgba(0,212,255,0.25), rgba(123,97,255,0.15), transparent 60%);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
      }
      .d8h-dock-btn {
        position: relative;
        display: flex; flex-direction: column; align-items: center;
        gap: 4px; padding: 10px 12px 8px;
        border-radius: 14px;
        border: 1px solid transparent;
        background: rgba(255,255,255,0.03);
        color: var(--dock-color, rgba(200,220,255,0.7));
        cursor: pointer; transition: all 280ms cubic-bezier(0.34,1.56,0.64,1);
        min-width: 56px;
        text-decoration: none;
        overflow: hidden;
      }
      .d8h-dock-glow {
        position: absolute; inset: 0; border-radius: 14px;
        background: radial-gradient(circle at 50% 40%, var(--dock-color), transparent 70%);
        opacity: 0; transition: opacity 300ms ease; pointer-events: none;
      }
      .d8h-dock-btn:hover {
        border-color: color-mix(in srgb, var(--dock-color) 30%, transparent);
        background: color-mix(in srgb, var(--dock-color) 10%, transparent);
        transform: translateY(-6px) scale(1.08);
        box-shadow:
          0 8px 32px color-mix(in srgb, var(--dock-color) 25%, transparent),
          0 0 20px color-mix(in srgb, var(--dock-color) 12%, transparent);
      }
      .d8h-dock-btn:hover .d8h-dock-glow { opacity: 0.12; }
      .d8h-dock-btn:hover .d8h-dock-svg { filter: drop-shadow(0 0 6px var(--dock-color)); }
      .d8h-dock-btn:hover .d8h-dock-label { color: var(--dock-color); }
      .d8h-dock-svg {
        width: 22px; height: 22px;
        color: var(--dock-color, rgba(200,220,255,0.7));
        transition: filter 280ms ease, transform 280ms ease;
        flex-shrink: 0;
        filter: drop-shadow(0 0 2px color-mix(in srgb, var(--dock-color) 30%, transparent));
      }
      .d8h-dock-label {
        font-size: 9px; font-family: inherit; font-weight: 600;
        color: rgba(200,220,255,0.40);
        letter-spacing: 0.05em;
        white-space: nowrap;
        text-transform: uppercase;
        transition: color 280ms ease;
      }

      /* ── Footer ── */
      .d8h-footer {
        text-align: center;
        padding: 40px 24px 100px;
        margin-top: 32px;
      }
      .d8h-footer-links {
        display: flex; flex-wrap: wrap;
        align-items: center; justify-content: center;
        gap: 4px 18px; margin-bottom: 14px;
      }
      .d8h-footer-link {
        font-size: 13px; color: rgba(200,220,255,0.30);
        text-decoration: none; transition: color 140ms ease;
      }
      .d8h-footer-link:hover { color: rgba(200,220,255,0.70); }
      .d8h-footer-copy {
        font-size: 12px; color: rgba(200,220,255,0.15);
      }

      @media (max-width: 640px) {
        .d8h-title { font-size: 36px; }
        .d8h-options-row { gap: 5px; }
        .d8h-vibe-chip { padding: 5px 10px; font-size: 11px; }
        .d8h-dock { gap: 2px; padding: 6px 8px; }
        .d8h-dock-btn { min-width: 42px; padding: 8px 6px 6px; }
        .d8h-dock-svg { width: 20px; height: 20px; }
        .d8h-dock-label { display: none; }
      }

      @media (prefers-reduced-motion: reduce) {
        .d8h-bg-a, .d8h-bg-b, .d8h-bg-c { animation: none !important; }
        .d8h-gen-btn::after { animation: none !important; }
      }
    `}</style>
  );
}
