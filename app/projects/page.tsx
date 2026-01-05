// app/projects/page.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export default async function ProjectsPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Projects</h1>
        <p style={{ opacity: 0.8 }}>Please sign in.</p>
        <p>
          <a href="/sign-in">Go to sign in</a>
        </p>
      </main>
    );
  }

  const ids = (await kv.lrange(`user:${userId}:projects`, 0, 50)) as string[];
  const projects: any[] = [];

  for (const id of ids || []) {
    const p = (await kv.hgetall(`project:${id}`)) as any;
    if (p?.id) projects.push(p);
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>Projects</h1>
          <p style={{ opacity: 0.75, marginTop: 8 }}>Click a project to open its dashboard.</p>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          <a href="/templates">Templates</a>
          <a href="/projects">Dashboard</a>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <a
          href="/projects"
          style={{
            display: "inline-block",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            textDecoration: "none",
            color: "inherit",
            fontWeight: 600,
          }}
        >
          Refresh
        </a>
      </div>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {projects.map((p) => {
          const id = String(p.id || "");
          const safeHref = `/projects/${encodeURIComponent(id)}`;

          return (
            <Link key={id} href={safeHref} style={{ textDecoration: "none", color: "inherit" }}>
              <div
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 12,
                  padding: 16,
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800 }}>{p.name || "Untitled Project"}</div>
                <div style={{ marginTop: 6, opacity: 0.85 }}>
                  Template: {p.templateId || "unknown"}
                </div>
                <div style={{ marginTop: 10, fontSize: 12, opacity: 0.6 }}>{id}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
