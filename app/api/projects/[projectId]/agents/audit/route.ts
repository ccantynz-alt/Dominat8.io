import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;

  // TEMP: deterministic audit stub
  // Later this will read real project data (KV / DB)
  const issues = [
    { code: "NO_PUBLISH", severity: "warning", message: "Project is not published" },
    { code: "NO_META", severity: "warning", message: "Missing meta title/description" },
    { code: "NO_CTA", severity: "info", message: "No primary call-to-action detected" },
  ];

  return NextResponse.json({
    ok: true,
    agent: "audit",
    projectId,
    summary: {
      totalIssues: issues.length,
      blocking: issues.filter(i => i.severity === "error").length,
    },
    issues,
    auditedAt: new Date().toISOString(),
  });
}
