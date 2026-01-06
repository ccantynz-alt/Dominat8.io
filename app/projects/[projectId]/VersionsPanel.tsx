"use client";

import { useEffect, useState } from "react";

type Version = {
  versionId: string;
  createdAt: string;
  prompt?: string;
};

export default function VersionsPanel({ projectId }: { projectId: string }) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rolling, setRolling] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/versions`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Failed to load versions");
      }

      setVersions(data.versions || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load versions");
    } finally {
      setLoading(false);
    }
  }

  async function rollback(versionId: string) {
    if (!confirm("Rollback to this version? This will update the public site.")) {
      return;
    }

    setRolling(versionId);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/versions/${versionId}/rollback`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Rollback failed");
      }

      alert("Rolled back successfully.");
    } catch (e: any) {
      alert(e?.message || "Rollback failed");
    } finally {
      setRolling(null);
    }
  }

  useEffect(() => {
    load();
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
      <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>
        Versions
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div style={{ color: "#991b1b", fontWeight: 800 }}>{error}</div>
      ) : versions.length === 0 ? (
        <div style={{ color: "#6b7280", fontWeight: 800 }}>
          No versions yet.
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
                <div style={{ fontSize: 12, color: "#6b7280" }}>
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
                  background:
                    rolling === v.versionId ? "#9ca3af" : "#111827",
                  color: "white",
                  fontWeight: 900,
                  cursor:
                    rolling === v.versionId ? "not-allowed" : "pointer",
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
