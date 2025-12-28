import { NextResponse } from "next/server";
import { kv } from "../../../../../lib/kv";
import { getCurrentUserId } from "../../../../../lib/demoAuth";

type LogEntry = {
  ts: string;
  level: "info" | "warn" | "error";
  message: string;
};

function logsKey(userId: string, runId: string) {
  return `runs:logs:${userId}:${runId}`;
}

export async function POST(
  req: Request,
  { params }: { params: { runId: string } }
) {
  try {
    const userId = getCurrentUserId();
    const runId = params.runId;

    const body = await req.json().catch(() => ({}));
    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level: (body.level as any) || "info",
      message: String(body.message || ""),
    };

    const key = logsKey(userId, runId);

    // Store as a list in KV
    await kv.rpush(key, JSON.stringify(entry));

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
