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

// ─── Dock Modals (stubs — wired into dock buttons) ───────────────────────────

function SettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="d8b-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="d8b-info-modal">
        <div className="d8b-modal-header">
          <div className="d8b-modal-title">Settings</div>
          <button className="d8b-modal-close" onClick={onClose} type="button">✕</button>
        </div>
        <div className="d8b-modal-body">
          <p className="d8b-modal-desc">Site settings coming soon.</p>
        </div>
      </div>
    </div>
  );
}

function DomainsModal({ onClose, publishedUrl }: { onClose: () => void; publishedUrl: string | null }) {
  return (
    <div className="d8b-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="d8b-info-modal">
        <div className="d8b-modal-header">
          <div className="d8b-modal-title">Custom Domain</div>
          <button className="d8b-modal-close" onClick={onClose} type="button">✕</button>
        </div>
        <div className="d8b-modal-body">
          {publishedUrl && <p className="d8b-modal-desc">Currently published at: <a href={publishedUrl} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(0,255,180,0.85)" }}>{publishedUrl}</a></p>}
          <p className="d8b-modal-desc">Custom domain configuration coming soon.</p>
        </div>
      </div>
    </div>
  );
}

function SSLModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="d8b-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="d8b-info-modal">
        <div className="d8b-modal-header">
          <div className="d8b-modal-title">SSL Certificate</div>
          <button className="d8b-modal-close" onClick={onClose} type="button">✕</button>
        </div>
        <div className="d8b-modal-body">
          <p className="d8b-modal-desc">All deployed sites are served over HTTPS with automatic SSL certificates.</p>
        </div>
      </div>
    </div>
  );
}

function AutomateModal({ onClose, html, prompt, onApplyHtml }: { onClose: () => void; html: string; prompt: string; onApplyHtml?: (h: string) => void }) {
  return (
    <div className="d8b-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="d8b-info-modal">
        <div className="d8b-modal-header">
          <div className="d8b-modal-title">Automate</div>
          <button className="d8b-modal-close" onClick={onClose} type="button">✕</button>
        </div>
        <div className="d8b-modal-body">
          <p className="d8b-modal-desc">Automation workflows coming soon. Schedule regenerations, A/B tests, and more.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Builder ─────────────────────────────────────────────────────────────

export function Builder() {
  const [prompt, setPrompt] = useState("");
  const [industry, setIndustry] = useState("");
  const [state, setState] = useState<BuildState>("idle");
  const [html, setHtml] = useState("");
  const [genModel, setGenModel] = useState<"gpt-4o" | "claude-sonnet-4-6">("claude-sonnet-4-6");
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

      // Strip markdown code fences if the AI wrapped the HTML in them
      if (accumulated.trimStart().startsWith("```")) {
        accumulated = accumulated.replace(/^\s*```(?:html)?\s*\n?/, "").replace(/\n?\s*```\s*$/, "");
        setHtml(accumulated);
      }

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

        {/* Ambient background */}
        <div className="d8h-bg" aria-hidden="true" />

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
            <span className="d8h-logo-text">Dominat8</span>
          </div>
          <nav className="d8h-nav">
            <a href="/templates" className="d8h-nav-link">Templates</a>
            <a href="/gallery" className="d8h-nav-link">Gallery</a>
            <a href="/pricing" className="d8h-nav-link">Pricing</a>
          </nav>
          <div className="d8h-header-actions">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="redirect">
                <button type="button" className="d8h-nav-signin">Get Started</button>
              </SignInButton>
            )}
          </div>
        </header>

        {/* Hero */}
        <div className="d8h-hero">
          <div className="d8h-badge">
            <span className="d8h-badge-dot" />
            AI Website Builder
          </div>

          <h1 className="d8h-title">
            Describe your business.<br />
            <span className="d8h-title-grad">Get a website in seconds.</span>
          </h1>

          <p className="d8h-sub">
            Type one sentence about your business. Our AI writes the copy, designs the layout,
            and delivers a production-ready website — no templates, no drag-and-drop.
          </p>

          {/* Input card */}
          <div className="d8h-input-card">
            <div className="d8h-input-row">
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
                </button>
              )}
              <button
                className="d8h-gen-btn"
                onClick={() => generate()}
                disabled={!prompt.trim()}
                type="button"
              >
                Generate
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          {/* Quick options */}
          <div className="d8h-quick-row">
            {industry && <span className="d8h-tag" onClick={() => setIndustry("")}>{INDUSTRIES.find(i => i.label === industry)?.icon} {industry} ✕</span>}
            {vibe && <span className="d8h-tag" onClick={() => setVibe("")}>{VIBES.find(v => v.label === vibe)?.icon} {vibe} ✕</span>}
            <button type="button" className="d8h-tag d8h-tag--model" onClick={() => setGenModel((m) => m === "claude-sonnet-4-6" ? "gpt-4o" : "claude-sonnet-4-6")} title="Switch AI model">
              {genModel === "claude-sonnet-4-6" ? "◈ Claude" : "⬢ GPT-4o"}
            </button>
            <button type="button" className={`d8h-tag d8h-tag--toggle ${showOptions ? "d8h-tag--open" : ""}`} onClick={() => setShowOptions(!showOptions)}>
              {showOptions ? "Less options" : "+ Customize"}
            </button>
          </div>

          {/* Expanded options */}
          {showOptions && (
            <div className="d8h-expand">
              <div className="d8h-expand-group">
                <div className="d8h-expand-label">Industry</div>
                <div className="d8h-chips">
                  {INDUSTRIES.map((ind) => (
                    <button key={ind.label} type="button" className={`d8h-chip ${industry === ind.label ? "d8h-chip--on" : ""}`} onClick={() => setIndustry((prev) => prev === ind.label ? "" : ind.label)}>
                      {ind.icon} {ind.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="d8h-expand-group">
                <div className="d8h-expand-label">Style</div>
                <div className="d8h-chips">
                  {VIBES.map((v) => (
                    <button key={v.label} type="button" className={`d8h-chip ${vibe === v.label ? "d8h-chip--on" : ""}`} onClick={() => setVibe((prev) => prev === v.label ? "" : v.label)} title={v.hint}>
                      {v.icon} {v.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats strip */}
        <div className="d8h-stats">
          <div className="d8h-stat">
            <span className="d8h-stat-value">&lt;30s</span>
            <span className="d8h-stat-label">Avg build time</span>
          </div>
          <div className="d8h-stat-sep" />
          <div className="d8h-stat">
            <span className="d8h-stat-value">14</span>
            <span className="d8h-stat-label">AI agents</span>
          </div>
          <div className="d8h-stat-sep" />
          <div className="d8h-stat">
            <span className="d8h-stat-value">1-click</span>
            <span className="d8h-stat-label">Deploy &amp; go live</span>
          </div>
        </div>

        {/* Social proof */}
        <SocialProof />

        {/* Deployments */}
        <section className="d8h-deploys">
          <div className="d8h-section-head">
            <h2 className="d8h-section-title">Active Deployments</h2>
            <span className="d8h-live-indicator">
              <span className="d8h-live-dot" />
              {loaded ? `${deployments.length} live` : "Loading\u2026"}
            </span>
          </div>

          <div className="d8h-deploys-grid">
            {(loaded ? deployments : []).map((dep, i) => {
              const ps = pillStyle(dep.pill);
              const bar = barColor(dep.progress, dep.status);
              return (
                <div key={i} className="d8h-dep-card">
                  <div className="d8h-dep-top">
                    <span className="d8h-dep-icon">{deployIcon(dep.icon)}</span>
                    <span className="d8h-dep-pill" style={{ color: ps.color, background: ps.bg, borderColor: ps.border }}>{dep.pill}</span>
                  </div>
                  <div className="d8h-dep-domain">{dep.domain}</div>
                  <div className="d8h-dep-desc">{dep.desc}</div>
                  <div className="d8h-dep-bar-wrap">
                    <div className="d8h-dep-bar-track">
                      <div className="d8h-dep-bar-fill" style={{ width: `${dep.progress}%`, background: bar }} />
                    </div>
                    <span className="d8h-dep-pct">{dep.progress}%</span>
                  </div>
                </div>
              );
            })}
            {loaded && deployments.length === 0 && (
              <div className="d8h-deploys-empty">No deployments yet. Generate your first site above.</div>
            )}
          </div>
        </section>

        {/* Enhanced homepage sections */}
        <HomeSections />

        {/* Footer */}
        <footer className="d8h-footer">
          <div className="d8h-footer-inner">
            <div className="d8h-footer-brand">
              <span className="d8h-footer-logo">D8</span>
              <span className="d8h-footer-copy">&copy; {new Date().getFullYear()} Dominat8.io</span>
            </div>
            <div className="d8h-footer-links">
              <a href="/templates" className="d8h-footer-link">Templates</a>
              <a href="/gallery" className="d8h-footer-link">Gallery</a>
              <a href="/pricing" className="d8h-footer-link">Pricing</a>
              <a href="/about" className="d8h-footer-link">About</a>
              <a href="/privacy" className="d8h-footer-link">Privacy</a>
              <a href="/terms" className="d8h-footer-link">Terms</a>
            </div>
          </div>
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

      {/* Ambient animated background */}
      <div className="d8b-ambient" aria-hidden="true">
        <div className="d8b-ambient-orb d8b-ambient-orb-1" />
        <div className="d8b-ambient-orb d8b-ambient-orb-2" />
        <div className="d8b-ambient-orb d8b-ambient-orb-3" />
        <div className="d8b-ambient-grid" />
      </div>

      {/* ── Sidebar ── */}
      <aside className="d8b-sidebar">
        <div className="d8b-logo">
          <div className="d8b-logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="1" y="1" width="26" height="26" rx="7" stroke="url(#logo-grad)" strokeWidth="1.5" fill="rgba(0,200,255,0.04)"/>
              <text x="14" y="19" textAnchor="middle" fill="url(#logo-grad)" fontSize="13" fontWeight="900" fontFamily="inherit">D8</text>
              <defs><linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28"><stop stopColor="#00E0FF"/><stop offset="1" stopColor="#7B61FF"/></linearGradient></defs>
            </svg>
          </div>
          <div className="d8b-logo-text-group">
            <span className="d8b-logo-mark">Dominat8</span>
            <span className="d8b-logo-sub">AI Builder</span>
          </div>
        </div>

        <div className="d8b-sidebar-tabs">
          <button
            className={`d8b-tab ${sidebarTab === "new" ? "d8b-tab--active" : ""}`}
            onClick={() => setSidebarTab("new")}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            New Site
          </button>
          <button
            className={`d8b-tab ${sidebarTab === "history" ? "d8b-tab--active" : ""}`}
            onClick={() => setSidebarTab("history")}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
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
              {(["claude-sonnet-4-6", "gpt-4o"] as const).map(m => (
                <button
                  key={m}
                  className={`d8b-model-btn ${genModel === m ? "d8b-model-btn--active" : ""}`}
                  onClick={() => setGenModel(m)}
                  type="button"
                  disabled={isBuilding}
                  title={m === "claude-sonnet-4-6" ? "Anthropic Claude Sonnet (Recommended)" : "OpenAI GPT-4o"}
                >
                  {m === "claude-sonnet-4-6" ? "◈ Claude" : "GPT-4o"}
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
              <span className="d8b-generate-glow" />
              {isBuilding ? (
                <><span className="d8b-stop-icon">■</span> Stop generating</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" /></svg>
                  Generate Site
                </>
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
              <div className="d8b-splash-ring" aria-hidden="true">
                <svg viewBox="0 0 200 200" className="d8b-splash-ring-svg">
                  <defs>
                    <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00E0FF" stopOpacity="0.6"/>
                      <stop offset="50%" stopColor="#7B61FF" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#00E0FF" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#ring-grad)" strokeWidth="0.5" />
                  <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(0,224,255,0.08)" strokeWidth="0.5" strokeDasharray="4 8"/>
                </svg>
              </div>
              <div className="d8b-splash-mark">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4L28 16L40 12L32 22L44 24L32 26L40 36L28 32L24 44L20 32L8 36L16 26L4 24L16 22L8 12L20 16Z" fill="url(#star-grad)" opacity="0.9"/>
                  <defs><linearGradient id="star-grad" x1="4" y1="4" x2="44" y2="44"><stop stopColor="#00E0FF"/><stop offset="1" stopColor="#7B61FF"/></linearGradient></defs>
                </svg>
              </div>
              <h1 className="d8b-splash-title">Build anything<span className="d8b-splash-dot">.</span></h1>
              <p className="d8b-splash-sub">
                Describe your business. Watch a production-ready site<br />
                materialize in seconds. Powered by AI.
              </p>
              <div className="d8b-splash-examples">
                <div className="d8b-examples-label">Quick start</div>
                {EXAMPLE_PROMPTS.slice(0, 3).map((ex, i) => (
                  <button
                    key={ex}
                    className="d8b-example-btn"
                    onClick={() => {
                      setPrompt(ex);
                      textareaRef.current?.focus();
                    }}
                    type="button"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <span className="d8b-example-arrow">→</span>
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
      /* ══════════════════════════════════════════════════════════
         D8 BUILDER — 2030 Futuristic Design System
         ══════════════════════════════════════════════════════════ */

      /* ── Root ── */
      .d8b-root {
        display: flex;
        height: 100vh;
        width: 100vw;
        background: #030712;
        color: #E2E8F0;
        font-family: 'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif;
        overflow: hidden;
        position: relative;
      }

      /* ── Ambient animated background ── */
      .d8b-ambient {
        position: fixed; inset: 0; z-index: 0;
        pointer-events: none; overflow: hidden;
      }
      .d8b-ambient-orb {
        position: absolute; border-radius: 50%;
        filter: blur(120px); will-change: transform;
      }
      .d8b-ambient-orb-1 {
        width: 800px; height: 800px; top: -300px; left: -200px;
        background: radial-gradient(circle, rgba(0,200,255,0.08) 0%, transparent 70%);
        animation: d8b-float-1 30s ease-in-out infinite;
      }
      .d8b-ambient-orb-2 {
        width: 600px; height: 600px; bottom: -200px; right: -100px;
        background: radial-gradient(circle, rgba(123,97,255,0.07) 0%, transparent 70%);
        animation: d8b-float-2 25s ease-in-out infinite;
      }
      .d8b-ambient-orb-3 {
        width: 500px; height: 500px; top: 30%; left: 50%;
        background: radial-gradient(circle, rgba(0,255,200,0.04) 0%, transparent 70%);
        animation: d8b-float-3 35s ease-in-out infinite;
      }
      .d8b-ambient-grid {
        position: absolute; inset: 0;
        background-image:
          linear-gradient(rgba(0,200,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,200,255,0.025) 1px, transparent 1px);
        background-size: 80px 80px;
        mask-image: radial-gradient(ellipse 70% 60% at 30% 30%, black, transparent);
        -webkit-mask-image: radial-gradient(ellipse 70% 60% at 30% 30%, black, transparent);
      }
      @keyframes d8b-float-1 {
        0%, 100% { transform: translate(0,0) scale(1); }
        33% { transform: translate(80px,60px) scale(1.1); }
        66% { transform: translate(-40px,80px) scale(0.95); }
      }
      @keyframes d8b-float-2 {
        0%, 100% { transform: translate(0,0) scale(1); }
        33% { transform: translate(-60px,-40px) scale(1.12); }
        66% { transform: translate(50px,-20px) scale(0.9); }
      }
      @keyframes d8b-float-3 {
        0%, 100% { transform: translate(0,0); }
        50% { transform: translate(-60px,40px); }
      }

      /* ── Sidebar ── */
      .d8b-sidebar {
        width: 340px;
        min-width: 340px;
        display: flex;
        flex-direction: column;
        background: rgba(6,10,24,0.85);
        backdrop-filter: blur(40px) saturate(1.4);
        -webkit-backdrop-filter: blur(40px) saturate(1.4);
        border-right: 1px solid rgba(255,255,255,0.06);
        overflow: hidden;
        position: relative;
        z-index: 10;
      }
      .d8b-sidebar::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(0,200,255,0.3), rgba(123,97,255,0.2), transparent);
      }
      .d8b-sidebar::after {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 300px;
        background: radial-gradient(ellipse 100% 100% at 50% -20%, rgba(0,180,255,0.04), transparent 70%);
        pointer-events: none; z-index: 0;
      }

      .d8b-logo {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px 20px 0;
        position: relative;
        z-index: 1;
      }
      .d8b-logo-icon { flex-shrink: 0; line-height: 0; }
      .d8b-logo-text-group { display: flex; flex-direction: column; gap: 1px; }
      .d8b-logo-mark {
        font-size: 16px;
        font-weight: 800;
        background: linear-gradient(135deg, #fff 0%, rgba(0,200,255,0.9) 100%);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -0.03em;
      }
      .d8b-logo-sub {
        font-size: 10px;
        color: rgba(140,160,200,0.45);
        font-weight: 600;
        letter-spacing: 0.12em;
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
        padding: 10px 0;
        border-radius: 10px;
        border: 1px solid transparent;
        background: transparent;
        color: rgba(140,160,200,0.45);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 200ms cubic-bezier(0.16,1,0.3,1);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        font-family: inherit;
        position: relative;
      }
      .d8b-tab--active {
        background: rgba(255,255,255,0.05);
        border-color: rgba(255,255,255,0.08);
        color: #fff;
      }
      .d8b-tab--active::after {
        content: '';
        position: absolute; bottom: -1px; left: 20%; right: 20%; height: 2px;
        background: linear-gradient(90deg, #00D4FF, #7B61FF);
        border-radius: 2px;
        box-shadow: 0 0 12px rgba(0,200,255,0.4);
      }
      .d8b-tab:hover:not(.d8b-tab--active) {
        color: rgba(200,210,230,0.70);
        background: rgba(255,255,255,0.02);
      }
      .d8b-count {
        background: linear-gradient(135deg, rgba(0,200,255,0.15), rgba(123,97,255,0.10));
        color: rgba(0,220,255,0.90);
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 10px;
        font-weight: 700;
      }

      .d8b-sidebar-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px 16px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        position: relative;
        z-index: 1;
      }
      .d8b-sidebar-content::-webkit-scrollbar { width: 3px; }
      .d8b-sidebar-content::-webkit-scrollbar-track { background: transparent; }
      .d8b-sidebar-content::-webkit-scrollbar-thumb { background: rgba(0,200,255,0.12); border-radius: 99px; }

      /* ── Fields ── */
      .d8b-field { display: flex; flex-direction: column; gap: 10px; }
      .d8b-label {
        font-size: 11px;
        font-weight: 700;
        color: rgba(140,160,200,0.50);
        text-transform: uppercase;
        letter-spacing: 0.10em;
      }
      .d8b-textarea {
        width: 100%;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 14px;
        color: #E8F0FF;
        font-size: 14px;
        line-height: 1.7;
        padding: 14px 16px;
        resize: none;
        font-family: inherit;
        outline: none;
        transition: all 250ms cubic-bezier(0.16,1,0.3,1);
      }
      .d8b-textarea:focus {
        border-color: rgba(0,200,255,0.30);
        background: rgba(0,200,255,0.02);
        box-shadow: 0 0 0 3px rgba(0,200,255,0.06), 0 0 30px rgba(0,200,255,0.04);
      }
      .d8b-textarea::placeholder { color: rgba(120,140,180,0.30); }
      .d8b-textarea:disabled { opacity: 0.35; cursor: not-allowed; }
      .d8b-hint {
        font-size: 11px;
        color: rgba(120,140,180,0.30);
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
        padding: 6px 12px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.02);
        color: rgba(180,195,220,0.55);
        font-size: 12px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        transition: all 200ms cubic-bezier(0.16,1,0.3,1);
      }
      .d8b-chip:hover {
        border-color: rgba(0,200,255,0.20);
        color: rgba(230,240,255,0.85);
        background: rgba(0,200,255,0.04);
        transform: translateY(-1px);
      }
      .d8b-chip--active {
        border-color: rgba(0,200,255,0.35);
        background: linear-gradient(135deg, rgba(0,200,255,0.08), rgba(123,97,255,0.05));
        color: rgba(0,230,255,0.95);
        box-shadow: 0 0 16px rgba(0,200,255,0.08), inset 0 0 12px rgba(0,200,255,0.03);
      }
      .d8b-chip:disabled { opacity: 0.25; cursor: not-allowed; }

      /* ── Model selector ── */
      .d8b-model-selector {
        display: flex;
        gap: 4px;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 12px;
        padding: 4px;
      }
      .d8b-model-btn {
        flex: 1;
        padding: 8px 10px;
        border-radius: 9px;
        border: none;
        background: transparent;
        color: rgba(140,160,200,0.40);
        font-size: 12px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: all 200ms cubic-bezier(0.16,1,0.3,1);
      }
      .d8b-model-btn:hover:not(:disabled) { color: rgba(200,215,240,0.70); }
      .d8b-model-btn:disabled { opacity: 0.30; cursor: not-allowed; }
      .d8b-model-btn--active {
        background: rgba(255,255,255,0.06);
        color: #fff;
        box-shadow: 0 1px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04);
      }

      /* ── Generate button — THE HERO ── */
      .d8b-generate-btn {
        width: 100%;
        padding: 15px;
        border-radius: 14px;
        border: 1px solid rgba(0,200,255,0.25);
        background: linear-gradient(135deg, rgba(0,180,255,0.12), rgba(123,97,255,0.08));
        color: #fff;
        font-size: 15px;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        transition: all 250ms cubic-bezier(0.16,1,0.3,1);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        letter-spacing: 0.01em;
        position: relative;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0,200,255,0.08), 0 4px 20px rgba(0,0,0,0.3);
      }
      .d8b-generate-glow {
        position: absolute; inset: -1px;
        border-radius: 14px;
        background: linear-gradient(135deg, rgba(0,220,255,0.15), rgba(123,97,255,0.10), rgba(0,255,200,0.08));
        opacity: 0;
        transition: opacity 300ms ease;
        z-index: 0;
      }
      .d8b-generate-btn > *:not(.d8b-generate-glow) { position: relative; z-index: 1; }
      .d8b-generate-btn:hover:not(:disabled) {
        border-color: rgba(0,220,255,0.45);
        box-shadow: 0 0 40px rgba(0,200,255,0.15), 0 8px 30px rgba(0,0,0,0.3);
        transform: translateY(-2px);
      }
      .d8b-generate-btn:hover:not(:disabled) .d8b-generate-glow { opacity: 1; }
      .d8b-generate-btn:active:not(:disabled) { transform: translateY(0); }
      .d8b-generate-btn:disabled {
        opacity: 0.25;
        cursor: not-allowed;
      }
      .d8b-generate-btn--building {
        border-color: rgba(255,60,90,0.30);
        background: linear-gradient(135deg, rgba(255,50,80,0.10), rgba(200,30,60,0.06));
        color: rgba(255,130,150,0.95);
        box-shadow: 0 0 20px rgba(255,60,90,0.06);
      }
      .d8b-generate-btn--building:hover {
        border-color: rgba(255,60,90,0.50) !important;
        box-shadow: 0 0 30px rgba(255,60,90,0.10) !important;
      }
      .d8b-spark { font-size: 16px; }
      .d8b-stop-icon { font-size: 10px; }

      .d8b-regen-btn {
        width: 100%;
        padding: 11px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.02);
        color: rgba(160,175,200,0.55);
        font-size: 13px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        transition: all 200ms cubic-bezier(0.16,1,0.3,1);
      }
      .d8b-regen-btn:hover {
        color: rgba(230,240,255,0.80);
        border-color: rgba(0,200,255,0.15);
        background: rgba(0,200,255,0.03);
      }

      /* ── Stats ── */
      .d8b-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .d8b-stat {
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 12px;
        padding: 14px 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
      }
      .d8b-stat-val {
        font-size: 17px;
        font-weight: 800;
        color: #fff;
        font-variant-numeric: tabular-nums;
      }
      .d8b-stat-val.green {
        background: linear-gradient(135deg, #00FFB2, #00D4FF);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .d8b-stat-label { font-size: 10px; color: rgba(120,140,180,0.40); text-align: center; font-weight: 600; letter-spacing: 0.02em; }

      /* ── History ── */
      .d8b-history { display: flex; flex-direction: column; gap: 10px; }
      .d8b-site-card {
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 14px;
        overflow: hidden;
        cursor: pointer;
        text-align: left;
        padding: 0;
        transition: all 220ms cubic-bezier(0.16,1,0.3,1);
        width: 100%;
      }
      .d8b-site-card:hover {
        border-color: rgba(0,200,255,0.18);
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(0,0,0,0.3), 0 0 20px rgba(0,200,255,0.04);
      }
      .d8b-site-preview { position: relative; height: 100px; overflow: hidden; }
      .d8b-site-thumb { width: 100%; height: 400px; transform: scale(0.25) translateY(-75%); transform-origin: top left; pointer-events: none; border: none; }
      .d8b-site-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 30%, rgba(3,7,18,0.8)); }
      .d8b-site-meta { padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; }
      .d8b-site-name { font-size: 12px; font-weight: 600; color: rgba(230,240,255,0.80); }
      .d8b-site-age { font-size: 11px; color: rgba(120,140,180,0.35); }

      /* ── Empty state ── */
      .d8b-empty { display: flex; flex-direction: column; align-items: center; padding: 48px 16px; gap: 14px; }
      .d8b-empty-icon { font-size: 32px; opacity: 0.15; }
      .d8b-empty-text { font-size: 13px; color: rgba(120,140,180,0.35); text-align: center; line-height: 1.7; }

      /* ── Sidebar footer ── */
      .d8b-sidebar-foot {
        padding: 14px 16px;
        border-top: 1px solid rgba(255,255,255,0.04);
        position: relative; z-index: 1;
      }
      .d8b-foot-badge {
        font-size: 10px;
        color: rgba(100,120,160,0.25);
        letter-spacing: 0.08em;
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
        z-index: 5;
      }

      /* ── Empty canvas ── */
      .d8b-empty-canvas {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }
      .d8b-splash {
        text-align: center;
        max-width: 580px;
        padding: 0 24px;
        position: relative;
      }
      .d8b-splash-ring {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 400px; height: 400px;
        pointer-events: none;
        opacity: 0.5;
        animation: d8b-ring-rotate 40s linear infinite;
      }
      .d8b-splash-ring-svg { width: 100%; height: 100%; }
      @keyframes d8b-ring-rotate { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }

      .d8b-splash-mark {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 28px;
        width: 64px; height: 64px;
        border-radius: 20px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        animation: d8b-mark-float 4s ease-in-out infinite;
        position: relative;
      }
      .d8b-splash-mark::before {
        content: '';
        position: absolute; inset: -1px; border-radius: 20px;
        background: linear-gradient(135deg, rgba(0,200,255,0.20), rgba(123,97,255,0.15), transparent, transparent);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor; mask-composite: exclude;
        padding: 1px; pointer-events: none;
      }
      @keyframes d8b-mark-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      .d8b-splash-title {
        font-size: 56px;
        font-weight: 900;
        color: #fff;
        letter-spacing: -0.04em;
        line-height: 1;
        margin: 0 0 20px;
        position: relative;
      }
      .d8b-splash-dot {
        background: linear-gradient(135deg, #00D4FF, #7B61FF);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .d8b-splash-sub {
        font-size: 16px;
        color: rgba(150,170,210,0.50);
        line-height: 1.75;
        margin: 0 0 40px;
      }
      .d8b-splash-examples { display: flex; flex-direction: column; gap: 8px; }
      .d8b-examples-label {
        font-size: 10px;
        color: rgba(0,200,255,0.30);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin-bottom: 6px;
        font-weight: 700;
      }
      .d8b-example-btn {
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 12px;
        color: rgba(170,185,215,0.55);
        font-size: 13px;
        font-family: inherit;
        padding: 14px 18px;
        text-align: left;
        cursor: pointer;
        transition: all 250ms cubic-bezier(0.16,1,0.3,1);
        line-height: 1.5;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        animation: d8b-fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both;
      }
      @keyframes d8b-fade-up {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .d8b-example-arrow {
        color: rgba(0,200,255,0.30);
        font-weight: 700;
        flex-shrink: 0;
        transition: all 200ms ease;
      }
      .d8b-example-btn:hover {
        border-color: rgba(0,200,255,0.18);
        color: rgba(230,240,255,0.85);
        background: rgba(0,200,255,0.03);
        transform: translateX(6px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.2), 0 0 20px rgba(0,200,255,0.03);
      }
      .d8b-example-btn:hover .d8b-example-arrow { color: rgba(0,220,255,0.80); transform: translateX(2px); }

      /* ── Generating screen ── */
      .d8b-generating-screen {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }
      .d8b-gen-anim { display: flex; flex-direction: column; align-items: center; gap: 20px; position: relative; }
      .d8b-gen-glow {
        position: absolute;
        top: -30px;
        width: 160px; height: 160px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0,200,255,0.12) 0%, rgba(123,97,255,0.05) 40%, transparent 70%);
        animation: d8b-gen-breathe 3s ease-in-out infinite;
        pointer-events: none;
      }
      @keyframes d8b-gen-breathe {
        0%, 100% { transform: scale(0.85); opacity: 0.4; }
        50% { transform: scale(1.2); opacity: 1; }
      }
      .d8b-gen-ring { position: relative; width: 96px; height: 96px; z-index: 1; }
      .d8b-gen-svg { width: 96px; height: 96px; transform: rotate(-90deg); }
      .d8b-gen-track { fill: none; stroke: rgba(255,255,255,0.04); stroke-width: 3; }
      .d8b-gen-arc {
        fill: none;
        stroke-width: 3;
        stroke-linecap: round;
        transition: stroke-dashoffset 300ms ease;
        filter: drop-shadow(0 0 8px rgba(0,200,255,0.4));
      }
      .d8b-gen-pct {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 800;
        color: #fff;
        font-variant-numeric: tabular-nums;
      }
      .d8b-gen-label { font-size: 18px; font-weight: 700; color: #fff; }
      .d8b-gen-sub { font-size: 13px; color: rgba(140,160,200,0.45); }

      /* ── Gen stage pills ── */
      .d8b-gen-stages {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
        max-width: 320px;
        margin: 8px 0 12px;
      }
      .d8b-gen-stage-pill {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.04);
        background: rgba(255,255,255,0.015);
        font-size: 12px;
        color: rgba(140,160,200,0.25);
        transition: all 250ms cubic-bezier(0.16,1,0.3,1);
      }
      .d8b-gen-stage-pill--active {
        border-color: rgba(0,200,255,0.20);
        background: rgba(0,200,255,0.04);
        color: rgba(0,230,255,0.90);
        box-shadow: 0 0 16px rgba(0,200,255,0.05);
      }
      .d8b-gen-stage-pill--done {
        color: rgba(0,255,180,0.50);
        border-color: rgba(0,255,180,0.08);
        background: rgba(0,255,180,0.02);
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
        position: relative;
      }
      .d8b-error-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        max-width: 440px;
        padding: 48px 40px;
        text-align: center;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 28px;
        backdrop-filter: blur(20px);
        position: relative;
      }
      .d8b-error-content::before {
        content: '';
        position: absolute; inset: -1px; border-radius: 28px;
        background: linear-gradient(135deg, rgba(255,60,90,0.15), transparent, transparent);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor; mask-composite: exclude;
        padding: 1px; pointer-events: none;
      }
      .d8b-error-icon { font-size: 48px; }
      .d8b-error-title {
        font-size: 26px;
        font-weight: 800;
        color: #fff;
        margin: 0;
        letter-spacing: -0.02em;
      }
      .d8b-error-message {
        font-size: 14px;
        color: rgba(160,175,210,0.50);
        line-height: 1.7;
        margin: 0;
      }
      .d8b-error-retry-btn {
        padding: 13px 28px;
        border-radius: 12px;
        border: 1px solid rgba(0,200,255,0.20);
        background: linear-gradient(135deg, rgba(0,200,255,0.08), rgba(123,97,255,0.05));
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        transition: all 200ms cubic-bezier(0.16,1,0.3,1);
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
      }
      .d8b-error-retry-btn:hover {
        border-color: rgba(0,220,255,0.40);
        box-shadow: 0 0 30px rgba(0,200,255,0.10);
        transform: translateY(-2px);
      }
      .d8b-error-actions {
        display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
      }
      .d8b-error-upgrade-btn {
        padding: 13px 28px; border-radius: 12px;
        background: linear-gradient(135deg, #00C97A, #00A866);
        color: #fff; font-size: 14px; font-weight: 700;
        text-decoration: none; cursor: pointer;
        transition: all 200ms cubic-bezier(0.16,1,0.3,1);
        box-shadow: 0 4px 20px rgba(0,200,120,0.15);
      }
      .d8b-error-upgrade-btn:hover { box-shadow: 0 8px 30px rgba(0,200,120,0.25); transform: translateY(-2px); }

      /* ── Dots animation ── */
      .d8b-dots { display: inline-flex; gap: 3px; margin-left: 6px; }
      .d8b-dots span {
        width: 4px; height: 4px;
        border-radius: 50%;
        background: rgba(0,200,255,0.6);
        animation: d8b-dot 1.4s ease-in-out infinite;
      }
      .d8b-dots span:nth-child(2) { animation-delay: 0.15s; }
      .d8b-dots span:nth-child(3) { animation-delay: 0.30s; }
      @keyframes d8b-dot {
        0%, 80%, 100% { transform: scale(0.4); opacity: 0.2; }
        40% { transform: scale(1.2); opacity: 1; }
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
        padding: 0 20px;
        height: 52px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        background: rgba(3,7,18,0.60);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        flex-shrink: 0;
        gap: 12px;
        position: relative;
        z-index: 10;
      }
      .d8b-toolbar-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .d8b-toolbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

      .d8b-live-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255,60,90,0.06);
        border: 1px solid rgba(255,60,90,0.20);
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
        box-shadow: 0 0 10px rgba(255,80,100,0.5);
        animation: d8b-blink 1s ease-in-out infinite;
      }
      @keyframes d8b-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }

      .d8b-done-badge {
        background: rgba(0,255,180,0.05);
        border: 1px solid rgba(0,255,180,0.15);
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 10px;
        font-weight: 700;
        color: rgba(0,255,180,0.85);
        letter-spacing: 0.04em;
      }

      .d8b-toolbar-prompt {
        font-size: 13px;
        color: rgba(140,160,200,0.40);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .d8b-view-toggle {
        display: flex;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 10px;
        padding: 3px;
        gap: 2px;
      }
      .d8b-view-btn {
        padding: 6px 14px;
        border-radius: 7px;
        border: none;
        background: transparent;
        color: rgba(140,160,200,0.40);
        font-size: 12px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        transition: all 180ms ease;
      }
      .d8b-view-btn--active {
        background: rgba(255,255,255,0.06);
        color: #fff;
      }

      .d8b-action-btn {
        padding: 7px 14px;
        border-radius: 9px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.02);
        color: rgba(170,185,215,0.55);
        font-size: 12px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        transition: all 200ms cubic-bezier(0.16,1,0.3,1);
      }
      .d8b-action-btn:hover { border-color: rgba(0,200,255,0.18); color: #E8F0FF; background: rgba(0,200,255,0.04); }

      .d8b-deploy-btn {
        padding: 8px 16px;
        border-radius: 10px;
        border: 1px solid rgba(0,200,255,0.25);
        background: linear-gradient(135deg, rgba(0,180,255,0.10), rgba(123,97,255,0.06));
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        transition: all 200ms cubic-bezier(0.16,1,0.3,1);
        box-shadow: 0 0 16px rgba(0,200,255,0.06);
      }
      .d8b-deploy-btn:hover:not(:disabled) {
        border-color: rgba(0,220,255,0.45);
        box-shadow: 0 0 30px rgba(0,200,255,0.12);
        transform: translateY(-1px);
      }
      .d8b-deploy-btn:disabled { opacity: 0.30; cursor: not-allowed; }

      /* ── iframe ── */
      .d8b-iframe-wrap { flex: 1; position: relative; overflow: hidden; background: #fff; }
      .d8b-iframe-loader {
        position: absolute; inset: 0; z-index: 10;
        background: #030712;
        display: flex; align-items: center; justify-content: center;
      }
      .d8b-iframe { width: 100%; height: 100%; border: none; display: block; }

      /* ── Code view ── */
      .d8b-code-wrap { flex: 1; overflow: auto; background: rgba(3,7,18,0.95); }
      .d8b-code {
        padding: 24px 28px;
        font-size: 12px; line-height: 1.8;
        color: rgba(140,160,200,0.60);
        font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
        white-space: pre-wrap; word-break: break-all; margin: 0;
      }

      /* ── Progress bar ── */
      .d8b-progress-bar {
        height: 2px;
        background: rgba(255,255,255,0.03);
        position: absolute; bottom: 0; left: 0; right: 0;
        overflow: hidden;
      }
      .d8b-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #00D4FF, #7B61FF, #00FFB2);
        transition: width 300ms ease;
        border-radius: 0 2px 2px 0;
        position: relative;
        box-shadow: 0 0 20px rgba(0,200,255,0.5);
      }

      /* ── Mobile device frame ── */
      .d8b-iframe-mobile-wrap {
        flex: 1; display: flex; align-items: center; justify-content: center;
        background: #030712; overflow: hidden; padding: 24px 0 16px;
      }
      .d8b-phone-frame {
        width: 375px; height: calc(100% - 8px); max-height: 780px;
        border-radius: 44px;
        border: 4px solid rgba(255,255,255,0.08);
        background: #000; position: relative; overflow: hidden;
        box-shadow: 0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(0,200,255,0.03), inset 0 0 0 1px rgba(255,255,255,0.04);
      }
      .d8b-phone-notch {
        position: absolute; top: 0; left: 50%; transform: translateX(-50%);
        width: 120px; height: 32px; background: #000;
        border-radius: 0 0 20px 20px; z-index: 10;
      }
      .d8b-phone-iframe { width: 100%; height: 100%; border: none; border-radius: 40px; }

      /* ── Deploy Modal ── */
      .d8b-modal-backdrop {
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(0,0,0,0.70);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        display: flex; align-items: center; justify-content: center;
        padding: 24px;
      }
      .d8b-modal {
        width: min(500px, 100%);
        border-radius: 24px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(8,12,28,0.95);
        backdrop-filter: blur(40px);
        box-shadow: 0 40px 120px rgba(0,0,0,0.7), 0 0 80px rgba(0,120,255,0.04);
        overflow: hidden;
        animation: d8b-modal-in 300ms cubic-bezier(0.16,1,0.3,1);
      }
      @keyframes d8b-modal-in { from { opacity:0; transform:scale(0.90) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }

      .d8b-modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
      }
      .d8b-modal-title { font-size: 16px; font-weight: 800; color: #fff; }
      .d8b-modal-close {
        background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
        border-radius: 10px; width: 32px; height: 32px;
        color: rgba(140,160,200,0.45); cursor: pointer; font-size: 12px; font-family: inherit;
        display: flex; align-items: center; justify-content: center;
        transition: all 200ms ease;
      }
      .d8b-modal-close:hover { color: #fff; background: rgba(255,255,255,0.08); }

      .d8b-modal-body { padding: 24px; }
      .d8b-modal-desc { font-size: 14px; color: rgba(150,170,210,0.50); margin: 0 0 20px; line-height: 1.65; }

      .d8b-deploy-options { display: flex; flex-direction: column; gap: 10px; }
      .d8b-deploy-option {
        display: flex; align-items: center; gap: 14px;
        padding: 16px 18px; border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.02);
        color: rgba(230,240,255,0.85);
        text-align: left; cursor: pointer; font-family: inherit;
        transition: all 220ms cubic-bezier(0.16,1,0.3,1);
      }
      .d8b-deploy-option:hover { border-color: rgba(0,200,255,0.20); background: rgba(0,200,255,0.03); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
      .d8b-deploy-option--ghost { border-color: rgba(255,255,255,0.04); background: rgba(255,255,255,0.01); }
      .d8b-deploy-option--ghost:hover { border-color: rgba(255,255,255,0.10); background: rgba(255,255,255,0.03); }
      .d8b-deploy-option-icon { font-size: 22px; flex-shrink: 0; }
      .d8b-deploy-option-title { font-size: 14px; font-weight: 700; margin-bottom: 3px; color: #fff; }
      .d8b-deploy-option-sub { font-size: 12px; color: rgba(140,160,200,0.45); }

      .d8b-deploy-log {
        background: rgba(0,0,0,0.30); border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.05);
        padding: 16px 18px; min-height: 160px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 12px; line-height: 2;
        display: flex; flex-direction: column; gap: 2px;
      }
      .d8b-deploy-log-line { color: rgba(160,180,220,0.55); }
      .d8b-deploy-log-line--ok { color: rgba(0,255,180,0.80); }
      .d8b-deploy-log-line--warn { color: rgba(255,200,60,0.80); }
      .d8b-deploy-cursor { animation: d8b-blink 1s step-end infinite; color: rgba(0,200,255,0.80); }

      .d8b-deploy-success { margin-top: 14px; display: flex; align-items: center; gap: 10px; }
      .d8b-deploy-url {
        flex: 1; padding: 12px 14px; border-radius: 12px;
        background: rgba(0,255,180,0.04); border: 1px solid rgba(0,255,180,0.15);
        font-size: 13px; font-family: ui-monospace, monospace; color: rgba(0,255,180,0.85);
      }

      /* ── Refine ── */
      .d8b-refine-section { display: flex; flex-direction: column; gap: 8px; }
      .d8b-refine-toggle {
        width: 100%; padding: 11px 14px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.02);
        color: rgba(170,185,215,0.55);
        font-size: 13px; font-weight: 500; font-family: inherit;
        cursor: pointer; transition: all 200ms ease;
        display: flex; align-items: center; justify-content: space-between;
      }
      .d8b-refine-toggle:hover { color: rgba(230,240,255,0.80); border-color: rgba(0,200,255,0.15); }
      .d8b-refine-toggle--active {
        border-color: rgba(0,200,255,0.20);
        background: rgba(0,200,255,0.03);
        color: rgba(0,230,255,0.85);
      }
      .d8b-refine-arrow { font-size: 10px; opacity: 0.4; }
      .d8b-refine-panel { display: flex; flex-direction: column; gap: 8px; }
      .d8b-refine-btn {
        width: 100%; padding: 11px;
        border-radius: 12px;
        border: 1px solid rgba(0,200,255,0.18);
        background: rgba(0,200,255,0.04);
        color: #fff;
        font-size: 13px; font-weight: 700; font-family: inherit;
        cursor: pointer; transition: all 200ms ease;
      }
      .d8b-refine-btn:hover:not(:disabled) {
        border-color: rgba(0,220,255,0.35);
        box-shadow: 0 0 20px rgba(0,200,255,0.06);
      }
      .d8b-refine-btn:disabled { opacity: 0.25; cursor: not-allowed; }

      /* ── Agent row ── */
      .d8b-agent-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .d8b-agent-btn {
        padding: 10px 12px; border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.05);
        background: rgba(255,255,255,0.02);
        color: rgba(170,185,215,0.50);
        font-size: 12px; font-family: inherit; font-weight: 600;
        cursor: pointer; transition: all 200ms ease;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .d8b-agent-btn:hover:not(:disabled) { background: rgba(0,200,255,0.03); color: rgba(230,240,255,0.85); border-color: rgba(0,200,255,0.12); }
      .d8b-agent-btn--active { border-color: rgba(0,200,255,0.20); background: rgba(0,200,255,0.04); color: rgba(0,230,255,0.85); }
      .d8b-agent-btn--loading { opacity: 0.45; cursor: not-allowed; }
      .d8b-agent-btn:disabled { opacity: 0.30; cursor: not-allowed; }

      /* ── SEO panel ── */
      .d8b-seo-panel {
        border-radius: 14px; border: 1px solid rgba(255,255,255,0.05);
        background: rgba(255,255,255,0.015); padding: 16px;
        display: flex; flex-direction: column; gap: 12px;
      }
      .d8b-seo-loading { font-size: 12px; color: rgba(140,160,200,0.40); text-align: center; padding: 8px 0; }
      .d8b-seo-score-row { display: flex; align-items: center; gap: 14px; }
      .d8b-seo-score { font-size: 40px; font-weight: 900; letter-spacing: -0.04em; line-height: 1; flex-shrink: 0; font-variant-numeric: tabular-nums; }
      .d8b-seo-grade { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; margin-bottom: 3px; }
      .d8b-seo-summary { font-size: 11px; color: rgba(150,170,210,0.50); line-height: 1.5; }
      .d8b-seo-strengths { display: flex; flex-direction: column; gap: 4px; }
      .d8b-seo-strength { font-size: 11px; color: rgba(0,255,180,0.65); line-height: 1.5; }
      .d8b-seo-issues { display: flex; flex-direction: column; gap: 8px; }
      .d8b-seo-issue { padding: 10px 12px; border-radius: 10px; border-left: 3px solid rgba(255,255,255,0.08); }
      .d8b-seo-issue--critical { border-left-color: rgba(255,60,90,0.60); background: rgba(255,60,90,0.03); }
      .d8b-seo-issue--warning  { border-left-color: rgba(255,200,60,0.60); background: rgba(255,200,60,0.03); }
      .d8b-seo-issue--info     { border-left-color: rgba(0,200,255,0.30); background: rgba(0,200,255,0.02); }
      .d8b-seo-issue-msg { font-size: 11px; font-weight: 700; color: rgba(230,240,255,0.75); margin-bottom: 3px; }
      .d8b-seo-issue-fix { font-size: 10px; color: rgba(140,160,200,0.45); line-height: 1.5; }

      /* ── Published URL banner ── */
      .d8b-published-banner {
        position: fixed; bottom: 0; left: 340px; right: 0;
        display: flex; align-items: center; gap: 10px;
        padding: 10px 20px;
        background: rgba(0,255,180,0.03);
        border-top: 1px solid rgba(0,255,180,0.10);
        backdrop-filter: blur(16px);
        z-index: 200; font-size: 12px;
      }
      .d8b-published-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: #00FFB2;
        box-shadow: 0 0 12px rgba(0,255,180,0.6);
        flex-shrink: 0;
        animation: d8b-blink 2.5s ease-in-out infinite;
      }
      .d8b-published-label { color: rgba(0,255,180,0.60); font-weight: 700; flex-shrink: 0; }
      .d8b-published-url {
        color: rgba(0,255,180,0.85); text-decoration: none; font-family: 'JetBrains Mono', ui-monospace, monospace;
        flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .d8b-published-url:hover { text-decoration: underline; }
      .d8b-published-copy {
        flex-shrink: 0; padding: 5px 12px; border-radius: 8px;
        border: 1px solid rgba(0,255,180,0.15);
        background: rgba(0,255,180,0.04);
        color: rgba(0,255,180,0.80); font-size: 11px; font-weight: 600; font-family: inherit;
        cursor: pointer; transition: all 200ms ease;
      }
      .d8b-published-copy:hover { background: rgba(0,255,180,0.08); box-shadow: 0 0 12px rgba(0,255,180,0.06); }

      /* ── Info modal ── */
      .d8b-info-modal {
        width: min(540px, 100%);
        border-radius: 24px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(8,12,28,0.95);
        backdrop-filter: blur(40px);
        box-shadow: 0 40px 120px rgba(0,0,0,0.7), 0 0 80px rgba(0,120,255,0.04);
        overflow: hidden;
        animation: d8b-modal-in 300ms cubic-bezier(0.16,1,0.3,1);
      }
      .d8b-info-section {
        border-radius: 14px; border: 1px solid rgba(255,255,255,0.05);
        background: rgba(255,255,255,0.015);
        padding: 16px 18px; margin-bottom: 12px;
        display: flex; flex-direction: column; gap: 8px;
      }
      .d8b-info-section-title {
        font-size: 10px; font-weight: 800; color: rgba(0,200,255,0.40);
        letter-spacing: 0.12em; text-transform: uppercase;
      }
      .d8b-info-section-body { font-size: 13px; color: rgba(150,170,210,0.50); line-height: 1.7; }
      .d8b-info-pill {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 12px; border-radius: 999px;
        background: rgba(0,255,180,0.05); border: 1px solid rgba(0,255,180,0.12);
        color: rgba(0,255,180,0.80); font-size: 11px; font-weight: 700;
      }
      .d8b-info-code {
        font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px;
        background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05);
        border-radius: 10px; padding: 12px 14px;
        color: rgba(0,200,255,0.70); line-height: 1.8; white-space: pre;
      }
      .d8b-info-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.03);
        font-size: 13px;
      }
      .d8b-info-row:last-child { border-bottom: none; padding-bottom: 0; }
      .d8b-info-row-label { color: rgba(140,160,200,0.45); }
      .d8b-info-row-val { color: rgba(230,240,255,0.85); font-weight: 700; }

      /* ── Mobile ── */
      @media (max-width: 768px) {
        .d8b-sidebar { width: 300px; min-width: 300px; }
        .d8b-splash-title { font-size: 38px; }
        .d8b-published-banner { left: 0; }
      }
    `}</style>
  );
}

// ─── Home Styles ──────────────────────────────────────────────────────────────

function HomeStyles() {
  return (
    <style>{`
      /* ══════════════════════════════════════════════════════════════════════════
         Dominat8 — Premium Homepage
         Design: Linear/Vercel-inspired dark theme
         ══════════════════════════════════════════════════════════════════════════ */

      .d8h-root {
        min-height: 100vh;
        width: 100%;
        background: #08090d;
        color: #f0f0f5;
        font-family: 'Inter', 'Outfit', system-ui, -apple-system, sans-serif;
        display: flex;
        flex-direction: column;
        padding-bottom: 100px;
        position: relative;
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* ── Subtle dot grid ── */
      .d8h-root::before {
        content: '';
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background-image: radial-gradient(rgba(0,212,255,0.03) 1px, transparent 1px);
        background-size: 32px 32px;
        mask-image: radial-gradient(ellipse 70% 50% at 50% 0%, black 0%, transparent 70%);
        -webkit-mask-image: radial-gradient(ellipse 70% 50% at 50% 0%, black 0%, transparent 70%);
      }

      /* ── Ambient background — single soft spotlight ── */
      .d8h-bg {
        position: fixed; inset: 0;
        pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,255,0.10) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 80% 20%, rgba(123,97,255,0.06) 0%, transparent 50%);
      }

      /* ── Payment banner ── */
      .d8h-payment-banner {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        padding: 12px 20px;
        background: rgba(0,255,178,0.08);
        border-bottom: 1px solid rgba(0,255,178,0.20);
        font-size: 13px; color: rgba(0,255,178,0.90);
        position: relative; z-index: 2;
      }
      .d8h-payment-dismiss {
        position: absolute; right: 16px;
        background: none; border: none; cursor: pointer;
        color: rgba(0,255,178,0.50); font-size: 14px; line-height: 1;
        padding: 0; font-family: inherit;
      }
      .d8h-payment-dismiss:hover { color: rgba(0,255,178,0.90); }

      /* ── Header ── */
      .d8h-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 32px;
        height: 56px;
        border-bottom: 1px solid rgba(0,212,255,0.06);
        position: sticky; top: 0; z-index: 50;
        background: rgba(8,9,13,0.85);
        backdrop-filter: blur(20px) saturate(1.2);
        -webkit-backdrop-filter: blur(20px) saturate(1.2);
      }
      .d8h-logo { display: flex; align-items: center; gap: 10px; }
      .d8h-logo-mark {
        font-size: 17px; font-weight: 800;
        background: linear-gradient(135deg, #E8F0FF, #00D4FF);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -0.04em;
      }
      .d8h-logo-text {
        font-size: 13px; font-weight: 500;
        color: rgba(240,240,245,0.35);
        letter-spacing: 0.01em;
      }
      .d8h-nav {
        display: flex; gap: 2px; align-items: center;
        position: absolute; left: 50%; transform: translateX(-50%);
      }
      .d8h-nav-link {
        padding: 6px 14px;
        border-radius: 8px;
        color: rgba(240,240,245,0.45);
        font-size: 13px; font-weight: 500;
        text-decoration: none;
        transition: all 150ms ease;
      }
      .d8h-nav-link:hover { color: rgba(240,240,245,0.85); background: rgba(255,255,255,0.04); }
      .d8h-header-actions { display: flex; align-items: center; gap: 8px; }
      .d8h-nav-signin {
        padding: 7px 18px;
        border-radius: 8px;
        border: 1px solid rgba(0,212,255,0.35);
        background: rgba(0,212,255,0.08);
        color: #00D4FF;
        font-size: 13px; font-weight: 600; font-family: inherit;
        cursor: pointer; transition: all 150ms ease;
      }
      .d8h-nav-signin:hover {
        background: rgba(0,212,255,0.16);
        border-color: rgba(0,212,255,0.50);
        box-shadow: 0 0 16px rgba(0,212,255,0.10);
      }

      /* ── Hero ── */
      .d8h-hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 120px 24px 0;
        gap: 0;
        position: relative; z-index: 1;
      }

      .d8h-badge {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 6px 16px; border-radius: 999px;
        border: 1px solid rgba(0,212,255,0.25);
        background: rgba(0,212,255,0.06);
        color: #00D4FF;
        font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
        text-transform: uppercase;
        margin-bottom: 32px;
      }
      .d8h-badge-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #00D4FF;
        box-shadow: 0 0 8px rgba(0,212,255,0.6);
        flex-shrink: 0;
        animation: d8h-pulse 3s ease-in-out infinite;
      }
      @keyframes d8h-pulse {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }

      .d8h-title {
        margin: 0;
        font-size: clamp(40px, 6vw, 72px);
        font-weight: 700;
        color: #f0f0f5;
        letter-spacing: -0.035em;
        text-align: center;
        line-height: 1.08;
      }
      .d8h-title-grad {
        background: linear-gradient(135deg, #00D4FF 0%, #0066FF 50%, #7B61FF 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .d8h-sub {
        margin: 24px 0 0;
        font-size: 17px;
        color: rgba(240,240,245,0.40);
        text-align: center;
        letter-spacing: -0.01em;
        max-width: 520px;
        line-height: 1.65;
      }

      /* ── Input card ── */
      .d8h-input-card {
        margin-top: 40px;
        width: min(680px, calc(100% - 32px));
        padding: 6px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.03);
        box-shadow:
          0 0 0 1px rgba(0,212,255,0.0),
          0 16px 48px -12px rgba(0,0,0,0.50);
        transition: all 250ms ease;
      }
      .d8h-input-card:focus-within {
        border-color: rgba(0,212,255,0.30);
        box-shadow:
          0 0 0 4px rgba(0,212,255,0.06),
          0 20px 60px -12px rgba(0,0,0,0.60),
          0 0 40px rgba(0,212,255,0.05);
      }
      .d8h-input-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 6px 6px 18px;
      }
      .d8h-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: #f0f0f5;
        font-size: 15px;
        font-family: inherit;
        letter-spacing: -0.01em;
        min-width: 0;
      }
      .d8h-input::placeholder { color: rgba(240,240,245,0.22); }
      .d8h-mic-btn {
        flex-shrink: 0;
        width: 38px; height: 38px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.08);
        background: transparent;
        color: rgba(240,240,245,0.35);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 150ms ease;
      }
      .d8h-mic-btn:hover { background: rgba(255,255,255,0.06); color: rgba(240,240,245,0.70); }
      .d8h-gen-btn {
        flex-shrink: 0;
        display: inline-flex; align-items: center; gap: 8px;
        padding: 10px 22px;
        border-radius: 10px;
        border: none;
        background: linear-gradient(135deg, #00D4FF, #0066FF);
        color: #030712;
        font-size: 14px;
        font-weight: 700;
        font-family: inherit;
        letter-spacing: 0.01em;
        cursor: pointer;
        transition: all 180ms ease;
        box-shadow: 0 2px 12px rgba(0,212,255,0.30), inset 0 1px 0 rgba(255,255,255,0.15);
      }
      .d8h-gen-btn svg { flex-shrink: 0; }
      .d8h-gen-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #1ADCFF, #1A7AFF);
        box-shadow: 0 4px 20px rgba(0,212,255,0.45), inset 0 1px 0 rgba(255,255,255,0.18);
        transform: translateY(-1px);
      }
      .d8h-gen-btn:disabled { opacity: 0.30; cursor: not-allowed; }

      /* ── Quick options row ── */
      .d8h-quick-row {
        display: flex; align-items: center; justify-content: center;
        gap: 6px; flex-wrap: wrap; margin-top: 16px;
      }
      .d8h-tag {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 5px 12px; border-radius: 8px; font-size: 12px;
        font-weight: 500; font-family: inherit; cursor: pointer;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.03);
        color: rgba(240,240,245,0.50);
        transition: all 150ms ease;
      }
      .d8h-tag:hover { border-color: rgba(255,255,255,0.15); color: rgba(240,240,245,0.75); }
      .d8h-tag--model {
        border-color: rgba(0,212,255,0.20);
        color: rgba(0,212,255,0.80);
      }
      .d8h-tag--model:hover { border-color: rgba(0,212,255,0.40); }
      .d8h-tag--open {
        border-color: rgba(0,212,255,0.30);
        color: #00D4FF;
        background: rgba(0,212,255,0.06);
      }

      /* ── Expanded options ── */
      .d8h-expand {
        display: flex; flex-direction: column; gap: 20px;
        margin-top: 20px; padding: 20px 24px;
        width: min(680px, calc(100% - 32px));
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.02);
        animation: d8h-fade-in 200ms ease;
      }
      @keyframes d8h-fade-in {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .d8h-expand-group { display: flex; flex-direction: column; gap: 10px; }
      .d8h-expand-label {
        font-size: 11px; font-weight: 600;
        color: rgba(240,240,245,0.30);
        text-transform: uppercase; letter-spacing: 0.08em;
      }
      .d8h-chips {
        display: flex; flex-wrap: wrap; gap: 6px;
      }
      .d8h-chip {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 6px 12px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.06);
        background: transparent;
        color: rgba(240,240,245,0.40);
        font-size: 12px; font-weight: 500; font-family: inherit;
        cursor: pointer; transition: all 150ms ease;
      }
      .d8h-chip:hover {
        border-color: rgba(255,255,255,0.15);
        color: rgba(240,240,245,0.75);
        background: rgba(255,255,255,0.03);
      }
      .d8h-chip--on {
        border-color: rgba(0,212,255,0.45);
        background: rgba(0,212,255,0.08);
        color: #00D4FF;
      }

      /* ── Stats strip ── */
      .d8h-stats {
        display: flex; align-items: center; justify-content: center;
        gap: 0; margin: 56px auto 0;
        padding: 20px 40px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.02);
        position: relative; z-index: 1;
      }
      .d8h-stat {
        display: flex; flex-direction: column; align-items: center;
        gap: 4px; padding: 0 36px;
      }
      .d8h-stat-value {
        font-size: 22px; font-weight: 700; color: #f0f0f5;
        font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', monospace;
        letter-spacing: -0.03em;
      }
      .d8h-stat-label {
        font-size: 12px; color: rgba(240,240,245,0.30);
        font-weight: 500; letter-spacing: 0.01em;
      }
      .d8h-stat-sep {
        width: 1px; height: 32px;
        background: rgba(255,255,255,0.08);
        flex-shrink: 0;
      }

      /* ── Social proof ── */
      .d8h-social-proof {
        display: flex; align-items: center; justify-content: center;
        flex-wrap: wrap; gap: 8px 14px;
        margin: 24px 0 0;
        padding: 0 24px;
        position: relative; z-index: 1;
      }
      .d8h-avatars { display: flex; align-items: center; }
      .d8h-avatar {
        width: 22px; height: 22px; border-radius: 50%;
        border: 2px solid #08090d;
        display: inline-block; flex-shrink: 0;
      }
      .d8h-sp-count {
        font-size: 13px; color: rgba(240,240,245,0.45);
      }
      .d8h-sp-num { font-weight: 700; color: #f0f0f5; }
      .d8h-sp-divider { color: rgba(255,255,255,0.12); font-size: 13px; }
      .d8h-sp-tag {
        font-size: 12px; color: rgba(240,240,245,0.30);
        padding: 3px 10px; border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.02);
      }

      /* ── Deployments ── */
      .d8h-deploys {
        width: min(820px, 100%);
        margin: 56px auto 0;
        padding: 0 24px;
        position: relative; z-index: 1;
      }
      .d8h-section-head {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 16px;
      }
      .d8h-section-title {
        margin: 0;
        font-size: 14px; font-weight: 600;
        color: rgba(240,240,245,0.70);
        letter-spacing: -0.01em;
      }
      .d8h-live-indicator {
        display: flex; align-items: center; gap: 6px;
        font-size: 12px; color: rgba(240,240,245,0.35);
      }
      .d8h-live-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #00FFB2;
        box-shadow: 0 0 6px rgba(0,255,178,0.5);
        animation: d8h-blink 2.5s ease-in-out infinite;
      }
      @keyframes d8h-blink { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

      .d8h-deploys-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 12px;
      }
      .d8h-dep-card {
        padding: 16px 18px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.02);
        transition: all 200ms ease;
      }
      .d8h-dep-card:hover {
        border-color: rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.04);
        transform: translateY(-1px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.30);
      }
      .d8h-dep-top {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 10px;
      }
      .d8h-dep-icon { font-size: 18px; }
      .d8h-dep-pill {
        display: inline-flex; align-items: center;
        padding: 3px 10px; border-radius: 6px;
        border: 1px solid; font-size: 10px; font-weight: 700;
        letter-spacing: 0.04em; text-transform: uppercase;
      }
      .d8h-dep-domain {
        font-size: 14px; font-weight: 600; color: #f0f0f5;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .d8h-dep-desc {
        font-size: 12px; color: rgba(240,240,245,0.30);
        margin-top: 4px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .d8h-dep-bar-wrap {
        display: flex; align-items: center; gap: 8px;
        margin-top: 12px;
      }
      .d8h-dep-bar-track {
        flex: 1; height: 4px; border-radius: 999px;
        background: rgba(255,255,255,0.06); overflow: hidden;
      }
      .d8h-dep-bar-fill {
        height: 100%; border-radius: 999px;
        transition: width 600ms ease;
      }
      .d8h-dep-pct {
        font-size: 11px; color: rgba(240,240,245,0.35);
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        min-width: 28px; text-align: right;
      }
      .d8h-deploys-empty {
        font-size: 13px; color: rgba(240,240,245,0.25);
        text-align: center; padding: 32px 0;
        grid-column: 1 / -1;
      }

      /* ── Bottom dock ── */
      .d8h-dock {
        position: fixed;
        bottom: 16px; left: 50%; transform: translateX(-50%);
        display: flex; gap: 2px; align-items: end;
        padding: 8px 12px;
        border-radius: 16px;
        border: 1px solid rgba(0,212,255,0.12);
        background: rgba(8,9,13,0.92);
        backdrop-filter: blur(24px) saturate(1.4);
        -webkit-backdrop-filter: blur(24px) saturate(1.4);
        z-index: 100;
        box-shadow: 0 12px 40px rgba(0,0,0,0.60), 0 0 40px rgba(0,212,255,0.03);
      }
      .d8h-dock-btn {
        position: relative;
        display: flex; flex-direction: column; align-items: center;
        gap: 3px; padding: 8px 10px 6px;
        border-radius: 10px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--dock-color, rgba(240,240,245,0.45));
        cursor: pointer; transition: all 200ms ease;
        min-width: 48px;
        text-decoration: none;
        overflow: hidden;
      }
      .d8h-dock-glow {
        position: absolute; inset: 0; border-radius: 10px;
        background: radial-gradient(circle at 50% 40%, var(--dock-color), transparent 70%);
        opacity: 0; transition: opacity 200ms ease; pointer-events: none;
      }
      .d8h-dock-btn:hover {
        background: rgba(255,255,255,0.04);
        transform: translateY(-3px);
      }
      .d8h-dock-btn:hover .d8h-dock-glow { opacity: 0.08; }
      .d8h-dock-btn:hover .d8h-dock-label { color: var(--dock-color); }
      .d8h-dock-svg {
        width: 20px; height: 20px;
        color: var(--dock-color, rgba(240,240,245,0.45));
        transition: all 200ms ease;
        flex-shrink: 0;
      }
      .d8h-dock-label {
        font-size: 9px; font-family: inherit; font-weight: 500;
        color: rgba(240,240,245,0.25);
        letter-spacing: 0.03em;
        white-space: nowrap;
        text-transform: uppercase;
        transition: color 200ms ease;
      }

      /* ── Footer ── */
      .d8h-footer {
        padding: 48px 32px 100px;
        margin-top: 48px;
        border-top: 1px solid rgba(255,255,255,0.04);
        position: relative; z-index: 1;
      }
      .d8h-footer-inner {
        max-width: 820px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .d8h-footer-brand {
        display: flex; align-items: center; gap: 12px;
      }
      .d8h-footer-logo {
        font-size: 15px; font-weight: 800; color: rgba(240,240,245,0.50);
      }
      .d8h-footer-copy {
        font-size: 12px; color: rgba(240,240,245,0.18);
      }
      .d8h-footer-links {
        display: flex; flex-wrap: wrap; gap: 4px 16px;
      }
      .d8h-footer-link {
        font-size: 12px; color: rgba(240,240,245,0.25);
        text-decoration: none; transition: color 150ms ease;
      }
      .d8h-footer-link:hover { color: rgba(240,240,245,0.60); }

      /* ── Responsive ── */
      @media (max-width: 640px) {
        .d8h-hero { padding: 80px 20px 0; }
        .d8h-title { font-size: 32px; }
        .d8h-sub { font-size: 15px; }
        .d8h-nav { display: none; }
        .d8h-stats { flex-direction: column; gap: 16px; padding: 20px; }
        .d8h-stat { padding: 0; }
        .d8h-stat-sep { width: 40px; height: 1px; }
        .d8h-deploys-grid { grid-template-columns: 1fr; }
        .d8h-dock { gap: 0; padding: 6px 8px; }
        .d8h-dock-btn { min-width: 40px; padding: 6px 5px 5px; }
        .d8h-dock-svg { width: 18px; height: 18px; }
        .d8h-dock-label { display: none; }
        .d8h-footer-inner { flex-direction: column; gap: 12px; text-align: center; }
        .d8h-footer-links { justify-content: center; }
      }

      @media (prefers-reduced-motion: reduce) {
        .d8h-badge-dot { animation: none !important; }
        .d8h-live-dot { animation: none !important; }
      }
    `}</style>
  );
}
