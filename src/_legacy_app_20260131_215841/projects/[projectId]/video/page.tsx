import React from "react";
import { kvGetJson, projectVideoKey } from "@/lib/d8kv";

export const runtime = "nodejs";

type Props = { params: { projectId: string } };

export default async function Page({ params }: Props) {
  const projectId = params.projectId;
  const meta = await kvGetJson<any>(projectVideoKey(projectId));

  return (
    <main style={{ minHeight: "100vh", background: "#07060b", color: "rgba(246,242,255,0.92)", padding: 18 }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 950, letterSpacing: "-0.01em" }}>
          Project Video — {projectId}
        </h1>

        {!meta?.url ? (
          <p style={{ marginTop: 10, lineHeight: 1.6, color: "rgba(237,234,247,0.72)" }}>
            No video published yet. Go to <b>/video</b>, record, then click <b>Publish to Project</b>.
          </p>
        ) : (
          <>
            <p style={{ marginTop: 10, lineHeight: 1.6, color: "rgba(237,234,247,0.72)" }}>
              Latest published video:
            </p>

            <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.25)" }}>
              <video controls playsInline style={{ width: "100%", display: "block" }} src={meta.url} />
            </div>

            <div style={{ marginTop: 10, fontSize: 12, color: "rgba(237,234,247,0.60)", fontWeight: 800 }}>
              URL: <a href={meta.url} style={{ color: "rgba(255,215,140,0.92)" }}>{meta.url}</a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}