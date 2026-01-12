import { NextResponse } from "next/server";
import { requireUserId } from "@/app/api/_lib/auth";
import { newProjectId, saveProject, type Project } from "@/app/lib/projectsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = await requireUserId();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({} as any));
    const name = String(body?.name || "Untitled project").trim();
    const templateId = body?.templateId ?? null;

    const projectId = newProjectId();
    const now = Date.now();

    const project: Project = {
      id: projectId,
      userId,
      name,
      templateId,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await saveProject(project);

    if (!saved.ok) {
      return NextResponse.json(
        { ok: false, error: "Storage not available (KV missing and DEV_MEMORY_STORE not enabled)" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, projectId, project, store: saved.mode }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to register project" },
      { status: 500 }
    );
  }
}
