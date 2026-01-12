import { NextResponse } from "next/server";

/**
 * TEMP STUB:
 * This route depended on missing alias imports (store, isAdmin, seo, programPagesKV).
 * Keep build green. We'll implement program pages later.
 */
export async function GET(
  _req: Request,
  { params }: { params: { projectId: string; category: string; slug: string } }
) {
  return NextResponse.json({
    ok: true,
    status: "stub",
    projectId: params.projectId,
    category: params.category,
    slug: params.slug,
    message: "Program page route stub (not implemented).",
  });
}
