// app/api/projects/[projectId]/domain/remove/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

async function requireProjectOwner(userId: string, projectId: string) {
  const project = (await kv.hgetall(`project:${projectId}`)) as any;
  if (!project?.id) return { ok: false as const, error: "PROJECT_NOT_FOUND" as const };
  if (project.userId !== userId) return { ok: false as const, error: "FORBIDDEN" as const };
  return { ok: true as const, project };
}

export async function GET(_req: Request, ctx: { params: { projectId: string } }) {
  return NextResponse.json({
    ok: true,
    route: "domain/remove",
    projectId: ctx.params.projectId,
  });
}

export async function POST(_req: Request, ctx: { params: { projectId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

    const projectId = ctx.params.projectId;

    const ownerCheck = await requireProjectOwner(userId, projectId);
    if (!ownerCheck.ok) {
      const status = ownerCheck.error === "PROJECT_NOT_FOUND" ? 404 : 403;
      return NextResponse.json({ ok: false, error: ownerCheck.error }, { status });
    }

    const now = new Date().toISOString();

    await kv.hset(`project:${projectId}`, {
      domain: "",
      domainStatus: "",
      domainUpdatedAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ ok: true, projectId });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "DOMAIN_REMOVE_FAILED", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}

