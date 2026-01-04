import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  // ✅ FIX: auth() must be awaited in your current Clerk typings/build
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.projectId;

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
    return NextResponse.json(
      { ok: false, error: "Missing domain" },
      { status: 400 }
    );
  }

  // Stub-friendly storage:
  // Store the requested domain on the project.
  // Later we can add real DNS verification + Vercel Domains API integration.
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
