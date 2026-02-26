"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

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

// ── Dashboard page ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/io/agents/credits")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.balance) setCreditInfo(d as CreditInfo); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function openBillingPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally { setPortalLoading(false); }
  }

  const plan = creditInfo?.balance.plan ?? "free";
  const total = creditInfo?.balance.total ?? 0;
  const monthlyUsed = creditInfo?.balance.monthlyUsed ?? 0;
  const monthlyAllowance = creditInfo?.balance.monthlyAllowance ?? 5;
  const usagePct = Math.min(100, Math.round((monthlyUsed / Math.max(monthlyAllowance, 1)) * 100));

  const PLAN_COLORS: Record<string, string> = {
    free: "rgba(255,255,255,0.50)",
    starter: "rgba(61,240,255,0.85)",
    pro: "rgba(139,92,246,0.90)",
    agency: "rgba(251,191,36,0.90)",
    admin: "rgba(56,248,166,0.90)",
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060810; color: #e9eef7; font-family: 'Outfit', 'Inter', system-ui, sans-serif; }
        .db-root { min-height: 100vh; background: #060810; }
        .db-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; backdrop-filter: blur(24px); background: rgba(6,8,16,0.82); border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 56px; }
        .db-logo { font-size: 18px; font-weight: 800; color: #fff; text-decoration: none; letter-spacing: -0.03em; }
        .db-nav-links { display: flex; gap: 8px; align-items: center; }
        .db-nav-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.75); font-size: 13px; font-weight: 500; text-decoration: none; cursor: pointer; font-family: inherit; transition: all 120ms; }
        .db-nav-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .db-nav-btn--primary { background: rgba(61,240,255,0.12); border-color: rgba(61,240,255,0.35); color: rgba(61,240,255,0.95); }
        .db-nav-btn--primary:hover { background: rgba(61,240,255,0.22); }
        .db-main { max-width: 900px; margin: 0 auto; padding: 88px 24px 64px; }
        .db-page-title { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 32px; }
        .db-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        @media (max-width: 640px) { .db-grid { grid-template-columns: 1fr; } }
        .db-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 16px; padding: 24px; }
        .db-card-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(255,255,255,0.35); margin-bottom: 10px; }
        .db-card-value { font-size: 36px; font-weight: 800; letter-spacing: -0.03em; }
        .db-card-sub { font-size: 12px; color: rgba(255,255,255,0.40); margin-top: 4px; }
        .db-progress-track { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; margin: 12px 0 6px; overflow: hidden; }
        .db-progress-fill { height: 100%; border-radius: 3px; transition: width 400ms ease; }
        .db-section-title { font-size: 16px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 12px; }
        .db-actions { display: flex; flex-direction: column; gap: 10px; }
        .db-action-btn { display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 12px; color: rgba(255,255,255,0.80); font-size: 14px; font-weight: 500; text-decoration: none; cursor: pointer; font-family: inherit; transition: all 130ms; text-align: left; }
        .db-action-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.16); color: #fff; }
        .db-action-icon { font-size: 18px; width: 32px; text-align: center; }
        .db-action-text { flex: 1; }
        .db-action-title { font-weight: 600; }
        .db-action-desc { font-size: 12px; color: rgba(255,255,255,0.40); margin-top: 1px; }
        .db-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.20); border-top-color: rgba(255,255,255,0.70); border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div className="db-root">
        <nav className="db-nav">
          <Link href="/" className="db-logo">Dominat8.io</Link>
          <div className="db-nav-links">
            <Link href="/build" className="db-nav-btn db-nav-btn--primary">⚡ Builder</Link>
            <Link href="/pricing" className="db-nav-btn">Pricing</Link>
          </div>
        </nav>
        <main className="db-main">
          <div className="db-page-title">Dashboard</div>

          {loading ? (
            <div style={{ color: "rgba(255,255,255,0.40)", fontSize: 14 }}>Loading your account…</div>
          ) : (
            <>
              <div className="db-grid">
                {/* Plan card */}
                <div className="db-card">
                  <div className="db-card-label">Current plan</div>
                  <div className="db-card-value" style={{ color: PLAN_COLORS[plan] ?? "rgba(255,255,255,0.80)", textTransform: "capitalize" }}>
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
                    <div className="db-card-value" style={{ color: "rgba(56,248,166,0.90)" }}>∞</div>
                  ) : (
                    <>
                      <div className="db-card-value" style={{ color: total > 10 ? "rgba(56,248,166,0.90)" : total > 0 ? "rgba(255,180,0,0.90)" : "rgba(255,100,100,0.90)" }}>
                        {total}
                      </div>
                      <div className="db-progress-track">
                        <div className="db-progress-fill" style={{ width: `${100 - usagePct}%`, background: total > 10 ? "rgba(56,248,166,0.70)" : "rgba(255,180,0,0.70)" }} />
                      </div>
                      <div className="db-card-sub">
                        {creditInfo?.balance.monthlyRemaining ?? 0} monthly + {creditInfo?.balance.purchased ?? 0} purchased
                      </div>
                    </>
                  )}
                </div>

                {/* Monthly usage card */}
                {!creditInfo?.admin && (
                  <div className="db-card">
                    <div className="db-card-label">Monthly agent usage</div>
                    <div className="db-card-value" style={{ fontSize: 28 }}>
                      {monthlyUsed} <span style={{ fontSize: 16, color: "rgba(255,255,255,0.40)", fontWeight: 400 }}>/ {monthlyAllowance}</span>
                    </div>
                    <div className="db-progress-track">
                      <div className="db-progress-fill" style={{ width: `${usagePct}%`, background: usagePct > 80 ? "rgba(255,100,100,0.70)" : "rgba(61,240,255,0.60)" }} />
                    </div>
                    <div className="db-card-sub">Resets on the 1st of next month</div>
                  </div>
                )}

                {/* Quick actions card */}
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
                    {!creditInfo?.admin && plan === "free" && (
                      <Link href="/pricing" className="db-action-btn" style={{ borderColor: "rgba(61,240,255,0.25)", background: "rgba(61,240,255,0.06)" }}>
                        <span className="db-action-icon">🚀</span>
                        <div className="db-action-text">
                          <div className="db-action-title" style={{ color: "rgba(61,240,255,0.90)" }}>Upgrade your plan</div>
                          <div className="db-action-desc">Unlock more agents and credits</div>
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
                      <Link href="/admin" className="db-action-btn" style={{ borderColor: "rgba(56,248,166,0.25)", background: "rgba(56,248,166,0.06)" }}>
                        <span className="db-action-icon">⚙️</span>
                        <div className="db-action-text">
                          <div className="db-action-title" style={{ color: "rgba(56,248,166,0.90)" }}>Admin panel</div>
                          <div className="db-action-desc">Manage users, credits, plans</div>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
