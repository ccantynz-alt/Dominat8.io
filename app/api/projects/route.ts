import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const name = body.name || "Untitled Project";

  const project = {
    id: `proj_${nanoid(10)}`,
    name,
    userId,
    createdAt: Date.now(),
  };

  await kv.hset(`project:${project.id}`, project);
  await kv.lpush(`projects:user:${userId}`, project.id);

  return NextResponse.json({ ok: true, project });
}

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ids = await kv.lrange<string[]>(`projects:user:${userId}`, 0, -1);

  const projects = await Promise.all(
    ids.map(async (id) => kv.hgetall(`project:${id}`))
  );

  return NextResponse.json({ ok: true, projects });
}
