import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function payload(projectId: string) {
  const issues = [
    { code: "NOT_PUBLISHED", severity: "warning", message: "Project has not been published" },
    { code: "MISSING_META", severity: "warning", message: "Meta title or description is missing" },
    { code: "NO_CTA", severity: "info", message: "No primary call-to-action detected" },
  ];

  return {
    ok: true,
    agent: "audit",
    projectId,
    summary: {
      totalIssues: issues.length,
      blocking: issues.filter((i) => i.severity === "error").length,
    },
    issues,
    auditedAt: new Date().toISOString(),
  };
}

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  return NextResponse.json(payload(params.projectId));
}

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  return NextResponse.json(payload(params.projectId));
}
