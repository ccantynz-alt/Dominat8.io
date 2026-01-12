import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";
import AdmZip from "adm-zip";

export const runtime = "nodejs";

type Project = {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

function nowIso() {
  return new Date().toISOString();
}

function projectKey(projectId: string) {
  return `project:${projectId}`;
}

function userProjectsKey(userId: string) {
  return `projects:user:${userId}`;
}

function generatedProjectLatestKey(projectId: string) {
  return `generated:project:${projectId}:latest`;
}

function pickHtmlEntry(entries: { entryName: string }[]) {
  const lower = entries.map((e) => e.entryName.toLowerCase());

  // 1) Prefer index.html (any folder)
  const idx = lower.findIndex((n) => n.endsWith("/index.html") || n === "index.html");
  if (idx >= 0) return entries[idx].entryName;

  // 2) Otherwise, first .html file
  const firstHtml = lower.findIndex((n) => n.endsWith(".html"));
  if (firstHtml >= 0) return entries[firstHtml].entryName;

  return null;
}

async function ensureProjectExists(projectId: string, userId: string) {
  const existing = await kv.get<Project>(projectKey(projectId));

  if (!existing) {
    const createdAt = nowIso();
    const project: Project = {
      id: projectId,
      ownerId: userId,
      name: "Imported Project",
      createdAt,
      updatedAt: createdAt,
    };

    await kv.set(projectKey(projectId), project);
    await kv.lpush(userProjectsKey(userId), projectId);

    return project;
  }

  if (existing.ownerId !== userId) {
    return null; // forbidden
  }

  return existing;
}

export async function POST(
  req: Request,
  ctx: { params: { projectId: string } }
) {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = ctx.params.projectId;

  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
  }

  const project = await ensureProjectExists(projectId, userId);
  if (!project) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Expected multipart/form-data" },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: 'Missing file field "file"' },
      { status: 400 }
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());

  let zip: AdmZip;
  try {
    zip = new AdmZip(buf);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid ZIP file" }, { status: 400 });
  }

  const entries = zip.getEntries();
  const chosenPath = pickHtmlEntry(entries);

  if (!chosenPath) {
    return NextResponse.json(
      { ok: false, error: "No .html file found in ZIP (expected index.html)" },
      { status: 400 }
    );
  }

  const html = zip.readAsText(chosenPath);

  await kv.set(generatedProjectLatestKey(projectId), html);
  await kv.set("generated:latest", html);

  const updatedAt = nowIso();
  await kv.set(projectKey(projectId), { ...project, updatedAt });

  return NextResponse.json(
    { ok: true, projectId, imported: chosenPath },
    { status: 200 }
  );
}

