import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PublicPage({ params }: { params: { projectId: string } }) {
  const key = `published:${params.projectId}`;
  const html = (await kv.get<string>(key)) || "";

  if (!html) {
    return (
      <main style={{ padding: 32, fontFamily: "system-ui" }}>
        <h1>Not published</h1>
        <p>This project isn’t published yet (or no HTML exists).</p>
      </main>
    );
  }

  return (
    <main style={{ margin: 0, padding: 0 }}>
      <iframe title="site" srcDoc={html} style={{ width: "100%", height: "100vh", border: 0 }} />
    </main>
  );
}
