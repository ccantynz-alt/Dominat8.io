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

    // FINGERPRINT: if you ever see this header, you KNOW this file is the one being executed.
    const res = NextResponse.json({ ok: true, logs, fingerprint: "logs-route-v1" });
    res.headers.set("x-logs-route-fingerprint", "logs-route-v1");
    return res;
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        where: "/api/runs/[runId]/logs GET",
        message: err?.message ?? "Unknown error",
        fingerprint: "logs-route-v1",
      },
      { status: 500 }
    );
  }
}
