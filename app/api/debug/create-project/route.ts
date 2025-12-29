// app/api/debug/create-project/route.ts
import { NextResponse } from "next/server";
import { createProject, listProjects } from "@/app/lib/store";
import { getCurrentUserId } from "@/app/lib/demoAuth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = (searchParams.get("name") || "").trim();

    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized (no userId)" }, { status: 401 });
    }

    if (!name) {
      return NextResponse.json(
        { ok: false, error: "Missing ?name=...", example: "/api/debug/create-project?name=Test" },
        { status: 400 }
      );
    }

    const project = await createProject(userId, name);
    const projects = await listProjects(userId);

    return NextResponse.json({
      ok: true,
      created: project,
      totalProjects: projects.length,
      projects,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message || "Unknown error",
        stack: e?.stack || null,
      },
      { status: 500 }
    );
  }
}
