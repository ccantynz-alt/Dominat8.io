import { NextResponse } from "next/server";
import { nowISO } from "../../../../../lib/runs";
import { getCurrentUserId } from "../../../../lib/demoAuth";
import { storeGet } from "../../../../lib/store";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { runId: string } }
) {
  const userId = getCurrentUserId();
  const run = await storeGet(`runs:${userId}:${params.runId}`);

  return NextResponse.json({
    ok: true,
    runId: params.runId,
    run: run ?? null,
    files: [],
    ts: nowISO()
  });
}
