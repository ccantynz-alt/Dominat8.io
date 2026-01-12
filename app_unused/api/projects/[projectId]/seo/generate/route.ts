import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  // ✅ FIX: auth() must be awaited in your current Clerk typings/build
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.projectId;

  // Optional request body (stub-friendly)
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const baseUrl =
    typeof body?.baseUrl === "string" ? body.baseUrl.trim() : "https://example.com";

  // Stub pages — later we’ll generate real programmatic SEO pages + sitemap
  const pages = [
    { slug: "home", title: "Home", description: "Homepage (stub SEO page)" },
    { slug: "about", title: "About", description: "About page (stub SEO page)" },
    { slug: "contact", title: "Contact", description: "Contact page (stub SEO page)" },
  ];

  const record = {
    generatedAt: Date.now(),
    generatedBy: userId,
    baseUrl,
    pages,
  };

  const key = `project:${projectId}:seo:pages`;

  try {
    await kv.set(key, record);
  } catch {
    // ignore storage errors (stub should not block)
  }

  return NextResponse.json({ ok: true, projectId, record });
}
