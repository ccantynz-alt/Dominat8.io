// app/api/projects/[projectId]/publish/route.ts
import { NextResponse } from "next/server";
import { kvJsonGet } from "@/app/lib/kv";
import { getCurrentUserId } from "@/app/lib/demoAuth";

type GenFile = { path: string; content: string };

type ProjectRecord = {
  projectId: string;
  userId: string;
  files: GenFile[];
  updatedAt: string;
};

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

function normalizePath(p: string) {
  return p.replace(/^\/+/, "");
}

async function gh<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text}`);
  }

  return (await res.json()) as T;
}

async function doPublish(projectId: string) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !owner || !repo) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Missing GitHub env vars. Required: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO (optional: GITHUB_BRANCH).",
      },
      { status: 500 }
    );
  }

  const userId = getCurrentUserId();
  const project = await kvJsonGet<ProjectRecord>(projectKey(userId, projectId));

  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found in KV" }, { status: 404 });
  }

  const files = (project.files ?? []).map((f) => ({
    path: normalizePath(f.path),
    content: f.content,
  }));

  if (files.length === 0) {
    return NextResponse.json({ ok: false, error: "Project has no files to publish" }, { status: 400 });
  }

  // 1) Get latest commit on branch
  const ref = await gh<{ object: { sha: string } }>(
    `/repos/${owner}/${repo}/git/ref/heads/${branch}`,
    token
  );
  const latestCommitSha = ref.object.sha;

  // 2) Get tree SHA of latest commit
  const latestCommit = await gh<{ tree: { sha: string } }>(
    `/repos/${owner}/${repo}/git/commits/${latestCommitSha}`,
    token
  );
  const baseTreeSha = latestCommit.tree.sha;

  // 3) Create blobs
  const blobShas: Record<string, string> = {};
  for (const f of files) {
    const blob = await gh<{ sha: string }>(`/repos/${owner}/${repo}/git/blobs`, token, {
      method: "POST",
      body: JSON.stringify({ content: f.content, encoding: "utf-8" }),
    });
    blobShas[f.path] = blob.sha;
  }

  // 4) Create a new tree
  const tree = await gh<{ sha: string }>(`/repos/${owner}/${repo}/git/trees`, token, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: files.map((f) => ({
        path: f.path,
        mode: "100644",
        type: "blob",
        sha: blobShas[f.path],
      })),
    }),
  });

  // 5) Create commit
  const message = `Publish generated site (${projectId})`;
  const newCommit = await gh<{ sha: string }>(`/repos/${owner}/${repo}/git/commits`, token, {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: tree.sha,
      parents: [latestCommitSha],
    }),
  });

  // 6) Update branch ref
  await gh(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, token, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommit.sha, force: false }),
  });

  const commitUrl = `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`;

  return NextResponse.json({
    ok: true,
    version: "publish-v2-github-get+post",
    projectId,
    branch,
    filesPublished: files.length,
    commitSha: newCommit.sha,
    commitUrl,
  });
}

// ✅ Browser-friendly: allow GET (click to publish)
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await ctx.params;
  try {
    return await doPublish(projectId);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "Publish failed", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

// ✅ Also allow POST (API-friendly)
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await ctx.params;
  try {
    return await doPublish(projectId);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "Publish failed", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
