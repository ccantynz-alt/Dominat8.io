import { NextResponse } from "next/server";
import { kvNowISO } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../lib/demoAuth";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { threadId: string } }
) {
  return NextResponse.json({
    ok: true,
    userId: getCurrentUserId(),
    threadId: params.threadId,
    messages: [],
    ts: kvNowISO()
  });
}
