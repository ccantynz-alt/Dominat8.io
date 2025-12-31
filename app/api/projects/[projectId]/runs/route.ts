// app/api/projects/[projectId]/runs/route.ts
import { NextResponse } from "next/server";
import { listRunsForProject, getRun } from "@/app/lib/runs";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const ids = await listRunsForProject(params.projectId, 50);
  const runs = await Promise.all(ids.map((id) => getRun(id)));
  return NextResponse.json({ ok: true, runs: runs.filter(Boolean) });
}
