"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────────

interface CreditInfo {
  admin: boolean;
  balance: {
    plan: string;
    monthlyAllowance: number;
    monthlyUsed: number;
    monthlyRemaining: number;
    purchased: number;
    total: number;
  };
}

interface SiteMeta {
  id: string;
  title: string;
  prompt: string;
  industry: string;
  vibe: string;
  slug: string | null;
  blobUrl: string;
  createdAt: string;
}

// ── Inner component (needs useSearchParams) ─────────────────────────────────

function DashboardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentParam = searchParams?.get("payment") === "success";
  const newPlan = searchParams?.get("plan") ?? "";
  const sessionId = searchParams?.get("session_id") ?? "";

  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [sites, setSites] = useState<SiteMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [deployModal, setDeployModal] = useState<SiteMeta | null>(null);
  const [deploySlug, setDeploySlug] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{ url: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/io/agents/credits")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.balance) setCreditInfo(d as CreditInfo); })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/sites")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.sites) setSites(d.sites as SiteMeta[]); })
      .catch(() => {})
      .finally(() => setSitesLoading(false));
  }, []);

  // Verify payment server-side before showing success banner
  useEffect(() => {
    if (!paymentParam || !sessionId) return;
    let cancelled = false;
    fetch(`/api/stripe/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data?.verified) {
          setShowBanner(true);
          // Clear URL params after verification
          const t = setTimeout(() => {
            router.replace("/dashboard", { scroll: false });
          }, 6000);
          return () => clearTimeout(t);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [paymentParam, sessionId, router]);

  async function openBillingPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally { setPortalLoading(false); }
  }

  const deleteSite = useCallback(async (id: string) => {
    const res = await fetch(`/api/sites?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setSites(prev => prev.filter(s => s.id !== id));
      setDeleteConfirm(null);
    }
  }, []);

  async function deploySite() {
    if (!deployModal || !deploySlug.trim()) return;
    setDeploying(true);
    try {
      const res = await fetch("/api/sites/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: deployModal.id, slug: deploySlug.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setDeployResult({ url: data.url });
        setSites(prev => prev.map(s => s.id === deployModal.id ? { ...s, slug: data.slug } : s));
      } else {
        alert(data.error ?? "Deploy failed");
      }
    } finally {
      setDeploying(false);
    }
  }

  const plan = creditInfo?.balance.plan ?? "free";
  const total = creditInfo?.balance.total ?? 0;
  const monthlyUsed = creditInfo?.balance.monthlyUsed ?? 0;
  const monthlyAllowance = creditInfo?.balance.monthlyAllowance ?? 5;
  const usagePct = Math.min(100, Math.round((monthlyUsed / Math.max(monthlyAllowance, 1)) * 100));

  const PLAN_COLORS: Record<string, string> = {
    free: "rgba(200,220,255,0.80)",
    starter: "#00D4FF",
    pro: "#0066FF",
    agency: "#7B61FF",
    admin: "#00FFB2",
  };

  const PLAN_LABELS: Record<string, string> = {
    starter: "Starter",
    pro: "Pro",
    agency: "Agency",
  };

  const canDeploy = plan === "pro" || plan === "agency" || !!creditInfo?.admin;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #030712; color: #E8F0FF; font-family: 'Outfit', 'Inter', system-ui, sans-serif; }
        @keyframes dbFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .db-root { min-height: 100vh; background: #030712; position: relative; overflow: hidden; }
        .db-root::before { content: ''; position: fixed; inset: 0; background-image: linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px); background-size: 60px 60px; -webkit-mask: radial-gradient(ellipse 60% 40% at 50% 30%, black 20%, transparent 70%); mask: radial-gradient(ellipse 60% 40% at 50% 30%, black 20%, transparent 70%); pointer-events: none; z-index: 0; }
        .db-mesh { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .db-mesh-1 { position: absolute; width: 700px; height: 500px; top: -200px; left: -150px; border-radius: 50%; background: radial-gradient(ellipse, rgba(0,212,255,0.14), transparent 65%); filter: blur(80px); animation: dbFloat 14s ease-in-out infinite; }
        .db-mesh-2 { position: absolute; width: 500px; height: 400px; bottom: -150px; right: -100px; border-radius: 50%; background: radial-gradient(ellipse, rgba(123,97,255,0.10), transparent 65%); filter: blur(80px); animation: dbFloat 18s ease-in-out infinite reverse; }
        .db-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); background: rgba(3,7,18,0.85); border-bottom: 1px solid rgba(100,180,255,0.10); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 56px; }
        .db-logo { font-size: 18px; font-weight: 800; color: #E8F0FF; text-decoration: none; letter-spacing: -0.03em; }
        .db-nav-links { display: flex; gap: 8px; align-items: center; }
        .db-nav-btn { padding: 7px 16px; border-radius: 10px; border: 1px solid rgba(100,180,255,0.12); background: rgba(100,180,255,0.06); color: rgba(200,220,255,0.75); font-size: 13px; font-weight: 500; text-decoration: none; cursor: pointer; font-family: inherit; transition: all 150ms; }
        .db-nav-btn:hover { background: rgba(100,180,255,0.12); color: #E8F0FF; transform: translateY(-1px); }
        .db-nav-btn--primary { background: rgba(0,212,255,0.12); border-color: rgba(0,212,255,0.40); color: #00D4FF; }
        .db-nav-btn--primary:hover { background: rgba(0,212,255,0.22); box-shadow: 0 0 16px rgba(0,212,255,0.12); }
        .db-main { max-width: 960px; margin: 0 auto; padding: 88px 24px 80px; position: relative; z-index: 1; }
        .db-page-title { font-size: 32px; font-weight: 900; letter-spacing: -0.04em; margin-bottom: 32px; background: linear-gradient(135deg, #E8F0FF 30%, #00D4FF 80%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .db-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        @media (max-width: 640px) { .db-grid { grid-template-columns: 1fr; } }
        .db-card { background: rgba(100,180,255,0.03); border: 1px solid rgba(100,180,255,0.10); border-radius: 20px; padding: 26px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: all 200ms; position: relative; overflow: hidden; }
        .db-card::before { content: ''; position: absolute; inset: 0; border-radius: 20px; padding: 1px; background: linear-gradient(135deg, rgba(0,212,255,0.18), rgba(100,180,255,0.06)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0; transition: opacity 200ms; pointer-events: none; }
        .db-card:hover { background: rgba(100,180,255,0.05); border-color: rgba(100,180,255,0.14); transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.20); }
        .db-card:hover::before { opacity: 1; }
        .db-card-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(0,212,255,0.50); margin-bottom: 10px; font-family: 'JetBrains Mono', monospace; }
        .db-card-value { font-size: 38px; font-weight: 900; letter-spacing: -0.03em; }
        .db-card-sub { font-size: 12px; color: rgba(200,220,255,0.35); margin-top: 4px; font-family: 'Inter', system-ui, sans-serif; }
        .db-progress-track { height: 7px; background: rgba(100,180,255,0.08); border-radius: 4px; margin: 12px 0 6px; overflow: hidden; }
        .db-progress-fill { height: 100%; border-radius: 4px; transition: width 400ms ease; box-shadow: 0 0 8px rgba(0,212,255,0.25); }
        .db-actions { display: flex; flex-direction: column; gap: 10px; }
        .db-action-btn { display: flex; align-items: center; gap: 12px; padding: 16px 20px; background: rgba(100,180,255,0.025); border: 1px solid rgba(100,180,255,0.10); border-radius: 14px; color: rgba(200,220,255,0.80); font-size: 14px; font-weight: 500; text-decoration: none; cursor: pointer; font-family: inherit; transition: all 180ms; text-align: left; width: 100%; }
        .db-action-btn:hover { background: rgba(100,180,255,0.07); border-color: rgba(100,180,255,0.20); color: #E8F0FF; transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.15); }
        .db-action-icon { font-size: 20px; width: 36px; text-align: center; flex-shrink: 0; }
        .db-action-text { flex: 1; }
        .db-action-title { font-weight: 700; }
        .db-action-desc { font-size: 12px; color: rgba(200,220,255,0.35); margin-top: 2px; font-family: 'Inter', system-ui, sans-serif; }
        .db-spinner { width: 14px; height: 14px; border: 2px solid rgba(100,180,255,0.20); border-top-color: #00D4FF; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Banner ── */
        .db-banner { border-radius: 18px; border: 1px solid rgba(0,255,178,0.35); background: rgba(0,255,178,0.08); padding: 20px 24px; display: flex; align-items: center; gap: 16px; margin-bottom: 28px; animation: slideIn 300ms ease; box-shadow: 0 0 24px rgba(0,255,178,0.08); }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .db-banner-icon { font-size: 28px; flex-shrink: 0; }
        .db-banner-body { flex: 1; }
        .db-banner-title { font-size: 16px; font-weight: 800; color: #00FFB2; margin-bottom: 3px; text-shadow: 0 0 8px rgba(0,255,178,0.20); }
        .db-banner-sub { font-size: 13px; color: rgba(200,220,255,0.60); font-family: 'Inter', system-ui, sans-serif; }
        .db-banner-close { background: none; border: none; color: rgba(200,220,255,0.35); font-size: 18px; cursor: pointer; padding: 4px; line-height: 1; }
        .db-banner-close:hover { color: rgba(200,220,255,0.70); }

        /* ── My Sites ── */
        .db-section-title { font-size: 18px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #E8F0FF, #00D4FF); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .db-section-count { font-size: 12px; font-weight: 600; color: #00D4FF; padding: 3px 10px; border-radius: 8px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.18); font-family: 'JetBrains Mono', monospace; -webkit-text-fill-color: #00D4FF; }
        .db-sites-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; margin-bottom: 48px; }
        .db-site-card { background: rgba(100,180,255,0.03); border: 1px solid rgba(100,180,255,0.10); border-radius: 20px; overflow: hidden; transition: all 200ms; position: relative; }
        .db-site-card::before { content: ''; position: absolute; inset: 0; border-radius: 20px; padding: 1px; background: linear-gradient(135deg, rgba(0,212,255,0.22), rgba(0,102,255,0.12), rgba(0,255,178,0.08)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0; transition: opacity 200ms; pointer-events: none; z-index: 1; }
        .db-site-card:hover { border-color: rgba(0,212,255,0.18); background: rgba(100,180,255,0.05); transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.25), 0 0 30px rgba(0,212,255,0.05); }
        .db-site-card:hover::before { opacity: 1; }
        .db-site-preview { height: 140px; background: linear-gradient(135deg, rgba(0,212,255,0.10), rgba(0,102,255,0.10)); display: flex; align-items: center; justify-content: center; font-size: 36px; position: relative; overflow: hidden; }
        .db-site-preview-iframe { width: 100%; height: 100%; border: none; pointer-events: none; transform: scale(0.5); transform-origin: top left; width: 200%; height: 200%; }
        .db-site-body { padding: 16px 18px; }
        .db-site-title { font-size: 15px; font-weight: 800; letter-spacing: -0.01em; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #E8F0FF; }
        .db-site-meta { font-size: 11px; color: rgba(200,220,255,0.35); margin-bottom: 12px; font-family: 'Inter', system-ui, sans-serif; }
        .db-site-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .db-site-btn { padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(100,180,255,0.12); background: rgba(100,180,255,0.05); color: rgba(200,220,255,0.70); font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; text-decoration: none; transition: all 150ms; display: inline-flex; align-items: center; gap: 4px; }
        .db-site-btn:hover { background: rgba(100,180,255,0.12); color: #E8F0FF; border-color: rgba(100,180,255,0.25); transform: translateY(-1px); }
        .db-site-btn--amber { border-color: rgba(0,212,255,0.35); color: #00D4FF; background: rgba(0,212,255,0.08); }
        .db-site-btn--amber:hover { background: rgba(0,212,255,0.16); border-color: rgba(0,212,255,0.55); color: #00D4FF; box-shadow: 0 0 12px rgba(0,212,255,0.10); }
        .db-site-btn--red { border-color: rgba(255,71,87,0.25); color: rgba(255,100,100,0.80); background: transparent; }
        .db-site-btn--red:hover { background: rgba(255,71,87,0.12); color: rgba(255,120,120,0.95); }
        .db-site-slug { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 8px; background: rgba(0,255,178,0.08); border: 1px solid rgba(0,255,178,0.25); color: #00FFB2; font-size: 10px; font-weight: 600; margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; text-shadow: 0 0 6px rgba(0,255,178,0.20); }
        .db-empty { text-align: center; padding: 56px 24px; border: 1px dashed rgba(0,212,255,0.14); border-radius: 20px; margin-bottom: 48px; background: rgba(0,212,255,0.02); }
        .db-empty-icon { font-size: 44px; margin-bottom: 14px; }
        .db-empty-title { font-size: 18px; font-weight: 800; margin-bottom: 8px; color: #E8F0FF; }
        .db-empty-sub { font-size: 15px; color: rgba(200,220,255,0.45); margin-bottom: 22px; font-family: 'Inter', system-ui, sans-serif; }

        /* ── Deploy modal ── */
        .db-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .db-modal { background: #0a1628; border: 1px solid rgba(0,212,255,0.15); border-radius: 24px; padding: 34px; width: 100%; max-width: 440px; box-shadow: 0 0 60px rgba(0,0,0,0.40), 0 0 30px rgba(0,212,255,0.06); }
        .db-modal-title { font-size: 22px; font-weight: 900; letter-spacing: -0.03em; margin-bottom: 8px; color: #E8F0FF; }
        .db-modal-sub { font-size: 14px; color: rgba(200,220,255,0.50); margin-bottom: 24px; line-height: 1.5; font-family: 'Inter', system-ui, sans-serif; }
        .db-modal-label { font-size: 12px; font-weight: 700; color: rgba(0,212,255,0.55); margin-bottom: 8px; letter-spacing: 0.06em; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; }
        .db-modal-input-row { display: flex; align-items: center; gap: 0; border: 1px solid rgba(0,212,255,0.40); border-radius: 14px; overflow: hidden; margin-bottom: 22px; background: rgba(0,212,255,0.04); transition: border-color 200ms; }
        .db-modal-input-row:focus-within { border-color: rgba(0,212,255,0.60); box-shadow: 0 0 20px rgba(0,212,255,0.10); }
        .db-modal-input { flex: 1; padding: 14px 16px; background: transparent; border: none; color: #E8F0FF; font-size: 15px; font-family: inherit; outline: none; }
        .db-modal-suffix { padding: 14px 16px; color: rgba(200,220,255,0.40); font-size: 13px; white-space: nowrap; border-left: 1px solid rgba(100,180,255,0.08); font-family: 'JetBrains Mono', monospace; }
        .db-modal-actions { display: flex; gap: 10px; }
        .db-modal-btn { flex: 1; padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 180ms; border: 1px solid; }
        .db-modal-btn--primary { background: linear-gradient(135deg, #00D4FF, #0066FF); border-color: rgba(0,212,255,0.50); color: #030712; }
        .db-modal-btn--primary:hover { background: linear-gradient(135deg, #1ADCFF, #1A7AFF); box-shadow: 0 0 28px rgba(0,212,255,0.25); transform: translateY(-1px); }
        .db-modal-btn--ghost { background: transparent; border-color: rgba(100,180,255,0.12); color: rgba(200,220,255,0.60); }
        .db-modal-btn--ghost:hover { background: rgba(100,180,255,0.06); color: rgba(200,220,255,0.85); }
        .db-modal-btn:disabled { opacity: 0.35; cursor: default; }
        .db-modal-success { text-align: center; padding: 8px 0; }
        .db-modal-success-icon { font-size: 44px; margin-bottom: 14px; }
        .db-modal-success-title { font-size: 20px; font-weight: 900; margin-bottom: 10px; color: #E8F0FF; }
        .db-modal-success-url { display: inline-block; padding: 12px 18px; border-radius: 12px; background: rgba(0,255,178,0.10); border: 1px solid rgba(0,255,178,0.30); color: #00FFB2; font-size: 14px; font-weight: 600; text-decoration: none; word-break: break-all; margin-bottom: 22px; font-family: 'JetBrains Mono', monospace; text-shadow: 0 0 6px rgba(0,255,178,0.20); }

        /* ── Delete confirm ── */
        .db-delete-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .db-delete-box { background: #0a1628; border: 1px solid rgba(255,71,87,0.30); border-radius: 20px; padding: 30px; max-width: 380px; width: 100%; text-align: center; box-shadow: 0 0 40px rgba(0,0,0,0.30); }
        .db-delete-title { font-size: 20px; font-weight: 900; margin-bottom: 8px; color: #E8F0FF; }
        .db-delete-sub { font-size: 14px; color: rgba(200,220,255,0.50); margin-bottom: 24px; font-family: 'Inter', system-ui, sans-serif; }
        .db-delete-actions { display: flex; gap: 10px; }
        .db-delete-btn-cancel { flex: 1; padding: 12px; border-radius: 12px; background: transparent; border: 1px solid rgba(100,180,255,0.12); color: rgba(200,220,255,0.65); font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 150ms; }
        .db-delete-btn-cancel:hover { background: rgba(100,180,255,0.06); color: rgba(200,220,255,0.85); }
        .db-delete-btn-delete { flex: 1; padding: 12px; border-radius: 12px; background: rgba(255,71,87,0.18); border: 1px solid rgba(255,71,87,0.40); color: rgba(255,100,100,0.95); font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 150ms; }
        .db-delete-btn-delete:hover { background: rgba(255,71,87,0.28); box-shadow: 0 0 16px rgba(255,71,87,0.12); }
      `}</style>

      <div className="db-root">
        <div className="db-mesh"><div className="db-mesh-1" /><div className="db-mesh-2" /></div>
        <nav className="db-nav">
          <Link href="/" className="db-logo">Dominat8.io</Link>
          <div className="db-nav-links">
            <Link href="/build" className="db-nav-btn db-nav-btn--primary">⚡ Builder</Link>
            <Link href="/video" className="db-nav-btn">🎵 Video</Link>
            <Link href="/pricing" className="db-nav-btn">Pricing</Link>
          </div>
        </nav>

        <main className="db-main">
          <div className="db-page-title">Dashboard</div>

          {/* Payment success banner */}
          {showBanner && (
            <div className="db-banner">
              <span className="db-banner-icon">🎉</span>
              <div className="db-banner-body">
                <div className="db-banner-title">
                  {newPlan ? `${PLAN_LABELS[newPlan] ?? newPlan} plan activated!` : "Payment successful!"}
                </div>
                <div className="db-banner-sub">
                  Your credits and plan access have been updated.{" "}
                  <Link href="/build" style={{ color: "#00D4FF", textDecoration: "underline" }}>
                    Start building →
                  </Link>
                </div>
              </div>
              <button className="db-banner-close" onClick={() => setShowBanner(false)}>×</button>
            </div>
          )}

          {loading ? (
            <div style={{ color: "rgba(245,240,235,0.40)", fontSize: 14, marginBottom: 32, fontFamily: "'Inter', system-ui, sans-serif" }}>Loading your account…</div>
          ) : (
            <>
              <div className="db-grid">
                {/* Plan card */}
                <div className="db-card">
                  <div className="db-card-label">Current plan</div>
                  <div className="db-card-value" style={{ color: PLAN_COLORS[plan] ?? "rgba(245,240,235,0.80)", textTransform: "capitalize" }}>
                    {creditInfo?.admin ? "Admin" : plan}
                  </div>
                  {!creditInfo?.admin && (
                    <div className="db-card-sub">
                      {plan === "free" ? "Upgrade to unlock more agents and credits" : "Active subscription"}
                    </div>
                  )}
                </div>

                {/* Credits card */}
                <div className="db-card">
                  <div className="db-card-label">Agent credits</div>
                  {creditInfo?.admin ? (
                    <div className="db-card-value" style={{ color: "#00FFB2" }}>∞</div>
                  ) : (
                    <>
                      <div className="db-card-value" style={{ color: total > 10 ? "#00FFB2" : total > 0 ? "#00D4FF" : "#FF4757" }}>
                        {total}
                      </div>
                      <div className="db-progress-track">
                        <div className="db-progress-fill" style={{ width: `${100 - usagePct}%`, background: total > 10 ? "#00FFB2" : "#00D4FF" }} />
                      </div>
                      <div className="db-card-sub">
                        {creditInfo?.balance.monthlyRemaining ?? 0} monthly + {creditInfo?.balance.purchased ?? 0} purchased
                      </div>
                    </>
                  )}
                </div>

                {/* Monthly usage */}
                {!creditInfo?.admin && (
                  <div className="db-card">
                    <div className="db-card-label">Monthly agent usage</div>
                    <div className="db-card-value" style={{ fontSize: 28 }}>
                      {monthlyUsed} <span style={{ fontSize: 16, color: "rgba(245,240,235,0.40)", fontWeight: 400 }}>/ {monthlyAllowance}</span>
                    </div>
                    <div className="db-progress-track">
                      <div className="db-progress-fill" style={{ width: `${usagePct}%`, background: usagePct > 80 ? "#FF4757" : "#00FFB2" }} />
                    </div>
                    <div className="db-card-sub">Resets on the 1st of next month</div>
                  </div>
                )}

                {/* Quick actions */}
                <div className="db-card" style={{ gridColumn: creditInfo?.admin ? "1 / -1" : undefined }}>
                  <div className="db-card-label">Quick actions</div>
                  <div className="db-actions" style={{ marginTop: 8 }}>
                    <Link href="/build" className="db-action-btn">
                      <span className="db-action-icon">⚡</span>
                      <div className="db-action-text">
                        <div className="db-action-title">Open Builder</div>
                        <div className="db-action-desc">Generate a new AI website</div>
                      </div>
                    </Link>
                    <Link href="/video" className="db-action-btn" style={{ borderColor: "rgba(123,97,255,0.25)", background: "rgba(123,97,255,0.05)" }}>
                      <span className="db-action-icon">🎵</span>
                      <div className="db-action-text">
                        <div className="db-action-title" style={{ color: "#7B61FF" }}>AI Video Generator</div>
                        <div className="db-action-desc">Create TikTok &amp; Reels scripts for your site</div>
                      </div>
                    </Link>
                    {!creditInfo?.admin && plan === "free" && (
                      <Link href="/pricing" className="db-action-btn" style={{ borderColor: "rgba(0,212,255,0.25)", background: "rgba(0,212,255,0.06)" }}>
                        <span className="db-action-icon">🚀</span>
                        <div className="db-action-text">
                          <div className="db-action-title" style={{ color: "#00D4FF" }}>Upgrade your plan</div>
                          <div className="db-action-desc">Unlock agents, credits, and deployment</div>
                        </div>
                      </Link>
                    )}
                    {!creditInfo?.admin && plan !== "free" && (
                      <button onClick={openBillingPortal} disabled={portalLoading} className="db-action-btn">
                        <span className="db-action-icon">{portalLoading ? "" : "💳"}</span>
                        {portalLoading && <div className="db-spinner" />}
                        <div className="db-action-text">
                          <div className="db-action-title">Manage billing</div>
                          <div className="db-action-desc">View invoices, update payment method, cancel</div>
                        </div>
                      </button>
                    )}
                    {creditInfo?.admin && (
                      <Link href="/admin" className="db-action-btn" style={{ borderColor: "rgba(0,255,178,0.25)", background: "rgba(0,255,178,0.06)" }}>
                        <span className="db-action-icon">⚙️</span>
                        <div className="db-action-text">
                          <div className="db-action-title" style={{ color: "#00FFB2" }}>Admin panel</div>
                          <div className="db-action-desc">Manage users, credits, plans</div>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── My Sites ── */}
          <div className="db-section-title">
            My Sites
            {sites.length > 0 && (
              <span className="db-section-count">{sites.length}</span>
            )}
          </div>

          {sitesLoading ? (
            <div style={{ color: "rgba(245,240,235,0.30)", fontSize: 14, marginBottom: 48, fontFamily: "'Inter', system-ui, sans-serif" }}>Loading sites…</div>
          ) : sites.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon">🏗️</div>
              <div className="db-empty-title">No sites yet</div>
              <div className="db-empty-sub">Generate your first AI website — it saves automatically.</div>
              <Link href="/build" className="db-action-btn" style={{ display: "inline-flex", width: "auto" }}>
                <span>⚡</span> Open Builder
              </Link>
            </div>
          ) : (
            <div className="db-sites-grid">
              {sites.map(site => (
                <div key={site.id} className="db-site-card">
                  <div className="db-site-preview">
                    {site.industry ? (
                      <span style={{ fontSize: 36 }}>
                        {({ Restaurant:"🍽️", "Law Firm":"⚖️", SaaS:"⚡", "Real Estate":"🏠", Fitness:"💪", "E-commerce":"🛍️", Portfolio:"✦", Agency:"🚀", Medical:"🏥", Education:"🎓", Photography:"📸", Consulting:"🧠", Technology:"💻", Finance:"📈", Travel:"✈️", Beauty:"💅", Nonprofit:"❤️" } as Record<string,string>)[site.industry] ?? "🌐"}
                      </span>
                    ) : "🌐"}
                  </div>
                  <div className="db-site-body">
                    <div className="db-site-title">{site.title || "Untitled Site"}</div>
                    {site.slug && (
                      <div className="db-site-slug">
                        🟢 {site.slug}.dominat8.io
                      </div>
                    )}
                    <div className="db-site-meta">
                      {site.industry && `${site.industry} · `}
                      {site.vibe && `${site.vibe} · `}
                      {new Date(site.createdAt).toLocaleDateString()}
                    </div>
                    <div className="db-site-actions">
                      <a
                        href={`/s/${site.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="db-site-btn db-site-btn--amber"
                      >
                        👁 View
                      </a>
                      <a
                        href={`/s/${site.id}`}
                        onClick={e => {
                          e.preventDefault();
                          navigator.clipboard.writeText(`${window.location.origin}/s/${site.id}`);
                        }}
                        className="db-site-btn"
                      >
                        🔗 Copy link
                      </a>
                      {canDeploy ? (
                        <button
                          className="db-site-btn db-site-btn--amber"
                          onClick={() => {
                            setDeployModal(site);
                            setDeploySlug(site.slug ?? site.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30));
                            setDeployResult(null);
                          }}
                        >
                          🚀 Deploy
                        </button>
                      ) : (
                        <Link href="/pricing" className="db-site-btn" title="Pro plan required">
                          🔒 Deploy
                        </Link>
                      )}
                      <button
                        className="db-site-btn db-site-btn--red"
                        onClick={() => setDeleteConfirm(site.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Deploy modal ── */}
      {deployModal && (
        <div className="db-modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setDeployModal(null); setDeployResult(null); } }}>
          <div className="db-modal">
            {deployResult ? (
              <div className="db-modal-success">
                <div className="db-modal-success-icon">🎉</div>
                <div className="db-modal-success-title">Site is live!</div>
                <a href={deployResult.url} target="_blank" rel="noopener noreferrer" className="db-modal-success-url">
                  {deployResult.url}
                </a>
                <div className="db-modal-actions">
                  <button className="db-modal-btn db-modal-btn--ghost" onClick={() => { setDeployModal(null); setDeployResult(null); }}>Close</button>
                  <a href={deployResult.url} target="_blank" rel="noopener noreferrer" className="db-modal-btn db-modal-btn--primary" style={{ textAlign: "center", display: "block" }}>
                    Open site →
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="db-modal-title">Deploy to subdomain</div>
                <div className="db-modal-sub">
                  Choose a slug for your site. It will be live at<br />
                  <strong style={{ color: "#00D4FF" }}>{deploySlug || "your-slug"}.dominat8.io</strong>
                </div>
                <div className="db-modal-label">Slug</div>
                <div className="db-modal-input-row">
                  <input
                    className="db-modal-input"
                    value={deploySlug}
                    onChange={e => setDeploySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="my-business"
                    autoFocus
                  />
                  <span className="db-modal-suffix">.dominat8.io</span>
                </div>
                <div className="db-modal-actions">
                  <button className="db-modal-btn db-modal-btn--ghost" onClick={() => setDeployModal(null)}>Cancel</button>
                  <button
                    className="db-modal-btn db-modal-btn--primary"
                    onClick={deploySite}
                    disabled={deploying || deploySlug.length < 3}
                  >
                    {deploying ? "Deploying…" : "Deploy →"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteConfirm && (
        <div className="db-delete-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
          <div className="db-delete-box">
            <div className="db-delete-title">Delete this site?</div>
            <div className="db-delete-sub">This can&apos;t be undone. The share link will stop working.</div>
            <div className="db-delete-actions">
              <button className="db-delete-btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="db-delete-btn-delete" onClick={() => deleteSite(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "#030712", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(200,220,255,0.40)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
        Loading…
      </div>
    }>
      <DashboardInner />
    </Suspense>
  );
}
