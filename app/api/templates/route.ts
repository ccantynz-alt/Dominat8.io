import { NextResponse } from "next/server";

/**
 * TEMP STUB:
 * This endpoint depended on missing internal lib (templatesKV) and alias imports.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    status: "stub",
    templates: [],
  });
}
