import { NextResponse } from "next/server";
import { z } from "zod";
import { createProject, listProjects } from "@/app/lib/store";

const CreateProjectSchema = z.object({
  name: z.string().min(1),
});

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json({ ok: true, projects });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid payload" },
      { status: 400 }
    );
  }

  const project = await createProject(parsed.data.name);
  return NextResponse.json({ ok: true, project });
}
