import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

// ✅ MARKER: SEO_SLUG_ROUTE_V2_NO_RATELIMIT

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string; slug: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, slug } = params;

  const pageKey = `project:${projectId}:seo:page:${slug}`;
  const bulkKey = `project:${projectId}:seo:pages`;

  try {
    const page = await kv.get<any>(pageKey);

    if (page) {
      return NextResponse.json({
        ok: true,
        projectId,
        slug,
        page,
        marker: "SEO_SLUG_ROUTE_V2_NO_RATELIMIT",
      });
    }

    const bulk = await kv.get<any>(bulkKey);
    const pages = Array.isArray(bulk?.pages) ? bulk.pages : [];
    const found = pages.find((p: any) => p?.slug === slug) || null;

    return NextResponse.json({
      ok: true,
      projectId,
      slug,
      page: found,
      marker: "SEO_SLUG_ROUTE_V2_NO_RATELIMIT",
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

  // ✅ rateLimitOrThrow removed on purpose (stub was incompatible)
  const pageKey = `project:${projectId}:seo:page:${slug}`;

  try {
    await kv.del(pageKey);
    return NextResponse.json({
      ok: true,
      projectId,
      slug,
      deleted: true,
      marker: "SEO_SLUG_ROUTE_V2_NO_RATELIMIT",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to delete seo page" },
      { status: 500 }
    );
  }
}
