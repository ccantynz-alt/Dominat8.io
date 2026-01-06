import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

async function safeReadIndexIds(): Promise<string[]> {
  try {
    const ids = await kv.lrange<string>("projects:index", 0, 200);
    return Array.isArray(ids) ? ids.filter(Boolean) : [];
  } catch {
    return [];
  }
}

async function readProjectAny(projectId: string) {
  const key = `project:${projectId}`;

  // Prefer hash format
  try {
    const hash = await kv.hgetall<any>(key);
    if (hash && Object.keys(hash).length > 0) return hash;
  } catch {
    // ignore
  }

  // Fallback older json format
  try {
    const obj = await kv.get<any>(key);
    if (obj) return obj;
  } catch {
    // ignore
  }

  return null;
}

export async function GET() {
  try {
    const ids = await safeReadIndexIds();

    if (ids.length === 0) {
      // If no index exists, return empty (safe)
      return json({ ok: true, projects: [] });
    }

    const projects = await Promise.all(
      ids.map(async (id) => {
        const project = await readProjectAny(id);
        if (!project) return null;

        return {
          id: project.id ?? id,
          name: project.name ?? "Untitled",
          createdAt: project.createdAt ?? null,
          published: project.published === true,
          domain: project.domain ?? null,
          domainStatus: project.domainStatus ?? null,
        };
      })
    );

    return json({ ok: true, projects: projects.filter(Boolean) });
  } catch (err) {
    console.error("GET /api/projects error:", err);
    return json({ ok: false, error: "Failed to load projects" }, 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const name =
      typeof body?.name === "string" && body.name.trim()
        ? body.name.trim()
        : "New project";

    const id = makeId("proj");

    const project = {
      id,
      name,
      createdAt: new Date().toISOString(),
      published: false,
      domain: null,
      domainStatus: null,
    };

    const key = `project:${id}`;

    // IMPORTANT: store as HASH so hgetall works everywhere
    await kv.hset(key, project as any);

    // index (newest first)
    try {
      await kv.lpush("projects:index", id);
    } catch {
      // ignore
    }

    return json({ ok: true, project });
  } catch (err) {
    console.error("POST /api/projects error:", err);
    return json({ ok: false, error: "Failed to create project" }, 500);
  }
}
