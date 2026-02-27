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

  const paymentSuccess = searchParams?.get("payment") === "success";
  const newPlan = searchParams?.get("plan") ?? "";

  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [sites, setSites] = useState<SiteMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(paymentSuccess);
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

  useEffect(() => {
    if (paymentSuccess) {
      const t = setTimeout(() => {
        router.replace("/dashboard", { scroll: false });
      }, 6000);
      return () => clearTimeout(t);
    }
  }, [paymentSuccess, router]);

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
    free: "rgba(245,240,235,0.80)",
    starter: "#F0B35A",
    pro: "#E8715A",
    agency: "#9B8AFF",
    admin: "#4ADE80",
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
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #08070B; color: #F5F0EB; font-family: 'Outfit', 'Inter', system-ui, sans-serif; }
        .db-root { min-height: 100vh; background: #08070B; }
        .db-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); background: rgba(8,7,11,0.82); border-bottom: 1px solid rgba(245,240,235,0.08); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 56px; }
        .db-logo { font-size: 18px; font-weight: 800; color: #F5F0EB; text-decoration: none; letter-spacing: -0.03em; }
        .db-nav-links { display: flex; gap: 8px; align-items: center; }
        .db-nav-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(245,240,235,0.12); background: rgba(245,240,235,0.06); color: rgba(245,240,235,0.75); font-size: 13px; font-weight: 500; text-decoration: none; cursor: pointer; font-family: inherit; transition: all 120ms; }
        .db-nav-btn:hover { background: rgba(245,240,235,0.12); color: #F5F0EB; }
        .db-nav-btn--primary { background: rgba(240,179,90,0.12); border-color: rgba(240,179,90,0.35); color: #F0B35A; }
        .db-nav-btn--primary:hover { background: rgba(240,179,90,0.22); }
        .db-main { max-width: 960px; margin: 0 auto; padding: 88px 24px 80px; }
        .db-page-title { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 32px; color: #F5F0EB; }
        .db-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        @media (max-width: 640px) { .db-grid { grid-template-columns: 1fr; } }
        .db-card { background: rgba(245,240,235,0.035); border: 1px solid rgba(245,240,235,0.08); border-radius: 18px; padding: 24px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .db-card-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(245,240,235,0.30); margin-bottom: 10px; font-family: 'Inter', system-ui, sans-serif; }
        .db-card-value { font-size: 36px; font-weight: 800; letter-spacing: -0.03em; }
        .db-card-sub { font-size: 12px; color: rgba(245,240,235,0.30); margin-top: 4px; font-family: 'Inter', system-ui, sans-serif; }
        .db-progress-track { height: 6px; background: rgba(245,240,235,0.08); border-radius: 3px; margin: 12px 0 6px; overflow: hidden; }
        .db-progress-fill { height: 100%; border-radius: 3px; transition: width 400ms ease; }
        .db-actions { display: flex; flex-direction: column; gap: 10px; }
        .db-action-btn { display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: rgba(245,240,235,0.035); border: 1px solid rgba(245,240,235,0.08); border-radius: 14px; color: rgba(245,240,235,0.80); font-size: 14px; font-weight: 500; text-decoration: none; cursor: pointer; font-family: inherit; transition: all 130ms; text-align: left; width: 100%; }
        .db-action-btn:hover { background: rgba(245,240,235,0.07); border-color: rgba(245,240,235,0.16); color: #F5F0EB; }
        .db-action-icon { font-size: 18px; width: 32px; text-align: center; flex-shrink: 0; }
        .db-action-text { flex: 1; }
        .db-action-title { font-weight: 600; }
        .db-action-desc { font-size: 12px; color: rgba(245,240,235,0.30); margin-top: 1px; font-family: 'Inter', system-ui, sans-serif; }
        .db-spinner { width: 14px; height: 14px; border: 2px solid rgba(245,240,235,0.20); border-top-color: rgba(245,240,235,0.70); border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Banner ── */
        .db-banner { border-radius: 18px; border: 1px solid rgba(74,222,128,0.30); background: rgba(74,222,128,0.08); padding: 18px 22px; display: flex; align-items: center; gap: 16px; margin-bottom: 28px; animation: slideIn 300ms ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .db-banner-icon { font-size: 24px; flex-shrink: 0; }
        .db-banner-body { flex: 1; }
        .db-banner-title { font-size: 15px; font-weight: 700; color: #4ADE80; margin-bottom: 3px; }
        .db-banner-sub { font-size: 13px; color: rgba(245,240,235,0.55); font-family: 'Inter', system-ui, sans-serif; }
        .db-banner-close { background: none; border: none; color: rgba(245,240,235,0.30); font-size: 18px; cursor: pointer; padding: 4px; line-height: 1; }
        .db-banner-close:hover { color: rgba(245,240,235,0.60); }

        /* ── My Sites ── */
        .db-section-title { font-size: 16px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; color: #F5F0EB; }
        .db-section-count { font-size: 12px; font-weight: 500; color: rgba(245,240,235,0.30); padding: 2px 8px; border-radius: 6px; background: rgba(245,240,235,0.06); font-family: 'Inter', system-ui, sans-serif; }
        .db-sites-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; margin-bottom: 48px; }
        .db-site-card { background: rgba(245,240,235,0.035); border: 1px solid rgba(245,240,235,0.08); border-radius: 18px; overflow: hidden; transition: all 150ms; }
        .db-site-card:hover { border-color: rgba(245,240,235,0.16); background: rgba(245,240,235,0.055); }
        .db-site-preview { height: 140px; background: linear-gradient(135deg, rgba(240,179,90,0.08), rgba(232,113,90,0.08)); display: flex; align-items: center; justify-content: center; font-size: 32px; position: relative; overflow: hidden; }
        .db-site-preview-iframe { width: 100%; height: 100%; border: none; pointer-events: none; transform: scale(0.5); transform-origin: top left; width: 200%; height: 200%; }
        .db-site-body { padding: 14px 16px; }
        .db-site-title { font-size: 14px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #F5F0EB; }
        .db-site-meta { font-size: 11px; color: rgba(245,240,235,0.30); margin-bottom: 12px; font-family: 'Inter', system-ui, sans-serif; }
        .db-site-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .db-site-btn { padding: 5px 10px; border-radius: 8px; border: 1px solid rgba(245,240,235,0.12); background: rgba(245,240,235,0.05); color: rgba(245,240,235,0.65); font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; text-decoration: none; transition: all 120ms; display: inline-flex; align-items: center; gap: 4px; }
        .db-site-btn:hover { background: rgba(245,240,235,0.10); color: #F5F0EB; border-color: rgba(245,240,235,0.20); }
        .db-site-btn--amber { border-color: rgba(240,179,90,0.30); color: #F0B35A; background: rgba(240,179,90,0.07); }
        .db-site-btn--amber:hover { background: rgba(240,179,90,0.14); border-color: rgba(240,179,90,0.50); color: #F0B35A; }
        .db-site-btn--red { border-color: rgba(255,80,80,0.25); color: rgba(255,100,100,0.75); background: transparent; }
        .db-site-btn--red:hover { background: rgba(255,80,80,0.10); color: rgba(255,120,120,0.95); }
        .db-site-slug { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.20); color: rgba(74,222,128,0.80); font-size: 10px; font-weight: 600; margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; }
        .db-empty { text-align: center; padding: 48px 24px; border: 1px dashed rgba(245,240,235,0.10); border-radius: 18px; margin-bottom: 48px; }
        .db-empty-icon { font-size: 40px; margin-bottom: 12px; }
        .db-empty-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; color: #F5F0EB; }
        .db-empty-sub { font-size: 14px; color: rgba(245,240,235,0.40); margin-bottom: 20px; font-family: 'Inter', system-ui, sans-serif; }

        /* ── Deploy modal ── */
        .db-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.70); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .db-modal { background: #0F0D15; border: 1px solid rgba(245,240,235,0.12); border-radius: 22px; padding: 32px; width: 100%; max-width: 440px; }
        .db-modal-title { font-size: 20px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 8px; color: #F5F0EB; }
        .db-modal-sub { font-size: 14px; color: rgba(245,240,235,0.45); margin-bottom: 24px; line-height: 1.5; font-family: 'Inter', system-ui, sans-serif; }
        .db-modal-label { font-size: 12px; font-weight: 600; color: rgba(245,240,235,0.50); margin-bottom: 8px; letter-spacing: 0.04em; text-transform: uppercase; font-family: 'Inter', system-ui, sans-serif; }
        .db-modal-input-row { display: flex; align-items: center; gap: 0; border: 1px solid rgba(240,179,90,0.35); border-radius: 12px; overflow: hidden; margin-bottom: 20px; background: rgba(245,240,235,0.035); }
        .db-modal-input { flex: 1; padding: 12px 14px; background: transparent; border: none; color: #F5F0EB; font-size: 15px; font-family: inherit; outline: none; }
        .db-modal-suffix { padding: 12px 14px; color: rgba(245,240,235,0.35); font-size: 13px; white-space: nowrap; border-left: 1px solid rgba(245,240,235,0.08); font-family: 'JetBrains Mono', monospace; }
        .db-modal-actions { display: flex; gap: 10px; }
        .db-modal-btn { flex: 1; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 130ms; border: 1px solid; }
        .db-modal-btn--primary { background: linear-gradient(135deg, #F0B35A, #E8A040); border-color: rgba(240,179,90,0.50); color: #0F0D15; }
        .db-modal-btn--primary:hover { background: linear-gradient(135deg, #F5C06A, #F0B35A); box-shadow: 0 0 20px rgba(240,179,90,0.20); }
        .db-modal-btn--ghost { background: transparent; border-color: rgba(245,240,235,0.12); color: rgba(245,240,235,0.55); }
        .db-modal-btn--ghost:hover { background: rgba(245,240,235,0.06); color: rgba(245,240,235,0.80); }
        .db-modal-btn:disabled { opacity: 0.4; cursor: default; }
        .db-modal-success { text-align: center; padding: 8px 0; }
        .db-modal-success-icon { font-size: 40px; margin-bottom: 12px; }
        .db-modal-success-title { font-size: 18px; font-weight: 800; margin-bottom: 8px; color: #F5F0EB; }
        .db-modal-success-url { display: inline-block; padding: 10px 16px; border-radius: 10px; background: rgba(74,222,128,0.10); border: 1px solid rgba(74,222,128,0.25); color: rgba(74,222,128,0.90); font-size: 14px; font-weight: 600; text-decoration: none; word-break: break-all; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; }

        /* ── Delete confirm ── */
        .db-delete-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.60); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .db-delete-box { background: #0F0D15; border: 1px solid rgba(255,80,80,0.25); border-radius: 18px; padding: 28px; max-width: 360px; width: 100%; text-align: center; }
        .db-delete-title { font-size: 18px; font-weight: 800; margin-bottom: 8px; color: #F5F0EB; }
        .db-delete-sub { font-size: 14px; color: rgba(245,240,235,0.45); margin-bottom: 24px; font-family: 'Inter', system-ui, sans-serif; }
        .db-delete-actions { display: flex; gap: 10px; }
        .db-delete-btn-cancel { flex: 1; padding: 11px; border-radius: 12px; background: transparent; border: 1px solid rgba(245,240,235,0.12); color: rgba(245,240,235,0.65); font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .db-delete-btn-delete { flex: 1; padding: 11px; border-radius: 12px; background: rgba(255,80,80,0.15); border: 1px solid rgba(255,80,80,0.35); color: rgba(255,100,100,0.95); font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; }
      `}</style>

      <div className="db-root">
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
                  <Link href="/build" style={{ color: "#F0B35A", textDecoration: "underline" }}>
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
                    <div className="db-card-value" style={{ color: "#4ADE80" }}>∞</div>
                  ) : (
                    <>
                      <div className="db-card-value" style={{ color: total > 10 ? "#4ADE80" : total > 0 ? "#F0B35A" : "#E8715A" }}>
                        {total}
                      </div>
                      <div className="db-progress-track">
                        <div className="db-progress-fill" style={{ width: `${100 - usagePct}%`, background: total > 10 ? "#4ADE80" : "#F0B35A" }} />
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
                      <div className="db-progress-fill" style={{ width: `${usagePct}%`, background: usagePct > 80 ? "#E8715A" : "#4ADE80" }} />
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
                    <Link href="/video" className="db-action-btn" style={{ borderColor: "rgba(232,113,90,0.25)", background: "rgba(232,113,90,0.05)" }}>
                      <span className="db-action-icon">🎵</span>
                      <div className="db-action-text">
                        <div className="db-action-title" style={{ color: "#E8715A" }}>AI Video Generator</div>
                        <div className="db-action-desc">Create TikTok &amp; Reels scripts for your site</div>
                      </div>
                    </Link>
                    {!creditInfo?.admin && plan === "free" && (
                      <Link href="/pricing" className="db-action-btn" style={{ borderColor: "rgba(240,179,90,0.25)", background: "rgba(240,179,90,0.06)" }}>
                        <span className="db-action-icon">🚀</span>
                        <div className="db-action-text">
                          <div className="db-action-title" style={{ color: "#F0B35A" }}>Upgrade your plan</div>
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
                      <Link href="/admin" className="db-action-btn" style={{ borderColor: "rgba(74,222,128,0.25)", background: "rgba(74,222,128,0.06)" }}>
                        <span className="db-action-icon">⚙️</span>
                        <div className="db-action-text">
                          <div className="db-action-title" style={{ color: "#4ADE80" }}>Admin panel</div>
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
                  <strong style={{ color: "#F0B35A" }}>{deploySlug || "your-slug"}.dominat8.io</strong>
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
      <div style={{ background: "#08070B", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(245,240,235,0.40)", fontFamily: "'Outfit', system-ui, sans-serif" }}>
        Loading…
      </div>
    }>
      <DashboardInner />
    </Suspense>
  );
}
