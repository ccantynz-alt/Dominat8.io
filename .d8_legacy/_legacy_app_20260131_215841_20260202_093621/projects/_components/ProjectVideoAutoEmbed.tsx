import React from "react";
import { kvGetJson, projectVideoKey } from "@/lib/d8kv";

export const runtime = "nodejs";

export async function ProjectVideoAutoEmbed(props: { projectId: string }) {
  const projectId = props.projectId;
  const meta = await kvGetJson<any>(projectVideoKey(projectId));

  // IMPORTANT: No video => NO UI CHANGE
  if (!meta?.url) return null;

  return (
    <section
      data-d8="project-video-embed"
      style={{
        width: "100%",
        maxWidth: 1160,
        margin: "18px auto 0 auto",
        padding: "0 16px 18px 16px",
      }}
    >
      <div
        style={{
          borderRadius: 18,
          padding: 14,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 18px 55px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 950, fontSize: 14, color: "rgba(246,242,255,0.92)" }}>
            Latest Project Video
          </div>
          {meta?.createdAtIso && (
            <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(237,234,247,0.55)" }}>
              {new Date(meta.createdAtIso).toLocaleString()}
            </div>
          )}
        </div>

        <div style={{ marginTop: 10, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.25)" }}>
          <video controls playsInline style={{ width: "100%", display: "block" }} src={meta.url} />
        </div>

        <div style={{ marginTop: 10, fontSize: 12, fontWeight: 800, color: "rgba(237,234,247,0.62)" }}>
          Manage: <a href={`/projects/${encodeURIComponent(projectId)}/video`} style={{ color: "rgba(255,215,140,0.92)" }}>/projects/{projectId}/video</a>
        </div>
      </div>
    </section>
  );
}