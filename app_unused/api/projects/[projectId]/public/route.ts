import { NextResponse } from "next/server";
import { getProjectById } from "../../../../../lib/projects";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const project = await getProjectById(params.projectId);

  if (!project || !project.isPublished || !project.html) {
    return NextResponse.json(
      { ok: false, error: "Not published" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    html: project.html,
  });
}
