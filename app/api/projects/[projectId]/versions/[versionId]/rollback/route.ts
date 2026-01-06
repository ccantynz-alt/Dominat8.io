import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string; versionId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, versionId } = params;

    const project = await kv.hgetall<any>(`project:${projectId}`);
    if (!project) {
      return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
    }
    if (project.userId !== userId) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const versionHtmlKey = `generated:project:${projectId}:v:${versionId}`;
    const html = await kv.get<string>(versionHtmlKey);

    if (!html || typeof html !== "string") {
      return NextResponse.json(
        { ok: false, error: "Version HTML not found" },
        { status: 404 }
      );
    }

    const latestKey = `generated:project:${projectId}:latest`;
    await kv.set(latestKey, html);

    const now = new Date().toISOString();
    await kv.hset(`project:${projectId}`, {
      updatedAt: now,
      lastRolledBackAt: now,
      lastRolledBackVersionId: versionId,
    });

    // Optional: publish after rollback if already published
    if (project.publishedStatus === "published") {
      await kv.hset(`project:${projectId}`, {
        updatedAt: now,
        publishedStatus: "published",
      });
    }

    return NextResponse.json({
      ok: true,
      projectId,
      rolledBackTo: versionId,
      latestKey,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to rollback" },
      { status: 500 }
    );
  }
}
