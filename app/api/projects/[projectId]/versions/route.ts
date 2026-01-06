import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(
  _req: Request,
  ctx: { params: { projectId: string } }
) {
  try {
    const { projectId } = ctx.params;

    const listKey = `generated:project:${projectId}:versions`;
    const items = await kv.lrange<string>(listKey, 0, 50);

    const versions = (items || []).map((raw) => {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }).filter(Boolean);

    return json({ ok: true, versions });
  } catch (err) {
    console.error("GET versions error:", err);
    return json({ ok: false, error: "Failed to load versions" }, 500);
  }
}
