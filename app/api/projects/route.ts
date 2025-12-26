import { NextResponse } from "next/server";
import { kv, kvJsonGet, kvJsonSet, kvNowISO } from "../../lib/kv";
import { keys } from "../../lib/keys";
import { uid } from "../../lib/id";
import { getCurrentUserId } from "../../lib/demoAuth";
import {
  CreateProjectInputSchema,
  ProjectSchema,
  type Project
} from "../../lib/models/project";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/projects
 * Lists projects for the current user.
 */
export async function GET() {
  const userId = getCurrentUserId();

  // List project IDs from the index (newest first)
  const ids = (await kv.zrevrange(keys.projectsIndex, 0, 200)) as string[];

  const projects: Project[] = [];
  for (const id of ids) {
    const p = await kvJsonGet<Project>(keys.project(id));
    if (!p) continue;
    if (p.userId !== userId) continue;

    const parsed = ProjectSchema.safeParse(p);
    if (parsed.success) projects.push(parsed.data);
  }

  return NextResponse.json({ ok: true, projects });
}

/**
 * POST /api/projects
 * Creates a new project.
 */
export async function POST(req: Request) {
  try {
    const userId = getCurrentUserId();
    const body = await req.json().catch(() => ({}));

    const input = CreateProjectInputSchema.parse(body);

    const now = await kvNowISO();
    const project: Project = {
      id: uid("prj"),
      userId,
      name: input.name,
      repoUrl: input.repoUrl,
      defaultBranch: input.defaultBranch,
      createdAt: now,
      updatedAt: now
    };

    await kvJsonSet(keys.project(project.id), project);

    // Add to index with timestamp score
    await kv.zadd(keys.projectsIndex, {
      score: Date.now(),
      member: project.id
    });

    return NextResponse.json({ ok: true, project });
  } catch (err: any) {
    const message = err?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
