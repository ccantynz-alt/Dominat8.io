import { NextResponse } from "next/server";
import { kvGetJson, requireAdmin } from "@/lib/aleKv";

export const dynamic = "force-dynamic";

type PatchIndexItem = {
  patchId: string;
  name: string;
  buildStamp: string;
  savedAt: string;
};

export async function GET(req: Request) {
  try {
    requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const projectId = String(searchParams.get("projectId") || "demo");
    const limitRaw = searchParams.get("limit");
    const limit = Math.max(1, Math.min(50, Number(limitRaw || 20) || 20));

    const keyIndex = `ale:project:${projectId}:patch:index`;
    const items = (await kvGetJson<PatchIndexItem[]>(keyIndex)) || [];

    return NextResponse.json({
      ok: true,
      projectId,
      key: keyIndex,
      count: Math.min(limit, items.length),
      items: items.slice(0, limit)
    }, { status: 200 });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ ok:false, error: e?.message || "Server error" }, { status });
  }
}