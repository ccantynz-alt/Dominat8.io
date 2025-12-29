// app/api/projects/[projectId]/runs/route.ts
import { NextResponse } from "next/server";
import { createRun, listRuns, getProject } from "@/app/lib/store";
import { getCurrentUserId } from "@/app/lib/demoAuth";
import { z } from "zod";

const CreateRunSchema = z.object({
  prompt: z.string().min(1),
});

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const userId = await getCurrentUserId();
  const projectId = params.projectId;

  const project = await getProject(userId, projectId);
  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  const runs = await listRuns(userId, projectId);
  return NextResponse.json({ ok: true, runs });
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const userId = await getCurrentUserId();
  const projectId = params.projectId;

  const project = await getProject(userId, projectId);
  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CreateRunSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // For now: create a run as "queued"
  const run = await createRun(userId, projectId, {
    prompt: parsed.data.prompt,
    status: "queued",
  });

  return NextResponse.json({ ok: true, run });
}
