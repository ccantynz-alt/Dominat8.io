import { NextResponse } from "next/server";
import { buildDemoHtml, createRun, getProject, setProjectHtml, setRunStatus } from "@/lib/demoStore";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const projectId = params.projectId;
  const project = getProject(projectId);
  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  let prompt = "";
  try {
    const body: any = await req.json();
    prompt = String(body?.prompt || "");
  } catch {
    prompt = "";
  }

  const run = createRun(projectId);

  // Simulate a short “generation” and then store HTML
  setRunStatus(run.id, "running");

  const html = buildDemoHtml(prompt || "A professional business website");
  setProjectHtml(projectId, html);
  setRunStatus(run.id, "complete");

  return NextResponse.json({ ok: true, runId: run.id });
}
