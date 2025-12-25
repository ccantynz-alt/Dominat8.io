// app/api/runs/[runId]/logs/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { KV } from "../../../../lib/kv";
import { keys } from "../../../../lib/keys";

export async function GET(
  _req: Request,
  { params }: { params: { runId: string } }
) {
  try {
    const logs = await KV.lrange(keys.runLogs(params.runId), 0, -1);
    return NextResponse.json({ ok: true, logs });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        where: "/api/runs/[runId]/logs GET",
        message: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
