import * as React from "react";
import { Shell } from "../ui/Shell";
import { AgentRunsPanel } from "../widgets/AgentRunsPanel";

export function RocketCockpit(props: { patchId: string }) {
  return (
    <Shell
      patchId={props.patchId}
      title="D8 IO Rocket Cockpit"
      subtitle="Fresh IO build — architectural, polished, and unmistakably new."
      right={
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn2" type="button">New Capsule</button>
          <button className="btn" type="button">Run Agents</button>
        </div>
      }
    >
      <div className="grid">
        <div className="card2">
          <div style={{ padding: 14 }}>
            <div className="kicker">cockpit status</div>
            <div style={{ fontSize: 18, marginTop: 6, letterSpacing: "-0.02em" }}>
              Systems Online
            </div>

            <div style={{ marginTop: 12, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color:"rgba(255,255,255,0.55)" }}>Surface</div>
                <div style={{ marginTop: 8, fontSize: 20, letterSpacing:"-0.02em" }}>Cockpit</div>
                <div style={{ marginTop: 6, fontSize: 12, color:"rgba(255,255,255,0.66)" }}>IO identity locked</div>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color:"rgba(255,255,255,0.55)" }}>Cache</div>
                <div style={{ marginTop: 8, fontSize: 20, letterSpacing:"-0.02em" }}>No-Store</div>
                <div style={{ marginTop: 6, fontSize: 12, color:"rgba(255,255,255,0.66)" }}>Fresh every hit</div>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color:"rgba(255,255,255,0.55)" }}>Proof</div>
                <div style={{ marginTop: 8, fontSize: 20, letterSpacing:"-0.02em" }}>Stamp</div>
                <div style={{ marginTop: 6, fontSize: 12, color:"rgba(255,255,255,0.66)" }}>/api/__d8__/stamp</div>
              </div>
            </div>

            <div style={{ marginTop: 12, color:"rgba(255,255,255,0.74)", fontSize:13, lineHeight:1.5 }}>
              If you can see this cockpit, the old IO surface has been replaced.
              Next: real agent execution + patch capsules + domain onboarding.
            </div>

            <div style={{ marginTop: 12, padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" }}>
              <div className="kicker">build stamp</div>
              <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.76)" }}>
                PatchId: <span style={{ color: "rgba(61,240,255,0.90)" }}>{props.patchId}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <AgentRunsPanel />
          <div style={{ height: 12 }} />
          <div className="card" style={{ padding: 14 }}>
            <div className="kicker">quick actions</div>
            <div className="list">
              <div className="row">
                <div><div className="t">Create Patch Capsule</div><div className="m">Bundle change + verification + rollback</div></div>
                <span className="badge warn">CTRL</span>
              </div>
              <div className="row">
                <div><div className="t">Run Agent Set</div><div className="m">SEO + Sitemap + Content pipeline</div></div>
                <span className="badge hot">RUN</span>
              </div>
              <div className="row">
                <div><div className="t">Domain Onboarding</div><div className="m">DNS verification + SSL provisioning</div></div>
                <span className="badge">DNS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}