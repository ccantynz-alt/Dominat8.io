// app/api/projects/list/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Get project IDs for this user
  const ids =
    (await kv.smembers<string>(`projects:ids:${userId}`)) ?? [];

  if (ids.length === 0) {
    return NextResponse.json({
      ok: true,
      projects: [],
    });
  }

  // Load all projects
  const projects = await Promise.all(
    ids.map(async (id) => kv.get(`project:${id}`))
  );

  // Filter nulls and sort newest first
  const clean = projects
    .filter(Boolean)
    .sort((a: any, b: any) => b.createdAt - a.createdAt);

  return NextResponse.json({
    ok: true,
    projects: clean,
  });
}
