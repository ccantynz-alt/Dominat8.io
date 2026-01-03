import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { getRun, saveRun } from "@/lib/runStore";

export const dynamic = "force-dynamic";

function noStore(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

// POST /api/projects/:projectId/runs/:runId/execute
export async function POST(
  _req: Request,
  { params }: { params: { projectId: string; runId: string } }
) {
  const { projectId, runId } = params;

  const run = await getRun(projectId, runId);
  if (!run) return noStore({ ok: false, error: "Run not found" }, 404);

  // 1) mark running
  run.status = "running";
  await saveRun(run);

  // 2) Placeholder "generated website" HTML
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Generated Site</title>
    <style>
      body { font-family: sans-serif; margin: 0; padding: 40px; background: #fafafa; }
      .card { max-width: 900px; margin: 0 auto; background: white; border: 1px solid #ddd; border-radius: 14px; padding: 24px; }
      h1 { margin: 0 0 10px; }
      .meta { color: #666; font-size: 14px; margin-bottom: 16px; }
      pre { background: #f7f7f7; padding: 12px; border-radius: 12px; white-space: pre-wrap; }
      .btn { display:inline-block; margin-top: 14px; padding: 10px 14px; border-radius: 10px; border: 1px solid #ddd; text-decoration:none; color:#111; background:#fff; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>✅ Generated Website (Placeholder)</h1>
      <div class="meta"><b>Project:</b> ${projectId} &nbsp; | &nbsp; <b>Run:</b> ${runId}</div>
      <div class="meta"><b>Status:</b> complete</div>

      <h2>Prompt</h2>
      <pre>${escapeHtml(run.prompt)}</pre>

      <h2>What happens next?</h2>
      <p>This is placeholder output. Next step is to replace this with real AI generation.</p>

      <a class="btn" href="/runs/latest">View Latest Run Output</a>
      <a class="btn" href="/projects">Back to Projects</a>
    </div>
  </body>
</html>`;

  // Save generated HTML into KV so /generated can display it
  await kv.set("generated:latest", {
    projectId,
    runId,
    html,
    createdAt: new Date().toISOString(),
  });

  // 3) mark complete + store output
  const output = [
    `✅ Generated output for project: ${projectId}`,
    `✅ Run: ${runId}`,
    `✅ Prompt: ${run.prompt}`,
    "",
    "Saved placeholder website HTML to KV key: generated:latest",
    "Next step: replace placeholder generation with real AI generation.",
  ].join("\n");

  run.status = "complete";
  run.output = output;
  run.completedAt = new Date().toISOString();

  await saveRun(run);

  return noStore({ ok: true, run });
}

// tiny helper to keep HTML safe
function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
