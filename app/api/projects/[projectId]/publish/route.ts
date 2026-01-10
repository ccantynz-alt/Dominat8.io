import { NextResponse } from "next/server";
import { requireUser } from "../../../../../lib/auth";
import { getProjectById, saveProject } from "../../../../../lib/projects";

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const user = await requireUser();

  const project = await getProjectById(params.projectId);

  if (!project || project.userId !== user.id) {
    return NextResponse.json(
      { ok: false, error: "Project not found" },
      { status: 404 }
    );
  }

  if (!project.html) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Nothing to publish (no HTML). Generate the site first, then publish.",
      },
      { status: 400 }
    );
  }

  project.isPublished = true;
  project.publishedAt = new Date().toISOString();

  await saveProject(project);

  return NextResponse.json({
    ok: true,
    publicUrl: `/p/${project.id}`,
  });
}
