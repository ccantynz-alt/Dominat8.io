import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

// Force Node + no caching (so results always update)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const indexKey = "projects:index";

  // 1) Read the index set
  const ids = (await kv.smembers(indexKey)) as string[];

  // 2) Build keys and fetch raw values
  const keys = (ids || []).map((id) => `project:${id}`);

  let values: Array<string | null> = [];
  if (keys.length) {
    const raw = await kv.mget(...keys);
    values = raw as Array<string | null>;
  }

  // 3) Try to parse values to objects
  const parsed = values
    .map((v) => {
      if (!v) return null;
      try {
        return JSON.parse(v);
      } catch {
        return { parseError: true, raw: v };
      }
    })
    .filter(Boolean);

  return NextResponse.json(
    {
      ok: true,
      indexKey,
      ids,
      keys,
      values,
      parsed,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
