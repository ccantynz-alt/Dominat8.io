import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const project = await kv.hgetall<any>(`project:${params.projectId}`);
  if (!project || project.userId !== userId) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    domain: project.domain || "",
    domainStatus: project.domainStatus || "none",
  });
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const project = await kv.hgetall<any>(`project:${params.projectId}`);
  if (!project || project.userId !== userId) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const domain = String(body.domain || "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  if (!domain || !domain.includes(".")) {
    return NextResponse.json(
      { ok: false, error: "Invalid domain" },
      { status: 400 }
    );
  }

  await kv.hset(`project:${params.projectId}`, {
    domain,
    domainStatus: "pending",
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    domain,
    domainStatus: "pending",
  });
}
