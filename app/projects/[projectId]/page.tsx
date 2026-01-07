import { kv } from "@vercel/kv";
import Link from "next/link";

import GeneratePanel from "./GeneratePanel";
import StatusBadge from "./StatusBadge";
import VersionsPanel from "./VersionsPanel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readProjectAny(projectId: string) {
  const key = `project:${projectId}`;

  // 1) Try HASH first
  try {
    const hash = await kv.hgetall<any>(key);
    if (hash && Object.keys(hash).length > 0) return hash;
  } catch {}

  // 2) Fallback JSON/string
  try {
    const obj = await kv.get<any>(key);
    if (obj) return obj;
  } catch {}

  return null;
}

async function registerInIndex(projectId: string) {
  try {
    await kv.lpush("projects:index", projectId);
  } catch {
    // ignore
  }
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
        <div style={{ marginTop: 12 }}>
          <Link href="/projects" style={{ color: "#2563eb", fontWeight: 900 }}>
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  // ✅ backfill index so /projects can list it
  await registerInIndex(projectId);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900 }}>
            {project.name ?? "Untitled"}
          </h1>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{projectId}</div>
        </div>

        <StatusBadge projectId={projectId} />
      </div>

      <div style={{ marginTop: 16 }}>
        <Link href="/projects" style={{ fontWeight: 900, color: "#2563eb" }}>
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

      <div style={{ marginTop: 20 }}>
        <GeneratePanel projectId={projectId} />
      </div>

      <div style={{ marginTop: 20 }}>
        <VersionsPanel projectId={projectId} />
      </div>
    </div>
  );
}
