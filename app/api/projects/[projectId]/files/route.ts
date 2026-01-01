import { NextResponse } from "next/server";
import { kvNowISO } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  return NextResponse.json({
    ok: true,
    userId: await getCurrentUserId(),
    projectId: params.projectId,
    files: [],
    ts: kvNowISO()
  });
}
