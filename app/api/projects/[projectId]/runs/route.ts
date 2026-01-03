import { NextResponse } from "next/server";
import { createRun, listRuns } from "@/lib/runStore";

// force dynamic + no cache
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

// GET /api/projects/:projectId/runs
export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const runs = await listRuns(params.projectId);

  return noStore({
    ok: true,
    runs: runs ?? [],
  });
}

// POST /api/projects/:projectId/runs
export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const body = await req.json().catch(() => null);

  if (!body?.prompt) {
    return noStore({ ok: false, error: "Missing prompt" }, 400);
  }

  const run = await createRun(params.projectId, String(body.prompt));

  if (!run) {
    return noStore({ ok: false, error: "KV not available" }, 500);
  }

  return noStore({
    ok: true,
    run,
  });
}
