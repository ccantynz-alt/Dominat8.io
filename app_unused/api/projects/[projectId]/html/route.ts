import { NextResponse } from "next/server";
import { getProject } from "@/lib/demoStore";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const project = getProject(params.projectId);
  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  if (!project.latestHtml) {
    return NextResponse.json({ ok: false, error: "No generated HTML found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, html: project.latestHtml });
}
