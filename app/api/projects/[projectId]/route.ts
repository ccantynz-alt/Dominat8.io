// app/api/projects/[projectId]/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export async function GET(
  _req: Request,
  ctx: { params: { projectId: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const projectId = ctx.params?.projectId;

  if (!projectId) {
    return NextResponse.json(
      { ok: false, error: "Missing projectId" },
      { status: 400 }
    );
  }

  const project = await kv.get<any>(`project:${projectId}`);

  if (!project) {
    return NextResponse.json(
      { ok: false, error: "Project not found" },
      { status: 404 }
    );
  }

  // Security: only owner can read it
  if (project.userId !== userId) {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true, project });
}

