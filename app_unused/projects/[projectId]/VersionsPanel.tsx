"use client";

import { useEffect, useState } from "react";

type Version = {
  versionId: string;
  createdAt: string;
  prompt?: string;
  key?: string;
};

export default function VersionsPanel({ projectId }: { projectId: string }) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rolling, setRolling] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/versions`, {
        cache: "no-store",
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Versions API returned non-JSON");
      }

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || `Failed to load versions (${res.status})`);
      }

      setVersions(data.versions || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load versions");
    } finally {
      setLoading(false);
    }
  }

  async function rollback(versionId: string) {
    if (!confirm("Rollback to this version? This updates the public site.")) {
      return;
    }

    setRolling(versionId);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/versions/${versionId}/rollback`,
        { method: "POST" }
      );

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Rollback API returned non-JSON");
      }

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || `Rollback failed (${res.status})`);
      }

      alert("Rolled back successfully.");
      await load();
    } catch (e: any) {
      alert(e?.message || "Rollback failed");
    } finally {
      setRolling(null);
    }
  }

  useEffect(() => {
    load();

    // Auto-refresh every 10s
    const interval = setInterval(load, 10000);

    // Refresh immediately when GeneratePanel broadcasts
    const handler = (evt: any) => {
      const incomingProjectId = evt?.detail?.projectId;
      if (incomingProjectId === projectId) {
        load();
      }
    };

    window.addEventListener("rovez:versions:update", handler);

    return () => {
      clearInterval(interval);
      window.removeEventListener("rovez:versions:update", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 10,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 900 }}>Versions</div>

        <button
          onClick={load}
          disabled={loading}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            background: loading ? "#f3f4f6" : "white",
            fontWeight: 900,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error ? (
        <div style={{ color: "#991b1b", fontWeight: 900 }}>{error}</div>
      ) : loading ? (
        <div style={{ color: "#6b7280", fontWeight: 900 }}>Loading…</div>
      ) : versions.length === 0 ? (
        <div style={{ color: "#6b7280", fontWeight: 900 }}>
          No versions yet. Click “Generate & Publish” above.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {versions.map((v) => (
            <div
              key={v.versionId}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div>
                <div style={{ fontWeight: 900, fontSize: 13 }}>
                  {v.versionId}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                  {new Date(v.createdAt).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => rollback(v.versionId)}
                disabled={rolling === v.versionId}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #111827",
                  background: rolling === v.versionId ? "#9ca3af" : "#111827",
                  color: "white",
                  fontWeight: 900,
                  cursor: rolling === v.versionId ? "not-allowed" : "pointer",
                }}
              >
                {rolling === v.versionId ? "Rolling…" : "Rollback"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
