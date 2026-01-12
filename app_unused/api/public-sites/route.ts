// app/api/public-sites/route.ts
import { NextResponse } from "next/server";
import { storeGet } from "../../lib/store";

const publicIndexKey = "public:projects:index";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || "50");
  const max = Math.max(1, Math.min(200, isFinite(limit) ? limit : 50));

  const v = await storeGet(publicIndexKey);
  const ids = Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];

  return NextResponse.json({ ok: true, projects: ids.slice(0, max) });
}
