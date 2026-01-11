import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

// ----------------------------
// KV keys
// ----------------------------
function projectKey(projectId: string) {
  return `project:${projectId}`;
}

function projectsIndexKey(clerkUserId: string) {
  return `projects:index:${clerkUserId}`;
}

function projectCountKey(clerkUserId: string) {
  return `projects:count:${clerkUserId}`;
}

// ----------------------------
// Helpers
// ----------------------------
function newProjectId() {
  // Node 18+ supports crypto.randomUUID()
  return `proj_${crypto.randomUUID().replace(/-/g, "")}`;
}

async function incrementProjectCount(clerkUserId: string) {
  await kv.incr(projectCountKey(clerkUserId));
}

// ----------------------------
// GET /api/projects
// Returns a list of user's projects
// ----------------------------
export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthenticated" }, { status: 401 });
  }

  const ids = (await kv.lrange(projectsIndexKey(userId), 0, -1)) as string[];
  const projects: Array<{ id: string; name?: string; createdAt?: string }> = [];

  for (const id of ids) {
    const data = (await kv.hgetall(projectKey(id))) as any;
    if (data && data.id) {
      projects.push({
        id: data.id,
        name: data.name,
        createdAt: data.createdAt,
      });
    }
  }

  return NextResponse.json({ ok: true, projects });
}

// ----------------------------
// POST /api/projects
// Creates a project for the signed-in user
// Body: { name?: string }
// ----------------------------
export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthenticated" }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const projectId = newProjectId();
  const now = new Date().toISOString();

  const project = {
    id: projectId,
    clerkUserId: userId,
    name: typeof body?.name === "string" && body.name.trim() ? body.name.trim() : "Untitled Project",
    createdAt: now,
    updatedAt: now,
    status: "draft",
  };

  // Save project
  await kv.hset(projectKey(projectId), project as any);

  // Index project for listing
  await kv.lpush(projectsIndexKey(userId), projectId);

  // Count projects (optional, but useful)
  await incrementProjectCount(userId);

  return NextResponse.json({ ok: true, project });
}
