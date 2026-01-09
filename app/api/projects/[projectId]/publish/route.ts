// app/api/projects/[projectId]/publish/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

const publicIndexKey = "public:projects:index";

export async function POST(
  _req: Request,
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

    // Load project
    const projectKey = `project:${projectId}`;
    const project = await kv.get<any>(projectKey);

    if (!project) {
      return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    // Enforce ownership when ownerId exists
    const ownerId = typeof project?.ownerId === "string" ? project.ownerId : null;
    if (ownerId && ownerId !== userId) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // Ensure there is generated HTML to serve
    const htmlKey1 = `generated:project:${projectId}:latest`;
    const htmlKey2 = `generated:${projectId}:latest`;

    const html =
      (await kv.get<string>(htmlKey1)) ?? (await kv.get<string>(htmlKey2)) ?? null;

    if (!html || typeof html !== "string") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No generated HTML found for this project. Generate the site first, then publish.",
        },
        { status: 400 }
      );
    }

    // Mark published
    await kv.set(`project:${projectId}:published`, true);

    // Add to public index (dedupe)
    const existing = (await kv.get<any>(publicIndexKey)) ?? [];
    const arr = Array.isArray(existing) ? existing.filter((x) => typeof x === "string") : [];
    const next = arr.includes(projectId) ? arr : [projectId, ...arr];
    await kv.set(publicIndexKey, next);

    return NextResponse.json({
      ok: true,
      projectId,
      publicUrl: `/p/${projectId}`,
      indexKey: publicIndexKey,
      htmlKeyUsed: (await kv.get<string>(htmlKey1)) ? htmlKey1 : htmlKey2,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Publish failed" },
      { status: 500 }
    );
  }
}
