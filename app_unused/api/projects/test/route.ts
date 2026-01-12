import { NextResponse } from "next/server";

/**
 * TEMP STUB:
 * This endpoint depended on missing internal lib (kvStore) and alias imports.
 * Safe placeholder to keep builds green.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    status: "stub",
    message: "Test endpoint stub (kvStore not wired).",
  });
}
