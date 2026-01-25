import { NextResponse } from "next/server";

/**
 * BUILD-SAFE STUB (TEMP)
 * Marker: MM_BULK_ROUTE_STUB_V1
 *
 * marketingMachine bulk endpoint is disabled while homepage ships.
 */
export async function POST() {
  return NextResponse.json(
    { ok: false, disabled: true, reason: "marketing bulk endpoint temporarily disabled" },
    { status: 503 }
  );
}