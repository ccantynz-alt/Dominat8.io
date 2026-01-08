import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

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

  // Persist publish data in KV so it works across serverless instances
  const key = `published:${projectId}`;
  await kv.set(key, html);

  // optional: keep an index pointer
  await kv.set(`published:latest:${projectId}`, Date.now());

  return NextResponse.json({ ok: true, url: `/p/${projectId}` });
}
