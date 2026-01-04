import { NextResponse } from "next/server";

/**
 * TEMP STUB:
 * This route depended on missing alias imports (store, isAdmin, seo).
 * Keep build green. We'll implement site homepage routing later.
 */
export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  return NextResponse.json({
    ok: true,
    status: "stub",
    projectId: params.projectId,
    message: "Site root route stub (not implemented).",
  });
}
