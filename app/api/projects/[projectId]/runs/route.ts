import { NextResponse } from "next/server";
import { kvJsonGet, kvJsonSet, kvNowISO } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

export const runtime = "nodejs";

function runsIndexKey(userId: string, projectId: string) {
  return `runs:index:${userId}:${projectId}`;
}
function runKey(userId: string, runId: string) {
  return `runs:${userId}:${runId}`;
}

export async function GET(_req: Request, { params }: { params: { projectId: string } }) {
  try {
    const userId = getCurrentUserId();
    const projectId = params?.projectId;

    if (!projectId) {
      return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
    }

    const ids = (await kvJsonGet<string[]>(runsIndexKey(userId, projectId))) || [];

    const runs: any[] = [];
    for (const id of ids) {
      const r = await kvJsonGet<any>(runKey(userId, id));
      if (r) runs.push(r);
    }

    return NextResponse.json({ ok: true, runs });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: `GET /api/projects/[projectId]/runs failed: ${String(e?.message || e)}` },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  try {
    const userId = getCurrentUserId();
    const projectId = params?.projectId;

    if (!projectId) {
      return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const runId = String(body.runId || "").trim();

    if (!runId) {
      return NextResponse.json({ ok: false, error: "Missing runId" }, { status: 400 });
    }

    // Attach runId to the project's runs index (if you want this route to be used)
    const ids = (await kvJsonGet<string[]>(runsIndexKey(userId, projectId))) || [];
    if (!ids.includes(runId)) {
      await kvJsonSet(runsIndexKey(userId, projectId), [runId, ...ids]);
    }

    // Optional: bump project updatedAt somewhere else if you track it
    const now = kvNowISO();
    return NextResponse.json({ ok: true, projectId, runId, updatedAt: now });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: `POST /api/projects/[projectId]/runs failed: ${String(e?.message || e)}` },
      { status: 500 }
    );
  }
}
