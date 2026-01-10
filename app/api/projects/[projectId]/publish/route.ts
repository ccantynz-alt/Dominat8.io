import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

type Project = {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

function projectKey(projectId: string) {
  return `project:${projectId}`;
}

function generatedProjectLatestKey(projectId: string) {
  return `generated:project:${projectId}:latest`;
}

function publishedKey(projectId: string) {
  return `published:project:${projectId}`;
}

function planKey(userId: string) {
  return `plan:clerk:${userId}`;
}

function nowIso() {
  return new Date().toISOString();
}

/**
 * Publish rules:
 * - Must be signed in
 * - Must own the project
 * - Must be Pro
 * - Must have generated HTML
 * - Publishes to /p/<projectId>
 *
 * If not Pro: returns 402 + upgradeUrl from /api/billing/checkout
 */
export async function POST(req: Request, ctx: { params: { projectId: string } }) {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = ctx.params.projectId;
  if (!projectId) {
    return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
  }

  const project = await kv.get<Project>(projectKey(projectId));
  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  // ✅ Paywall: must be Pro to publish
  const plan = await kv.get<string>(planKey(userId));
  const isPro = plan === "pro";

  if (!isPro) {
    // Create an upgrade URL via our own checkout endpoint
    // (call it internally so UI gets a link)
    const origin =
      req.headers.get("x-forwarded-proto") && req.headers.get("x-forwarded-host")
        ? `${req.headers.get("x-forwarded-proto")}://${req.headers.get("x-forwarded-host")}`
        : process.env.NEXT_PUBLIC_APP_URL || "";

    let upgradeUrl = "";
    try {
      const r = await fetch(`${origin}/api/billing/checkout`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ returnTo: `/projects/${projectId}` }),
      });
      const text = await r.text();
      if (r.ok) {
        const data = JSON.parse(text);
        if (typeof data?.url === "string") upgradeUrl = data.url;
      }
    } catch {
      // ignore; we still return 402
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Upgrade required",
        code: "UPGRADE_REQUIRED",
        upgradeUrl,
      },
      { status: 402 }
    );
  }

  const html = await kv.get<string>(generatedProjectLatestKey(projectId));
  if (!html) {
    return NextResponse.json(
      { ok: false, error: "No generated HTML to publish. Generate or import first." },
      { status: 400 }
    );
  }

  // Mark published
  const publishedAt = nowIso();
  await kv.set(publishedKey(projectId), {
    projectId,
    publishedAt,
    published: true,
  });

  const path = `/p/${projectId}`;

  return NextResponse.json(
    {
      ok: true,
      published: true,
      projectId,
      publishedAt,
      path,
      url: path,
    },
    { status: 200 }
  );
}
