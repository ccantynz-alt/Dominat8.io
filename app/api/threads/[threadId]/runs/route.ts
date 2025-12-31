import { NextResponse } from "next/server";
import { listThreadRuns } from "@/lib/runs";

export async function GET(
  _req: Request,
  { params }: { params: { threadId: string } }
) {
  const threadId = params.threadId;
  const runs = await listThreadRuns(threadId);
  return NextResponse.json({ ok: true, runs });
}
