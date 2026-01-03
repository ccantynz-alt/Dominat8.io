import { NextResponse } from "next/server";
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

  // 2) fake "generation" output for now
  const output = [
    `✅ Generated output for project: ${projectId}`,
    `✅ Run: ${runId}`,
    `✅ Prompt: ${run.prompt}`,
    "",
    "This is placeholder output.",
    "Next step: replace this with real AI generation and write files to app/generated/page.tsx",
  ].join("\n");

  // 3) mark complete + store output
  run.status = "complete";
  run.output = output;
  run.completedAt = new Date().toISOString();

  await saveRun(run);

  return noStore({ ok: true, run });
}
