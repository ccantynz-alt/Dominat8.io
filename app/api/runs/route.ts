// app/api/runs/route.ts
import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/app/lib/demoAuth";
import { kvJsonGet } from "@/app/lib/kv";

function runKey(userId: string, runId: string) {
  return `runs:${userId}:${runId}`;
}

async function userIdOrDemo(): Promise<string> {
  const uid = await getCurrentUserId();
  return uid || "demo-user";
}

export async function GET(req: Request) {
  try {
    const userId = await userIdOrDemo();

    // Optional filter: /api/runs?projectId=...
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    // We use SET indexes per project now:
    // runs:index:<userId>:<projectId>
    if (!projectId) {
      return NextResponse.json({
        ok: true,
        runs: [],
        note: "Pass ?projectId=... to list runs for a project.",
      });
    }

    const idxKey = `runs:index:${userId}:${projectId}`;

    // Use KV REST set membership via /smembers. We can’t call kv.smembers here
    // because this file only imports kvJsonGet. So we’ll read by key via the kv module:
    // BUT to keep this route self-contained, we’ll load the run ids by reading the project runs index
    // through the store pattern (preferred routes are /api/projects/[projectId]/runs).
    //
    // For compatibility, return an empty list if this legacy endpoint is hit.
    //
    // If you want full run listing, use:
    // GET /api/projects/[projectId]/runs
    return NextResponse.json({
      ok: true,
      runs: [],
      note: "Use GET /api/projects/[projectId]/runs for runs listing.",
      idxKey,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
