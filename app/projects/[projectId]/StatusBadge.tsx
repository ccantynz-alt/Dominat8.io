"use client";

import { useEffect, useMemo, useState } from "react";

type StatusResp = {
  ok: boolean;
  projectId: string;
  publishedStatus: "published" | "unpublished";
  hasHtml: boolean;
  domain?: string | null;
  domainStatus?: "pending" | "verified" | null;
  error?: string;
};

export default function StatusBadge({ projectId }: { projectId: string }) {
  const [data, setData] = useState<StatusResp | null>(null);
  const [error, setError] = useState<string | null>(null);

  const label = useMemo(() => {
    if (error) return "Status error";
    if (!data) return "Loading…";
    if (!data.ok) return "Status error";

    const pub = data.publishedStatus === "published" ? "Published" : "Unpublished";
    const html = data.hasHtml ? "Has HTML" : "No HTML";
    return `${pub} • ${html}`;
  }, [data, error]);

  const badgeStyle = useMemo(() => {
    if (error) {
      return { background: "#991b1b", color: "white" };
    }
    if (!data) {
      return { background: "#6b7280", color: "white" };
    }
    if (data.publishedStatus === "published") {
      return { background: "#16a34a", color: "white" };
    }
    return { background: "#9ca3af", color: "white" };
  }, [data, error]);

  async function load() {
    try {
      setError(null);
      const res = await fetch(`/api/projects/${projectId}/status`, { cache: "no-store" });
      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("Status API returned non-JSON");
      }

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Status failed (${res.status})`);
      }

      setData(json);
    } catch (e: any) {
      setError(e?.message || "Status failed");
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span
        style={{
          padding: "6px 10px",
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 900,
          ...badgeStyle,
        }}
        title={error ? error : undefined}
      >
        {label}
      </span>

      {data?.domain ? (
        <span
          style={{
            padding: "6px 10px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 900,
            background: data.domainStatus === "verified" ? "#2563eb" : "#f59e0b",
            color: "white",
          }}
        >
          {data.domainStatus === "verified" ? `Domain: ${data.domain}` : "Domain: Pending"}
        </span>
      ) : (
        <span
          style={{
            padding: "6px 10px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 900,
            background: "#e5e7eb",
            color: "#374151",
          }}
        >
          No custom domain
        </span>
      )}
    </div>
  );
}
