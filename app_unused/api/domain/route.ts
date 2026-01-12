// app/api/domain/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

const VERSION = "domain-api-global-v1";

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

export async function GET() {
  // Simple browser check endpoint
  return NextResponse.json({ ok: true, version: VERSION });
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED", version: VERSION }, { status: 401 });

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const action = String(body?.action || "").trim();
    const projectId = String(body?.projectId || "").trim();

    if (!projectId) {
      return NextResponse.json({ ok: false, error: "MISSING_PROJECT_ID", version: VERSION }, { status: 400 });
    }

    const check = await requireProjectOwner(userId, projectId);
    if (!check.ok) {
      const status = check.error === "PROJECT_NOT_FOUND" ? 404 : 403;
      return NextResponse.json({ ok: false, error: check.error, version: VERSION }, { status });
    }

    // -------- GET ----------
    if (action === "get") {
      const project = check.project;
      return NextResponse.json({
        ok: true,
        version: VERSION,
        projectId,
        domain: project?.domain || null,
        domainStatus: project?.domainStatus || null,
        domainUpdatedAt: project?.domainUpdatedAt || null,
      });
    }

    // -------- ATTACH ----------
    if (action === "attach") {
      const domain = normalizeDomain(String(body?.domain || ""));
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
    }

    // -------- REMOVE ----------
    if (action === "remove") {
      const now = new Date().toISOString();

      await kv.hset(`project:${projectId}`, {
        domain: "",
        domainStatus: "",
        domainUpdatedAt: now,
        updatedAt: now,
      });

      return NextResponse.json({ ok: true, version: VERSION, projectId });
    }

    return NextResponse.json(
      { ok: false, error: "UNKNOWN_ACTION", version: VERSION, got: action },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "DOMAIN_API_FAILED", detail: String(err?.message || err), version: VERSION },
      { status: 500 }
    );
  }
}
