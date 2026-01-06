import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

// Quick GET so you can open the URL and confirm it exists (prevents confusion)
export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  return NextResponse.json({ ok: true, projectId: params.projectId, methods: ["GET", "POST"] });
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const projectId = params.projectId;
    if (!projectId || !projectId.startsWith("proj_")) {
      return NextResponse.json({ ok: false, error: "Invalid projectId" }, { status: 400 });
    }

    const project = await kv.hgetall<any>(`project:${projectId}`);
    if (!project) {
      return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== userId) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const html = typeof body?.html === "string" ? body.html : "";

    if (!html || html.trim().length < 50) {
      return NextResponse.json({ ok: false, error: "Missing or too-short html" }, { status: 400 });
    }

    const key = `generated:project:${projectId}:latest`;
    await kv.set(key, html);

    const now = new Date().toISOString();
    await kv.hset(`project:${projectId}`, {
      updatedAt: now,
      lastGeneratedAt: now,
    });

    return NextResponse.json({ ok: true, projectId, htmlKey: key, length: html.length });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to save html" },
      { status: 500 }
    );
  }
}
