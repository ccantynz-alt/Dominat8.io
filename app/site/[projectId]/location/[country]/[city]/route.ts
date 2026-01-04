import { NextResponse } from "next/server";

/**
 * TEMP STUB:
 * This route depended on missing alias imports (store).
 * Keep build green.
 */
export async function GET(
  _req: Request,
  { params }: { params: { projectId: string; country: string; city: string } }
) {
  return NextResponse.json({
    ok: true,
    status: "stub",
    projectId: params.projectId,
    country: params.country,
    city: params.city,
    message: "Location route stub (not implemented).",
  });
}
