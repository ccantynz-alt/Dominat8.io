import { kv } from "@vercel/kv";
import Link from "next/link";

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

  // 2) Fallback to JSON/string
  try {
    const obj = await kv.get<any>(key);
    if (obj) return obj;
  } catch {
    // ignore
  }

  return null;
}

export default async function PublicProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;

  const project = await readProjectAny(projectId);

  if (!project) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>Not found</h1>
        <p style={{ marginTop: 10 }}>
          Project <span style={{ fontWeight: 900 }}>{projectId}</span> does not exist.
        </p>
        <div style={{ marginTop: 14 }}>
          <Link href="/projects" style={{ color: "#2563eb", fontWeight: 900 }}>
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const published = project.published === true;

  if (!published) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>Not published</h1>
        <p style={{ marginTop: 10, color: "#374151", fontWeight: 700 }}>
          This project isn’t published yet.
        </p>
        <div style={{ marginTop: 14 }}>
          <Link
            href={`/projects/${projectId}`}
            style={{ color: "#2563eb", fontWeight: 900 }}
          >
            ← Go to Project
          </Link>
        </div>
      </div>
    );
  }

  const htmlKey = `generated:project:${projectId}:latest`;
  const html = await kv.get<string>(htmlKey);

  const hasHtml = typeof html === "string" && html.trim().length > 0;

  if (!hasHtml) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>No generated site yet</h1>
        <p style={{ marginTop: 10, color: "#374151", fontWeight: 700 }}>
          This project is published, but it has no generated HTML saved yet.
        </p>
        <div style={{ marginTop: 14 }}>
          <Link
            href={`/projects/${projectId}`}
            style={{ color: "#2563eb", fontWeight: 900 }}
          >
            ← Go to Project
          </Link>
        </div>
      </div>
    );
  }

  // Render as an iframe so full HTML documents display correctly
  return (
    <div style={{ height: "100vh", width: "100vw", margin: 0, padding: 0 }}>
      <iframe
        title={`Public site for ${projectId}`}
        srcDoc={html}
        style={{ border: "none", width: "100%", height: "100%" }}
        sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
      />
    </div>
  );
}
