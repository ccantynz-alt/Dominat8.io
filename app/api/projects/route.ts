import { NextResponse } from "next/server";
import { createProjectKv } from "@/lib/projectsKv";

export const runtime = "nodejs";

function makeId() {
  return `proj_${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`;
}

export async function POST() {
  const projectId = makeId();
  await createProjectKv(projectId, "Untitled site");
  return NextResponse.json({ ok: true, projectId });
}
