import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

async function readProjectAny(projectId: string) {
  const key = `project:${projectId}`;

  // Prefer hash
  try {
    const hash = await kv.hgetall<any>(key);
    if (hash && Object.keys(hash).length > 0) return { project: hash, type: "hash" as const };
  } catch {
    // ignore
  }

  // Fallback json/string
  try {
    const obj = await kv.get<any>(key);
    if (obj) return { project: obj, type: "json" as const };
  } catch {
    // ignore
  }

  return null;
}

export async function POST(
  _req: Request,
  ctx: { params: { projectId: string } }
) {
  try {
    const projectId = ctx.params.projectId;

    const found = await readProjectAny(projectId);
    if (!found) {
      return json({ ok: false, error: "Project not found" }, 404);
    }

    const latestKey = `generated:project:${projectId}:latest`;
    const html = await kv.get<string>(latestKey);

    const hasHtml = typeof html === "string" && html.trim().length > 0;
    if (!hasHtml) {
      return json(
        {
          ok: false,
          error:
            "No generated HTML found yet. Click Generate first, then Publish.",
        },
        400
      );
    }

    // Mark project as published
    const projectKey = `project:${projectId}`;

    if (found.type === "hash") {
      await kv.hset(projectKey, { published: true } as any);
    } else {
      const updated = { ...found.project, published: true };
      await kv.set(projectKey, updated);
    }

    const publicUrl = `/p/${projectId}`;

    return json({
      ok: true,
      projectId,
      publishedStatus: "published",
      hasHtml: true,
      publicUrl,
      htmlKey: latestKey,
    });
  } catch (err: any) {
    console.error("POST /publish error:", err);
    return json(
      { ok: false, error: err?.message || "Publish failed" },
      500
    );
  }
}
