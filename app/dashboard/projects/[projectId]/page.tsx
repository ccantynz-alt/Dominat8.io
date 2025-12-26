// app/dashboard/projects/[projectId]/page.tsx
import Link from "next/link";

async function getRuns(projectId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/projects/${projectId}/runs`,
    { cache: "no-store" }
  ).catch(() => null);

  if (!res || !res.ok) return { runs: [] as any[] };
  return res.json();
}

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const data = await getRuns(projectId);
  const runs = data?.runs ?? [];

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <p>
        <Link href="/dashboard">← Back</Link>
      </p>

      <h1>Project: {projectId}</h1>

      <p style={{ marginTop: 16 }}>
        <Link href={`/dashboard/projects/${projectId}/new-run`}>▶ New Run</Link>
      </p>

      <h2 style={{ marginTop: 24 }}>Runs</h2>
      <ul>
        {runs.map((r: any) => (
          <li key={r.id}>
            <Link href={`/dashboard/runs/${r.id}`}>{r.id}</Link> — {r.status}
          </li>
        ))}
      </ul>
    </main>
  );
}
