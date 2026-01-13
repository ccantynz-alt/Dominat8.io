import { NextResponse } from "next/server";
import { requireUserId } from "../../../_lib/auth";
import { getProject } from "../../../../lib/projectsStore";

export async function GET(_: Request, ctx: { params: { projectId: string } }) {
  const { userId } = await requireUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  const project = await getProject(ctx.params.projectId);
  if (!project || project.userId !== userId) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, project });
}
