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

  // ---- Read project ----
  const project = await kv.get<any>(`project:${projectId}`);

  if (!project) {
    issues.push({
      code: "PROJECT_NOT_FOUND",
      severity: "error",
      message: "Project record does not exist",
    });
  }

  // ---- Read pages ----
  const pages = (await kv.get<string[]>(`project:${projectId}:pages`)) || [];

  if (pages.length === 0) {
    issues.push({
      code: "NO_PAGES",
      severity: "error",
      message: "No pages have been generated for this project",
    });
  }

  // ---- Required pages ----
  const required = ["", "about", "pricing", "contact"];
  for (const slug of required) {
    if (!pages.includes(slug)) {
      issues.push({
        code: "MISSING_PAGE",
        severity: "warning",
        message: `Missing recommended page: ${slug || "home"}`,
      });
    }
  }

  // ---- Publish state ----
  if (!project?.publishedAt) {
    issues.push({
      code: "NOT_PUBLISHED",
      severity: "warning",
      message: "Project has not been published",
    });
  }

  // ---- Metadata ----
  if (!project?.metaTitle || !project?.metaDescription) {
    issues.push({
      code: "MISSING_META",
      severity: "warning",
      message: "Meta title or description is missing",
    });
  }

  return NextResponse.json({
    ok: true,
    agent: "audit",
    projectId,
    summary: {
      totalIssues: issues.length,
      blocking: issues.filter((i) => i.severity === "error").length,
    },
    pages,
    issues,
    auditedAt: new Date().toISOString(),
  });
}
