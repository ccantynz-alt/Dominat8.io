import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";

import { kvJsonGet, kvJsonSet, kvNowISO } from "@/app/lib/kv";
import { getCurrentUserId } from "@/app/lib/demoAuth";

export const runtime = "nodejs";

function uid(prefix = "") {
  const id = randomUUID().replace(/-/g, "");
  return prefix ? `${prefix}_${id}` : id;
}

function projectsIndexKey(userId: string) {
  return `projects:index:${userId}`;
}

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

const CreateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
});

export async function GET() {
  const userId = getCurrentUserId();
  const ids = (await kvJsonGet<string[]>(projectsIndexKey(userId))) || [];

  const projects: any[] = [];
  for (const id of ids) {
    const p = await kvJsonGet<any>(projectKey(userId, id));
    if (p) projects.push(p);
  }

  return NextResponse.json({ ok: true, projects });
}

export async function POST(req: Request) {
  const userId = getCurrentUserId();

  let body: any = {};
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    body = await req.json().catch(() => ({}));
  } else {
    const form = await req.formData().catch(() => null);
    if (form) body = Object.fromEntries(form.entries());
  }

  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const projectId = uid("proj");
  const now = kvNowISO();

  const project = {
    id: projectId,
    name: parsed.data.name,
    createdAt: now,
    updatedAt: now,
  };

  const ids = (await kvJsonGet<string[]>(projectsIndexKey(userId))) || [];
  await kvJsonSet(projectsIndexKey(userId), [projectId, ...ids]);
  await kvJsonSet(projectKey(userId, projectId), project);

  return NextResponse.json({ ok: true, project });
}

