import { kv } from "@vercel/kv";
import Link from "next/link";

export const runtime = "nodejs";

function asText(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export default async function PublicProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params?.projectId || "";

  // IMPORTANT: This must match what publish writes.
  const publishedKey = `published:project:${projectId}:latest`;

  let html = "";
  try {
    const v = await kv.get(publishedKey);
    html = asText(v);
  } catch {
    html = "";
  }

  if (!html) {
    return (
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26 }}>This site isn’t published yet</h1>
        <p style={{ marginTop: 12, opacity: 0.8 }}>
          The project exists, but it hasn’t been published. Go back to the builder
          and click Publish.
        </p>

        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href="/projects"
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Back to Projects
          </Link>

          <Link
            href={`/projects/${projectId}`}
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "#fff",
              color: "#111",
              textDecoration: "none",
            }}
          >
            Back to Builder
          </Link>
        </div>

        <div style={{ marginTop: 18, opacity: 0.6, fontSize: 12 }}>
          Debug: no HTML found at key <code>{publishedKey}</code>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Published site</div>
          <div style={{ opacity: 0.7, marginTop: 4 }}>
            Project: <code>{projectId}</code>
          </div>
        </div>

        <Link
          href={`/projects/${projectId}`}
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: "#fff",
            color: "#111",
            textDecoration: "none",
          }}
        >
          Back to builder
        </Link>
      </div>

      <iframe
        title="published"
        style={{
          width: "100%",
          height: "82vh",
          border: "1px solid #ddd",
          borderRadius: 14,
          background: "#fff",
        }}
        srcDoc={html}
      />
    </main>
  );
}
