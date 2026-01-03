import { NextResponse } from "next/server";

type Project = {
  id: string;
  name: string;
  templateId?: string;
  templateName?: string;
  seedPrompt?: string;
  createdAt: string;
};

// In-memory store (temporary, resets on deploy)
// This is OK for now — database comes later
const projects = new Map<string, Project>();

// GET /api/projects
export async function GET() {
  return NextResponse.json({
    ok: true,
    projects: Array.from(projects.values()),
  });
}

// POST /api/projects
export async function POST(req: Request) {
  const body = await req.json();

  if (!body?.id || !body?.name) {
    return NextResponse.json(
      { ok: false, error: "Missing id or name" },
      { status: 400 }
    );
  }

  const project: Project = {
    id: body.id,
    name: body.name,
    templateId: body.templateId,
    templateName: body.templateName,
    seedPrompt: body.seedPrompt,
    createdAt: new Date().toISOString(),
  };

  projects.set(project.id, project);

  return NextResponse.json({
    ok: true,
    project,
  });
}
