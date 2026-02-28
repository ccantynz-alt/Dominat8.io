"use client";

import React from "react";

/* ━━━ Quantum Blue Build Page Shell ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const NAV_ITEMS = [
  { label: "Deploy",    icon: "🚀", href: "/build/deploy" },
  { label: "Domains",   icon: "🌐", href: "/build/domains" },
  { label: "SSL",       icon: "🔒", href: "/build/ssl" },
  { label: "Monitor",   icon: "📊", href: "/build/monitor" },
  { label: "Logs",      icon: "💬", href: "/build/logs" },
  { label: "Fix",       icon: "🔧", href: "/build/fix" },
  { label: "Automate",  icon: "⚡", href: "/build/automate" },
  { label: "Integrate", icon: "✏️", href: "/build/integrate" },
  { label: "Settings",  icon: "⚙️", href: "/build/settings" },
];

interface BuildPageShellProps {
  title: string;
  icon: string;
  accentColor: string;
  children: React.ReactNode;
  activePage: string;
}

export function BuildPageShell({ title, icon, accentColor, children, activePage }: BuildPageShellProps) {
  return (
    <div className="bps-root">
      <ShellStyles accent={accentColor} />

      {/* Animated mesh background */}
      <div className="bps-bg" aria-hidden="true">
        <div className="bps-orb bps-orb-1" />
        <div className="bps-orb bps-orb-2" />
        <div className="bps-orb bps-orb-3" />
        <div className="bps-grid-overlay" />
      </div>

      {/* Top bar */}
      <header className="bps-header">
        <a href="/build" className="bps-back">
          <span className="bps-back-arrow">←</span>
          <span className="bps-logo-mark">D8</span>
        </a>
        <div className="bps-title-group">
          <span className="bps-title-icon">{icon}</span>
          <h1 className="bps-title">{title}</h1>
        </div>
        <nav className="bps-nav-pills">
          {NAV_ITEMS.filter(n => n.label !== activePage).slice(0, 4).map(n => (
            <a key={n.label} href={n.href} className="bps-pill">{n.icon} {n.label}</a>
          ))}
        </nav>
      </header>

      {/* Main content */}
      <main className="bps-main">
        {children}
      </main>

      {/* Bottom dock */}
      <nav className="bps-dock">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`bps-dock-btn ${item.label === activePage ? "bps-dock-active" : ""}`}
            title={item.label}
          >
            <span className="bps-dock-icon">{item.icon}</span>
            <span className="bps-dock-label">{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

/* ━━━ Glass Card sub-component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bps-glass ${className}`}>{children}</div>;
}

export function StatusBadge({ label, status }: { label: string; status: "online" | "warning" | "error" | "pending" }) {
  const colors = { online: "#00FFB2", warning: "#FFB800", error: "#FF4D6A", pending: "#7B61FF" };
  return (
    <span className="bps-badge" style={{ "--badge-color": colors[status] } as React.CSSProperties}>
      <span className="bps-badge-dot" />
      {label}
    </span>
  );
}

export function MetricCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bps-metric" style={{ "--metric-color": color } as React.CSSProperties}>
      <div className="bps-metric-value">{value}</div>
      <div className="bps-metric-label">{label}</div>
      {sub && <div className="bps-metric-sub">{sub}</div>}
    </div>
  );
}

/* ━━━ Styles ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ShellStyles({ accent }: { accent: string }) {
  return (
    <style>{`
      /* ── Reset ── */
      .bps-root { position: relative; min-height: 100vh; background: #0A0E1A; color: #E0E6F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; overflow-x: hidden; }
      .bps-root *, .bps-root *::before, .bps-root *::after { box-sizing: border-box; }

      /* ── Animated Background ── */
      .bps-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
      .bps-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.15; }
      .bps-orb-1 { width: 600px; height: 600px; top: -100px; left: -150px; background: ${accent}; animation: bpsFloat1 20s ease-in-out infinite; }
      .bps-orb-2 { width: 500px; height: 500px; bottom: -80px; right: -120px; background: #7B61FF; animation: bpsFloat2 25s ease-in-out infinite; }
      .bps-orb-3 { width: 400px; height: 400px; top: 40%; left: 60%; background: #00FFB2; animation: bpsFloat3 18s ease-in-out infinite; opacity: 0.08; }
      .bps-grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px); background-size: 60px 60px; }

      @keyframes bpsFloat1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(60px,40px) scale(1.1); } }
      @keyframes bpsFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,-30px) scale(1.15); } }
      @keyframes bpsFloat3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-40px,50px); } }

      /* ── Header ── */
      .bps-header { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; gap: 16px; padding: 12px 24px; background: rgba(10,14,26,0.85); backdrop-filter: blur(20px) saturate(1.5); border-bottom: 1px solid rgba(0,212,255,0.12); }
      .bps-back { display: flex; align-items: center; gap: 8px; text-decoration: none; color: #8B9DC3; transition: color 0.2s; }
      .bps-back:hover { color: ${accent}; }
      .bps-back-arrow { font-size: 18px; }
      .bps-logo-mark { font-weight: 800; font-size: 18px; background: linear-gradient(135deg, #00D4FF, #7B61FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .bps-title-group { display: flex; align-items: center; gap: 10px; }
      .bps-title-icon { font-size: 22px; }
      .bps-title { font-size: 18px; font-weight: 700; margin: 0; background: linear-gradient(135deg, ${accent}, #E0E6F0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .bps-nav-pills { display: flex; gap: 6px; margin-left: auto; }
      .bps-pill { display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px; border-radius: 20px; background: rgba(255,255,255,0.05); color: #8B9DC3; text-decoration: none; font-size: 12px; font-weight: 500; border: 1px solid rgba(255,255,255,0.06); transition: all 0.25s; white-space: nowrap; }
      .bps-pill:hover { background: rgba(0,212,255,0.1); color: #00D4FF; border-color: rgba(0,212,255,0.25); transform: translateY(-1px); }

      /* ── Main content ── */
      .bps-main { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 32px 24px 120px; }

      /* ── Glass card ── */
      .bps-glass { position: relative; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; backdrop-filter: blur(12px); transition: all 0.3s; }
      .bps-glass::before { content: ''; position: absolute; inset: 0; border-radius: 16px; padding: 1px; background: linear-gradient(135deg, rgba(0,212,255,0.2), rgba(123,97,255,0.1), transparent); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; opacity: 0; transition: opacity 0.3s; }
      .bps-glass:hover::before { opacity: 1; }
      .bps-glass:hover { background: rgba(255,255,255,0.05); border-color: rgba(0,212,255,0.15); }

      /* ── Status badge ── */
      .bps-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: color-mix(in srgb, var(--badge-color) 12%, transparent); color: var(--badge-color); border: 1px solid color-mix(in srgb, var(--badge-color) 25%, transparent); }
      .bps-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--badge-color); box-shadow: 0 0 8px var(--badge-color); animation: bpsPulse 2s ease-in-out infinite; }
      @keyframes bpsPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

      /* ── Metric card ── */
      .bps-metric { text-align: center; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); }
      .bps-metric-value { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, var(--metric-color), #E0E6F0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .bps-metric-label { font-size: 12px; color: #8B9DC3; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
      .bps-metric-sub { font-size: 11px; color: #5A6B8A; margin-top: 2px; }

      /* ── Bottom dock ── */
      .bps-dock { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; padding: 8px 16px; background: rgba(10,14,26,0.9); backdrop-filter: blur(24px) saturate(1.5); border-radius: 20px; border: 1px solid rgba(0,212,255,0.12); z-index: 200; box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(0,212,255,0.08); }
      .bps-dock-btn { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 10px; border-radius: 12px; background: transparent; text-decoration: none; color: #5A6B8A; font-size: 10px; transition: all 0.25s; border: 1px solid transparent; }
      .bps-dock-btn:hover { background: rgba(0,212,255,0.08); color: #00D4FF; transform: translateY(-3px); border-color: rgba(0,212,255,0.15); }
      .bps-dock-active { background: rgba(0,212,255,0.12) !important; color: ${accent} !important; border-color: rgba(0,212,255,0.3) !important; box-shadow: 0 0 20px rgba(0,212,255,0.15); }
      .bps-dock-icon { font-size: 18px; }
      .bps-dock-label { font-weight: 600; letter-spacing: 0.02em; }

      /* ── Utility classes ── */
      .bps-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .bps-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      .bps-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
      .bps-section { margin-bottom: 32px; }
      .bps-section-title { font-size: 14px; font-weight: 700; color: #8B9DC3; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
      .bps-section-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(0,212,255,0.2), transparent); }
      .bps-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; border: none; cursor: pointer; transition: all 0.25s; text-transform: uppercase; letter-spacing: 0.05em; }
      .bps-btn-primary { background: linear-gradient(135deg, ${accent}, #7B61FF); color: #fff; box-shadow: 0 4px 20px rgba(0,212,255,0.25); }
      .bps-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 30px rgba(0,212,255,0.35); }
      .bps-btn-ghost { background: rgba(255,255,255,0.05); color: #8B9DC3; border: 1px solid rgba(255,255,255,0.1); }
      .bps-btn-ghost:hover { background: rgba(0,212,255,0.08); color: #00D4FF; border-color: rgba(0,212,255,0.25); }
      .bps-list-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s; }
      .bps-list-item:hover { background: rgba(0,212,255,0.04); border-color: rgba(0,212,255,0.12); }
      .bps-list-icon { font-size: 20px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: rgba(0,212,255,0.08); }
      .bps-list-content { flex: 1; }
      .bps-list-title { font-weight: 600; font-size: 14px; color: #E0E6F0; }
      .bps-list-sub { font-size: 12px; color: #5A6B8A; margin-top: 2px; }
      .bps-progress { width: 100%; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.06); overflow: hidden; }
      .bps-progress-bar { height: 100%; border-radius: 3px; background: linear-gradient(90deg, ${accent}, #7B61FF); transition: width 0.8s ease; }
      .bps-tag { display: inline-flex; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; background: rgba(0,212,255,0.1); color: #00D4FF; border: 1px solid rgba(0,212,255,0.2); }
      .bps-divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 20px 0; }
      .bps-empty { text-align: center; padding: 48px 20px; color: #5A6B8A; }
      .bps-empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.5; }
      .bps-empty-text { font-size: 14px; }
      .bps-text-glow { text-shadow: 0 0 20px color-mix(in srgb, ${accent} 40%, transparent); }

      /* ── Responsive ── */
      @media (max-width: 768px) {
        .bps-grid-2, .bps-grid-3, .bps-grid-4 { grid-template-columns: 1fr; }
        .bps-nav-pills { display: none; }
        .bps-header { padding: 10px 16px; }
        .bps-main { padding: 20px 16px 120px; }
        .bps-dock { gap: 2px; padding: 6px 10px; }
        .bps-dock-btn { padding: 6px 6px; }
        .bps-dock-label { display: none; }
      }
    `}</style>
  );
}
