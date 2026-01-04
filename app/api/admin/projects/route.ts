import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";
import { isAdminUserId } from "@/lib/admin";

type Project = {
  id: string;
  name: string;
  userId: string;
  createdAt: number;
};

export async function GET() {
  const { userId } = auth();

  if (!isAdminUserId(userId)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const ids = await kv.lrange<string[]>(`projects:all`, 0, -1);

  // Remove duplicates (safe if older data inserted twice)
  const uniqueIds = Array.from(new Set(ids));

  const projects = await Promise.all(
    uniqueIds.map(async (id) => {
      const p = await kv.hgetall<Project>(`project:${id}`);
      return p || null;
    })
  );

  // newest first (createdAt desc) if available
  const clean = projects
    .filter(Boolean)
    .sort((a, b) => (b!.createdAt || 0) - (a!.createdAt || 0));

  return NextResponse.json({ ok: true, projects: clean });
}
