import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

function safeJsonParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  ctx: { params: { projectId: string } }
) {
  try {
    const { projectId } = ctx.params;

    const listKey = `generated:project:${projectId}:versions`;

    // 1) Primary: versions stored as a LIST (LPUSH/LRANGE)
    let rawList: any[] = [];
    try {
      const items = await kv.lrange<any>(listKey, 0, 50);
      rawList = Array.isArray(items) ? items : [];
    } catch (e: any) {
      // If the key is not a list (WRONGTYPE) or list ops blocked, we'll fall back below
      rawList = [];
    }

    let versions: any[] = [];

    if (rawList.length > 0) {
      // Items might already be objects OR might be JSON strings
      versions = rawList
        .map((x) => {
          if (!x) return null;
          if (typeof x === "string") return safeJsonParse(x);
          if (typeof x === "object") return x;
          return null;
        })
        .filter(Boolean);
    }

    // 2) Fallback: versions stored as JSON (kv.set key -> array)
    // If list is empty OR parsing produced nothing, try GET
    if (versions.length === 0) {
      try {
        const maybe = await kv.get<any>(listKey);
        if (Array.isArray(maybe)) {
          versions = maybe.filter(Boolean);
        }
      } catch {
        // ignore
      }
    }

    // Extra debug so we can see what's in KV without guessing
    const debug = {
      listKey,
      rawListCount: rawList.length,
      parsedCount: versions.length,
      rawListSample: rawList.slice(0, 3),
    };

    return json({ ok: true, versions, debug });
  } catch (err) {
    console.error("GET versions error:", err);
    return json({ ok: false, error: "Failed to load versions" }, 500);
  }
}
