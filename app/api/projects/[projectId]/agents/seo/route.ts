import { NextResponse } from "next/server";
import { kv } from "@/app/lib/kv";

export const dynamic = "force-dynamic";

type Issue = {
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
};

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;

  const issues: Issue[] = [];

  // ---- Pages ----
  const pages = (await kv.get<string[]>(`project:${projectId}:pages`)) || [];

  if (pages.length === 0) {
    issues.push({
      code: "NO_PAGES",
      severity: "error",
      message: "No pages exist for SEO analysis",
    });
  }

  // ---- Slug hygiene ----
  for (const slug of pages) {
    if (slug.includes("_")) {
      issues.push({
        code: "BAD_SLUG",
        severity: "warning",
        message: `Slug "${slug || "home"}" contains underscores`,
      });
    }
  }

  // ---- Required SEO pages ----
  const recommended = ["", "about", "pricing", "contact"];
  for (const slug of recommended) {
    if (!pages.includes(slug)) {
      issues.push({
        code: "MISSING_RECOMMENDED_PAGE",
        severity: "warning",
        message: `Missing recommended SEO page: ${slug || "home"}`,
      });
    }
  }

  // ---- Meta coverage (project-level for now) ----
  const project = await kv.get<any>(`project:${projectId}`);

  if (!project?.metaTitle) {
    issues.push({
      code: "NO_META_TITLE",
      severity: "warning",
      message: "Project has no meta title",
    });
  }

  if (!project?.metaDescription) {
    issues.push({
      code: "NO_META_DESCRIPTION",
      severity: "warning",
      message: "Project has no meta description",
    });
  }

  return NextResponse.json({
    ok: true,
    agent: "seo",
    projec
