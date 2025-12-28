// app/api/projects/[projectId]/apply/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { kvJsonGet, kvJsonSet, kvNowISO } from "@/app/lib/kv";
import { getCurrentUserId } from "@/app/lib/demoAuth";

const QuerySchema = z.object({
  runId: z.string().min(1),
});

type GenFile = {
  path: string;
  content: string;
};

type RunRecord = {
  runId: string;
  userId: string;
  createdAt?: string;
  files: GenFile[];
};

type ProjectRecord = {
  projectId: string;
  userId: string;
  files: GenFile[];
  updatedAt: string;
};

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

function runKey(userId: string, runId: string) {
  return `runs:${userId}:${runId}`;
}

function normalizePath(path: string) {
  return path.replace(/^\/+/, "");
}

function mergeFilesByPath(
  existing: GenFile[],
  incoming: GenFile[]
): GenFile[] {
  const map = new Map<string, GenFile>();

  for (const file of existing) {
    const p = normalizePath(file.path);
    map.set(p, { path: p, content: file.content });
  }

  for (const file of incoming) {
    const p = normalizePath(file.path);
    map.set(p, { path: p, content: file.content });
  }

  return Array.from(map.values()).sort((a, b) =>
    a.path.localeCompare(b.path)
  );
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await ctx.params;
  const userId = getCurrentUserId();

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    runId: url.searchParams.get("runId"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Missing or invalid runId" },
      { status: 400 }
    );
  }

  const { runId } = parsed.data;

  const run = await kvJsonGet<RunRecord>(runKey(userId, runId));
  if (!run || !Array.isArray(run.files)) {
    return NextResponse.json(
      { ok: false, error: "Run not found" },
      { status: 404 }
    );
  }

  const projectKeyName = projectKey(userId, projectId);
  const existingProject =
    await kvJsonGet<ProjectRecord>(projectKeyName);

  const existingFiles = existingProject?.files ?? [];
  const incomingFiles = run.files ?? [];

  const mergedFiles = mergeFilesByPath(
    existingFiles,
    incomingFiles
  );

  const updatedProject: ProjectRecord = {
    projectId,
    userId,
    files: mergedFiles,
    updatedAt: kvNowISO(),
  };

  await kvJsonSet(projectKeyName, updatedProject);

  return NextResponse.json({
    ok: true,
    version: "apply-v12-merge-by-path",
    projectId,
    runId,
    counts: {
      before: existingFiles.length,
      incoming: incomingFiles.length,
      after: mergedFiles.length,
    },
  });
}
