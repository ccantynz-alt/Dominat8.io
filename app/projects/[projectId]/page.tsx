import { kv } from "@vercel/kv";
import Link from "next/link";

import GeneratePanel from "./GeneratePanel";
import StatusBadge from "./StatusBadge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readProjectAny(projectId: string) {
  const key = `project:${projectId}`;

  // 1) Try HASH first
  try {
    const hash = await kv.hgetall<any>(key);
    if (hash && Object.keys(hash).length > 0) return hash;
  } catch {
    // ignore WRONGTYPE etc; fall back to GET
  }

  // 2) Fall back to JSON/string
  try {
    const obj = await kv.get<any>(key);
    if (obj) return obj;
  } catch {
    // ignore
  }

  return null;
}

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;

  const project = await readProjectAny(projectId);

  if (!project) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>Project not found</h1>
        <p style={{ marginTop: 10 }}>
          This project ID does not exist in KV:
          <span style={{ fontWeight: 900 }}> {projectId}</span>
        </p>
        <div style={{ marginTop: 14 }}>
          <Link href="/projects" style={{ color: "#2563eb", fontWeight: 900 }}>
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const name = project.name ?? "Untitled";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>
            {name}
          </h1>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{projectId}</div>
        </div>

        <div style={{ alignSelf: "center" }}>
          <StatusBadge projectId={projectId} />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Link href="/projects" style={{ color: "#2563eb", fontWeight: 900 }}>
          ← Back to Projects
        </Link>
        <span style={{ marginLeft: 14 }}>
          <a
            href={`/p/${projectId}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#16a34a", fontWeight: 900 }}
          >
            Open public page →
          </a>
        </span>
      </div>

      <div style={{ marginTop: 18 }}>
        <GeneratePanel projectId={projectId} />
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: "#6b7280" }}>
        If you want, we can re-add Versions / Domain / Admin panels here next
        after the crash is gone.
      </div>
    </div>
  );
}
