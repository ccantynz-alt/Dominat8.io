"use client";

import { useEffect, useMemo, useState } from "react";

type Run = {
  id: string;
  kind: string;
  status: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export default function DashboardPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");

  async function refreshRuns() {
    const res = await fetch("/api/ui/runs", { cache: "no-store" });
    const data = await res.json();
    if (data.ok) setRuns(data.runs);
  }

  useEffect(() => {
    refreshRuns();
  }, []);

  const recent = useMemo(() => runs.slice().reverse(), [runs]);

  async function createRun(kind: string, title: string) {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/runs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, title })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed to create run");
      setMessage(`Created run: ${data.run.id}`);
      await refreshRuns();
    } catch (e: any) {
      setMessage(e.message ?? "Error");
    } finally {
      setBusy(false);
    }
  }

  async function importRepo() {
    setBusy(true);
    setMessage("");
    try {
      const name =
        prompt("New GitHub repo name (no spaces):", `emergent-import-${Date.now()}`) || "";
      if (!name) return;

      const res = await fetch("/api/github/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Import failed");
      setMessage(`✅ Created repo: ${data.repo.full_name}`);
    } catch (e: any) {
      setMessage(e.message ?? "Error");
    } finally {
      setBusy(false);
    }
  }

  async function triggerDeploy() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/vercel/deploy", { method: "POST" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Deploy failed");
      setMessage("🚀 Deploy triggered.");
    } catch (e: any) {
      setMessage(e.message ?? "Error");
    } finally {
      setBusy(false);
    }
  }

  async function runCronTick() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/cron/tick", { cache: "no-store" });
      const data = await res.json();
      if (!data.ok) throw new Error("Tick failed");
      setMessage(`Tick processed ${data.processedCount} run(s).`);
      await refreshRuns();
    } catch (e: any) {
      setMessage(e.message ?? "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 980,
        margin: "40px auto",
        padding: "0 16px",
        fontFamily: "ui-sans-serif"
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>AI Agent Platform — Dashboard</h1>
      <p style={{ opacity: 0.8, marginTop: 8 }}>
        Runs + background processing + import + deploy. This sits around your existing <code>/api/chat</code>.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
        <button disabled={busy} onClick={() => createRun("agent:plan", "Plan next build")} style={btn()}>
          + Create “Plan” Run
        </button>

        <button
          disabled={busy}
          onClick={() => createRun("agent:maintenance", "Maintenance check")}
          style={btn()}
        >
          + Create “Maintenance” Run
        </button>

        <button disabled={busy} onClick={runCronTick} style={btn()}>
          ▶ Run Tick Now
        </button>

        <button disabled={busy} onClick={importRepo} style={btn()}>
          📦 Import Repo (GitHub)
        </button>

        <button disabled={busy} onClick={triggerDeploy} style={btn()}>
          🚀 Trigger Deploy
        </button>
      </div>

      {message ? (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          {message}
        </div>
      ) : null}

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 24 }}>Recent Runs</h2>

      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
        {recent.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No runs yet.</div>
        ) : (
          recent.map((r) => (
            <a
              key={r.id}
              href={`/dashboard/runs/${r.id}`}
              style={{
                display: "block",
                padding: 14,
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                textDecoration: "none",
                color: "inherit"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{r.title}</div>
                  <div style={{ opacity: 0.7, marginTop: 2 }}>
                    {r.kind} • {r.id}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>{r.status}</div>
                  <div style={{ opacity: 0.7, marginTop: 2 }}>
                    {new Date(r.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </main>
  );
}

function btn(): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
    fontWeight: 600
  };
}
