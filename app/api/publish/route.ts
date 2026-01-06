// app/api/publish/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

function getOrigin(req: Request) {
  const host = req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (!host) return "https://example.com";
  return `${proto}://${host}`;
}

export async function GET(req: Request) {
  // Simple health check
  return NextResponse.json({ ok: true, version: "publish-api-global-v1" });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  const action = String(body?.action || "");
  const projectId = String(body?.projectId || "");

  if (!action || !projectId) {
    return NextResponse.json(
      { ok: false, error: "missing_action_or_projectId" },
      { status: 400 }
    );
  }

  // Verify ownership
  const project = await kv.hgetall<any>(`project:${projectId}`);
  if (!project) {
    return NextResponse.json(
      { ok: false, error: "project_not_found" },
      { status: 404 }
    );
  }
  if (project.userId !== userId) {
    return NextResponse.json(
      { ok: false, error: "forbidden" },
      { status: 403 }
    );
  }

  if (action === "get") {
    return NextResponse.json({
      ok: true,
      projectId,
      publishedStatus: project.publishedStatus || "",
      publishedUrl: project.publishedUrl || "",
      publishedAt: project.publishedAt || "",
      domain: project.domain || "",
    });
  }

  const now = new Date().toISOString();
  const origin = getOrigin(req);
  const domain = String(project.domain || "").trim();

  if (action === "publish") {
    // MVP rule:
    // - If domain exists, publishedUrl = https://domain
    // - Otherwise, fallback to a safe URL (your app's project page)
    const publishedUrl = domain ? `https://${domain}` : `${origin}/projects/${projectId}`;

    await kv.hset(`project:${projectId}`, {
      publishedStatus: "published",
      publishedUrl,
      publishedAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      ok: true,
      projectId,
      publishedStatus: "published",
      publishedUrl,
      publishedAt: now,
    });
  }

  if (action === "unpublish") {
    await kv.hset(`project:${projectId}`, {
      publishedStatus: "",
      publishedUrl: "",
      publishedAt: "",
      updatedAt: now,
    });

    return NextResponse.json({
      ok: true,
      projectId,
      publishedStatus: "",
      publishedUrl: "",
      publishedAt: "",
    });
  }

  return NextResponse.json(
    { ok: false, error: "unknown_action" },
    { status: 400 }
  );
}
