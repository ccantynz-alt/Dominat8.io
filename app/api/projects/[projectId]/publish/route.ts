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

    // 1) Load project
    const projectKey = `project:${projectId}`;
    const project = await kv.hgetall<any>(projectKey);

    if (!project) {
      return NextResponse.json(
        { ok: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // 2) Ownership check
    if (project.userId !== userId) {
      return NextResponse.json(
        { ok: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // 3) Ensure generated HTML exists at the per-project key your public page reads
    // Public page expects: generated:project:<projectId>:latest
    const perProjectHtmlKey = `generated:project:${projectId}:latest`;
    let html = await kv.get<string>(perProjectHtmlKey);

    // Fallback (MVP): if project key not found, try the old global key
    // NOTE: This is only a fallback to help you get live quickly.
    if (!html) {
      const globalHtml = await kv.get<string>("generated:latest");
      if (globalHtml) {
        await kv.set(perProjectHtmlKey, globalHtml);
        html = globalHtml;
      }
    }

    // 4) Mark project as published (even if html isn't ready, we still publish)
    const now = new Date().toISOString();

    await kv.hset(projectKey, {
      publishedStatus: "published",
      publishedAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      ok: true,
      projectId,
      publishedStatus: "published",
      hasHtml: !!html,
      publicUrl: `/p/${projectId}`,
      htmlKey: perProjectHtmlKey,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Publish failed" },
      { status: 500 }
    );
  }
}
