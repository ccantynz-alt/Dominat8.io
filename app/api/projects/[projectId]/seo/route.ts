// app/api/projects/[projectId]/seo/route.ts
import { NextResponse } from "next/server";
import { isAdmin } from "@/app/lib/isAdmin";
import { getProjectSEO, setProjectSEO } from "@/app/lib/seo";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const seo = await getProjectSEO(params.projectId);
  return NextResponse.json({ ok: true, projectId: params.projectId, seo });
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const incoming = body?.seo && typeof body.seo === "object" ? body.seo : {};
  const seo = {
    siteName: String(incoming.siteName || ""),
    defaultTitle: String(incoming.defaultTitle || ""),
    titleTemplate: String(incoming.titleTemplate || "{page} | {site}"),
    defaultDescription: String(incoming.defaultDescription || ""),
    canonicalBase: String(incoming.canonicalBase || ""),
    robots: String(incoming.robots || "index,follow"),
    ogImage: String(incoming.ogImage || ""),
    twitterCard: String(incoming.twitterCard || "summary_large_image"),
  };

  await setProjectSEO(params.projectId, seo);
  return NextResponse.json({ ok: true, projectId: params.projectId, seo });
}
