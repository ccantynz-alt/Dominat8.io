import { NextResponse } from "next/server";
import { kvJsonSet, kvNowISO } from "../../../lib/kv";
import { getCurrentUserId } from "../../../lib/demoAuth";

export async function POST(req: Request) {
  try {
    const userId = getCurrentUserId();
    const body = await req.json();
    const { projectId, prompt } = body || {};

    if (!projectId || !prompt) {
      return NextResponse.json(
        { ok: false, error: "Missing projectId or prompt" },
        { status: 400 }
      );
    }

    const runId = `run_${Date.now()}`;

    await kvJsonSet(`runs:${userId}:${runId}`, {
      id: runId,
      projectId,
      prompt,
      status: "completed",
      createdAt: kvNowISO(),
      files: [],
    });

    return NextResponse.json({ ok: true, runId });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Agent failed" },
      { status: 500 }
    );
  }
}
