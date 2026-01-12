import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  // ✅ FIX: must await auth()
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.projectId;
  const bulkKey = `project:${projectId}:seo:pages`;

  try {
    const bulk = await kv.get<any>(bulkKey);
    const pages = Array.isArray(bulk?.pages) ? bulk.pages : [];

    return NextResponse.json({
      ok: true,
      projectId,
      pages,
      note: "Stub SEO pages list. Wire real generator later.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load seo pages" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  // ✅ FIX: must await auth()
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.projectId;
  const bulkKey = `project:${projectId}:seo:pages`;

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const slug =
    typeof body?.slug === "string" && body.slug.trim()
      ? body.slug.trim()
      : `page-${Date.now()}`;

  const title =
    typeof body?.title === "string" && body.title.trim()
      ? body.title.trim()
      : `SEO Page ${slug}`;

  const description =
    typeof body?.description === "string"
      ? body.description.trim()
      : "Stub page description.";

  const newPage = {
    slug,
    title,
    description,
    createdAt: Date.now(),
    createdBy: userId,
  };

  try {
    const existing = await kv.get<any>(bulkKey);
    const pages = Array.isArray(existing?.pages) ? existing.pages : [];

    const nextPages = [newPage, ...pages.filter((p: any) => p?.slug !== slug)];
    await kv.set(bulkKey, { pages: nextPages, updatedAt: Date.now() });

    return NextResponse.json({ ok: true, projectId, page: newPage });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to save seo page" },
      { status: 500 }
    );
  }
}
