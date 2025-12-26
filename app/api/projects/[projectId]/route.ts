// app/api/projects/[projectId]/route.ts
import { NextResponse } from "next/server";
import { kvJsonGet, kvJsonSet, kvNowISO } from "@/lib/kv";
import { keys } from "@/lib/keys";
import { getCurrentUserId } from "@/lib/demoAuth";
import { ProjectSchema, UpdateProjectInputSchema, type Project } from "@/lib/models/project";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { projectId: string } };

async function loadProjectOr404(userId: string, projectId: string) {
  const p = await kvJsonGet<Project>(keys.project(projectId));
  if (!p) return { status: 404 as const, json: NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 }) };

  if (p.userId !== userId) {
    return { status: 403 as const, json: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
  }

  const parsed = ProjectSchema.safeParse(p);
  if (!parsed.success) {
    return { status: 500 as const, json: NextResponse.json({ ok: false, error: "Corrupt project data" }, { status: 500 }) };
  }

  return { status: 200 as const, project: parsed.data };
}

/**
 * GET /api/projects/:projectId
 */
export async function GET(_req: Request, ctx: Ctx) {
  const userId = getCurrentUserId();
  const projectId = ctx.params.projectId;

  const loaded = await loadProjectOr404(userId, projectId);
  if ("json" in loaded) return loaded.json;

  return NextResponse.json({ ok: true, project: loaded.project });
}

/**
 * PATCH /api/projects/:projectId
 * Allows updating name/repo fields.
 */
export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const userId = getCurrentUserId();
    const projectId = ctx.params.projectId;

    const loaded = await loadProjectOr404(userId, projectId);
    if ("json" in loaded) return loaded.json;

    const body = await req.json().catch(() => ({}));
    const patch = UpdateProjectInputSchema.parse(body);

    const now = await kvNowISO();
    const next: Project = {
      ...loaded.project,
      ...patch,
      updatedAt: now
    };

    await kvJsonSet(keys.project(projectId), next);
    return NextResponse.json({ ok: true, project: next });
  } catch (err: any) {
    const message = err?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
