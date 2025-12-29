// app/api/projects/route.ts
import { NextResponse } from "next/server";
import { kv, kvJsonGet, kvJsonSet, kvNowISO } from "@/app/lib/kv";
import { getCurrentUserId } from "@/app/lib/demoAuth";
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
  name: z.string().min(1),
});

export async function GET() {
  const userId = await getCurrentUserId();

  // ✅ Use SET instead of ZSET (avoids zrange arg mismatch)
  const ids = (await kv.smembers(indexKey(userId)).catch(() => [])) as string[];

  const projects = [];
  for (const id of ids) {
    const p = await kvJsonGet(projectKey(userId, id));
    if (p) projects.push(p);
  }

  // Optional sort newest first
  projects.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  return NextResponse.json({ ok: true, projects });
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  const body = await req.json().catch(() => ({}));
  const parsed = CreateProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const projectId = uid("proj");
  const project = {
    id: projectId,
    name: parsed.data.name,
    createdAt: kvNowISO(),
  };

  await kvJsonSet(projectKey(userId, projectId), project);

  // ✅ SET index
  await kv.sadd(indexKey(userId), projectId);

  return NextResponse.json({ ok: true, project });
}
