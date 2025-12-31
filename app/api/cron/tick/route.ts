import { NextResponse } from "next/server";
import { tickQueuedRuns } from "@/lib/runs";

export async function GET() {
  // Keep this endpoint simple and safe.
  // If you want secret protection, you can add CRON_SECRET checks later.
  const result = await tickQueuedRuns({ limit: 3 });
  return NextResponse.json({ ok: true, ...result });
}

export async function POST() {
  const result = await tickQueuedRuns({ limit: 3 });
  return NextResponse.json({ ok: true, ...result });
}
