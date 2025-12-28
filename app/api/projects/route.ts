// app/api/projects/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { kvJsonGet, kvJsonSet, kvNowISO } from "../../lib/kv";
import { getCurrentUserId } from "../../lib/demoAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CreateProjectSchema = z.object({
  name: z.string().min(1),
});

function uid(prefix: string) {
  const rnd = Math.random().toString(16).slice(2);
  const ts = Date.now().toString(16);
  return prefix + "_" + ts + rnd;
}

function userIdOrDemo() {
  return (typeof getCurrentUserId === "function" && getCurrentUserId()) || "demo";
}

function indexKey(userId: string) {
  return "projects:index:" + userId;
}

function projectKey(userId: string, projectId: string) {
  return "projects:" + userId + ":" + projectId;
}

export async function GET() {
  try {
    const userId = userIdOrDemo();
    const index = (await kvJsonGet<any[]>(indexKey(userId))) || [];
    return NextResponse.json({ ok: true, projects: index });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = CreateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid body", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const userId = userIdOrDemo();
    const now = kvNowISO();
    const projectId = uid("proj");

    const project = {
      projectId,
      name: parsed.data.name,
      createdAt: now,
      updatedAt: now,
      filesCount: 0,
      lastRunId: "",
    };

    const idxKey = indexKey(userId);
    const current = (await kvJsonGet<any[]>(idxKey)) || [];

    current.unshift({
      projectId: project.projectId,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      filesCount: project.filesCount,
      lastRunId: project.lastRunId,
    });

    await kvJsonSet(projectKey(userId, projectId), project);
    await kvJsonSet(idxKey, current);

    return NextResponse.json({ ok: true, project });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
