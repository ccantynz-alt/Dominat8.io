import { NextResponse } from "next/server";
import { kv } from "@/app/lib/kv";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

async function getPlan(): Promise<"pro" | "free"> {
  const { userId, sessionClaims } = auth();

  if (!userId) return "free";

  const claimPlan =
    (sessionClaims as any)?.publicMetadata?.plan ||
    (sessionClaims as any)?.metadata?.plan ||
    (sessionClaims as any)?.plan;

  if (claimPlan === "pro") return "pro";

  const kvPlan = await kv.get<string>(`user:${userId}:plan`);
  if (kvPlan === "pro") return "pro";

  return "free";
}

type Issue = {
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
};

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const plan = await getPlan();
  if (plan !== "pro") {
    return NextResponse.json(
      { ok: false, error: "PRO_REQUIRED", agent: "seo" },
      { status: 402 }
    );
  }

  const { projectId } = params;

  const issues: Issue[] = [];

  const pages = (await kv.get<string[]>(`project:${projectId}:pages`)) || [];

  if (pages.length === 0) {
    issues.push({
      code: "NO_PAGES",
      severity: "error",
      message: "No pages exist for SEO analysis",
    });
  }

  // Basic page coverage checks
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

  // Basic slug hygiene
  for (const slug of pages) {
    if (slug.includes("_")) {
      issues.push({
        code: "BAD_SLUG",
        severity: "warning",
        message: `Slug "${slug || "home"}" contains underscores`,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    agent: "seo",
    projectId,
    pages,
    summary: {
      totalIssues: issues.length,
      blocking: issues.filter((i) => i.severity === "error").length,
    },
    issues,
    analyzedAt: new Date().toISOString(),
  });
}
