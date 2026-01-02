// app/site/[projectId]/route.ts
import { NextResponse } from "next/server";
import { storeGet } from "@/app/lib/store";
import { isAdmin } from "@/app/lib/isAdmin";
import { getProjectSEO, injectSEOIntoHtml } from "@/app/lib/seo";

type Visibility = "public" | "private";

function visibilityKey(projectId: string) {
  return `project:visibility:${projectId}`;
}

function latestKey(projectId: string) {
  return `generated:project:${projectId}:latest`;
}

function getPathFromReq(req: Request) {
  const url = new URL(req.url);
  // for home page this is always "/"
  return "/";
}

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const admin = await isAdmin();

  const v = await storeGet(visibilityKey(params.projectId));
  const visibility: Visibility = v === "public" ? "public" : "private";

  if (visibility === "private" && !admin) {
    return new NextResponse("Private site", { status: 403 });
  }

  const latest = await storeGet(latestKey(params.projectId));
  const pages =
    latest && typeof latest === "object" && (latest as any).pages && typeof (latest as any).pages === "object"
      ? ((latest as any).pages as Record<string, string>)
      : null;

  const baseHtml =
    (pages && typeof pages["/"] === "string" && pages["/"]) ||
    (latest && typeof latest === "object" && typeof (latest as any).previewHtml === "string" && (latest as any).previewHtml) ||
    "<!doctype html><html><head><title>Not Published</title></head><body><h1>No published HTML found yet</h1></body></html>";

  const seo = await getProjectSEO(params.projectId);
  const html = injectSEOIntoHtml({
    html: String(baseHtml),
    path: getPathFromReq(req),
    seo,
    pageTitle: "Home",
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
