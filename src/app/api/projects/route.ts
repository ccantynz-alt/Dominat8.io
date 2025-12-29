// src/app/api/projects/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createProject, listProjects } from "@/app/lib/store";

const CreateProjectSchema = z.object({
  name: z.string().min(1),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const debugCreate = url.searchParams.get("debugCreate");
    const name = url.searchParams.get("name") || "Test";

    if (debugCreate === "1") {
      const project = await createProject({ name });
      return NextResponse.json(
        { ok: true, mode: "debugCreate", name, project },
        { status: 200 }
      );
    }

    const projects = await listProjects();
    return NextResponse.json({ ok: true, mode: "list", projects }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        mode: "error",
        error: err?.message ?? String(err),
        stack: err?.stack ?? null,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = CreateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid request", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const project = await createProject({ name: parsed.data.name });
    return NextResponse.json({ ok: true, project }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? String(err),
        stack: err?.stack ?? null,
      },
      { status: 500 }
    );
  }
}
