import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

type Run = {
  id: string;
  projectId: string;
  status: "queued" | "running" | "completed" | "failed";
  prompt: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
};

function makeRunId() {
  return `run_${crypto.randomUUID().replace(/-/g, "")}`;
}

function safeString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

async function getProject(projectId: string) {
  const project = await kv.get(`project:${projectId}`);
  return project;
}

async function getProjectRuns(projectId: string): Promise<Run[]> {
  const val = await kv.get(`project:${projectId}:runs`);
  if (Array.isArray(val)) return val as Run[];
  return [];
}

async function setProjectRuns(projectId: string, runs: Run[]) {
  await kv.set(`project:${projectId}:runs`, runs);
}

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;
    const runs = await getProjectRuns(projectId);
    return NextResponse.json({ ok: true, runs });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to load runs" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;

    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json(
        { ok: false, error: "Project not found" },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const prompt =
      safeString(body?.prompt) ||
      "Build a modern landing page. Clean minimal styling.";

    const run: Run = {
      id: makeRunId(),
      projectId,
      status: "queued",
      prompt,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`run:${run.id}`, run);

    const runs = await getProjectRuns(projectId);
    const updated = [run, ...runs];
    await setProjectRuns(projectId, updated);

    // ✅ Track latest run pointer (global)
    await kv.set("runs:latest", run.id);

    return NextResponse.json({ ok: true, run });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to create run" },
      { status: 500 }
    );
  }
}
