import { NextResponse } from "next/server";

/**
 * TEMP STUB:
 * This route depended on missing alias imports (store, isAdmin, seo).
 * Keep build green. Later we can implement dynamic site routing.
 */
export async function GET(
  _req: Request,
  { params }: { params: { projectId: string; slug?: string[] } }
) {
  const slugPath = Array.isArray(params.slug) ? params.slug.join("/") : "";

  return NextResponse.json({
    ok: true,
    status: "stub",
    projectId: params.projectId,
    slug: slugPath,
    message: "Site dynamic route stub (not implemented).",
  });
}
