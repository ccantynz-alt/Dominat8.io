// app/api/projects/from-template/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

type CreateFromTemplateBody = {
  templateId: string;
  name?: string;
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: CreateFromTemplateBody | null = null;
  try {
    body = (await req.json()) as CreateFromTemplateBody;
  } catch {
    body = null;
  }

  const templateId = body?.templateId?.trim();
  if (!templateId) {
    return NextResponse.json({ ok: false, error: "MISSING_TEMPLATE_ID" }, { status: 400 });
  }

  const projectId = `proj_${crypto.randomUUID().replaceAll("-", "")}`;
  const now = new Date().toISOString();

  const project = {
    id: projectId,
    userId,
    name: (body?.name?.trim() || "New Project").slice(0, 80),
    templateId,
    createdAt: now,
    updatedAt: now,
  };

  // Store project
  await kv.hset(`project:${projectId}`, project);

  // Index by user (list of project ids)
  await kv.lpush(`user:${userId}:projects`, projectId);

  return NextResponse.json({ ok: true, project });
}
