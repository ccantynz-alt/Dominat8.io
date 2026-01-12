import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const projectId = params.projectId;
    const projectKey = `project:${projectId}`;

    const project = await kv.hgetall<any>(projectKey);
    if (!project) {
      return NextResponse.json(
        { ok: false, error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.userId !== userId) {
      return NextResponse.json(
        { ok: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");
    const now = new Date().toISOString();

    if (action === "unpublish") {
      await kv.hset(projectKey, {
        publishedStatus: "",
        updatedAt: now,
      });

      return NextResponse.json({ ok: true, projectId, action: "unpublish" });
    }

    if (action === "delete") {
      // Delete main project
      await kv.del(projectKey);

      // Remove from user indexes (ignore if wrong key type)
      try {
        await kv.srem(`user:${userId}:projects`, projectId);
      } catch {}
      try {
        await kv.srem(`projects:user:${userId}`, projectId);
      } catch {}

      // Delete latest HTML + version list metadata
      await kv.del(`generated:project:${projectId}:latest`);
      await kv.del(`generated:project:${projectId}:versions`);

      return NextResponse.json({ ok: true, projectId, action: "delete" });
    }

    return NextResponse.json(
      { ok: false, error: "Invalid action. Use 'unpublish' or 'delete'." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Admin action failed" },
      { status: 500 }
    );
  }
}
