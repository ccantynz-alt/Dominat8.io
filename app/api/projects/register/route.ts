import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

async function readProjectAny(projectId: string) {
  const key = `project:${projectId}`;

  try {
    const hash = await kv.hgetall<any>(key);
    if (hash && Object.keys(hash).length > 0) return hash;
  } catch {}

  try {
    const obj = await kv.get<any>(key);
    if (obj) return obj;
  } catch {}

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const projectId =
      typeof body?.projectId === "string" ? body.projectId.trim() : "";

    if (!projectId || !projectId.startsWith("proj_")) {
      return json({ ok: false, error: "Invalid projectId" }, 400);
    }

    const project = await readProjectAny(projectId);
    if (!project) {
      return json({ ok: false, error: "Project not found in KV" }, 404);
    }

    // Add to index (newest first)
    await kv.lpush("projects:index", projectId);

    return json({ ok: true, projectId });
  } catch (err) {
    console.error("POST /api/projects/register error:", err);
    return json({ ok: false, error: "Register failed" }, 500);
  }
}
