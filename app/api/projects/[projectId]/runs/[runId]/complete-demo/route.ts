// app/api/projects/[projectId]/runs/[runId]/complete-demo/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

async function requireProjectOwner(userId: string, projectId: string) {
  const project = (await kv.hgetall(`project:${projectId}`)) as any;
  if (!project?.id) return { ok: false as const, error: "PROJECT_NOT_FOUND" as const };
  if (project.userId !== userId) return { ok: false as const, error: "FORBIDDEN" as const };
  return { ok: true as const, project };
}

export async function POST(_req: Request, ctx: { params: { projectId: string; runId: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const { projectId, runId } = ctx.params;

  const ownerCheck = await requireProjectOwner(userId, projectId);
  if (!ownerCheck.ok) {
    const status = ownerCheck.error === "PROJECT_NOT_FOUND" ? 404 : 403;
    return NextResponse.json({ ok: false, error: ownerCheck.error }, { status });
  }

  const run = (await kv.hgetall(`run:${runId}`)) as any;
  if (!run?.id) {
    return NextResponse.json({ ok: false, error: "RUN_NOT_FOUND" }, { status: 404 });
  }
  if (run.projectId !== projectId || run.userId !== userId) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  const now = new Date().toISOString();
  const outputKey = `generated:${projectId}:${runId}`;

  // Demo HTML (later this will be real generator output)
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Generated Site</title>
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:40px;}
      .card{border:1px solid #e5e5e5;border-radius:12px;padding:20px;max-width:800px;}
      h1{margin:0 0 10px 0;}
      p{opacity:.85;line-height:1.5}
      code{background:#f6f6f6;padding:2px 6px;border-radius:6px}
      .small{opacity:.7;font-size:12px;margin-top:12px}
    </style>
  </head>
  <body>
    <div class="card">
      <h1>✅ Generated (Demo)</h1>
      <p>This HTML is stored at <code>${outputKey}</code>.</p>
      <p><b>Project:</b> <code>${projectId}</code></p>
      <p><b>Run:</b> <code>${runId}</code></p>
      <div class="small">Generated at ${now}</div>
    </div>
  </body>
</html>`;

  await kv.set(outputKey, html);

  await kv.hset(`run:${runId}`, {
    status: "complete",
    outputKey,
    completedAt: now,
  });

  // Track latest run on the project
  await kv.hset(`project:${projectId}`, {
    latestRunId: runId,
    updatedAt: now,
  });

  return NextResponse.json({ ok: true, runId, outputKey });
}
