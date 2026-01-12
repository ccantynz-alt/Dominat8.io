import { NextResponse } from "next/server";
import {
  buildDemoHtml,
  createRun,
  setProjectHtml,
  setRunStatus,
} from "@/lib/demoStore";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const projectId = params.projectId;

  // IMPORTANT:
  // Do NOT hard-fail if the project record doesn't exist yet.
  // The demo store can still create/run generation and store HTML for this projectId.
  // This prevents 404 "Project not found" from killing the flow.

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

