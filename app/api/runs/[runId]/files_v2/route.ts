import { NextResponse } from "next/server";
import { kvJsonGet } from "../../../../../lib/kv";
import { getCurrentUserId } from "../../../../../lib/demoAuth";

export const runtime = "nodejs";

function runFilesKey(userId: string, runId: string) {
  // Must match what your agent run route writes
  return `runfiles:${userId}:${runId}`;
}

export async function GET(_req: Request, { params }: { params: { runId: string } }) {
  try {
    const userId = getCurrentUserId();
    const runId = params?.runId;

    if (!runId) {
      return NextResponse.json({ ok: false, error: "Missing runId" }, { status: 400 });
    }

    const files = (await kvJsonGet<any[]>(runFilesKey(userId, runId))) || [];
    return NextResponse.json({ ok: true, runId, files });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: `GET /api/runs/[runId]/files_v2 failed: ${String(e?.message || e)}` },
      { status: 500 }
    );
  }
}
