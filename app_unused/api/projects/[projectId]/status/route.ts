import { NextResponse } from "next/server";
import { requireUserId } from "@/app/api/_lib/auth";
import { getProject } from "@/app/lib/projectsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: { projectId: string } }) {
  try {
    const { userId } = await requireUserId();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
    }

    const projectId = String(ctx?.params?.projectId || "").trim();
    if (!projectId) {
      return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
    }

    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    if (String(project.userId) !== String(userId)) {
      return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, project }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to get status" },
      { status: 500 }
    );
  }
}
