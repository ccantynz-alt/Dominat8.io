// app/api/projects/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";

import { kvJsonGet, kvJsonSet, kvNowISO, kv } from "../../lib/kv";
import { getCurrentUserId } from "../../lib/demoAuth";

type ProjectRecord = {
  id: string;
  projectId: string; // must always be present and equal to id
  name: string;
  createdAt: string;
};

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(120).optional(),
});

function uid(prefix = ""): string {
  const id = randomUUID().replace(/-/g, "");
  return prefix ? `${prefix}_${id}` : id;
}

function indexKey(userId: string) {
  return `projects:index:${userId}`;
}

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

function normalizeProject(p: any): ProjectRecord {
  const id = String(p?.projectId || p?.id || "");
  const createdAt = String(p?.createdAt || kvNowISO());
  const name = String(p?.name || "Untitled Project");

  return {
    id,
    projectId: id,
    name,
    createdAt,
  };
}

async function listProjects(userId: string): Promise<ProjectRecord[]> {
  const idx = indexKey(userId);

  // KV supports zrange. We store members as projectId strings.
  // We want newest first, so we zadd with timestamp score and then reverse.
  const ids = (await kv.zrange(idx, 0, -1)) as unknown as string[];

  if (!ids || ids.length === 0) return [];

  const projects = await Promise.all(
    ids.map(async (projectId) => {
      const raw = await kvJsonGet(projectKey(userId, projectId));
      if (!raw) return null;
      return normalizeProject(raw);
    })
  );

  // zrange returns oldest -> newest depending on implementation;
  // to be safe, sort by createdAt descending after normalization.
  return projects
    .filter(Boolean)
    .sort((a, b) => (a!.createdAt < b!.createdAt ? 1 : -1)) as ProjectRecord[];
}

export async function GET() {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const projects = await listProjects(userId);

    return NextResponse.json({
      ok: true,
      projects,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Failed to load projects",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const parsed = CreateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid request body",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const projectId = uid("proj");
    const createdAt = kvNowISO();
    const name = parsed.data.name?.trim() || "Untitled Project";

    const project: ProjectRecord = {
      id: projectId,
      projectId,
      name,
      createdAt,
    };

    // Store the project
    await kvJsonSet(projectKey(userId, projectId), project);

    // Index it (timestamp score for sorting)
    // KV supports zadd only (no scan/keys/del etc)
    const score = Date.now();
    await kv.zadd(indexKey(userId), { score, member: projectId });

    return NextResponse.json({
      ok: true,
      project,
      id: projectId,
      projectId,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Failed to create project",
      },
      { status: 500 }
    );
  }
}
