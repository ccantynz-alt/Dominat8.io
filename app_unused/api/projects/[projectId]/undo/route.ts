import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

type Project = {
  id: string;
  ownerId: string;
};

type HistoryItem = {
  ts: string;
  label: string;
  html: string;
};

function projectKey(projectId: string) {
  return `project:${projectId}`;
}

function generatedProjectLatestKey(projectId: string) {
  return `generated:project:${projectId}:latest`;
}

function historyKey(projectId: string) {
  return `history:project:${projectId}`;
}

export async function POST(_req: Request, ctx: { params: { projectId: string } }) {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = ctx.params.projectId;
  if (!projectId) {
    return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
  }

  const project = await kv.get<Project>(projectKey(projectId));
  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const item = await kv.lpop<HistoryItem>(historyKey(projectId));
  if (!item?.html) {
    return NextResponse.json({ ok: false, error: "Nothing to undo yet" }, { status: 400 });
  }

  await kv.set(generatedProjectLatestKey(projectId), item.html);

  return NextResponse.json({
    ok: true,
    undone: item.label || "Undo",
    ts: item.ts || null,
  });
}

