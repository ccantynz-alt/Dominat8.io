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

  // Optional body (stub-friendly)
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const siteName =
    typeof body?.siteName === "string" ? body.siteName.trim() : "My Site";

  // Stub SEO result — later we’ll call GPT + generate real metadata/pages
  const result = {
    generatedAt: Date.now(),
    generatedBy: userId,
    siteName,
    meta: {
      title: `${siteName} | Built with AI`,
      description: `Welcome to ${siteName}. This SEO metadata is currently stubbed and will be AI-generated later.`,
    },
    keywords: ["ai website builder", "nextjs", "saas"],
  };

  // Store it (optional, but useful later)
  const key = `project:${projectId}:seo:ai`;
  try {
    await kv.set(key, result);
  } catch {
    // ignore storage errors (stub should not block)
  }

  return NextResponse.json({ ok: true, projectId, result });
}
