// app/api/runs/[runId]/files/route.ts
import { NextResponse } from "next/server";
import { kvJsonGet } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function runKey(userId: string, runId: string) {
  return "runs:" + userId + ":" + runId;
}

export async function GET(
  _req: Request,
  { params }: { params: { runId: string } }
) {
  try {
    const runId = params?.runId;
    if (!runId) {
      return NextResponse.json(
        { ok: false, error: "Missing runId" },
        { status: 400 }
      );
    }

    const userId =
      (typeof getCurrentUserId === "function" && getCurrentUserId()) || "demo";

    const run = await kvJsonGet(runKey(userId, runId));

    if (!run) {
      return NextResponse.json(
        { ok: false, error: "Run not found", runId },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      runId,
      files: run.files || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
