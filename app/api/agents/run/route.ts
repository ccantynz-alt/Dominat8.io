import { NextResponse } from "next/server";
import { kvJsonGet, kvJsonSet, kvNowISO } from "../../../lib/kv";
import { getCurrentUserId } from "../../../lib/demoAuth";

export async function POST(req: Request) {
  try {
    const userId = getCurrentUserId();
    const { projectId, prompt } = await req.json();

    if (!projectId || !prompt) {
      return NextResponse.json({ ok: false, error: "Missing input" }, { status: 400 });
    }

    const runId = `run_${Date.now()}`;
    const run = {
      id: runId,
      status: "completed",
      prompt,
      createdAt: kvNowISO(),
      files: [],
    };

    await kvJsonSet(`runs:${userId}:${runId}`, run);

    return NextResponse.json({ ok: true, runId });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Run failed" },
      { status: 500 }
    );
  }
}
