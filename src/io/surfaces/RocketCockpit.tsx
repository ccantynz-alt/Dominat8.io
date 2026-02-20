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

function QuickActionsPanel() {
  const [active, setActive] = React.useState<string | null>(null);
  const actions = [
    { id: "seo",  label: "SEO Sweep",      sub: "Titles, descriptions, keywords", badge: "RUN",  cls: "badge hot" },
    { id: "sit",  label: "Sitemap Rebuild", sub: "Generate + upload sitemap.xml",  badge: "RUN",  cls: "badge ok" },
    { id: "perf", label: "Perf Audit",      sub: "LCP, CLS, TTFB diagnostics",    badge: "SCAN", cls: "badge" },
    { id: "ssl",  label: "SSL Check",       sub: "Certificate + expiry status",   badge: "CHECK", cls: "badge" },
  ];
  function trigger(id: string) {
    setActive(id);
    setTimeout(() => setActive(null), 3000);
  }
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="kicker" style={{ marginBottom: 10 }}>quick actions</div>
      <div className="list">
        {actions.map(a => (
          <div key={a.id} className="row" style={{ cursor: "pointer" }} onClick={() => trigger(a.id)}>
            <div>
              <div className="t">{a.label}</div>
              <div className="m">{a.sub}</div>
            </div>
            <span className={active === a.id ? "badge ok" : a.cls}>
              {active === a.id ? "RUNNING…" : a.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Rocket Cockpit (main export) ─────────────────────────────────────────────

export function RocketCockpit(props: { patchId: string }) {
  return (
    <Shell
      patchId={props.patchId}
      title="D8 IO Rocket Cockpit"
      subtitle="Operator dashboard — agent monitoring, patch capsules, domain onboarding."
      right={
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn2" type="button">+ New Capsule</button>
          <button className="btn" type="button">▶ Run Agents</button>
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
