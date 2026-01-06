import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

/**
 * We store project IDs for a user in ONE of these indexes:
 * - user:<userId>:projects (SET)
 * - projects:user:<userId> (SET)
 * This route tries both, so it works even if older code used a different key.
 */
async function getUserProjectIds(userId: string): Promise<string[]> {
  const keyA = `user:${userId}:projects`;
  const keyB = `projects:user:${userId}`;

  // Try SET membership first
  try {
    const idsA = (await kv.smembers(keyA)) as string[] | null;
    if (idsA && idsA.length) return idsA;
  } catch {}

  try {
    const idsB = (await kv.smembers(keyB)) as string[] | null;
    if (idsB && idsB.length) return idsB;
  } catch {}

  // Fallback: nothing indexed yet
  return [];
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized", projects: [] },
        { status: 401 }
      );
    }

    const projectIds = await getUserProjectIds(userId);

    // Load projects (best effort)
    const projects: any[] = [];
    for (const projectId of projectIds) {
      const p = await kv.hgetall<any>(`project:${projectId}`);
      if (p) {
        projects.push({
          id: projectId,
          ...p,
        });
      }
    }

    // Always return JSON, even if empty
    return NextResponse.json({ ok: true, projects });
  } catch (err: any) {
    // Always return JSON on error (NEVER return empty body)
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load projects", projects: [] },
      { status: 500 }
    );
  }
}

/**
 * Optional: keep POST here so existing project creation doesn't break.
 * If your app already has a different POST implementation, this should still work.
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const name =
      typeof body?.name === "string" && body.name.trim()
        ? body.name.trim()
        : "Untitled Project";

    const projectId = `proj_${crypto.randomUUID().replace(/-/g, "")}`;
    const now = new Date().toISOString();

    await kv.hset(`project:${projectId}`, {
      id: projectId,
      userId,
      name,
      createdAt: now,
      updatedAt: now,
      publishedStatus: "",
      domain: "",
      domainStatus: "",
    });

    // Index it under BOTH keys so GET always works
    await kv.sadd(`user:${userId}:projects`, projectId);
    await kv.sadd(`projects:user:${userId}`, projectId);

    return NextResponse.json({ ok: true, projectId });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to create project" },
      { status: 500 }
    );
  }
}
