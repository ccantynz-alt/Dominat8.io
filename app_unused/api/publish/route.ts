import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { setProjectPublishedKv } from "@/lib/projectsKv";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const projectId = String(body?.projectId || "");
  const html = String(body?.html || "");

  if (!projectId) {
    return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
  }
  if (!html || html.length < 20) {
    return NextResponse.json({ ok: false, error: "Missing html" }, { status: 400 });
  }

  const key = `published:${projectId}`;
  await kv.set(key, html);

  const url = `/p/${projectId}`;
  await setProjectPublishedKv(projectId, url);

  return NextResponse.json({ ok: true, url });
}
