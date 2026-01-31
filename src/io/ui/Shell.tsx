import * as React from "react";

type NavItem = { label: string; hint?: string; state?: "ok"|"warn"|"hot" };

const NAV: NavItem[] = [
  { label: "Rocket Cockpit", hint: "Overview", state: "ok" },
  { label: "Projects", hint: "Sites & status" },
  { label: "Agents", hint: "Runs & logs", state: "warn" },
  { label: "Patches", hint: "Capsules" },
  { label: "Domains", hint: "DNS & SSL" },
  { label: "Billing", hint: "Plans" },
  { label: "Settings", hint: "System" },
];

function Badge({ state }: { state?: NavItem["state"] }) {
  if (!state) return <span className="badge">›</span>;
  if (state === "ok") return <span className="badge ok">OK</span>;
  if (state === "warn") return <span className="badge warn">WARN</span>;
  return <span className="badge hot">HOT</span>;
}

export function Shell(props: { title: string; subtitle: string; patchId: string; right?: React.ReactNode; children: React.ReactNode; }) {
  return (
    <div className="io-shell">
      <div className="io-mesh" aria-hidden="true" />
      <aside className="io-side">
        <div className="card2" style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div className="kicker">dominat8.io</div>
              <div style={{ fontSize: 18, marginTop: 6, letterSpacing: "-0.02em" }}>Rocket Cockpit</div>
              <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.66)" }}>
                Operator-grade IO control panel.
              </div>
            </div>
            <span className="badge ok">LIVE</span>
          </div>

          <div className="hr"></div>

          <div className="list">
            {NAV.map((n) => (
              <div key={n.label} className="row" style={{ cursor: "pointer" }}>
                <div style={{ minWidth: 0 }}>
                  <div className="t">{n.label}</div>
                  {n.hint ? <div className="m">{n.hint}</div> : null}
                </div>
                <Badge state={n.state} />
              </div>
            ))}
          </div>

          <div className="foot">
            Patch: <span style={{ color: "rgba(255,255,255,0.76)" }}>{props.patchId}</span>
          </div>
        </div>
      </aside>

      <main className="io-main">
        <div className="io-top">
          <div>
            <h1 className="h1">{props.title}</h1>
            <div className="sub">{props.subtitle}</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="pill">Mode: ROCKET</span>
            {props.right ? props.right : null}
          </div>
        </div>

        <div style={{ marginTop: 14 }}>{props.children}</div>
      </main>
    </div>
  );
}