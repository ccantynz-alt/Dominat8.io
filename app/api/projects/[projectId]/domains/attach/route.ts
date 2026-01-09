import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { requirePro, toJsonError } from "@/app/lib/limits";

type Project = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
};

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Pro only
  try {
    await requirePro(userId);
  } catch (err) {
    const { status, body } = toJsonError(err);
    return NextResponse.json(body, { status });
  }

  const projectId = (params?.projectId || "").toString().trim();

  // ✅ Block placeholder / missing IDs
  if (!projectId || projectId.includes("REPLACE_WITH")) {
    return NextResponse.json(
      { ok: false, error: "Invalid projectId" },
      { status: 400 }
    );
  }

  // ✅ Validate project exists and is owned by this user
  const project = (await kv.get(`project:${projectId}`)) as Project | null;

  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  // Expecting JSON like: { "domain": "example.com" }
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const domain =
    typeof body?.domain === "string" ? body.domain.trim().toLowerCase() : "";

  if (!domain) {
    return NextResponse.json({ ok: false, error: "Missing domain" }, { status: 400 });
  }

  const key = `project:${projectId}:domain`;

  try {
    await kv.set(key, { domain, attachedBy: userId, attachedAt: Date.now() });
    return NextResponse.json({ ok: true, projectId, domain });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to attach domain" },
      { status: 500 }
    );
  }
}
