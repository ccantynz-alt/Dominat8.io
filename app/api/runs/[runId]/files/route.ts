// app/api/runs/[runId]/files/route.ts
import { NextResponse } from "next/server";
import { kvJsonGet } from "@/app/lib/kv";
import { getCurrentUserId } from "@/app/lib/demoAuth";

function runKey(userId: string, runId: string) {
  return `runs:${userId}:${runId}`;
}

async function userIdOrDemo(): Promise<string> {
  const uid = await getCurrentUserId();
  return uid || "demo-user";
}

export async function GET(
  _req: Request,
  { params }: { params: { runId: string } }
) {
  const runId = params.runId;
  const userId = await userIdOrDemo();

  const run = await kvJsonGet<any>(runKey(userId, runId));

  if (!run) {
    return NextResponse.json({ ok: false, error: "Run not found" }, { status: 404 });
  }

  // This route is meant to return the generated files associated with a run.
  // If your run object stores files under `files`, return them; otherwise return [].
  const files = Array.isArray(run?.files) ? run.files : [];

  return NextResponse.json({ ok: true, runId, files });
}
