import { NextResponse } from "next/server";
import { KV } from "../../../lib/kv";
import { keys } from "../../../lib/keys";
import { getCurrentUserId } from "../../../lib/demoAuth";
import { ProjectSchema } from "../../../lib/models/project";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const ownerId = getCurrentUserId();
  const project = await KV.get(keys.project(params.projectId));

  if (!project) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const parsed = ProjectSchema.safeParse(project);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Corrupt project data" },
      { status: 500 }
    );
  }

  if (parsed.data.ownerId !== ownerId) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, project: parsed.data });
}
