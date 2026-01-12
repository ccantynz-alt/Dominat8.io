import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasKVEnv() {
  return !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
}

async function getKV() {
  if (!hasKVEnv()) return null;
  const mod = await import("@vercel/kv");
  return mod.kv;
}

const projectKey = (projectId: string) => `project:${projectId}`;
const userProjectsKey = (userId: string) => `user:${userId}:projects`;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Not signed in" },
        { status: 401 }
      );
    }

    const kv = await getKV();
    if (!kv) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "KV is not configured (missing KV_REST_API_URL/KV_REST_API_TOKEN). Add them to .env.local and Vercel env vars.",
        },
        { status: 500 }
      );
    }

    // Pull all projectIds for this user
    const ids = (await kv.smembers(userProjectsKey(userId))) as string[];

    if (!ids || ids.length === 0) {
      return NextResponse.json({ ok: true, projects: [] }, { status: 200 });
    }

    // Load each project (robust even if some are missing)
    const projects: any[] = [];
    for (const id of ids) {
      const obj = await kv.get(projectKey(id));
      if (obj && typeof obj === "object") {
        projects.push(obj);
      }
    }

    // Most recent first (if timestamps exist)
    projects.sort((a, b) => Number(b?.updatedAt ?? 0) - Number(a?.updatedAt ?? 0));

    return NextResponse.json(
      { ok: true, count: projects.length, projects },
      { status: 200 }
    );
  } catch (err: any) {
    // Always return JSON (prevents browser json:null)
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to list projects" },
      { status: 500 }
    );
  }
}
