// app/api/projects/[projectId]/domain/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

const VERSION = "domain-api-v5"; // <-- used to prove deploy updated

async function requireProjectOwner(userId: string, projectId: string) {
  const project = (await kv.hgetall(`project:${projectId}`)) as any;
  if (!project?.id) return { ok: false as const, error: "PROJECT_NOT_FOUND" as const };
  if (project.userId !== userId) return { ok: false as const, error: "FORBIDDEN" as const };
  return { ok: true as const, project };
}

function normalizeDomain(input: string) {
  return input.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
}

function isValidDomain(domain: string) {
  if (!domain.includes(".")) return false;
  if (domain.length < 4 || domain.length > 253) return false;
  if (!/^[a-z0-9.-]+$/.test(domain)) return false;
  if (domain.startsWith(".") || domain.endsWith(".")) return false;
  if (domain.includes("..")) return false;
  return true;
}

/**
 * ✅ OPTIONS: lets us see what methods Next thinks exist (Allow header)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET,POST,DELETE,OPTIONS",
    },
  });
}

export async function GET(_req: Request, ctx: { params: { projectId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED", version: VERSION }, { status: 401 });

    const projectId = ctx.params.projectId;
    const check = await requireProjectOwner(userId, projectId);
    if (!check.ok) {
      const status = check.error === "PROJECT_NOT_FOUND" ? 404 : 403;
      return NextResponse.json({ ok: false, error: check.error, version: VERSION }, { status });
    }

    const project = check.project;

    return NextResponse.json({
      ok: true,
      version: VERSION,
      projectId,
      domain: project.domain || null,
      domainStatus: project.domainStatus || null,
      domainUpdatedAt: project.domainUpdatedAt || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "DOMAIN_GET_FAILED", detail: String(err?.message || err), version: VERSION },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, ctx: { params: { projectId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED", version: VERSION }, { status: 401 });

    const projectId = ctx.params.projectId;
    const check = await requireProjectOwner(userId, projectId);
    if (!check.ok) {
      const status = check.error === "PROJECT_NOT_FOUND" ? 404 : 403;
      return NextResponse.json({ ok: false, error: check.error, version: VERSION }, { status });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const domain = normalizeDomain(String(body.domain || ""));
    if (!domain || !isValidDomain(domain)) {
      return NextResponse.json({ ok: false, error: "INVALID_DOMAIN", version: VERSION }, { status: 400 });
    }

    const now = new Date().toISOString();

    await kv.hset(`project:${projectId}`, {
      domain,
      domainStatus: "attached",
      domainUpdatedAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ ok: true, version: VERSION, projectId, domain });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "DOMAIN_POST_FAILED", detail: String(err?.message || err), version: VERSION },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: { params: { projectId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED", version: VERSION }, { status: 401 });

    const projectId = ctx.params.projectId;
    const check = await requireProjectOwner(userId, projectId);
    if (!check.ok) {
      const status = check.error === "PROJECT_NOT_FOUND" ? 404 : 403;
      return NextResponse.json({ ok: false, error: check.error, version: VERSION }, { status });
    }

    const now = new Date().toISOString();

    await kv.hset(`project:${projectId}`, {
      domain: "",
      domainStatus: "",
      domainUpdatedAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ ok: true, version: VERSION, projectId });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "DOMAIN_DELETE_FAILED", detail: String(err?.message || err), version: VERSION },
      { status: 500 }
    );
  }
}
