// app/api/projects/[projectId]/domains/attach/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

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
    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ ok: false, error: "Invalid projectId" }, { status: 400 });
    }

    // Read body
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      body = null;
    }

    const domain =
      typeof body?.domain === "string" ? body.domain.trim().toLowerCase() : "";

    if (!domain) {
      return NextResponse.json({ ok: false, error: "Missing domain" }, { status: 400 });
    }

    // Load the project from the SAME KV key format as create/publish
    const projectKey = `project:${projectId}`;
    const project = await kv.get(projectKey);

    if (!project) {
      return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    const ownerId =
      typeof (project as any)?.ownerId === "string" ? (project as any).ownerId : null;

    if (ownerId && ownerId !== userId) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // Store attached domain
    const domainKey = `project:${projectId}:domain`;
    await kv.set(domainKey, { domain, attachedBy: userId, attachedAt: Date.now() });

    return NextResponse.json({ ok: true, projectId, domain });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to attach domain" },
      { status: 500 }
    );
  }
}
