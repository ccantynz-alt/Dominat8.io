// app/api/projects/route.ts
import { NextResponse } from "next/server";
import { kvJsonGet, kvJsonSet, kvNowISO, kv } from "../../lib/kv";
import { getCurrentUserId } from "../../lib/demoAuth";
import { z } from "zod";
import { randomUUID } from "crypto";

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

const CreateProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type Project = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

type ProjectsIndex = { ids: string[] };

async function readBody(req: Request): Promise<unknown> {
  const contentType = req.headers.get("content-type") || "";

  // JSON (fetch)
  if (contentType.includes("application/json")) {
    return await req.json().catch(() => null);
  }

  // Form submit (<form method="post">)
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    if (!form) return null;

    const name = (form.get("name") ?? "").toString();
    const descriptionRaw = form.get("description");
    const description = descriptionRaw === null ? undefined : descriptionRaw.toString();

    return { name, description };
  }

  // Fallback: try JSON anyway
  return await req.json().catch(() => null);
}

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

  const body = await readBody(req);
  const parsed = CreateProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const now = await kvNowISO();
  const id = uid("proj");

  const project: Project = {
    id,
    userId,
    name: parsed.data.name,
    description: parsed.data.description,
    createdAt: now,
    updatedAt: now,
  };

  await kvJsonSet(projectKey(userId, id), project);

  const idx = (await kvJsonGet<ProjectsIndex>(indexKey(userId))) ?? { ids: [] };
  if (!idx.ids.includes(id)) idx.ids.unshift(id);
  await kvJsonSet(indexKey(userId), idx);

  // If it was a form submit, redirect back to dashboard so user sees the new project.
  const contentType = req.headers.get("content-type") || "";
  const isForm =
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data");

  if (isForm) {
    return NextResponse.redirect(new URL("/dashboard", req.url), { status: 303 });
  }

  return NextResponse.json({ ok: true, project }, { status: 201 });
}

export async function DELETE(req: Request) {
  const userId = getCurrentUserId();
  const url = new URL(req.url);
  const projectId = url.searchParams.get("id");

  if (!projectId) {
    return NextResponse.json({ ok: false, error: "Missing ?id=" }, { status: 400 });
  }

  await kv.del(projectKey(userId, projectId));

  const idx = (await kvJsonGet<ProjectsIndex>(indexKey(userId))) ?? { ids: [] };
  idx.ids = idx.ids.filter((x) => x !== projectId);
  await kvJsonSet(indexKey(userId), idx);

  return NextResponse.json({ ok: true });
}
