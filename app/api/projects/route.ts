import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

type Project = {
  id: string;
  name: string;
  createdAt: string;

  // Optional fields (we keep them if provided)
  templateId?: string;
  templateName?: string;
  seedPrompt?: string;
};

function makeId() {
  // Node 18+ supports this (Vercel does)
  return crypto.randomUUID();
}

function safeString(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

async function getProjectsList(): Promise<Project[]> {
  // Try a few possible keys in case earlier versions used different names
  const candidates = ["projects", "projects:list"];
  for (const key of candidates) {
    const val = await kv.get(key);
    if (Array.isArray(val)) return val as Project[];
  }
  return [];
}

async function setProjectsList(projects: Project[]) {
  // Write to both keys for compatibility
  await kv.set("projects", projects);
  await kv.set("projects:list", projects);
}

export async function GET() {
  try {
    const projects = await getProjectsList();
    return NextResponse.json({ ok: true, source: "kv", projects });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to load projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Accept either id or name — but we will auto-generate if missing
    const incomingId = safeString(body?.id);
    const incomingName = safeString(body?.name);

    const id = incomingId || makeId();
    const name = incomingName || "Untitled Project";

    const project: Project = {
      id,
      name,
      createdAt: new Date().toISOString(),
      templateId: safeString(body?.templateId) || undefined,
      templateName: safeString(body?.templateName) || undefined,
      seedPrompt: safeString(body?.seedPrompt) || undefined,
    };

    // Store the project object
    await kv.set(`project:${id}`, project);

    // Update list
    const projects = await getProjectsList();
    const withoutDup = projects.filter((p) => p?.id !== id);
    const updated = [project, ...withoutDup];
    await setProjectsList(updated);

    return NextResponse.json({ ok: true, source: "kv", project });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to create project" },
      { status: 500 }
    );
  }
}
