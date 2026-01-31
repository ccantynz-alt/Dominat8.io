import { NextResponse } from "next/server";
import { kvSetJson, kvGetJson, requireAdmin } from "@/lib/aleKv";

export const dynamic = "force-dynamic";

function ts() {
  const d = new Date();
  const p = (n:number)=>String(n).padStart(2,"0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth()+1)}${p(d.getUTCDate())}_${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
}

type PatchIndexItem = {
  patchId: string;
  name: string;
  buildStamp: string;
  savedAt: string;
};

export async function POST(req: Request) {
  try {
    requireAdmin(req);

    const body: any = await req.json();
    const projectId = String(body?.projectId || "demo");
    const patch = body?.patch;

    if (!patch?.name || !patch?.script) {
      return NextResponse.json({ ok:false, error:"Missing patch.name or patch.script" }, { status:400 });
    }

    const patchId = String(patch?.buildStamp || patch?.id || `patch_${ts()}`);
    const buildStamp = String(patch?.buildStamp || patchId);

    const record = {
      kind: "ale-kv-patch-v1",
      projectId,
      patchId,
      savedAt: new Date().toISOString(),
      patch: {
        name: patch.name,
        buildStamp,
        script: patch.script
      },
      manifest: body?.manifest ?? null,
      meta: body?.meta ?? null
    };

    const kLatest = `ale:project:${projectId}:patch:latest`;
    const kById  = `ale:project:${projectId}:patch:${patchId}`;

    // Save patch record
    await kvSetJson(kById, record);
    await kvSetJson(kLatest, record);

    // Maintain patch index (most recent first)
    const kIndex = `ale:project:${projectId}:patch:index`;
    const existing = (await kvGetJson<PatchIndexItem[]>(kIndex)) || [];

    const item: PatchIndexItem = {
      patchId,
      name: String(patch.name),
      buildStamp,
      savedAt: record.savedAt
    };

    // Dedupe by patchId, unshift newest, cap length
    const next = ([item, ...((Array.isArray(existing) ? existing : [])).filter(x => x?.patchId !== patchId)]).slice(0, 50);
    await kvSetJson(kIndex, next);

    return NextResponse.json({
      ok:true,
      projectId,
      patchId,
      keyLatest:kLatest,
      keyById:kById,
      keyIndex:kIndex,
      indexCount: next.length
    }, { status:200 });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ ok:false, error: e?.message || "Server error" }, { status });
  }
}


