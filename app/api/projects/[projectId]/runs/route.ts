// app/api/projects/[projectId]/runs/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

type Run = {
  id: string;
  projectId: string;
  userId: string;
  status: "queued" | "running" | "complete" | "failed";
  prompt: string;
  createdAt: string;
  completedAt?: string;
  outputKey?: string; // KV key where generated HTML is stored
};

async function requireProjectOwnership(userId: string, projectId: string) {
  const project = await kv.hgetall<Record<string, any>>(`project:${projectId}`);
  if (!project || project.userId !== userId) return null;
  return project;
}

export async function GET(_: Request, ctx: { params: { projectId: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const { projectId } = ctx.params;

  const project = await requireProjectOwnership(userId, projectId);
  if (!project) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  const runIds = (await kv.lrange(`project:${projectId}:runs`, 0, 50)) as string[];

  const runs: Run[] = [];
  for (const runId of runIds) {
    const run = await kv.hgetall<Run>(`run:${runId}`);
    if (run) runs.push(run);
  }

  return NextResponse.json({ ok: true, runs });
}

export async function POST(req: Request, ctx: { params: { projectId: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const { projectId } = ctx.params;

  const project = await requireProjectOwnership(userId, projectId);
  if (!project) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as { prompt?: string } | null;
  const prompt = (body?.prompt || "Generate a modern website.").toString().slice(0, 2000);

  const runId = `run_${crypto.randomUUID().replaceAll("-", "")}`;
  const now = new Date().toISOString();
  const outputKey = `generated:${projectId}:${runId}`;

  const run: Run = {
    id: runId,
    projectId,
    userId,
    status: "complete",
    prompt,
    createdAt: now,
    completedAt: now,
    outputKey,
  };

  // ✅ Stub “generation”: store a basic HTML page now (we’ll replace with real agent later)
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(project.name || "My Site")}</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:0;padding:40px;background:#fafafa}
    .card{max-width:900px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:16px;padding:24px}
    h1{margin:0 0 12px;font-size:34px}
    p{opacity:.85;line-height:1.5}
    code{background:#f3f3f3;padding:2px 6px;border-radius:8px}
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(project.name || "New Project")}</h1>
    <p><b>Generated from prompt:</b></p>
    <p>${escapeHtml(prompt)}</p>
    <p><b>Project:</b> <code>${escapeHtml(projectId)}</code></p>
    <p><b>Run:</b> <code>${escapeHtml(runId)}</code></p>
    <p>This is a safe stub. Next step: replace generation with your real agent output.</p>
  </div>
</body>
</html>`;

  await kv.set(outputKey, html);

  // Store run
  await kv.hset(`run:${runId}`, run);

  // Index by project
  await kv.lpush(`project:${projectId}:runs`, runId);

  // Touch project updatedAt
  await kv.hset(`project:${projectId}`, { updatedAt: now });

  return NextResponse.json({ ok: true, run });
}

// very small safe escape for HTML
function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
