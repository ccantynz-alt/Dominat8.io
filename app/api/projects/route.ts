// api/projects/route.ts
import { NextResponse } from "next/server";
import { kv, kvJsonGet, kvJsonSet, kvNowISO } from "@/lib/kv";
import { getCurrentUserId } from "@/lib/demoAuth";
import { z } from "zod";
import { randomUUID } from "crypto";

// Local UID helper (avoids "@/lib/id" resolution issues)
function uid(prefix = ""): string {
  const id = randomUUID().replace(/-/g, "");
  return prefix ? `${prefix}_${id}` : id;
}

// KV key helpers (avoids "@/lib/keys" shape mismatch)
function indexKey(userId: string) {
  return `projects:index:${userId}`;
}

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

const CreateProjectInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;

type Project = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

type ProjectsIndex = {
  ids: string[];
};

export async function GET() {
  const userId = getCurrentUserId();
  const idx = (await kvJsonGet<ProjectsIndex>(indexKey(userId))) ?? { ids: [] };

  const projects: Project[] = [];
  for (const id of idx.ids) {
    const p = await kvJsonGet<Project>(projectKey(userId, id));
    if (p) projects.push(p);
  }

  return NextResponse.json({ ok: true, projects });
}

export async function POST(req: Request) {
  const userId = getCurrentUserId();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreateProjectInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input: CreateProjectInput = parsed.data;

  const now = kvNowISO();
  const id = uid("proj");

  const project: Project = {
    id,
    userId,
    name: input.name,
    description: input.description,
    createdAt: now,
    updatedAt: now,
  };

  // Save project
  await kvJsonSet(projectKey(userId, id), project);

  // Update index
  const idx = (await kvJsonGet<ProjectsIndex>(indexKey(userId))) ?? { ids: [] };
  if (!idx.ids.includes(id)) idx.ids.unshift(id);
  await kvJsonSet(indexKey(userId), idx);

  return NextResponse.json({ ok: true, project }, { status: 201 });
}

export async function DELETE(req: Request) {
  const userId = getCurrentUserId();

  const url = new URL(req.url);
  const projectId = url.searchParams.get("id");
  if (!projectId) {
    return NextResponse.json({ ok: false, error: "Missing ?id=PROJECT_ID" }, { status: 400 });
  }

  // Delete project
  await kv.del(projectKey(userId, projectId));

  // Update index
  const idx = (await kvJsonGet<ProjectsIndex>(indexKey(userId))) ?? { ids: [] };
  idx.ids = idx.ids.filter((id) => id !== projectId);
  await kvJsonSet(indexKey(userId), idx);

  return NextResponse.json({ ok: true });
}
