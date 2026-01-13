import { NextResponse } from "next/server";
import { requireUserId } from "../../_lib/auth";
import { newProjectId, saveProject } from "../../../lib/projectsStore";

export async function POST(req: Request) {
  const { userId } = await requireUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const projectId = newProjectId();
  const now = Date.now();

  const project = {
    id: projectId,
    userId,
    name: String(body?.name || "Untitled"),
    templateId: body?.templateId ?? null,
    createdAt: now,
    updatedAt: now,
    prompt: null,
    generatedHtml: null,
    lastGeneratedAt: null,
  };

  const saved = await saveProject(project);
  return NextResponse.json({ ok: true, projectId, project, store: saved.mode });
}
