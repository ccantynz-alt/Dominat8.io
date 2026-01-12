import { NextResponse } from "next/server";
import { getProject, getRun } from "@/lib/demoStore";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string; runId: string } }
) {
  const { projectId, runId } = params;

  const project = getProject(projectId);
  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  const run = getRun(runId);
  if (!run || run.projectId !== projectId) {
    return NextResponse.json({ ok: false, error: "Run not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    run: { id: run.id, status: run.status, error: run.error || undefined },
  });
}
