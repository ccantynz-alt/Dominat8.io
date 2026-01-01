import { NextResponse } from "next/server";
import { kvNowISO } from "@/app/lib/kv";
import { getCurrentUserId } from "@/app/lib/demoAuth";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const userId = getCurrentUserId();

  return NextResponse.json({
    ok: true,
    userId,
    projectId: params.projectId,
    ts: kvNowISO()
  });
}
