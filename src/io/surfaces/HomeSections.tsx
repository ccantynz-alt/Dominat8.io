"use client";

import React, { useState, useEffect, useRef } from "react";

// ─── Live activity feed ────────────────────────────────────────────────────────

const LIVE_POOL = [
  { flag: "🇳🇿", city: "Auckland",    industry: "Plumbing Co",        vibe: "Luxury"    },
  { flag: "🇺🇸", city: "New York",    industry: "Law Firm",           vibe: "Corporate" },
  { flag: "🇦🇺", city: "Sydney",      industry: "Real Estate",        vibe: "Bold"      },
  { flag: "🇬🇧", city: "London",      industry: "Fitness Studio",     vibe: "Dark"      },
  { flag: "🇨🇦", city: "Toronto",     industry: "SaaS Startup",       vibe: "Minimal"   },
  { flag: "🇩🇪", city: "Berlin",      industry: "Coffee Roastery",    vibe: "Playful"   },
  { flag: "🇸🇬", city: "Singapore",   industry: "Medical Clinic",     vibe: "Corporate" },
  { flag: "🇿🇦", city: "Cape Town",   industry: "Wedding Studio",     vibe: "Luxury"    },
  { flag: "🇧🇷", city: "São Paulo",   industry: "E-commerce",         vibe: "Bold"      },
  { flag: "🇯🇵", city: "Tokyo",       industry: "Portfolio",          vibe: "Minimal"   },
  { flag: "🇫🇷", city: "Paris",       industry: "Boutique Agency",    vibe: "Luxury"    },
  { flag: "🇮🇳", city: "Mumbai",      industry: "Construction Firm",  vibe: "Corporate" },
  { flag: "🇺🇸", city: "Austin",      industry: "Restaurant",         vibe: "Playful"   },
  { flag: "🇳🇱", city: "Amsterdam",   industry: "Tech Consultancy",   vibe: "Dark"      },
  { flag: "🇦🇺", city: "Melbourne",   industry: "Personal Trainer",   vibe: "Bold"      },
  { flag: "🇲🇽", city: "Mexico City", industry: "Architecture Firm",  vibe: "Minimal"   },
  { flag: "🇺🇸", city: "Chicago",     industry: "Dental Practice",    vibe: "Corporate" },
  { flag: "🇰🇷", city: "Seoul",       industry: "SaaS Platform",      vibe: "Dark"      },
  { flag: "🇮🇱", city: "Tel Aviv",    industry: "Fintech Startup",    vibe: "Bold"      },
  { flag: "🇺🇸", city: "Miami",       industry: "Luxury Real Estate", vibe: "Luxury"    },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function LiveFeed() {
  const [items, setItems] = useState(() => shuffle(LIVE_POOL).slice(0, 5).map((x, i) => ({
    ...x,
    id: i,
    elapsed: (i + 1) * 4,
  })));
  const counterRef = useRef(items.length);

  useEffect(() => {
    const pool = shuffle(LIVE_POOL);
    let poolIdx = 0;
    const id = setInterval(() => {
      poolIdx = (poolIdx + 1) % pool.length;
      const next = pool[poolIdx];
      counterRef.current++;
      setItems(prev => [
        { ...next, id: counterRef.current, elapsed: 1 },
        ...prev.slice(0, 4),
      ]);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setItems(prev => prev.map(x => ({ ...x, elapsed: x.elapsed + 1 })));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="d8hs-feed-list">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="d8hs-feed-row"
          style={{ animationDelay: `${i * 40}ms`, opacity: 1 - i * 0.15 }}
        >
          <span className="d8hs-feed-flag">{item.flag}</span>
          <span className="d8hs-feed-city">{item.city}</span>
          <span className="d8hs-feed-sep">·</span>
          <span className="d8hs-feed-industry">{item.industry}</span>
          <span className="d8hs-feed-sep">·</span>
          <span className="d8hs-feed-vibe">{item.vibe}</span>
          <span className="d8hs-feed-time">{item.elapsed}s ago</span>
        </div>
      ))}
    </div>
  );
}

// ─── Animated stat counter ─────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1800, decimals = 0) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(parseFloat((eased * target).toFixed(decimals)));
          if (p < 1) requestAnimationFrame(tick);
          else setVal(target);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, decimals]);

  return { val, ref };
}

function StatCard({ prefix, value, suffix, label, decimals = 0, color }: {
  prefix?: string; value: number; suffix: string; label: string; decimals?: number; color: string;
}) {
  const { val, ref } = useCountUp(value, 1600, decimals);
  return (
    <div className="d8hs-stat" ref={ref}>
      <div className="d8hs-stat-num" style={{ color }}>
        {prefix}{decimals > 0 ? val.toFixed(decimals) : val.toLocaleString()}{suffix}
      </div>
      <div className="d8hs-stat-label">{label}</div>
    </div>
  );
}

// ─── Feature cards ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "⚡",
    title: "Under 30 seconds",
    desc: "Not a prototype. A publish-ready, multi-section website generated from a single sentence.",
    accent: "#F0B35A",
  },
  {
    icon: "🎨",
    title: "6 distinct styles",
    desc: "Minimal, Bold, Luxury, Dark, Playful, Corporate — each a complete design language.",
    accent: "#FFD166",
  },
  {
    icon: "📱",
    title: "Mobile-first output",
    desc: "Every generated site is fully responsive. Looks great on any screen, out of the box.",
    accent: "#38F8A6",
  },
  {
    icon: "🔍",
    title: "Built-in SEO",
    desc: "Title tags, meta descriptions, OG images, canonical URLs, and sitemap — included automatically.",
    accent: "#FF9A3C",
  },
  {
    icon: "✨",
    title: "One-click refinement",
    desc: "\"Make it darker\" or \"Add a pricing section\" — iterative edits in natural language.",
    accent: "#B06EFF",
  },
  {
    icon: "📦",
    title: "Clean HTML export",
    desc: "Download the source. No lock-in. Host anywhere — Vercel, Netlify, your own server.",
    accent: "#F0B35A",
  },
  {
    icon: "🛡️",
    title: "Zero lorem ipsum",
    desc: "Real content drawn from your brief. No placeholder text ever shipped to production.",
    accent: "#38F8A6",
  },
  {
    icon: "🚀",
    title: "1-click deploy",
    desc: "Push straight to your domain from the cockpit. Auto-SSL, CDN edge, instant propagation.",
    accent: "#FFD166",
  },
];

// ─── How it works ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    title: "Describe your business",
    desc: "One sentence or a full brief — the more context, the better the output. Tell us your industry, tone, and goals.",
    detail: "\"A boutique law firm in Melbourne — calm, credible, premium. We handle personal injury and family law.\"",
  },
  {
    num: "02",
    title: "Watch it appear",
    desc: "AI crafts your full multi-page site in real time. You see content streaming in as it generates — usually under 30 seconds.",
    detail: "Homepage · Pricing · Services · Contact · FAQ · SEO metadata",
  },
  {
    num: "03",
    title: "Refine and publish",
    desc: "Iterate with natural language edits. Run the SEO scanner. Fix with one click. Then export or deploy to your domain.",
    detail: "Download HTML · 1-click deploy · Share link · Custom domain",
  },
];

// ─── Testimonials ──────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "I described my practice in two sentences and got a site that looks like a $12,000 studio build. My clients can't believe it.",
    name: "Marcus T.",
    role: "Principal, Henderson Law",
    avatar: "MT",
    color: "#F0B35A",
    stars: 5,
  },
  {
    quote: "We've tested every AI builder out there. Dominat8 is the only one that produces output a client would actually pay for.",
    name: "Sarah K.",
    role: "Creative Director, Studio Nine",
    avatar: "SK",
    color: "#38F8A6",
    stars: 5,
  },
  {
    quote: "Went from brief to live site in 4 minutes. Including the domain setup. That's not possible with anything else.",
    name: "Liam O.",
    role: "Founder, Apex Fitness",
    avatar: "LO",
    color: "#FFD166",
    stars: 5,
  },
];

// ─── Style showcase ─────────────────────────────────────────────────────────────

const STYLE_CARDS = [
  { label: "Minimal",   preview: ["◽ Clean. Precise.", "One typeface.", "Maximum whitespace."],     bg: "linear-gradient(135deg, #0a0d16 0%, #111520 100%)", accent: "#ffffff", border: "rgba(255,255,255,0.14)" },
  { label: "Bold",      preview: ["■ High contrast.", "Oversized type.", "Zero decoration."],       bg: "linear-gradient(135deg, #0d0808 0%, #1a0505 100%)", accent: "#FF4D4D", border: "rgba(255,80,80,0.25)" },
  { label: "Luxury",    preview: ["◆ Dark + gold.", "Editorial spacing.", "Premium serif."],        bg: "linear-gradient(135deg, #080610 0%, #100d1a 100%)", accent: "#C09A5C", border: "rgba(192,154,92,0.30)" },
  { label: "Dark",      preview: ["◉ Neon accents.", "Grid background.", "Cyberpunk-adjacent."],    bg: "linear-gradient(135deg, #030610 0%, #060b1c 100%)", accent: "#F0B35A", border: "rgba(240,179,90,0.28)" },
  { label: "Playful",   preview: ["✦ Vibrant.", "Rounded shapes.", "Warm personality."],            bg: "linear-gradient(135deg, #100a06 0%, #1c1006 100%)", accent: "#FFD166", border: "rgba(255,209,102,0.28)" },
  { label: "Corporate", preview: ["▲ Structured.", "Clear hierarchy.", "Enterprise-ready."],        bg: "linear-gradient(135deg, #06080d 0%, #0a0e18 100%)", accent: "#4A90E2", border: "rgba(74,144,226,0.28)" },
];

// ─── Main component ────────────────────────────────────────────────────────────

export function HomeSections() {
  return (
    <>
      <HomeSectionsStyles />

      {/* ── Stats Strip ── */}
      <section className="d8hs-stats-section">
        <div className="d8hs-stats-inner">
          <StatCard value={50000} suffix="+" label="Sites generated" color="#F0B35A" />
          <div className="d8hs-stats-div" />
          <StatCard value={180} suffix="+" label="Countries" color="#38F8A6" />
          <div className="d8hs-stats-div" />
          <StatCard prefix="<" value={28} suffix="s" label="Avg build time" color="#FFD166" />
          <div className="d8hs-stats-div" />
          <StatCard value={4.9} suffix="★" label="Avg rating" color="#FF9A3C" decimals={1} />
        </div>
      </section>

      {/* ── Live Activity ── */}
      <section className="d8hs-section d8hs-section--live">
        <div className="d8hs-section-inner">
          <div className="d8hs-live-header">
            <span className="d8hs-live-pulse" />
            <span className="d8hs-live-label">Live — sites generating right now</span>
          </div>
          <LiveFeed />
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="d8hs-section">
        <div className="d8hs-section-inner">
          <div className="d8hs-section-heading">
            <div className="d8hs-eyebrow-label">How it works</div>
            <h2 className="d8hs-h2">Brief to live in minutes</h2>
            <p className="d8hs-h2-sub">No drag and drop. No templates. Just describe what you want and watch it appear.</p>
          </div>
          <div className="d8hs-steps">
            {STEPS.map((step, i) => (
              <div key={i} className="d8hs-step">
                <div className="d8hs-step-num">{step.num}</div>
                <div className="d8hs-step-content">
                  <div className="d8hs-step-title">{step.title}</div>
                  <div className="d8hs-step-desc">{step.desc}</div>
                  <div className="d8hs-step-detail">{step.detail}</div>
                </div>
                {i < STEPS.length - 1 && <div className="d8hs-step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Style Showcase ── */}
      <section className="d8hs-section">
        <div className="d8hs-section-inner">
          <div className="d8hs-section-heading">
            <div className="d8hs-eyebrow-label">6 design languages</div>
            <h2 className="d8hs-h2">Pick your vibe</h2>
            <p className="d8hs-h2-sub">Each style is a complete design system — not just a colour swap.</p>
          </div>
          <div className="d8hs-style-grid">
            {STYLE_CARDS.map((card, i) => (
              <div
                key={i}
                className="d8hs-style-card"
                style={{ background: card.bg, borderColor: card.border }}
              >
                <div className="d8hs-style-card-label" style={{ color: card.accent }}>
                  {card.label}
                </div>
                <div className="d8hs-style-card-lines">
                  {card.preview.map((line, j) => (
                    <div key={j} className="d8hs-style-card-line" style={{ opacity: 1 - j * 0.25 }}>{line}</div>
                  ))}
                </div>
                <div className="d8hs-style-card-dot" style={{ background: card.accent }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="d8hs-section">
        <div className="d8hs-section-inner">
          <div className="d8hs-section-heading">
            <div className="d8hs-eyebrow-label">What you get</div>
            <h2 className="d8hs-h2">Everything. In one generation.</h2>
            <p className="d8hs-h2-sub">Every feature you'd spend weeks building — included by default.</p>
          </div>
          <div className="d8hs-feature-grid">
            {FEATURES.map((feat, i) => (
              <div key={i} className="d8hs-feature-card">
                <div className="d8hs-feature-icon" style={{ background: `${feat.accent}14`, borderColor: `${feat.accent}28` }}>
                  {feat.icon}
                </div>
                <div className="d8hs-feature-title">{feat.title}</div>
                <div className="d8hs-feature-desc">{feat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="d8hs-section">
        <div className="d8hs-section-inner">
          <div className="d8hs-section-heading">
            <div className="d8hs-eyebrow-label">What builders say</div>
            <h2 className="d8hs-h2">Results that speak for themselves</h2>
          </div>
          <div className="d8hs-testimonials">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="d8hs-testimonial">
                <div className="d8hs-testimonial-stars">
                  {"★".repeat(t.stars)}
                </div>
                <blockquote className="d8hs-testimonial-quote">"{t.quote}"</blockquote>
                <div className="d8hs-testimonial-author">
                  <div className="d8hs-testimonial-avatar" style={{ background: `${t.color}22`, borderColor: `${t.color}44`, color: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="d8hs-testimonial-name">{t.name}</div>
                    <div className="d8hs-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Strip ── */}
      <section className="d8hs-cta-section">
        <div className="d8hs-cta-inner">
          <div className="d8hs-cta-glow" />
          <div className="d8hs-cta-eyebrow">Ready?</div>
          <h2 className="d8hs-cta-title">Start building in 10 seconds</h2>
          <p className="d8hs-cta-sub">Type a brief above. No signup required for your first 3 sites.</p>
          <div className="d8hs-cta-tags">
            <span className="d8hs-cta-tag">✓ Free to start</span>
            <span className="d8hs-cta-tag">✓ No credit card</span>
            <span className="d8hs-cta-tag">✓ HTML export included</span>
            <span className="d8hs-cta-tag">✓ 75+ industry templates</span>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

function HomeSectionsStyles() {
  return (
    <style>{`
      /* ── Layout ── */
      .d8hs-section {
        width: 100%;
        padding: 72px 24px;
        position: relative;
        z-index: 1;
      }
      .d8hs-section--live { padding: 28px 24px; }
      .d8hs-section-inner {
        max-width: 1000px;
        margin: 0 auto;
      }

      /* ── Section headings ── */
      .d8hs-eyebrow-label {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: rgba(240,179,90,0.65);
        margin-bottom: 12px;
      }
      .d8hs-h2 {
        margin: 0 0 14px;
        font-size: clamp(26px, 4vw, 42px);
        font-weight: 800;
        color: #fff;
        letter-spacing: -0.03em;
        line-height: 1.1;
      }
      .d8hs-h2-sub {
        margin: 0;
        font-size: 16px;
        color: rgba(255,255,255,0.40);
        max-width: 520px;
        line-height: 1.6;
      }
      .d8hs-section-heading {
        margin-bottom: 48px;
      }

      /* ── Stats strip ── */
      .d8hs-stats-section {
        width: 100%;
        padding: 32px 24px;
        border-top: 1px solid rgba(255,255,255,0.05);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        position: relative; z-index: 1;
      }
      .d8hs-stats-inner {
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        flex-wrap: wrap;
      }
      .d8hs-stat {
        flex: 1;
        min-width: 140px;
        text-align: center;
        padding: 16px 24px;
      }
      .d8hs-stat-num {
        font-size: clamp(28px, 4vw, 40px);
        font-weight: 800;
        letter-spacing: -0.04em;
        line-height: 1;
        margin-bottom: 6px;
      }
      .d8hs-stat-label {
        font-size: 12px;
        color: rgba(255,255,255,0.38);
        letter-spacing: 0.02em;
      }
      .d8hs-stats-div {
        width: 1px;
        height: 36px;
        background: rgba(255,255,255,0.07);
        flex-shrink: 0;
      }

      /* ── Live feed ── */
      .d8hs-live-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }
      .d8hs-live-pulse {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: #38F8A6;
        flex-shrink: 0;
        animation: d8hs-live-pulse 2s ease-in-out infinite;
      }
      @keyframes d8hs-live-pulse {
        0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(56,248,166,0.4); }
        50% { opacity: 0.7; box-shadow: 0 0 0 5px rgba(56,248,166,0); }
      }
      .d8hs-live-label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(56,248,166,0.60);
      }
      .d8hs-feed-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .d8hs-feed-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 7px 14px;
        border-radius: 10px;
        background: rgba(255,255,255,0.025);
        border: 1px solid rgba(255,255,255,0.05);
        font-size: 12px;
        animation: d8hs-feed-in 300ms ease;
        transition: opacity 500ms ease;
      }
      @keyframes d8hs-feed-in {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .d8hs-feed-flag { font-size: 14px; flex-shrink: 0; }
      .d8hs-feed-city { font-weight: 600; color: rgba(255,255,255,0.75); }
      .d8hs-feed-sep { color: rgba(255,255,255,0.18); }
      .d8hs-feed-industry { color: rgba(255,255,255,0.50); }
      .d8hs-feed-vibe {
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(240,179,90,0.07);
        border: 1px solid rgba(240,179,90,0.15);
        color: rgba(240,179,90,0.70);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.04em;
      }
      .d8hs-feed-time { margin-left: auto; color: rgba(255,255,255,0.25); font-size: 11px; }

      /* ── Steps ── */
      .d8hs-steps {
        display: grid;
        grid-template-columns: 1fr auto 1fr auto 1fr;
        gap: 0;
        align-items: start;
      }
      @media (max-width: 700px) {
        .d8hs-steps { grid-template-columns: 1fr; }
        .d8hs-step-arrow { display: none; }
      }
      .d8hs-step {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 28px 24px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.07);
        background: rgba(255,255,255,0.022);
        transition: border-color 160ms ease, background 160ms ease;
      }
      .d8hs-step:hover {
        border-color: rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.04);
      }
      .d8hs-step-arrow {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 12px;
        color: rgba(255,255,255,0.18);
        font-size: 18px;
        padding-top: 32px;
      }
      .d8hs-step-num {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.10em;
        color: rgba(240,179,90,0.45);
      }
      .d8hs-step-title {
        font-size: 17px;
        font-weight: 700;
        color: #fff;
        letter-spacing: -0.02em;
      }
      .d8hs-step-desc {
        font-size: 13px;
        color: rgba(255,255,255,0.48);
        line-height: 1.65;
      }
      .d8hs-step-detail {
        font-size: 11px;
        color: rgba(240,179,90,0.45);
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        border-top: 1px solid rgba(255,255,255,0.06);
        padding-top: 10px;
        margin-top: 4px;
        line-height: 1.8;
      }

      /* ── Style cards ── */
      .d8hs-style-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      @media (max-width: 700px) { .d8hs-style-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 420px) { .d8hs-style-grid { grid-template-columns: 1fr; } }
      .d8hs-style-card {
        border-radius: 18px;
        border: 1px solid;
        padding: 22px 20px;
        cursor: default;
        transition: transform 180ms ease, box-shadow 180ms ease;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .d8hs-style-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.45);
      }
      .d8hs-style-card-label {
        font-size: 13px;
        font-weight: 800;
        letter-spacing: -0.01em;
      }
      .d8hs-style-card-lines {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .d8hs-style-card-line {
        font-size: 11px;
        color: rgba(255,255,255,0.55);
        font-family: 'JetBrains Mono', ui-monospace, monospace;
      }
      .d8hs-style-card-dot {
        width: 8px; height: 8px;
        border-radius: 50%;
        margin-top: 8px;
        opacity: 0.6;
      }

      /* ── Features ── */
      .d8hs-feature-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      @media (max-width: 900px) { .d8hs-feature-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 500px) { .d8hs-feature-grid { grid-template-columns: 1fr; } }
      .d8hs-feature-card {
        padding: 22px 20px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.07);
        background: rgba(255,255,255,0.02);
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
      }
      .d8hs-feature-card:hover {
        border-color: rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.04);
        transform: translateY(-2px);
      }
      .d8hs-feature-icon {
        width: 38px; height: 38px;
        border-radius: 10px;
        border: 1px solid;
        display: flex; align-items: center; justify-content: center;
        font-size: 17px;
        flex-shrink: 0;
      }
      .d8hs-feature-title {
        font-size: 14px;
        font-weight: 700;
        color: rgba(255,255,255,0.88);
        letter-spacing: -0.01em;
      }
      .d8hs-feature-desc {
        font-size: 12px;
        color: rgba(255,255,255,0.40);
        line-height: 1.65;
      }

      /* ── Testimonials ── */
      .d8hs-testimonials {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
      @media (max-width: 700px) { .d8hs-testimonials { grid-template-columns: 1fr; } }
      .d8hs-testimonial {
        padding: 24px 22px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.025);
        display: flex;
        flex-direction: column;
        gap: 14px;
        transition: border-color 160ms ease, background 160ms ease;
      }
      .d8hs-testimonial:hover {
        border-color: rgba(255,255,255,0.13);
        background: rgba(255,255,255,0.04);
      }
      .d8hs-testimonial-stars { font-size: 14px; color: #FFD166; letter-spacing: 2px; }
      .d8hs-testimonial-quote {
        margin: 0;
        font-size: 14px;
        color: rgba(255,255,255,0.70);
        line-height: 1.65;
        font-style: normal;
        flex: 1;
      }
      .d8hs-testimonial-author {
        display: flex;
        align-items: center;
        gap: 11px;
      }
      .d8hs-testimonial-avatar {
        width: 34px; height: 34px;
        border-radius: 50%;
        border: 1px solid;
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; font-weight: 800;
        flex-shrink: 0;
      }
      .d8hs-testimonial-name {
        font-size: 13px;
        font-weight: 600;
        color: rgba(255,255,255,0.80);
      }
      .d8hs-testimonial-role {
        font-size: 11px;
        color: rgba(255,255,255,0.35);
      }

      /* ── CTA Section ── */
      .d8hs-cta-section {
        width: 100%;
        padding: 80px 24px;
        position: relative; z-index: 1;
        text-align: center;
      }
      .d8hs-cta-inner {
        max-width: 600px;
        margin: 0 auto;
        position: relative;
      }
      .d8hs-cta-glow {
        position: absolute;
        width: 400px; height: 200px;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: radial-gradient(ellipse, rgba(240,179,90,0.07) 0%, transparent 70%);
        pointer-events: none;
        border-radius: 50%;
      }
      .d8hs-cta-eyebrow {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: rgba(240,179,90,0.55);
        margin-bottom: 14px;
      }
      .d8hs-cta-title {
        margin: 0 0 14px;
        font-size: clamp(28px, 4vw, 44px);
        font-weight: 800;
        color: #fff;
        letter-spacing: -0.03em;
        line-height: 1.1;
      }
      .d8hs-cta-sub {
        margin: 0 0 28px;
        font-size: 15px;
        color: rgba(255,255,255,0.38);
        line-height: 1.6;
      }
      .d8hs-cta-tags {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }
      .d8hs-cta-tag {
        padding: 6px 14px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.50);
        font-size: 12px;
      }
    `}</style>
  );
}
