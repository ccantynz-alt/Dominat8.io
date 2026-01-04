import { NextResponse } from "next/server";

/**
 * TEMP STUB:
 * This endpoint depended on app/lib/analyticsKV which depended on missing kv alias.
 */
export async function POST() {
  return NextResponse.json({
    ok: true,
    status: "stub",
    message: "Analytics tracking disabled (stub).",
  });
}
