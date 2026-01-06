import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

async function readProject(projectId: string) {
  const key = `project:${projectId}`;

  // 1) Try HASH style first (hgetall)
  try {
    const hash = await kv.hgetall<any>(key);
    if (hash && Object.keys(hash).length > 0) return hash;
  } catch (e: any) {
    // If WRONGTYPE, fall through to kv.get below
  }

  // 2) Fallback to JSON/string style (get)
  try {
    const obj = await kv.get<any>(key);
    if (obj) return obj;
  } catch {
    // ignore
  }

  return null;
}

export async function GET(
  _req: Request,
  ctx: { params: { projectId: string } }
) {
  try {
    const projectId = ctx.params.projectId;

    const project = await readProject(projectId);
    if (!project) {
      return json({ ok: false, error: "Project not found" }, 404);
    }

    const published = project.published === true;

    // HTML check (public page reads from this key)
    const htmlKey = `generated:project:${projectId}:latest`;
    const html = await kv.get<string>(htmlKey);
    const hasHtml = typeof html === "string" && html.trim().length > 0;

    return json({
      ok: true,
      projectId,
      publishedStatus: published ? "published" : "unpublished",
      hasHtml,
      domain: project.domain ?? null,
      domainStatus: project.domainStatus ?? null,
    });
  } catch (err) {
    console.error("GET /status error:", err);
    return json({ ok: false, error: "Status failed" }, 500);
  }
}
