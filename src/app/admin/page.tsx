"use client";

import React, { useState } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Balance {
  plan: string;
  monthlyAllowance: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  purchased: number;
  total: number;
}

interface LookupResult {
  balance: Balance;
  planRaw: string | null;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [plan, setPlan] = useState("pro");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function call(action: string, extra: Record<string, unknown> = {}) {
    if (!userId.trim()) { setMsg({ text: "Enter a user ID first", ok: false }); return; }
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, targetUserId: userId.trim(), ...extra }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg({ text: data.error ?? "Request failed", ok: false });
      } else {
        setResult(data);
        setMsg({ text: `✓ ${action} completed`, ok: true });
      }
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Network error", ok: false });
    } finally { setLoading(false); }
  }

  const PLAN_COL: Record<string, string> = {
    free: "rgba(255,255,255,0.55)", starter: "rgba(124,90,255,0.85)",
    pro: "rgba(80,70,228,0.90)", agency: "rgba(251,191,36,0.90)",
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #08080c; color: #c8c8d4; font-family: 'Outfit', 'Inter', system-ui, sans-serif; }
        .adm-root { min-height: 100vh; }
        .adm-nav { position: sticky; top: 0; z-index: 100; backdrop-filter: blur(24px); background: rgba(8,8,12,0.90); border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: space-between; padding: 0 28px; height: 54px; }
        .adm-logo { font-size: 16px; font-weight: 800; color: #fff; text-decoration: none; letter-spacing: -0.03em; }
        .adm-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; padding: 2px 8px; border-radius: 5px; background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.30); color: rgba(52,211,153,0.85); margin-left: 10px; }
        .adm-nav-right { display: flex; gap: 8px; }
        .adm-link { padding: 5px 12px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.10); background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.65); font-size: 13px; text-decoration: none; }
        .adm-main { max-width: 860px; margin: 0 auto; padding: 36px 24px 80px; }
        .adm-title { font-size: 24px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 6px; }
        .adm-sub { font-size: 14px; color: rgba(255,255,255,0.35); margin-bottom: 32px; }
        .adm-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 16px; padding: 24px; margin-bottom: 20px; }
        .adm-card-title { font-size: 13px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: rgba(255,255,255,0.40); margin-bottom: 18px; }
        .adm-row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
        .adm-field { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 200px; }
        .adm-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.40); text-transform: uppercase; letter-spacing: 0.05em; }
        .adm-input { padding: 9px 12px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); color: #fff; font-size: 13px; font-family: ui-monospace,monospace; outline: none; transition: border 120ms; width: 100%; }
        .adm-input:focus { border-color: rgba(61,240,255,0.40); }
        .adm-select { padding: 9px 12px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.12); background: rgba(30,30,50,0.80); color: #fff; font-size: 13px; font-family: inherit; outline: none; cursor: pointer; width: 100%; }
        .adm-btn { padding: 9px 18px; border-radius: 9px; font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer; border: none; transition: all 130ms; white-space: nowrap; }
        .adm-btn--teal { background: rgba(61,240,255,0.15); border: 1px solid rgba(61,240,255,0.35); color: rgba(61,240,255,0.90); }
        .adm-btn--teal:hover { background: rgba(61,240,255,0.25); }
        .adm-btn--green { background: rgba(56,248,166,0.12); border: 1px solid rgba(56,248,166,0.35); color: rgba(56,248,166,0.90); }
        .adm-btn--green:hover { background: rgba(56,248,166,0.22); }
        .adm-btn--purple { background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.35); color: rgba(139,92,246,0.90); }
        .adm-btn--purple:hover { background: rgba(139,92,246,0.22); }
        .adm-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .adm-msg { margin-top: 14px; padding: 10px 14px; border-radius: 9px; font-size: 13px; font-family: ui-monospace,monospace; }
        .adm-msg--ok { background: rgba(56,248,166,0.08); border: 1px solid rgba(56,248,166,0.25); color: rgba(56,248,166,0.90); }
        .adm-msg--err { background: rgba(255,100,100,0.08); border: 1px solid rgba(255,100,100,0.25); color: rgba(255,100,100,0.90); }
        .adm-result { margin-top: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .adm-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; }
        .adm-stat-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,0.35); margin-bottom: 6px; }
        .adm-stat-val { font-size: 24px; font-weight: 800; letter-spacing: -0.03em; }
        .adm-stat-sub { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 2px; }
      `}</style>

      <div className="adm-root">
        <nav className="adm-nav">
          <div style={{ display: "flex", alignItems: "center" }}>
            <Link href="/" className="adm-logo">Dominat8.io</Link>
            <span className="adm-badge">Admin</span>
          </div>
          <div className="adm-nav-right">
            <Link href="/dashboard" className="adm-link">Dashboard</Link>
            <Link href="/build" className="adm-link">Builder</Link>
          </div>
        </nav>

        <main className="adm-main">
          <div className="adm-title">Admin Panel</div>
          <div className="adm-sub">
            Manage user credits and plans. Enter a Clerk user ID to look up or modify an account.
            <br />You have unlimited agent access on all Dominat8.io tools.
          </div>

          {/* User lookup */}
          <div className="adm-card">
            <div className="adm-card-title">User ID</div>
            <div className="adm-row">
              <div className="adm-field" style={{ flex: 2 }}>
                <label className="adm-label">Clerk User ID</label>
                <input
                  className="adm-input"
                  placeholder="user_2abc..."
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                />
              </div>
              <button className="adm-btn adm-btn--teal" disabled={loading || !userId.trim()} onClick={() => call("getBalance")}>
                Look up
              </button>
            </div>

            {result && (
              <div className="adm-result">
                <div className="adm-stat">
                  <div className="adm-stat-label">Plan</div>
                  <div className="adm-stat-val" style={{ fontSize: 18, textTransform: "capitalize", color: PLAN_COL[result.balance.plan] ?? "inherit" }}>
                    {result.balance.plan}
                  </div>
                  <div className="adm-stat-sub">raw: {result.planRaw ?? "null"}</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Credits total</div>
                  <div className="adm-stat-val" style={{ color: result.balance.total > 0 ? "rgba(56,248,166,0.90)" : "rgba(255,100,100,0.90)" }}>
                    {result.balance.total}
                  </div>
                  <div className="adm-stat-sub">{result.balance.monthlyRemaining} mo + {result.balance.purchased} bought</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Monthly usage</div>
                  <div className="adm-stat-val">{result.balance.monthlyUsed}</div>
                  <div className="adm-stat-sub">of {result.balance.monthlyAllowance} allowance</div>
                </div>
              </div>
            )}
          </div>

          {/* Add credits */}
          <div className="adm-card">
            <div className="adm-card-title">Add purchased credits</div>
            <div className="adm-row">
              <div className="adm-field">
                <label className="adm-label">Amount to add</label>
                <input
                  className="adm-input"
                  type="number"
                  min={1}
                  max={10000}
                  placeholder="100"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
              <button className="adm-btn adm-btn--green" disabled={loading || !userId.trim() || !amount}
                onClick={() => call("addCredits", { amount: parseInt(amount, 10) })}>
                Add credits
              </button>
            </div>
          </div>

          {/* Set plan */}
          <div className="adm-card">
            <div className="adm-card-title">Override plan</div>
            <div className="adm-row">
              <div className="adm-field">
                <label className="adm-label">Plan</label>
                <select className="adm-select" value={plan} onChange={e => setPlan(e.target.value)}>
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="agency">Agency</option>
                </select>
              </div>
              <button className="adm-btn adm-btn--purple" disabled={loading || !userId.trim()}
                onClick={() => call("setPlan", { plan })}>
                Set plan
              </button>
            </div>
          </div>

          {msg && <div className={`adm-msg ${msg.ok ? "adm-msg--ok" : "adm-msg--err"}`}>{msg.text}</div>}
        </main>
      </div>
    </>
  );
}
