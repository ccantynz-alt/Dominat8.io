// app/dashboard/runs/[runId]/page.tsx
import Link from "next/link";

async function getRun(runId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/runs/${runId}`, {
    cache: "no-store",
  }).catch(() => null);

  if (!res || !res.ok) return null;
  return res.json();
}

async function getLogs(runId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/runs/${runId}/logs`, {
    cache: "no-store",
  }).catch(() => null);

  if (!res || !res.ok) return { logs: [] as any[] };
  return res.json();
}

async function getFiles(runId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/runs/${runId}/files`, {
    cache: "no-store",
  }).catch(() => null);

  if (!res || !res.ok) return { files: [] as any[] };
  return res.json();
}

export default async function RunPage({ params }: { params: { runId: string } }) {
  const runData = await getRun(params.runId);
  const logsData = await getLogs(params.runId);
  const filesData = await getFiles(params.runId);

  const run = runData?.run;
  const logs = logsData?.logs ?? [];
  const files = filesData?.files ?? [];

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <p>
        <Link href="/dashboard">← Dashboard</Link>
      </p>

      <h1>Run: {params.runId}</h1>

      {!run ? (
        <p>Run not found.</p>
      ) : (
        <>
          <p>Status: <b>{run.status}</b></p>
          {run.error && <p style={{ color: "crimson" }}>Error: {run.error}</p>}

          <h2 style={{ marginTop: 24 }}>Logs</h2>
          <pre style={{ background: "#111", color: "#eee", padding: 12, overflowX: "auto" }}>
            {logs.map((l: any) => `[${l.ts}] ${l.level.toUpperCase()} ${l.msg}`).join("\n")}
          </pre>

          <h2 style={{ marginTop: 24 }}>Generated Files</h2>
          {files.length === 0 ? (
            <p>No files generated yet.</p>
          ) : (
            <ul>
              {files.map((f: any) => (
                <li key={f.path}>
                  <code>{f.path}</code>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
{/* Show only when succeeded + has files (adjust to match your local variables) */}
{run?.status === "succeeded" && files?.length > 0 && (
  <a
    href={`/api/runs/${runId}/zip`}
    className="inline-flex items-center rounded-md border px-3 py-2 text-sm"
  >
    Download ZIP
  </a>
)}
