import { NextResponse } from "next/server";
import { kvJsonGet, kvJsonSet, kvNowISO } from "../../../lib/kv";
import { getCurrentUserId } from "../../../lib/demoAuth";

export const runtime = "nodejs";

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

function runsIndexKey(userId: string, projectId: string) {
  return `runs:index:${userId}:${projectId}`;
}

export async function GET(_req: Request, { params }: { params: { projectId: string } }) {
  try {
    const userId = getCurrentUserId();
    const projectId = params?.projectId;

    if (!projectId) {
      return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
    }

    const project = await kvJsonGet<any>(projectKey(userId, projectId));
    if (!project) {
      return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    // Optional: include runs if caller wants it (dashboard can request separately)
    const ids = (await kvJsonGet<string[]>(runsIndexKey(userId, projectId))) || [];
    return NextResponse.json({ ok: true, project, runIds: ids });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: `GET /api/projects/[projectId] failed: ${String(e?.message || e)}` },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: { params: { projectId: string } }) {
  try {
    const userId = getCurrentUserId();
    const projectId = params?.projectId;

    if (!projectId) {
      return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json({ ok: false, error: "Missing name" }, { status: 400 });
    }

    const project = await kvJsonGet<any>(projectKey(userId, projectId));
    if (!project) {
      return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    const updated = { ...project, name, updatedAt: kvNowISO() };
    await kvJsonSet(projectKey(userId, projectId), updated);

    return NextResponse.json({ ok: true, project: updated });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: `PATCH /api/projects/[projectId] failed: ${String(e?.message || e)}` },
      { status: 500 }
    );
  }
}
