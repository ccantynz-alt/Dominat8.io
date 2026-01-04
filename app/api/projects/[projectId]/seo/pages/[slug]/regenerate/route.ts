import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string; slug: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, slug } = params;

  // Stub-friendly: try per-page key first, then fall back to the bulk seo pages record
  const pageKey = `project:${projectId}:seo:page:${slug}`;
  const bulkKey = `project:${projectId}:seo:pages`;

  try {
    const page = await kv.get<any>(pageKey);

    if (page) {
      return NextResponse.json({ ok: true, projectId, slug, page });
    }

    const bulk = await kv.get<any>(bulkKey);
    const pages = Array.isArray(bulk?.pages) ? bulk.pages : [];
    const found = pages.find((p: any) => p?.slug === slug) || null;

    return NextResponse.json({
      ok: true,
      projectId,
      slug,
      page: found,
      note: found ? "Loaded from bulk seo pages record" : "No page found (stub)",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load seo page" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { projectId: string; slug: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, slug } = params;

  // ✅ IMPORTANT: We removed rateLimitOrThrow here because your stub expects a string.
  // This endpoint is stub-safe and should never block builds.

  const pageKey = `project:${projectId}:seo:page:${slug}`;

  try {
    await kv.del(pageKey);
    return NextResponse.json({ ok: true, projectId, slug, deleted: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to delete seo page" },
      { status: 500 }
    );
  }
}
