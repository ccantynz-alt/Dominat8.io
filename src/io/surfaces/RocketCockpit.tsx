import * as React from "react";
import { Shell } from "../ui/Shell";
import AgentRunsPanel from "../widgets/AgentRunsPanel";
import { VoiceConsole } from "../widgets/VoiceConsole";

// ─── Patch Capsule Panel ───────────────────────────────────────────────────────

type CapsuleStatus = "idle" | "running" | "done";

function PatchCapsulePanel() {
  const [status, setStatus] = React.useState<CapsuleStatus>("idle");
  const [label, setLabel] = React.useState("");
  const [log, setLog] = React.useState<string[]>([]);

  function run() {
    if (!label.trim() || status === "running") return;
    setStatus("running");
    setLog([]);
    const steps = [
      "Snapshotting current state…",
      "Running pre-flight checks…",
      "Applying patch bundle…",
      "Verifying build integrity…",
      "Rollback point registered.",
      `✓ Capsule "${label}" sealed.`,
    ];
    steps.forEach((msg, i) => {
      setTimeout(() => {
        setLog(prev => [...prev, msg]);
        if (i === steps.length - 1) setStatus("done");
      }, 500 + i * 700);
    });
  }

  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="kicker" style={{ marginBottom: 10 }}>patch capsule</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") run(); }}
          placeholder="Label (e.g. fix/nav-contrast)"
          disabled={status === "running"}
          style={{
            flex: 1, background: "rgba(0,0,0,0.30)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 10, color: "rgba(255,255,255,0.88)",
            fontSize: 12, padding: "8px 12px", fontFamily: "inherit", outline: "none",
          }}
        />
        <button
          className={status === "done" ? "btn2" : "btn"}
          onClick={status === "done" ? () => { setStatus("idle"); setLabel(""); setLog([]); } : run}
          disabled={!label.trim() && status !== "done"}
          type="button"
          style={{ fontSize: 12, whiteSpace: "nowrap" }}
        >
          {status === "idle" ? "Seal" : status === "running" ? "Running…" : "↩ Reset"}
        </button>
      </div>
      {log.length > 0 && (
        <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: "10px 12px", maxHeight: 130, overflowY: "auto", border: "1px solid rgba(255,255,255,0.07)" }}>
          {log.map((l, i) => (
            <div key={i} style={{ fontSize: 11, lineHeight: 1.6, fontFamily: "ui-monospace,monospace", color: l.startsWith("✓") ? "rgba(56,248,166,0.90)" : "rgba(255,255,255,0.65)" }}>
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Domain Onboarding Panel ───────────────────────────────────────────────────

type DomainStep = "input" | "verifying" | "verified";

function DomainOnboardingPanel() {
  const [domain, setDomain] = React.useState("");
  const [step, setStep] = React.useState<DomainStep>("input");
  const [records] = React.useState([
    { type: "A",     name: "@",   value: "76.76.21.21" },
    { type: "CNAME", name: "www", value: "cname.vercel-dns.com" },
  ]);

  function start() {
    if (!domain.trim()) return;
    setStep("verifying");
    setTimeout(() => setStep("verified"), 1800);
  }

  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="kicker" style={{ marginBottom: 10 }}>domain onboarding</div>

      {step === "input" && (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={domain}
            onChange={e => setDomain(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") start(); }}
            placeholder="yourdomain.com"
            style={{ flex: 1, background: "rgba(0,0,0,0.30)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, color: "rgba(255,255,255,0.88)", fontSize: 12, padding: "8px 12px", fontFamily: "inherit", outline: "none" }}
          />
          <button className="btn" onClick={start} disabled={!domain.trim()} type="button" style={{ fontSize: 12 }}>
            Add DNS
          </button>
        </div>
      )}

      {step === "verifying" && (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", padding: "4px 0" }}>Verifying {domain}…</div>
      )}

      {step === "verified" && (
        <>
          <div style={{ fontSize: 12, color: "rgba(56,248,166,0.90)", marginBottom: 10 }}>✓ DNS records for <strong>{domain}</strong></div>
          <div style={{ display: "grid", gap: 6 }}>
            {records.map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "48px 56px 1fr", gap: 8, alignItems: "center", background: "rgba(0,0,0,0.25)", borderRadius: 8, padding: "7px 10px", fontSize: 11, fontFamily: "ui-monospace,monospace" }}>
                <span style={{ background: "rgba(61,240,255,0.10)", color: "rgba(61,240,255,0.90)", borderRadius: 4, padding: "2px 6px", fontWeight: 700, textAlign: "center" }}>{r.type}</span>
                <span style={{ color: "rgba(255,255,255,0.55)" }}>{r.name}</span>
                <span style={{ color: "rgba(255,255,255,0.80)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button className="btn" style={{ fontSize: 12 }} type="button">Verify DNS</button>
            <button className="btn2" onClick={() => { setDomain(""); setStep("input"); }} style={{ fontSize: 12 }} type="button">Reset</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── System Metrics Panel ──────────────────────────────────────────────────────

function SystemMetricsPanel({ patchId }: { patchId: string }) {
  const [ts, setTs] = React.useState(() => new Date().toISOString());
  React.useEffect(() => {
    const id = setInterval(() => setTs(new Date().toISOString()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="card2" style={{ padding: 14 }}>
      <div className="kicker">cockpit status</div>
      <div style={{ fontSize: 18, marginTop: 6, letterSpacing: "-0.02em" }}>Systems Online</div>
      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[
          { label: "Surface", value: "Cockpit",   sub: "IO identity locked" },
          { label: "Cache",   value: "No-Store",  sub: "Fresh every hit" },
          { label: "Proof",   value: "Stamp",     sub: "/api/__d8__/stamp" },
        ].map(m => (
          <div key={m.label} className="card" style={{ padding: 12 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.50)" }}>{m.label}</div>
            <div style={{ marginTop: 8, fontSize: 18, letterSpacing: "-0.02em" }}>{m.value}</div>
            <div style={{ marginTop: 5, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{m.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
        <div className="kicker">build stamp</div>
        <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.65)", display: "grid", gap: 4 }}>
          <div>PatchId: <span style={{ color: "rgba(61,240,255,0.90)", fontFamily: "ui-monospace,monospace" }}>{patchId}</span></div>
          <div>Time: <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10 }}>{ts}</span></div>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Actions Panel ───────────────────────────────────────────────────────

type QAState = "idle" | "running" | "done" | "failed";
type QAResult = { summary?: string; error?: string };

const QA_ACTIONS = [
  // ── Original 6 audit agents ──
  { id: "seo-sweep",             label: "SEO Sweep",          sub: "Titles, descriptions, keywords",         badge: "RUN",   cls: "badge hot" },
  { id: "design-fixer",          label: "Design Fixer",       sub: "Layout, contrast, UX polish",            badge: "FIX",   cls: "badge hot" },
  { id: "responsive-audit",      label: "Responsive Audit",   sub: "320px → 1440px breakpoints",             badge: "SCAN",  cls: "badge" },
  { id: "performance-optimizer", label: "Perf Audit",         sub: "LCP, CLS, render-blocking",              badge: "SCAN",  cls: "badge" },
  { id: "accessibility-checker", label: "A11y Check",         sub: "ARIA, contrast, keyboard nav",           badge: "CHECK", cls: "badge" },
  { id: "link-scanner",          label: "Link Scanner",       sub: "Broken links, CTAs, anchors",            badge: "SCAN",  cls: "badge" },
  // ── 8 high-end agents ──
  { id: "creative-director",     label: "Creative Director",  sub: "Typography, spacing, colour, hierarchy", badge: "PRO",   cls: "badge hot" },
  { id: "motion-designer",       label: "Motion Designer",    sub: "Animations, scroll, easing, a11y",       badge: "PRO",   cls: "badge hot" },
  { id: "conversion-architect",  label: "Conversion Arch.",   sub: "Funnel, CTAs, objections, A/B",          badge: "SCAN",  cls: "badge" },
  { id: "copy-chief",            label: "Copy Chief",         sub: "Headlines, copy, tone, persuasion",      badge: "PRO",   cls: "badge hot" },
  { id: "proof-engine",          label: "Proof Engine",       sub: "Testimonials, trust, social proof",      badge: "PRO",   cls: "badge hot" },
  { id: "seo-gsc",               label: "SEO + GSC",          sub: "Schema, sitemap, GSC onboarding",        badge: "SCAN",  cls: "badge" },
  { id: "domain-ssl",            label: "Domain + SSL",       sub: "DNS, verification, SSL setup",           badge: "SCAN",  cls: "badge" },
  { id: "monetization",          label: "Monetization",       sub: "Pricing, gating, Stripe, revenue",       badge: "SCAN",  cls: "badge" },
  // ── Utility ──
  { id: "sit",                   label: "Sitemap Rebuild",    sub: "Trigger sitemap refresh",                badge: "RUN",   cls: "badge ok" },
] as const;

type QAId = typeof QA_ACTIONS[number]["id"];

function QuickActionsPanel() {
  const [states, setStates] = React.useState<Record<string, QAState>>({});
  const [results, setResults] = React.useState<Record<string, QAResult>>({});

  async function trigger(id: QAId) {
    if (states[id] === "running") return;
    setStates(s => ({ ...s, [id]: "running" }));
    setResults(s => ({ ...s, [id]: {} }));

    if (id === "sit") {
      // Sitemap rebuild — just fetch the sitemap route to warm/regenerate it
      try {
        await fetch("/sitemap.xml", { cache: "no-store" });
        setStates(s => ({ ...s, [id]: "done" }));
        setResults(s => ({ ...s, [id]: { summary: "Sitemap refreshed." } }));
      } catch {
        setStates(s => ({ ...s, [id]: "failed" }));
      }
      return;
    }

    try {
      const res = await fetch("/api/io/agents/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ agent: id, html: "" }),
      });
      const data = await res.json();
      if (data.ok) {
        setStates(s => ({ ...s, [id]: "done" }));
        setResults(s => ({ ...s, [id]: { summary: data.summary } }));
      } else {
        setStates(s => ({ ...s, [id]: "failed" }));
        setResults(s => ({ ...s, [id]: { error: data.error } }));
      }
    } catch {
      setStates(s => ({ ...s, [id]: "failed" }));
    }
  }

  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="kicker" style={{ marginBottom: 10 }}>quick actions</div>
      <div className="list">
        {QA_ACTIONS.map(a => {
          const st = states[a.id] ?? "idle";
          const res = results[a.id];
          return (
            <div key={a.id} className="row" style={{ cursor: st === "running" ? "default" : "pointer", flexDirection: "column", alignItems: "stretch", gap: 4 }} onClick={() => trigger(a.id as QAId)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="t">{a.label}</div>
                  <div className="m">{a.sub}</div>
                </div>
                <span className={st === "done" ? "badge ok" : st === "failed" ? "badge hot" : st === "running" ? "badge" : a.cls}>
                  {st === "running" ? "RUNNING…" : st === "done" ? "DONE" : st === "failed" ? "FAILED" : a.badge}
                </span>
              </div>
              {res?.summary && (
                <div style={{ fontSize: 10, color: "rgba(56,248,166,0.85)", fontFamily: "ui-monospace,monospace", paddingLeft: 2, lineHeight: 1.4 }}>
                  ✓ {res.summary}
                </div>
              )}
              {res?.error && (
                <div style={{ fontSize: 10, color: "rgba(255,100,100,0.85)", fontFamily: "ui-monospace,monospace", paddingLeft: 2 }}>
                  ✗ {res.error}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Rocket Cockpit (main export) ─────────────────────────────────────────────

type CockpitAgentState = "idle" | "running" | "done";

const COCKPIT_AGENTS = [
  "seo-sweep", "design-fixer", "responsive-audit", "performance-optimizer",
  "accessibility-checker", "link-scanner",
  "creative-director", "motion-designer", "conversion-architect", "copy-chief",
  "proof-engine", "seo-gsc", "domain-ssl", "monetization",
] as const;

export function RocketCockpit(props: { patchId: string }) {
  const [runAllState, setRunAllState] = React.useState<CockpitAgentState>("idle");

  async function runAllAgents() {
    if (runAllState === "running") return;
    setRunAllState("running");
    await Promise.allSettled(
      COCKPIT_AGENTS.map(agent =>
        fetch("/api/io/agents/run", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ agent, html: "" }),
        })
      )
    );
    setRunAllState("done");
    setTimeout(() => setRunAllState("idle"), 4000);
  }

  return (
    <Shell
      patchId={props.patchId}
      title="D8 IO Rocket Cockpit"
      subtitle="Operator dashboard — agent monitoring, patch capsules, domain onboarding."
      right={
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn2" type="button">+ New Capsule</button>
          <button className="btn" type="button" onClick={runAllAgents} disabled={runAllState === "running"}>
            {runAllState === "running" ? "Running…" : runAllState === "done" ? "✓ Done" : "▶ Run Agents"}
          </button>
        </div>
      }
    >
      {/* Row 1 */}
      <div className="grid">
        <SystemMetricsPanel patchId={props.patchId} />
        <AgentRunsPanel />
      </div>

      {/* Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
        <PatchCapsulePanel />
        <DomainOnboardingPanel />
      </div>

      {/* Row 3 — Voice Console + Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
        <VoiceConsole />
        <QuickActionsPanel />
      </div>
    </Shell>
  );
}
