import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string; slug: string } }
) {
  // ✅ FIX: auth() must be awaited in your current Clerk typings/build
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, slug } = params;

  // Optional body (stub-friendly)
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const title =
    typeof body?.title === "string"
      ? body.title.trim()
      : `SEO Page: ${slug}`;

  const description =
    typeof body?.description === "string"
      ? body.description.trim()
      : `Stub regenerated content for ${slug}. Wire AI later.`;

  const record = {
    slug,
    title,
    description,
    regeneratedAt: Date.now(),
    regeneratedBy: userId,
  };

  // Store per-page record
  const pageKey = `project:${projectId}:seo:page:${slug}`;

  try {
    await kv.set(pageKey, record);
  } catch {
    // ignore storage errors (stub should not block)
  }

  return NextResponse.json({ ok: true, projectId, slug, record });
}
