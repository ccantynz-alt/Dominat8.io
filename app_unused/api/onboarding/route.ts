import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

type Project = {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

function nowIso() {
  return new Date().toISOString();
}

function projectKey(projectId: string) {
  return `project:${projectId}`;
}

function userProjectsKey(userId: string) {
  return `projects:user:${userId}`;
}

function userOnboardedKey(userId: string) {
  return `onboarded:user:${userId}`;
}

export async function POST() {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Prevent duplicate onboarding
  const already = await kv.get<boolean>(userOnboardedKey(userId));
  if (already) {
    return NextResponse.json({ ok: true, already: true });
  }

  const projectId = `proj_${crypto.randomUUID().replace(/-/g, "")}`;
  const now = nowIso();

  const project: Project = {
    id: projectId,
    ownerId: userId,
    name: "My First Website",
    createdAt: now,
    updatedAt: now,
  };

  await kv.set(projectKey(projectId), project);
  await kv.lpush(userProjectsKey(userId), projectId);
  await kv.set(userOnboardedKey(userId), true);

  return NextResponse.json({
    ok: true,
    created: true,
    projectId,
  });
}
