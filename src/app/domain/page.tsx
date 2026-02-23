"use client";

import { useState } from "react";
import GoldFogPageLayout from "@/components/GoldFogPageLayout";

export default function DomainPage() {
  const [domain, setDomain] = useState("");
  const [siteId, setSiteId] = useState("");
  const [step, setStep] = useState<"idle" | "challenge" | "verifying" | "verified">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const d = domain.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];

  async function requestChallenge() {
    if (!d || !siteId.trim()) {
      setError("Enter domain and site ID (e.g. from a share link: /s/abc123 → abc123)");
      return;
    }
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/domains/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: d, siteId: siteId.trim() }),
      });
      const data = await res.json();
      if (data.ok && data.instructions) {
        setMessage(data.instructions);
        setStep("challenge");
      } else {
        setError(data.error || "Failed to create challenge");
      }
    } catch {
      setError("Network error");
    }
  }

  async function verify() {
    if (!d || !siteId.trim()) return;
    setError("");
    setStep("verifying");
    try {
      const res = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: d, siteId: siteId.trim() }),
      });
      const data = await res.json();
      if (data.verified) {
        setMessage(`Verified. Add CNAME: ${d} → cname.vercel-dns.com (or your host).`);
        setStep("verified");
      } else {
        setError(data.error || "Verification failed. DNS may take a few minutes.");
        setStep("challenge");
      }
    } catch {
      setError("Network error");
      setStep("challenge");
    }
  }

  return (
    <GoldFogPageLayout title="Domain">
      <div className="gold-fog-card">
        <p className="gold-fog-muted" style={{ marginBottom: 20 }}>
          Add a custom domain and verify ownership with a TXT record. Then point your domain to Dominat8.
        </p>
        <div style={{ marginBottom: 16 }}>
          <label className="gold-fog-label">Domain</label>
          <input
            className="gold-fog-input"
            type="text"
            placeholder="mysite.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label className="gold-fog-label">Site ID (from share link /s/xxxxx)</label>
          <input
            className="gold-fog-input"
            type="text"
            placeholder="e.g. abc123def456"
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
          />
        </div>
        {step === "idle" && (
          <button type="button" className="gold-fog-btn" onClick={requestChallenge}>
            Get verification record
          </button>
        )}
        {(step === "challenge" || step === "verifying") && (
          <>
            <div style={{ padding: 14, background: "rgba(0,0,0,0.2)", borderRadius: 8, marginBottom: 16, fontFamily: "ui-monospace, monospace", fontSize: 13 }}>
              {message}
            </div>
            <button type="button" className="gold-fog-btn" onClick={verify} disabled={step === "verifying"}>
              {step === "verifying" ? "Checking…" : "Verify DNS"}
            </button>
          </>
        )}
        {step === "verified" && (
          <div style={{ padding: 14, background: "rgba(56,248,166,0.08)", borderRadius: 8, color: "rgba(56,248,166,0.9)" }}>
            {message}
          </div>
        )}
        {error && <p style={{ color: "rgba(255,100,100,0.9)", marginTop: 12, fontSize: 14 }}>{error}</p>}
      </div>
    </GoldFogPageLayout>
  );
}
